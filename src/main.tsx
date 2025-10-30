import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./pages/MainPage.tsx";
import "./index.css";
import "./styles/styles.css";
import "./i18n/index.ts";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@gravity-ui/uikit";
import SingleProgramPage from "./pages/SingleProgramPage.tsx";
import InstructionPage from "./pages/InstructionPage.tsx";
import CardPayPage from "./pages/CardPayPage.tsx";
import CashPayPage from "./pages/CashPayPage.tsx";
import SuccessPaymentPage from "./pages/SuccessPaymentPage.tsx";
import MobilePayPage from "./pages/MobilePayPage.tsx";
import LoyaltyPayPage from "./pages/LoyaltyPayPage.tsx";
import ErrorPaymentPage from "./pages/ErrorPaymentPage.tsx";
import { NavigationHandler } from "./components/navigationHandler/NavigationHandler.tsx";
import { GlobalWebSocketManager } from "./components/globalWebSocketManager/GlobalWebSocketManager.tsx";
import { ModalProvider } from "./components/modalProvider/ModalProvider.tsx";

function Root() {
  return (
    <>
      <ModalProvider />
      <GlobalWebSocketManager />
      <NavigationHandler />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
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
        element: <MobilePayPage />,
      },
      {
        path: "/programs/:program/appCard",
        element: <LoyaltyPayPage />,
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme="light">
    <Suspense fallback="...is loading">
      <RouterProvider router={router} />
    </Suspense>
  </ThemeProvider>
);
