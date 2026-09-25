import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import {
  Calendar,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

export const MeetingsScreen: React.FC = () => {
  const { meetings, setIsStartMeetingOpen, openMeetingDetail, teamMembers } = useMeetingFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const projects = ['All', ...Array.from(new Set(meetings.map((m) => m.project)))];
  const statuses = ['All', 'Processed', 'In Review'];

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'All' || meeting.project === selectedProject;
    const matchesStatus = selectedStatus === 'All' || meeting.status === selectedStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Meetings</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Review conversations, decisions and actions from your team's meetings.
          </p>
        </div>
        <button
          onClick={() => setIsStartMeetingOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Start Meeting</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by title or summary..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-indigo-600"
          >
            {projects.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Projects' : p}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-indigo-600"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        {filteredMeetings.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">No meetings found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              No meetings matched your current search filters. Try clearing your query or start a new meeting.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedProject('All');
                setSelectedStatus('All');
              }}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Meeting</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4 text-right">Decisions</th>
                  <th className="py-3 px-4 text-right">Action Items</th>
                  <th className="py-3 px-4 text-right">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMeetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    onClick={() => openMeetingDetail(meeting.id)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors text-sm">
                        {meeting.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 max-w-md">
                        {meeting.summary}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-neutral-600 whitespace-nowrap">
                      <div>{meeting.date}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {meeting.time} · {meeting.duration}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center -space-x-1.5">
                        {meeting.participantIds.map((pid) => {
                          const m = teamMembers.find((t) => t.id === pid);
                          return (
                            <Avatar
                              key={pid}
                              name={m?.name || 'Member'}
                              initials={m?.initials}
                              colorClass={m?.avatarColor}
                              size="xs"
                              className="ring-2 ring-white"
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-neutral-800">
                      {meeting.decisionsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-neutral-800">
                      {meeting.actionsCount}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{meeting.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 group-hover:text-indigo-600 transition-colors">
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
