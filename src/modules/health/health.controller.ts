import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-11-12T18:30:00.000Z',
        uptime: 12345.67,
        environment: 'production',
        version: '1.0.0',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic',
  })
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
