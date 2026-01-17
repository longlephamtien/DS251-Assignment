import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FwbMenuResponseDto } from './fwb-menu.dto';

@Injectable()
export class FwbMenuService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    async getAllFwbMenu(): Promise<FwbMenuResponseDto[]> {
        try {
            // Call the stored procedure
            const result = await this.dataSource.query('CALL sp_get_all_fwb_menu()');

            // mysql2 driver returns result in format: [[rows], [metadata]]
            // We need the first element which contains the actual data
            const fwbMenuItems = Array.isArray(result[0]) ? result[0] : result;

            return fwbMenuItems;
        } catch (error: any) {
            throw new InternalServerErrorException(
                error.message || 'Failed to fetch FWB menu items',
            );
        }
    }
}
