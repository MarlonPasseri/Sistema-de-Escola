<div align="center">

# 🎓 EduPulse

### Plataforma Inteligente de Gestão e Acompanhamento Escolar

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.4.15-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

[![Prisma](https://img.shields.io/badge/Prisma-6.3.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.33.2-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turbo](https://img.shields.io/badge/Turborepo-2.3.3-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)

[![Versão](https://img.shields.io/badge/versão-0.1.0-brightgreen?style=flat-square)](./package.json)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Licença](https://img.shields.io/badge/licença-MIT-blue?style=flat-square)](./LICENSE)
[![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow?style=flat-square)]()

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tech Stack](#-tech-stack)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Executando o Projeto](#-executando-o-projeto)
- [API e Documentação](#-api-e-documentação)
- [Banco de Dados](#-banco-de-dados)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Motor de Risco Estudantil](#-motor-de-risco-estudantil-diferencial)
- [Segurança](#-segurança)
- [Contribuição](#-contribuição)

---

## 📖 Sobre o Projeto

O **EduPulse** é uma plataforma SaaS multi-tenant de gestão escolar inteligente, desenvolvida para instituições de ensino que desejam modernizar sua gestão acadêmica e promover o sucesso dos alunos de forma proativa.

O sistema combina funcionalidades essenciais de gestão escolar com um **motor de análise de risco acadêmico**, que identifica automaticamente alunos em risco e sugere planos de intervenção personalizados — antes que problemas se tornem críticos.

### 🎯 Proposta de Valor

| Aspecto | Descrição |
|---|---|
| **Multi-Tenancy** | Suporte a múltiplas escolas isoladas em uma única instância |
| **RBAC Completo** | 6 perfis de acesso com permissões granulares |
| **Motor de Risco** | Algoritmo preditivo de risco acadêmico |
| **Intervenção Proativa** | Planos de ação para alunos em risco |
| **Auditoria Total** | Log completo de todas as ações do sistema |
| **API Documentada** | Swagger/OpenAPI para integração facilitada |

---

## ✨ Funcionalidades

### 👤 Autenticação e Controle de Acesso
- [x] Autenticação via JWT com access e refresh tokens
- [x] Controle de acesso baseado em papéis (RBAC)
- [x] Perfis: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `COORDINATOR`, `TEACHER`, `STUDENT`, `GUARDIAN`
- [x] Sessões seguras com renovação automática de tokens
- [x] Hashing de senhas com Argon2

### 🏫 Gestão Escolar
- [x] Cadastro e gerenciamento de escolas (multi-tenant)
- [x] Gestão de anos e períodos letivos
- [x] Gerenciamento de turmas e disciplinas
- [x] Atribuição de professores às turmas
- [x] Matrículas de alunos

### 👩‍🎓 Gestão de Alunos
- [x] Cadastro completo com registro e foto
- [x] Perfil detalhado com histórico acadêmico
- [x] Vínculo com responsáveis/guardiões
- [x] Linha do tempo de eventos do aluno
- [x] Ocorrências e registros disciplinares

### 📊 Desempenho Acadêmico
- [x] Criação de avaliações com pesos configuráveis
- [x] Lançamento de notas com feedback individual
- [x] Estatísticas e relatórios de desempenho
- [x] Acompanhamento de progresso por período

### 📅 Frequência
- [x] Registro de sessões de presença por aula
- [x] Status: Presente, Ausente, Atrasado, Justificado
- [x] Cálculo automático de taxa de frequência
- [x] Histórico completo de presença

### 📢 Comunicação
- [x] Anúncios segmentados por público
- [x] Rastreamento de leitura de mensagens
- [x] Suporte a múltiplos perfis de destinatários

### 🚨 Motor de Sucesso Estudantil *(Diferencial)*
- [x] Pontuação de risco automática por aluno
- [x] Classificação: `BAIXO`, `MÉDIO`, `ALTO` risco
- [x] Análise multifatorial (notas, frequência, comportamento)
- [x] Geração de planos de intervenção
- [x] Rastreamento de status das intervenções
- [x] Dashboard analítico de risco

### 🔍 Auditoria e Compliance
- [x] Log completo de todas as ações
- [x] Rastreamento por usuário, ação e timestamp
- [x] Registro de IP e User Agent
- [x] Sistema pronto para compliance

---

## 🏗️ Arquitetura

O EduPulse segue uma arquitetura de **monorepo** com separação clara entre backend, frontend e pacotes compartilhados:

```
┌─────────────────────────────────────────────────────────┐
│                        EDUPULSE                          │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │  Next.js 15  │    │   NestJS 10  │    │  Shared   │  │
│  │  (Frontend)  │◄──►│   (API REST) │    │   Types   │  │
│  │  Port: 3000  │    │  Port: 3001  │    │ @edupulse │  │
│  └──────────────┘    └──────┬───────┘    └───────────┘  │
│                             │                            │
│              ┌──────────────┼──────────────┐            │
│              ▼              ▼              ▼            │
│       ┌─────────┐   ┌─────────────┐  ┌─────────┐      │
│       │Prisma   │   │  PostgreSQL │  │  Redis  │      │
│       │  ORM    │──►│  Port 5432  │  │Port 6379│      │
│       └─────────┘   └─────────────┘  └─────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Usuário → Next.js (SSR/CSR) → Axios Client → NestJS Controllers
       → Services → Prisma ORM → PostgreSQL
       → Redis Cache (sessões/tokens)
```

### Padrões Utilizados

| Padrão | Onde |
|---|---|
| **Repository Pattern** | Acesso ao banco via Prisma Services |
| **Module Pattern** | Encapsulamento de features no NestJS |
| **DTO Validation** | Validação de entrada com class-validator |
| **Guard Pattern** | Autenticação e autorização com Passport |
| **Multi-Tenancy** | Isolamento por `schoolId` em todas as queries |

---

## 🛠️ Tech Stack

### Backend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| [NestJS](https://nestjs.com/) | 10.4.15 | Framework backend |
| [TypeScript](https://www.typescriptlang.org/) | 5.7.3 | Tipagem estática |
| [Prisma](https://www.prisma.io/) | 6.3.1 | ORM e migrations |
| [PostgreSQL](https://www.postgresql.org/) | 16 | Banco de dados principal |
| [Redis](https://redis.io/) | 7 | Cache e sessões |
| [Passport.js](http://www.passportjs.org/) | — | Estratégias de autenticação |
| [JWT](https://jwt.io/) | — | Tokens de acesso |
| [Argon2](https://github.com/ranisalt/node-argon2) | — | Hash de senhas |
| [Swagger](https://swagger.io/) | — | Documentação da API |
| [class-validator](https://github.com/typestack/class-validator) | — | Validação de DTOs |

### Frontend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15.1.6 | Framework React com SSR |
| [React](https://react.dev/) | — | Biblioteca de UI |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | Estilização utilitária |
| [Radix UI](https://www.radix-ui.com/) | — | Componentes acessíveis |
| [TanStack Query](https://tanstack.com/query) | 5.65.1 | Gerenciamento de estado servidor |
| [React Hook Form](https://react-hook-form.com/) | 7.54.2 | Gerenciamento de formulários |
| [Zod](https://zod.dev/) | — | Validação de schemas |
| [Recharts](https://recharts.org/) | 2.15.0 | Gráficos e visualizações |
| [Framer Motion](https://www.framer.com/motion/) | 11.15.0 | Animações |
| [Axios](https://axios-http.com/) | 1.7.9 | Cliente HTTP |
| [Lucide React](https://lucide.dev/) | 0.469.0 | Biblioteca de ícones |

### DevOps & Tooling
| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Docker](https://www.docker.com/) | — | Containerização de serviços |
| [Turbo](https://turbo.build/) | 2.3.3 | Build system do monorepo |
| [pnpm](https://pnpm.io/) | 10.33.2 | Gerenciador de pacotes |
| [Prettier](https://prettier.io/) | 3.4.2 | Formatação de código |

---

## 📁 Estrutura do Projeto

```
Sistema-de-Escola/
├── 📦 apps/
│   ├── 🖥️ api/                         # Backend NestJS
│   │   ├── src/
│   │   │   ├── common/                 # Guards, decoradores globais
│   │   │   │   ├── decorators/         # @CurrentUser, @Roles, @SchoolId
│   │   │   │   └── guards/             # JwtAuthGuard, RolesGuard
│   │   │   ├── database/               # Configuração do Prisma
│   │   │   └── modules/                # Módulos de funcionalidade
│   │   │       ├── auth/               # Autenticação & JWT
│   │   │       ├── users/              # Gestão de usuários
│   │   │       ├── schools/            # Gestão de escolas (tenants)
│   │   │       ├── students/           # Perfis de alunos
│   │   │       ├── teachers/           # Perfis de professores
│   │   │       ├── classes/            # Gerenciamento de turmas
│   │   │       ├── subjects/           # Disciplinas
│   │   │       ├── enrollments/        # Matrículas
│   │   │       ├── attendance/         # Frequência
│   │   │       ├── assessments/        # Avaliações e notas
│   │   │       ├── communication/      # Comunicados
│   │   │       ├── occurrences/        # Ocorrências disciplinares
│   │   │       ├── interventions/      # Planos de intervenção
│   │   │       ├── student-success/    # Motor de risco acadêmico
│   │   │       └── audit/              # Log de auditoria
│   │   └── prisma/
│   │       ├── schema.prisma           # Modelo de dados (24 entidades)
│   │       ├── migrations/             # Histórico de migrações
│   │       └── seed.ts                 # Seed do banco de dados
│   │
│   └── 🌐 web/                         # Frontend Next.js
│       └── src/
│           ├── app/
│           │   ├── (app)/              # Rotas protegidas
│           │   │   ├── dashboard/
│           │   │   ├── students/
│           │   │   ├── teachers/
│           │   │   ├── classes/
│           │   │   ├── attendance/
│           │   │   ├── grades/
│           │   │   ├── interventions/
│           │   │   ├── student-success/
│           │   │   └── announcements/
│           │   └── (auth)/             # Rotas públicas
│           │       └── login/
│           ├── components/
│           │   ├── ui/                 # Componentes reutilizáveis
│           │   └── layout/             # Componentes de layout
│           ├── hooks/                  # Custom React hooks
│           └── lib/                    # Utilitários e cliente API
│
└── 📚 packages/
    └── types/                          # Tipos TypeScript compartilhados
        └── src/
            ├── enums.ts                # Enums compartilhados
            ├── api.ts                  # Tipos de resposta da API
            ├── auth.ts                 # Tipos de autenticação
            └── risk.ts                 # Tipos do motor de risco
```

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-F69220?style=flat-square&logo=pnpm)](https://pnpm.io/installation)
[![Docker](https://img.shields.io/badge/Docker-latest-2496ED?style=flat-square&logo=docker)](https://www.docker.com/get-started)
[![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat-square&logo=git)](https://git-scm.com/)

```bash
# Verifique as versões instaladas
node --version    # >= 20.0.0
pnpm --version    # >= 10.0.0
docker --version  # qualquer versão recente
git --version
```

---

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/MarlonPasseri/Sistema-de-Escola.git
cd Sistema-de-Escola
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

### 4. Suba os serviços de infraestrutura

```bash
# Inicia PostgreSQL e Redis via Docker
docker compose up -d
```

### 5. Execute as migrações do banco de dados

```bash
pnpm --filter api prisma:migrate
```

### 6. Popule o banco com dados iniciais

```bash
pnpm --filter api prisma:seed
```

---

## 🔑 Variáveis de Ambiente

### Backend (`apps/api/.env`)

```env
# Banco de Dados
DATABASE_URL=postgresql://edupulse:edupulse123@localhost:5432/edupulse

# JWT - Access Token
JWT_SECRET=sua-chave-secreta-jwt
JWT_EXPIRES_IN=15m

# JWT - Refresh Token
JWT_REFRESH_SECRET=sua-chave-secreta-refresh
JWT_REFRESH_EXPIRES_IN=7d

# Aplicação
PORT=3001
FRONTEND_URL=http://localhost:3000

# Cache
REDIS_URL=redis://localhost:6379
```

### Frontend (`apps/web/.env`)

```env
# URL da API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Serviços Docker (`docker-compose.yml`)

| Serviço | Porta | Usuário | Senha | Banco |
|---|---|---|---|---|
| PostgreSQL | `5432` | `edupulse` | `edupulse123` | `edupulse` |
| Redis | `6379` | — | — | — |

---

## ▶️ Executando o Projeto

### Desenvolvimento (todos os apps)

```bash
# Inicia API + Web simultaneamente via Turbo
pnpm dev
```

### Apps individualmente

```bash
# Apenas o backend (http://localhost:3001)
pnpm --filter api dev

# Apenas o frontend (http://localhost:3000)
pnpm --filter web dev
```

### Build de produção

```bash
# Build de todos os apps
pnpm build

# Build individual
pnpm --filter api build
pnpm --filter web build
```

### Outros comandos úteis

```bash
# Formatação de código
pnpm format

# Abrir Prisma Studio (visualizar banco)
pnpm --filter api prisma:studio

# Gerar cliente Prisma após alterações no schema
pnpm --filter api prisma:generate

# Criar nova migration
pnpm --filter api prisma:migrate
```

---

## 📡 API e Documentação

Após iniciar o backend, a documentação Swagger estará disponível em:

[![Swagger](https://img.shields.io/badge/Swagger_UI-http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fdocs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:3001/api/docs)

### Endpoints Principais

| Módulo | Endpoint Base | Descrição |
|---|---|---|
| Auth | `/api/v1/auth` | Login, refresh token, logout |
| Users | `/api/v1/users` | Gestão de usuários |
| Schools | `/api/v1/schools` | Gestão de escolas |
| Students | `/api/v1/students` | Cadastro e perfis de alunos |
| Teachers | `/api/v1/teachers` | Cadastro e perfis de professores |
| Classes | `/api/v1/classes` | Turmas e enturmação |
| Enrollments | `/api/v1/enrollments` | Matrículas |
| Attendance | `/api/v1/attendance` | Frequência |
| Assessments | `/api/v1/assessments` | Avaliações |
| Grades | `/api/v1/grades` | Notas |
| Announcements | `/api/v1/announcements` | Comunicados |
| Occurrences | `/api/v1/occurrences` | Ocorrências |
| Interventions | `/api/v1/interventions` | Planos de intervenção |
| Student Success | `/api/v1/student-success` | Motor de risco |

### Autenticação

Todos os endpoints protegidos requerem o header:

```http
Authorization: Bearer <access_token>
```

**Rate Limiting:** 100 requisições por 60 segundos por IP.

---

## 🗄️ Banco de Dados

O EduPulse utiliza **PostgreSQL 16** com **Prisma ORM**. O modelo de dados é composto por 24 entidades organizadas em domínios:

### Diagrama de Entidades (simplificado)

```
School ──┬── User
         ├── Student ──── Guardian
         ├── Teacher
         ├── Class ───────── Enrollment
         │         ├──────── AttendanceSession ── AttendanceRecord
         │         └──────── ClassSubject ──────── Assessment ── Grade
         ├── AcademicYear ── AcademicTerm
         ├── Announcement ── AnnouncementRecipient
         ├── Occurrence
         ├── RiskScore
         ├── InterventionPlan ── InterventionNote
         ├── StudentTimeline
         ├── Notification
         └── AuditLog
```

### Principais Modelos

| Modelo | Descrição |
|---|---|
| `School` | Tenant/escola — isola todos os dados |
| `User` | Conta de acesso com papel (role) |
| `Student` | Perfil completo do aluno |
| `Teacher` | Perfil do professor com especialidades |
| `Class` | Turma vinculada a ano/período letivo |
| `Enrollment` | Matrícula de aluno em turma |
| `Assessment` | Avaliação com peso e pontuação máxima |
| `Grade` | Nota do aluno com feedback |
| `AttendanceRecord` | Registro individual de frequência |
| `RiskScore` | Pontuação de risco do aluno |
| `InterventionPlan` | Plano de intervenção com status |
| `AuditLog` | Log imutável de auditoria |

---

## 🧩 Módulos do Sistema

### Módulo de Autenticação (`auth`)
Responsável pelo fluxo completo de autenticação: login com credenciais, geração de access/refresh tokens JWT, renovação de sessão e logout.

### Módulo de Escolas (`schools`)
Gerencia o cadastro de escolas no modelo multi-tenant. Cada escola é um tenant isolado — todos os dados são sempre escopados pelo `schoolId`.

### Módulo de Alunos (`students`)
CRUD completo de alunos com perfil detalhado, incluindo matrícula, foto, contato e vínculo com responsáveis. Expõe a linha do tempo de eventos do aluno.

### Módulo de Professores (`teachers`)
Cadastro de professores com especialidades, atribuição a turmas e visualização da carga horária.

### Módulo de Turmas (`classes`)
Criação e gestão de turmas vinculadas a anos/períodos letivos. Gerencia enturmação de alunos e atribuição de disciplinas.

### Módulo de Frequência (`attendance`)
Registro de sessões de aula com controle de presença individual. Calcula automaticamente a taxa de frequência por aluno.

### Módulo de Avaliações (`assessments`)
Criação de avaliações com peso e pontuação máxima. Lançamento e edição de notas com feedback individual por professor.

### Módulo de Comunicação (`communication`)
Sistema de anúncios com segmentação por público (turmas, perfis, alunos específicos). Rastreamento de leitura para confirmar alcance.

### Módulo de Ocorrências (`occurrences`)
Registro de incidentes disciplinares com classificação, status e histórico de resolução.

### Módulo de Intervenções (`interventions`)
Gerenciamento do ciclo de vida de planos de intervenção:
- `ABERTO` → `EM_ANDAMENTO` → `AGUARDANDO_RESPONSÁVEL` → `RESOLVIDO` / `CANCELADO`

---

## 🚨 Motor de Risco Estudantil *(Diferencial)*

O módulo `student-success` é o **diferencial competitivo** do EduPulse. Ele implementa um algoritmo de análise multifatorial que classifica automaticamente o nível de risco acadêmico de cada aluno.

### Como Funciona

```
┌─────────────────────────────────────────────┐
│           FATORES DE ANÁLISE                │
│                                             │
│  📊 Desempenho Acadêmico  (notas)          │
│  📅 Taxa de Frequência    (presença)        │
│  ⚠️  Ocorrências          (comportamento)   │
│  📈 Tendência de Evolução (histórico)       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  RISK ENGINE    │
         │  (Algoritmo)    │
         └────────┬────────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   🟢 BAIXO   🟡 MÉDIO   🔴 ALTO
```

### Perfis de Risco

| Nível | Cor | Ação Recomendada |
|---|---|---|
| `BAIXO` | 🟢 Verde | Monitoramento regular |
| `MÉDIO` | 🟡 Amarelo | Atenção e acompanhamento |
| `ALTO` | 🔴 Vermelho | Intervenção imediata |

### Intervenções Automáticas

Ao identificar um aluno em risco `ALTO`, o sistema pode:
1. Gerar automaticamente um plano de intervenção
2. Notificar coordenadores e professores
3. Acionar comunicação com responsáveis
4. Registrar evento na linha do tempo do aluno

---

## 🔐 Segurança

| Mecanismo | Implementação |
|---|---|
| **Autenticação** | JWT com access (15min) + refresh (7d) tokens |
| **Autorização** | RBAC com guards NestJS por rota |
| **Senhas** | Hashing Argon2 (resistente a GPU) |
| **Multi-Tenancy** | Isolamento por `schoolId` em todas as queries |
| **Rate Limiting** | 100 req/60s por IP via `@nestjs/throttler` |
| **CORS** | Configurado para aceitar apenas o frontend |
| **Validação** | DTOs com `class-validator` em todas as entradas |
| **Auditoria** | Log imutável de todas as ações críticas |

---

## 🗺️ Roadmap

- [x] **Fase 1** — Infraestrutura e fundação SaaS
- [x] **Fase 2** — Operação acadêmica (gestão, frequência, notas)
- [x] **Fase 3** — Diferencial competitivo (motor de risco e intervenções)
- [ ] **Fase 4** — Notificações push e e-mail
- [ ] **Fase 5** — App mobile (React Native)
- [ ] **Fase 6** — Relatórios avançados e exportação PDF
- [ ] **Fase 7** — Integração com plataformas externas

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, siga o processo abaixo:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Convenção de Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     atualização de documentação
style:    formatação de código
refactor: refatoração sem mudança funcional
test:     adição ou correção de testes
chore:    tarefas de manutenção
```

---

<div align="center">

Desenvolvido com ❤️ por [MarlonPasseri](https://github.com/MarlonPasseri)

[![GitHub](https://img.shields.io/badge/GitHub-MarlonPasseri-181717?style=for-the-badge&logo=github)](https://github.com/MarlonPasseri)

</div>
