import { axiosInstance } from "../../axiosConfig";
import { ICreateOrderRequest, IGetMobileQr, IGetOrderByIdResponse, ILoyaltyCheckResponse, IUcnCheckResponse } from "../../types/payment";

enum PAYMENT {
  PAY = 'pay/',
  LOYALTY_CHECK = 'lty-check/',
  CANCELLATION = 'cancellation',
  ORDER_DETAIL = 'order-detail',
  UCN_CHECK = 'ucn-check',
  OPEN_READER = 'open-reader/',
  MOBILE_QR = 'mobile-qr',
};

export async function createOrder(
  body: ICreateOrderRequest,
): Promise<void> {  

  console.log(body);
  
  
  await axiosInstance.post(PAYMENT.PAY, body);
}

export async function getOrderById(
  order_id: string,
): Promise<IGetOrderByIdResponse> {
  const response = await axiosInstance.get<IGetOrderByIdResponse>(PAYMENT.ORDER_DETAIL + `/${order_id}/`);

  return response.data;
}

export async function cancelOrder(    
  order_id: string,
): Promise<void> {  
  
  await axiosInstance.post(PAYMENT.CANCELLATION + `/${order_id}/`);
  console.log("отменили заказ",  order_id);
  
}

export async function loyaltyCheck(): Promise<ILoyaltyCheckResponse> {
  const response = await axiosInstance.get<ILoyaltyCheckResponse>(PAYMENT.LOYALTY_CHECK);

  return response.data;
}

export async function ucnCheck(): Promise<IUcnCheckResponse> {
  const response = await axiosInstance.get<IUcnCheckResponse>(PAYMENT.UCN_CHECK);

  return response.data;
}

export async function openLoyaltyCardReader(): Promise<void> {  
  
  await axiosInstance.post(PAYMENT.OPEN_READER);
}

export async function getMobileQr(): Promise<IGetMobileQr> {
  const response = await axiosInstance.get<IGetMobileQr>(PAYMENT.MOBILE_QR);

  return response.data;
}