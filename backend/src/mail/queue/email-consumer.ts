import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailBatchEntity } from '../entities/email-batch.entity';
import { Repository, UpdateResult } from 'typeorm';
import { EmailMessage } from '../types';
import { MailService } from '../mail.service';
@Injectable()
export class EmailConsumerService implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    @InjectRepository(EmailBatchEntity)
    private emailBatch: Repository<EmailBatchEntity>,
    private readonly mailService: MailService,
  ) {}

  // Load the consumer on module init
  async onModuleInit() {
    await this.consumerService.consume(
      { topic: process.env.MAIN_TOPIC },
      {
        eachMessage: async (data) => {
          const isDataPresent = data && data.message && data.message.value;
          if (isDataPresent) {
            const message: EmailMessage = JSON.parse(
              data.message.value.toString(),
            );

            const isSent: boolean = await this.mailService.sendMail(
              message.to,
              message.subject,
              message.text,
              message.html,
            );
            if (isSent && this.incrementCompletedCount(message.jobId, 1)) {
              this.checkAndSetJobStatus(message.jobId);
            } else {
              // Implement retry mechanism here. For example, a retry topic
              // Currently just logging only
              console.log(`Failed to send email for job : ${message.jobId}`);
            }
          }
        },
      },
    );
  }

  /**
   * Update the completed count on the DB
   */
  private async incrementCompletedCount(
    jobId: number,
    count: number,
  ): Promise<boolean> {
    try {
      const result = await this.emailBatch.findOne({
        where: {
          id: jobId,
        },
      });
      if (result) {
        let updated: UpdateResult = await this.emailBatch.increment(
          { id: jobId },
          'completed',
          count,
        );
        updated = await this.emailBatch.update(
          {
            id: jobId,
          },
          { modifiedAt: new Date() },
        );
        if (updated && updated.affected == 1) {
          return true;
        }
      }
    } catch (e) {
      console.log('Error on incrementing completed count', e);
    }
    return false;
  }

  private async checkAndSetJobStatus(jobId: number) {
    const result = await this.emailBatch.findOne({
      where: {
        id: jobId,
      },
    });
    if (result && result.total <= result.completed) {
      const markedRecord: UpdateResult = await this.emailBatch.update(
        result.id,
        {
          isCompleted: true,
        },
      );
      if (markedRecord.affected != 1) {
        console.log('Unable to mark job as completed ');
      }
    }
  }
}
