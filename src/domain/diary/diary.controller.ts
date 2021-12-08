import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../infra/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { User } from '../user/entities/user.entity';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';

@Controller('diary')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createDiaryDto: CreateDiaryDto) {
    return this.diaryService.create(user.id, createDiaryDto);
  }

  @Post('image')
  @UseInterceptors(FilesInterceptor('files'))
  saveImages(@UploadedFiles() files: Express.MulterS3.File[]) {
    return files.map((f) => f.location);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('limit') limit: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.diaryService.findAll(user.id, +limit, +cursor);
  }

  @Get('date')
  findAllByDate(
    @CurrentUser() user: User,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('limit') limit: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.diaryService.findAllByDate(
      user.id,
      +year,
      +month,
      +limit,
      +cursor,
    );
  }

  @Get('search')
  search(
    @CurrentUser() user: User,
    @Query('q') q: string,
    @Query('limit') limit: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.diaryService.search(user.id, q, +limit, +cursor);
  }

  @Get(':year/metas')
  findMonthlyDiaryMetas(
    @CurrentUser() user: User,
    @Param('year') year: string,
  ) {
    return this.diaryService.findMonthlyDiaryMetas(user.id, +year);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.diaryService.remove(user.id, +id);
  }
}
