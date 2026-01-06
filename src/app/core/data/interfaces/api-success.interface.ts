import { ApiResponseBase } from './api-response-base.interface';

export interface ApiSuccess<T> extends ApiResponseBase {
  data: T;
}
