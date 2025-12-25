import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rule, RuleDocument } from './rule.schema';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RuleService {
  constructor(
    @InjectModel(Rule.name)
    private readonly ruleModel: Model<RuleDocument>,
  ) {}

  async create(dto: CreateRuleDto) {
    return this.ruleModel.create(dto);
  }

  async update(id: string, dto: UpdateRuleDto) {
    return this.ruleModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
  }

}

