import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('ai_quotations')
export class AiQuotation {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'inquiry_id', type: 'uuid' })
  inquiryId: string;

  @Column({ type: 'text', name: 'shelf_type', length: 100, nullable: true })
  shelfType: string;

  @Column({ type: 'simple-json', nullable: true })
  specs: Record<string, any> | null;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'text', length: 50, nullable: true })
  region: string;

  @Column({ type: 'text', name: 'customer_level', length: 20, nullable: true })
  customerLevel: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'market_steel_price', nullable: true })
  marketSteelPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'predicted_price_low' })
  predictedPriceLow: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'predicted_price_high' })
  predictedPriceHigh: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  confidence: number;

  @Column({ type: 'text', length: 50, nullable: true })
  model: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
