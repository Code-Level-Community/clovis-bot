# === Estágio 1: Builder ===
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências e configurações de build
COPY package*.json tsconfig.json ./

# Instala TODAS as dependências (incluindo as de desenvolvimento para o TS)
RUN npm ci

# Copia o código fonte e arquivos necessários
COPY src/ ./src/
COPY animais.json ./

# Executa o build (gera a pasta dist)
RUN npm run build

# Remove as dependências de desenvolvimento direto no builder para limpar o terreno
RUN npm prune --production

# === Estágio 2: Runner ===
FROM node:20-alpine AS runner

WORKDIR /app

# Define o ambiente como produção
ENV NODE_ENV=production

# Em vez de rodar npm ci de novo, copia direto do builder:
# Copia apenas as dependências de produção que sobraram após o 'npm prune'
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY animais.json ./

# Muda o usuário para 'node' (segurança: evita rodar como root)
USER node

CMD ["node", "dist/index.js"]