import { axiosInstance } from "../../axiosConfig";
import { ICreateOrderRequest, IGetMobileQr, IGetOrderByIdResponse, ILoyaltyCheckResponse, IUcnCheckResponse } from "../../types/payment";
import { logger } from "../../../util/logger";

enum PAYMENT {
  PAY = 'pay/',
  LOYALTY_CHECK = 'lty-check/',
  CANCELLATION = 'cancellation',
  ORDER_DETAIL = 'order-detail',
  UCN_CHECK = 'ucn-check',
  OPEN_READER = 'open-reader/',
  MOBILE_QR = 'mobile-qr',
  START = 'start',
}

export async function createOrder(
  body: ICreateOrderRequest,
  signal?: AbortSignal
): Promise<void> {  
  await axiosInstance.post(PAYMENT.PAY, body, { signal });
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
  logger.info("отменили заказ",  order_id);
  
}

export async function loyaltyCheck(): Promise<ILoyaltyCheckResponse> {
  const response = await axiosInstance.get<ILoyaltyCheckResponse>(PAYMENT.LOYALTY_CHECK);

  return response.data;
}

export async function ucnCheck(): Promise<IUcnCheckResponse> {
  const response = await axiosInstance.get<IUcnCheckResponse>(PAYMENT.UCN_CHECK);

  return response.data;
}

export async function openLoyaltyCardReader(signal?: AbortSignal): Promise<IUcnCheckResponse> {  
  const response = await axiosInstance.post<IUcnCheckResponse>(PAYMENT.OPEN_READER, {}, { 
    signal 
  });
  return response.data;
}

export async function getMobileQr(): Promise<IGetMobileQr> {
  const response = await axiosInstance.get<IGetMobileQr>(PAYMENT.MOBILE_QR);

  return response.data;
}

export async function startRobot(order_id: string): Promise<{ message?: string }> {  
  const response = await axiosInstance.post(PAYMENT.START + `/${order_id}/`);
  return response.data || {};
}