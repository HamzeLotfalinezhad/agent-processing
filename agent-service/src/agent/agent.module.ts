import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { KafkaService } from '../kafka/kafka.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    KafkaModule
  ],
  controllers: [
  ],
  providers: [
    AgentService,
  ],
  exports: [
    AgentService,
  ],
})
export class AgentModule { }
