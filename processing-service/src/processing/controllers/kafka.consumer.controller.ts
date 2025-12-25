import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from '../../events/event.service';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(
    private readonly eventService: EventService,
  ) { }

  @EventPattern('agent.events')
  async handleAgentEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    const message = context.getMessage();

    const payload = typeof message.value === 'string' ? JSON.parse(message.value) : message.value;

    this.logger.log(`Payload from Kafka:`, payload);

    // 1️ First save event in mongo
    this.logger.debug(`1.1. Save in db Event Model`)
    // const event = await this.eventService.save(payload);
    // this.logger.log(event)

    // 2️ match rules + save RuleTrigger + Redis
    this.logger.debug(`1.2. Match rules + save RuleTrigger + Redis`)
    // TODO
  }
}
