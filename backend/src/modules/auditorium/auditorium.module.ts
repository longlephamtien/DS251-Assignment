import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriumController } from './auditorium.controller';
import { AuditoriumService } from './auditorium.service';
import { Auditorium } from './auditorium.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Auditorium])],
    controllers: [AuditoriumController],
    providers: [AuditoriumService],
    exports: [AuditoriumService],
})
export class AuditoriumModule { }
