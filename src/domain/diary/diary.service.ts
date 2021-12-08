import { CreateDiaryDto } from './dto/create-diary.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addHours, getMonth, getYear, startOfMonth } from 'date-fns';
import { Connection, In, Repository } from 'typeorm';
import { MonthlyDiaryMeta } from '../user/entities/monthly_diary_meta.entity';
import { Diary } from './entities/diary.entity';
import { DiaryLink } from './entities/diary_link.entity';
import { DiaryStock } from './entities/diary_stock.entity';
import { DiaryImage } from './entities/diary_image.entity';
import { HashTag } from './entities/hashtag.entity';
import { plainToClass } from 'class-transformer';
import { findHashTags, getOgTags, ogMeta } from '../../utils';

@Injectable()
export class DiaryService {
  constructor(
    private connection: Connection,
    @InjectRepository(Diary)
    private readonly diaryRepository: Repository<Diary>,
    @InjectRepository(MonthlyDiaryMeta)
    private readonly monthlyDiaryMetaRepository: Repository<MonthlyDiaryMeta>,
    @InjectRepository(HashTag)
    private readonly hashtagRepository: Repository<HashTag>,
  ) {}

  async remove(userId: number, id: number) {
    const diary = await this.diaryRepository.findOneOrFail({
      where: {
        id,
        userId,
      },
      relations: ['monthlyDiaryMeta'],
    });

    await this.connection.transaction(async (manager) => {
      if (diary.monthlyDiaryMeta.totalCount <= 1) {
        await manager.delete(Diary, id);
        await manager.delete(MonthlyDiaryMeta, diary.monthlyDiaryMeta.id);
      } else {
        await manager.delete(Diary, id);
        await manager.decrement(
          MonthlyDiaryMeta,
          {
            id: diary.monthlyDiaryMeta.id,
          },
          'totalCount',
          1,
        );
      }
    });
    return;
  }

  async create(userId: number, createDiaryDto: CreateDiaryDto) {
    const hashtags = findHashTags(createDiaryDto.content);
    const dtoClass = plainToClass(CreateDiaryDto, createDiaryDto);
    const stocks = dtoClass.stocks;
    const links = dtoClass.links;

    let diaryHashTags: HashTag[];
    const diaryLinks: DiaryLink[] = [];
    const diaryStocks: DiaryStock[] = [];
    const diaryImages: DiaryImage[] = [];
    if (dtoClass.images?.length > 0) {
      dtoClass.images.forEach((i) => {
        const img = new DiaryImage();
        img.image = i;
        diaryImages.push(img);
      });
    }
    if (stocks && stocks.length > 0) {
      stocks.forEach((s) => {
        const stock = new DiaryStock();
        stock.name = s.name;
        stock.changeRate = s.changeRate;
        stock.change = s.change;
        diaryStocks.push(stock);
      });
    }
    if (hashtags) {
      const tags = [];
      hashtags.forEach((h) => {
        const hashtag = new HashTag();
        hashtag.name = h;
        tags.push(hashtag);
      });
      await this.hashtagRepository
        .createQueryBuilder('h')
        .insert()
        .into(HashTag)
        .values(tags)
        .orIgnore()
        .execute();

      diaryHashTags = await this.hashtagRepository.find({
        where: {
          name: In(hashtags),
        },
      });
    }
    if (links && links.length > 0) {
      const promise = [];
      links.forEach((l) => {
        promise.push(getOgTags(l));
      });
      const result: ogMeta[] = await Promise.all(promise);
      const nonNullResult = result.filter((l) => l !== null);
      nonNullResult.forEach((l) => {
        const link = new DiaryLink();
        link.ogUrl = l.ogUrl;
        link.ogImage = l.ogImage;
        link.ogTitle = l.ogTitle;
        link.ogDescription = l.ogDescription;
        link.ogSiteName = l.ogSiteName;
        diaryLinks.push(link);
      });
    }

    const now = Date.now();
    const year = getYear(now);
    const month = getMonth(now) + 1;

    let meta: MonthlyDiaryMeta;

    meta = await this.monthlyDiaryMetaRepository.findOne({
      where: {
        userId,
        year,
        month,
      },
    });
    if (!meta) {
      meta = new MonthlyDiaryMeta();
      meta.year = year;
      meta.month = month;
      meta.userId = userId;
      meta.totalCount = 1;
    } else {
      meta.totalCount = meta.totalCount + 1;
    }

    const diary = new Diary();
    diary.title = createDiaryDto.title;
    diary.content = createDiaryDto.content;
    diary.sticker = createDiaryDto.sticker;
    diary.images = diaryImages;
    diary.stocks = diaryStocks;
    diary.hashtags = diaryHashTags;
    diary.links = diaryLinks;
    diary.userId = userId;

    await this.connection.transaction(async (manager) => {
      await manager.save(MonthlyDiaryMeta, meta);
      diary.monthlyDiaryMetaId = meta.id;
      await manager.save(Diary, diary);
    });
    return diary;
  }

