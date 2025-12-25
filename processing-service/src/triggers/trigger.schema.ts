import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class RuleTrigger {
  @Prop({ type: Types.ObjectId, ref: 'Rule', required: true })
  ruleId: Types.ObjectId;

  @Prop({ required: true })
  agentId: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ default: () => new Date() })
  triggeredAt: Date;
}

export type RuleTriggerDocument = RuleTrigger & Document;

export const RuleTriggerSchema = SchemaFactory.createForClass(RuleTrigger);

// Indexes
RuleTriggerSchema.index({ ruleId: 1, triggeredAt: -1 });
RuleTriggerSchema.index({ ruleId: 1, agentId: 1 });
