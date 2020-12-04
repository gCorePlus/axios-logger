export interface LoggerBuilder {
  makeLogTypeWithPrefix(logType: string): LoggerBuilder;

  makeDateFormat(date: Date): LoggerBuilder;

  makeHeader(headers?: { [key: string]: { value: string } }): LoggerBuilder;

  makeUrl(url?: string): LoggerBuilder;

  makeParams(params?: any): LoggerBuilder;

  makeMethod(method?: string): LoggerBuilder;

  makeData(data: object): LoggerBuilder;

  makeStatus(status?: number, statusText?: string): LoggerBuilder;

  build(): any;
}
