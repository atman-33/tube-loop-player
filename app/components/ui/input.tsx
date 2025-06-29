import type { ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  className?: string;
};

export const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input className={`rounded-md border px-3 py-2 ${className}`} {...props} />
  );
};
