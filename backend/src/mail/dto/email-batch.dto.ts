import { IsNotEmpty } from 'class-validator';
export class EmailBatch {
  @IsNotEmpty()
  count: number;
}
