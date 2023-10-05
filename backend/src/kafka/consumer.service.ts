import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  Consumer,
  ConsumerSubscribeTopic,
  ConsumerRunConfig,
  Kafka,
} from 'kafkajs';

// Consumer service that can be used to spin up kafka consumers that listens to topics
@Injectable()
export class ConsumerService implements OnModuleDestroy {
  private readonly kafka = new Kafka({
    brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  });
  private readonly consumers: Consumer[] = [];

  async onModuleDestroy() {
    this.consumers.forEach((consumer) => consumer.disconnect());
  }

  async consume(
    topic: ConsumerSubscribeTopic,
    config: ConsumerRunConfig,
    group: string = 'mail-consumer',
  ) {
    const consumer = this.kafka.consumer({ groupId: group });
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer);
  }
}
