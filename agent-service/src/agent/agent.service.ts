import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

}
