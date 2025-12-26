import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import CircuitBreaker from 'opossum';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  private breaker: CircuitBreaker;

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly client: ClientKafka,
  ) {
    this.breaker = new CircuitBreaker(
      async ({ topic, value, key }: any) => {
        return firstValueFrom(
          this.client.emit(topic, {value,  key }),
        );
      }, 
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10_000, // THIS triggers HALF_OPEN
      },
    );

    this.breaker.on('open', () =>
      this.logger.warn('Circuit breaker OPEN - Kafka down'),
    );

    this.breaker.on('halfOpen', () =>
      this.logger.debug('Circuit breaker HALF-OPEN - testing Kafka ...'),
    );

    this.breaker.on('close', () =>
      this.logger.log('Circuit breaker CLOSED - Kafka healthy'),
    );
  }

  async onModuleInit() {
    this.client.connect().catch(err => {
      this.logger.warn('Kafka not available at startup, continuing...');
    });
  }

  isConnected(): boolean {
    return !this.breaker.opened;
  }

  async send(topic: string, payload: unknown, key?: string) {
    const value = JSON.stringify(payload);
    return this.breaker.fire({ topic, value, key });
  }
}
