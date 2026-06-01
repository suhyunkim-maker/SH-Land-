import React, { useState, useEffect } from 'react';
import { Meeting, RecordingStatus } from './types';
import Sidebar from './components/Sidebar';
import MetadataForm from './components/MetadataForm';
import Recorder from './components/Recorder';
import TranscriptEditor from './components/TranscriptEditor';
import AISummaryPanel from './components/AISummaryPanel';
import BlogIntegration from './components/BlogIntegration';
import { 
  Building2, 
  Sparkles, 
  ChevronRight, 
  History,
  FileDown
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'sh-hotel-meetings';

// High-fidelity pre-populated SH default meeting to make the UI look stunning and complete on first load
const DEFAULT_MEETING: Meeting = {
  id: 'sh-sample-1',
  title: '대모산 SH호텔 로봇 자동화 서비스 설계 주간 미팅',
  department: '호텔 IT 사업부',
  participants: '김수현 PM, 박성진 테크리드, 이나라 서비스팀장',
  date: new Date().toISOString().slice(0, 10),
  content: `오늘 미팅을 가집니다. 회의 시작하도록 하겠습니다.
김수현 PM: 저번 주에 배포했던 고객 객실 가이드 로봇 시범 서비스 반응이 매우 뜨겁습니다. 20대와 30대 비즈니스 투숙객들 사이에서 만족도 조사가 92%를 달성했네요. 이번 회의를 통해서 다음 단계인 '스마트 오더 연동 연산 서비스' 과제의 마일스톤과 업무 할당을 정리하겠습니다. 
박성진 테크리드: 현재 기획해주신 스마트 오더 API 통신 연결 모듈은 기반 구조가 완료되었습니다. 식음료 부서와 조율이 필요한데 식음료 발주 시스템의 데이터 구조가 일부 달라서 조율이 필요합니다.
이나라 서비스팀장: 맞아요. 호텔 현장 직원들이 직관적으로 볼 수 있어야 합니다. 프론트엔드 태블릿 알림 시스템은 어제 전달해드린 피그마 시안대로 팝업과 소리 볼륨을 극대화시켜 주셨으면 좋겠어요.
김수현 PM: 좋습니다. 그럼 박성진님은 다음 주 금요일인 6월 5일까지 식음료 부서의 배준호 PM님과 함께 이메일 통신 사양서 프로토타입 정의 및 테스트 베드 개설을 마무리해 주시고요. 이나라 팀장님은 6월 3일까지 현장 가이드 태블릿에 뜨는 에러 경고 다이얼로그와 수신 벨소리 샘플 3종을 골라 공유해 주세요. 제가 다 취합하여 개발 기획서를 최종 컨펌하도록 하겠습니다. 수고하셨습니다.`,
  summary: `### 1. 회의 핵심 안건 및 논의 사항
- **호텔 로봇 자동화 1차 성과 리뷰**
  - 가이드 로봇 시범 도입 후 실시한 20/30대 비즈니스 투숙객 대상 만족도 조사 결과 **92%** 고득점 달성. 서비스 효용성 확인 완료.
- **메인 의제: '스마트 오더' 연동 고도화 개발**
  - 프론트 식음료(F&B) 발주 인프라와 로봇 시스템 간 API 연동 규격을 준비 중.
  - 현장 운영 효율을 제고하기 위한 프론트엔드 태블릿 가청/시각 알림 시스템 기획 검토 수립.

### 2. 향후 추진 방향 (프로젝트 마일스톤)
- F&B 발주 시스템 특성 차이에 따른 커스텀 파싱 모듈 도입 예정.
- 일선 지점 직원들이 대규모 접객 상태에서도 즉시 인지 가능한 고출력 하드웨어 사운드 및 인터페이스 팝업 수정 반영.`,
  actionItems: [
    "박성진 테크리드: F&B 배준호 PM과 협업하여 식음료 발주 통신 인터페이스 프로토타입 설계 및 기기 테스트베드 개설 완료 (기한: 6월 5일)",
    "이나라 서비스팀장: 가이드 태블릿 에러 다이얼로그 가이드라인 및 서정적인 알림 공명 주파수 알림 사운드 3종 셀렉션 공유 (기한: 6월 3일)",
    "김수현 PM: 전체 취합 후 차세대 스마트 호텔 로봇 가이드 최종 상세 기능 정의서(PRD) 배포 및 기획 심사 승인 상신"
  ],
  isAiSummarized: true,
  createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
};

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [activeView, setActiveView] = useState<'workspace' | 'blog'>('workspace');

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Meeting[];
        setMeetings(parsed);
        if (parsed.length > 0) {
          setCurrentMeeting(parsed[0]);
        }
      } catch (err) {
        console.error("Local storage parse error:", err);
        // Fallback
        initDefaultSample();
      }
    } else {
      initDefaultSample();
    }
  }, []);

  const initDefaultSample = () => {
    const initialList = [DEFAULT_MEETING];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialList));
    setMeetings(initialList);
    setCurrentMeeting(DEFAULT_MEETING);
  };

  // 2. Persist Active Meeting state shifts safely to the local database list
  const updateMeetingInHistory = (updated: Meeting) => {
    setMeetings(prev => {
      const idx = prev.findIndex(m => m.id === updated.id);
      let nextList = [...prev];
      if (idx > -1) {
        nextList[idx] = updated;
      } else {
        nextList = [updated, ...prev]; // Prepend new items
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
      return nextList;
    });
  };

  // Helper helper
  const handleActiveFieldChange = (field: string, value: string) => {
    if (!currentMeeting) return;
    const updated = {
      ...currentMeeting,
      [field]: value
    };
    setCurrentMeeting(updated);
    updateMeetingInHistory(updated);
  };

  // Handle live Speech text chunks from Speech Recognition
  const handleTranscriptUpdate = (finalText: string, interimText: string) => {
    if (!currentMeeting) return;
    setInterimTranscript(interimText);
    
    // Auto-save finalized content chunk
    const updated = {
      ...currentMeeting,
      content: finalText
    };
    setCurrentMeeting(updated);
    updateMeetingInHistory(updated);
  };

  // 3. User switches meetings in the sidebar
  const handleSelectMeeting = (id: string) => {
    if (recordingStatus === 'listening') {
      alert("회의 음성 녹음 도중에는 다른 미팅으로 전환할 수 없습니다. 먼저 녹음을 정지해 주세요.");
      return;
    }
    const target = meetings.find(m => m.id === id);
    if (target) {
      setCurrentMeeting(target);
      setIsEditing(false);
      setInterimTranscript('');
      setActiveView('workspace');
    }
  };

  // 4. Create new meeting structure
  const handleNewMeeting = (presetDate?: string) => {
    if (recordingStatus === 'listening') {
      alert("대화 수집 처리 중에는 새 미팅을 개설할 수 없습니다. 먼저 기록 정지(Stop)를 해 주세요.");
      return;
    }

    const defaultDate = presetDate || new Date().toISOString().slice(0, 10);
    // Extract MM/DD format
    const formattedTitleSuffix = defaultDate.slice(5).replace('-', '/');

    const newM: Meeting = {
      id: 'meeting-' + Date.now(),
      title: '새로운 호텔 IT 기획 미팅 ' + formattedTitleSuffix,
      department: '호텔 IT 사업부',
      participants: '',
      date: defaultDate,
      content: '',
      summary: '',
      actionItems: [],
      isAiSummarized: false,
      createdAt: new Date().toISOString()
    };

    setMeetings(prev => {
      const next = [newM, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setCurrentMeeting(newM);
    setIsEditing(false);
    setInterimTranscript('');
    setActiveView('workspace');
  };

  // 5. Delete meeting with prevent triggers
  const handleDeleteMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (recordingStatus === 'listening' && id === currentMeeting?.id) {
      alert("진행 중인 활성 녹음 회의록은 삭제할 수 없습니다.");
      return;
    }

    if (confirm("정말로 이 미팅 기록을 아카이브에서 삭제하시겠습니까?")) {
      const filtered = meetings.filter(m => m.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      setMeetings(filtered);
      
      // If the active meeting was deleted, focus on the first item
      if (currentMeeting?.id === id) {
        if (filtered.length > 0) {
          setCurrentMeeting(filtered[0]);
        } else {
          // Reset to default empty
          const resetM: Meeting = {
            id: 'meeting-empty',
            title: '대모산 SH호텔 기본 연계 미팅',
            department: '호텔 IT 사업부',
            participants: '',
            date: new Date().toISOString().slice(0, 10),
            content: '',
            summary: '',
            actionItems: [],
            isAiSummarized: false,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([resetM]));
          setMeetings([resetM]);
          setCurrentMeeting(resetM);
        }
      }
    }
  };

  // 6. Invoke AI Summarizer Node Express Route
  const handleTriggerSummarize = async () => {
    if (!currentMeeting || currentMeeting.content.trim().length === 0) {
      alert("회의 녹취본(대화 텍스트)이 비어있습니다. 대화를 녹음하시거나 임의 추가한 뒤 AI 분석을 촉구하십시오.");
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: currentMeeting.title,
          department: currentMeeting.department,
          participants: currentMeeting.participants,
          date: currentMeeting.date,
          content: currentMeeting.content
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "AI 요약 서버 응답 실패");
      }

      const data = await response.json();
      
      // Update meeting fields
      const updated: Meeting = {
        ...currentMeeting,
        summary: data.summary,
        actionItems: data.actionItems || [],
        isAiSummarized: true
      };

      setCurrentMeeting(updated);
      updateMeetingInHistory(updated);

      // Save summary and action items to physical server log
      try {
        await fetch("/api/log-meeting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updated)
        });
      } catch (logErr) {
        console.error("Failed to write to physical meetings.log:", logErr);
      }

    } catch (err: any) {
      console.error(err);
      alert(`AI 요약 도출 실패: ${err.message || '인프라 점검 필요'}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // 7. Import a Blog Post content as a new meeting record
  const handleImportPost = async (title: string, content: string, date: string) => {
    const importedM: Meeting = {
      id: 'meeting-' + Date.now(),
      title: `[연동] ${title}`,
      department: '호텔 IT 사업부',
      participants: '김수현 PM (블로그 연동)',
      date: date || new Date().toISOString().slice(0, 10),
      content: content,
      summary: '',
      actionItems: [],
      isAiSummarized: false,
      createdAt: new Date().toISOString()
    };

    setMeetings(prev => {
      const next = [importedM, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setCurrentMeeting(importedM);
    setIsEditing(false);
    setInterimTranscript('');
    setActiveView('workspace');

    // Send a sync/import action log to server log as well
    try {
      await fetch("/api/log-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...importedM,
          summary: '김수현 PM 포트폴리오 블로그 포스트를 성공적으로 연동하여 회의록 텍스트로 가져왔습니다.'
        })
      });
    } catch (logErr) {
      console.error(logErr);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar Histroy */}
      <Sidebar
        meetings={meetings}
        currentMeetingId={currentMeeting?.id || null}
        onSelectMeeting={handleSelectMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onNewMeeting={handleNewMeeting}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full bg-[#FAF9F7] overflow-y-auto custom-scrollbar">
        
        {/* Header App Title bar */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 shrink-0 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#0B2240] text-[#C5A880] border border-[#C5A880]/30 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-display shrink-0">
              In-house Tech PM Service
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <ChevronRight className="h-4 w-4 shrink-0" />
              <h2 className="font-medium text-xs text-slate-600 line-clamp-1">
                {activeView === 'blog' ? '김수현 PM 블로그 연동 대시보드' : (currentMeeting?.title || '미팅 편집기')}
              </h2>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            System status: <span className="text-green-600 font-semibold">● Online</span>
          </div>
        </header>

        {/* Content Container Area */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeView === 'blog' ? (
            <BlogIntegration onImportPost={handleImportPost} />
          ) : currentMeeting && (
            <>
              {/* Meeting Metadata Form Card */}
              <MetadataForm
                title={currentMeeting.title}
                department={currentMeeting.department}
                participants={currentMeeting.participants}
                date={currentMeeting.date}
                isRecording={recordingStatus === 'listening'}
                onChange={handleActiveFieldChange}
              />

              {/* Web Speech STT Recorder Panel card */}
              <Recorder
                status={recordingStatus}
                currentContent={currentMeeting.content}
                onTranscriptUpdate={handleTranscriptUpdate}
                onStatusChange={setRecordingStatus}
              />

              {/* STT Text Live Editor view & Triggers */}
              <TranscriptEditor
                content={currentMeeting.content}
                interimContent={interimTranscript}
                isEditing={isEditing}
                status={recordingStatus}
                onContentChange={(val) => handleActiveFieldChange('content', val)}
                onToggleEdit={() => setIsEditing(!isEditing)}
                onTriggerSummarize={handleTriggerSummarize}
                isSummarizing={isSummarizing}
              />

              {/* AI Core Summary Holder & Checkbox Panel */}
              <AISummaryPanel
                summary={currentMeeting.summary}
                actionItems={currentMeeting.actionItems}
                isSummarizing={isSummarizing}
                meetingTitle={currentMeeting.title}
                meetingDept={currentMeeting.department}
                meetingParticipants={currentMeeting.participants}
                meetingDate={currentMeeting.date}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
