import { EOrderStatus, EPaymentMethod } from "../../../components/state/order/orderSlice";

export interface IPaymentMethod {
  label: string;
  imgUrl: string;
  type: EPaymentMethod;
  endPoint: string;
}

export interface ICreateOrderRequest {
  program_id: number,
  payment_type: EPaymentMethod,
  ucn?: string,
}

export interface ILoyaltyCheckResponse {
  loyalty_status: boolean;
}

export interface IGetOrderByIdResponse {
  id: number;
  transaction_id: string;
  payment_type: EPaymentMethod;
  program_name: string;
  program_price: string;
  amount_sum: string;
  ucn?: string;
  queue_position?: number;
  queue_number?: number;
  status: EOrderStatus;
  qr_code?: string; //чек для оплаты
}

export interface IUcnCheckResponse {
  ucn?: string,
  discount?: string,
  cashback?: string,
  balance?: string,
}

export interface IGetMobileQr {
  qr_code: string;
}

export interface ITerminalDataResponse {
  car_wash_id: number;
  device_id: number;
}