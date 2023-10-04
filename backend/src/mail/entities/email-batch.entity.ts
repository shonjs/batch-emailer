import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Email_Batch')
export class EmailBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;

  @Column({ default: 0 })
  scheduled: number;

  @Column({ default: 0 })
  completed: number;

  @Column({ default: false })
  isCompleted: boolean;
}
