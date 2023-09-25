import * as dotenv from 'dotenv';
dotenv.config();
import { logger } from './utils';
import { Application } from './application';

export async function main() {
  // Create a new application
  const application = new Application();

  // Add handler to gracefully quit of application
  process.on('SIGINT', () => {
    logger.info('SIGINT signal received.');
    application.stop().then(() => {
      logger.info('Application stopped');
      process.exit(0);
    });
  });

  // Start the application
  application.start();

  return application;
}
