import { HttpAdapter } from "../interfaces/http-adapter.interface.ts";
import { RequestOptions } from "../interfaces/types";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

class AxiosAdapter implements HttpAdapter {
  async request<T, B = unknown>(
    url: string,
    options: RequestOptions<B> = {},
  ): Promise<T> {
    const { method = "GET", headers, body, signal } = options;

    const axiosConfig: AxiosRequestConfig = {
      url,
      method,
      headers,
      data: body,
      signal,
    };

    try {
      const response: AxiosResponse<T> = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.message;
        const axiosError = new Error(message);
        (axiosError as any).status = status;
        throw axiosError;
      } else {
        throw error;
      }
    }
  }

  createAbortController(): AbortController {
    return new AbortController();
  }
}

export default AxiosAdapter;
