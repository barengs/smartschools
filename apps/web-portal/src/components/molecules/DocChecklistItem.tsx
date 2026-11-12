import { AlertCircle, CheckCircle2, Eye, FileText } from 'lucide-react';
import { PpdbDocCheckItem } from '../../store/slices/ppdbPublicSlice';

interface DocChecklistItemProps {
  item: PpdbDocCheckItem;
  onPreview?: (item: PpdbDocCheckItem) => void;
}

export function DocChecklistItem({ item, onPreview }: DocChecklistItemProps) {
  const isRequired = item.status === 'REQUIRED';

  return (
    <div
      className={`flex items-center justify-between gap-2.5 rounded border px-3 py-2.5 text-xs ${
        isRequired
          ? 'border-rose-200 bg-rose-50/70 text-rose-950'
          : 'border-slate-200 bg-slate-50/70 text-slate-800'
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <FileText
          className={`h-4 w-4 mt-0.5 shrink-0 ${
            isRequired ? 'text-rose-500' : 'text-[#163b8c]'
          }`}
        />
        <div className="min-w-0">
          <div className="font-bold truncate">{item.title}</div>
          <div
            className={`text-[11px] truncate ${
              isRequired ? 'text-rose-600 font-medium' : 'text-slate-500'
            }`}
          >
            {item.fileName}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onPreview && !isRequired && (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#163b8c]"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
        )}
        {isRequired ? (
          <AlertCircle className="h-4 w-4 text-rose-600" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        )}
      </div>
    </div>
  );
}

