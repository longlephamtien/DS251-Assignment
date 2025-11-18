import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
  ConfigModule.forRoot({ isGlobal: true, envFilePath: [`.env.${process.env.NODE_ENV}`, '.env.local', '.env'] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const port = Number(config.get<string>('DB_PORT') ?? 3306);
        const username = config.get<string>('DB_USERNAME');
        const password = config.get<string>('DB_PASSWORD');
        const database = config.get<string>('DB_NAME');

        const caPath = config.get<string>('AIVEN_SSL_CA_PATH');
        let ca: string | undefined;
        if (caPath) {
          try {
            ca = fs.readFileSync(caPath).toString();
          } catch (e) {
          }
        } else {
          ca = config.get<string>('AIVEN_SSL_CA');
        }

        const ssl = ca ? { ca } : undefined;

        return {
          type: 'mysql' as const,
          host,
          port,
          username,
          password,
          database,
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
export class AppModule {}
