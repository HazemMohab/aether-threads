import app from './app.js';
import db from './config/db.js';

const PORT = process.env.PORT || 5000;

db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
