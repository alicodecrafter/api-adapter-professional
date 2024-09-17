export type RequestOptions<B = unknown> = {
  method?: string;
  headers?: Record<string, string>;
  body?: B;
  signal?: AbortSignal;
  queryParams?: QueryParams;
};

export type QueryParams = Record<string, string | number | boolean>;
