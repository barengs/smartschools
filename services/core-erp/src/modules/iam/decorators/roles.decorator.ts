import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'iam_roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

