import { Body, Controller, Post } from '@nestjs/common';
import {
  OOTDiffusionFullBodyParams,
  OOTDiffusionHalfBodyParams,
  OotdifussionService,
} from './ootdifussion.service';

@Controller('ootdifussion')
export class OotdifussionController {
  constructor(private readonly service: OotdifussionService) {}

  @Post('/half-body')
  public async runOOTDiffusionHalfBody(
    @Body() body: OOTDiffusionHalfBodyParams,
  ) {
    const result = await this.service.halfBody(body);
    return result;
  }

  @Post('/full-body')
  public async runOOTDiffusionFullBody(
    @Body() body: OOTDiffusionFullBodyParams,
  ) {
    const result = await this.service.fullBody(body);
    return result;
  }
}
