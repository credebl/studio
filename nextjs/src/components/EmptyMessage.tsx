import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  height?: string;
}

export const EmptyMessage = ({
  title,
  description,
  height = '300px'
}: EmptyStateProps) => {
  return (
    <div
      className='flex flex-col items-center justify-center text-center'
      style={{ height }}
    >
      <h1 className='text-2xl font-bold'>{title}</h1>
      {description && (
        <p className='text-muted-foreground mt-2 text-sm'>{description}</p>
      )}
    </div>
  );
};
