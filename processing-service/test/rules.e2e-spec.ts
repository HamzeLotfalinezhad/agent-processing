import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RuleController } from '../src/rules/rule.controller';
import { RuleService } from '../src/rules/rule.service';
import { ValidationPipe } from '@nestjs/common';

describe('RulesController (E2E)', () => {
    let app: INestApplication;

    const mockRuleService = {
        create: jest.fn().mockResolvedValue({ id: '1', name: 'rule-1' }),
        findAll: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
    };

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            controllers: [RuleController],
            providers: [
                {
                    provide: RuleService,
                    useValue: mockRuleService,
                },
                {
                    provide: 'RuleModel',
                    useValue: {},
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Enable validation globally
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,   // strip unknown properties
                forbidNonWhitelisted: true, // throw error on extra props
                transform: true,   // convert payloads to DTO instances
            }),
        );

        await app.init();
    });

    // no validation pipe
    //   beforeAll(async () => {
    //     const moduleFixture: TestingModule = await Test.createTestingModule({
    //       controllers: [RuleController],
    //       providers: [
    //         {
    //           provide: RuleService,
    //           useValue: mockRuleService,
    //         },
    //         // Mock the Mongoose model
    //         {
    //           provide: 'RuleModel',
    //           useValue: {}, // empty object is enough, service is mocked
    //         },
    //       ],
    //     }).compile();

    //     app = moduleFixture.createNestApplication();
    //     await app.init();
    //   });

    afterAll(async () => {
        await app.close();
    });

    // ----------------- create
    it('POST /rules', () =>
        request(app.getHttpServer())
            .post('/rules')
            .send({ name: 'rule-1', eventName: 'event-a', operator: '>', threshold: 10 })
            .expect(201));

    // create error
    it('POST /rules', () =>
        request(app.getHttpServer())
            .post('/rules')
            .send({ name: 'rule-1', eventName: 'event-a', operator: '>>>', threshold: 10 })
            .expect(400));

    // ----------------- GET
    it('GET /rules', () =>
        request(app.getHttpServer()).get('/rules').expect(200));


    it('PUT /rules/:id', () =>
        request(app.getHttpServer())
            .put('/rules/1')
            .send({ name: 'updated-rule' })
            .expect(200));


    it('DELETE /rules/:id', () =>
        request(app.getHttpServer()).delete('/rules/1').expect(200));
});
