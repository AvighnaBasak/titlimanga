import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="section-line mb-3" />
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{title}</h2>
      {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
