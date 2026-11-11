export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
}

