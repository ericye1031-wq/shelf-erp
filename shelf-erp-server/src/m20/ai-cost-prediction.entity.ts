import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('ai_cost_predictions')
export class AiCostPrediction {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', name: 'material_code', length: 50 })
  materialCode: string;

  @Column({ type: 'text', name: 'material_name', length: 200, nullable: true })
  materialName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'historical_avg_price', default: 0 })
  historicalAvgPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'predicted_price_3m', default: 0 })
  predictedPrice3m: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'predicted_price_6m', default: 0 })
  predictedPrice6m: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'confidence_lower', default: 0 })
  confidenceLower: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'confidence_upper', default: 0 })
  confidenceUpper: number;

  @Column({ type: 'simple-json', nullable: true })
  trend: Record<string, any> | null;

  @CreateDateColumn({ name: 'predicted_at' })
  predictedAt: Date;
}
