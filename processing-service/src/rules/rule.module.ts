import { Module } from '@nestjs/common';
import { Rule, RuleSchema } from './rule.schema';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';
import { DatabaseModule } from '../common/database';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Rule.name, schema: RuleSchema },
    ]),
  ],
  controllers: [RuleController],
  providers: [RuleService],
  exports: [RuleService],
})
export class RulesModule {}

