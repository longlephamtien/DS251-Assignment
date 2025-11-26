import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { MovieModule } from './modules/movie/movie.module';
import { TheaterModule } from './modules/theater/theater.module';

@Module({
  imports: [
    MovieModule,
    TheaterModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('database') as {
          host?: string;
          port?: number;
          username?: string;
          password?: string;
          database?: string;
          ca?: string;
        } | undefined;

        const ssl = db?.ca ? { ca: db.ca } : undefined;

        return {
          type: 'mysql' as const,
          host: db?.host,
          port: db?.port ?? 14127,
          username: db?.username,
          password: db?.password,
          database: db?.database,
          entities: [],
          synchronize: false,
          extra: ssl ? { ssl } : {},
        };
      },
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
