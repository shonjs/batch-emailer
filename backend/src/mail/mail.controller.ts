import { Body, Controller, Post } from '@nestjs/common';
import { EmailBatch } from './dto/email-batch.dto';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // API to post an email job
  @Post('/email-job')
  async sendEmail(@Body() emailBatch: EmailBatch): Promise<number> {
    console.log('received');
    return await this.mailService.scheduleEmail(emailBatch);
  }
}
