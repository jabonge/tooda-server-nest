import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Diary } from './diary.entity';
@Entity()
export class DiaryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @ManyToOne(() => Diary, (diary) => diary.images, { onDelete: 'SET NULL' })
  diary: Diary;
}
