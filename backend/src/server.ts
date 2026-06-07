import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import customerGroupsRouter from './routes/customerGroups.js';
import customerGroupMembershipsRouter from './routes/customerGroupMemberships.js';
import pricingProfilesRouter from './routes/pricingProfiles.js';
import resolveRouter from './routes/resolve.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import { swaggerSpec } from './swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
