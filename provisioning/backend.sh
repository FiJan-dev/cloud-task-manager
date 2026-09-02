#!/bin/bash

set -e

echo "======================================"
echo "   CONFIGURANDO VM2 - BACKEND"
echo "======================================"

echo "[1/5] Atualizando sistema..."
apt-get update
apt-get upgrade -y

echo "[2/5] Instalando ferramentas básicas..."
apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg

echo "[3/5] Instalando Node.js..."
# Remove node antigo se existir
apt-get remove -y nodejs npm 2>/dev/null || true

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "[4/5] Verificando Node.js..."

echo "Node:"
node --version

echo "NPM:"
npm --version

echo "[5/5] Preparando diretório da aplicação..."

mkdir -p /opt/backend
chown -R vagrant:vagrant /opt/backend

echo "======================================"
echo "   BACKEND CONFIGURADO COM SUCESSO"
echo "======================================"
echo "Lembre-se de configurar a DATABASE_URL apontando para 10.0.1.30"