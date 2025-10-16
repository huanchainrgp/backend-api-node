import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input or already exists
 */
router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  const normalizedEmail = String(email).toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'insert into users (email, password_hash) values ($1, $2) returning id, email, created_at',
      [normalizedEmail, passwordHash]
    );
    const user = result.rows[0];
    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({ error: 'email_in_use' });
    }
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token returned
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  const normalizedEmail = String(email).toLowerCase();

  try {
    const result = await pool.query(
      'select id, email, password_hash from users where email=$1',
      [normalizedEmail]
    );
    if (result.rowCount === 0) return res.status(401).json({ error: 'invalid_credentials' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch {
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('select id, email, created_at from users where id=$1', [
      req.user.sub
    ]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ user: result.rows[0] });
  } catch {
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;


