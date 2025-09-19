import BankCard from "./../assets/card.svg";
import Cash from "./../assets/cash.svg";
import App from "./../assets/app.svg";
import Card from "./../assets/app-card.svg";
import { IProgram } from "../api/types/program";
import { IPaymentMethod } from "../api/types/payment";
import { EPaymentMethod } from "../components/state/order/orderSlice";

export const PROGRAMS: IProgram = {
  express: {
    time: 3,
    title: "Экспресс",
    services: ["Активная химия", "Вода"],
    price: 150,
    description:
      "Программа “Экпресс” моет вашу машину двумя шампунями и полирует в конце",
    promoUrl: `${import.meta.env.VITE_PROMO_URL_1}`,
  },

  summer: {
    time: 4,
    title: "Летняя",
    services: ["Мойка днища", "Вода", "Активная химия", "Вода х2"],
    price: 300,
    description:
      "Программа “Экпресс” моет вашу машину двумя шампунями и полирует в конце",
    promoUrl: `${import.meta.env.VITE_PROMO_URL_2}`,
  },
  standart: {
    time: 5,
    title: "Стандарт",
    services: [
      "Мойка днища",
      "Активная химия",
      "Пена",
      "Вода х2",
      "Воск",
      "Вода",
      "Обдув х2",
    ],
    description:
      "Программа “Экпресс” моет вашу машину двумя шампунями и полирует в конце",
    promoUrl: `${import.meta.env.VITE_PROMO_URL_3}`,
    price: 450,
  },
  premium: {
    time: 7,
    title: "Премиум",
    services: [
      "Мойка днища х2",
      "Активная химия",
      "Пена",
      "Вода х2",
      "Воск",
      "Осмос х2",
      "Осмос х2",
    ],
    description:
      "Программа “Экпресс” моет вашу машину двумя шампунями и полирует в конце",
    promoUrl: `${import.meta.env.VITE_PROMO_URL_4}`,
    price: 550,
  },
};

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
