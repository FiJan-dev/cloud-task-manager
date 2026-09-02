#!/bin/bash

set -e

echo "================================="
echo "Configurando VM1 - FrontEnd"
echo "================================="

echo "[1/6] Atualizando sistema..."
apt-get update
apt-get upgrade -y

echo "======================================"
echo "[2/6] Instalando ferramentas básicas..."
echo "======================================"

apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg

echo "======================================"
echo "[3/6] Instalando Nginx..."
echo "======================================"

apt-get install -y nginx

systemctl enable nginx
systemctl start nginx

echo "======================================"
echo "[4/6] Instalando Node.js..."
echo "======================================"

# Remove node antigo se existir
apt-get remove -y nodejs npm 2>/dev/null || true

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "======================================"
echo "[5/6] Verificando instalações..."
echo "======================================"

echo "Node:"
node --version

echo "NPM:"
npm --version

echo "nginx:"
nginx -v

echo "======================================"
echo "  [6/6] Preparando diretorios..."
echo "======================================"

mkdir -p /opt/frontend
chown -R vagrant:vagrant /opt/frontend

#Config basica Nginx (proxy reverso)
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

ln -sf /etc/nginx/sites-available/todo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx


echo "======================================"
echo "   FRONTEND CONFIGURADO COM SUCESSO"
echo "======================================"