import { IsIn, IsNumber, IsString, Max, Min, min } from 'class-validator';
import { Type } from 'class-transformer';
import { RuleOperator } from '../rule.schema';

export class CreateRuleDto {
  @IsString()
  name: string;

  @IsString()
  eventName: string;

  @IsIn(['>', '<', '=', '>=', '<='])
  operator: RuleOperator;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(150)
  threshold: number;
}
