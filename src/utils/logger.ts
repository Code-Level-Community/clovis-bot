import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  name: 'clovis',
  level: 'debug',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
});
