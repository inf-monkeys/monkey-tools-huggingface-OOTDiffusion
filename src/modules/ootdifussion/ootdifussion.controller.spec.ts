import { Test, TestingModule } from '@nestjs/testing';
import { OotdifussionController } from './ootdifussion.controller';

describe('OotdifussionController', () => {
  let controller: OotdifussionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OotdifussionController],
    }).compile();

    controller = module.get<OotdifussionController>(OotdifussionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
