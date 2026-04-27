import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SchoolId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    return ctx.switchToHttp().getRequest().user.schoolId;
  },
);
