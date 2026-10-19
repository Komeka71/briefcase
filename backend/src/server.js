const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  // Test MySQL connection pool on startup
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('⚠️  Database connection could not be established immediately.');
    console.warn('   The server is starting; ensure MySQL80 service is running with matching credentials in backend/.env.');
  }

  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 BriefCase Backend API Server running on port ${PORT}`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   DBMS Project: SVNIT Surat | B.Tech II CSE | CS203`);
    console.log(`================================================================`);
  });
}

startServer();
