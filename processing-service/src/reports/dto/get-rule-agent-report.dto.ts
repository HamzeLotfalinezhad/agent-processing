import { IsOptional, IsInt, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRuleAgentReportDto {
  @IsOptional()
  @Matches(/^\d+(m|h|d)$/)
  last?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
