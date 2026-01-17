import { Controller, Get, HttpStatus } from '@nestjs/common';
import { FwbMenuService } from './fwb-menu.service';
import { FwbMenuResponseDto } from './fwb-menu.dto';

@Controller('api/fwb-menu')
export class FwbMenuController {
    constructor(private readonly fwbMenuService: FwbMenuService) { }

    @Get()
    async getAllFwbMenu(): Promise<{
        success: boolean;
        data: FwbMenuResponseDto[];
        message: string;
    }> {
        try {
            const fwbMenuItems = await this.fwbMenuService.getAllFwbMenu();

            return {
                success: true,
                data: fwbMenuItems,
                message: 'FWB menu items retrieved successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.message || 'Failed to retrieve FWB menu items',
            };
        }
    }
}
