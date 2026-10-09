import { clsx } from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center p-8', className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
    </div>
  );
}
