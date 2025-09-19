export interface IProgram  {
  [value: string]: {
    time: number;
    title: string;
    services: string[];
    price: number;
    description: string;
    promoUrl: string;
  };
};