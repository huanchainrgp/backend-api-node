import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ensurePrisma } from './prisma.js';
import authRouter from './routes/auth.js';
import { swaggerUi, swaggerSpec } from './swagger.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', async (req, res) => {
  try {
    await ensurePrisma();
    res.json({ ok: true, db: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'db_unavailable' });
  }
});

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRouter);

const port = process.env.PORT || 3000;

ensurePrisma()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
      // eslint-disable-next-line no-console
      console.log(`Swagger UI at http://localhost:${port}/docs`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });


