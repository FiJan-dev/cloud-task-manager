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
    gnupg

banner "[3/6] Instalando Node.js..."
# Remove node antigo se existir
echo "[INFO] Removendo versões anteriores de Node.js e npm, se existirem..."
apt-get remove -y nodejs npm 2>/dev/null || true

echo "[INFO] Configurando o repositório do Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

banner "[4/6] Verificando Node.js..."

echo "Node:"
node --version

echo "NPM:"
npm --version

banner "[5/6] Preparando diretório da aplicação..."

# Executado após o Vagrant montar as pastas compartilhadas, inclusive em novos boots.
mountpoint -q /opt/backend || {
    echo "[ERRO] /opt/backend não está montado; instalação cancelada." >&2
    exit 1
}

if [ -f /etc/systemd/system/todo-backend.service ]; then
    systemctl stop todo-backend
fi

mkdir -p /var/lib/backend-node_modules /opt/backend/node_modules
chown vagrant:vagrant /var/lib/backend-node_modules
if ! mountpoint -q /opt/backend/node_modules; then
    mount --bind /var/lib/backend-node_modules /opt/backend/node_modules
fi

echo "[INFO] Instalando dependências em /opt/backend, com node_modules no disco da VM..."
cd /opt/backend
if [ ! -f .env ]; then
    echo "[INFO] Criando .env com a conexão do banco Vagrant..."
    sudo -H -u vagrant cp .env.example .env
fi
sudo -H -u vagrant npm ci

echo "[INFO] Gerando cliente Prisma..."
sudo -H -u vagrant ./node_modules/.bin/prisma generate

echo "[INFO] Aplicando schema do Prisma no banco de dados..."
# Uma falha deve interromper o provisionamento: iniciar a API não cria tabelas.
sudo -H -u vagrant ./node_modules/.bin/prisma db push

banner "[6/6] Configurando o serviço do backend..."

echo "[INFO] Criando arquivo de serviço no Systemd..."
cat <<EOF > /etc/systemd/system/todo-backend.service
[Unit]
Description=To Do List Backend (Node.js)
After=network.target

[Service]
Type=simple
User=vagrant
WorkingDirectory=/opt/backend
ExecStart=/opt/backend/node_modules/.bin/tsx src/server.ts
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "[INFO] Recarregando systemd e iniciando o serviço..."
systemctl daemon-reload
systemctl enable todo-backend
systemctl restart todo-backend

echo "[INFO] Aguardando resposta do backend..."
for attempt in {1..30}; do
    if curl --fail --silent --max-time 2 http://127.0.0.1:3000/health; then
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        journalctl -u todo-backend -n 50 --no-pager
        exit 1
    fi
    sleep 2
done

echo "[INFO] Dependências instaladas. Diretório de trabalho: /opt/backend"
