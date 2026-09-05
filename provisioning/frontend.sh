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

banner "CONFIGURANDO VM1 - FRONTEND"

banner "[1/7] Atualizando sistema..."
echo "[INFO] Atualizando a lista de pacotes..."
apt-get update
echo "[INFO] Aplicando atualizações do sistema..."
apt-get upgrade -y

banner "[2/7] Instalando ferramentas básicas..."

apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg

banner "[3/7] Instalando Nginx..."

apt-get install -y nginx

echo "[INFO] Habilitando e iniciando o Nginx..."
systemctl enable nginx
systemctl start nginx

banner "[4/7] Instalando Node.js..."

# Remove node antigo se existir
echo "[INFO] Removendo versões anteriores de Node.js e npm, se existirem..."
apt-get remove -y nodejs npm 2>/dev/null || true

echo "[INFO] Configurando o repositório do Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

banner "[5/7] Verificando instalações..."

echo "Node:"
node --version

echo "NPM:"
npm --version

echo "nginx:"
nginx -v

banner "[6/7] Preparando diretório da aplicação..."

echo "[INFO] Preparando diretório e permissões da aplicação..."
mkdir -p /opt/frontend
chown -R vagrant:vagrant /opt/frontend

banner "[7/7] Configurando proxy reverso do Nginx..."

# Configuração básica do Nginx (proxy reverso)
cat > /etc/nginx/sites-available/todo << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (Next.js ou static)
    location / {
        root /opt/frontend;
        try_files $uri $uri/ /index.html;
        # Se usar Next.js em modo standalone ou proxy:
        # proxy_pass http://localhost:3000;
    }

    # Proxy para a API (Application Server)
    location /api/ {
        proxy_pass http://10.0.1.20:3001/;   # ajuste a porta do Express
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "[INFO] Ativando o site e removendo a configuração padrão..."
ln -sf /etc/nginx/sites-available/todo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
echo "[INFO] Validando a configuração e recarregando o Nginx..."
nginx -t && systemctl reload nginx

banner "FRONTEND CONFIGURADO COM SUCESSO"
echo "  Diretório: /opt/frontend"
echo "  Acesso:    http://localhost:8080"
echo "  API:       http://10.0.1.20:3001"
echo
