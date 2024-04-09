import { Test, TestingModule } from '@nestjs/testing';
import { OotdifussionService } from './ootdifussion.service';

describe('OotdifussionService', () => {
  let service: OotdifussionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OotdifussionService],
    }).compile();

    service = module.get<OotdifussionService>(OotdifussionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
