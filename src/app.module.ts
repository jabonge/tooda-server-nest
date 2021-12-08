import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserModule } from './domain/user/user.module';
import { StockModule } from './domain/stock/stock.module';
import { DiaryModule } from './domain/diary/diary.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './domain/auth/auth.module';
import { getEnvFilePath } from './utils';
import { LoggerMiddleware } from './infra/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: getEnvFilePath(),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      logging: process.env.NODE_ENV === 'local',
      synchronize: process.env.NODE_ENV === 'local',
    }),
    UserModule,
    StockModule,
    DiaryModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
