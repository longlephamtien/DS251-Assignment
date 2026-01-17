import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  async check() {
    try {
      // simple query to verify DB connection
      const result = await this.dataSource.query('SELECT 1 AS ok');
      return { status: 'ok', db: true, result };
    } catch (err: any) {
      return { status: 'error', db: false, message: err?.message ?? String(err) };
    }
  }
}
