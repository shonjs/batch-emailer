import { Body, Controller, Post, Get, Sse } from '@nestjs/common';
import { EmailBatch } from './dto/email-batch.dto';
import { MailService } from './mail.service';
import { Observable } from 'rxjs';
import { EmailBatchEntity } from './entities/email-batch.entity';

@Controller()
export class MailController {
  lastEventTime: Date;
  constructor(private readonly mailService: MailService) {}

  // send a set of emails
  @Post('/email-job')
  async sendEmail(@Body() emailBatch: EmailBatch): Promise<number> {
    console.log('received', emailBatch);
    return await this.mailService.scheduleEmail(emailBatch);
  }

  // get existing records of email jobs
  @Get('/email-job')
  async getEmailJobs(): Promise<EmailBatchEntity[]> {
    return await this.mailService.getEmailJobs();
  }

  // register for server sent events about updates on email jobs
  @Sse('/email-job-update')
  emailJobUpdates(): Observable<MessageEvent> {
    return this.mailService.getEmailJobStatusEventMessage();
  }
}
