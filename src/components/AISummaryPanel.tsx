import React, { useState } from 'react';
import { 
  Sparkles, 
  Clipboard, 
  ClipboardCheck, 
  CheckSquare, 
  FileCheck2,
  Mail,
  AlertCircle
} from 'lucide-react';

interface AISummaryPanelProps {
  summary: string;
  actionItems: string[];
  isSummarizing: boolean;
  meetingTitle: string;
  meetingDept: string;
  meetingParticipants: string;
  meetingDate: string;
}

export default function AISummaryPanel({
  summary,
  actionItems,
  isSummarizing,
  meetingTitle,
  meetingDept,
  meetingParticipants,
  meetingDate
}: AISummaryPanelProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [completedTodos, setCompletedTodos] = useState<Record<number, boolean>>({});

  const toggleTodo = (idx: number) => {
    setCompletedTodos(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Convert markdown to rich inline-styled email template HTML
  const generateEmailHtml = () => {
    const lines = summary.split('\n');
    const parsedSummaryHtml = lines.map(line => {
      // Basic bold parsing inside HTML
      let cleanLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (line.startsWith('### ')) {
        return `<h4 style="color:#0B2240; font-family:'Inter', sans-serif; font-size:14px; margin-top:16px; margin-bottom:8px; border-left:3px solid #C5A880; padding-left:8px; font-weight:bold;">${cleanLine.substring(4)}</h4>`;
      }
      if (line.startsWith('## ')) {
        return `<h3 style="color:#0B2240; font-family:'Inter', sans-serif; font-size:16px; margin-top:20px; margin-bottom:10px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; font-weight:bold;">${cleanLine.substring(3)}</h3>`;
      }
      if (line.startsWith('# ')) {
        return `<h2 style="color:#0B2240; font-family:'Inter', sans-serif; font-size:18px; margin-top:24px; margin-bottom:12px; font-weight:bold;">${cleanLine.substring(2)}</h2>`;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li style="margin-left:20px; color:#334155; font-family:'Inter', sans-serif; font-size:13px; line-height:1.6; margin-bottom:4px;">${cleanLine.substring(2)}</li>`;
      }
      if (line.trim().length === 0) {
        return '<br/>';
      }
      return `<p style="color:#334155; font-family:'Inter', sans-serif; font-size:13px; line-height:1.6; margin:4px 0;">${cleanLine}</p>`;
    }).join('');

    const actionItemsHtml = actionItems.map(item => `
      <li style="padding:10px 14px; margin-bottom:6px; background-color:#fcfbf9; border-left:4px solid #C5A880; font-size:12.5px; color:#334155; border-radius:0 6px 6px 0; font-family:'Inter', sans-serif;">
        <span style="color:#A38258; font-weight:bold; margin-right:6px;">[조치 사항]</span> ${item}
      </li>
    `).join('') || '<li style="color:#718096; font-size:12.5px; font-style:italic; font-family:\'Inter\', sans-serif;">도출된 조치 필요 사항이 없습니다.</li>';

    return `
<div style="max-width:650px; margin:20px auto; background-color:#ffffff; padding:28px; border:1px solid #e1e8f0; border-top:10px solid #0B2240; border-radius:12px; font-family:'Inter', 'Malgun Gothic', sans-serif; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
  <div style="border-bottom:2px solid #C5A880; padding-bottom:18px; margin-bottom:20px; text-align:center;">
    <h2 style="color:#0B2240; margin:0; font-size:22px; font-weight:bold; letter-spacing:-0.5px;">SH HOTEL MEETING MINUTES</h2>
    <p style="color:#A38258; margin:4px 0 0 0; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:bold;">대모산 SH호텔사업부 IT 서비스 회의록 요약본</p>
  </div>
  
  <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:12.5px; border:1px solid #edf2f7;">
    <tr style="background-color:#0B2240; color:#fafafa;">
      <td style="padding:10px 14px; font-weight:bold; width:25%;">회의 안건</td>
      <td style="padding:10px 14px; font-weight:bold;">${meetingTitle || "미상 미팅"}</td>
    </tr>
    <tr style="background-color:#ffffff; border-bottom:1px solid #edf2f7;">
      <td style="padding:10px 14px; font-weight:bold; color:#0B2240;">소속 부서</td>
      <td style="padding:10px 14px; color:#4a5568;">${meetingDept || "미지정"}</td>
    </tr>
    <tr style="background-color:#fcfcfc; border-bottom:1px solid #edf2f7;">
      <td style="padding:10px 14px; font-weight:bold; color:#0B2240;">참석 대상자</td>
      <td style="padding:10px 14px; color:#4a5568;">${meetingParticipants || "미지정"}</td>
    </tr>
    <tr style="background-color:#ffffff;">
      <td style="padding:10px 14px; font-weight:bold; color:#0B2240;">의결 일정</td>
      <td style="padding:10px 14px; color:#4a5568;">${meetingDate}</td>
    </tr>
  </table>

  <div style="margin-bottom:28px;">
    <h3 style="color:#0B2240; border-bottom:1.5px solid #C5A880; padding-bottom:6px; margin-bottom:14px; font-size:15px; font-weight:bold;">1. 회의 분석 요약</h3>
    <div style="background-color:#fafafa; border:1px solid #f0f4f8; padding:16px; border-radius:8px;">
      ${parsedSummaryHtml}
    </div>
  </div>

  <div style="margin-bottom:10px;">
    <h3 style="color:#0B2240; border-bottom:1.5px solid #C5A880; padding-bottom:6px; margin-bottom:14px; font-size:15px; font-weight:bold;">2. 조치 기한 및 실행 사항 (Action Items)</h3>
    <ul style="padding:0; margin:0; list-style-type:none;">
      ${actionItemsHtml}
    </ul>
  </div>
  
  <div style="margin-top:35px; border-top:1px dashed #cbd5e1; padding-top:14px; text-align:center; font-size:10.5px; color:#94a3b8; line-height:1.4;">
    본 아카이브 공문은 SH Hotel Meeting Recorder AI Core에 의해 작성되었습니다. <br>
    메일 수신함이나 인트라넷 보고서 작성 화면에 그대로 붙여넣어 사내 공유 가능합니다.
  </div>
</div>
`;
  };

  const handleCopyMarkdown = () => {
    let fullText = `# SH HOTEL MEETING MINUTES\n\n`;
    fullText += `## [회의 정보]\n`;
    fullText += `- 회의안건: ${meetingTitle || "미상"}\n`;
    fullText += `- 소속부서: ${meetingDept || "미지정"}\n`;
    fullText += `- 참석위원: ${meetingParticipants || "미지정"}\n`;
    fullText += `- 회의일정: ${meetingDate}\n\n`;
    fullText += `## [1. 회의 분석 요약]\n${summary}\n\n`;
    fullText += `## [2. Action Items]\n`;
    actionItems.forEach(item => {
      fullText += `- [To-Do] ${item}\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyEmailHtml = async () => {
    const htmlContent = generateEmailHtml();
    let plainText = `[SH HOTEL MEETING MINUTES]\n\n`;
    plainText += `회의안건: ${meetingTitle || "미상"}\n`;
    plainText += `소속부서: ${meetingDept}\n\n`;
    plainText += ` 요약 내용:\n${summary}\n\n`;
    plainText += ` Action Items:\n` + actionItems.map(item => `* To-Do: ${item}`).join('\n');

    try {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const data = [new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })];
      await navigator.clipboard.write(data);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      // Fallback
      navigator.clipboard.writeText(plainText);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const renderSummaryMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      const parseBold = (text: string) => {
        const parts = text.split('**');
        return parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-extrabold text-[#0B2240]">{part}</strong>;
          }
          return part;
        });
      };

      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-display font-bold text-[13px] text-[#0B2240] border-l-3 border-[#C5A880] pl-2.5 mt-4 mb-2">
            {parseBold(line.substring(4))}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-display font-bold text-[14px] text-[#0B2240] border-b border-[#C5A880]/30 pb-1.5 mt-5 mb-2.5">
            {parseBold(line.substring(3))}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-display font-extrabold text-base text-[#0B2240] mt-6 mb-3">
            {parseBold(line.substring(2))}
          </h2>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-slate-600 leading-relaxed my-1">
            {parseBold(line.substring(2))}
          </li>
        );
      }
      if (line.trim().length === 0) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed my-1">
          {parseBold(line)}
        </p>
      );
    });
  };

  return (
    <div id="ai-summary-panel-container" className="bg-white border border-[#C5A880]/30 shadow-sm rounded-xl p-5 mb-5 flex flex-col animate-fade-in relative overflow-hidden">
      
      {/* Premium Luxury Background Decor Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B2240] via-[#C5A880] to-[#0B2240]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4 mt-1">
        <div className="flex items-center gap-2">
          <div className="bg-[#C5A880]/15 p-1.5 rounded border border-[#C5A880]/20">
            <Sparkles className="h-4.5 w-4.5 text-[#C5A880]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#0B2240]">AI 핵심 요약 & Action Item</h3>
            <p className="text-[10px] text-slate-400 font-medium">Gemini 3.5 LLM 분석 결과</p>
          </div>
        </div>

        {/* Copy action buttons */}
        {!isSummarizing && summary && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Copy Markdown */}
            <button
              id="btn-copy-md"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-all font-medium"
              title="마크다운 문양 복사"
            >
              {copiedMd ? (
                <>
                  <ClipboardCheck className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 text-[11px]">MD 복사완료</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3 w-3 text-slate-500" />
                  <span className="text-[11px]">MD 복사</span>
                </>
              )}
            </button>

            {/* Copy SH formatted styled Newsletter HTML */}
            <button
              id="btn-copy-styled-email"
              onClick={handleCopyEmailHtml}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C5A880]/10 hover:bg-[#C5A880]/20 text-[#A38258] border border-[#C5A880]/30 rounded-lg text-xs transition-all font-semibold"
              title="아웃룩/Gmail 서식으로 복사 (HTML)"
            >
              {copiedEmail ? (
                <>
                  <ClipboardCheck className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 text-[11px]">이메일 서식 복사됨!</span>
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3" />
                  <span className="text-[11px]">이메일 본문 서식 복사 (서식 유지)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {isSummarizing ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#C5A880]" />
            <Sparkles className="h-5 w-5 text-[#C5A880] absolute animate-pulse" />
          </div>
          <p className="font-semibold text-sm text-slate-800">SH 비즈니스 리포트 추출 중</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
            회의 주요 키워드와 업무 할당(Action Item)을 실시간으로 감지하여 명세식 보고서 템플릿으로 구조화하고 있습니다. 잠시만 기다려 주세요.
          </p>
        </div>
      ) : !summary ? (
        <div className="py-8 text-center text-slate-400 flex flex-col items-center">
          <FileCheck2 className="h-10 w-10 text-slate-200 mb-2" />
          <p className="font-medium text-xs text-slate-600">미팅 요약 미생성 상태</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
            회의 음성 기록을 종결한 후, 우측 아래의 <strong>[AI 회의록 요약 & Action Item 분석]</strong> 버튼을 실행하시면 인텔리전트 심층 보고서가 발행됩니다.
          </p>
        </div>
      ) : (
        <div id="ai-summary-content" className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
          
          {/* Executive Summary Area */}
          <div className="lg:col-span-3 border-r border-slate-100 pr-0 lg:pr-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2240] mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              회의 핵심 안건 요약 요약
            </h4>
            
            <div id="summary-md-renderer" className="bg-slate-50/50 border border-slate-100 rounded-xl p-4.5 min-h-[300px] h-[340px] overflow-y-auto custom-scrollbar font-sans text-slate-700">
              {renderSummaryMarkdown(summary)}
            </div>
          </div>

          {/* Action Items Area */}
          <div className="lg:col-span-2 flex flex-col h-[385px]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2240] mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B2240]" />
              조치 요구사항 (Action Items Checkbox)
            </h4>

            {actionItems.length === 0 ? (
              <div className="flex-1 border border-slate-100 bg-slate-50/50 rounded-xl p-6 text-center text-slate-450 display flex flex-col items-center justify-center">
                <AlertCircle className="h-6 w-6 text-slate-350 mb-1" />
                <p className="text-xs font-medium text-slate-500">감지된 To-Do가 없습니다.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">회의 내용에 조치 지시사항이 누락되었을 수 있습니다.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 border border-slate-100 bg-slate-50/50 rounded-xl p-4 h-[340px]">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleTodo(idx)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      completedTodos[idx]
                        ? 'bg-slate-150 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200/75 hover:border-[#C5A880]/50 shadow-xs'
                    }`}
                  >
                    <CheckSquare
                      className={`h-4.5 w-4.5 mt-0.5 shrink-0 transition-colors ${
                        completedTodos[idx] ? 'text-green-600' : 'text-slate-300 group-hover:text-slate-400'
                      }`}
                    />
                    <span className={`text-xs text-slate-700 leading-relaxed ${completedTodos[idx] ? 'line-through text-slate-400' : ''}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
