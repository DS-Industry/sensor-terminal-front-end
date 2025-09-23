import BankCard from "./../assets/card.svg";
import Cash from "./../assets/cash.svg";
import App from "./../assets/app.svg";
import Card from "./../assets/app-card.svg";
import { IPaymentMethod } from "../api/types/payment";
import { EPaymentMethod } from "../components/state/order/orderSlice";

export const PAYS: IPaymentMethod[] = [
  {
    label: "Банковская карта",
    imgUrl: BankCard,
    type: EPaymentMethod.CARD,
    endPoint: "bankCard",
  },
  {
    label: "Наличный расчет",
    type: EPaymentMethod.CASH,
    imgUrl: Cash,
    endPoint: "cash",
  },
  {
    label: "Мобильное приложение",
    type: EPaymentMethod.MOBILE_PAYMENT,
    imgUrl: App,
    endPoint: "app",
  },
  {
    label: "Карта лояльности",
    type: EPaymentMethod.LOYALTY,
    imgUrl: Card,
    endPoint: "appCard",
  },
];
