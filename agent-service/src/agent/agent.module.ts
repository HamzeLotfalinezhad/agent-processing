import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { KafkaService } from '../kafka/kafka.service';
import { KafkaModule } from '../kafka/kafka.module';
import { AgentController } from './agent.controller';

@Module({
  imports: [
    KafkaModule
  ],
  controllers: [
    AgentController
  ],
  providers: [
    AgentService,
  ],
  exports: [
    AgentService,
  ],
})
export class AgentModule { }
