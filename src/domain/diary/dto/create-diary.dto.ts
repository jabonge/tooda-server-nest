import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Sticker } from '../entities/diary.entity';
import { ChangeType } from '../entities/diary_stock.entity';
export class CreateDiaryDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsEnum(Sticker)
  sticker?: Sticker;
  @IsOptional()
  links?: string[];
  @IsOptional()
  stocks?: DiaryStockDto[];
  @IsOptional()
  images?: string[];
}

export class DiaryStockDto {
  @IsNotEmpty()
  name: string;
  @IsInt()
  changeRate: number;
  @IsEnum(ChangeType)
  change: ChangeType;
}
