import { getGlobalConfig, assembleBuildConfig, setGlobalConfig } from './config.service';
import { GlobalLogConfig } from './interfaces';

const DEFAULT_PREFIX = 'Axios';
const customLoggerFunction = console.info;

describe('Config', () => {
  test('Default globalConfig properties should be all true + console should be the logger', () => {
    const result = getGlobalConfig();
    expect(result).toEqual({
      method: true,
      url: true,
      data: {
        apply: true
      },
      params: {
        apply: true
      },
      headers: {
        apply: false
      },
      status: true,
      logger: console.log,
      dateFormat: false,
      prefixText: DEFAULT_PREFIX,
      createLoggerBuilder: result.createLoggerBuilder
    });
  });

  test('setGlobalConfig should set config. getGlobalConfig should return globalConfig object.', () => {
    const globalConfig: GlobalLogConfig = {
      data: {
        apply: true
      },
      url: false,
      logger: customLoggerFunction,
    };

    setGlobalConfig(globalConfig);
    const result = getGlobalConfig();
    expect(result).toEqual({
      method: true,
      url: false,
      data: {
        apply: true
      },
      params: {
        apply: true
      },
      headers: {
        apply: false
      },
      status: true,
      logger: customLoggerFunction,
      dateFormat: false,
      prefixText: DEFAULT_PREFIX,
      createLoggerBuilder: result.createLoggerBuilder
    });
  });

  test('assembleBuildConfig should return merged with globalConfig object.', () => {
    const globalConfig: GlobalLogConfig = {
      data: {
        apply: true
      },
      url: true,
      logger: console.log,
    };

    setGlobalConfig(globalConfig);
    const result = assembleBuildConfig({
      dateFormat: 'hh:mm:ss',
      data: {
        apply: true
      },
      logger: console.log
    });

    expect(result).toEqual({
      method: true,
      url: true,
      data: {
        apply: true
      },
      params: {
        apply: true
      },
      headers: {
        apply: false
      },
      status: true,
      logger: console.log,
      dateFormat: 'hh:mm:ss',
      prefixText: DEFAULT_PREFIX,
      createLoggerBuilder: result.createLoggerBuilder
    });
  });
});
