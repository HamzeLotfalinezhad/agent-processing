import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { generateEvent } from './domain/event.generator';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private readonly agentId = process.env.AGENT_ID || 'agent-' + Math.floor(Math.random() * 10000);

  constructor(
    private readonly kafkaService: KafkaService
  ) { }


  onModuleInit() {
    this.logger.log(`Agent started with ID: ${this.agentId}`);

    setInterval(() => {
      this.emitEvent().catch((err) =>
        this.logger.error('Failed to emit event', err),
      );
    }, 1000);
  }

  async emitEvent() {
    const event = generateEvent();

    const payload = {
      agentId: this.agentId,
      ...event,
      timestamp: Date.now(),
    };

    this.logger.log(`Emitting payload: ${JSON.stringify(payload)}`);

    // Send to kafka - Serialize payload
    await this.kafkaService.send('agent.events', JSON.stringify(payload));
  }
}

