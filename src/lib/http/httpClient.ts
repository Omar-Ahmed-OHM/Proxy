import { axiosInstance } from "./client";
import type { RequestConfig } from "./types";

export const httpClient = {
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const { data } = await axiosInstance.get<T>(url, config);
    return data;
  },

  async post<T, B = unknown>(url: string, body?: B, config?: RequestConfig): Promise<T> {
    const { data } = await axiosInstance.post<T>(url, body, config);
    return data;
  },

  async put<T, B = unknown>(url: string, body?: B, config?: RequestConfig): Promise<T> {
    const { data } = await axiosInstance.put<T>(url, body, config);
    return data;
  },

  async patch<T, B = unknown>(url: string, body?: B, config?: RequestConfig): Promise<T> {
    const { data } = await axiosInstance.patch<T>(url, body, config);
    return data;
  },

  async delete<T = void>(url: string, config?: RequestConfig): Promise<T> {
    const { data } = await axiosInstance.delete<T>(url, config);
    return data;
  },
};
