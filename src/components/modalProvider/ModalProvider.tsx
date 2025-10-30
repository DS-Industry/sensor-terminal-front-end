import { BackConfirmationModal } from "../modals/BackConfirmationModal";
import { LoaderModal } from "../modals/LoaderModal";

export function ModalProvider() {
  
  return (
    <>
      <LoaderModal />
      <BackConfirmationModal />
    </>
  );
}