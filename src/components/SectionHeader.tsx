import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, viewAllHref, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-5 flex items-center justify-between', className)}>
      <div className="flex items-start gap-3">
        <div className="section-line mt-0.5" />
        <div>
          <h2 className="text-[17px] sm:text-[19px] font-bold text-text-primary leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-muted text-[11px] mt-1 leading-none">{subtitle}</p>
          )}
        </div>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-[12px] text-text-muted hover:text-accent-purple transition-colors flex-shrink-0 ml-4 font-medium"
        >
          See All →
        </Link>
      )}
    </div>
  );
}
