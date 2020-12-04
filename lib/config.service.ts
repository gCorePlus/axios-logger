import { ErrorLogConfig, GlobalLogConfig, RequestLogConfig, ResponseLogConfig } from './interfaces';
import { StringLoggerBuilder } from './log-builders';

let globalConfig: GlobalLogConfig = {
  method: true,
  url: true,
  params: { apply: true },
  data: { apply: true },
  status: true,
  logger: console.log,
  prefixText: 'Axios',
  dateFormat: false,
  headers: { apply: false },
  createLoggerBuilder: (config: GlobalLogConfig) => new StringLoggerBuilder(config),
};

export class ConfigService {

  static setGlobalConfig(config: GlobalLogConfig): void {
    globalConfig = {
      ...globalConfig,
      ...config,
    };
  }

  static getGlobalConfig(): GlobalLogConfig {
    return globalConfig;
  }

  static assembleBuildConfig(config?: RequestLogConfig | ResponseLogConfig | ErrorLogConfig): GlobalLogConfig {
    return {
      ...globalConfig,
      ...config,
    };
  }
}

export const setGlobalConfig = ConfigService.setGlobalConfig;
export const getGlobalConfig = ConfigService.getGlobalConfig;
export const assembleBuildConfig = ConfigService.assembleBuildConfig;
