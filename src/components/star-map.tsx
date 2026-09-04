import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Lock, Minus, Plus, Crosshair, Camera } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LAYOUT, STARFIELD, DUST, type Box, type MapNode } from "@/lib/map-layout";

type Props = {
  /** độ sáng 0..1 của từng nút mục */
  brightness: Record<string, number>;
  /** các nút chỉ có tự đánh giá — vẽ viền đứt quãng */
  selfReported: Set<string>;
  unlocked: Record<string, boolean>;
  /** các nút bị khoá riêng lẻ (ví dụ tầng từ vựng chưa mở) */
  lockedNodes?: Set<string>;
  phasePercent: Record<string, number>;
  percent: number;
  toeicPercent: number;
  ieltsPercent: number;
  streak: number;
  onSelect: (node: MapNode) => void;
  selectedId?: string | undefined;
  igniteId?: string | null;
  rippleGroupId?: string | null;
  revealPhaseIds?: string[];
  /** Khi ở chế độ xem lại hành trình: chỉ các id trong tập này được coi là đã sáng */
  replayDone?: Set<string> | null;
  /** đổi nhãn hiển thị của một số nút (ví dụ "Từ của tôi (12 từ)") */
  labelOverrides?: Record<string, string>;
};

export type StarMapHandle = {
  focusNode: (id: string, zoom?: number) => void;
  focusBox: (box: Box) => void;
  recenter: () => void;
  exportPng: () => void;
};

type View = { x: number; y: number; z: number };

const MIN_Z = 0.16;
const MAX_Z = 2.2;
const BASE_Z = 0.25;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h;
}

