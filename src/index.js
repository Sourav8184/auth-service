const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error-middleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(ServerConfig.PORT, () => {
  console.log(`Auth Service is running on http://localhost:${ServerConfig.PORT}`);
});
