# DockManager - Sistema de Gerenciamento de Docas e Pedidos

DockManager é um sistema SaaS fullstack para gerenciamento de pedidos e docas de carga e descarga de caminhões. O sistema permite a criação, edição e acompanhamento de pedidos, além de gerenciar a alocação de caminhões em docas, considerando tempo de carga e descarga baseado no volume de cada pedido.

## Tecnologias

### Frontend
- React com Next.js
- Tailwind CSS
- Zustand para gerenciamento de estado

### Backend
- Node.js com Express
- TypeScript
- PostgreSQL com Prisma ORM
- JWT + Bcrypt para autenticação
- Socket.io para comunicação em tempo real
- Redis + BullMQ para processamento assíncrono

## Funcionalidades Principais

### Autenticação e Controle de Acesso
- Login e logout via JWT
- Diferentes níveis de acesso: Admin, Operador, Cliente
- Proteção de rotas para usuários autenticados

### Gestão de Empresas e Usuários
- CRUD de empresas e usuários
- Permissão diferenciada para usuários
- Definição de limites de desconto por usuário e empresa

### Gestão de Produtos e Clientes
- Cadastro, edição e remoção de produtos
- Controle de estoque e preços dinâmicos
- Cadastro e histórico de clientes

### Gestão de Pedidos
- CRUD de pedidos com desconto por item
- Validação de limite de desconto por usuário
- Agendamento de pedidos vinculados a uma doca
- Status do pedido: pendente, em andamento, finalizado, cancelado
- Geração de PDFs de pedidos e envio via WhatsApp e e-mail

### Gestão de Docas (Visual Kanban)
- Painel visual interativo para docas (estilo Kanban)
- Movimentação de pedidos entre docas e dias
- Controle de tempo de ocupação da doca baseado no volume do pedido
- Definição de horários de expediente para cada doca
- Bloqueio de docas para manutenção
- Cadastro de feriados (dias sem movimentação)

### Clientes Fidelizados e Sistema de Cotas
- Clientes podem ser marcados como fidelizados
- Cada cliente fidelizado possui uma quantidade de cotas (múltiplos de 10 minutos)
- Sistema de reserva automática ou manual de horários baseado nas cotas

### Dashboard de Vendas e Relatórios
- Gráficos de faturamento por período
- Previsão de demanda baseada em IA
- Relatórios exportáveis em PDF e CSV

## Configuração do Projeto

### Pré-requisitos
- Node.js (v16+)
- PostgreSQL
- Redis

### Instalação e Execução
1. Clone o repositório
2. Instale as dependências do backend e frontend
3. Configure as variáveis de ambiente
4. Execute as migrações do banco de dados
5. Inicie o servidor de desenvolvimento

```bash
# Instalar dependências do backend
cd backend
npm install

# Configurar banco de dados
npx prisma migrate dev

# Iniciar servidor backend
npm run dev

# Em outro terminal, instalar dependências do frontend
cd ../frontend
npm install

# Iniciar servidor frontend
npm run dev
```

## Estrutura do Projeto
```
dockmanager/
├── backend/           # Servidor Node.js com Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/        # Esquema e migrações do Prisma
│   └── ...
├── frontend/          # Aplicação Next.js
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── ...
└── ...
```

## Licença
Este projeto está licenciado sob a licença MIT.