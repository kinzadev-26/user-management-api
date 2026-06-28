import { ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException(
        'Token has expired. Please login again or refresh your token.',
      );
    }

    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException(
        'Invalid token. Please login again.',
      );
    }

    if (err || !user) {
      throw new UnauthorizedException(
        'Access denied. No token provided. Please login first.',
      );
    }

    return user;
  }
}