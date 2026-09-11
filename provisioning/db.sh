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

banner "[1/5] Atualizando sistema..."
echo "[INFO] Atualizando a lista de pacotes..."
apt-get update
echo "[INFO] Aplicando atualizações do sistema..."
apt-get upgrade -y

banner "[2/5] Instalando PostgreSQL..."
apt-get install -y \
    postgresql \
    postgresql-contrib

banner "[3/5] Ativando PostgreSQL..."

systemctl enable postgresql
systemctl start postgresql

banner "[4/5] Configurando acesso remoto e usuário..."

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

echo "[INFO] Configurando permissões do schema public para o Prisma/backend..."
sudo -u postgres psql -d tododb -c "GRANT ALL ON SCHEMA public TO todouser;"
sudo -u postgres psql -d tododb -c "ALTER SCHEMA public OWNER TO todouser;"

banner "[5/5] Verificando PostgreSQL e preparando diretório..."
sudo -u postgres psql --version

echo "[INFO] Preparando diretório e permissões da aplicação..."
mkdir -p /opt/db
chown -R vagrant:vagrant /opt/db

banner "DATABASE CONFIGURADO COM SUCESSO"
echo "Host: 10.0.1.30"
echo "Porta: 5432"
echo "Usuário: todouser"
echo "Senha: todo123"
echo "Banco: tododb"
