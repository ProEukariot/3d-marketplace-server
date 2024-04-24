import { BlobServiceClient } from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { BLOB_SERVICE_CLIENT } from '../constants';

@Injectable()
export class BlobStorageService {
  constructor(
    @Inject(BLOB_SERVICE_CLIENT) private blobServiceClient: BlobServiceClient,
  ) {}

  async uploadBlob(
    containerName: string,
    blobName: string,
    blob: Express.Multer.File,
  ) {
    try {
      const containerClient =
        this.blobServiceClient.getContainerClient(containerName);

      const createContainerResponse = await containerClient.createIfNotExists();

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const uploadBlobResponse = await blockBlobClient.uploadData(blob.buffer, {
        blobHTTPHeaders: { blobContentType: blob.mimetype },
      });

      return uploadBlobResponse;
    } catch (err) {
      throw err;
    }
  }
}
