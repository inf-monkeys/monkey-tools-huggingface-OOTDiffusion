import { Module } from '@nestjs/common';
import { OotdifussionController } from './ootdifussion.controller';
import { OotdifussionService } from './ootdifussion.service';

@Module({
  controllers: [OotdifussionController],
  providers: [OotdifussionService]
})
export class OotdifussionModule {}
