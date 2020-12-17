import { requestLogger } from './request.interceptor';
import { ConfigService, setGlobalConfig } from '../config.service';
import { AxiosRequestConfig } from 'axios';
import { ObjectLoggerBuilder, StringLoggerBuilder } from '../log-builders';
import { GlobalLogConfig, RequestLogConfig } from '../interfaces';

const axiosRequest: AxiosRequestConfig = {
  params: {
    param: 'param_01',
    'param-restrict-data': 'PARAM_RESTRICT_DATA'
  },
  headers: {
    data: 'data-01',
    'header-restrict-data': 'HEADER_RESTRICT_DATA'
  },
  data: {
    id: 1,
    text: 'this is dummy log',
    'body-restrict-data': 'BODY_RESTRICT_DATA'
  },
  method: 'GET',
  url: 'https://github.com/hg-pyun',
};

describe('RequestInterceptor', () => {

  describe('General', () => {
    test('request should be return immutable AxiosRequestConfig', () => {
      const mockLogger = jest.fn(requestLogger);
      mockLogger(axiosRequest);
      expect(mockLogger).toReturnWith(axiosRequest);
    });
  });

  describe('StringLoggerBuilder', () => {
    test('if config is undefined, logger make default log', () => {
      const { method, url, data } = axiosRequest;

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      requestLogger(axiosRequest, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[Axios][Request]'));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(method as string));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(url as string));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(JSON.stringify(data)));
    });

    test('if global config is defined only, logger make log with options', () => {
      const globalConfig = {
        prefixText: '[global custom prefix]',
      } as GlobalLogConfig;

      setGlobalConfig(globalConfig);
      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      requestLogger(axiosRequest, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[global custom prefix]'));
    });

    test('if local config is defined only, logger make log with options', () => {
      const localConfig = {
        prefixText: '[local custom prefix]',
      } as GlobalLogConfig;

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      requestLogger(axiosRequest, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[local custom prefix]'));
    });

    test('if both global and local config are defined, local config should override global config', () => {
      const globalConfig = {
        prefixText: '[global custom prefix]',
      } as GlobalLogConfig;

      const localConfig = {
        prefixText: '[local custom prefix]',
      };

      setGlobalConfig(globalConfig);

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      requestLogger(axiosRequest, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[local custom prefix]'));
    });

    test('if prefixText is false, remove prefix', () => {
      const globalConfig = {
        prefixText: false,
      } as GlobalLogConfig;

      setGlobalConfig(globalConfig);

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        prefixText: '[local custom prefix]',
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      requestLogger(axiosRequest, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.not.stringContaining('[Axios]'));
    });

    describe('Redact', () => {
      it('should Redact header', () => {
        const localConfig = {
          headers: {
            apply: true,
            redact: {
              paths: ['["header-restrict-data"]']
            }
          }
        } as GlobalLogConfig;

        const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
        const buildFuncSpy = jest.spyOn(logger, 'build');
        const config: RequestLogConfig = {
          createLoggerBuilder: () => logger,
          ...localConfig
        };

        requestLogger(axiosRequest, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('\\\"header-restrict-data\\\":\\\"[REDACTED]\\\"'));
      });

      it('should Redact params', () => {
        const localConfig = {
          params: {
            apply: true,
            redact: {
              paths: ['["param-restrict-data"]']
            }
          }
        } as GlobalLogConfig;

        const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
        const buildFuncSpy = jest.spyOn(logger, 'build');
        const config: RequestLogConfig = {
          createLoggerBuilder: () => logger,
          ...localConfig
        };

        requestLogger(axiosRequest, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('\\\"param-restrict-data\\\":\\\"[REDACTED]\\\"'));
      });

      it('should Redact body', () => {
        const localConfig = {
          data: {
            apply: true,
            redact: {
              paths: ['["body-restrict-data"]']
            }
          }
        } as GlobalLogConfig;

        const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
        const buildFuncSpy = jest.spyOn(logger, 'build');
        const config: RequestLogConfig = {
          createLoggerBuilder: () => logger,
          ...localConfig
        };

        requestLogger(axiosRequest, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('\\\"body-restrict-data\\\":\\\"[REDACTED]\\\"'));
      });
    });
  });

  describe('ObjectLoggerBuilder', () => {
    test('if config is undefined, logger make default log', () => {
      const { method, url } = axiosRequest;

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      requestLogger(axiosRequest, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: 'Axios',
            type: 'Request',
            method: method,
            url: url
          }),
        }),
      );
    });

    test('if global config is defined only, logger make log with options', () => {
      const globalConfig = {
        prefixText: '[global custom prefix]',
      } as GlobalLogConfig;

      setGlobalConfig(globalConfig);
      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      requestLogger(axiosRequest, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: '[global custom prefix]'
          }),
        }),
      );
    });

    test('if local config is defined only, logger make log with options', () => {
      const localConfig = {
        prefixText: '[local custom prefix]',
      } as GlobalLogConfig;

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      requestLogger(axiosRequest, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: '[local custom prefix]'
          }),
        }),
      );
    });

    test('if both global and local config are defined, local config should override global config', () => {
      const globalConfig = {
        prefixText: '[global custom prefix]',
      } as GlobalLogConfig;

      const localConfig = {
        prefixText: '[local custom prefix]',
      };

      setGlobalConfig(globalConfig);

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      requestLogger(axiosRequest, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: '[local custom prefix]'
          }),
        }),
      );
    });

    test('if prefixText is false, remove prefix', () => {
      const globalConfig = {
        prefixText: false,
      } as GlobalLogConfig;

      setGlobalConfig(globalConfig);

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: RequestLogConfig = {
        prefixText: '[local custom prefix]',
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      requestLogger(axiosRequest, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: 'Axios'
          }),
        }),
      );
    });

    describe('Redact', () => {
      it('should Redact header', () => {
        const localConfig = {
          headers: {
            apply: true,
            redact: {
              paths: ['["header-restrict-data"]']
            }
          }
        } as GlobalLogConfig;

        const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
        const buildFuncSpy = jest.spyOn(logger, 'build');
        const config: RequestLogConfig = {
          createLoggerBuilder: () => logger,
          ...localConfig
        };

        requestLogger(axiosRequest, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(
          expect.objectContaining({
            axios: expect.objectContaining({
              headers: expect.objectContaining({
                'header-restrict-data': '[REDACTED]'
              })
            }),
          }),
        );
      });

      it('should Redact params', () => {
        const localConfig = {
          params: {
            apply: true,
            redact: {
              paths: ['["param-restrict-data"]']
            }
          }
        } as GlobalLogConfig;

        const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
        const buildFuncSpy = jest.spyOn(logger, 'build');
        const config: RequestLogConfig = {
          createLoggerBuilder: () => logger,
          ...localConfig
        };

        requestLogger(axiosRequest, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(
          expect.objectContaining({
            axios: expect.objectContaining({
              params: expect.objectContaining({
                'param-restrict-data': '[REDACTED]'
              })
            }),
          }),
        );
      });

      it('should Redact body', () => {
        const localConfig = {
          data: {
            apply: true,
            redact: {
              paths: ['["body-restrict-data"]']
            }
          }
        } as GlobalLogConfig;

        const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
        const buildFuncSpy = jest.spyOn(logger, 'build');
        const config: RequestLogConfig = {
          createLoggerBuilder: () => logger,
          ...localConfig
        };

        requestLogger(axiosRequest, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(
          expect.objectContaining({
            axios: expect.objectContaining({
              body: expect.objectContaining({
                'body-restrict-data': '[REDACTED]'
              })
            }),
          }),
        );
      });
    });
  });
});
