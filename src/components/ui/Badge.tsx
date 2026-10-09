import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  className?: string;
}

export function Badge({ label, color = 'green', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-green-100 text-green-800': color === 'green',
          'bg-blue-100 text-blue-800': color === 'blue',
          'bg-yellow-100 text-yellow-800': color === 'yellow',
          'bg-red-100 text-red-800': color === 'red',
          'bg-gray-100 text-gray-800': color === 'gray',
        },
        className
      )}
    >
      {label}
    </span>
  );
}
