import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from '../../events/event.service';
import { TriggerService } from '../../triggers/trigger.service';
import { KafkaService } from '../../kafka/kafka.service';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(
    private readonly eventService: EventService,
    private readonly triggerService: TriggerService,
    private readonly kafkaService: KafkaService,
  ) { }

  @EventPattern('agent.events')
  async handleAgentEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    const message = context.getMessage();

    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const partition = context.getPartition();
    const payload = typeof message.value === 'string' ? JSON.parse(message.value) : message.value;

    try {
      // this.logger.log(`1.1. Save in Mongo ${JSON.stringify(payload)}`);

      // 1️ First save event in mongo
      const event = await this.eventService.save(payload);

      // 2️ match rules + save RuleTrigger + Redis
      await this.triggerService.match(event);
      
      this.logger.log(`1.1. Save in Mongo and Match rules ${JSON.stringify(payload)}`)

      // success - commit offset
      try {
        await consumer.commitOffsets([{
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        }]);
      } catch (offsetErr) {
        this.logger.warn('Offset commit failed, will retry automatically', offsetErr);
      }

    } catch (err) {

      // if mongo or .... errors then retry
      if (await this.isInfraError(err)) {
        this.logger.error('Infra failure, retrying');
        throw err;
      }

      // if not, then it is business failure so we do DLQ
      await this.sendToDLQ(payload, err);

      // commit offset manually
      await consumer.commitOffsets([
        {
          topic, partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);

    }

  }

  async sendToDLQ(payload: any, err: any) {
    this.logger.log('Send to DLQ')
    const dlqPayload = {
      payload,
      error: err.message,
      stack: err.stack,
      failedAt: Date.now(),
      source: 'processing-service',
    };
    await this.kafkaService.send('agent.events.dlq', dlqPayload);
  }

  async isInfraError(err: any): Promise<boolean> {
    this.logger.log(`isInfraError ${err?.name}`)
    const infraErrors = [
      'MongoNetworkError',
      'MongoTimeoutError',
      'MongooseServerSelectionError',
      'RedisConnectionError',
      'KafkaJSConnectionError',
      'KafkaJSNumberOfRetriesExceeded',
    ];
    return infraErrors.includes(err?.name);
  }

}
