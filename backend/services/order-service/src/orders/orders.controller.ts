import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.ordersService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/user-update')
  updateByUser(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('shippingAddress') shippingAddress?: string,
    @Body('note') note?: string,
  ) {
    return this.ordersService.updateByUser(id, userId, { shippingAddress, note });
  }

  @Patch(':id/cancel')
  cancelByUser(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.ordersService.cancelByUser(id, userId);
  }

  @Patch(':id/confirm-receipt')
  confirmReceipt(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.ordersService.confirmReceipt(id, userId);
  }
}
