import { loadAppConfig } from '../config/env.config';
import { PgService } from './pg.service';
import { hashSecret } from '../modules/iam/password.util';

async function main() {
  const cfg = loadAppConfig();
  const pg = new PgService(cfg.databaseUrl);
  const username = process.env.SEED_ADMIN_USERNAME ?? 'superadmin';
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@smartschool.sch.id';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'AdminSmartSchool123!';

  try {
    const passwordHash = await hashSecret(password);
    await pg.withTransaction(async (client) => {
      const userRes = await client.query<{ id: string }>(
        `INSERT INTO iam_master.users (username, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [username, email, passwordHash],
      );
      const userId = userRes.rows[0].id;

      const roleRes = await client.query<{ id: string }>(
        `SELECT id FROM iam_master.roles WHERE code = 'SUPER_ADMIN' LIMIT 1`,
      );
      if (roleRes.rows.length === 0) {
        throw new Error('SUPER_ADMIN role not found. Run SQL migrations 006_seed_rbac.sql first.');
      }
      const roleId = roleRes.rows[0].id;

      await client.query(
        `INSERT INTO iam_master.user_roles (user_id, role_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userId, roleId],
      );

      await client.query(
        `INSERT INTO iam_master.role_permissions (role_id, permission_id)
         SELECT $1, id FROM iam_master.permissions
         ON CONFLICT DO NOTHING`,
        [roleId],
      );
    });

    console.log(`✅ Seeded SUPER_ADMIN account: ${username} (${email})`);
  } finally {
    await pg.onModuleDestroy();
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

