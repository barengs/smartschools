import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PgService } from '../../database/pg.service';
import { CreateUserDto } from './dto/users.dto';
import { hashSecret } from './password.util';

@Injectable()
export class UsersService {
  constructor(private readonly pg: PgService) {}

  async listUsers() {
    return this.pg.query(
      `SELECT u.id, u.username, u.email, u.phone, u.is_active, u.last_login_at, u.created_at,
              COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS roles
       FROM iam_master.users u
       LEFT JOIN iam_master.user_roles ur ON ur.user_id = u.id
       LEFT JOIN iam_master.roles r ON r.id = ur.role_id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT 100`,
    );
  }

  async listRoles() {
    return this.pg.query(
      'SELECT id, code, name, description FROM iam_master.roles ORDER BY code ASC',
    );
  }

  async createUser(dto: CreateUserDto) {
    const passwordHash = await hashSecret(dto.password);

    try {
      return await this.pg.withTransaction(async (client) => {
        const roleRes = await client.query<{ id: string; code: string }>(
          'SELECT id, code FROM iam_master.roles WHERE code = ANY($1::text[])',
          [dto.roleCodes],
        );

        if (roleRes.rows.length !== dto.roleCodes.length) {
          throw new BadRequestException('One or more roleCodes do not exist');
        }

        const userRes = await client.query<{
          id: string;
          username: string;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: Date;
        }>(
          `INSERT INTO iam_master.users (username, email, phone, password_hash)
           VALUES ($1, $2, $3, $4)
           RETURNING id, username, email, phone, is_active, created_at`,
          [dto.username.trim(), dto.email?.trim() ?? null, dto.phone ?? null, passwordHash],
        );

        const createdUser = userRes.rows[0];
        for (const role of roleRes.rows) {
          await client.query(
            'INSERT INTO iam_master.user_roles (user_id, role_id) VALUES ($1, $2)',
            [createdUser.id, role.id],
          );
        }

        return {
          ...createdUser,
          roles: roleRes.rows.map((r) => r.code),
        };
      });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new ConflictException('Username or email already exists');
      }
      throw err;
    }
  }

  async replaceUserRoles(userId: string, roleCodes: string[]) {
    return this.pg.withTransaction(async (client) => {
      const userCheck = await client.query(
        'SELECT id FROM iam_master.users WHERE id = $1',
        [userId],
      );
      if (userCheck.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      const roleRes = await client.query<{ id: string; code: string }>(
        'SELECT id, code FROM iam_master.roles WHERE code = ANY($1::text[])',
        [roleCodes],
      );
      if (roleRes.rows.length !== roleCodes.length) {
        throw new BadRequestException('One or more roleCodes do not exist');
      }

      await client.query('DELETE FROM iam_master.user_roles WHERE user_id = $1', [userId]);
      for (const role of roleRes.rows) {
        await client.query(
          'INSERT INTO iam_master.user_roles (user_id, role_id) VALUES ($1, $2)',
          [userId, role.id],
        );
      }

      return { userId, roles: roleRes.rows.map((r) => r.code) };
    });
  }
}

