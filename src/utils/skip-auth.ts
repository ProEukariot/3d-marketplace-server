import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'SKIP_AUTH_KEY';
export const Public = () => SetMetadata(SKIP_AUTH_KEY, true);
