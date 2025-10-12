import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { Voucher } from './schemas/voucher.schema';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Voucher[]> {
    if (userId) {
      return this.vouchersService.findByUserId(userId);
    }
    return this.vouchersService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Voucher[]> {
    return this.vouchersService.findByUserId(userId);
  }

  @Post()
  create(@Body() payload: Partial<Voucher>): Promise<Voucher> {
    return this.vouchersService.create(payload);
  }
}
