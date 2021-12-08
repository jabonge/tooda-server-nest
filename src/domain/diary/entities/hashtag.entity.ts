import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class HashTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  name: string;
}
