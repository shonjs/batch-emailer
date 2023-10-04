import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { EmailProducerService } from './queue/email-producer';
import { EmailConsumerService } from './queue/email-consumer';
import { EmailBatchEntity } from './entities/email-batch.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailBatchEntity]), KafkaModule],
  controllers: [MailController],
  providers: [MailService, EmailProducerService, EmailConsumerService],
  exports: [EmailProducerService, EmailConsumerService],
})
export class MailModule {}
