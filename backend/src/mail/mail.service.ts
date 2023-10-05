import { HttpException, Injectable } from '@nestjs/common';
import { EmailBatch } from './dto/email-batch.dto';
import { EmailBatchEntity } from './entities/email-batch.entity';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProducerService } from 'src/kafka/producer.service';
import { Observable, interval, map, switchMap } from 'rxjs';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
@Injectable()
export class MailService {
  private transporter;
  constructor(
    private readonly producerService: ProducerService,
    @InjectRepository(EmailBatchEntity)
    private emailBatchRepository: Repository<EmailBatchEntity>,
  ) {
    this.transporter = nodemailer.createTransport(
      smtpTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      }),
    );
  }
  // Add the new email sending details to the DB to be picked by the cron job
  async scheduleEmail(newEmailBatch: EmailBatch): Promise<number> {
    // Save the email job in db and return the id
    const emailBatch: EmailBatchEntity = new EmailBatchEntity();
    emailBatch.total = newEmailBatch.count;
    try {
      const savedRecord: EmailBatchEntity =
        await this.emailBatchRepository.save(emailBatch);
      return savedRecord.id;
    } catch (e) {
      console.log('Error on saving email job : ', e);
      throw new HttpException('Error on saving email', 500);
    }
  }

  // add email messages to kafka topics to be sent
  queueEmail(emails: any, count: number) {
    console.log('scheduling ', count, ' emails');
    this.producerService.produce({
      topic: process.env.MAIN_TOPIC,
      messages: emails,
    });
  }

  // Get the email jobs list
  async getEmailJobs() {
    return await this.emailBatchRepository.find({
      select: { id: true, total: true, completed: true },
      // where: { ...(lastEventTime && { modifiedAt: MoreThan(lastEventTime) }) },
      order: { createdAt: 'DESC' },
    });
  }

  // Observable to sent the event updates every second
  getEmailJobStatusEventMessage(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(async () => await this.getEmailJobs()),
      map((d) => new MessageEvent('message', { data: d })),
    );
  }

  // Method to send the mail using given configurationd
  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<boolean> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      html,
    };

    try {
      //await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log(`Error sending email: ${error.message}`);
      return false;
    }
  }
}
