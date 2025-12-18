import { Card, Icon } from '@gravity-ui/uikit';
import { ArrowLeft, Check, FileText } from "@gravity-ui/icons";
import ClientLogo from "../logo/Logo";
import { useNavigate } from 'react-router-dom';
import useStore from '../state/store';
import { logger } from '../../util/logger';
import { useRef, useEffect } from 'react';

interface IHeaderWithLogoProps {
  isMainPage?: boolean;
  isInstructionPage?: boolean;
  backButtonClick?: () => void;
  disableBackConfirmation?: boolean;
  title?: string;
  paymentSuccess?: boolean;
}

export default function HeaderWithLogo(props: IHeaderWithLogoProps) {
  const navigate = useNavigate();
  const {
    openBackConfirmationModal,
    setBackConfirmationCallback
  } = useStore();
  
  const backButtonClickRef = useRef(props.backButtonClick);
  
  useEffect(() => {
    backButtonClickRef.current = props.backButtonClick;
  }, [props.backButtonClick]);

  const handleBackClick = () => {
    logger.debug("[HeaderWithLogo] Back button clicked");

    if (props.isInstructionPage) {
      navigate("/");
      return;
    }

    if (props.backButtonClick) {
      logger.debug("[HeaderWithLogo] Using custom backButtonClick handler");
      
      // Set the callback before opening the modal to ensure it's set correctly
      setBackConfirmationCallback(() => {
        logger.debug("[HeaderWithLogo] Back confirmation callback executed");
        const callback = backButtonClickRef.current;
        if (callback) {
          callback();
        }
      });
      
      openBackConfirmationModal();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="mx-7 my-5 p-4 shadow-lg border-0">
      <div className="flex justify-between items-center">
        <ClientLogo />
        {props.title && <div className="text-[35px] font-bold">{props.title}</div>}
        <div className="flex items-center gap-4">
          {props.isMainPage
            ? <>
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg flex items-center gap-2"
                onClick={() => navigate("/instruction")}
                style={{ backgroundColor: "#0B68E1" }}
              >
                <FileText />
                Инструкция
              </button>
            </>
            :
            <button
              className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
              onClick={handleBackClick}
              style={{ backgroundColor: "#0B68E1" }}
              disabled={props.paymentSuccess}
            >
              <div className="flex items-center gap-2">
                {props.isInstructionPage ? <Icon data={Check} size={20} /> : <Icon data={ArrowLeft} size={20} />}
                {props.isInstructionPage ? "Я ознакомился" : "Назад"}
              </div>
            </button>
          }
        </div>
      </div>
    </Card>
  );
}