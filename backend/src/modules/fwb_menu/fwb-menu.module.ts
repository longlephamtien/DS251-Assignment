import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FwbMenu } from './fwb-menu.entity';
import { FwbMenuController } from './fwb-menu.controller';
import { FwbMenuService } from './fwb-menu.service';

@Module({
    imports: [TypeOrmModule.forFeature([FwbMenu])],
    controllers: [FwbMenuController],
    providers: [FwbMenuService],
    exports: [FwbMenuService],
})
export class FwbMenuModule { }
