import { HttpException, Injectable } from '@nestjs/common';
import { EmailBatch } from './dto/email-batch.dto';
import { EmailBatchEntity } from './entities/email-batch.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProducerService } from 'src/kafka/producer.service';
@Injectable()
export class MailService {
  constructor(
    private readonly producerService: ProducerService,
    @InjectRepository(EmailBatchEntity)
    private emailBatchRepository: Repository<EmailBatchEntity>,
  ) {}
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

  queueEmail(emails: any, count: number) {
    console.log('scheduling ', count, ' emails');
    this.producerService.produce({
      topic: process.env.MAIN_TOPIC,
      messages: emails,
    });
  }
}
