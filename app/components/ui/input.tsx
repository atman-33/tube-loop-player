import type { ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  className?: string;
};

export const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input className={`px-3 py-2 border rounded-md ${className}`} {...props} />
  );
};
