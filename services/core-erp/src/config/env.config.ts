import * as fs from 'node:fs';
import * as path from 'node:path';

export interface AppConfig {
  port: number;
  databaseUrl: string;
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  minioEndpoint: string;
  minioAccessKey: string;
  minioSecretKey: string;
  minioRegion: string;
  jwtPrivateKey: string;
  jwtPublicKey: string;
  jwtAccessExpiresIn: string;
  jwtRefreshTtlSeconds: number;
  jwtKeyId: string;
}

function resolveKeyContent(envPath: string | undefined, fallbackRelative: string): string {
  const candidates = [
    envPath ? path.resolve(process.cwd(), envPath) : null,
    path.resolve(process.cwd(), fallbackRelative),
    path.resolve(process.cwd(), '../..', fallbackRelative),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf8');
    }
  }
  throw new Error(`JWT RS256 key file not found. Checked: ${candidates.join(', ')}`);
}

export function loadAppConfig(): AppConfig {
  const pgUser = process.env.POSTGRES_USER ?? 'smartschool';
  const pgPass = process.env.POSTGRES_PASSWORD ?? 'smartschool_dev_pass';
  const pgDb = process.env.POSTGRES_DB ?? 'smartschool_db';
  const pgHost = process.env.POSTGRES_HOST ?? 'localhost';
  const pgPort = process.env.POSTGRES_PORT ?? '5432';

  return {
    port: Number(process.env.CORE_ERP_PORT ?? 3001),
    databaseUrl:
      process.env.DATABASE_URL ??
      `postgresql://${pgUser}:${pgPass}@${pgHost}:${pgPort}/${pgDb}`,
    redisHost: process.env.REDIS_HOST ?? 'localhost',
    redisPort: Number(process.env.REDIS_PORT ?? 6379),
    redisPassword: process.env.REDIS_PASSWORD ?? 'smartschool_redis_pass',
    minioEndpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    minioAccessKey: process.env.MINIO_ROOT_USER ?? 'minioadmin',
    minioSecretKey: process.env.MINIO_ROOT_PASSWORD ?? 'minioadmin_dev_pass',
    minioRegion: process.env.MINIO_REGION ?? 'us-east-1',
    jwtPrivateKey: resolveKeyContent(
      process.env.JWT_PRIVATE_KEY_PATH,
      'infra/secrets/private.pem',
    ),
    jwtPublicKey: resolveKeyContent(
      process.env.JWT_PUBLIC_KEY_PATH,
      'infra/secrets/public.pem',
    ),
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    jwtRefreshTtlSeconds: Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 7 * 24 * 3600),
    jwtKeyId: process.env.JWT_KEY_ID ?? 'smartschool-key-1',
  };
}
