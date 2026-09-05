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

banner "[1/8] Atualizando sistema..."
echo "[INFO] Atualizando a lista de pacotes..."
apt-get update
echo "[INFO] Aplicando atualizações do sistema..."
apt-get upgrade -y

banner "[2/8] Instalando ferramentas básicas..."

apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg

banner "[3/8] Instalando Nginx..."

apt-get install -y nginx

echo "[INFO] Habilitando e iniciando o Nginx..."
systemctl enable nginx
systemctl start nginx

banner "[4/8] Instalando Node.js..."

# Remove node antigo se existir
echo "[INFO] Removendo versões anteriores de Node.js e npm, se existirem..."
apt-get remove -y nodejs npm 2>/dev/null || true

echo "[INFO] Configurando o repositório do Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

banner "[5/8] Verificando instalações..."

echo "Node:"
node --version

echo "NPM:"
npm --version

echo "nginx:"
nginx -v

banner "[6/8] Preparando diretório da aplicação..."

echo "[INFO] Preparando diretório e permissões da aplicação..."
mkdir -p /opt/frontend-app
chown -R vagrant:vagrant /opt/frontend-app

echo "[INFO] Copiando o frontend para o armazenamento local da VM..."
rm -rf /opt/frontend-app/*
cp -r /opt/frontend/. /opt/frontend-app/

chown -R vagrant:vagrant /opt/frontend-app

cd /opt/frontend-app

echo "[INFO] Instalando dependências do frontend..."
sudo -u vagrant npm install

echo "[INFO] Gerando build do Next.js..."
sudo -u vagrant npm run build

banner "[7/8] Configurando serviço do Next.js..."

# Cria o arquivo de configuração do serviço do Next.js
cat > /etc/systemd/system/nextjs.service << 'EOF'

# Indica que começa a seção de informações básicas do serviço.
[Unit]
# Descrição para identificar o serviço.
Description=Next.js Frontend
#Inicie o serviço depois que a rede do sistema estiver disponível
After=network.target

# Começa a seção que define como o Next.js será executado
[Service]
#Diz ao systemd que o serviço é um processo simples que ficará rodando
Type=simple
#O Next.js será executado pelo usuário
User=vagrant
#Define a pasta onde o comando será executado.
WorkingDirectory=/opt/frontend-app
#Quando o serviço iniciar, execute npm start
ExecStart=/usr/bin/npm start
#Se o processo do Next.js parar, o systemd tenta iniciá-lo novamente
Restart=always

#Essa seção define como o serviço será habilitado para iniciar automaticamente
[Install]
#Isso diz ao systemd que o serviço faz parte dos serviços que devem estar disponíveis quando o sistema chegar ao estado normal de operação.
WantedBy=multi-user.target
EOF

echo "[INFO] Habilitando o serviço do Next.js..."
systemctl daemon-reload
systemctl enable nextjs
systemctl start nextjs

echo "[INFO] Verificando o serviço do Next.js..."
systemctl is-active --quiet nextjs

banner "[8/8] Configurando proxy reverso do Nginx..."

# Configuração básica do Nginx (proxy reverso)
cat > /etc/nginx/sites-available/todo << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000; # encaminha as requisições para o Next.js
        proxy_http_version 1.1; # versão do HTTP usada na comunicação entre Nginx e Next.js
        proxy_set_header Host $host; # informa ao Next.js qual host foi acessado pelo cliente
        proxy_set_header X-Real-IP $remote_addr; # informa o IP do cliente
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # mantém os IPs pelos quais a requisição passou
        proxy_set_header X-Forwarded-Proto $scheme; # informa se o cliente usou HTTP ou HTTPS
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
