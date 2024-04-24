import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { BlobStorageService } from './services/azure.service';
import { BlobServiceClient } from '@azure/storage-blob';
import { BLOB_SERVICE_CLIENT } from './constants';

export type AzureOptions = { connectionString: string };
export type AzureAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<AzureOptions>, 'useFactory' | 'inject'>;

@Module({})
export class AzureStorageModule {
  static register(options: AzureOptions): DynamicModule {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      options.connectionString,
    );

    const azureStorageBlobServiceClient: Provider = {
      provide: BLOB_SERVICE_CLIENT,
      useValue: blobServiceClient,
    };

    return {
      global: true,
      module: AzureStorageModule,
      providers: [BlobStorageService, azureStorageBlobServiceClient],
      exports: [BlobStorageService],
    };
  }

  static registerAsync(options: AzureAsyncOptions): DynamicModule {
    const azureStorageBlobServiceClient: Provider = {
      provide: BLOB_SERVICE_CLIENT,
      inject: options.inject,
      useFactory: async (...args) => {
        const blobStorageOptions = await options.useFactory(...args);
        return BlobServiceClient.fromConnectionString(
          blobStorageOptions.connectionString,
        );
      },
    };

    return {
      global: true,
      module: AzureStorageModule,
      providers: [BlobStorageService, azureStorageBlobServiceClient],
      exports: [BlobStorageService],
    };
  }
}
