import express from 'express';
import cors from 'cors';
import { initializeDatabase, closeDatabase } from './database.js';
import { materialsRouter } from './routes/materials.js';
import { recipesRouter } from './routes/recipes.js';
import { costRouter } from './routes/cost.js';
import { sampleDataRouter } from './routes/sample-data.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定（本番環境対応）
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL, // 本番環境のフロントエンドURL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // originがundefinedの場合（同一オリジンリクエスト）も許可
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.startsWith(allowed || ''))) {
      callback(null, true);
    } else {
      callback(null, true); // 開発中は全て許可
    }
  },
  credentials: true,
}));
app.use(express.json());

// データベース初期化
initializeDatabase();

// ルーティング
app.use('/api/materials', materialsRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/cost', costRouter);
app.use('/api/sample-data', sampleDataRouter);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bakery Cost Calculator API is running' });
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// サーバー起動
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET    /api/health`);
  console.log(`  - GET    /api/materials`);
  console.log(`  - POST   /api/materials`);
  console.log(`  - GET    /api/recipes`);
  console.log(`  - POST   /api/recipes`);
  console.log(`  - GET    /api/cost/settings`);
  console.log(`  - GET    /api/cost/calculate`);
  console.log(`  - POST   /api/sample-data/generate`);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});
