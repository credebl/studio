// DeleteOrganizationsCard.tsx

import React from "react";
import { Card } from "flowbite-react";

interface CardProps {
  title?: string;
  description?: string;
  count?: number;
  deleteFunc?: () => void;
  confirmMessage?: string;
  isDisabled?: boolean;
  onDeleteClick: (deleteFunc: () => void, confirmMessage: string) => void;
}

const DeleteOrganizationsCard: React.FC<CardProps> = ({
  title,
  description,
  count,
  deleteFunc,
  confirmMessage,
  isDisabled = false,
  onDeleteClick  
}) => (
  <Card>
    <div className={`${isDisabled ? "opacity-50 pointer-events-none" : ""} flex flex-wrap dark:text-white w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800`}>
      <p>
        <p className="text-lg font-bold">{title}</p>
        <p>{description}</p>
        {count && <p>Total:{count}</p>}
      </p>
      <button
         className={`${
    isDisabled || count === 0 ? "opacity-50 cursor-not-allowed" : ""
  }`}
  onClick={() => !isDisabled && onDeleteClick(deleteFunc!, confirmMessage!)}
  disabled={isDisabled || count === 0}

      >
        <img
          src="/images/delete_button_image.svg"
          width={25}
          height={25}
          alt=""
        />
      </button>
    </div>
  </Card>
);

export default DeleteOrganizationsCard;
