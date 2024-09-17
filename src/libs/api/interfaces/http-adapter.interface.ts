import { RequestOptions } from "./types";

export interface HttpAdapter {
  request<T, B = unknown>(url: string, options: RequestOptions<B>): Promise<T>;
  createAbortController?(): any;
}
