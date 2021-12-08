import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Diary } from './diary.entity';
@Entity()
export class DiaryLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ogSiteName: string;

  @Column({ nullable: true })
  ogImage: string;

  @Column({ nullable: true })
  ogTitle: string;

  @Column({ nullable: true })
  ogDescription: string;

  @Column()
  ogUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => Diary, (diary) => diary.links, { onDelete: 'CASCADE' })
  @JoinColumn()
  diary: Diary;
}
