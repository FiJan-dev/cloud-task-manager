#!/bin/bash

set -e

# Separadores simples também ficam legíveis nos logs do Vagrant.
banner() {
    echo
    echo "============================================================"
    echo "  $1"
    echo "============================================================"
    echo
}

trap 'echo; echo "[ERRO] Provisionamento interrompido na linha $LINENO. Confira a saída acima." >&2' ERR

banner "CONFIGURANDO VM3 - DATABASE"

banner "[1/6] Atualizando sistema..."
echo "[INFO] Atualizando a lista de pacotes..."
apt-get update
echo "[INFO] Aplicando atualizações do sistema..."
apt-get upgrade -y

banner "[2/6] Instalando PostgreSQL..."
apt-get install -y \
    postgresql \
    postgresql-contrib \
    ufw

banner "[3/6] Ativando PostgreSQL..."

systemctl enable postgresql
systemctl start postgresql

banner "[4/6] Configurando acesso remoto e usuário..."

echo "[INFO] Configurando conexões PostgreSQL na rede interna..."
# Permitir conexões da rede interna
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Adicionar regra no pg_hba.conf
echo "host    all             all             10.0.1.0/24            md5" >> /etc/postgresql/*/main/pg_hba.conf

echo "[INFO] Reiniciando o PostgreSQL para aplicar as configurações..."
systemctl restart postgresql

echo "[INFO] Criando usuário, banco e permissões..."
# Criar usuário e banco
sudo -u postgres psql -c "CREATE USER todouser WITH PASSWORD 'todo123';" || true
sudo -u postgres psql -c "CREATE DATABASE tododb OWNER todouser;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;" || true

banner "[5/6] Configurando firewall..."

echo "[INFO] Aplicando políticas e regras de acesso do UFW..."
ufw default deny incoming
ufw default deny outgoing

ufw allow out on enp0s8

ufw allow from 10.0.1.20 to any port 5432 proto tcp

ufw allow in on enp0s3 to any port 22 proto tcp

echo "[INFO] Ativando o firewall..."
ufw --force enable

banner "[6/6] Verificando PostgreSQL e preparando diretório..."
sudo -u postgres psql --version
echo "[INFO] Exibindo o estado e as regras do firewall..."
ufw status verbose

echo "[INFO] Preparando diretório e permissões da aplicação..."
mkdir -p /opt/db
chown -R vagrant:vagrant /opt/db

banner "DATABASE CONFIGURADO COM SUCESSO"
echo "Host: 10.0.1.30"
echo "Porta: 5432"
echo "Usuário: todouser"
echo "Senha: todo123"
echo "Banco: tododb"
