import { Global, Module } from '@nestjs/common';
import { PgService } from './pg.service';
import { loadAppConfig } from '../config/env.config';

@Global()
@Module({
  providers: [
    {
      provide: PgService,
      useFactory: () => new PgService(loadAppConfig().databaseUrl),
    },
  ],
  exports: [PgService],
})
export class DatabaseModule {}

