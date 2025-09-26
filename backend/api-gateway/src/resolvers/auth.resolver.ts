import { Resolver, Query, Mutation, Args, Context, InputType, Field, ObjectType } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

@InputType()
class LoginInputGql {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
class RegisterInputGql {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  name: string;
}

@ObjectType()
class AuthUserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  isAdmin?: boolean;
}

@Resolver()
export class AuthResolver {
  private readonly userBaseUrl =
    process.env.USER_SERVICE_INTERNAL_URL || 'http://localhost:3004/users';

  @Query(() => AuthUserType, { nullable: true })
  async me(@Context() context: any): Promise<AuthUserType | null> {
    const { req } = context;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;

    try {
      const res = await fetch(`${this.userBaseUrl}/me/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const result = await res.json();
      const isAdmin = typeof result.isAdmin === 'boolean'
        ? result.isAdmin
        : (result.role === 'admin');

      return {
        id: result.id || result._id?.toString?.() || result._id,
        email: result.email,
        name: result.name,
        avatar: result.avatar,
        isAdmin,
      } as AuthUserType;
    } catch {
      return null;
    }
  }

  @Mutation(() => String)
  async login(@Args('input', { type: () => LoginInputGql }) input: LoginInputGql): Promise<any> {
    try {
      const res = await fetch(`${this.userBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error(`Login failed (${res.status})`);
      }
      const data = await res.json();
      return data?.token || data?.access_token || '';
    } catch (e) {
      return '';
    }
  }

  @Mutation(() => String)
  async register(@Args('input', { type: () => RegisterInputGql }) input: RegisterInputGql): Promise<any> {
    try {
      const payload = { ...input, role: 'user' };
      const res = await fetch(`${this.userBaseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Register failed (${res.status})`);
      }
      const data = await res.json();
      return data?.token || data?.access_token || '';
    } catch (e) {
      return '';
    }
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: any): Promise<boolean> {
    const { req } = context;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return true;

    try {
      const res = await fetch(`${this.userBaseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
