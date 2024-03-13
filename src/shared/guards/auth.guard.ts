import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { SKIP_AUTH_KEY } from 'src/utils/skipAuth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();

    const token = getTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException();
    }

    const secret = this.config.getOrThrow<string>('jwt.secret');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      req['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}

function getTokenFromHeader(request: Request) {
  const authHeader = request.headers['authorization'];
  const [type, token] = authHeader?.split(' ') || [];

  return type == 'Bearer' ? token : undefined;
}
