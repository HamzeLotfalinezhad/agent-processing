import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller('reports')
export class ReportController {
  constructor() {}

}
