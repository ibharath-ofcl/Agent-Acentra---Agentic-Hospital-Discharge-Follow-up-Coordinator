import { FileText } from 'lucide-react';
import type { SourceEvidence } from '../../types';

interface SourceEvidenceTagProps {
  evidence: SourceEvidence;
}

export function SourceEvidenceTag({ evidence }: SourceEvidenceTagProps) {
  return (
    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-primary-50/60 border border-primary-100">
      <FileText className="w-3.5 h-3.5 text-primary-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-primary-700 font-medium leading-tight">
          Source: {evidence.documentName}
        </p>
        <p className="text-xs text-primary-500 mt-0.5">
          Page {evidence.pageNumber}
          {evidence.sectionTitle && <> · {evidence.sectionTitle}</>}
        </p>
        {evidence.confidence < 0.80 && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Low confidence ({Math.round(evidence.confidence * 100)}%) — may need review
          </p>
        )}
      </div>
    </div>
  );
}
