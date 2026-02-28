import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserPermissions = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    return request.userPermissions || [];
  },
);
