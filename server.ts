import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

// Lazy initialization of Stripe
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Helper to read and write data safely
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { students: [], courses: [], payments: [], expenses: [] };
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { students: [], courses: [], payments: [], expenses: [] };
  }
};

const writeData = (data: any) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/data', (req, res) => {
    res.json(readData());
  });

  app.post('/api/data', (req, res) => {
    const success = writeData(req.body);
    if (success) {
      res.json({ status: 'ok' });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // Stripe Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(503).json({ error: 'Stripe non configurato sul server' });
    }

    const { amount, description, studentName, paymentId } = req.body;

    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Pagamento ${studentName}`,
                description: description || 'Pagamento corso',
              },
              unit_amount: Math.round(amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_status=success&payment_id=${paymentId}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_status=cancel&payment_id=${paymentId}`,
        metadata: {
          paymentId,
          studentName,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe Session Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
