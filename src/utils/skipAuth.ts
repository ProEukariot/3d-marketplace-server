import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'skipAuth';
export const Public = () => SetMetadata(SKIP_AUTH_KEY, true);