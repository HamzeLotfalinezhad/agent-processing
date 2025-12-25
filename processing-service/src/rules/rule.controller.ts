import { Body, Controller, Post } from "@nestjs/common";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { RuleService } from "./rule.service";

@Controller('rules')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Post()
  create(@Body() dto: CreateRuleDto) {
    return this.ruleService.create(dto);
  }

}
