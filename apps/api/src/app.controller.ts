import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  /** Browser-friendly root — all REST routes live under /api/v1 */
  @Public()
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'edumetric-api',
      api: '/api/v1',
      health: '/api/v1/health',
      auth: { login: 'POST /api/v1/auth/login', register: 'POST /api/v1/auth/register' },
    };
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'edumetric-api', timestamp: new Date().toISOString() };
  }
}
