#!/bin/bash

set -e

echo "======================================"
echo "   CONFIGURANDO VM3 - DATABASE"
echo "======================================"

echo "[1/5] Atualizando sistema..."
apt-get update
apt-get upgrade -y

echo "[2/5] Instalando PostgreSQL..."
apt-get install -y \
    postgresql \
    postgresql-contrib

echo "[3/5] Ativando PostgreSQL..."

systemctl enable postgresql
systemctl start postgresql

echo "[4/5] Configurando acesso remoto e usuário..."

# Permitir conexões da rede interna
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Adicionar regra no pg_hba.conf
echo "host    all             all             10.0.1.0/24            md5" >> /etc/postgresql/*/main/pg_hba.conf

systemctl restart postgresql

# Criar usuário e banco
sudo -u postgres psql -c "CREATE USER todouser WITH PASSWORD 'todo123';" || true
sudo -u postgres psql -c "CREATE DATABASE tododb OWNER todouser;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;" || true

echo "[5/5] Verificando PostgreSQL..."
sudo -u postgres psql --version

mkdir -p /opt/db
chown -R vagrant:vagrant /opt/db

echo "======================================"
echo "   DATABASE CONFIGURADO COM SUCESSO"
echo "======================================"
echo "Host: 10.0.1.30"
echo "Porta: 5432"
echo "Usuário: todouser"
echo "Senha: todo123"
echo "Banco: tododb"