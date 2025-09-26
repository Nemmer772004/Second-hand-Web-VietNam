import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactRepository: Repository<ContactMessage>,
    private mailerService: MailerService,
  ) {}

  async create(createContactDto: any) {
    const contact = this.contactRepository.create(createContactDto);
    await this.contactRepository.save(contact);

    // Send notification email
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${createContactDto.subject}`,
      template: 'contact-notification',
      context: {
        name: createContactDto.name,
        email: createContactDto.email,
        subject: createContactDto.subject,
        message: createContactDto.message,
      },
    });

    // Send confirmation email to user
    await this.mailerService.sendMail({
      to: createContactDto.email,
      subject: 'We received your message',
      template: 'contact-confirmation',
      context: {
        name: createContactDto.name,
      },
    });

    return contact;
  }

  async findAll() {
    return this.contactRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsResolved(id: string) {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new Error('Contact message not found');
    }

    contact.isResolved = true;
    return this.contactRepository.save(contact);
  }
}