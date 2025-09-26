import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: any) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Patch(':id/resolve')
  markAsResolved(@Param('id') id: string) {
    return this.contactService.markAsResolved(id);
  }
}