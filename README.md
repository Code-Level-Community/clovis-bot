# 🤖 Clóvis Bot

Clóvis é o bot oficial da comunidade **CodeLevel**. Ele gerencia os canais de voz do servidor Discord, criando canais temporários com nomes de animais típicos do Nordeste brasileiro.

Quando um usuário entra no canal gatilho, o Clóvis cria automaticamente um canal de voz temporário com o nome de um animal nordestino, envia um link da Wikipedia sobre o bicho no chat do canal, e deleta o canal assim que ele ficar vazio.

## Funcionalidades

- Criação automática de canais de voz temporários ao entrar no canal gatilho (`➕ Criar canal de voz`)
- Nomes dos canais sorteados de uma lista de animais do Nordeste
- Envio automático de link da Wikipedia sobre o animal no chat do canal
- Deleção automática do canal quando ficar vazio
- Recuperação de canais temporários ao reiniciar o bot
- Comando `/limite` para o dono do canal definir o número máximo de usuários
- Comando `/restringir` para limitar o canal a cargos específicos (admin/mod)
- Comando `/liberar` para remover restrições de cargos do canal (admin/mod)

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/)
- Uma aplicação criada no [Discord Developer Portal](https://discord.com/developers/applications)

## Rodando localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Code-Level-Community/clovis-bot.git
cd clovis-bot
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=id_do_seu_aplicativo
NODE_ENV=development
```

- `DISCORD_TOKEN` → Token do bot, disponível em **Discord Developer Portal → Bot → Token**
- `CLIENT_ID` → ID do aplicativo, disponível em **Discord Developer Portal → Informações gerais → ID do aplicativo**
- `NODE_ENV` → Defina como `development` para logs coloridos e legíveis no terminal; em produção, os logs são emitidos em JSON

### 4. Configure o canal gatilho no servidor

Crie uma categoria no seu servidor Discord e dentro dela um canal de voz com o nome exato:

```
➕ Criar canal de voz
```

### 5. Rode o bot

```bash
npm run dev
```

Se tudo estiver certo, você verá no terminal:

```
[10:42:01.123] INFO (clovis): Clóvis online
[10:42:01.145] INFO (clovis): Slash commands registrados
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Roda o bot em modo desenvolvimento com `tsx` (watch mode) |
| `npm run build` | Compila o TypeScript para JavaScript na pasta `dist/` |
| `npm start` | Roda o bot compilado (produção) |

## Estrutura do projeto

```
clovis-bot/
├── src/
│   ├── commands/
│   │   ├── limite.ts           # Comando /limite
│   │   ├── restringir.ts       # Comando /restringir
│   │   └── liberar.ts          # Comando /liberar
│   ├── events/
│   │   ├── clientReady.ts      # Inicialização e recuperação de canais
│   │   └── voiceStateUpdate.ts # Ciclo de vida dos canais temporários
│   ├── services/
│   │   └── restricaoService.ts # Lógica de restrição por cargo
│   ├── utils/
│   │   ├── canaisTemporarios.ts # Map de canais ativos
│   │   └── logger.ts           # Logger centralizado (pino)
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   └── index.ts                # Entry point
├── animais.json                # Lista de animais do Nordeste
├── .env                        # Variáveis de ambiente (não commitar)
├── tsconfig.json
└── package.json
```

## Adicionando novos animais

Edite o arquivo `animais.json` na raiz do projeto seguindo o formato:

```json
{
  "nome": "🦔 Tatupeba",
  "wiki": "https://pt.wikipedia.org/wiki/Tatupeba"
}
```