import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Edit3, 
  Check, 
  Download, 
  Sparkles,
  Clipboard,
  ClipboardCheck,
  RefreshCw,
  FileDown
} from 'lucide-react';

interface TranscriptEditorProps {
  content: string;
  interimContent: string;
  isEditing: boolean;
  status: 'idle' | 'listening' | 'paused' | 'error';
  onContentChange: (newContent: string) => void;
  onToggleEdit: () => void;
  onTriggerSummarize: () => void;
  isSummarizing: boolean;
}

export default function TranscriptEditor({
  content,
  interimContent,
  isEditing,
  status,
  onContentChange,
  onToggleEdit,
  onTriggerSummarize,
  isSummarizing
}: TranscriptEditorProps) {
  const [copied, setCopied] = useState(false);
  const textEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of the content container only if we are recording
  useEffect(() => {
    if (status === 'listening' && textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, interimContent, status]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Meeting_Transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasContent = content.trim().length > 0 || interimContent.trim().length > 0;

  return (
    <div id="transcript-editor-panel" className="bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col h-[520px] overflow-hidden animate-fade-in">
      
      {/* Header bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-[#0B2240]" />
          <span className="font-display font-semibold text-sm text-[#0B2240]">음성 실시간 대안 기록 (STT)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Copy button */}
          {content.trim() && (
            <button
              id="btn-copy-transcript"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-100 transition-all font-medium"
              title="클립보드에 전체 텍스트 복사"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600">복사 완료</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5 text-slate-500" />
                  <span>복사</span>
                </>
              )}
            </button>
          )}

          {/* Download TXT button */}
          {content.trim() && (
            <button
              id="btn-download-transcript"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#C5A880]/30 text-[#A38258] bg-[#C5A880]/5 rounded-lg text-xs hover:bg-[#C5A880]/10 transition-all font-medium"
              title="메모장(.txt) 파일로 다운로드"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>텍스트 다운로드</span>
            </button>
          )}

          {/* Edit Toggle button */}
          {status !== 'listening' && (
            <button
              id="btn-toggle-editor"
              onClick={onToggleEdit}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isEditing
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>수정 완료</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>텍스트 임의 수정</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50">
        {!hasContent ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <div className="p-4 bg-white rounded-full border border-slate-100 shadow-sm mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="font-semibold text-sm text-slate-700">실시간 미팅 기록 영역</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              상단의 [STT 녹음 시작] 버튼을 누른 상태에서 대화하면, 이곳에 회의 내용이 실시간으로 텍스트화되어 출력됩니다.
            </p>
          </div>
        ) : isEditing ? (
          <textarea
            id="editor-textarea"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all resize-none shadow-inner"
            placeholder="수정할 회의 내용을 여기에 적어주세요..."
          />
        ) : (
          <div className="space-y-4 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-5 rounded-xl border border-slate-200/60 min-h-full">
            {/* Confirmed items */}
            {content ? (
              <span className="text-slate-800 transition-all font-normal">
                {content}
              </span>
            ) : null}

            {/* Interim items (italicized glow) */}
            {interimContent ? (
              <span className="text-[#A38258] italic font-medium ml-1 bg-amber-50/70 border-b border-amber-200 px-1 py-0.5 rounded animate-pulse">
                {interimContent}...
              </span>
            ) : null}

            <div ref={textEndRef} />
          </div>
        )}
      </div>

      {/* AI Trigger Footer inside the box */}
      {content.trim().length > 0 && status !== 'listening' && (
        <div className="bg-white border-t border-slate-100 p-3.5 flex justify-end">
          <button
            id="btn-summarize-meeting"
            disabled={isSummarizing}
            onClick={onTriggerSummarize}
            className="flex items-center gap-2 py-2 px-5 bg-gradient-to-r from-[#0B2240] to-[#1E3A5F] text-[#C5A880] font-bold text-sm bg-indigo-900 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isSummarizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-[#C5A880]" />
                <span>AI 요약 분석 수립 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#C5A880]" />
                <span>AI 회의록 요약 & Action Item 분석</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
