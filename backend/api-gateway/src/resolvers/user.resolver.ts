import { Resolver, Query, Args, ObjectType, Field, InputType, Mutation, Context } from '@nestjs/graphql';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { fetchWithRetry } from '../utils/http';

@ObjectType()
class UserType {
  @Field()
  id: string;

  @Field({ nullable: true })
  authId?: string;

  @Field({ nullable: true })
  profileId?: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@InputType()
class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  role?: string;
}

@InputType()
class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  role?: string;
}

@Resolver()
export class UserResolver {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  private readonly baseUrl =
    process.env.USER_SERVICE_INTERNAL_URL ||
    `http://${process.env.USER_SERVICE_HOST || 'localhost'}:${
      process.env.USER_SERVICE_PORT || '3004'
    }/users`;

  private mapUser(user: any): UserType | null {
    if (!user) return null;
    const authId = user.authId || user.id || user._id?.toString?.() || user._id;
    const profileId = user.profileId || user._id?.toString?.() || undefined;
    const id = authId || profileId;
    const rawAddress = user.address;
    let addressText: string | undefined;
    if (rawAddress && typeof rawAddress === 'object') {
      const parts = [rawAddress.street, rawAddress.city, rawAddress.state, rawAddress.country]
        .filter(Boolean)
        .join(', ');
      addressText = parts || undefined;
    } else if (typeof rawAddress === 'string') {
      addressText = rawAddress;
    }

    return {
      id,
      authId,
      profileId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: addressText,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private ensureAdmin(context: any) {
    const isAdmin = context?.req?.user?.isAdmin;
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  @Query(() => [UserType])
  async users(): Promise<any[]> {
    try {
      const result = await firstValueFrom(
        this.userClient.send('get_users', {})
      );
      return Array.isArray(result)
        ? result.map((item) => this.mapUser(item)).filter(Boolean)
        : await this.fetchUsersRest();
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.fetchUsersRest();
    }
  }

  @Query(() => UserType, { nullable: true })
  async user(@Args('id') id: string): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.userClient.send('get_user', { id })
      );
      return this.mapUser(result) ?? (await this.fetchUserRest(id));
    } catch (error) {
      console.error('Error fetching user:', error);
      return this.fetchUserRest(id);
    }
  }

  private async fetchUsersRest(): Promise<UserType[]> {
    try {
      const res = await fetchWithRetry(this.baseUrl);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data)
        ? data.map((item: any) => this.mapUser(item)).filter(Boolean) as UserType[]
        : [];
    } catch (error) {
      console.warn('UserResolver REST fallback failed', error);
      return [];
    }
  }

  private async fetchUserRest(id: string): Promise<UserType | null> {
    try {
      const res = await fetchWithRetry(`${this.baseUrl}/${id}`);
      if (!res.ok) return null;
      return this.mapUser(await res.json());
    } catch (error) {
      console.warn('UserResolver REST (single) fallback failed', error);
      return null;
    }
  }

  @Mutation(() => UserType)
  async createUser(
    @Args('input') input: CreateUserInput,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const payload = {
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone,
      role: input.role || 'user',
    };

    const res = await fetchWithRetry(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Unable to create user (${res.status})`);
    }

    const data = await res.json();
    const savedUser = data?.user || data;
    return this.mapUser(savedUser);
  }

  @Mutation(() => UserType, { nullable: true })
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const body: Record<string, unknown> = {};
    if (typeof input.name === 'string') body.name = input.name;
    if (typeof input.phone === 'string') body.phone = input.phone;
    if (typeof input.role === 'string') body.role = input.role;

    const res = await fetchWithRetry(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Unable to update user (${res.status})`);
    }

    return this.mapUser(await res.json());
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);

    const res = await fetchWithRetry(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      return false;
    }

    if (!res.ok && res.status !== 204) {
      throw new Error(`Unable to delete user (${res.status})`);
    }

    return true;
  }
}
