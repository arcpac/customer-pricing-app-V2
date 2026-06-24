import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import customerGroupsRouter from './routes/customerGroups.js';
import customerGroupMembershipsRouter from './routes/customerGroupMemberships.js';
import pricingProfilesRouter from './routes/pricingProfiles.js';
import resolveRouter from './routes/resolve.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import inviteRouter from './routes/invite.js';
import resetPasswordRouter from './routes/resetPassword.js';
import { requireAuth } from './middleware/auth.js';
import { checkS3Connection } from './lib/s3.js';
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/health/s3', async (_req, res) => {
  const ok = await checkS3Connection();
  res.status(ok ? 200 : 503).json({ ok });
});

app.use('/api/auth', authRouter);

app.use('/api/products', requireAuth, productsRouter);
app.use('/api/customers', requireAuth, customersRouter);
app.use('/api/customer-groups', requireAuth, customerGroupsRouter);
app.use(
  '/api/customer-group-memberships',
  requireAuth,
  customerGroupMembershipsRouter,
);
app.use('/api/pricing-profiles', requireAuth, pricingProfilesRouter);
app.use('/api/resolve', requireAuth, resolveRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/invite', inviteRouter);
app.use('/api/reset-password', resetPasswordRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
