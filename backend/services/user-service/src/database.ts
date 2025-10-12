import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity.js';

const resolveBool = (value: string | undefined, fallback = false) => {
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.USER_PG_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.USER_PG_PORT || process.env.DB_PORT || 5432),
  username: process.env.USER_PG_USERNAME || process.env.DB_USERNAME || 'nemmer',
  password: process.env.USER_PG_PASSWORD || process.env.DB_PASSWORD || 'nemmer',
  database: process.env.USER_PG_DB || process.env.DB_NAME || 'studio_auth',
  ssl: resolveBool(process.env.USER_PG_SSL),
  synchronize: resolveBool(process.env.TYPEORM_SYNC, true),
  logging: resolveBool(process.env.TYPEORM_LOGGING),
  entities: [UserProfile],
  uuidExtension:
    (process.env.USER_PG_UUID_EXTENSION as 'pgcrypto' | 'uuid-ossp' | undefined) ||
    'pgcrypto',
});

export const initializeDataSource = async () => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }
  return AppDataSource.initialize();
};
