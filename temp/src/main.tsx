import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./pages/MainPage.tsx";
import "./index.css";
import "./styles/styles.css";
import "./config/env";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "@gravity-ui/uikit";
import SingleProgramPage from "./pages/SingleProgramPage.tsx";
import InstructionPage from "./pages/InstructionPage.tsx";
import CardPayPage from "./pages/CardPayPage.tsx";
import SuccessPaymentPage from "./pages/SuccessPaymentPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import ErrorPaymentPage from "./pages/ErrorPaymentPage.tsx";
import WashingInProgressPage from "./pages/WashingInProgressPage.tsx";
import QueueWaitingPage from "./pages/QueueWaitingPage.tsx";
import { WebSocketService } from "./services/websocketService.ts";
import { ModalProvider } from "./components/modalProvider/ModalProvider.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { PaymentGuard } from "./components/guards/PaymentGuard.tsx";
import { AppHealthMonitor } from "./components/appHealth/AppHealthMonitor.tsx";

WebSocketService.initialize();

// eslint-disable-next-line react-refresh/only-export-components
function Root() {
  return (
    <>
      <ModalProvider />
      <AppHealthMonitor />
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
        path: "/instruction",
        element: <InstructionPage />,
      },
      {
        path: "/success",
        element: (
          <PaymentGuard>
            <SuccessPaymentPage />
          </PaymentGuard>
        ),
      },
      {
        path: "/error",
        element: (
          <PaymentGuard>
            <ErrorPage />
          </PaymentGuard>
        ),
      },
      {
        path: "/error-payment",
        element: (
          <PaymentGuard>
            <ErrorPaymentPage />
          </PaymentGuard>
        ),
      },
      {
        path: "/washing",
        element: (
          <PaymentGuard>
            <WashingInProgressPage />
          </PaymentGuard>
        ),
      },
      {
        path: "/queue-waiting",
        element: (
          <PaymentGuard>
            <QueueWaitingPage />
          </PaymentGuard>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider theme="light">
      <Suspense fallback="...is loading">
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  </ErrorBoundary>
);
