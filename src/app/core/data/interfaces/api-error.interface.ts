import { ApiResponseBase } from './api-response-base.interface';

export interface ApiError extends ApiResponseBase {
  name: string;
  errors: ValidationError[];
}

export interface ValidationError {
  property: string;
  constraints: Record<string, string>;
}
