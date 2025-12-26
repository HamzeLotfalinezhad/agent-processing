# Agent & Processing Service

A robust event-driven system using Kafka, NestJS, MongoDB, and Redis, designed for high-throughput IoT/agent data ingestion with crash-safe buffering, idempotency, and rule-based processing.

---

## Features

### Agent Service
- Periodically generates events from agents with fakerjs (agentId, name, value, timestamp).
- Kafka producer with **circuit breaker** and **buffering** when Kafka is down.
- Crash-safe buffer ready to flush on Kafka recovery.
- Each agent can run on a separate port with a unique agentId.
- Health endpoint

### Processing Service
- Kafka consumer with **manual offset commit** and **idempotency** with Redis.
- Rule engine:
  - Save events in MongoDB.
  - Match rules and store triggers in Redis and Mongo.
  - Generate reports based on events (per agent, per rule).
- Dead-letter queue (DLQ) for business failures.
- Handles infrastructure failures (Mongo, Redis, Kafka) with automatic retries.
- RuleService → Redis + Mongo fallback for better performance

### Infrastructure & Reliability
- Idempotency with Redis to prevent duplicate processing.
- Kafka DLQ for failed business events.
- Circuit breaker pattern for Kafka producer in Agent Service.
- Supports multiple agents and scaling.
- Supports pagination for reports via Redis or MongoDB.

---

## Installation

### Prerequisites
- Node.js >= 18
- NestJS CLI
- Kafka cluster (localhost:9092 for dev)
- Redis / Redis-stack
- MongoDB

### Environment Variables

#### Agent Service `.env`
```env
PORT=4100
KAFKA_BROKERS=localhost:9092
AGENT_ID=agent-100
```
### Run in dev mode
``` bash
cd processing-service
npm run start:dev

cd agent-service
npm run start:dev
```

### Run with docker-compose
agent and processing service creation depends on healthy kafka
``` bash
cd volumes
docker-compose up -d
```

### Test API
Sample enpoint in agent.rest file
