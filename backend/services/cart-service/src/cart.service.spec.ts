import { Repository } from 'typeorm';
import { of } from 'rxjs';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';

describe('CartService', () => {
  let service: CartService;
  let repository: jest.Mocked<Partial<Repository<Cart>>>;
  let productClient: { send: jest.Mock };

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    productClient = {
      send: jest.fn(),
    };

    (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: false });

    service = new CartService(repository as any, productClient as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new cart item with calculated totals', async () => {
    repository.findOne!.mockResolvedValue(null);
    const created: Partial<Cart> = { userId: 'user-1', productId: 'product-1', quantity: 2 };
    repository.create!.mockReturnValue(created as Cart);
    const saved: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 2,
      unitPrice: 150,
      totalPrice: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Cart;
    repository.save!.mockResolvedValue(saved);
    productClient.send.mockReturnValue(of({ price: 150 }));

    const result = await service.create('user-1', 'product-1', 2);

    expect(productClient.send).toHaveBeenCalledWith('get_product', { id: 'product-1' });
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(result).toMatchObject({
      userId: 'user-1',
      productId: 'product-1',
      quantity: 2,
      unitPrice: 150,
      totalPrice: 300,
    });
  });

  it('increments quantity when item already exists', async () => {
    const existing: Cart = {
      id: 'cart-2',
      userId: 'user-2',
      productId: 'product-2',
      quantity: 1,
      unitPrice: 90,
      totalPrice: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Cart;

    repository.findOne!.mockResolvedValue(existing);
    repository.save!.mockImplementation(async (entity: Cart) => ({
      ...existing,
      ...entity,
      updatedAt: new Date(),
    }));
    productClient.send.mockReturnValue(of({ price: 120 }));

    const result = await service.create('user-2', 'product-2', 2);

    expect(repository.save).toHaveBeenCalled();
    expect(result.quantity).toBe(3);
    expect(result.totalPrice).toBe(360);
    expect(result.unitPrice).toBe(120);
  });
});
