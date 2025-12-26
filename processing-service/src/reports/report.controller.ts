import { Controller, Get, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { GetRuleAgentReportDto } from './dto/get-rule-agent-report.dto';
import { GetRuleAgentsReportDto } from './dto/get-rule-agents-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly redisService: RedisService) { }

  /**
   * Report 1
   * Rule events timestamps for an agent (last X time)
   */
  @Get('rule/:ruleId/agent/:agentId')
  async getRuleEventsForAgent(
    @Param('ruleId') ruleId: string,
    @Param('agentId') agentId: string,
    @Query() query: GetRuleAgentReportDto,
  ) {
    const now = Date.now();
    const MAX_RANGE = 24 * 60 * 60 * 1000;

    let from = now - MAX_RANGE;
    let to = now;

    if (query.last) {
      const [, value, unit] = query.last.match(/^(\d+)(m|h|d)$/)!;

      const multiplier = {
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      }[unit];

      const range = Number(value) * multiplier!;
      from = now - Math.min(range, MAX_RANGE);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const key = `rule:${ruleId}:agent:${agentId}`;

    const total = await this.redisService.pub.zcount(key, from, to);

    const eventsRaw = await this.redisService.pub.zrangebyscore(
      key,
      from,
      to,
      'WITHSCORES',
      'LIMIT',
      offset,
      limit,
    );

    const events = [];
    for (let i = 0; i < eventsRaw.length; i += 2) {
      events.push({
        triggerId: eventsRaw[i],
        timestamp: Number(eventsRaw[i + 1]),
      });
    }

    return {
      ruleId,
      agentId,
      from,
      to,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      events,
    };
  }


  /**
   * Report 2
   * Agents sorted by rule trigger count
   */
  @Get('rule/:ruleId/agents')
  async getAgentsByRule(@Param('ruleId') ruleId: string, @Query() query: GetRuleAgentsReportDto) {

    const key = `rule:${ruleId}:agents`;
    const top = query.top ?? 10;

    const data = await this.redisService.pub.zrevrange(key, 0, top - 1, 'WITHSCORES');

    const agents = [];
    for (let i = 0; i < data.length; i += 2) {
      agents.push({
        agentId: data[i],
        count: Number(data[i + 1]),
      });
    }

    return { ruleId, agents };
  }
}

