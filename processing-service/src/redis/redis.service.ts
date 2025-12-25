import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {

  public readonly pub: Redis;
  public readonly sub: Redis;

  constructor(
    private readonly config: ConfigService // inject config
  ) {

    const redisUrl = this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.pub = new Redis(redisUrl);
    this.sub = new Redis(redisUrl);

  }

}
