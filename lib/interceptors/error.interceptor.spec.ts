import { errorLogger, errorLoggerWithoutPromise } from './error.interceptor';
import { ConfigService, setGlobalConfig } from '../config.service';
import { ErrorLogConfig, GlobalLogConfig, RequestLogConfig } from '../interfaces';
import { ObjectLoggerBuilder, StringLoggerBuilder } from '../log-builders';

const axiosError = {
  isAxiosError: true,
  code: '500',
  config: {
    params: {
      param: 'param_01',
      'param-restrict-data': 'PARAM_RESTRICT_DATA'
    },
    method: 'GET',
    url: 'https://github.com/hg-pyun',
  },
  response: {
    headers: {
      data: 'data-01',
      'header-restrict-data': 'HEADER_RESTRICT_DATA'
    },
    data: {
      id: 1,
      text: 'this is dummy log',
      'body-restrict-data': 'BODY_RESTRICT_DATA'
    },
    status: 500,
    statusText: 'internal server error',
  },
} as any;

describe('ErrorInterceptor', () => {
  describe('General', () => {
    test('response should be return immutable axiosError', () => {
      const mockLogger = jest.fn(errorLoggerWithoutPromise);
      mockLogger(axiosError);
      expect(mockLogger).toReturnWith(axiosError);
    });

    test('response should be return immutable axiosError Promise', async () => {
      const promise = errorLogger(axiosError);
      await expect(promise).rejects.toEqual(axiosError);
    });

  });

  describe('StringLoggerBuilder', () => {

    test('if config is undefined, logger make default log', () => {
      const {
        config: { url, method },
        response: { data, status, statusText },
      } = axiosError;

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[Axios][Error]'));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(method));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(url));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(`${status}:${statusText}`));
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining(JSON.stringify(data)));
    });

    test('if global config is defined only, logger make log with options', () => {
      const globalConfig = {
        prefixText: '[global custom prefix]',
      } as GlobalLogConfig;

      setGlobalConfig(globalConfig);
      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('[global custom prefix]'));
    });

    test('if local config is defined only, logger make log with options', () => {
      const localConfig = {
        prefixText: '[local custom prefix]'
      };

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      errorLoggerWithoutPromise(axiosError, config);

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
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      errorLoggerWithoutPromise(axiosError, config);

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
      const config: ErrorLogConfig = {
        prefixText: '[local custom prefix]',
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(expect.not.stringContaining('[Axios]'));
    });

    it('should log custom datetime format', () => {
      const localConfig = {
        dateFormat: 'dddd, mmmm dS, yyyy, h:MM:ss TT'
      } as GlobalLogConfig;

      const mockDate = new Date(1608248123028);
      const dateSpy = jest
        .spyOn(global, 'Date')
        .mockReturnValue(mockDate as unknown as string);

      const logger = new StringLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);
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

        errorLoggerWithoutPromise(axiosError, config);
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

        errorLoggerWithoutPromise(axiosError, config);
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

        errorLoggerWithoutPromise(axiosError, config);
        expect(buildFuncSpy).toHaveBeenCalled();
        expect(buildFuncSpy).toHaveReturnedWith(expect.stringContaining('\\\"body-restrict-data\\\":\\\"[REDACTED]\\\"'));
      });
    });
  });

  describe('ObjectLoggerBuilder', () => {

    test('if config is undefined, logger make default log', () => {
      const {
        config: { url, method },
      } = axiosError;

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig({} as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: 'Axios',
            type: 'Error',
            method: method,
            url: url,
            status: 500,
            statusText: 'internal server error',
            // data: data,
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
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: '[global custom prefix]',
          }),
        }),
      );
    });

    test('if local config is defined only, logger make log with options', () => {
      const localConfig = {
        prefixText: '[local custom prefix]'
      };

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig as any));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: '[local custom prefix]',
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
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger,
        ...localConfig
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: '[local custom prefix]',
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
      const config: ErrorLogConfig = {
        prefixText: '[local custom prefix]',
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);

      expect(buildFuncSpy).toHaveBeenCalled();
      expect(buildFuncSpy).toHaveReturnedWith(
        expect.objectContaining({
          axios: expect.objectContaining({
            prefix: expect.not.stringContaining('[Axios]'),
          }),
        }),
      );
    });

    it('should log custom datetime format', () => {
      const localConfig = {
        dateFormat: 'dddd, mmmm dS, yyyy, h:MM:ss TT'
      } as GlobalLogConfig;

      const mockDate = new Date(1608248123028);
      const dateSpy = jest
        .spyOn(global, 'Date')
        .mockReturnValue(mockDate as unknown as string);

      const logger = new ObjectLoggerBuilder(ConfigService.assembleBuildConfig(localConfig));
      const buildFuncSpy = jest.spyOn(logger, 'build');
      const config: ErrorLogConfig = {
        logger: console.log,
        createLoggerBuilder: () => logger
      };

      errorLoggerWithoutPromise(axiosError, config);
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

        errorLoggerWithoutPromise(axiosError, config);
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

        errorLoggerWithoutPromise(axiosError, config);
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

        errorLoggerWithoutPromise(axiosError, config);
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
