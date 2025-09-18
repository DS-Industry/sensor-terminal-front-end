type TPaymentMethod = "bankCard" | "cash" | "app";

export interface IPaymentMethod  {
  label: string;
  imgUrl: string;
  type: TPaymentMethod;
  endPoint: string;
};
