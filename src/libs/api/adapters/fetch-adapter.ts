import { HttpAdapter } from "../interfaces/http-adapter.interface.ts";
import { RequestOptions } from "../interfaces/types";

class FetchAdapter implements HttpAdapter {
  async request<T = void, B = unknown>(
    url: string,
    options: RequestOptions<B> = {},
  ): Promise<T> {
    const { method = "GET", headers, body, signal } = options;

    const config: RequestInit = {
      method,
      headers,
      signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorMessage = await response.text();
        const error = new Error(errorMessage || "Network response was not ok");
        (error as any).status = response.status;
        throw error;
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("Request was aborted");
        } else {
          console.error("API request failed:", error.message);
        }
      } else {
        console.error("An unknown error occurred:", error);
      }

      throw error;
    }
  }

  createAbortController(): AbortController {
    return new AbortController();
  }
}

export default FetchAdapter;
