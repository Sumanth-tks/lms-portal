const pino = require('pino');

const pinoConfig = {
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
};

let logger;

if (process.env.NODE_ENV === 'production') {
  // Production: JSON logs
  logger = pino(pinoConfig);
} else {
  // Development: Pretty-printed logs
  logger = pino(
    pinoConfig,
    pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    })
  );
}

module.exports = logger;
