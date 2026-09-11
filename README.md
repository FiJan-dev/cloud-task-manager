# cloud-task-manager
Aplicação To-Do List em arquitetura distribuída de 3 camadas (Next.js, Express, PostgreSQL) implantada em 3 VMs separadas (Ubuntu Server / Nginx).

Execute `vagrant up` para subir as VMs na ordem banco → backend → frontend
com o VirtualBox. O backend cria `backend/.env` a partir de `.env.example`
se o arquivo ainda não existir, gera o cliente Prisma e aplica o schema antes
de iniciar a API. Um `.env` existente é preservado; para o banco padrão deste
projeto, a conexão deve ser:

```dotenv
DATABASE_URL="postgresql://todouser:todo123@10.0.1.30:5432/tododb?schema=public"
```

Se uma instalação anterior subiu mas apresenta “Erro interno no servidor”,
confira o `.env` e reaplique o provisionamento com o banco disponível:

```sh
vagrant up db
vagrant provision db
vagrant up backend --provision
vagrant up frontend --provision
```

O provisionamento agora para se o schema não puder ser aplicado, sem aceitar
automaticamente alterações que percam dados. Para consultar a causa de erros da API:

```sh
vagrant ssh backend -c "sudo journalctl -u todo-backend -n 100 --no-pager"
```

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

O serviço `todo-backend` inicia automaticamente com `tsx src/server.ts` e atende
na porta 3000. O provisionamento verifica a resposta de `/health` após iniciá-lo.

Se você usou a cópia antiga em `/opt/backend-app`, transfira manualmente um
eventual `.env` dessa cópia para `/opt/backend`.

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
