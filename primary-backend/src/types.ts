export interface response<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}