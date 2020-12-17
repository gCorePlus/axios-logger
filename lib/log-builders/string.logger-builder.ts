import * as fastRedact from 'fast-redact';
import * as dateformat from 'dateformat';

import { GlobalLogConfig, LoggerBuilder } from '../interfaces';

export class StringLoggerBuilder implements LoggerBuilder {

  private printQueue: string[] = [];

  constructor(
    private config: GlobalLogConfig,
    private filteredHeaderList: string[] = ['common', 'delete', 'get', 'head', 'post', 'put', 'patch', 'content-type', 'content-length', 'vary', 'date', 'connection', 'content-security-policy']) {
  }

  makeLogTypeWithPrefix(logType: string): LoggerBuilder {
    const prefix = this.config?.prefixText === false ? `[${logType}]` : `[${this.config.prefixText || 'Axios'}][${logType}]`;
    this.printQueue.push(prefix);

    return this;
  }

  makeDateFormat(date: Date): LoggerBuilder {
    // allow for opting-out of adding the timestamp (as most loggers already add this)
    if (this.config?.dateFormat && date) {
      const format: string = typeof this.config.dateFormat === 'boolean' ? 'isoDateTime' : this.config.dateFormat;
      this.printQueue.push(dateformat(date, format));
    }

    return this;
  }

  makeHeader(headers?: { [key: string]: { value: string } }): LoggerBuilder {
    if (this.config?.headers?.apply && headers) {
      let headerMap: { [key: string]: { value: string } } = {};
      for (let key in headers) {
        if (!this.filteredHeaderList.includes(key)) {
          headerMap[key] = headers[key];
        }
      }

      if (this.config.headers.redact) {
        const redact = fastRedact(this.config.headers.redact);
        headerMap = redact(headerMap);
      }

      this.printQueue.push(JSON.stringify(headerMap));
    }
    return this;
  }

  makeUrl(url?: string): LoggerBuilder {
    if (this.config?.url && url) {
      this.printQueue.push(url);
    }

    return this;
  }

  makeParams(params?: any): LoggerBuilder {
    if (this.config?.params?.apply && params) {

      let result = params;
      if (this.config.params.redact) {
        const redact = fastRedact(this.config.params.redact);
        result = redact(params);
      }

      this.printQueue.push(JSON.stringify(result));
    }

    return this;
  }

  makeMethod(method?: string): LoggerBuilder {
    if (this.config?.method && method) {
      this.printQueue.push(method.toUpperCase());
    }

    return this;
  }

  makeData(data: object): LoggerBuilder {
    if (this.config?.data?.apply && data) {

      let result = data;
      if (this.config.data.redact) {
        const redact = fastRedact(this.config.data.redact);
        result = redact(data);
      }

      this.printQueue.push(JSON.stringify(result));
    }

    return this;
  }

  makeStatus(status?:number, statusText?: string): LoggerBuilder {
    if(status && statusText) {
      this.printQueue.push(`${status}:${statusText}`);
    }

    return this;
  }

  build(): any {
    return this.printQueue.join(' ');
  }
}
