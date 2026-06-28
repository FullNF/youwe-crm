const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const usersRepo = require('./services/users.repository');

async function bootstrap() {
  try {
    await usersRepo.ensureSeedAdmin();
  } catch (err) {
    logger.warn('Could not seed admin user (check Google Sheets credentials):', err.message);
  }

  app.listen(env.PORT, () => {
    logger.info(`CRM API running on http://localhost:${env.PORT}  (env: ${env.NODE_ENV})`);
  });
}

bootstrap();
