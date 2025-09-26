import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @ObjectIdColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
