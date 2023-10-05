import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProducerService } from 'src/kafka/producer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailBatchEntity } from '../entities/email-batch.entity';
import { UpdateResult } from 'typeorm';
import { MailService } from '../mail.service';

@Injectable()
export class EmailProducerService {
  private batchSize;

  constructor(
    private readonly producerService: ProducerService,
    private readonly emailService: MailService,
    @InjectRepository(EmailBatchEntity)
    private emailJob: Repository<EmailBatchEntity>,
  ) {
    this.batchSize = process.env.BATCH_SIZE;
  }

  /**
   * Checks every 5 seconds for emails to send out.
   * Marks them as scheduled and adds it to the queue if any
   * Throttle by batch size
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    console.log('app is listening....');
    const pendingEmailJobs: EmailBatchEntity[] =
      await this.getPendingEmailJobs();
    if (!pendingEmailJobs.length) return;

    let totalScheduled = 0;
    for (const message of pendingEmailJobs) {
      totalScheduled = await this.scheduleEmailBatch(message, totalScheduled);
      if (totalScheduled >= this.batchSize) {
        break;
      }
    }
  }

  // Schedule email batches with maximum specified batch size
  async scheduleEmailBatch(
    message: EmailBatchEntity,
    totalScheduled: number,
  ): Promise<number> {
    const batch = [];
    const start = message.scheduled + 1;
    const endId = message.total;

    for (let i = start; i <= endId && totalScheduled < this.batchSize; ++i) {
      batch.push(this.toMessage(message.id, i));
      ++totalScheduled;
    }
    if (batch.length > 0) {
      if (await this.incrementScheduledCount(message.id, batch.length)) {
        this.scheduleEmail(batch, batch.length);
      }
    }
    return totalScheduled;
  }

  // Get email jobs that are not completed
  async getPendingEmailJobs(): Promise<EmailBatchEntity[]> {
    return await this.emailJob
      .createQueryBuilder()
      .select('EmailBatch')
      .from(EmailBatchEntity, 'EmailBatch')
      .where('EmailBatch.isCompleted = :val', { val: false })
      .andWhere('EmailBatch.scheduled < EmailBatch.total')
      .orderBy('EmailBatch.createdAt', 'ASC')
      .getMany();
  }

  scheduleEmail(emails: any, count: number) {
    this.emailService.queueEmail(emails, count);
  }

  // Increment the already picked up email counts not to be retried
  private async incrementScheduledCount(
    jobId: number,
    count: number,
  ): Promise<boolean> {
    try {
      const updated: UpdateResult = await this.emailJob.increment(
        { id: jobId },
        'scheduled',
        count,
      );
      if (updated.affected == 1) {
        return true;
      }
    } catch (e) {
      console.log('Error on incrementing scheduled count', e);
    }
    return false;
  }

  // Add in the actual details to be added.
  // In a real scenario, this might come from a database or some other service
  toMessage(jobId: number, mailId: number) {
    return {
      value: JSON.stringify({
        jobId: jobId,
        mailId: mailId,
        to: 'no@email.com',
        from: 'from@email.com',
        text: 'sample text',
        html: '<html></html>',
      }),
    };
  }
}
