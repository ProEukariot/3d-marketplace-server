import { registerAs } from '@nestjs/config';
import { AzureConfig } from 'interfaces/azure-config.interface';

export default registerAs(
  'azure',
  (): AzureConfig => ({
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  }),
);
