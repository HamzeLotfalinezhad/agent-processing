import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaConsumerController } from './controllers/kafka.consumer.controller';
import { RedisModule } from '../redis/redis.module';
import { RulesModule } from '../rules/rule.module';
import { ReportController } from './report.controller';
import { DatabaseModule } from '../common/database';

@Module({
  imports: [
    DatabaseModule,

    RulesModule,
    RedisModule,

    KafkaModule
  ],
  controllers: [
    ReportController,

    // kafka consumer
    KafkaConsumerController
  ],
  providers: [
  ],
  exports: [
  ],
})
export class ProcessingModule { }
