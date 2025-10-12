import { Resolver, Query, Mutation, Args, Context, InputType, Field, ObjectType } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import { fetchWithRetry } from '../utils/http';

@InputType('LoginInput')
class LoginInputGql {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true, defaultValue: false })
  isAdminLogin?: boolean;
}

@InputType('RegisterInput')
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

@ObjectType()
class AuthPayloadType {
  @Field({ name: 'access_token' })
  accessToken: string;

  @Field(() => AuthUserType)
  user: AuthUserType;
}

@Resolver()
export class AuthResolver {
  private readonly authBaseUrl =
    (process.env.AUTH_SERVICE_INTERNAL_URL ||
      `http://${process.env.AUTH_SERVICE_HOST || 'localhost'}:${
        process.env.AUTH_SERVICE_PORT || '3006'
      }`) + '/auth';

  private readonly userBaseUrl =
    process.env.USER_SERVICE_INTERNAL_URL ||
    `http://${process.env.USER_SERVICE_HOST || 'localhost'}:${
      process.env.USER_SERVICE_PORT || '3004'
    }/users`;

  private sanitizeAuthUrl(path: string) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  @Query(() => AuthUserType, { nullable: true })
  async me(@Context() context: any): Promise<AuthUserType | null> {
    const { req } = context;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;

    try {
      const authResponse = await fetchWithRetry(
        `${this.authBaseUrl}${this.sanitizeAuthUrl('/profile')}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!authResponse.ok) return null;
      const authUser = await authResponse.json();

      return this.normalizeAuthUser(authUser);
    } catch {
      return null;
    }
  }

  @Mutation(() => AuthPayloadType)
  async login(@Args('input', { type: () => LoginInputGql }) input: LoginInputGql): Promise<AuthPayloadType> {
    try {
      const res = await fetchWithRetry(
        `${this.authBaseUrl}${this.sanitizeAuthUrl('/login')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            isAdminLogin: Boolean(input.isAdminLogin),
          }),
        },
      );
      if (!res.ok) {
        throw new Error(`Login failed (${res.status})`);
      }
      const data = await res.json();
      const payload = await this.buildAuthPayload(data);

      if (input.isAdminLogin && !payload.user?.isAdmin) {
        throw new ForbiddenException('Tài khoản không có quyền quản trị');
      }

      return payload;
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : 'Login failed',
      );
    }
  }

  @Mutation(() => AuthPayloadType)
  async register(@Args('input', { type: () => RegisterInputGql }) input: RegisterInputGql): Promise<AuthPayloadType> {
    try {
      const payload = { ...input, name: input.name };
      const res = await fetchWithRetry(
        `${this.authBaseUrl}${this.sanitizeAuthUrl('/register')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        throw new Error(`Register failed (${res.status})`);
      }
      const data = await res.json();
      const authPayload = await this.buildAuthPayload(data);

      try {
        await fetchWithRetry(`${this.userBaseUrl}/sync-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authPayload.accessToken}`,
          },
          body: JSON.stringify({ authUser: authPayload.user }),
        });
      } catch (syncError) {
        console.warn('AuthResolver: sync-profile failed', syncError);
      }

      return authPayload;
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : 'Register failed',
      );
    }
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: any): Promise<boolean> {
    const { req } = context;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return true;
    }
    await fetchWithRetry(`${this.userBaseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    }).catch(() => undefined);
    return true;
  }

  private async buildAuthPayload(data: any): Promise<AuthPayloadType> {
    const token = data?.access_token || data?.accessToken;
    const authUser = data?.user;

    if (!token || !authUser) {
      throw new Error('Invalid authentication response');
    }

    const normalizedUser = await this.normalizeAuthUser(authUser);

    return {
      accessToken: token,
      user: normalizedUser,
    };
  }

  private async normalizeAuthUser(authUser: any): Promise<AuthUserType> {
    if (!authUser) {
      throw new Error('Invalid user payload');
    }

    let profile: any = null;
    try {
      const profileResponse = await fetchWithRetry(
        `${this.userBaseUrl}/auth/${authUser.id}`,
      );
      if (profileResponse.ok) {
        profile = await profileResponse.json();
      }
    } catch {
      /* ignore profile errors */
    }

    const isAdmin =
      typeof authUser.isAdmin === 'boolean'
        ? authUser.isAdmin
        : profile?.role === 'admin';

    return {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.name,
      avatar: authUser.avatar || profile?.avatar,
      isAdmin,
    };
  }
}
