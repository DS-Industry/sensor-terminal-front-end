export interface ICommonApiResponse<T> {
  data: T;
  path: string;
  duration: string;
  method: string;
}