import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { IamModule } from './modules/iam/iam.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PpdbModule } from './modules/ppdb/ppdb.module';
import { StorageModule } from './modules/storage/storage.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    RedisModule,
    StorageModule,
    NotificationsModule,
    IamModule,
    PpdbModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
