import { MonthlyDiaryMeta } from './../../user/entities/monthly_diary_meta.entity';
import { DiaryLink } from './diary_link.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DiaryImage } from './diary_image.entity';
import { DiaryStock } from './diary_stock.entity';
import { HashTag } from './hashtag.entity';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';

export enum Sticker {
  SAD = 'SAD',
  OMG = 'OMG',
  ANGRY = 'ANGRY',
  THINKING = 'THINKING',
  CHICKEN = 'CHICKEN',
  PENCIL = 'PENCIL',
}

@Entity()
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Sticker,
  })
  sticker: Sticker;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Column({ type: 'int', select: false })
  userId: number;

  @Exclude()
  @Column({ type: 'int', select: false })
  monthlyDiaryMetaId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => DiaryImage, (image) => image.diary, { cascade: ['insert'] })
  images: DiaryImage[];

  @OneToMany(() => DiaryStock, (stock) => stock.diary, { cascade: ['insert'] })
  stocks: DiaryStock[];

  @OneToMany(() => DiaryLink, (link) => link.diary, { cascade: ['insert'] })
  links: DiaryLink[];

  @ManyToOne(() => MonthlyDiaryMeta, (meta) => meta.diarys, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monthlyDiaryMetaId' })
  monthlyDiaryMeta: MonthlyDiaryMeta;

  @Exclude()
  @ManyToMany(() => HashTag, { cascade: ['insert'] })
  @JoinTable({
    name: 'diary_hashtag',
    joinColumn: {
      name: 'diaryId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'hashtagId',
      referencedColumnName: 'id',
    },
  })
  hashtags: HashTag[];
}
