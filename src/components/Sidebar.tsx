import React, { useState, useEffect } from 'react';
import { Meeting } from '../types';
import { 
  Building2, 
  Trash2, 
  Calendar, 
  Plus, 
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FilterX,
  List,
  CalendarDays,
  Globe
} from 'lucide-react';

interface SidebarProps {
  meetings: Meeting[];
  currentMeetingId: string | null;
  onSelectMeeting: (id: string) => void;
  onDeleteMeeting: (id: string, e: React.MouseEvent) => void;
  onNewMeeting: (presetDate?: string) => void;
  activeView: 'workspace' | 'blog';
  onViewChange: (view: 'workspace' | 'blog') => void;
}

export default function Sidebar({
  meetings,
  currentMeetingId,
  onSelectMeeting,
  onDeleteMeeting,
  onNewMeeting,
  activeView,
  onViewChange
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toggles and Calendar Filters
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list'); // 'list' or 'calendar'
  const [calendarType, setCalendarType] = useState<'month' | 'week'>('month'); // 'month' or 'week'
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Helper: Format date to YYYY-MM-DD
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Safe preset date to selected if in calendar mode and a selection was made
  useEffect(() => {
    if (viewMode === 'calendar' && !selectedDateStr) {
      setSelectedDateStr(formatDateStr(new Date()));
    }
  }, [viewMode]);

  // Generate 42 days for monthly view (with padding)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Fill leading empty days from previous month
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Fill days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Fill trailing empty days from next month to make exactly 42 cells (6 weeks)
    const totalCells = 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  // Generate 7 days for the current week view
  const getDaysInWeek = (date: Date) => {
    const sun = new Date(date);
    sun.setDate(date.getDate() - date.getDay()); // Go back to Sunday
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Calendar controls
  const handlePrev = () => {
    if (calendarType === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const copy = new Date(currentDate);
      copy.setDate(copy.getDate() - 7);
      setCurrentDate(copy);
    }
  };

  const handleNext = () => {
    if (calendarType === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const copy = new Date(currentDate);
      copy.setDate(copy.getDate() + 7);
      setCurrentDate(copy);
    }
  };

  // Filter meetings based on query and calendar range or selected date
  const filteredMeetings = meetings.filter(m => {
    // 1. Text Search Filter
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Calendar-Based Date Filter
    if (viewMode === 'calendar') {
      if (selectedDateStr) {
        // If a specific day is clicked
        return m.date === selectedDateStr;
      }

      // If no specific day is clicked, filter by visible month/week range
      if (calendarType === 'month') {
        const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        return m.date.startsWith(yearMonth);
      } else {
        const sun = new Date(currentDate);
        sun.setDate(currentDate.getDate() - currentDate.getDay());
        const sat = new Date(sun);
        sat.setDate(sun.getDate() + 6);
        
        const startOfWeek = formatDateStr(sun);
        const endOfWeek = formatDateStr(sat);
        return m.date >= startOfWeek && m.date <= endOfWeek;
      }
    }

    return true; // Simple search list
  });

  const calendarDays = calendarType === 'month' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // Helper: Count meetings on specific day
  const getMeetingCountOnDate = (dateStr: string) => {
    return meetings.filter(m => m.date === dateStr).length;
  };

  // Render weekly header description
  const getWeekRangeLabel = () => {
    const sun = new Date(currentDate);
    sun.setDate(currentDate.getDate() - currentDate.getDay());
    const sat = new Date(sun);
    sat.setDate(sun.getDate() + 6);
    
    const startStr = `${sun.getMonth() + 1}/${sun.getDate()}`;
    const endStr = `${sat.getMonth() + 1}/${sat.getDate()}`;
    return `${sun.getFullYear()}년 ${startStr} ~ ${endStr}`;
  };

  return (
    <aside id="sidebar-container" className="w-80 border-r border-[#C5A880]/20 bg-[#0B2240] text-slate-100 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div id="brand-header animate-fade-in" className="p-5 border-b border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C5A880]/15 rounded-lg border border-[#C5A880]/30 shadow-inner">
            <Building2 className="h-6 w-6 text-[#C5A880]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider text-slate-100 leading-tight">
              SH HOTEL
            </h1>
            <p className="text-[10px] tracking-widest text-[#C5A880] uppercase font-semibold">
              IT Meeting Recorder
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 bg-black/25 px-2.5 py-1 rounded border border-white/5 font-mono">
          대모산 SH호텔 IT 서비스 기획
        </div>
      </div>

      {/* View Selector Tab */}
      <div className="px-4 pt-3 shrink-0 flex gap-2 font-display">
        <button
          onClick={() => onViewChange('workspace')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeView === 'workspace'
              ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40'
              : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>업무 회의록</span>
        </button>
        <button
          onClick={() => onViewChange('blog')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all relative ${
            activeView === 'blog'
              ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/50 shadow-[0_0_12px_rgba(197,168,128,0.25)]'
              : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5'
          }`}
        >
          <Globe className="h-3.5 w-3.5 animate-pulse" />
          <span>김수현 블로그</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
        </button>
      </div>

      {/* Action Button */}
      <div className="p-4 py-3 shrink-0">
        <button
          id="btn-new-meeting"
          onClick={() => onNewMeeting(selectedDateStr || undefined)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#C5A880] hover:bg-[#A38258] text-[#0B2240] font-semibold text-sm rounded-lg transition-all shadow-md active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>
            {selectedDateStr && viewMode === 'calendar' 
              ? `${selectedDateStr.slice(5).replace('-', '월 ')}일 회의 추가` 
              : '새 회의 추가하기'}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="sidebar-search"
            type="text"
            placeholder="회의 제목, 부서, 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all text-slate-200"
          />
        </div>
      </div>

      {/* Content Area (Dynamic: Calendar vs simple list) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 flex flex-col">
        {viewMode === 'calendar' ? (
          /* CALENDAR INTERACTIVE VIEW */
          <div className="space-y-4 px-2 animate-fade-in flex flex-col shrink-0">
            {/* Calendar Controls header */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  일정 캘린더 필터
                </span>
                
                {/* Month vs Week toggle tabs */}
                <div className="flex bg-white/10 p-0.5 rounded-md text-[10px] border border-white/5 font-semibold">
                  <button
                    onClick={() => setCalendarType('month')}
                    className={`px-2 py-1 rounded transition-colors ${calendarType === 'month' ? 'bg-[#C5A880] text-[#0B2240] font-bold' : 'text-slate-300 hover:text-white'}`}
                  >
                    월간
                  </button>
                  <button
                    onClick={() => setCalendarType('week')}
                    className={`px-2 py-1 rounded transition-colors ${calendarType === 'week' ? 'bg-[#C5A880] text-[#0B2240] font-bold' : 'text-slate-300 hover:text-white'}`}
                  >
                    주간
                  </button>
                </div>
              </div>

              {/* Date Nav row */}
              <div className="flex items-center justify-between pt-0.5 border-t border-white/5">
                <button 
                  onClick={handlePrev}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-300"
                  title="이전 일정 범위"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-100 whitespace-nowrap">
                  {calendarType === 'month' 
                    ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`
                    : getWeekRangeLabel()}
                </span>
                <button 
                  onClick={handleNext}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-300"
                  title="다음 일정 범위"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Weekday indicator labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-bold">
                {weekdays.map((w, idx) => (
                  <span key={w} className={idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-300' : 'text-slate-300'}>
                    {w}
                  </span>
                ))}
              </div>

              {/* Grid Cells (Month range: 42 or Week range: 7) */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dayStr = formatDateStr(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isSelected = selectedDateStr === dayStr;
                  const meetingCount = getMeetingCountOnDate(dayStr);
                  const isToday = formatDateStr(new Date()) === dayStr;
                  
                  // Text styles
                  let cellClasses = "relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all aspect-square ";
                  if (isSelected) {
                    cellClasses += "bg-[#C5A880] text-[#0B2240] font-extrabold shadow-inner scale-105 border border-[#C5A880]/50 ";
                  } else if (isToday) {
                    cellClasses += "bg-white/20 text-white font-bold border border-[#C5A880]/30 ";
                  } else {
                    cellClasses += "hover:bg-white/10 ";
                    if (calendarType === 'month' && !isCurrentMonth) {
                      cellClasses += "text-white/30 "; // Out of month padding
                    } else {
                      cellClasses += "text-slate-200 ";
                    }
                  }

                  return (
                    <div
                      key={day.getTime() + '-' + idx}
                      onClick={() => {
                        // Toggle logic
                        if (selectedDateStr === dayStr) {
                          setSelectedDateStr(null);
                        } else {
                          setSelectedDateStr(dayStr);
                        }
                      }}
                      className={cellClasses}
                      title={`${dayStr} (회의: ${meetingCount}개)`}
                    >
                      <span>{day.getDate()}</span>
                      
                      {/* Meeting dots indicator badge */}
                      {meetingCount > 0 && (
                        <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0B2240]' : 'bg-[#C5A880] animate-pulse'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reset filter / Selection notification bar */}
              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-[11.5px] border border-white/5">
                <span className="text-slate-300">
                  {selectedDateStr ? (
                    <>선택일: <strong className="text-[#C5A880] font-mono">{selectedDateStr.slice(5)}</strong></>
                  ) : (
                    <span className="text-[10px] text-slate-400">캘린더 날짜를 선택하여 필터링</span>
                  )}
                </span>
                {selectedDateStr && (
                  <button
                    onClick={() => setSelectedDateStr(null)}
                    className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                    title="선택 요일 필터 비활성화"
                  >
                    <FilterX className="h-3 w-3" />
                    <span>해제</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* LIST RENDERER HEADER */}
        <div className="px-3 py-3 shrink-0 flex items-center justify-between border-b border-white/10 mb-2">
          <p className="text-[11px] font-bold text-[#C5A880] uppercase tracking-widest font-display">
            {viewMode === 'calendar' ? '필터링된 회의 이력' : '미팅 히스토리'} ({filteredMeetings.length})
          </p>
        </div>

        {/* LIST OF MEETINGS */}
        {filteredMeetings.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 h-48">
            <Calendar className="h-6 w-6 text-[#C5A880]/40 mb-1" />
            <p className="text-xs">일치하는 미팅 기록이 없습니다.</p>
            {selectedDateStr && viewMode === 'calendar' && (
              <button
                onClick={() => onNewMeeting(selectedDateStr)}
                className="mt-2 text-[11px] font-bold text-[#C5A880] hover:underline"
              >
                + 이 날짜에 새 기획 추가하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 pr-1">
            {filteredMeetings.map((meeting) => {
              const isActive = meeting.id === currentMeetingId;
              return (
                <div
                  key={meeting.id}
                  id={`meeting-item-${meeting.id}`}
                  onClick={() => onSelectMeeting(meeting.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-white/10 border-[#C5A880]/60 shadow-md translate-x-1'
                      : 'bg-white/0 border-transparent hover:bg-white/5 hover:border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 pr-6">
                    <h3 className="font-medium text-[12.5px] text-slate-100 group-hover:text-[#C5A880] transition-colors line-clamp-1">
                      {meeting.title || '제목 없는 미팅'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-450 text-slate-400">
                    <Building2 className="h-3 w-3" />
                    <span className="line-clamp-1">{meeting.department || '부서 비공개'}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10.5px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{meeting.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {meeting.isAiSummarized && (
                        <span className="flex items-center gap-0.5 px-1 bg-[#C5A880]/20 text-[#C5A880] rounded text-[9px] font-semibold border border-[#C5A880]/30 scale-95">
                          <Sparkles className="h-2 w-2" />
                          AI
                        </span>
                      )}
                      
                      <button
                        id={`btn-delete-${meeting.id}`}
                        onClick={(e) => onDeleteMeeting(meeting.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-400 transition-opacity p-0.5 hover:bg-slate-800 rounded"
                        title="기록 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Switcher Controls at the bottom of the sidebar */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/15 flex items-center justify-between shrink-0">
        <span className="text-[11px] text-[#C5A880] font-sans font-semibold tracking-wider uppercase">보기 방식</span>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all font-medium ${viewMode === 'list' ? 'bg-[#C5A880] text-[#0B2240] font-bold shadow' : 'text-slate-300 hover:text-white'}`}
          >
            <List className="h-3 w-3" />
            <span>목록</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all font-medium ${viewMode === 'calendar' ? 'bg-[#C5A880] text-[#0B2240] font-bold shadow' : 'text-slate-300 hover:text-white'}`}
          >
            <CalendarDays className="h-3 w-3" />
            <span>캘린더</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 text-[11px] text-slate-400 font-mono text-center bg-black/10 shrink-0">
        SH Hotel System Environment
      </div>
    </aside>
  );
}
