import { Test, TestingModule } from '@nestjs/testing';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

describe('RuleController', () => {
  let controller: RuleController;
  let service: RuleService;

  const mockRuleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuleController],
      providers: [
        {
          provide: RuleService,
          useValue: mockRuleService,
        },
      ],
    }).compile();

    controller = module.get<RuleController>(RuleController);
    service = module.get<RuleService>(RuleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // -------- CREATE --------
  describe('create', () => {
    it('should call ruleService.create with dto', () => {
      const dto: CreateRuleDto = {
        name: 'test-rule',
        condition: 'x > 5',
      } as unknown as CreateRuleDto;

      mockRuleService.create.mockReturnValue(dto);

      const result = controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });

  // -------- FIND ALL --------
  describe('findAll', () => {
    it('should call ruleService.findAll with default pagination', () => {
      const response = {
        data: [],
        page: 1,
        limit: 10,
      };

      mockRuleService.findAll.mockReturnValue(response);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(response);
    });

    it('should call ruleService.findAll with provided pagination', () => {
      mockRuleService.findAll.mockReturnValue([]);

      controller.findAll(2, 5);

      expect(service.findAll).toHaveBeenCalledWith(2, 5);
    });
  });

  // -------- UPDATE --------
  describe('update', () => {
    it('should call ruleService.update with id and dto', () => {
      const id = '123';
      const dto: UpdateRuleDto = {
        name: 'updated-rule',
      } as UpdateRuleDto;

      mockRuleService.update.mockReturnValue({ id, ...dto });

      const result = controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({ id, ...dto });
    });
  });

  // -------- REMOVE --------
  describe('remove', () => {
    it('should call ruleService.remove with id', () => {
      const id = '123';

      mockRuleService.remove.mockReturnValue({ deleted: true });

      const result = controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ deleted: true });
    });
  });
});
