import { RedactOptions } from 'fast-redact';

import { LoggerBuilder } from '../interfaces';

export interface CommonConfig {
  prefixText?: string | boolean;
  dateFormat?: string | boolean;
  headers?: ApplyLogConfig;
  logger: (text: string) => any;
}

export interface GlobalLogConfig extends CommonConfig {
  data?: ApplyLogConfig;
  method?: boolean;
  url?: boolean;
  params?: ApplyLogConfig;
  status?: boolean;
  statusText?: boolean;
  createLoggerBuilder?: (config: GlobalLogConfig) => LoggerBuilder;
}

export interface ApplyLogConfig {
  apply: boolean;
  redact?: RedactOptions;
}

export interface RequestLogConfig extends CommonConfig {
  data?: ApplyLogConfig;
  method?: boolean;
  url?: boolean;
}

export interface ResponseLogConfig extends CommonConfig {
  data?: ApplyLogConfig;
  status?: boolean;
  statusText?: boolean;
}

export interface ErrorLogConfig extends CommonConfig {
  data?: ApplyLogConfig;
  code?: boolean;
}
