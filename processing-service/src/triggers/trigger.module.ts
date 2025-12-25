import { Module } from '@nestjs/common';
import { TriggerService } from './trigger.service';
import { RulesModule } from '../rules/rule.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RulesModule,
    RedisModule
  ],
  providers: [TriggerService],
  exports: [TriggerService],
})
export class TriggersModule { }
