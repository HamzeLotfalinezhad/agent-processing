import { IsIn, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RuleOperator } from '../rule.schema';

export class CreateRuleDto {
  @IsString()
  name: string;
}
