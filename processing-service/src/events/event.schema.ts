import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, index: true })
  agentId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true, index: true })
  timestamp: number;
}

export type EventDocument = Event & Document;

export const EventSchema = SchemaFactory.createForClass(Event);

/**
 * Indexes for performance
 * ----------------------
 * 1) query by event type + time range
 * 2) query by agent + time range
 */
EventSchema.index({ name: 1, timestamp: -1 });
EventSchema.index({ agentId: 1, timestamp: -1 });
