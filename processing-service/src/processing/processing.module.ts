import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaConsumerController } from './controllers/kafka.consumer.controller';
import { RedisModule } from '../redis/redis.module';
import { RulesModule } from '../rules/rule.module';
import { DatabaseModule } from '../common/database';
import { EventsModule } from '../events/event.module';
import { TriggersModule } from '../triggers/trigger.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    DatabaseModule,
    EventsModule,
    RulesModule,
    RedisModule,
    TriggersModule,
    ReportsModule,

    KafkaModule
  ],
  controllers: [
    // kafka consumer
    KafkaConsumerController
  ],
  providers: [
  ],
  exports: [
  ],
})
export class ProcessingModule { }
