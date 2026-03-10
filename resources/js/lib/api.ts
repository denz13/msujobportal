// Centralized Axios API client for the Laravel + Inertia React frontend
// Inspired by vehiclemanagementappexpo/utils/api.js

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../config/apiConfig";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  },
});

type ApiErrorShape = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

const normalizeError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorShape>;

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (!axiosError.response) {
      return new Error("Network error – please check your connection.");
    }

    const messages: string[] = [];

    if (data?.message) {
      messages.push(data.message);
    }

    if (data?.error) {
      messages.push(data.error);
    }

    if (data?.errors) {
      const fieldMessages = Object.values(data.errors)
        .flat()
        .filter(Boolean);
      messages.push(...fieldMessages);
    }

    const baseMessage = messages.length
      ? messages.join(" ")
      : `Request failed with status ${status}`;

    return new Error(baseMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown API error");
};

export const apiGet = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const apiPost = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const apiPut = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const apiDelete = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export default {
  api,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};

