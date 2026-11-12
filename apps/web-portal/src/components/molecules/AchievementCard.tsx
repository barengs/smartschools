import { Star, Trophy } from 'lucide-react';
import { Badge, Card } from '../atoms';

interface AchievementCardProps {
  levelLabel: string;
  year: string;
  studentName: string;
  quote: string;
  resultFooter: string;
  initials: string;
  accentTone?: 'blue' | 'emerald';
}

export function AchievementCard({
  levelLabel,
  year,
  studentName,
  quote,
  resultFooter,
  initials,
  accentTone = 'blue',
}: AchievementCardProps) {
  return (
    <Card padding="md" className="flex flex-col sm:flex-row gap-4 items-start">
      <div
        className={`flex h-24 w-full sm:w-28 shrink-0 items-center justify-center rounded-xl border font-extrabold text-2xl ${
          accentTone === 'emerald'
            ? 'bg-gradient-to-br from-emerald-900 to-teal-700 text-white border-emerald-800'
            : 'bg-gradient-to-br from-[#0f2b6b] to-blue-600 text-white border-blue-900'
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <Trophy className="h-5 w-5 text-amber-300" />
          <span className="text-sm tracking-wider">{initials}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={accentTone === 'emerald' ? 'emerald' : 'blue'} uppercase>
            {levelLabel}
          </Badge>
          <span className="text-[11px] font-semibold text-slate-500">{year}</span>
        </div>
        <h3 className="mt-2 text-base font-extrabold text-slate-900">{studentName}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 italic">&ldquo;{quote}&rdquo;</p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#163b8c]">
          <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
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
    <Card padding="md" className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-0.5 text-amber-400 mb-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className="h-4 w-4 fill-amber-400" />
          ))}
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 italic">&ldquo;{quote}&rdquo;</p>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-[#163b8c] border border-blue-200">
          {initials}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">{authorName}</div>
          <div className="text-[11px] text-slate-500">{authorRole}</div>
        </div>
      </div>
    </Card>
  );
}

