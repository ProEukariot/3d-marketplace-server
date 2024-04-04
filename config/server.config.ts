import { registerAs } from '@nestjs/config';
import { ServerConfig } from 'interfaces/server-config.interface';

export default registerAs(
  'server',
  (): ServerConfig => ({
    url: process.env.SERVER_URL,
    client_url: process.env.CLIENT_URL,
  }),
);
