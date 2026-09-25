import React from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { meetings, actionItems, decisions } = useMeetingFlow();

  const totalMeetings = 18;
  const totalActionsCreated = 64;
  const totalCompleted = 42;
  const totalOverdue = actionItems.filter((a) => a.status === 'Overdue').length;
  const totalDecisions = decisions.length + 11; // 18 this week + historical

  // Weekly data for simple visual chart
  const weeklyData = [
    { week: 'W1 (Sep 1-7)', created: 14, completed: 9, meetings: 3 },
    { week: 'W2 (Sep 8-14)', created: 16, completed: 12, meetings: 4 },
    { week: 'W3 (Sep 15-21)', created: 18, completed: 15, meetings: 5 },
    { week: 'W4 (Current)', created: 16, completed: 14, meetings: 6 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Execution Analytics
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Objective metrics on team velocity, follow-through rate, and meeting outcomes.
        </p>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Meetings Completed</div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
            {totalMeetings}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+3 vs last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Action Items Created</div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
            {totalActionsCreated}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">3.5 per meeting avg</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Actions Completed</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {totalCompleted}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>66% completion rate</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Overdue Actions</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {totalOverdue}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Attention needed
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Decisions Logged</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {totalDecisions}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Searchable archive</div>
        </div>
      </div>

      {/* Simple Execution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Action Item Completion Over Time */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Weekly Action Completion Velocity
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Comparison of commitments made vs items resolved.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
                <span>Completed</span>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="w-2.5 h-2.5 rounded bg-neutral-200" />
                <span>Created</span>
              </span>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {weeklyData.map((item) => (
              <div key={item.week} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700">{item.week}</span>
                  <span className="font-mono text-neutral-500 text-[11px]">
                    {item.completed} / {item.created} ({Math.round((item.completed / item.created) * 100)}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-neutral-100 rounded-md overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full rounded-l-md transition-all"
                    style={{ width: `${(item.completed / 20) * 100}%` }}
                  />
                  <div
                    className="bg-neutral-300 h-full rounded-r-md transition-all"
                    style={{ width: `${((item.created - item.completed) / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Meeting Volume & Decisions by Week */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Meeting Efficiency & Decisions Recorded
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tracking decision density per conversation.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-4 text-center">
            {weeklyData.map((item, idx) => (
              <div key={item.week} className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-col justify-between">
                <div className="text-[11px] font-medium text-neutral-500">W{idx + 1}</div>
                <div className="my-2">
                  <div className="text-xl font-bold font-mono text-neutral-900">
                    {item.meetings}
                  </div>
                  <div className="text-[10px] text-neutral-400">meetings</div>
                </div>
                <div className="pt-2 border-t border-neutral-200/60 text-xs font-mono font-semibold text-amber-700">
                  {item.meetings * 2 + 1} decisions
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-100 mt-2">
            Average decision yield: <strong className="text-neutral-800 font-mono">2.8 decisions</strong> per 45 minutes of meeting time.
          </div>
        </div>
      </div>

      {/* Team Execution Insights Section */}
      <section className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Team Execution Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-1">
            <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Velocity Improvement</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Action-item completion increased by <strong>18%</strong> compared with the previous week, driven by shorter check-in cycles and clearer task ownership.
            </p>
          </div>

          <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100 space-y-1">
            <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Bottleneck Detection</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Marketing meetings currently generate the highest number of overdue actions. Consider scoping task deliverables into sub-milestones during planning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
