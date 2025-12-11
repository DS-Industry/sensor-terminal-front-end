import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import useStore from '../state/store';
import { Spin } from "@gravity-ui/uikit";

export function LoaderModal() {
  const { isLoading } = useStore();

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoading]);

  if (typeof document === 'undefined' || !isLoading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center justify-center bg-white backdrop-blur-md rounded-3xl p-20 ">
        <Spin size="xl" />
      </div>
    </div>,
    document.body
  );
}