import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('currencies')
export class Currency {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 10, unique: true })
  code: string;

  @Column({ type: 'text', length: 50 })
  name: string;

  @Column({ type: 'text', length: 10, nullable: true })
  symbol: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  rate: number;
}
