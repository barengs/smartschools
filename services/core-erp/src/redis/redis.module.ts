import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { loadAppConfig } from '../config/env.config';

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useFactory: () => {
        const cfg = loadAppConfig();
        return new RedisService(cfg.redisHost, cfg.redisPort, cfg.redisPassword);
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

