import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import hostRoutes from './routes/host.routes';
import workshopRoutes from './routes/workshop.routes';
import timeslotRoutes from './routes/timeslot.routes';
import bookingRoutes from './routes/booking.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import tourGuideRoutes from './routes/tourGuide.routes';
import categoryRoutes from './routes/category.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Security & parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Rate limiting & Trust Proxy
app.set('trust proxy', 1);

const isDev = env.NODE_ENV === 'development';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 50,
  skip: (req) => req.method === 'OPTIONS',
  message: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: options.message,
    });
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 20000 : 500,
  skip: (req) => req.method === 'OPTIONS',
  message: 'Quá nhiều request, vui lòng thử lại sau',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: options.message,
    });
  },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'CraftLocal API đang hoạt động 🏺', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tour-guide', tourGuideRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint không tồn tại' });
});

// Error handler
app.use(errorMiddleware);

export default app;
