import { Resolver, Query, Args, ObjectType, Field, InputType, Mutation, Context } from '@nestjs/graphql';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@ObjectType()
class CategoryType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@InputType()
class CategoryInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  image?: string;
}

@Resolver()
export class CategoryResolver {
  constructor(
    @Inject('CATEGORY_SERVICE') private categoryClient: ClientProxy,
  ) {}

  private readonly baseUrl =
    process.env.CATEGORY_SERVICE_URL ||
    `http://${process.env.CATEGORY_SERVICE_HOST || 'localhost'}:${
      process.env.CATEGORY_SERVICE_PORT || '3002'
    }`;

  private mapCategory = (c: any) => {
    if (!c) return null;
    return {
      id: c.id || c._id?.toString?.() || c._id,
      name: c.name,
      description: c.description,
      image: c.image,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  };

  private ensureAdmin(context: any) {
    const isAdmin = context?.req?.user?.isAdmin;
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  @Query(() => [CategoryType])
  async categories(): Promise<any[]> {
    // Try MS first
    try {
      const result = await firstValueFrom(
        this.categoryClient.send('get_categories', {})
      );
      if (Array.isArray(result)) return result.map(this.mapCategory).filter(x => x && x.id);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    // Fallback REST
    try {
      const res = await fetch(`${this.baseUrl}/categories`);
      const data = await res.json();
      return Array.isArray(data) ? data.map(this.mapCategory).filter(x => x && x.id) : [];
    } catch {
      return [];
    }
  }

  @Query(() => CategoryType, { nullable: true })
  async category(@Args('id') id: string): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.categoryClient.send('get_category', { id })
      );
      if (result) return this.mapCategory(result);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
    try {
      const res = await fetch(`${this.baseUrl}/categories/${encodeURIComponent(id)}`);
      if (res.ok) return this.mapCategory(await res.json());
    } catch {}
    return null;
  }

  @Mutation(() => CategoryType)
  async createCategory(
    @Args('input') input: CategoryInput,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const res = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        image: input.image,
      }),
    });

    if (!res.ok) {
      throw new Error(`Unable to create category (${res.status})`);
    }

    return this.mapCategory(await res.json());
  }

  @Mutation(() => CategoryType)
  async updateCategory(
    @Args('id') id: string,
    @Args('input') input: CategoryInput,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const res = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        image: input.image,
      }),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Unable to update category (${res.status})`);
    }

    return this.mapCategory(await res.json());
  }

  @Mutation(() => Boolean)
  async deleteCategory(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const res = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      return false;
    }

    if (!res.ok) {
      throw new Error(`Unable to delete category (${res.status})`);
    }

    return true;
  }
}
