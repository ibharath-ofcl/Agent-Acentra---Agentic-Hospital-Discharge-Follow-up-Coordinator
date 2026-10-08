import { ArrowDown } from 'lucide-react';
import type { FollowUpTask } from '../../types';

interface TaskDependencyGraphProps {
  primaryTask: FollowUpTask;
  dependentTasks: FollowUpTask[];
  allTasks: FollowUpTask[];
}

export function TaskDependencyGraph({ primaryTask, dependentTasks, allTasks }: TaskDependencyGraphProps) {
  // Simple assumption: either this task depends on others (child), or others depend on this task (parent).
  // For demo: if primaryTask has dependencyLinks, we show the parent -> primaryTask flow.
  // If dependentTasks is not empty, we show primaryTask -> dependentTasks flow.
  
  if (!primaryTask.dependencyLinks?.length && !dependentTasks.length) {
    return null; // No dependencies
  }

  // We are handling the specific scenario requested:
  // X-Ray (Overdue) -> Dependency Risk -> Orthopedic Follow-up (At Risk)

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6 relative overflow-hidden">
      {/* Decorative subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 pointer-events-none" />

      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-soft" /> 
        Care Dependency Intelligence
      </h3>

      {/* Flag Panel */}
      {(primaryTask.status === 'at-risk' || primaryTask.status === 'overdue') && (
        <div className="mb-6 bg-red-50/80 border border-red-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-xs font-black text-red-900 uppercase tracking-wider mb-2">Why is this flagged?</h4>
          
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-red-700">Issue:</span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                {primaryTask.status === 'at-risk' 
                  ? "A prerequisite task is overdue, placing this follow-up at workflow risk."
                  : "This task is overdue and blocking a dependent follow-up."}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Source:</span>
              <p className="text-[11px] font-mono text-slate-700 mt-0.5">
                {primaryTask.sourceEvidence?.documentName} • Page {primaryTask.sourceEvidence?.pageNumber}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Dependency:</span>
              <p className="text-xs text-slate-800 font-medium mt-0.5">
                {primaryTask.dependencyLinks?.find(d => d.type === 'required-before') 
                  ? "Required before the scheduled clinical review."
                  : "Requires a prior task to be completed."}
              </p>
            </div>
            
            <div className="mt-2 pt-2 border-t border-red-200/50 flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                ⚠️ Workflow Risk Only
              </span>
              <span className="text-[10px] text-red-700 font-medium italic">
                Does not imply medical deterioration.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Flow Visualization */}
      <div className="relative flex flex-col items-center">
        {/* If this task has dependencies (it is the child) */}
        {primaryTask.dependencyLinks?.map((dep, idx) => {
          const parentTask = allTasks.find(t => t.id === dep.dependsOnTaskId);
          if (!parentTask) return null;

          return (
            <div key={idx} className="w-full flex flex-col items-center group">
              {/* Parent Task Node */}
              <div className={`w-full max-w-sm rounded-xl border p-4 text-center transition-all ${
                parentTask.status === 'overdue' ? 'bg-white border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white border-slate-200'
              }`}>
                <div className="font-bold text-sm text-slate-900">{parentTask.title}</div>
                <div className="flex justify-center items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Due: {parentTask.dueDate}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    parentTask.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {parentTask.status}
                  </span>
                </div>
              </div>

              {/* Connecting Edge with Flow Animation */}
              <div className="flex flex-col items-center my-2 relative">
                <div className="h-6 w-px bg-slate-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-teal-500 animate-[flow-down_1.5s_ease-in-out_infinite] origin-top" />
                </div>
                <div className="bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
                  {parentTask.status === 'overdue' ? 'Dependency Risk' : 'Required Before'}
                </div>
                <div className="h-6 w-px bg-slate-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-teal-500 animate-[flow-down_1.5s_ease-in-out_infinite_0.75s] origin-top" />
                </div>
                <ArrowDown className="w-4 h-4 text-slate-400 -mt-1 z-10" />
              </div>
            </div>
          );
        })}

        {/* Primary Task Node */}
        <div className={`w-full max-w-sm rounded-xl border p-4 text-center relative z-10 transition-all ${
          primaryTask.status === 'at-risk' ? 'bg-[#052429] border-[#00e575] text-white shadow-[0_4px_20px_rgba(0,229,117,0.15)]' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="font-bold text-sm">{primaryTask.title}</div>
          <div className="flex justify-center items-center gap-2 mt-1.5">
            <span className={`text-[11px] font-medium ${primaryTask.status === 'at-risk' ? 'text-slate-300' : 'text-slate-500'}`}>
              Due: {primaryTask.dueDate}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
              primaryTask.status === 'at-risk' ? 'bg-[#00e575]/20 text-[#00e575] border-[#00e575]/30' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {primaryTask.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* If this task has dependents (it is the parent) */}
        {dependentTasks.map((childTask, idx) => (
          <div key={idx} className="w-full flex flex-col items-center group">
            {/* Connecting Edge */}
            <div className="flex flex-col items-center my-2 relative">
              <div className="h-6 w-px bg-slate-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-teal-500 animate-[flow-down_1.5s_ease-in-out_infinite] origin-top" />
              </div>
              <div className="bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
                {primaryTask.status === 'overdue' ? 'Dependency Risk' : 'Required Before'}
              </div>
              <div className="h-6 w-px bg-slate-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-teal-500 animate-[flow-down_1.5s_ease-in-out_infinite_0.75s] origin-top" />
              </div>
              <ArrowDown className="w-4 h-4 text-slate-400 -mt-1 z-10" />
            </div>

            {/* Child Task Node */}
            <div className={`w-full max-w-sm rounded-xl border p-4 text-center transition-all ${
              childTask.status === 'at-risk' ? 'bg-[#052429] border-[#00e575] text-white shadow-[0_4px_20px_rgba(0,229,117,0.15)]' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="font-bold text-sm">{childTask.title}</div>
              <div className="flex justify-center items-center gap-2 mt-1.5">
                <span className={`text-[11px] font-medium ${childTask.status === 'at-risk' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Due: {childTask.dueDate}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  childTask.status === 'at-risk' ? 'bg-[#00e575]/20 text-[#00e575] border-[#00e575]/30' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {childTask.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* If there's an AT RISK task, point to human review */}
        {(primaryTask.status === 'at-risk' || primaryTask.status === 'overdue') && (
           <div className="w-full flex flex-col items-center mt-2">
             <div className="h-8 w-px border-l-2 border-dashed border-amber-400 relative" />
             <ArrowDown className="w-4 h-4 text-amber-500 -mt-1 mb-2 z-10" />
             <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-lg px-4 py-2 text-xs font-bold shadow-sm">
               Escalated to Care Coordinator Review
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
