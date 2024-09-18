import { HttpAdapter } from "./interfaces/http-adapter.interface.ts";
import { QueryParams, RequestOptions } from "./interfaces/types";

class ApiBase {
  baseURL: string;
  defaultHeaders: Record<string, string>;
  private adapter: HttpAdapter;
  private jwtToken: string | null = null;
  private refreshTokenValue: string | null = null;

  constructor(baseURL: string, adapter: HttpAdapter) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
    this.adapter = adapter;
  }

  private createQueryString(params: QueryParams): string {
    return new URLSearchParams(params as Record<string, string>).toString();
  }

  private buildHeaders(
    headers: Record<string, string> = {},
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...headers,
      ...(this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {}),
    };
  }

  private async handleRequest<T, B>(
    endpoint: string,
    options: RequestOptions<B>,
    retry: boolean,
  ): Promise<T> {
    try {
      return await this.adapter.request<T, B>(endpoint, options);
    } catch (error) {
      if (retry && error instanceof Error && (error as any).status === 401) {
        await this.refreshToken();

        return this.handleRequest<T, B>(
          endpoint,
          { ...options, headers: this.buildHeaders(options.headers) },
          false,
        );
      }
      throw error;
    }
  }

  async request<T, B = unknown>(
    endpoint: string,
    options: RequestOptions<B> = {},
    retry: boolean = true,
  ): Promise<T> {
    const { queryParams, headers, ...restOptions } = options;
    const queryString = queryParams
      ? `?${this.createQueryString(queryParams)}`
      : "";
    const url = `${this.baseURL}${endpoint}${queryString}`;
    const finalOptions: RequestOptions<B> = {
      ...restOptions,
      headers: this.buildHeaders(headers),
    };

    return this.handleRequest<T, B>(url, finalOptions, retry);
  }

  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestOptions<B> = {},
  ): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: "POST", body });
  }

  patch<T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestOptions<B> = {},
  ): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: "PATCH", body });
  }

  put<T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestOptions<B> = {},
  ): Promise<T> {
    return this.request<T, B>(endpoint, { ...options, method: "PUT", body });
  }

  delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  createAbortController(): any {
    if (this.adapter.createAbortController) {
      return this.adapter.createAbortController();
    } else {
      console.warn("AbortController is not supported by this adapter.");
      return null;
    }
  }

  setToken(token: string) {
    this.jwtToken = token;
  }

  setRefreshToken(token: string) {
    this.refreshTokenValue = token;
  }

  private async refreshToken(): Promise<void> {
    if (!this.refreshTokenValue)
      throw new Error("Refresh token is not available.");

    try {
      const response = await this.post<{ accessToken: string }>("/refresh", {
        refreshToken: this.refreshTokenValue,
      });

      this.setToken(response.accessToken);
    } catch (error) {
      console.error("Failed to refresh token:", error);
      throw error;
    }
  }
}

export default ApiBase;
