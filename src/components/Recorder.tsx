import React, { useState, useEffect, useRef } from 'react';
import { RecordingStatus } from '../types';
import { 
  Play, 
  Square, 
  Mic, 
  MicOff, 
  AlertTriangle,
  Info,
  Clock,
  Globe2,
  ListRestart
} from 'lucide-react';

interface RecorderProps {
  status: RecordingStatus;
  currentContent: string;
  onTranscriptUpdate: (finalText: string, interimText: string) => void;
  onStatusChange: (status: RecordingStatus) => void;
}

// Ensure TypeScript knows SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function Recorder({
  status,
  currentContent,
  onTranscriptUpdate,
  onStatusChange
}: RecorderProps) {
  const [lang, setLang] = useState('ko-KR');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [interimText, setInterimText] = useState('');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to avoid stale closures in event handlers
  const isRecordingRef = useRef(false);
  const accruedTextRef = useRef('');
  const currentFinalTextRef = useRef('');

  // 1. Check Browser Support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      onStatusChange('error');
    }
  }, [onStatusChange]);

  // Sync content with ref so we know what is finalized
  useEffect(() => {
    currentFinalTextRef.current = currentContent;
  }, [currentContent]);

  // 2. Continuous Listening Timer
  useEffect(() => {
    if (status === 'listening') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (status === 'idle') {
        setElapsedTime(0);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // 3. Initialize and configure Web Speech API
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Reset accrued text to whatever is currently in the transcript box
    // This allows continuing from an existing text!
    accruedTextRef.current = currentFinalTextRef.current;
    
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => {
      setPermissionError(false);
      onStatusChange('listening');
      isRecordingRef.current = true;
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error === 'not-allowed') {
        setPermissionError(true);
        onStatusChange('error');
        isRecordingRef.current = false;
        stopSpeechRecognition();
      }
    };

    rec.onend = () => {
      // Keep-alive mechanism: If we should still be recording, restart instantly.
      if (isRecordingRef.current) {
        // Safe check for final accrued state from this session
        accruedTextRef.current = currentFinalTextRef.current;
        try {
          rec.start();
          console.log("Keep-alive: Speech recognition auto-restarted.");
        } catch (err) {
          console.error("Keep-alive restart failed:", err);
        }
      }
    };

    rec.onresult = (event: any) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinal += transcript + ' ';
        } else {
          sessionInterim += transcript;
        }
      }

      // Prepend previous accrued history to current session finals
      const nextFinal = accruedTextRef.current + (accruedTextRef.current && sessionFinal ? ' ' : '') + sessionFinal;
      onTranscriptUpdate(nextFinal, sessionInterim);
      setInterimText(sessionInterim);
    };

    recognitionRef.current = rec;
    
    try {
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition app:", e);
    }
  };

  const stopSpeechRecognition = () => {
    isRecordingRef.current = false;
    onStatusChange('idle');
    setInterimText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Stop error:", err);
      }
      recognitionRef.current = null;
    }
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setLang(selected);
    if (status === 'listening') {
      // Re-trigger with new language
      accruedTextRef.current = currentFinalTextRef.current;
      if (recognitionRef.current) {
        recognitionRef.current.lang = selected;
        // Stop session, it will auto restart onend with the new language
        recognitionRef.current.stop();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  return (
    <div id="recorder-panel" className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 mb-5 animate-fade-in">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Status Indicators & Clock */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#C5A880]" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">대화 진행 시간</p>
              <p className="text-lg font-mono font-bold text-[#0B2240] transition-all leading-tight">
                {formatTime(elapsedTime)}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">STT 인식 상태</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {status === 'listening' ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-red-600">음성 기록 중</span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-bold text-slate-500">대기 중</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recording Visualiser Bars (shown only when listening) */}
        {status === 'listening' && (
          <div className="flex items-center gap-0.5 h-8 px-4 self-center opacity-80" title="음성 유입 비주얼라이저">
            <div className="w-1 bg-[#C5A880] h-6 rounded-full animate-wave [animation-delay:-0.1s]"></div>
            <div className="w-1 bg-[#0B2240] h-6 rounded-full animate-wave [animation-delay:-0.3s]"></div>
            <div className="w-1 bg-[#C5A880] h-6 rounded-full animate-wave [animation-delay:-0.5s]"></div>
            <div className="w-1 bg-[#0B2240] h-6 rounded-full animate-wave [animation-delay:-0.2s]"></div>
            <div className="w-1 bg-[#C5A880] h-6 rounded-full animate-wave [animation-delay:-0.4s]"></div>
            <div className="w-1 bg-[#0B2240] h-6 rounded-full animate-wave [animation-delay:-0.6s]"></div>
          </div>
        )}

        {/* Control Button Actions */}
        <div className="flex items-center gap-3 self-center">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Globe2 className="h-3.5 w-3.5 text-slate-500" />
            <select
              id="select-language"
              value={lang}
              onChange={handleLangChange}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="ko-KR">한국어 (ko-KR)</option>
              <option value="en-US">English (en-US)</option>
              <option value="ja-JP">日本語 (ja-JP)</option>
            </select>
          </div>

          {/* Trigger Recording Buttons */}
          {status !== 'listening' ? (
            <button
              id="btn-start-record"
              onClick={startSpeechRecognition}
              disabled={!browserSupported}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0B2240] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <Mic className="h-4 w-4" />
              <span>STT 녹음 시작</span>
            </button>
          ) : (
            <button
              id="btn-stop-record"
              onClick={stopSpeechRecognition}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <Square className="h-4 w-4" />
              <span>기록 완료 (Stop)</span>
            </button>
          )}
        </div>
      </div>

      {/* Unsupported Browser Alert / Microphone permission alerts */}
      {!browserSupported && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">지원되지 않는 브라우저이거나 오디오 컨텍스트가 로드되지 않았습니다.</p>
            <p className="mt-1">SH Hotel STT 서비스는 Chrome 브라우저에 최적화되어 작동합니다. 크롬 브라우저를 사용하여 접속해 주십시오.</p>
          </div>
        </div>
      )}

      {permissionError && (
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5 animate-fade-in">
          <MicOff className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">마이크 사용 권한이 거부되었거나 사용 중입니다.</p>
            <p className="mt-1">브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하고 <strong>[마이크 허용]</strong> 상태로 설정을 바꾼 뒤 다시 녹음 버튼을 눌러주세요.</p>
          </div>
        </div>
      )}

      {/* Speech API Background Tab Notice Info Banner */}
      <div className="mt-4 p-3 bg-[#F5EFE6]/50 border border-[#C5A880]/15 rounded-lg text-[11px] text-[#A38258] flex items-start gap-2">
        <Info className="h-4 w-4 text-[#C5A880] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#0B2240]">Web Speech API 백그라운드 이용 주의 안내:</span> 회의 기록 중 크롬 브라우저 탭이 백그라운드로 전환되거나 기기가 대기 모드로 돌입할 시, 브라우저 스펙 상 STT 연산이 일시 중지될 수 있습니다. 정상 기록을 위해 모니터 기상 상태 및 활성 탭 창 유지를 엄수하시기 바랍니다.
        </div>
      </div>
    </div>
  );
}
