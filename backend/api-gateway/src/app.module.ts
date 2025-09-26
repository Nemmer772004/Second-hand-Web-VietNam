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
            const host = configService.get<string>('USER_SERVICE_HOST') || 'localhost';
            const port = configService.get<string>('USER_SERVICE_PORT') || '3004';
            const baseUrl = process.env.USER_SERVICE_INTERNAL_URL || `http://${host}:${port}`;

            try {
              const response = await fetch(`${baseUrl}/users/me/current`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const rawUser = await response.json();
                const normalizedUser = {
                  ...rawUser,
                  isAdmin: typeof rawUser.isAdmin === 'boolean'
                    ? rawUser.isAdmin
                    : (rawUser.role === 'admin'),
                };

                req.user = normalizedUser;
                const derivedUserId = normalizedUser?.id || normalizedUser?._id || normalizedUser?.userId;
                if (derivedUserId) {
                  req.headers['x-user-id'] = String(derivedUserId);
                }
              }
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
            port: Number(configService.get<string>('CART_SERVICE_PORT') || 3007),
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
    UserResolver
  ],
})
export class AppModule {}
