import { Tooltip } from 'flowbite-react';
import React from 'react';

interface TooltipProps<Type> {
  data: Type[]; 
  renderItem: (item: Type) => string;
  id?: string;
  children?: React.ReactNode;
}

const DataTooltip = <Type,>({ data, renderItem, children }: TooltipProps<Type>) => {
  const content = data.map(renderItem).join(', ');

  return (
    <Tooltip content={content} placement="top">
      {children}
    </Tooltip>
  );
};

export default DataTooltip;
