import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { generateEvent } from './domain/event.generator';
import { KafkaService } from '../kafka/kafka.service';
import { ConfigService } from '@nestjs/config';

type AgentEvent = {
  agentId: string;
  name: string;
  value: number;
  timestamp: number;
};


@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);

  private readonly agentId: string;
  private readonly emitInterval: number;
  private readonly bufferFlushInterval: number;

  // buffer events when kafka is down
  private buffer: AgentEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 10_000;
  private flushing = false;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly configService: ConfigService,
  ) {
    this.agentId = this.configService.get<string>('AGENT_ID') ?? `agent-${Math.floor(Math.random() * 10_000)}`;

    this.emitInterval = Number(this.configService.get('EMIT_INTERVAL', 200));

    this.bufferFlushInterval = Number(this.configService.get('BUFFER_FLUSH_INTERVAL', 2000));
  }


  onModuleInit() {
    this.logger.log(`Agent started with ID: ${this.agentId}`);

    setInterval(() => {
      this.emitEvent().catch((err) =>
        this.logger.error('Failed to emit event', err),
      );
    }, this.emitInterval);

    // each 2 second flush buffer
    setInterval(() => this.flushBuffer(), this.bufferFlushInterval);
  }

  async emitEvent() {
    const event = generateEvent();
    const payload = {
      agentId: this.agentId,
      ...event,
      timestamp: Date.now(),
    };

    try {
      await this.kafkaService.send('agent.events', payload, this.agentId);
      this.logger.log(`Emiting event: ${JSON.stringify(payload)}`);
    } catch {
      // this.logger.debug(`Emit event failed catch`);
      this.bufferEvent(payload);
    }
  }

  private bufferEvent(payload: any) {
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      this.logger.error('Buffer overflow, dropping event');
      return;
    }
    this.buffer.push(payload);
    this.logger.warn('Buffering event');
  }

  private async flushBuffer() {
    if (this.flushing) return;
    if (!this.kafkaService.isConnected()) return;
    if (this.buffer.length === 0) return;

    this.flushing = true;

    const events = [...this.buffer];
    this.buffer.length = 0;

    for (const event of events) {
      try {
        await this.kafkaService.send('agent.events', event, this.agentId);
        this.logger.log(`Flush from buffer -> ${JSON.stringify(event)}`);
      } catch {
        this.buffer.unshift(event);
        this.logger.debug(`Flush failed, re-buffering -> ${JSON.stringify(event)}`);
        break;
      }
    }

    this.flushing = false;
  }


  getBufferSize() {
    return this.buffer.length;
  }
}