export const StarMap = forwardRef<StarMapHandle, Props>(function StarMap(
  {
    brightness,
    selfReported,
    unlocked,
    lockedNodes,
    phasePercent,
    percent,
    toeicPercent,
    ieltsPercent,
    streak,
    onSelect,
    selectedId,
    igniteId,
    rippleGroupId,
    revealPhaseIds,
    replayDone,
    labelOverrides,
  },
  handleRef,
) {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>({ x: 0, y: 0, z: BASE_Z });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDist = useRef<number | null>(null);
  const anim = useRef<number | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const measure = useCallback(() => {
    const el = ref.current;
    const w = el?.clientWidth || window.innerWidth;
    const h = el?.clientHeight || window.innerHeight;
    setSize({ w, h });
    return { w, h };
  }, []);

  const recenter = useCallback(() => {
    const { w, h } = measure();
    setView({ x: w / 2, y: h / 2, z: BASE_Z });
  }, [measure]);

  useEffect(() => {
    const raf = requestAnimationFrame(recenter);
    window.addEventListener("resize", recenter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recenter);
    };
  }, [recenter]);

  const animateTo = useCallback(
    (target: View, ms = 1200) => {
      if (anim.current) cancelAnimationFrame(anim.current);
      const from = { ...viewRef.current };
      if (reduced) {
        setView(target);
        return;
      }
      const t0 = performance.now();
      const step = (t: number) => {
        const k = easeOut(Math.min(1, (t - t0) / ms));
        setView({
          x: from.x + (target.x - from.x) * k,
          y: from.y + (target.y - from.y) * k,
          z: from.z + (target.z - from.z) * k,
        });
        if (k < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [reduced],
  );

  const focusNode = useCallback(
    (id: string, zoom = 0.75) => {
      const n = LAYOUT.byId.get(id);
      if (!n) return;
      const { w, h } = measure();
      animateTo({ x: w / 2 - n.x * zoom, y: h / 2 - n.y * zoom, z: zoom }, 1400);
    },
    [animateTo, measure],
  );

  const focusBox = useCallback(
    (box: Box) => {
      const { w, h } = measure();
      const pad = 160;
      const bw = Math.max(box.x1 - box.x0, 400);
      const bh = Math.max(box.y1 - box.y0, 400);
      const z = clamp(Math.min((w - pad) / bw, (h - pad) / bh), MIN_Z, MAX_Z);
      const cx = (box.x0 + box.x1) / 2;
      const cy = (box.y0 + box.y1) / 2;
      animateTo({ x: w / 2 - cx * z, y: h / 2 - cy * z, z }, 1400);
    },
    [animateTo, measure],
  );

  const exportPng = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const src = svg.querySelectorAll("*");
    const dst = clone.querySelectorAll("*");
    src.forEach((el, i) => {
      const cs = window.getComputedStyle(el);
      const target = dst[i] as SVGElement | undefined;
      if (!target) return;
      target.setAttribute("fill", cs.fill);
      target.setAttribute("stroke", cs.stroke);
      target.setAttribute("stroke-width", cs.strokeWidth);
      target.setAttribute("opacity", cs.opacity);
      if (el.tagName === "text") {
        target.setAttribute("font-size", cs.fontSize);
        target.setAttribute("font-family", "sans-serif");
        target.setAttribute("font-weight", cs.fontWeight);
      }
    });
    const { w, h } = size;
    clone.setAttribute("width", String(w));
    clone.setAttribute("height", String(h));
    clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", String(w));
    bg.setAttribute("height", String(h));
    bg.setAttribute(
      "fill",
      getComputedStyle(document.documentElement).getPropertyValue("--sky-export-bg").trim() ||
        "#0f1729",
    );
    clone.insertBefore(bg, clone.firstChild);
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `bau-troi-ielts-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  }, [size]);

  useImperativeHandle(handleRef, () => ({ focusNode, focusBox, recenter, exportPng }), [
    focusNode,
    focusBox,
    recenter,
    exportPng,
  ]);

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    setView((v) => {
      const next = clamp(v.z * factor, MIN_Z, MAX_Z);
      const k = next / v.z;
      return { x: px - (px - v.x) * k, y: py - (py - v.y) * k, z: next };
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.0015));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      pinchDist.current = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      drag.current = null;
      return;
    }
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pinch.current.has(e.pointerId)) pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 2 && pinchDist.current) {
      const [a, b] = [...pinch.current.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const rect = ref.current?.getBoundingClientRect();
      const cx = (a!.x + b!.x) / 2 - (rect?.left ?? 0);
      const cy = (a!.y + b!.y) / 2 - (rect?.top ?? 0);
      zoomAt(cx, cy, d / pinchDist.current);
      pinchDist.current = d;
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };

  const endDrag = (e: React.PointerEvent) => {
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchDist.current = null;
    drag.current = null;
  };

  const handleClick = (node: MapNode) => {
    if (drag.current?.moved) return;
    onSelect(node);
  };

  const isDone = useCallback(
    (id: string) => (replayDone ? replayDone.has(id) : (brightness[id] ?? 0) >= 0.8),
    [replayDone, brightness],
  );

  /** độ sáng hiển thị của một nút: nút cha lấy trung bình các con */
  const nodeGlow = (n: MapNode): number => {
    if (n.kind !== "item") return 0;
    if (replayDone) return replayDone.has(n.id) ? 1 : 0;
    return brightness[n.id] ?? 0;
  };

  const R = 2 * Math.PI * 54;

  const litNodes = useMemo(() => {
    const s = new Set<string>();
    for (const n of LAYOUT.nodes) {
      if (n.kind === "item" && isDone(n.id)) {
        s.add(n.id);
        if (n.parentId) s.add(n.parentId);
        s.add(n.phaseId);
      }
    }
    return s;
  }, [isDone]);

  // Chỉ chạy lấp lánh cho các sao đang nằm trong khung nhìn → giữ 60fps
  const inView = useMemo(() => {
    const s = new Set<string>();
    const pad = 120;
    for (const n of LAYOUT.nodes) {
      const sx = view.x + n.x * view.z;
      const sy = view.y + n.y * view.z;
      if (sx > -pad && sx < size.w + pad && sy > -pad && sy < size.h + pad) s.add(n.id);
    }
    return s;
  }, [view, size]);

  const revealing = useMemo(() => new Set(revealPhaseIds ?? []), [revealPhaseIds]);

  // LOD: nhãn hiện dần theo mức zoom
  const itemLabelOpacity = clamp((view.z - 0.14) / 0.06, 0, 1);
  const groupLabelOpacity = clamp((view.z - 0.1) / 0.05, 0, 1);
  const phaseLabelOpacity = 1;

  const igniteNode = igniteId ? LAYOUT.byId.get(igniteId) : undefined;
  const igniteParent = igniteNode?.parentId ? LAYOUT.byId.get(igniteNode.parentId) : undefined;
  const rippleIndex = useMemo(() => {
    const m = new Map<string, number>();
    if (!rippleGroupId) return m;
    const g = LAYOUT.byId.get(rippleGroupId);
    if (!g) return m;
    const kids = LAYOUT.nodes.filter((n) => n.parentId === rippleGroupId);
    kids
      .map((n) => ({ n, d: Math.hypot(n.x - g.x, n.y - g.y) }))
      .sort((a, b) => a.d - b.d)
      .forEach((e, i) => m.set(e.n.id, i));
    return m;
  }, [rippleGroupId]);

  return (
    <div
      ref={ref}
      className="relative h-full w-full cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <svg ref={svgRef} className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="fill-done" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--star-done)" />
            <stop offset="100%" stopColor="var(--star-done-deep)" />
          </linearGradient>
          <radialGradient id="glow-done">
            <stop offset="0%" stopColor="var(--star-done)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--star-done)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.z})`}>
          {/* bụi sao trôi rất chậm */}
          {!reduced &&
            DUST.filter((_, i) => i % 3 === 0).map((d) => (
              <circle
                key={`d-${d.id}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                className="fill-star-dust animate-drift"
                opacity={0.12}
                style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
              />
            ))}

          {/* nền sao li ti */}
          {STARFIELD.map((s) => (
            <circle
              key={s.id}
              cx={s.x}
              cy={s.y}
              r={s.r}
              className={reduced ? "fill-star-dust" : "fill-star-dust animate-twinkle"}
              opacity={0.3}
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}

          {/* đường nối */}
          {LAYOUT.edges.map((e) => {
            const a = LAYOUT.byId.get(e.from)!;
            const b = LAYOUT.byId.get(e.to)!;
            const locked = !unlocked[e.phaseId] || !!lockedNodes?.has(e.toId);
            const lit = !locked && litNodes.has(e.toId);
            const hovered = hoverId === e.toId || hoverId === e.from;
            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={lit || hovered ? "var(--star-done)" : "var(--line-dim)"}
                strokeWidth={lit ? 2.2 : hovered ? 1.6 : 1.1}
                style={{
                  opacity: revealing.has(e.phaseId)
                    ? undefined
                    : lit
                      ? 0.9
                      : hovered
                        ? 0.75
                        : locked
                          ? "calc(var(--line-op) * 0.8)"
                          : "var(--line-op)",
                  transition: "opacity .5s ease, stroke .5s ease, stroke-width .3s ease",
                }}
              >
                {revealing.has(e.phaseId) && !reduced && (
                  <animate attributeName="opacity" from="0.05" to="0.5" dur="2s" fill="freeze" />
                )}
              </line>
            );
          })}

          {/* hiệu ứng vẽ đường khi thắp sao */}
          {igniteNode && igniteParent && !reduced && (
            <motion.line
              key={`ignite-line-${igniteId}`}
              x1={igniteParent.x}
              y1={igniteParent.y}
              x2={igniteNode.x}
              y2={igniteNode.y}
              stroke="var(--star-done)"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: [1, 1, 0.6] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            />
          )}

          {/* nút trung tâm — hai vòng lồng nhau */}
          <g onClick={(e) => e.stopPropagation()}>
            <circle r={104} className="fill-center-core" />
            <circle r={84} fill="none" stroke="var(--line-dim)" strokeWidth={5} opacity={0.45} />
            <circle
              r={84}
              fill="none"
              stroke="var(--star-done)"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.45}
              strokeDasharray={`${(2 * Math.PI * 84 * ieltsPercent) / 100} ${2 * Math.PI * 84}`}
              transform="rotate(-90)"
              style={{ transition: "stroke-dasharray .8s cubic-bezier(.22,1,.36,1)" }}
            />
            <circle r={54} fill="none" stroke="var(--line-dim)" strokeWidth={7} opacity={0.5} />
            <circle
              r={54}
              fill="none"
              stroke="var(--star-done)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={`${(R * toeicPercent) / 100} ${R}`}
              transform="rotate(-90)"
              style={{ transition: "stroke-dasharray .8s cubic-bezier(.22,1,.36,1)" }}
            />
            <text textAnchor="middle" y={-16} className="fill-foreground text-[14px] font-semibold">
              TOEIC 700
            </text>
            <text textAnchor="middle" y={10} className="fill-star-done text-[22px] font-bold">
              {toeicPercent}%
            </text>
            <text textAnchor="middle" y={30} className="fill-muted-foreground text-[11px]">
              IELTS 6.5 · {ieltsPercent}%
            </text>
            <text textAnchor="middle" y={48} className="fill-muted-foreground text-[10px]">
              {streak} ngày liên tiếp · nền {percent}%
            </text>
          </g>

          {/* các nút */}
          {LAYOUT.nodes.map((n) => {
            if (n.kind === "center") return null;
            const glow = nodeGlow(n);
            const locked = !unlocked[n.phaseId] || !!lockedNodes?.has(n.id);
            const r = n.kind === "phase" ? 34 : n.kind === "group" ? 22 : 11;
            const done = n.kind === "item" ? glow >= 0.8 : isDone(n.id) || litNodes.has(n.id);
            const doing = !done && glow > 0;
            const dashed = n.kind === "item" && selfReported.has(n.id) && glow > 0;
            const hovered = hoverId === n.id;
            const twinkling = done && !reduced && inView.has(n.id);
            const rip = rippleIndex.get(n.id);
            const isRevealing = revealing.has(n.phaseId);
            return (
              <motion.g
                key={n.id}
                transform={`translate(${n.x} ${n.y})`}
                onClick={() => handleClick(n)}
                onPointerEnter={() => setHoverId(n.id)}
                onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                className="cursor-pointer"
                initial={false}
                style={{
                  opacity: locked ? "var(--locked-op)" : 1,
                  transition: `opacity ${isRevealing ? 2 : 0.6}s ease-out`,
                }}
              >
                {glow > 0 && (
                  <circle r={r * 3} fill="url(#glow-done)" opacity={Math.max(glow, done ? 1 : 0.35)} />
                )}
                {selectedId === n.id && (
                  <circle r={r + 9} fill="none" stroke="var(--star-done)" strokeWidth={1} opacity={0.6} />
                )}
                <motion.circle
                  r={r}
                  fill={done ? "url(#fill-done)" : "var(--star-dim-fill)"}
                  stroke={done ? "var(--star-done)" : doing ? "var(--star-doing)" : "var(--star-dim)"}
                  strokeWidth={done ? 2.4 : undefined}
                  strokeDasharray={dashed ? "5 4" : undefined}
                  className={[
                    doing && !reduced ? "animate-pulse-ring" : "",
                    twinkling ? "animate-star-breathe" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    strokeWidth: done ? undefined : "var(--star-stroke-w)",
                    animationDelay: `${(hash(n.id) % 60) / 10}s`,
                    transition: "fill .6s ease, stroke .6s ease",
                  }}
                  animate={
                    reduced
                      ? { scale: 1 }
                      : igniteId === n.id
                        ? { scale: [1, 1.9, 1] }
                        : rip !== undefined
                          ? { scale: [1, 1.5, 1] }
                          : { scale: hovered ? 1.25 : 1 }
                  }
                  transition={
                    rip !== undefined
                      ? { duration: 0.7, delay: rip * 0.09, ease: "easeOut" }
                      : { duration: igniteId === n.id ? 0.9 : 0.25, ease: "easeOut" }
                  }
                />
                {locked && n.kind !== "item" && (
                  <g transform={`translate(${r + 4} ${-r - 16})`}>
                    <circle r={11} cx={8} cy={8} fill="var(--star-dim-fill)" stroke="var(--star-dim)" strokeWidth={1.5} />
                    <Lock size={12} x={2} y={2} className="text-star-label-locked" />
                  </g>
                )}
                {(() => {
                  const fs = n.kind === "phase" ? 17 : n.kind === "group" ? 15 : 13;
                  const weight = n.kind === "phase" ? 700 : n.kind === "group" ? 600 : 500;
                  const op =
                    n.kind === "phase"
                      ? phaseLabelOpacity
                      : n.kind === "group"
                        ? groupLabelOpacity
                        : itemLabelOpacity;
                  const color = locked
                    ? "var(--star-label-locked)"
                    : done
                      ? "var(--star-label)"
                      : "var(--star-label)";
                  const text = labelOverrides?.[n.id] ?? n.label;
                  const w = text.length * fs * 0.56 + 14;
                  const h = fs + 8;
                  const top = r + 8;
                  return (
                    <g style={{ opacity: op, transition: "opacity .35s ease" }}>
                      <rect
                        x={-w / 2}
                        y={top}
                        width={w}
                        height={h}
                        rx={h / 2}
                        fill="var(--label-pill)"
                        style={{ opacity: "var(--label-pill-op)" }}
                      />
                      <text
                        textAnchor="middle"
                        y={top + h / 2 + fs * 0.36}
                        fill={color}
                        style={{ fontSize: fs, fontWeight: done ? weight + 100 : weight }}
                      >
                        {text}
                      </text>
                      {n.kind === "phase" && (
                        <text
                          textAnchor="middle"
                          y={top + h + 16}
                          fill="var(--star-label-locked)"
                          style={{ fontSize: 12, fontWeight: 600 }}
                        >
                          {phasePercent[n.phaseId] ?? 0}%
                        </text>
                      )}
                    </g>
                  );
                })()}
              </motion.g>
            );
          })}

          {/* khoảnh khắc thắp sao: sóng sáng + hạt bay lên */}
          <AnimatePresence>
            {igniteNode && !reduced && (
              <g key={`ignite-${igniteId}`} transform={`translate(${igniteNode.x} ${igniteNode.y})`}>
                {[0, 0.18].map((delay, i) => (
                  <motion.circle
                    key={i}
                    r={14}
                    fill="none"
                    stroke="var(--star-done)"
                    strokeWidth={2}
                    initial={{ scale: 0.4, opacity: 0.9 }}
                    animate={{ scale: 7, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, delay, ease: "easeOut" }}
                  />
                ))}
                {Array.from({ length: 7 }).map((_, i) => {
                  const a = (i / 7) * Math.PI * 2;
                  return (
                    <motion.circle
                      key={`p-${i}`}
                      r={2.2}
                      fill="var(--star-done)"
                      initial={{ x: 0, y: 0, opacity: 0.95 }}
                      animate={{
                        x: Math.cos(a) * 34,
                        y: Math.sin(a) * 24 - 46,
                        opacity: 0,
                      }}
                      transition={{ duration: 1.2, delay: 0.15 + i * 0.03, ease: "easeOut" }}
                    />
                  );
                })}
              </g>
            )}
          </AnimatePresence>

          {/* ổ khoá tan thành hạt sáng khi mở giai đoạn */}
          <AnimatePresence>
            {(revealPhaseIds ?? []).map((pid) => {
              const p = LAYOUT.byId.get(pid);
              if (!p || reduced) return null;
              return (
                <g key={`unlock-${pid}`} transform={`translate(${p.x} ${p.y})`}>
                  {Array.from({ length: 14 }).map((_, i) => {
                    const a = (i / 14) * Math.PI * 2;
                    return (
                      <motion.circle
                        key={i}
                        r={2.4}
                        fill="var(--star-done)"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: Math.cos(a) * 90, y: Math.sin(a) * 90, opacity: 0 }}
                        transition={{ duration: 1.8, delay: i * 0.04, ease: "easeOut" }}
                      />
                    );
                  })}
                </g>
              );
            })}
          </AnimatePresence>
        </g>
      </svg>

      <div className="absolute bottom-5 right-5 flex gap-2 md:left-auto">
        <MapBtn onClick={() => zoomAt(rectCenter(ref).x, rectCenter(ref).y, 1.25)} label="Phóng to">
          <Plus size={16} />
        </MapBtn>
        <MapBtn onClick={() => zoomAt(rectCenter(ref).x, rectCenter(ref).y, 0.8)} label="Thu nhỏ">
          <Minus size={16} />
        </MapBtn>
        <MapBtn onClick={recenter} label="Về giữa">
          <Crosshair size={16} />
        </MapBtn>
        <MapBtn onClick={exportPng} label="Chụp bầu trời">
          <Camera size={16} />
        </MapBtn>
      </div>
    </div>
  );
});

function rectCenter(ref: React.RefObject<HTMLDivElement | null>) {
  const r = ref.current?.getBoundingClientRect();
  return { x: (r?.width ?? 0) / 2, y: (r?.height ?? 0) / 2 };
}

function MapBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-full border border-border bg-card/70 p-2 text-foreground backdrop-blur transition-colors hover:bg-accent"
    >
      {children}
    </button>
  );
}
