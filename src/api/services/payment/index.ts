import { axiosInstance } from "../../axiosConfig";
import { ICommonApiResponse } from "../../types/common";
import { IPaymentMethod } from "../../types/payment";

enum PAYMENT {
  PAYMENT_METHODS = '/payment-method',
};

export async function getPaymentMethods(): Promise<IPaymentMethod[]> {
  const response = await axiosInstance.get<
    ICommonApiResponse<IPaymentMethod[]>
  >(PAYMENT.PAYMENT_METHODS);

  return response.data.data;
}