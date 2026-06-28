import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/** 结构模板节点 */
export interface StructureNode {
  partCode: string;
  partName: string;
  material?: string;
  quantityFormula: string;
  lengthFormula?: string;
  unit?: string;
  wasteRate?: number;
  children?: StructureNode[];
}

@Entity('specifications')
export class Specification {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'shelf_type_id', type: 'uuid' })
  shelfTypeId: string;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ name: 'parameter_constraints', type: 'json', nullable: true })
  parameterConstraints: Record<string, { min?: number; max?: number }>;

  @Column({ name: 'structure_template', type: 'json', nullable: true })
  structureTemplate: StructureNode[];

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
