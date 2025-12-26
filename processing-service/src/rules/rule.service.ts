import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rule, RuleDocument } from './rule.schema';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RuleService {
  private readonly ruleRedisExpire: number;

  constructor(
    @InjectModel(Rule.name)
    private readonly ruleModel: Model<RuleDocument>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.ruleRedisExpire = Number(
      this.configService.get('REDIS_RULE_EXPIRE', 600),
    );
  }

  async create(dto: CreateRuleDto) {
    const rule = await this.ruleModel.findOne({
      name: dto.name,
      eventName: dto.eventName,
      operator: dto.operator,
      threshold: dto.threshold,
    });

    if (rule) throw new BadRequestException('این قانون تکراری است');

    const created = await this.ruleModel.create(dto);

    // invalidate cache
    await this.redisService.pub.del(`rules:event:${dto.eventName}`);

    return created;
  }

  async update(id: string, dto: UpdateRuleDto) {
    const oldRule = await this.ruleModel.findById(id);
    if (!oldRule) return null;

    const updated = await this.ruleModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    // invalidate old & new event cache
    await this.redisService.pub.del(`rules:event:${oldRule.eventName}`);
    if (dto.eventName && dto.eventName !== oldRule.eventName) {
      await this.redisService.pub.del(`rules:event:${dto.eventName}`);
    }

    return updated;
  }

  async remove(id: string) {
    const rule = await this.ruleModel.findById(id);
    if (!rule) return null;

    const removed = await this.ruleModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    // invalidate cache
    await this.redisService.pub.del(`rules:event:${rule.eventName}`);

    return removed;
  }

  async findAll(page = 1, limit = 10) {
    return this.ruleModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async findByEventName(eventName: string) {
    const { pub } = this.redisService;
    const cacheKey = `rules:event:${eventName}`;

    // 1️ try redis
    const cached = await pub.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2️ fallback to mongo
    const rules = await this.ruleModel.find({
      eventName,
      isActive: true,
    }).lean();

    // 3️ save to redis (TTL)
    await pub.set(cacheKey, JSON.stringify(rules), 'EX', this.ruleRedisExpire);

    return rules;
  }
}

