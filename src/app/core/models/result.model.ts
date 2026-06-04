export interface Error {
  code: string;
  description: string;
  statusCode?: number | null;
}

export interface ResultBase {
  isSuccess: boolean;
  isFailure: boolean;
  error: Error;
}

export interface Result extends ResultBase {
}

export interface ResultWithValue<TValue> extends ResultBase {
  value: TValue;
}
