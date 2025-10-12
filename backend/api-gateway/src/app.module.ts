import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from './database.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { ProductResolver } from './resolvers/product.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { CartResolver } from './resolvers/cart.resolver';
import { OrderResolver } from './resolvers/order.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { VoucherResolver } from './resolvers/voucher.resolver';
import { AIResolver } from './resolvers/ai.resolver';
import { RecommendationResolver } from './resolvers/recommendation.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: 'src/schema.graphql',
        playground: true,
        csrfPrevention: false,
        context: async ({ req }) => {
          const authHeader = req.headers?.authorization;
          const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

          if (token) {
            const userHost = configService.get<string>('USER_SERVICE_HOST') || 'localhost';
            const userPort = configService.get<string>('USER_SERVICE_PORT') || '3004';
            const authHost = configService.get<string>('AUTH_SERVICE_HOST') || 'localhost';
            const authPort = configService.get<string>('AUTH_SERVICE_PORT') || '3006';

            const authBase =
              process.env.AUTH_SERVICE_INTERNAL_URL || `http://${authHost}:${authPort}`;
            const userBase =
              process.env.USER_SERVICE_INTERNAL_URL || `http://${userHost}:${userPort}/users`;

            try {
              const authResponse = await fetch(`${authBase}/auth/profile`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!authResponse.ok) {
                return { req };
              }

              const authUser = await authResponse.json();
              let profile: any = null;

              try {
                const profileRes = await fetch(`${userBase}/auth/${authUser.id}`);
                if (profileRes.ok) {
                  profile = await profileRes.json();
                }
              } catch {
                /* ignore profile lookup errors */
              }

              const isAdmin =
                typeof authUser.isAdmin === 'boolean'
                  ? authUser.isAdmin
                  : profile?.role === 'admin';

              const normalizedUser: Record<string, any> = {
                id: authUser.id,
                authId: authUser.id,
                email: authUser.email,
                name: profile?.name || authUser.name,
                avatar: authUser.avatar || profile?.avatar,
                role: profile?.role || (isAdmin ? 'admin' : 'user'),
                phone: profile?.phone || null,
                address: profile?.address || null,
                isAdmin,
                profileId: profile?.profileId || profile?._id,
                createdAt: profile?.createdAt || authUser.createdAt,
                updatedAt: profile?.updatedAt || authUser.updatedAt,
              };

              req.user = normalizedUser;
              req.headers['x-user-id'] = String(normalizedUser.id);
            } catch (error) {
              console.warn('GraphQL context: failed to attach user', error);
            }
          }

          return { req };
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('PRODUCT_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('PRODUCT_SERVICE_PORT') || 3001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CATEGORY_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('CATEGORY_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('CATEGORY_SERVICE_PORT') || 3002),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'ORDER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('ORDER_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('ORDER_SERVICE_PORT') || 3003),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('USER_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('USER_SERVICE_PORT') || 3004),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CART_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('CART_SERVICE_HOST') || 'localhost',
            port: Number(
              configService.get<string>('CART_SERVICE_TCP_PORT') ||
                configService.get<string>('CART_SERVICE_MS_PORT') ||
                configService.get<string>('CART_SERVICE_PORT') ||
                3017,
            ),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'AI_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AI_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('AI_SERVICE_PORT') || 3008),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    AuthResolver,
    ProductResolver,
    CategoryResolver,
    CartResolver,
    OrderResolver,
    UserResolver,
    VoucherResolver,
    // AI
    AIResolver,
    RecommendationResolver,
  ],
})
export class AppModule {}
