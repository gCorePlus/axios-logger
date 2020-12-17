[![npm version](http://img.shields.io/npm/v/@gcoreplus/axios-logger.svg?style=flat)](https://npmjs.org/package/@gCorePlus/axios-logger "View this project on npm")
[![Codecov Coverage](https://codecov.io/gh/gCorePlus/axios-logger/branch/master/graph/badge.svg)](https://codecov.io/gh/gCorePlus/axios-logger)
[![ISC license](http://img.shields.io/badge/license-ISC-brightgreen.svg)](http://opensource.org/licenses/ISC)

# Axios Logger

## About

`@gcoreplus/axios-logger` is a axios interceptor that can log the request/response data displaying the necessary information while communicating with the server.

Inspired by the [axios-logger](https://www.npmjs.com/package/axios-logger)  

## 👨🏻‍💻Installation

Install the main lib
    
```shell script
npm install --save @gcoreplus/axios-logger
```

### Usage

```js
import axios from 'axios';
import * as AxiosLogger from '@gcoreplus/axios-logger';
 
const instance = axios.create();
instance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
instance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);
```

### Configurations

Custom request/error output logger sample
```js
const instance = axios.create();
instance.interceptors.request.use(
  (request) => AxiosLogger.requestLogger(request, { logger: console.log }),
  (error) => AxiosLogger.errorLogger(error, { logger: console.error })
);
```

Custom output logger builder sample
```js
import * as AxiosLogger from '@gcoreplus/axios-logger';

AxiosLogger.setGlobalConfig({
  logger: console.log,
  createLoggerBuilder: config => new ObjectLoggerBuilder(config)
});
```

| Property              | Type                                                                | Default                           | Description                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `method`              | boolean                                                             | `true`                            | Whether to include HTTP method or not.                                                                                                         |
| `url`                 | boolean                                                             | `true`                            | Whether to include the URL or not.                                                                                                             |
| `params.apply`        | boolean                                                             | `true`                            | Whether to include HTTP params or not.                                                                                                         |
| `params.redact`       | RedactOptions                                                       | `undefined`                       | Whether to filter restrict data from params object before print.                                                                               |
| `data.apply`          | boolean                                                             | `true`                            | Whether to include request/response data or not.                                                                                               |
| `data.redact`         | RedactOptions                                                       | `undefined`                       | Whether to filter restrict data from data object before print.                                                                                 |
| `headers.apply`       | boolean                                                             | `false`                           | Whether to include HTTP headers or not.                                                                                                        |
| `headers.redact`      | RedactOptions                                                       | `undefined`                       | Whether to filter restrict data from headers object before print.                                                                              |
| `status`              | boolean                                                             | `true`                            | Whether to include response statuses or not.                                                                                                   |
| `prefixText`          | string \| `false`                                                   | `'Axios'`                         | `false` => no prefix, otherwise, customize the prefix wanted.                                                                                  |
| `dateFormat`          | [dateformat](https://github.com/felixge/node-dateformat) \| `false` | `new Date().toISOString()`        | `false` => no timestamp, otherwise, customize its format                                                                                       |
| `logger`              | function<string, any>                                               | `console.log`                     | Allows users to customize the logger function to be used. e.g. Winston's `logger.info` could be leveraged, like this: `logger.info.bind(this)` |
| `createLoggerBuilder` | function<config> => LoggerBuilder                                   | `new StringLoggerBuilder(config)` | Allows to customize the logger output. Possible values, `new StringLoggerBuilder(config)` and `new ObjectLoggerBuilder(config)`                |

#### Redact with fast-redact - [RedactOptions]

`@gcoreplus/axios-logger` uses fast-redact to handle restrict data

For more information see [fast-redact](https://www.npmjs.com/package/fast-redact) and [redact documentation](https://getpino.io/#/docs/redaction)

Redact configuration example
```js
import * as AxiosLogger from '@gcoreplus/axios-logger';

AxiosLogger.setGlobalConfig({
  headers: {
    apply: true,
    redact: {
      paths: ['["my-token"]', 'cookie'],
      censor: '***'
    }
  }
});
```

## Backers

<a href="https://github.com/rennanboni">
<img src="https://avatars0.githubusercontent.com/u/9962013?v=4" class="avatar" alt="Rennan Stefan Boni" width="50" />
</a>

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Acknowledgements

- [axios-logger](https://www.npmjs.com/package/axios-logger)

Copyright &copy; 2020 gCorePlus Inc.
