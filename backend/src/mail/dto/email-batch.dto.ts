import { IsNotEmpty, IsNumber } from 'class-validator';
export class EmailBatch {
  @IsNotEmpty()
  @IsNumber()
  count: number;
}
