# cloud-task-manager
Aplicação To-Do List em arquitetura distribuída de 3 camadas (Next.js, Express, PostgreSQL) implantada em 3 VMs separadas (Ubuntu Server / Nginx).

O backend executa diretamente em `/opt/backend`, compartilhado com `backend/`
no computador. As alterações no código aparecem imediatamente na VM, sem cópia.

Durante `vagrant up`, o provisionamento monta `/var/lib/backend-node_modules`
(disco da VM) em `/opt/backend/node_modules` e executa `npm ci` como `vagrant`.
A pasta `backend/node_modules` pode aparecer vazia no computador; os pacotes
instalados pela VM ficam no disco dela. Outros arquivos do projeto continuam
compartilhados, incluindo o lockfile, arquivos gerados e um eventual `.env`.

Para aplicar em uma VM já criada:

```sh
vagrant provision backend
```

A preparação fica toda em `provisioning/backend.sh`, executado também nos próximos
`vagrant up`, incluindo as etapas de atualização do sistema e instalação do Node.js.
É necessário acesso à internet para baixar dependências. O backend usa Node.js
22 para atender às exigências de dependências presentes no lockfile.

Para trabalhar dentro da VM:

```sh
vagrant ssh backend
cd /opt/backend
```

O servidor ainda não inicia automaticamente: o `package.json` referencia
`src/server.ts`, que ainda precisa ser implementado. Configure a conexão com o
PostgreSQL em `10.0.1.30` quando implementar a aplicação.

Se você usou a configuração anterior, o provisionamento desativa `backend-sync`.
A cópia antiga em `/opt/backend-app` é preservada, mas deixa de ser usada;
um eventual `.env` nessa cópia precisa ser transferido manualmente.

O frontend também executa diretamente na pasta compartilhada `/opt/frontend`.
O script `provisioning/frontend.sh` instala Node.js 22, monta `node_modules` e
`.next` a partir de `/var/lib/frontend` no disco da VM, executa `npm ci` e
`npm run build` e reinicia o serviço `nextjs`. Isso acontece em cada `vagrant up`.
A cópia antiga `/opt/frontend-app` deixa de ser usada e é preservada.

Para aplicar em uma VM existente e verificar o serviço:

```sh
vagrant provision frontend
vagrant ssh frontend -c "systemctl status nextjs --no-pager"
```

Acesse `http://localhost:8080`. O serviço executa o build de produção: após editar
o frontend, gere o build novamente e reinicie o serviço dentro da VM:

```sh
cd /opt/frontend
sudo systemctl stop nextjs
npm run build
sudo systemctl restart nextjs
```

Para desenvolver com `npm run dev`, pare o serviço `nextjs` antes para liberar
a porta 3000. Arquivos fora de `node_modules` e `.next` continuam compartilhados.
