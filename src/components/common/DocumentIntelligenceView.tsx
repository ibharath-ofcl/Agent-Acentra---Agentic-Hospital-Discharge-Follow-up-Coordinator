import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  FileCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SourceEvidenceTag } from './SourceEvidenceTag';

interface ExtractedItem {
  id: string;
  type: 'Follow-up' | 'Test' | 'Referral' | 'Instruction' | 'Warning Sign';
  content: string;
  date?: string;
  sourceText: string;
  sourcePage: number;
  status: 'verified' | 'needs-review';
}

const mockExtractedItems: ExtractedItem[] = [
  {
    id: 'EXT001',
    type: 'Follow-up',
    content: 'Cardiology',
    date: '15 October 2026',
    sourceText: 'Follow up with Cardiology in 2 weeks.',
    sourcePage: 2,
    status: 'verified',
  },
  {
    id: 'EXT002',
    type: 'Test',
    content: 'Blood Test (CBC, BMP)',
    date: '18 October 2026',
    sourceText: 'Repeat blood work on 10/18/2026 before clinic visit.',
    sourcePage: 2,
    status: 'verified',
  },
  {
    id: 'EXT003',
    type: 'Referral',
    content: 'Physiotherapy',
    sourceText: 'Outpatient PT evaluation and treat 2x/week for 4 weeks.',
    sourcePage: 3,
    status: 'verified',
  },
  {
    id: 'EXT004',
    type: 'Instruction',
    content: 'Wound care follow-up',
    sourceText: 'Keep incision clean and dry. Change dressing daily.',
    sourcePage: 1,
    status: 'verified',
  },
  {
    id: 'EXT005',
    type: 'Instruction',
    content: 'Medication change',
    sourceText: 'Increase Metoprolol to 50mg daily.',
    sourcePage: 1,
    status: 'verified',
  },
  {
    id: 'EXT006',
    type: 'Warning Sign',
    content: 'Return to ER if high fever occurs',
    sourceText: 'Return to emergency room for signs of infection, high fever, or severe uncontrolled pain.',
    sourcePage: 4,
    status: 'needs-review',
  },
];

export function DocumentIntelligenceView() {
  const [selectedItem, setSelectedItem] = useState<ExtractedItem | null>(null);

  const stats = {
    total: mockExtractedItems.length,
    verified: mockExtractedItems.filter(i => i.status === 'verified').length,
    needsReview: mockExtractedItems.filter(i => i.status === 'needs-review').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">Document Intelligence</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Synthetic Demo Data
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Frontend foundation for future AI document processing and PDF extraction.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Document</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <FileCheck className="w-4 h-4 text-teal-600" /> Discharge Summary — Arun Kumar
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 inline-block w-max">
                Processed
              </span>
            </div>
          </div>
        </div>

        {/* Extraction Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.total} items</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Extracted</div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-800">{stats.verified} items</div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Verified</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-800">{stats.needsReview} item</div>
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Needs Review</div>
            </div>
          </div>
        </div>

        {/* Extracted Fields Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" /> Extracted Structured Data
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Target Date</th>
                  <th className="px-4 py-3">Source Evidence</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockExtractedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-700">{item.type}</td>
                    <td className="px-4 py-3 text-slate-900">{item.content}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.date || '—'}</td>
                    <td className="px-4 py-3">
                      <SourceEvidenceTag evidence={{ documentId: 'doc1', documentName: 'Discharge Summary', pageNumber: item.sourcePage, extractedText: item.sourceText, confidence: item.status === 'verified' ? 98 : 65 }} />
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Needs Review
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-md border border-teal-200 transition-colors"
                      >
                        View Source <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Source Interaction Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-slate-800">Source Evidence Verification</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Synthetic Document View */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 h-64 overflow-y-auto">
                <div className="text-xs font-mono text-slate-400 mb-2 border-b border-slate-200 pb-2 font-bold tracking-wider">
                  PAGE {selectedItem.sourcePage} - DISCHARGE SUMMARY
                </div>
                <div className="space-y-3 text-sm text-slate-600 blur-[1.5px] select-none opacity-40">
                  <p>Patient was admitted on 10/01/2026 for scheduled procedure. Post-operative course was unremarkable.</p>
                  <p>Vitals remained stable throughout the stay. Pain managed with oral analgesics.</p>
                </div>
                <div className="my-3 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-sm text-amber-900 font-medium shadow-xs relative">
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-xs">
                    AI
                  </span>
                  {selectedItem.sourceText}
                </div>
                <div className="space-y-3 text-sm text-slate-600 blur-[1.5px] select-none opacity-40">
                  <p>Diet advanced as tolerated. Patient cleared for discharge by attending physician.</p>
                  <p>Return to emergency room for signs of infection, high fever, or severe uncontrolled pain.</p>
                  <p>Follow up with primary care physician in 4 weeks. Resume normal activities as tolerated.</p>
                </div>
              </div>

              {/* Extraction Details */}
              <div className="flex flex-col gap-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Extracted Type</div>
                  <div className="font-bold text-slate-800 text-lg">{selectedItem.type}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Structured Content</div>
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-teal-900 font-medium">
                    {selectedItem.content}
                    {selectedItem.date && <div className="text-xs text-teal-700 mt-1 font-mono font-semibold">{selectedItem.date}</div>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence Score</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className={`h-full rounded-full ${selectedItem.status === 'verified' ? 'bg-emerald-500 w-11/12' : 'bg-amber-500 w-7/12'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {selectedItem.status === 'verified' ? '98%' : '65%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// X icon for modal
function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
