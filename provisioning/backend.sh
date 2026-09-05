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

banner "CONFIGURANDO VM2 - BACKEND"

banner "[1/6] Atualizando sistema..."
echo "[INFO] Atualizando a lista de pacotes..."
apt-get update
echo "[INFO] Aplicando atualizações do sistema..."
apt-get upgrade -y

banner "[2/6] Instalando ferramentas básicas..."
apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    ufw

banner "[3/6] Instalando Node.js..."
# Remove node antigo se existir
echo "[INFO] Removendo versões anteriores de Node.js e npm, se existirem..."
apt-get remove -y nodejs npm 2>/dev/null || true

echo "[INFO] Configurando o repositório do Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

banner "[4/6] Verificando Node.js..."

echo "Node:"
node --version

echo "NPM:"
npm --version

banner "[5/6] Configurando firewall..."

echo "[INFO] Aplicando políticas e regras de acesso do UFW..."
ufw default deny incoming
ufw default deny outgoing

ufw allow in on enp0s8
ufw allow out on enp0s8

ufw allow in on enp0s3 to any port 22 proto tcp

ufw allow from 10.0.1.10 to any port 8080 proto tcp

echo "[INFO] Ativando o firewall..."
ufw --force enable

banner "[6/6] Preparando diretório da aplicação..."

echo "[INFO] Preparando diretório e permissões da aplicação..."
mkdir -p /opt/backend
chown -R vagrant:vagrant /opt/backend

banner "BACKEND CONFIGURADO COM SUCESSO"
echo "  Diretório: /opt/backend"
echo "  Host:      10.0.1.20"
echo
echo "[PRÓXIMO PASSO] Lembre-se de configurar a DATABASE_URL apontando para 10.0.1.30"
