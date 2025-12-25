import { Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { ReportsController } from "./report.controller";

@Module({
    imports: [RedisModule],
    controllers: [ReportsController],
  })
  export class ReportsModule {}
  