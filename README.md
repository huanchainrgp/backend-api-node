## Backend API (Express, Postgres, JWT, Swagger)

### Prerequisites
- Node 22+
- Yarn

### Setup
1. Create `.env` in project root with:
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_GfUC7lYZ8teR@ep-patient-boat-adpmgbkf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=replace-with-a-long-random-secret
```

2. Install dependencies and generate Prisma client:
```
yarn
yarn prisma:generate
```

3. Run dev server with hot reload:
```
yarn dev
```

Swagger UI: http://localhost:3000/docs

### Configure Swagger server URL
Set a production server for Swagger dropdown:
```
SWAGGER_SERVER_URL=https://api.yourdomain.com
```
If not set, it defaults to `http://localhost:PORT`.

### Auth Endpoints
- Prisma:
  - Edit schema: `prisma/schema.prisma`
  - Push schema to DB: `yarn db:push`
  - Create migration dev: `yarn prisma:migrate`
  - Studio: `yarn prisma:studio`
- POST `/api/auth/register` { email, password }
- POST `/api/auth/login` { email, password }
- GET `/api/auth/me` with `Authorization: Bearer <token>`


