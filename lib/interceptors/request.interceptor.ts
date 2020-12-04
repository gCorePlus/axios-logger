import { AxiosRequestConfig } from 'axios';

import { ConfigService } from '../config.service';
import { RequestLogConfig, LoggerBuilder, GlobalLogConfig } from '../interfaces';

export const requestLogger = (request: AxiosRequestConfig, config?: RequestLogConfig) => {

  const { url, method, data, headers, params } = request;

  const buildConfig: GlobalLogConfig = ConfigService.assembleBuildConfig(config);
  if (buildConfig && buildConfig.createLoggerBuilder) {
    const loggerBuilder: LoggerBuilder = buildConfig.createLoggerBuilder(buildConfig);
    const log = loggerBuilder
      .makeLogTypeWithPrefix('Request')
      .makeDateFormat(new Date())
      .makeMethod(method)
      .makeUrl(url)
      .makeParams(params)
      .makeHeader(headers)
      .makeData(data)
      .build();

    buildConfig.logger(log);
  }

  return request;
};
