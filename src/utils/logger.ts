import { config, createLogger, format, transports } from 'winston';
import { APPLICATION_CONFIG } from '../application-config';
import moment from 'moment-timezone';

export const buildLogger = function() {
  const appendTimestamp = format((info, opts) => {
    if (opts && opts.tz) {
      info.timestamp = moment().tz(opts.tz).format('YYYY-MM-DD HH:mm:ss');

    } else {
      info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    return info;
  });

  const logger = createLogger({
    level: APPLICATION_CONFIG().logging.level,
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          appendTimestamp(APPLICATION_CONFIG().logging.timezone ? {tz: APPLICATION_CONFIG().logging.timezone} : null),
          format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
          })
        )
      })
    ]
  });

  return logger;
};

export const logger = buildLogger();
