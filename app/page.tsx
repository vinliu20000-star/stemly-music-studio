'use client';
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AudioLines,
  ChevronDown,
  Download,
  Drum,
  FileMusic,
  Guitar,
  Headphones,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Piano,
  Play,
  Plus,
  Radio,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Video,
  Volume2,
  Waves,
} from 'lucide-react';

const makeBars = (seed: number) =>
  Array.from(
    { length: 28 },
    (_, i) => 26 + ((i * 17 + seed * 23 + (i % 3) * 11) % 62),
  );
const tracks = [
  {
    id: 'lead_vocal',
    name: '主唱',
    english: 'Lead Vocals',
    icon: Mic2,
    color: '#ff7662',
  },
  {
    id: 'backing_vocal',
    name: '和聲',
    english: 'Backing Vocals',
    icon: Mic2,
    color: '#ff9c88',
  },
  {
    id: 'drums',
    name: '鼓組',
    english: 'Drum Kit',
    icon: Drum,
    color: '#e9b34f',
  },
  {
    id: 'percussion',
    name: '打擊樂器',
    english: 'Percussion',
    icon: Waves,
    color: '#e7ca65',
  },
  { id: 'bass', name: '貝斯', english: 'Bass', icon: Guitar, color: '#4fc89a' },
  {
    id: 'acoustic_guitar',
    name: '木吉他',
    english: 'Acoustic Guitar',
    icon: Guitar,
    color: '#60d4bb',
  },
  {
    id: 'electric_guitar',
    name: '電吉他',
    english: 'Electric Guitar',
    icon: Guitar,
    color: '#55b9d4',
  },
  {
    id: 'piano',
    name: '鋼琴',
    english: 'Piano',
    icon: Piano,
    color: '#7798ef',
  },
  {
    id: 'synth',
    name: '合成器',
    english: 'Synthesizer',
    icon: Radio,
    color: '#997ee8',
  },
  {
    id: 'strings',
    name: '弦樂',
    english: 'Strings',
    icon: Music2,
    color: '#bf79d5',
  },
  {
    id: 'brass',
    name: '銅管樂',
    english: 'Brass',
    icon: Music2,
    color: '#db75a9',
  },
  {
    id: 'woodwinds',
    name: '木管樂',
    english: 'Woodwinds',
    icon: Music2,
    color: '#dd8d72',
  },
  {
    id: 'fx',
    name: '環境與效果',
    english: 'Ambience · FX',
    icon: AudioLines,
    color: '#9098a7',
  },
].map((track, index) => ({ ...track, bars: makeBars(index + 1) }));

