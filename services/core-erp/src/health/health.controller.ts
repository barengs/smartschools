import { Controller, Get } from '@nestjs/common';
import { PgService } from '../database/pg.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly pg: PgService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const [postgresOk, redisOk] = await Promise.all([
      this.pg.ping().catch(() => false),
      this.redis.ping().catch(() => false),
    ]);

    return {
      status: postgresOk && redisOk ? 'ok' : 'degraded',
      service: 'core-erp',
      dependencies: {
        postgres: postgresOk ? 'up' : 'down',
        redis: redisOk ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

