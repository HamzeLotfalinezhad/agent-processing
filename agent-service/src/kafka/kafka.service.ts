import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import CircuitBreaker from 'opossum';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  private kafkaBreaker: CircuitBreaker;

  constructor(@Inject('KAFKA_SERVICE') private readonly client: ClientKafka) {
    // Circuit Breaker
    this.kafkaBreaker = new CircuitBreaker(
      (message: { topic: string; payload: any }) =>
        firstValueFrom(this.client.emit(message.topic, message.payload)),
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
      },
    );

    this.kafkaBreaker.on('open', () => this.logger.warn('Circuit Breaker opened! Kafka might be down.'));
    this.kafkaBreaker.on('halfOpen', () => this.logger.log('Circuit Breaker half-open, testing Kafka...'));
    this.kafkaBreaker.on('close', () => this.logger.log('Circuit Breaker closed, Kafka is back online.'));
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async send(topic: string, payload: any) {
    return this.kafkaBreaker.fire({ topic, payload });
  }
}