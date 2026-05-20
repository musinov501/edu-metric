import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface SignedUploadPayload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    this.configured = Boolean(cloudName && apiKey && apiSecret);

    if (this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    } else {
      this.logger.warn('Cloudinary credentials missing — upload endpoints will reject requests.');
    }
  }

  /**
   * Generate a signed payload the frontend uses to upload directly to
   * Cloudinary, so file bytes never traverse our API.
   */
  signUpload(folder = 'edumetric'): SignedUploadPayload {
    this.assertConfigured();
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    );
    return {
      signature,
      timestamp,
      apiKey: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      cloudName: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      folder,
    };
  }

  /** Server-side direct upload (useful for seed scripts). */
  async uploadBase64(dataUri: string, folder = 'edumetric'): Promise<UploadApiResponse> {
    this.assertConfigured();
    return cloudinary.uploader.upload(dataUri, { folder });
  }

  private assertConfigured() {
    if (!this.configured) {
      throw new BadRequestException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in .env',
      );
    }
  }
}
