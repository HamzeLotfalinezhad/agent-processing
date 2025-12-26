import { Controller, Get } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { AgentService } from './agent.service';

@Controller('agents')
export class AgentController {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly agentService: AgentService
  ) { }

  @Get('/health')
  health() {
    return {
      status: 'ok',
      kafka: this.kafkaService.isConnected(),
      bufferSize: this.agentService.getBufferSize(),
    };
  }

}
