import { Injectable, NotFoundException } from '@nestjs/common';
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

  async remove(id: string) {
    return this.ruleModel.findByIdAndUpdate(
      id,
      { isActive: false },
    );
  }

  async findAll(page = 1, limit = 10) {
    return this.ruleModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findByEventName(eventName: string) {
    return this.ruleModel.find({
      eventName,
      isActive: true,
    });
  }
}

