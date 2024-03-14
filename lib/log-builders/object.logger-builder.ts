import * as fastRedact from 'fast-redact';
import * as moment from 'moment';
import { GlobalLogConfig, LoggerBuilder } from '../interfaces';

interface RootObjectLog {
  axios: ObjectLog;
}

interface ObjectLog {
  type?: string;
  prefix?: string;
  datetime?: string;
  headers?: { [key: string]: { value: string } };
  url?: string;
  params?: any;
  method?: string;
  body?: any;
  status?: number;
  statusText?: string;
}

export class ObjectLoggerBuilder implements LoggerBuilder {

  private log: RootObjectLog = { axios: {} };

  constructor(
    private config: GlobalLogConfig,
    private filteredHeaderList: string[] = ['common', 'delete', 'get', 'head', 'post', 'put', 'patch', 'content-type', 'content-length', 'vary', 'date', 'connection', 'content-security-policy']) {
  }

  makeLogTypeWithPrefix(logType: string) {
    this.log.axios.prefix = (this.config.prefixText || 'Axios') as string;
    this.log.axios.type = logType;
    return this;
  }

  makeDateFormat(date: Date) {
    // allow for opting-out of adding the timestamp (as most loggers already add this)
    if (this.config?.dateFormat) {
      this.log.axios.datetime = typeof this.config.dateFormat === 'boolean' ? date.toISOString() : moment(date).format(this.config.dateFormat);
    }
    return this;
  }

  makeHeader(headers?: { [key: string]: { value: string } }) {
    if (this.config?.headers?.apply && headers) {
      let headerMap: { [key: string]: { value: string } } = {};
      for (const key in headers) {
        if (!this.filteredHeaderList.includes(key)) {
          headerMap[key] = headers[key];
        }
      }

      if (this.config.headers.redact && typeof headers === 'object') {
        const redact = fastRedact(this.config.headers.redact);
        headerMap = JSON.parse(redact<any>(headerMap));
      }

      this.log.axios.headers = headerMap;
    }
    return this;
  }

  makeUrl(url?: string) {
    if (this.config?.url && url) {
      this.log.axios.url = url;
    }
    return this;
  }

  makeParams(params?: any): LoggerBuilder {
    if (this.config?.params?.apply && params) {
      let result = params;
      if (this.config.params.redact && typeof params === 'object') {
        const redact = fastRedact(this.config.params.redact);
        result = JSON.parse(redact<any>(params));
      }

      this.log.axios.params = result;
    }

    return this;
  }

  makeMethod(method?: string) {
    if (this.config?.method && method) {
      this.log.axios.method = method.toUpperCase();
    }
    return this;
  }

  makeData(data: object) {
    if (this.config?.data?.apply && data) {
      let result = data;
      if (this.config.data.redact && typeof data === 'object') {
        const redact = fastRedact(this.config.data.redact);
        result = JSON.parse(redact<any>(data));
      }

      this.log.axios.body = result;
    }
    return this;
  }

  makeStatus(status?: number, statusText?: string): LoggerBuilder {
    if (status) {
      this.log.axios.status = status;
    }

    if (statusText) {
      this.log.axios.statusText = statusText;
    }

    return this;
  }

  build(): any {
    return this.log;
  }
}
