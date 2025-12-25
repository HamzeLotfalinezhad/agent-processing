import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RuleOperator = '>' | '<' | '=' | '>=' | '<=';

@Schema({ timestamps: true })
export class Rule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  eventName: string;

  @Prop({ enum: ['>', '<', '=', '>=', '<='], required: true })
  operator: string;

  @Prop({ required: true })
  threshold: number;

  @Prop({ default: true })
  isActive: boolean;
}

export type RuleDocument = Rule & Document;

export const RuleSchema = SchemaFactory.createForClass(Rule);

RuleSchema.index({ eventName: 1 });
