import { Icon } from "@gravity-ui/uikit";

import type { IconData } from '@gravity-ui/uikit';

interface IPaymentTitleSectionProps {
  title: string;
  description?: string;
  icon?: IconData;
  iconClassName?: string;
}

export default function PaymentTitleSection(props: IPaymentTitleSectionProps) {
  return (
    <div className="text-center py-4 bg-white shadow-sm">
      <div className="flex items-center justify-center gap-3 mb-4">
        {props.icon && (
          <Icon
            data={props.icon}
            size={32}
            className={props.iconClassName || "text-blue-600"}
          />
        )}
        <div className="text-gray-900 font-bold text-4xl">
          {props.title}
        </div>
      </div>
      {
        props.description && (
          <div className="text-gray-600 text-lg">
            {props.description}
          </div>
        )
      }
    </div>
  )
}