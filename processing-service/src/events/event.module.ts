import { Module } from '@nestjs/common';
import { Event, EventSchema } from './event.schema';
import { EventService } from './event.service';
import { DatabaseModule } from '../common/database';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventsModule {}
