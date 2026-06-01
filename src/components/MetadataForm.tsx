import React from 'react';
import { Calendar, User, Users, FileText } from 'lucide-react';

interface MetadataFormProps {
  title: string;
  department: string;
  participants: string;
  date: string;
  isRecording: boolean;
  onChange: (field: string, value: string) => void;
}

export default function MetadataForm({
  title,
  department,
  participants,
  date,
  isRecording,
  onChange
}: MetadataFormProps) {
  return (
    <div id="metadata-form-panel" className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 mb-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-display font-semibold text-sm text-[#0B2240] flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-[#C5A880]" />
          회의 기본 정보 입력
        </h3>
        {isRecording && (
          <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium animate-pulse border border-amber-200">
            녹음 실행 중 수정 가능
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            미팅 회의 제목 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-title"
              type="text"
              placeholder="예: 호텔 자동화 플랫폼 기획 주간 미팅"
              value={title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C5A880] focus:bg-white focus:ring-1 focus:ring-[#C5A880] transition-all text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            부서명
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-department"
              type="text"
              placeholder="예: 호텔 IT 사업부"
              value={department}
              onChange={(e) => onChange('department', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C5A880] focus:bg-white focus:ring-1 focus:ring-[#C5A880] transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Meeting Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            회의 일자
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-date"
              type="date"
              value={date}
              onChange={(e) => onChange('date', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C5A880] focus:bg-white focus:ring-1 focus:ring-[#C5A880] transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            참석 임직원 (출석자)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-participants"
              type="text"
              placeholder="예: 김수현 PM, 박성진 개발자, 이주호 팀장 (쉼표로 구분)"
              value={participants}
              onChange={(e) => onChange('participants', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C5A880] focus:bg-white focus:ring-1 focus:ring-[#C5A880] transition-all text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
