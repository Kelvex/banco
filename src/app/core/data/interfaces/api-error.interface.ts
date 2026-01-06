export interface ApiError {
  name: string;
  message: string;
  errors: ValidationError[];
}

export interface ValidationError {
  property: string;
  constraints: Record<string, string>;
}