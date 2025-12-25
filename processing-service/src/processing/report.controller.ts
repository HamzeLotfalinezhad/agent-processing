import { Controller, Get, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly redisService: RedisService) { }

  /**
   * Report 1
   * Get all event timestamps for a rule for an agent in a time range
   */
  @Get('rule/:ruleId/agent/:agentId')
  async getRuleEventsForAgent(
    @Param('ruleId') ruleId: string,
    @Param('agentId') agentId: string,
    @Query('from') fromTimestamp: string,
    @Query('to') toTimestamp: string,
  ) {
    const from = fromTimestamp ? parseInt(fromTimestamp, 10) : 0;
    const to = toTimestamp ? parseInt(toTimestamp, 10) : Date.now();

    // checking time range
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (to - from > ONE_DAY_MS) {
      throw new BadRequestException('بازه زمانی باید 24 ساعت باشد');
    }

    const key = `rule:${ruleId}:agent:${agentId}`;
    // const events = await this.redisService.pub.zrangebyscore(key, from, to);
    const events = await this.redisService.pub.zrangebyscore(key, from, to, 'WITHSCORES');

    // only return timestamps
    const timestamps: number[] = [];
    for (let i = 1; i < events.length; i += 2) {
      timestamps.push(Number(events[i]));
    }

    return { agentId, ruleId, timestamps: timestamps };
  }

  /**
   * Report 2
   * Get agents sorted by number of rule triggers
   */
  @Get('rule/:ruleId/agents')
  async getAgentsByRule(
    @Param('ruleId') ruleId: string,
    @Query('top', ParseIntPipe) top = 10,
  ) {
    const key = `rule:${ruleId}:agents`;

    // Get top agents by count descending
    const agents = await this.redisService.pub.zrevrange(key, 0, top - 1, 'WITHSCORES');

    // Convert array ["agentId1","score1","agentId2","score2"] => [{agentId, count}]
    const result = [];
    for (let i = 0; i < agents.length; i += 2) {
      result.push({ agentId: agents[i], count: parseInt(agents[i + 1], 10) });
    }

    return { ruleId, agents: result };
  }
}
