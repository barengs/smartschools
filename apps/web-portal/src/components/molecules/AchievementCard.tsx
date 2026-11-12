import { Star, Trophy } from 'lucide-react';
import { Badge, Card } from '../atoms';

interface AchievementCardProps {
  levelLabel: string;
  year: string;
  studentName: string;
  quote: string;
  resultFooter: string;
  initials: string;
  imageUrl?: string;
  accentTone?: 'blue' | 'emerald';
}

export function AchievementCard({
  levelLabel,
  year,
  studentName,
  quote,
  resultFooter,
  initials,
  imageUrl,
  accentTone = 'blue',
}: AchievementCardProps) {
  return (
    <Card padding="md" className="flex flex-col sm:flex-row gap-4 items-start">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={studentName}
          className="h-44 sm:h-32 w-full sm:w-40 shrink-0 rounded-md border border-[#dee2e6] object-cover"
        />
      ) : (
        <div
          className={`flex h-32 w-full sm:w-36 shrink-0 items-center justify-center rounded-md border font-bold text-xl ${
            accentTone === 'emerald'
              ? 'bg-[#198754] text-white border-[#146c43]'
              : 'bg-[#0d6efd] text-white border-[#0a58ca]'
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <Trophy className="h-5 w-5 text-amber-300" />
            <span className="text-sm">{initials}</span>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={accentTone === 'emerald' ? 'emerald' : 'blue'}>{levelLabel}</Badge>
          <span className="text-sm font-medium text-[#6c757d]">{year}</span>
        </div>
        <h3 className="mt-2 text-lg font-bold text-[#212529]">{studentName}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#495057]">&ldquo;{quote}&rdquo;</p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#0a58ca]">
          <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
          <span>{resultFooter}</span>
        </div>
      </div>
    </Card>
  );
}

interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorRole: string;
  initials: string;
}

export function TestimonialCard({
  quote,
  authorName,
  authorRole,
  initials,
}: TestimonialCardProps) {
  return (
    <Card padding="md" className="flex flex-col justify-between border-l-4 border-l-[#0d6efd]">
      <div>
        <div className="flex items-center gap-1 text-amber-400 mb-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className="h-4 w-4 fill-amber-400" />
          ))}
        </div>
        <p className="text-base leading-relaxed text-[#212529]">&ldquo;{quote}&rdquo;</p>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-[#dee2e6] pt-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#cfe2ff] text-sm font-bold text-[#052c65]">
          {initials}
        </div>
        <div>
          <div className="text-sm font-bold text-[#212529]">{authorName}</div>
          <div className="text-xs text-[#6c757d]">{authorRole}</div>
        </div>
      </div>
    </Card>
  );
}
