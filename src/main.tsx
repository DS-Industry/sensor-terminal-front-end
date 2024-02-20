import React from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./pages/MainPage.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SingleProgramPage from "./pages/SingleProgramPage.tsx";
import InstructionPage from "./pages/InstructionPage.tsx";
import CardPayPage from "./pages/CardPayPage.tsx";
import CashPayPage from "./pages/CashPayPage.tsx";
import SuccessPaymentPage from "./pages/SuccessPaymentPage.tsx";
import AppPayPage from "./pages/AppPayPage.tsx";
import AppCardPayPage from "./pages/AppCardPayPage.tsx";
import ErrorPaymentPage from "./pages/ErrorPaymentPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/programs/:program",
    element: <SingleProgramPage />,
  },
  {
    path: "/programs/:program/bankCard",
    element: <CardPayPage />,
  },
  {
    path: "/programs/:program/cash",
    element: <CashPayPage />,
  },
  {
    path: "/programs/:program/app",
    element: <AppPayPage />,
  },
  {
    path: "/programs/:program/appCard",
    element: <AppCardPayPage />,
  },
  {
    path: "/instruction",
    element: <InstructionPage />,
  },
  {
    path: "/success",
    element: <SuccessPaymentPage />,
  },
  {
    path: "/error",
    element: <ErrorPaymentPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
