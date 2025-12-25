import { Module } from '@nestjs/common';
import { TriggerService } from './trigger.service';
import { RuleTrigger, RuleTriggerSchema } from './trigger.schema';
import { DatabaseModule } from '../common/database';
import { RulesModule } from '../rules/rule.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: RuleTrigger.name, schema: RuleTriggerSchema },
    ]),

    RulesModule,
    RedisModule
  ],
  providers: [TriggerService],
  exports: [TriggerService],
})
export class TriggersModule { }
