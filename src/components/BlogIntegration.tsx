import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  BookOpen, 
  FileText, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Tag, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface BlogPost {
  file: string;
  title: string;
  date: string;
  tags: string[];
  category?: string;
  description?: string;
  excerpt?: string;
}

interface BlogIntegrationProps {
  onImportPost: (title: string, content: string, date: string) => void;
}

export default function BlogIntegration({ onImportPost }: BlogIntegrationProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  // Log viewer states
  const [logsOpen, setLogsOpen] = useState(true);
  const [activeLogTab, setActiveLogTab] = useState<'sync' | 'meetings' | 'activity'>('sync');
  const [logsData, setLogsData] = useState<{
    syncLogs: string[];
    meetingLogs: string[];
    activityLogs: string[];
  }>({ syncLogs: [], meetingLogs: [], activityLogs: [] });
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch posts from local storage on mount if they were synced previously
  useEffect(() => {
    const cached = localStorage.getItem('sh-synced-blog-posts');
    if (cached) {
      try {
        setPosts(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
    fetchLogs();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setSyncSuccess(false);
    try {
      const res = await fetch('/api/sync-blog');
      if (!res.ok) {
        throw new Error('블로그 동기화 API 호출에 실패했습니다.');
      }
      const data = await res.json();
      setPosts(data.posts || []);
      localStorage.setItem('sh-synced-blog-posts', JSON.stringify(data.posts || []));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
      
      // Refresh server logs after sync
      await fetchLogs();
    } catch (err: any) {
      console.error(err);
      setError(err.message || '인프라 점검 또는 네트워크 에러');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogsData(data);
      }
    } catch (e) {
      console.error("Failed to load logs:", e);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleImport = async (post: BlogPost) => {
    try {
      setLoading(true);
      const res = await fetch('/api/fetch-blog-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: post.file }),
      });
      if (!res.ok) {
        throw new Error('포스트 마크다운 파일 로드에 실패했습니다.');
      }
      const data = await res.json();
      
      // Remove basic HTML header wrappers if present in the loaded MD
      let cleanContent = data.content;
      if (cleanContent.includes('---')) {
        // Strip markdown metadata headers if suhyunkim's files contain them
        const parts = cleanContent.split('---');
        if (parts.length > 2) {
          cleanContent = parts.slice(2).join('---').trim();
        }
      }
      
      // Remove any HTML skeleton code if the raw file has it
      cleanContent = cleanContent
        .replace(/<!DOCTYPE html>[\s\S]*?<article id="post-content">/i, '')
        .replace(/<\/article>[\s\S]*<\/html>/i, '')
        .trim();

      onImportPost(post.title, cleanContent, post.date);
      alert(`"${post.title}" 게시글을 미팅 기록으로 불러왔습니다. 왼쪽 목록에서 편집할 수 있습니다!`);
      
      // Refresh logs
      await fetchLogs();
    } catch (err: any) {
      alert(`불러오기 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Curated Tag Colors HSL generator based on tag string hash
  const getTagStyle = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return {
      backgroundColor: `hsla(${h}, 55%, 45%, 0.1)`,
      color: `hsl(${h}, 60%, 35%)`,
      borderColor: `hsla(${h}, 55%, 45%, 0.2)`
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Board */}
      <div className="relative rounded-2xl bg-[#0B2240] p-6 text-white overflow-hidden shadow-lg border border-[#C5A880]/30 select-none">
        {/* Luxury Glowing Accents */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-[#C5A880]/35 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest font-mono">
                EXTERNAL SYNC MODULE
              </span>
              <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                Live API Ready
              </span>
            </div>
            
            <h2 className="text-2xl font-display font-bold tracking-tight">
              김수현 PM 포트폴리오 & 블로그 연동 대시보드
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              호텔 IT 기획 담당 김수현 PM의 개인 기술 블로그(<code>suhyunkim-maker.github.io</code>)에 탑재된 프로젝트 포스팅 내역을 실시간 수집하고, 서버 로그 연계 아카이브에 영구적으로 보존합니다.
            </p>
          </div>

          <button
            id="btn-blog-sync"
            disabled={loading}
            onClick={handleSync}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all shrink-0 select-none active:scale-[0.98] ${
              loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-[#C5A880] hover:bg-[#A38258] text-[#0B2240]'
            }`}
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? '연동 수집 중...' : '블로그 데이터 동기화'}</span>
          </button>
        </div>
      </div>

      {/* Sync State Alert Boxes */}
      {syncSuccess && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-sm text-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <strong>블로그 동기화 완료!</strong> suhyunkim-maker.github.io 서버에서 {posts.length}개의 게시글 목록 정보를 안정적으로 가져와 <code>logs/blog_sync.log</code> 파일에 동기화 내역을 보관했습니다.
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-sm text-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <strong>동기화 실패:</strong> {error} - 네트워크 연결 또는 원격 Github Pages 상태를 다시 한번 검토해 주세요.
          </div>
        </div>
      )}

      {/* Core Feed Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
          <h3 className="font-display font-bold text-sm text-[#0B2240] flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-[#C5A880]" />
            연동된 실무 포스트 목록 ({posts.length}건)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Source: suhyunkim-maker.github.io/posts.json
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
            <Globe className="h-12 w-12 text-slate-200 mb-3 animate-pulse" />
            <p className="font-semibold text-sm text-slate-800">블로그 데이터가 비어 있습니다</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              상단의 [블로그 데이터 동기화] 버튼을 누르시면 김수현 PM 블로그의 실제 데이터가 이 자리에 실시간으로 로드됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, idx) => (
              <div 
                key={post.file + '-' + idx} 
                className="bg-white border border-slate-200 hover:border-[#C5A880]/50 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Category & Date bar */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="bg-[#0B2240]/5 text-[#0B2240] px-2 py-0.5 rounded font-semibold border border-[#0B2240]/10 uppercase">
                      {post.category || 'Projects'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {post.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-display font-bold text-[13.5px] text-[#0B2240] leading-snug group-hover:text-[#A38258] transition-colors line-clamp-2">
                    {post.title}
                  </h4>

                  {/* Excerpt Description */}
                  <p className="text-[11.5px] text-slate-500 leading-relaxed line-clamp-3">
                    {post.excerpt || post.description || "상세 설명이 포함되어 있지 않은 게시글입니다."}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => {
                        const style = getTagStyle(tag);
                        return (
                          <span 
                            key={tag} 
                            style={style}
                            className="text-[9.5px] px-1.5 py-0.5 rounded-full font-bold border"
                          >
                            #{tag}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={`https://suhyunkim-maker.github.io/post.html?file=${post.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0B2240] transition-colors"
                    >
                      <span>원문 보기</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      onClick={() => handleImport(post)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#A38258] border border-[#C5A880]/20 rounded-lg text-[10.5px] font-bold transition-all active:scale-95"
                    >
                      <Download className="h-3 w-3" />
                      <span>회의록으로 가져오기</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Style Log Viewer */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        {/* Log Viewer Header */}
        <div 
          onClick={() => setLogsOpen(!logsOpen)}
          className="bg-[#0F172A] px-5 py-3 flex items-center justify-between text-slate-200 cursor-pointer select-none border-b border-slate-700/60"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#C5A880]/10 border border-[#C5A880]/25 rounded text-[#C5A880]">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold tracking-wide">SH 서버 사이드 로그 파일 실시간 뷰어 (Log Inspector)</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Physical location: backend server ~/logs/*</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchLogs();
              }}
              disabled={logsLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 text-[10px] font-mono transition-all"
            >
              <RefreshCw className={`h-3 w-3 ${logsLoading ? 'animate-spin' : ''}`} />
              <span>로그 새로고침</span>
            </button>
            {logsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </div>

        {/* Log Content Area */}
        {logsOpen && (
          <div className="p-4 space-y-4">
            {/* Tab switch buttons */}
            <div className="flex bg-[#0F172A] p-0.5 rounded-lg border border-slate-700/60 font-mono text-[10.5px] max-w-sm">
              <button
                onClick={() => setActiveLogTab('sync')}
                className={`flex-1 py-1.5 rounded transition-all text-center ${
                  activeLogTab === 'sync' 
                    ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                blog_sync.log
              </button>
              <button
                onClick={() => setActiveLogTab('meetings')}
                className={`flex-1 py-1.5 rounded transition-all text-center ${
                  activeLogTab === 'meetings' 
                    ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                meetings.log
              </button>
              <button
                onClick={() => setActiveLogTab('activity')}
                className={`flex-1 py-1.5 rounded transition-all text-center ${
                  activeLogTab === 'activity' 
                    ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                system_activity.log
              </button>
            </div>

            {/* Simulated Terminal Shell window */}
            <div className="bg-[#0F172A] rounded-lg border border-slate-800 p-4 font-mono text-[11px] leading-relaxed text-slate-350 min-h-[160px] max-h-[220px] overflow-y-auto custom-scrollbar">
              {activeLogTab === 'sync' && (
                logsData.syncLogs && logsData.syncLogs.length > 0 ? (
                  logsData.syncLogs.map((log, idx) => (
                    <div key={idx} className="hover:bg-slate-800/40 py-0.5 border-b border-slate-900/30">
                      <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                      <span className="text-[#C5A880] font-bold mr-1.5">[SYNC]</span>
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">동기화 로그 파일이 비어 있습니다. 블로그 동기화를 실행해 보세요.</p>
                )
              )}

              {activeLogTab === 'meetings' && (
                logsData.meetingLogs && logsData.meetingLogs.length > 0 ? (
                  logsData.meetingLogs.map((log, idx) => (
                    <div key={idx} className="hover:bg-slate-800/40 py-0.5 border-b border-slate-900/30 whitespace-pre-wrap">
                      <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                      <span className="text-green-400 font-bold mr-1.5">[MEETING]</span>
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">저장된 회의록 아카이브 로그가 없습니다. 회의 요약을 도출해 보세요.</p>
                )
              )}

              {activeLogTab === 'activity' && (
                logsData.activityLogs && logsData.activityLogs.length > 0 ? (
                  logsData.activityLogs.map((log, idx) => (
                    <div key={idx} className="hover:bg-slate-800/40 py-0.5 border-b border-slate-900/30">
                      <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                      <span className="text-blue-400 font-bold mr-1.5">[SYS]</span>
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">시스템 핵심 활성 동작 로그가 기록되지 않았습니다.</p>
                )
              )}
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>Status: Online</span>
              <span>Total cached lines: {logsData.syncLogs.length + logsData.meetingLogs.length + logsData.activityLogs.length} lines</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
