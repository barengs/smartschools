import * as crypto from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { loadAppConfig } from '../../config/env.config';
import { PgService } from '../../database/pg.service';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload } from './iam.types';
import { verifySecret } from './password.util';

interface UserAuthRow {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  is_active: boolean;
}

@Injectable()
export class AuthService {
  private readonly cfg = loadAppConfig();

  constructor(
    private readonly pg: PgService,
    private readonly redis: RedisService,
  ) {}

  async login(identifier: string, password: string) {
    const user = await this.pg.queryOne<UserAuthRow>(
      `SELECT id, username, email, password_hash, is_active
       FROM iam_master.users
       WHERE username = $1 OR email = $1
       LIMIT 1`,
      [identifier.trim()],
    );

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    const passwordValid = await verifySecret(password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    await this.pg.query(
      'UPDATE iam_master.users SET last_login_at = NOW() WHERE id = $1',
      [user.id],
    );

    return this.issueTokensForUser(user.id, user.username, user.email);
  }

  async refresh(rawRefreshToken: string) {
    const [tokenId, secret] = rawRefreshToken.split('.');
    if (!tokenId || !secret) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    const redisKey = this.refreshRedisKey(tokenId);
    const stored = await this.redis.get(redisKey);
    if (!stored) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const parsed = JSON.parse(stored) as { userId: string; tokenHash: string };
    const incomingHash = this.sha256(secret);
    if (!this.timingSafeEqualHex(incomingHash, parsed.tokenHash)) {
      await this.redis.del(redisKey);
      throw new UnauthorizedException('Refresh token invalid');
    }

    // Rotate refresh token on each use
    await this.redis.del(redisKey);

    const user = await this.pg.queryOne<{
      id: string;
      username: string;
      email: string | null;
      is_active: boolean;
    }>(
      'SELECT id, username, email, is_active FROM iam_master.users WHERE id = $1',
      [parsed.userId],
    );

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Account no longer active');
    }

    return this.issueTokensForUser(user.id, user.username, user.email);
  }

  async logout(rawRefreshToken: string): Promise<{ loggedOut: boolean }> {
    const [tokenId] = rawRefreshToken.split('.');
    if (tokenId) {
      await this.redis.del(this.refreshRedisKey(tokenId));
    }
    return { loggedOut: true };
  }

  getPublicKeyPem(): string {
    return this.cfg.jwtPublicKey;
  }

  private async issueTokensForUser(
    userId: string,
    username: string,
    email: string | null,
  ) {
    const { roles, permissions } = await this.loadUserAuthorization(userId);
    const payload: JwtPayload = {
      sub: userId,
      username,
      roles,
      permissions,
    };

    const accessToken = jwt.sign(payload, this.cfg.jwtPrivateKey, {
      algorithm: 'RS256',
      expiresIn: this.cfg.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
      keyid: this.cfg.jwtKeyId,
    });

    const tokenId = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString('hex');
    await this.redis.setEx(
      this.refreshRedisKey(tokenId),
      this.cfg.jwtRefreshTtlSeconds,
      JSON.stringify({ userId, tokenHash: this.sha256(secret) }),
    );

    return {
      accessToken,
      refreshToken: `${tokenId}.${secret}`,
      tokenType: 'Bearer',
      expiresIn: this.cfg.jwtAccessExpiresIn,
      user: {
        id: userId,
        username,
        email,
        roles,
        permissions,
      },
    };
  }

  private async loadUserAuthorization(userId: string): Promise<{
    roles: string[];
    permissions: string[];
  }> {
    const roleRows = await this.pg.query<{ code: string }>(
      `SELECT r.code
       FROM iam_master.user_roles ur
       JOIN iam_master.roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    const permRows = await this.pg.query<{ code: string }>(
      `SELECT DISTINCT p.code
       FROM iam_master.user_roles ur
       JOIN iam_master.role_permissions rp ON rp.role_id = ur.role_id
       JOIN iam_master.permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    return {
      roles: roleRows.map((r) => r.code),
      permissions: permRows.map((p) => p.code),
    };
  }

  private refreshRedisKey(tokenId: string): string {
    return `iam:refresh:${tokenId}`;
  }

  private sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private timingSafeEqualHex(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }
}

