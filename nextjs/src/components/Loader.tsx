import React from 'react';

const Loader = ({
  colorClass = 'border-primary',
  height = '1.5rem',
  width = '1.5rem'
}: {
  colorClass?: string;
  height?: string;
  width?: string;
}) => {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='relative' style={{ height, width }}>
        <div
          className={`absolute inset-0 animate-spin rounded-full border-2 border-t-transparent ${colorClass}`}
        />
      </div>
    </div>
  );
};

export default Loader;