function Waveform({ bars, color }: { bars: number[]; color: string }) {
  return (
    <div className="waveform" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h}%`,
            backgroundColor: color,
            animationDelay: `${i * 28}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState('lead_vocal');
  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      tracks.map((track, index) => [track.id, 82 - (index % 5) * 7]),
    ),
  );
  const [muted, setMuted] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const active = useMemo(
    () => tracks.find((t) => t.id === selected) ?? tracks[0],
    [selected],
  );
  const toggleMute = (id: string) =>
    setMuted((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const ActiveIcon = active.icon;
  const loadFile = (file?: File) => {
    if (!file) return;
    const valid =
      file.type === 'video/mp4' ||
      file.type.startsWith('audio/') ||
      /\.(mp4|mp3|wav|m4a|flac)$/i.test(file.name);
    if (!valid) {
      alert('請選擇 MP4、MP3、WAV、M4A 或 FLAC 檔案');
      return;
    }
    setFileName(file.name);
    setUploaded(true);
  };
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) =>
    loadFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    loadFile(event.dataTransfer.files?.[0]);
  };
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'set_track_mix',
      title: '調整音軌混音',
      description: '選擇一條已分離音軌，設定音量並可切換靜音。',
      inputSchema: {
        type: 'object',
        properties: {
          track: { type: 'string', enum: tracks.map((t) => t.id) },
          volume: { type: 'number', minimum: 0, maximum: 100 },
          muted: { type: 'boolean' },
        },
        required: ['track', 'volume'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const value = input as {
          track?: string;
          volume?: number;
          muted?: boolean;
        };
        if (
          !tracks.some((t) => t.id === value.track) ||
          typeof value.volume !== 'number' ||
          value.volume < 0 ||
          value.volume > 100
        )
          throw new Error('無效的音軌或音量');
        const id = value.track as string;
        setSelected(id);
        setVolumes((current) => ({
          ...current,
          [id]: Math.round(value.volume as number),
        }));
        if (typeof value.muted === 'boolean')
          setMuted((current) =>
            value.muted
              ? [...new Set([...current, id])]
              : current.filter((item) => item !== id),
          );
        return {
          track: id,
          volume: Math.round(value.volume),
          muted: value.muted ?? muted.includes(id),
        };
      },
    };
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => undefined);
    } catch {}
    return () => lifecycle.abort();
  }, [muted]);
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>
            <AudioLines size={20} />
          </span>
          Stemly
        </div>
        <nav aria-label="主要導覽">
          <button className="nav-item active">
            <SlidersHorizontal size={18} />
            分軌工作台
          </button>
          <button className="nav-item">
            <Headphones size={18} />
            練習與評分
          </button>
          <button className="nav-item">
            <Sparkles size={18} />
            我的作品
          </button>
        </nav>
        <div className="recent">
          <p>最近專案</p>
          <button>
            <i className="coral" />
            Midnight Drive
          </button>
          <button>
            <i className="mint" />
            Summer Demo
          </button>
          <button>
            <i className="lilac" />
            Untitled Session
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="usage">
            <span>
              <Sparkles size={15} />
              本月額度
            </span>
            <strong>12 / 20 首</strong>
            <i>
              <b />
            </i>
          </div>
          <button className="profile">
            <span>WL</span>
            <div>
              <strong>我的工作室</strong>
              <small>個人方案</small>
            </div>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <button className="project-title">
              Midnight Drive <ChevronDown size={16} />
            </button>
            <span className="saved">已儲存</span>
          </div>
          <div className="top-actions">
            <button className="icon-btn" aria-label="設定">
              <Settings2 size={18} />
            </button>
            <button className="export">
              <Download size={17} />
              匯出音軌
            </button>
          </div>
        </header>
        <div className="content">
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInput}
              type="file"
              accept="video/mp4,audio/*,.mp4,.mp3,.wav,.m4a,.flac"
              onChange={onFileChange}
            />
            <span className="upload-icon">
              {fileName ? <FileMusic size={21} /> : <Video size={21} />}
            </span>
            <div>
              <strong>{fileName || '匯入 MP4 或音樂檔案'}</strong>
              <p>
                {fileName
                  ? '檔案已就緒，可開始分析所有可辨識樂器'
                  : '拖放檔案到這裡，支援 MP4、MP3、WAV、M4A、FLAC'}
              </p>
            </div>
            <button onClick={() => fileInput.current?.click()}>
              <Upload size={15} />
              {fileName ? '更換檔案' : '選擇檔案'}
            </button>
          </div>
          <section className="song-card">
            <div className="cover">
              <i />
              <span>{fileName ? 'AI' : 'MD'}</span>
            </div>
            <div className="song-info">
              <small>{uploaded ? '等待 AI 分析' : '正在編輯'}</small>
              <h1>{fileName || 'Midnight Drive'}</h1>
              <p>
                {fileName
                  ? '將依內容建立所有偵測到的獨立音軌'
                  : 'Neon Avenue · 3:42 · 120 BPM'}
              </p>
            </div>
            <button
              className="replace"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={16} />
              更換檔案
            </button>
          </section>
          <section className="transport">
            <button
              className="play"
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? '暫停' : '播放'}
            >
              {playing ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
            </button>
            <span>{playing ? '01:18' : '00:00'}</span>
            <div className="timeline">
              <b style={{ width: playing ? '35%' : '12%' }} />
              <i style={{ left: playing ? '35%' : '12%' }} />
            </div>
            <span>03:42</span>
            <Volume2 size={19} />
          </section>
          <div className="section-heading">
            <div>
              <h2>完整樂器分軌</h2>
              <span>AI 偵測到 {tracks.length} 條獨立音軌</span>
            </div>
            <button>
              <Plus size={16} />
              自訂音軌
            </button>
          </div>
          <section className="tracks">
            {tracks.map((track) => {
              const Icon = track.icon;
              const isMuted = muted.includes(track.id);
              return (
                <article
                  key={track.id}
                  className={`track ${selected === track.id ? 'selected' : ''}`}
                  onClick={() => setSelected(track.id)}
                >
                  <div className="track-meta">
                    <span
                      style={{
                        color: track.color,
                        backgroundColor: `${track.color}18`,
                      }}
                    >
                      <Icon size={18} />
                    </span>
                    <div>
                      <strong>{track.name}</strong>
                      <small>{track.english}</small>
                    </div>
                  </div>
                  <Waveform bars={track.bars} color={track.color} />
                  <div
                    className="track-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={isMuted ? 'active' : ''}
                      onClick={() => toggleMute(track.id)}
                    >
                      M
                    </button>
                    <button>S</button>
                    <input
                      aria-label={`${track.name}音量`}
                      type="range"
                      min="0"
                      max="100"
                      value={volumes[track.id]}
                      onChange={(e) =>
                        setVolumes({
                          ...volumes,
                          [track.id]: Number(e.target.value),
                        })
                      }
                      style={
                        {
                          '--c': track.color,
                          '--v': `${volumes[track.id]}%`,
                        } as React.CSSProperties
                      }
                    />
                    <span>{isMuted ? '—∞' : volumes[track.id] - 80}</span>
                    <MoreHorizontal size={18} />
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </section>
      <aside className="inspector">
        <div className="tabs">
          <button className="active">音軌設定</button>
          <button>評分</button>
        </div>
        <div className="panel">
          <div className="selected-track">
            <span
              style={{
                color: active.color,
                backgroundColor: `${active.color}18`,
              }}
            >
              <ActiveIcon size={19} />
            </span>
            <div>
              <small>目前選擇</small>
              <strong>{active.name}</strong>
            </div>
          </div>
          <div className="control">
            <label>
              音量 <b>{volumes[active.id] - 80} dB</b>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volumes[active.id]}
              onChange={(e) =>
                setVolumes({ ...volumes, [active.id]: Number(e.target.value) })
              }
              style={
                {
                  '--c': active.color,
                  '--v': `${volumes[active.id]}%`,
                } as React.CSSProperties
              }
            />
          </div>
          <div className="control">
            <label>
              聲像 <b>置中</b>
            </label>
            <input type="range" defaultValue="50" />
          </div>
          <hr />
          <div className="effects-title">
            <div>
              <h3>聲音微調</h3>
              <p>讓分離後的音色更自然</p>
            </div>
            <button>全部重設</button>
          </div>
          <div className="effect">
            <label>
              <span>
                清晰度<small>減少其他音軌滲漏</small>
              </span>
              <b>+24</b>
            </label>
            <input type="range" defaultValue="62" />
          </div>
          <div className="effect">
            <label>
              <span>
                空間感<small>保留原始殘響</small>
              </span>
              <b>+8</b>
            </label>
            <input type="range" defaultValue="54" />
          </div>
          <div className="practice">
            <span>
              86<small>分</small>
            </span>
            <div>
              <small>上次演奏評分</small>
              <strong>節奏很穩定</strong>
              <p>再加強第 2 段的音準</p>
            </div>
            <button>查看</button>
          </div>
        </div>
      </aside>
    </main>
  );
}
