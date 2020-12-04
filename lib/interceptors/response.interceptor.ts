import { AxiosResponse } from 'axios';

import { ConfigService } from '../config.service';
import { GlobalLogConfig, ResponseLogConfig, LoggerBuilder } from '../interfaces';

export const responseLogger = (response: AxiosResponse, config?: ResponseLogConfig) => {
  const { config: { url, method, params }, status, statusText, data, headers } = response;

  const buildConfig: GlobalLogConfig = ConfigService.assembleBuildConfig(config);
  if (buildConfig && buildConfig.createLoggerBuilder) {
    const loggerBuilder: LoggerBuilder = buildConfig.createLoggerBuilder(buildConfig);
    const log = loggerBuilder
      .makeLogTypeWithPrefix('Response')
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

  return response;
};
