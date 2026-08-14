# KAMBAM - Controle de tarefas

Kanban + calendário para controle de tarefas e pipeline de produção, com banco de dados **Firebase (Firestore)**.

## Funcionalidades

- Quadro Kanban com etapas: Ideias → Produção → Revisão → Concluídos
- Visão em calendário (mensal/semanal) com arrastar e soltar
- Cadastro de responsáveis, checklists de tarefas e formatos de conteúdo
- Filtros por busca, formato, responsável, prioridade, tag e atrasados
- Exportar/importar JSON (n8n / automações)
- Sincronização em tempo real com Firestore
- Fallback para localStorage quando o Firebase não está configurado

## Rodar localmente

**Pré-requisitos:** Node.js

1. Instalar dependências:
   ```
   npm install
   ```
2. Configurar o Firebase em `.env.local` (copie de `.env.example`):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. Rodar o app:
   ```
   npm run dev
   ```

## Scripts

| Comando           | Descrição                          |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (Vite) |
| `npm run lint`    | Verificação de tipos (tsc)         |
| `npm run build`   | Build de produção em `dist/`       |

## Deploy no Firebase Hosting

Ao enviar para o branch `main`, o GitHub Actions roda o workflow `.github/workflows/deploy.yml` e publica automaticamente.

**Pré-requisito:** adicionar no GitHub (Settings → Secrets and variables → Actions) o secret:

- `FIREBASE_SERVICE_ACCOUNT_KAMBAM_57C9E` — o JSON da conta de serviço do Firebase com permissão de hosting.

Para gerar a conta de serviço:
1. Console do Firebase → Projeto → Configurações do projeto → Contas de serviço
2. Gerar nova chave privada (JSON)
3. Colar o conteúdo no secret acima

Para fazer o deploy manual:
```
npm run build
npx firebase-tools deploy --only hosting --project kambam-57c9e
```

## Estrutura

- `src/` — código-fonte (React + TypeScript + Tailwind)
- `src/firebase.ts` — configuração e serviço do Firestore
- `.env.example` — variáveis de ambiente documentadas
- `firebase.json` — configuração do Firebase Hosting
