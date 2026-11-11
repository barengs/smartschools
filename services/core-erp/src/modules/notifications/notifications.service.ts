import * as crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

export type NotificationChannel = 'FCM' | 'WHATSAPP' | 'EMAIL';

export interface NotificationJob {
  channel: NotificationChannel;
  recipient: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly redis: RedisService) {}

  async enqueueNotification(job: NotificationJob): Promise<void> {
    const payload = JSON.stringify({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...job,
    });

    try {
      await this.redis.lpush('queue:notifications', payload);
    } catch (err) {
      this.logger.warn(
        `Redis unavailable; notification logged locally [${job.channel}] -> ${job.recipient}: ${String(err)}`,
      );
    }
  }

  async publishDomainEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const envelope = {
      event_id: crypto.randomUUID(),
      event_type: eventType,
      occurred_at: new Date().toISOString(),
      source: 'node-erp',
      payload: JSON.stringify(payload),
    };

    try {
      await this.redis.xadd('stream:events', envelope);
    } catch (err) {
      this.logger.warn(`Failed to publish event ${eventType}: ${String(err)}`);
    }
  }
}

