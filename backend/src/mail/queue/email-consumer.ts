import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailBatchEntity } from '../entities/email-batch.entity';
import { Repository, UpdateResult } from 'typeorm';
import { EmailMessage } from '../types';
@Injectable()
export class EmailConsumerService implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    @InjectRepository(EmailBatchEntity)
    private emailBatch: Repository<EmailBatchEntity>,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      { topic: process.env.MAIN_TOPIC },
      {
        eachMessage: async (data) => {
          console.log(
            'received data at maillist ',
            data.partition,
            data.message.value.toString(),
          );
          const isDataPresent = data && data.message && data.message.value;
          if (isDataPresent) {
            const message: EmailMessage = JSON.parse(
              data.message.value.toString(),
            );

            // SEND EMAIL
            if (this.incrementCompletedCount(message.jobId, 1)) {
              this.checkAndSetJobStatus(message.jobId);
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
      const updated: UpdateResult = await this.emailBatch.increment(
        { id: jobId },
        'completed',
        count,
      );
      if (updated.affected == 1) {
        return true;
      }
    } catch (e) {
      console.log('Error on incrementing completed count', e);
    }
    return false;
  }

  private async checkAndSetJobStatus(jobId: number) {
    const res = await this.emailBatch.findOne({
      where: {
        id: jobId,
      },
    });
    if (res.total <= res.completed) {
      const markedRecord: UpdateResult = await this.emailBatch.update(res.id, {
        isCompleted: true,
      });
      if (markedRecord.affected != 1) {
        console.log('Unable to mark job as completed ');
      }
    }
  }
}
