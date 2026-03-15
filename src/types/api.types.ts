export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiListMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiListData<T> = {
  meta: ApiListMeta;
  result: T[];
};
