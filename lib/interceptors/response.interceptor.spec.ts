import { responseLogger } from './response.interceptor';
import { ConfigService, setGlobalConfig } from '../config.service';
import { ObjectLoggerBuilder, StringLoggerBuilder } from '../log-builders';
import { ErrorLogConfig, GlobalLogConfig, RequestLogConfig, ResponseLogConfig } from '../interfaces';
import { AxiosResponse } from 'axios';

const axiosResponse: AxiosResponse = {
  headers: {
    data: 'data-01',
    'header-restrict-data': 'HEADER_RESTRICT_DATA'
  },
  config: {
    url: 'https://github.com/hg-pyun',
    method: 'GET',
    params: {
      param: 'param_01',
      'param-restrict-data': 'PARAM_RESTRICT_DATA'
    }
  },
  data: {
    id: 2,
    text: 'dummy data',
    'body-restrict-data': 'BODY_RESTRICT_DATA'
  },
  status: 500,
  statusText: 'internal server error',
} as any as AxiosResponse;

describe('ResponseInterceptor', () => {

  describe('General', () => {
    test('request should be return immutable axiosResponse', () => {
      const mockLogger = jest.fn(responseLogger);
      mockLogger(axiosResponse);
      expect(mockLogger).toReturnWith(axiosResponse);
    });
  });

  describe('StringLoggerBuilder', () => {

    test('if config is undefined, logger make default log', () => {
      const { config: { method, url }, data } = axiosResponse;

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ResponseLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[Axios][Response]'));
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
      const config: ResponseLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[global custom prefix]'));
    });

    test('if local config is defined only, logger make log with options', () => {
      const localConfig = {
        prefixText: '[local custom prefix]',
      } as GlobalLogConfig;

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ResponseLogConfig = {
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      responseLogger(axiosResponse, config);

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
      const config: ResponseLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      responseLogger(axiosResponse, config);

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
      const config: ResponseLogConfig = {
        prefixText: '[local custom prefix]',
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.not.stringContaining('[Axios]'));
    });

    it('should log custom datetime format', () => {
      const localConfig = {
        dateFormat: 'dddd, MMMM Do, YYYY, LTS'
      } as GlobalLogConfig;

      const mockDate = new Date(1608248123028);
      const dateSpy = jest
        .spyOn(global, 'Date')
        .mockReturnValue(mockDate);

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);
      dateSpy.mockRestore();

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('Thursday, December 17th, 2020, 8:35:23 PM'));
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

        responseLogger(axiosResponse, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('\\\"header-restrict-data\\\":\\\"[REDACTED]\\\"'));
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

        responseLogger(axiosResponse, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('\\\"body-restrict-data\\\":\\\"[REDACTED]\\\"'));
      });
    });
  });

  describe('ObjectLoggerBuilder', () => {

    test('if config is undefined, logger make default log', () => {
      const { config: { method, url } } = axiosResponse;

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ResponseLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: 'Axios',
            type: 'Response',
            method: method,
            url: url,
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
      const config: ResponseLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);

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
      const config: ResponseLogConfig = {
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      responseLogger(axiosResponse, config);

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
      const config: ResponseLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      responseLogger(axiosResponse, config);

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
      const config: ResponseLogConfig = {
        prefixText: '[local custom prefix]',
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);
      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: 'Axios'
          }),
        }),
      );
    });

    it('should log custom datetime format', () => {
      const localConfig = {
        dateFormat: 'dddd, MMMM Do, YYYY, LTS'
      } as GlobalLogConfig;

      const mockDate = new Date(1608248123028);
      const dateSpy = jest
        .spyOn(global, 'Date')
        .mockReturnValue(mockDate);

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      responseLogger(axiosResponse, config);
      dateSpy.mockRestore();

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            datetime: expect.stringContaining('Thursday, December 17th, 2020, 8:35:23 PM'),
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

        responseLogger(axiosResponse, config);
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

        responseLogger(axiosResponse, config);
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

        responseLogger(axiosResponse, config);
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
