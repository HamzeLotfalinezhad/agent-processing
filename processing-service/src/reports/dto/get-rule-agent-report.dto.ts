import { IsOptional, IsString, Matches } from 'class-validator';

export class GetRuleAgentReportDto {
  @IsOptional()
  @IsString()
  @Matches(/^(\d+)(m|h|d)$/, {
    message: 'last باید به صورت 30m، 6h یا 1d باشد',
  })
  last?: string;
}
