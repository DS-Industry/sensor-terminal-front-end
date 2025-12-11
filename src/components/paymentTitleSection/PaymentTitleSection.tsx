import { Icon } from "@gravity-ui/uikit";
import { useTranslation } from "react-i18next";
import { ComponentType } from "react";

interface IPaymentTitleSectionProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  iconClassName?: string;
}

export default function PaymentTitleSection(props: IPaymentTitleSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-8 bg-white shadow-sm">
      <div className="flex items-center justify-center gap-3 mb-4">
        {props.icon && (
          <Icon
            data={props.icon}
            size={32}
            className={props.iconClassName || "text-blue-600"}
          />
        )}
        <div className="text-gray-900 font-bold text-4xl">
          {t(props.title)}
        </div>
      </div>
      {
        props.description && (
          <div className="text-gray-600 text-lg">
            {t(props.description)}
          </div>
        )
      }
    </div>
  )
}