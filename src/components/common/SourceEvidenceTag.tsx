import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import type { SourceEvidence } from '../../types';

interface SourceEvidenceTagProps {
  evidence: SourceEvidence;
}

export function SourceEvidenceTag({ evidence }: SourceEvidenceTagProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2.5 rounded-lg border border-teal-900/15 bg-teal-950/5 text-xs text-slate-800">
      <div
        className="flex items-center justify-between p-2 px-3 cursor-pointer hover:bg-teal-950/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-teal-800 shrink-0" />
          <span className="font-semibold text-teal-950">
            Source: <span className="font-medium text-slate-700">{evidence.documentName}</span> • Page {evidence.pageNumber}
          </span>
        </div>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] font-medium ml-2"
        >
          <span>{expanded ? 'Hide' : 'Inspect'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-teal-900/10 bg-white/70 rounded-b-lg">
          <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-200 mt-1">
            "{evidence.extractedText}"
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-500">
              Section: <strong className="text-slate-700">{evidence.sectionTitle || 'Clinical Orders'}</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              OCR Match Confidence: {Math.round(evidence.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
