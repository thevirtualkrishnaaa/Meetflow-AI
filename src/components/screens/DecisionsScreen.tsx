import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Decision } from '../../types';
import {
  Calendar,
  Filter,
  Lightbulb,
  Plus,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const DecisionsScreen: React.FC = () => {
  const { decisions, openMeetingDetail, createDecision, updateDecision } = useMeetingFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedDecisionId, setExpandedDecisionId] = useState<string | null>(null);

  const categories = ['All', 'Product', 'Engineering', 'Operations', 'Finance', 'Marketing'];

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      d.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Decision Log</h1>
          <p className="text-sm text-neutral-500 mt-1">
            A searchable record of what your team agreed to avoid relitigating resolved debates.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decisions by key terms, rationale, or source meeting..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-indigo-600"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Decisions List */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
        {filteredDecisions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-500">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">No decisions recorded</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Decisions from processed meetings will appear here. No decisions matched your search filters.
            </p>
          </div>
        ) : (
          filteredDecisions.map((decision) => {
            const isExpanded = expandedDecisionId === decision.id;

            return (
              <div
                key={decision.id}
                className="p-6 hover:bg-neutral-50/50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-neutral-900 leading-snug">
                        {decision.text}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1.5 flex-wrap">
                        <span
                          onClick={() => openMeetingDetail(decision.meetingId)}
                          className="font-medium text-neutral-700 hover:text-indigo-600 cursor-pointer"
                        >
                          {decision.meetingTitle}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span>{decision.date}</span>
                        {decision.category && (
                          <>
                            <span aria-hidden="true" className="text-neutral-300">·</span>
                            <span className="text-neutral-600">{decision.category}</span>
                          </>
                        )}
                        {decision.confidence && (
                          <>
                            <span aria-hidden="true" className="text-neutral-300">·</span>
                            <span className="text-indigo-600 font-mono text-[11px]">
                              {Math.round(decision.confidence * 100)}% confidence
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                      {decision.status}
                    </span>
                    <button
                      onClick={() =>
                        setExpandedDecisionId(isExpanded ? null : decision.id)
                      }
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                      title={isExpanded ? 'Collapse context' : 'Expand context'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Context & Rationale */}
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 text-xs text-neutral-600 leading-relaxed ml-10">
                  <span className="font-semibold text-neutral-700">Context & Rationale: </span>
                  {decision.context}
                </div>

                {/* Agreement participants */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 ml-10 pt-0.5">
                  <span className="font-medium text-neutral-600">Participants in agreement:</span>
                  <span>{decision.participants.join(', ')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
