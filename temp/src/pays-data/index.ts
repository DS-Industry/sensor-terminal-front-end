import BankCard from "./../assets/card.svg";
import { IPaymentMethod } from "../api/types/payment";
import { EPaymentMethod } from "../components/state/order/orderSlice";

export const PAYS: IPaymentMethod[] = [
  {
    label: "Банковская карта",
    imgUrl: BankCard,
    type: EPaymentMethod.CARD,
    endPoint: "bankCard",
  },
];
