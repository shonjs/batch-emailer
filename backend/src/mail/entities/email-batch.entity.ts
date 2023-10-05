import { Entity, Column, PrimaryGeneratedColumn, AfterUpdate } from 'typeorm';

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

  @Column({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: string;

  @Column({
    nullable: false,
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  modifiedAt: Date;

  @AfterUpdate()
  updateModifiedAt() {
    this.modifiedAt = new Date();
  }
}
