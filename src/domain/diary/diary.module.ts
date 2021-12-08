import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diary } from './entities/diary.entity';
import { MonthlyDiaryMeta } from '../user/entities/monthly_diary_meta.entity';
import { HashTag } from './entities/hashtag.entity';
import { ConfigService } from '@nestjs/config';
import { UploadService } from '../../lib/multer/multer_s3.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: UploadService,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Diary, MonthlyDiaryMeta, HashTag]),
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}
