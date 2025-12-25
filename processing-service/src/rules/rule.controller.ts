import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { UpdateRuleDto } from "./dto/update-rule.dto";
import { RuleService } from "./rule.service";

@Controller('rules')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Post()
  create(@Body() dto: CreateRuleDto) {
    return this.ruleService.create(dto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.ruleService.findAll(+page, +limit);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.ruleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ruleService.remove(id);
  }
}