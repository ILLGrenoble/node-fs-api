
export class ApplicationConfig {

  server: {
    port: number,
    host: string,
    authToken: string,
  }

  logging: {
    level: string,
    timezone: string,
  };


  constructor(data?: Partial<ApplicationConfig>) {
    Object.assign(this, data);
  }
}

let applicationConfig: ApplicationConfig;

export function APPLICATION_CONFIG(): ApplicationConfig {
  if (applicationConfig == null) {
    applicationConfig = {
      server: {
        port: process.env.VISA_FILE_BROWSER_SERVER_PORT == null ? 9000 : +process.env.VISA_FILE_BROWSER_SERVER_PORT,
        host: process.env.VISA_FILE_BROWSER_SERVER_HOST == null ? '0.0.0.0' : process.env.VISA_FILE_BROWSER_SERVER_HOST,
        authToken: process.env.VISA_FILE_BROWSER_SERVER_AUTH_TOKEN
      },
      logging: {
        level: process.env.VISA_FILE_BROWSER_LOG_LEVEL == null ? 'debug' : process.env.VISA_FILE_BROWSER_LOG_LEVEL,
        timezone: process.env.VISA_FILE_BROWSER_LOG_TIMEZONE,
      }
    };


  }

  return applicationConfig;
}
