import { AxiosError } from 'axios';

import { ConfigService } from '../config.service';
import { ErrorLogConfig, GlobalLogConfig, LoggerBuilder } from '../interfaces';

export const errorLoggerWithoutPromise = (error: AxiosError, config?: ErrorLogConfig) => {

  if (error.isAxiosError) {
    const { config: { method, url, params }, response } = error;

    let status, statusText, data, headers;
    if (response) {
      status = response.status;
      statusText = response.statusText;
      data = response.data;
      headers = response.headers;
    }

    const buildConfig: GlobalLogConfig = ConfigService.assembleBuildConfig(config);
    if (buildConfig && buildConfig.createLoggerBuilder) {
      const loggerBuilder: LoggerBuilder = buildConfig.createLoggerBuilder(buildConfig);
      const log = loggerBuilder
        .makeLogTypeWithPrefix('Error')
        .makeDateFormat(new Date())
        .makeMethod(method)
        .makeUrl(url)
        .makeParams(params)
        .makeStatus(status, statusText)
        .makeHeader(headers)
        .makeData(data)
        .build();

      buildConfig.logger(log);
    }
  }

  return error;
};

export const errorLogger = (error: AxiosError, config?: ErrorLogConfig) => {
  return Promise.reject(errorLoggerWithoutPromise(error, config));
};
