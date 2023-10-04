import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka = new Kafka({
    brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  });
  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    this.producer.connect();
  }

  async onModuleDestroy() {
    this.producer.disconnect();
  }

  async produce(record: ProducerRecord) {
    this.producer.send(record);
  }
}
