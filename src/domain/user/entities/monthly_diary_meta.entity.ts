import { Expose, Exclude } from 'class-transformer';
import { Diary } from '../../diary/entities/diary.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MonthlyDiaryMeta extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unsigned: true,
  })
  year: number;

  @Column({
    unsigned: true,
  })
  month: number;

  @Column({
    unsigned: true,
    default: 0,
  })
  totalCount: number;

  @Column({ type: 'int', select: false })
  userId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Exclude()
  @OneToMany(() => Diary, (diary) => diary.monthlyDiaryMeta)
  diarys: Diary[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Expose({ name: 'stickers' })
  toStickers() {
    const stickers = [];
    this.diarys?.forEach((d) => {
      stickers.push(d.sticker);
    });
    return stickers;
  }
}
