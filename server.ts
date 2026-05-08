import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');
const TOKENS_FILE = path.join(__dirname, 'drive_tokens.json');

// Google OAuth Constants
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const REDIRECT_URI = `${APP_URL}/auth/callback`;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes for Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Helper to read and write tokens
const readTokens = () => {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
      oauth2Client.setCredentials(tokens);
      return tokens;
    }
  } catch (error) {
    console.error('Error reading tokens:', error);
  }
  return null;
};

const writeTokens = (tokens: any) => {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  oauth2Client.setCredentials(tokens);
};

// Helper to read and write data safely
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { people: [], courses: [], attendance: [], payments: [], expenses: [] };
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { people: [], courses: [], attendance: [], payments: [], expenses: [] };
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

// Drive Sync Helpers
async function findDataFile(drive: any) {
  const response = await drive.files.list({
    q: "name = 'data.json' and trashed = false",
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  return response.data.files[0];
}

async function uploadToDrive(data: any) {
  const tokens = readTokens();
  if (!tokens) return null;

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const existingFile = await findDataFile(drive);

  const fileMetadata = {
    name: 'data.json',
  };
  const media = {
    mimeType: 'application/json',
    body: JSON.stringify(data, null, 2),
  };

  if (existingFile) {
    await drive.files.update({
      fileId: existingFile.id,
      media: media,
    });
    return existingFile.id;
  } else {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });
    return file.data.id;
  }
}

async function downloadFromDrive() {
  const tokens = readTokens();
  if (!tokens) return null;

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const existingFile = await findDataFile(drive);

  if (existingFile) {
    const response = await drive.files.get({
      fileId: existingFile.id,
      alt: 'media',
    });
    return response.data;
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize client with stored tokens if they exist
  readTokens();

  // API Routes
  app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
  });

  app.post('/api/data', async (req, res) => {
    const success = writeData(req.body);
    if (success) {
      // Try to sync with Drive if connected
      const tokens = readTokens();
      if (tokens) {
        try {
          await uploadToDrive(req.body);
        } catch (e) {
          console.error('Failed to sync to Drive:', e);
        }
      }
      res.json({ status: 'ok' });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // OAuth Routes
  app.get('/api/auth/url', (req, res) => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    res.json({ url });
  });

  app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (typeof code !== 'string') {
      return res.status(400).send('No code provided');
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      writeTokens(tokens);

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #059669; margin-bottom: 0.5rem;">Connesso!</h1>
              <p style="color: #64748b;">Google Drive è ora sincronizzato. Questa finestra si chiuderà...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 2000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging code:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/auth/status', (req, res) => {
    const tokens = readTokens();
    res.json({ connected: !!tokens });
  });

  app.post('/api/sync/drive', async (req, res) => {
    try {
      const driveData = await downloadFromDrive();
      if (driveData) {
        writeData(driveData);
        res.json({ status: 'ok', data: driveData });
      } else {
        // If file doesn't exist on drive, upload local data
        const localData = readData();
        await uploadToDrive(localData);
        res.json({ status: 'ok', message: 'Local data uploaded to Drive' });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      res.status(500).json({ error: 'Sync failed' });
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
