import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(host: string, port: number, password: string) {
    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async xadd(stream: string, fields: Record<string, string>, maxLen = 100_000): Promise<string> {
    const flatArgs: string[] = [];
    for (const [k, v] of Object.entries(fields)) {
      flatArgs.push(k, v);
    }
    const id = await this.client.xadd(stream, 'MAXLEN', '~', String(maxLen), '*', ...flatArgs);
    return id ?? '';
  }

  async lpush(key: string, value: string): Promise<number> {
    return this.client.lpush(key, value);
  }

  async ping(): Promise<boolean> {
    const res = await this.client.ping();
    return res === 'PONG';
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
