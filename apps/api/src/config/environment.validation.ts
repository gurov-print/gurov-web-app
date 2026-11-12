import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

import { NodeEnvironment } from './environment.types.js';
import { parseTrustedProxies } from './proxy.config.js';

class EnvironmentVariables {
  @IsInt() @Min(1000) @Max(120000) SHUTDOWN_TIMEOUT_MS: number = 30000;
  @IsInt() @Min(100) @Max(60000) POSTGRES_STATEMENT_TIMEOUT_MS: number = 5000;
  @IsInt() @Min(100) @Max(30000) POSTGRES_LOCK_TIMEOUT_MS: number = 1000;
  @IsInt() @Min(100) @Max(60000) POSTGRES_IDLE_TRANSACTION_TIMEOUT_MS: number =
    10000;
  @IsInt() @Min(1) @Max(8) MEDIA_MAX_CONCURRENT: number = 2;
  @IsInt() @Min(0) @Max(32) MEDIA_MAX_WAITING: number = 4;
  @IsInt() @Min(100) @Max(10000) MEDIA_WAIT_TIMEOUT_MS: number = 1000;

  @IsInt()
  @Min(100)
  @Max(5000)
  REDIS_QUEUE_TIMEOUT_MS: number = 1000;

  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/)
  REDIS_QUEUE_PREFIX: string = 'gurov';

  @IsInt()
  @Min(100)
  @Max(5000)
  HEALTH_CHECK_TIMEOUT_MS: number = 1000;

  @IsString()
  TRUSTED_PROXIES: string = '';

  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,99}$/)
  RATE_LIMIT_REDIS_PREFIX: string = 'gurov:rate-limit';

  @IsInt()
  @Min(100)
  @Max(5000)
  RATE_LIMIT_REDIS_TIMEOUT_MS: number = 1000;

  @IsInt() @Min(1000) @Max(30000) MEDIA_PDF_TIMEOUT_MS: number = 5000;
  @IsIn(['local', 's3']) STORAGE_DRIVER: string = 'local';
  @IsString() STORAGE_LOCAL_ROOT: string = '';
  @IsString() @IsNotEmpty() S3_REGION: string = 'us-east-1';
  @ValidateIf((o) => o.STORAGE_DRIVER === 's3')
  @IsString()
  @IsNotEmpty()
  S3_BUCKET: string = '';
  @ValidateIf((o) => o.STORAGE_DRIVER === 's3' && o.S3_ENDPOINT !== '')
  @IsUrl({
    require_tld: false,
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  S3_ENDPOINT: string = '';
  @ValidateIf((o) => Boolean(o.S3_ACCESS_KEY_ID || o.S3_SECRET_ACCESS_KEY))
  @IsNotEmpty()
  @IsString()
  S3_ACCESS_KEY_ID: string = '';
  @ValidateIf((o) => Boolean(o.S3_ACCESS_KEY_ID || o.S3_SECRET_ACCESS_KEY))
  @IsNotEmpty()
  @IsString()
  S3_SECRET_ACCESS_KEY: string = '';
  @Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) =>
    obj[key] === 'true' || obj[key] === true
      ? true
      : obj[key] === 'false' || obj[key] === false || obj[key] === undefined
        ? false
        : obj[key],
  )
  @IsBoolean()
  S3_FORCE_PATH_STYLE: boolean = false;
  @IsInt() @Min(1) @Max(20) MEDIA_IMAGE_MAX_MB: number = 5;
  @IsInt() @Min(1) @Max(50) MEDIA_PDF_MAX_MB: number = 10;
  @IsInt() @Min(1000000) @Max(50000000) MEDIA_IMAGE_MAX_PIXELS: number =
    20000000;
  @IsInt() @Min(256) @Max(4096) MEDIA_IMAGE_MAX_DIMENSION: number = 1600;
  @IsInt() @Min(1) @Max(1000) MEDIA_PDF_MAX_PAGES: number = 500;

  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  LOG_LEVEL: string = 'info';

  @IsUrl({
    require_tld: false,
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  FRONTEND_ORIGIN!: string;

  @IsEnum(NodeEnvironment)
  NODE_ENV!: NodeEnvironment;

  @IsInt()
  @Min(1)
  @Max(65535)
  APP_PORT!: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  POSTGRES_PORT!: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_SCHEMA!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT!: number;

  @IsInt()
  @Min(100)
  @Max(60000)
  SMTP_DNS_TIMEOUT_MS: number = 5000;

  @IsInt()
  @Min(100)
  @Max(60000)
  SMTP_CONNECTION_TIMEOUT_MS: number = 5000;

  @IsInt()
  @Min(100)
  @Max(60000)
  SMTP_GREETING_TIMEOUT_MS: number = 5000;

  @IsInt()
  @Min(100)
  @Max(60000)
  SMTP_SOCKET_TIMEOUT_MS: number = 10000;

  @IsString()
  @IsNotEmpty()
  SMTP_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT!: number;

  @Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) => {
    const value = obj[key];
    return value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : value;
  })
  @IsBoolean()
  SMTP_SECURE!: boolean;

  @ValidateIf((o) => Boolean(o.SMTP_USER || o.SMTP_PASSWORD))
  @IsString()
  @IsNotEmpty()
  SMTP_USER: string = '';

  @ValidateIf((o) => Boolean(o.SMTP_USER || o.SMTP_PASSWORD))
  @IsString()
  @IsNotEmpty()
  SMTP_PASSWORD: string = '';

  @IsString()
  @IsNotEmpty()
  SMTP_FROM!: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const environment = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(environment, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  parseTrustedProxies(environment.TRUSTED_PROXIES);
  return environment;
}
