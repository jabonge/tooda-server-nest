import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Diary } from './diary.entity';

export enum ChangeType {
  RISE = 'RISE',
  EVEN = 'EVEN',
  FALL = 'FALL',
}

@Entity()
export class DiaryStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column()
  changeRate: number;

  @Column({
    type: 'enum',
    enum: ChangeType,
  })
  change: ChangeType;

  @ManyToOne(() => Diary, (diary) => diary.stocks, { onDelete: 'CASCADE' })
  diary: Diary;
}
