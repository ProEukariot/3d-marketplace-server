import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { SKIP_AUTH_KEY } from 'src/utils/skipAuth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
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

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'SECRET',
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
