import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async save(event: {
    agentId: string;
    name: string;
    value: number;
    timestamp: number;
  }) {
    return this.eventModel.create(event);
  }
}