  async findAllByDate(
    userId: number,
    year: number,
    month: number,
    limit: number,
    cursor?: number,
  ) {
    const date = addHours(new Date(), 9);

    date.setFullYear(year, month - 1);
    const startDay = addHours(startOfMonth(date), 9);

    const query = this.diaryRepository
      .createQueryBuilder('d')
      .where(
        `d.userId = ${userId} AND d.createdAt BETWEEN "${startDay.toISOString()}
" AND "${date.toISOString()}"`,
      )
      .leftJoinAndSelect('d.links', 'link')
      .leftJoinAndSelect('d.images', 'images')
      .leftJoinAndSelect('d.stocks', 'stocks')
      .orderBy('d.id', 'DESC')
      .limit(limit);
    if (cursor) {
      query.andWhere(`d.id < ${cursor}`);
    }
    return query.getMany();
  }

  async findAll(userId: number, limit: number, cursor?: number) {
    const query = this.diaryRepository
      .createQueryBuilder('d')
      .where(`d.userId = ${userId}`)
      .leftJoinAndSelect('d.links', 'link')
      .leftJoinAndSelect('d.images', 'images')
      .leftJoinAndSelect('d.stocks', 'stocks')
      .orderBy('d.id', 'DESC')
      .limit(limit);
    if (cursor) {
      query.andWhere(`d.id < ${cursor}`);
    }
    const diarys = await query.getMany();
    return diarys;
  }

  async search(userId: number, text: string, limit: number, cursor?: number) {
    const query = this.diaryRepository
      .createQueryBuilder('d')
      .where(`d.userId = ${userId}`)
      .andWhere(`d.title LIKE "%${text}%"`)
      .leftJoinAndSelect('d.links', 'link')
      .leftJoinAndSelect('d.images', 'images')
      .leftJoinAndSelect('d.stocks', 'stocks')
      .leftJoin('d.hashtags', 'hashtags', `hashtags.name LIKE "%${text}%"`)
      .orderBy('d.id', 'DESC')
      .limit(limit);
    if (cursor) {
      query.andWhere(`d.id < ${cursor}`);
    }
    const diarys = await query.getMany();
    return diarys;
  }

  async findMonthlyDiaryMetas(userId: number, year: number) {
    const res = await this.monthlyDiaryMetaRepository
      .createQueryBuilder('m')
      .leftJoin(
        (qb1) => {
          const firstSubQuery = qb1
            .subQuery()
            .select(['d1.sticker', 'd1.monthlyDiaryMetaId'])
            .from(Diary, 'd1');
          firstSubQuery.where((qb2) => {
            const secondSubQuery = qb2
              .subQuery()
              .select(['d2_id'])
              .from((qb3) => {
                const thirdSubQuery = qb3
                  .subQuery()
                  .select(['d2.id'])
                  .from(Diary, 'd2')
                  .addSelect(
                    'RANK() OVER (PARTITION BY d2.monthlyDiaryMetaId ORDER BY d2.id DESC)',
                    'r',
                  )
                  .where(`d2.sticker IS NOT NULL and d2.userId = ${userId}`);

                return thirdSubQuery;
              }, 'ra')
              .where(`ra.r <= 3`)
              .getQuery();
            return 'id IN ' + secondSubQuery;
          });
          return firstSubQuery;
        },
        'diarys',
        `diarys.d1_monthlyDiaryMetaId = m.id`,
      )
      .where(`m.userId = ${userId} AND m.year = ${year}`)
      .addSelect(['diarys.d1_sticker as `diarys_sticker`'])
      .getRawMany();

    return res.reduce((ac, cu) => {
      const length = ac.length;
      if (length === 0) {
        const transformRaw = {};
        transformRaw['id'] = cu.m_id;
        transformRaw['year'] = cu.m_year;
        transformRaw['month'] = cu.m_month;
        transformRaw['totalCount'] = cu.m_totalCount;
        transformRaw['created_at'] = cu.m_createdAt;
        transformRaw['updated_at'] = cu.m_updatedAt;
        transformRaw['stickers'] = [cu.diarys_sticker];
        ac.push(transformRaw);
      } else {
        if (ac[length - 1]['id'] === cu.m_id) {
          ac[length - 1]['stickers'].push(cu.diarys_sticker);
        } else {
          const transformRaw = {};
          transformRaw['id'] = cu.m_id;
          transformRaw['year'] = cu.m_year;
          transformRaw['month'] = cu.m_month;
          transformRaw['totalCount'] = cu.m_totalCount;
          transformRaw['created_at'] = cu.m_createdAt;
          transformRaw['updated_at'] = cu.m_updatedAt;
          transformRaw['stickers'] = [cu.diarys_sticker];
          ac.push(transformRaw);
        }
      }
      return ac;
    }, []);
  }
}
