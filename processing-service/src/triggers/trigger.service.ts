import { Injectable } from '@nestjs/common';
import { EventDocument } from '../events/event.schema';
import { RuleService } from '../rules/rule.service';
import { InjectModel } from '@nestjs/mongoose';
import { RuleTrigger, RuleTriggerDocument, RuleTriggerSchema } from './trigger.schema';
import { Model } from 'mongoose';
import { RedisService } from '../redis/redis.service';


/**
 * using redis for reports
 * report 1: rule creation time for each agent
 * rule:{ruleId}:agent:{agentId} → Sorted Set with timestamp
 * 
 * report 2: agents list sorted based on rule creation
 * rule:{ruleId}:agents → Sorted Set with score = events numbers count 
 * 
 */

@Injectable()
export class TriggerService {
  constructor(
    private readonly ruleService: RuleService,
    @InjectModel(RuleTrigger.name)
    private readonly triggerModel: Model<RuleTriggerDocument>,
    private readonly redisService: RedisService,
  ) {}

  async match(event: EventDocument) {
    const rules = await this.ruleService.findByEventName(event.name);

    const triggers = rules
      .filter(rule => this.matchValue(event.value, rule.operator, rule.threshold))
      .map(rule => ({
        ruleId: rule._id,
        agentId: event.agentId,
        eventId: event._id,
        triggeredAt: new Date(),
      }));

    if (triggers.length === 0) return;

    // 1️ save in Mongo
    await this.triggerModel.insertMany(triggers);

    // 2️ save in Redis
    const { pub } = this.redisService;

    for (const t of triggers) {
      // Report #1: sorted set with timestamp
      await pub.zadd(
        `rule:${t.ruleId}:agent:${t.agentId}`,
        t.triggeredAt.getTime(),
        t.eventId.toString(),
      );

      // Report #2: counting event accurance 
      await pub.zincrby(`rule:${t.ruleId}:agents`, 1, t.agentId);
    }
  }

  private matchValue(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '=': return value === threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      default: return false;
    }
  }
}

// @Injectable()
// export class TriggerService {
//   constructor(
//     private readonly ruleService: RuleService,
//     @InjectModel(RuleTrigger.name)
//     private readonly triggerModel: Model<RuleTriggerDocument>,
//   ) {}

//   async match(event: EventDocument) {
//     // 1️⃣ دریافت ruleهای مرتبط
//     const rules = await this.ruleService.findByEventName(event.name);

//     // 2️⃣ تطبیق
//     const triggers = rules
//       .filter(rule => this.matchValue(event.value, rule.operator, rule.threshold))
//       .map(rule => ({
//         ruleId: rule._id,
//         agentId: event.agentId,
//         eventId: event._id,
//         triggeredAt: new Date(),
//       }));

//     // 3️⃣ ذخیره در Mongo
//     if (triggers.length > 0) {
//       await this.triggerModel.insertMany(triggers);
//     }

//     // 4️⃣ آپدیت Redis (برای گزارش سریع) → بعداً اضافه می‌کنیم
//   }

//   private matchValue(value: number, operator: string, threshold: number): boolean {
//     switch (operator) {
//       case '>': return value > threshold;
//       case '<': return value < threshold;
//       case '=': return value === threshold;
//       case '>=': return value >= threshold;
//       case '<=': return value <= threshold;
//       default: return false;
//     }
//   }
// }
