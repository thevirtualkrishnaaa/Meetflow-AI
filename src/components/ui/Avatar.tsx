import React from 'react';

interface AvatarProps {
  name: string;
  initials?: string;
  colorClass?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  initials,
  colorClass = 'bg-neutral-800 text-white',
  size = 'md',
  className = '',
}) => {
  const displayInitials =
    initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs font-medium',
    lg: 'w-10 h-10 text-sm font-semibold',
  };

  return (
    <div
      title={name}
      className={`inline-flex items-center justify-center rounded-md select-none shrink-0 font-sans tracking-tight shadow-2xs ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      {displayInitials}
    </div>
  );
};
