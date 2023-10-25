
export class ApplicationConfig {

  server: {
    port: number,
    host: string,
    authToken: string,
    maxFileUploadSize: string,
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
        port: process.env.NODE_FS_API_SERVER_PORT == null ? 8090 : +process.env.NODE_FS_API_SERVER_PORT,
        host: process.env.NODE_FS_API_SERVER_HOST == null ? '0.0.0.0' : process.env.NODE_FS_API_SERVER_HOST,
        authToken: process.env.NODE_FS_API_SERVER_AUTH_TOKEN,
        maxFileUploadSize: process.env.NODE_FS_API_MAX_FILE_UPLOAD_SIZE == null ? '2.0mb': process.env.NODE_FS_API_MAX_FILE_UPLOAD_SIZE,
      },
      logging: {
        level: process.env.NODE_FS_API_LOG_LEVEL == null ? 'debug' : process.env.NODE_FS_API_LOG_LEVEL,
        timezone: process.env.NODE_FS_API_LOG_TIMEZONE,
      }
    };


  }

  return applicationConfig;
}
