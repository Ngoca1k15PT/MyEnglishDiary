import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import type { CourseItem } from "@/data/course-types";
import { formatTime, readAudioPos, writeAudioPos } from "@/lib/course";

const SPEEDS = [0.75, 1, 1.25, 1.5];
const SEEK_STEP = 5;

export type AudioDockHandle = {
  toggle: () => void;
  seekBy: (seconds: number) => void;
  step: (delta: number) => void;
  /** Jumps to a specific file and plays it. */
  playSrc: (src: string) => void;
};

type Props = {
  tracks: CourseItem[];
  /** Resolves a track's `src` into a playable URL. */
  urlOf: (item: CourseItem) => string;
  /** Changes whenever the lesson/group changes, so the dock resets to track 0. */
  resetKey: string;
  /** Shown when `tracks` has been narrowed, with a way back to everything. */
  queueLabel?: string | undefined;
  onClearQueue?: () => void;
  onRegister?: (handle: AudioDockHandle | null) => void;
  /** Bắt đầu phát — dùng để khởi động đồng hồ bài thi. */
  onPlay?: (() => void) | undefined;
};

export function AudioDock({
  tracks,
  urlOf,
  resetKey,
  queueLabel,
  onClearQueue,
  onRegister,
  onPlay,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const current = tracks[index];

  useEffect(() => {
    setIndex(0);
    setTime(0);
    setDuration(0);
    setPlaying(false);
  }, [resetKey]);

  // Filtering to the missed questions can shrink the list under the current
  // index; land on the first remaining clip instead of a hole.
  useEffect(() => {
    if (index >= tracks.length) setIndex(0);
  }, [tracks, index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, index]);

  const step = useCallback(
    (delta: number) => {
      if (tracks.length === 0) return;
      setIndex((i) => {
        const next = i + delta;
        if (next < 0 || next >= tracks.length) return i;
        return next;
      });
      setPlaying(true);
    },
    [tracks.length],
  );

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  const seekBy = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + seconds));
  }, []);

  const playSrc = useCallback(
    (src: string) => {
      const at = tracks.findIndex((t) => t.src === src);
      if (at < 0) return;
      setIndex(at);
      setPlaying(true);
    },
    [tracks],
  );

  useEffect(() => {
    onRegister?.({ toggle, seekBy, step, playSrc });
    return () => onRegister?.(null);
  }, [onRegister, toggle, seekBy, step, playSrc]);

  // Autoplay is blocked until the user interacts, so only push play after their first click.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !playing) return;
    void el.play().catch(() => setPlaying(false));
  }, [index, playing]);

  if (tracks.length === 0) return null;

  const src = current ? urlOf(current) : "";

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur">
      {listOpen && (
        <ul className="max-h-52 overflow-y-auto no-scrollbar border-b border-border">
          {tracks.map((t, i) => (
            <li key={t.src}>
              <button
                onClick={() => {
                  setIndex(i);
                  setPlaying(true);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors ${
                  i === index
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span className="w-6 shrink-0 text-right tabular-nums opacity-60">{i + 1}</span>
                <span className="truncate">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* pr-20 keeps the controls clear of the floating quick-add button */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pl-4 pr-20">
        <button
          onClick={() => setListOpen((v) => !v)}
          aria-label="Danh sách file nghe"
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ListMusic size={13} />
          <span className="tabular-nums">
            {index + 1}/{tracks.length}
          </span>
          {listOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        {queueLabel && (
          <button
            onClick={onClearQueue}
            title="Bỏ lọc, phát lại toàn bộ file nghe"
            className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-star-doing px-2.5 py-1.5 text-[11px] text-star-doing transition-colors hover:bg-accent"
          >
            {queueLabel}
            <X size={11} />
          </button>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => step(-1)}
            disabled={index === 0}
            aria-label="File trước"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-35"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => seekBy(-SEEK_STEP)}
            aria-label="Lùi 5 giây"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? "Tạm dừng" : "Phát"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
          >
            {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <button
            onClick={() => seekBy(SEEK_STEP)}
            aria-label="Tiến 5 giây"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => step(1)}
            disabled={index >= tracks.length - 1}
            aria-label="File sau"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-35"
          >
            <SkipForward size={15} />
          </button>
        </div>

        <div className="flex min-w-[10rem] flex-1 items-center gap-2">
          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
            {formatTime(time)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={time}
            aria-label="Vị trí phát"
            onChange={(e) => {
              const el = audioRef.current;
              if (el) el.currentTime = Number(e.target.value);
            }}
            className="h-1 flex-1 accent-star-done"
          />
          <span className="w-10 shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        <p className="min-w-0 max-w-[10rem] shrink truncate text-[11px] text-muted-foreground">
          {current?.label}
        </p>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setLoop((v) => !v)}
            aria-label="Lặp lại file này"
            title="Lặp lại file này"
            className={`rounded-lg p-2 transition-colors hover:bg-accent ${
              loop ? "text-star-done" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat size={14} />
          </button>
          <button
            onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]!)}
            title="Tốc độ phát"
            aria-label={`Tốc độ phát ${speed}x`}
            className="min-w-[3rem] rounded-lg border border-border px-2 py-1.5 text-[11px] tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {speed}x
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          setDuration(el.duration);
          el.playbackRate = speed;
          const saved = current ? readAudioPos(current.src) : 0;
          if (saved > 0 && saved < el.duration - 5) el.currentTime = saved;
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onPlay={() => {
          setPlaying(true);
          onPlay?.();
        }}
        onPause={() => {
          setPlaying(false);
          if (current && audioRef.current) writeAudioPos(current.src, audioRef.current.currentTime);
        }}
        onEnded={() => {
          if (current) writeAudioPos(current.src, 0);
          if (index < tracks.length - 1) step(1);
          else setPlaying(false);
        }}
      />
    </div>
  );
}
