import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Layers,
  RotateCcw,
  Sparkles,
  Moon,
  Sun,
  SlidersHorizontal,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { StarMap, type StarMapHandle } from "@/components/star-map";
import { DetailPanel } from "@/components/detail-panel";
import { SessionHost } from "@/components/session/session-host";
import { TodayCard } from "@/components/today-card";
import { AmnestyCard } from "@/components/amnesty-card";
import { AmbientMessage } from "@/components/ambient-message";
import { JourneySlider } from "@/components/journey-slider";
import { AboutPanel, WelcomeOverlay } from "@/components/story-intro";
import { useProgress } from "@/lib/progress";
import { LAYOUT, type MapNode } from "@/lib/map-layout";
import { skyVars, type Sky } from "@/lib/sky-theme";
import { TIER_UNLOCK_RATIO } from "@/data/vocabulary";
import { readPlanSummary, type PlanSummary } from "@/lib/course-plan";
import { useMyDocs } from "@/lib/my-docs";
import { MyDocsEditor } from "@/components/my-docs";
import { ToeicScoreCard } from "@/components/toeic-score-card";
import { MY_NODE_ID, useMyCards } from "@/lib/my-cards";
import { setQuickAddMode, useQuickAddMode } from "@/lib/quick-add-bus";
import { useAuth } from "@/lib/auth";
import {
  PHASES,
  ALL_ITEM_IDS,
  GROUP_ITEM_IDS,
  GROUP_LABELS,
  ITEM_BY_ID,
  ITEM_PARENT,
  ITEM_CONSTELLATION,
} from "@/data/ielts-map";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bản đồ TOEIC & IELTS — Học trên bản đồ sao" },
      {
        name: "description",
        content:
          "Ba chòm sao: Nền tảng dùng chung, chòm TOEIC 700 rồi tới chòm IELTS 6.5. Luyện ngay trong app, sao sáng theo năng lực.",
      },
      { property: "og:title", content: "Bản đồ TOEIC & IELTS — Học trên bản đồ sao" },
      {
        property: "og:description",
        content: "Sao sáng theo kết quả bài làm thật, không phải theo nút bấm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SESSION_TITLE: Record<string, string> = {
  "t-p5-quiz": "Part 5 — 30 câu luyện",
};

function Index() {
  const [ieltsEarly, setIeltsEarly] = useState(false);
  const uid = useAuth().user?.uid ?? null;
  const p = useProgress({ ieltsEarly, uid });
  const docs = useMyDocs();
  const myCards = useMyCards();
  const quickMode = useQuickAddMode();
  const [scope, setScope] = useState<"toeic" | "ielts" | "all">("toeic");
  const mapRef = useRef<StarMapHandle>(null);
  const [selected, setSelected] = useState<MapNode | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [about, setAbout] = useState(false);
  const [igniteId, setIgniteId] = useState<string | null>(null);
  const [rippleGroupId, setRippleGroupId] = useState<string | null>(null);
  const [revealPhaseIds, setRevealPhaseIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [replayOn, setReplayOn] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [sky, setSky] = useState<Sky>("night");
  const [contrast, setContrast] = useState(0.3);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [vocabUnlockAll, setVocabUnlockAll] = useState(false);
  const [coursePlan, setCoursePlan] = useState<PlanSummary | null>(null);

  /** Chỉ ghi cài đặt xuống máy SAU khi đã đọc lên.
   *
   *  Phải là state chứ không phải ref: effect ghi chạy ngay sau effect đọc trong
   *  CÙNG một lượt commit, nên ref đã kịp bật true và không chặn được gì. State
   *  buộc thêm một lượt render, lúc đó các giá trị đọc lên mới thực sự có mặt. */
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("bdi-sky");
    const c = localStorage.getItem("bdi-contrast");
    if (s === "day" || s === "night") setSky(s);
    if (c) setContrast(Number(c));
    setVocabUnlockAll(localStorage.getItem("bdi-vocab-unlock-all") === "1");
    setIeltsEarly(localStorage.getItem("bdi-ielts-early") === "1");
    setCoursePlan(readPlanSummary());
    setSettingsLoaded(true);
  }, []);
  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem("bdi-sky", sky);
    localStorage.setItem("bdi-contrast", String(contrast));
    localStorage.setItem("bdi-vocab-unlock-all", vocabUnlockAll ? "1" : "0");
    localStorage.setItem("bdi-ielts-early", ieltsEarly ? "1" : "0");
  }, [settingsLoaded, sky, contrast, vocabUnlockAll, ieltsEarly]);

  // mặc định mở lên là chòm TOEIC — mục tiêu trước mắt
  useEffect(() => {
    const t = window.setTimeout(() => mapRef.current?.focusBox(LAYOUT.boxes["toeic"]!), 300);
    return () => clearTimeout(t);
  }, []);

  const showScope = (next: "toeic" | "ielts" | "all") => {
    setScope(next);
    mapRef.current?.focusBox(LAYOUT.boxes[next === "all" ? "all" : next]!);
  };

  // Tầng 2 mở khi tầng 1 sáng >= 75%, tầng 3 mở khi tầng 2 sáng >= 75%
  const lockedNodes = useMemo(() => {
    const out = new Set<string>();
    if (vocabUnlockAll) return out;
    if ((p.brightness["v-1"] ?? 0) < TIER_UNLOCK_RATIO) out.add("v-2");
    if (out.has("v-2") || (p.brightness["v-2"] ?? 0) < TIER_UNLOCK_RATIO) out.add("v-3");
    return out;
  }, [p.brightness, vocabUnlockAll]);

  const locked = selected
    ? selected.id.startsWith("my-")
      ? false
      : !p.unlocked[selected.phaseId] || lockedNodes.has(selected.id)
    : false;

  const litKey = ALL_ITEM_IDS.filter((id) => (p.brightness[id] ?? 0) >= 0.8).join(",");
  const unlockKey = PHASES.map((ph) => (p.unlocked[ph.id] ? "1" : "0")).join("");
  const prev = useRef<{ done: Set<string>; groups: Set<string>; unlock: string } | null>(null);

  // Phát hiện các khoảnh khắc: thắp sao, chòm sáng trọn, mở giai đoạn
  useEffect(() => {
    if (!p.hydrated) return;
    const done = new Set(ALL_ITEM_IDS.filter((id) => (p.brightness[id] ?? 0) >= 0.8));
    const groups = new Set(
      Object.keys(GROUP_ITEM_IDS).filter((g) => GROUP_ITEM_IDS[g]!.every((id) => done.has(id))),
    );
    const before = prev.current;
    prev.current = { done, groups, unlock: unlockKey };
    if (!before) return;

    const newItem = [...done].find((id) => !before.done.has(id));
    const newGroup = [...groups].find((g) => !before.groups.has(g));
    const newPhases = PHASES.filter((ph, i) => p.unlocked[ph.id] && before.unlock[i] === "0").map(
      (ph) => ph.id,
    );

    const timers: number[] = [];
    if (newItem) {
      setIgniteId(newItem);
      timers.push(window.setTimeout(() => setIgniteId(null), 1300));
    }
    if (newGroup) {
      timers.push(
        window.setTimeout(() => {
          setRippleGroupId(newGroup);
          setMessage(`Chòm ${GROUP_LABELS[newGroup]} đã sáng`);
        }, 1200),
      );
      timers.push(window.setTimeout(() => setRippleGroupId(null), 3400));
      timers.push(window.setTimeout(() => setMessage(null), 4200));
    }
    if (newPhases.length > 0) {
      const pid = newPhases[0]!;
      const phase = PHASES.find((ph) => ph.id === pid);
      const delay = newGroup ? 3600 : 1400;
      timers.push(
        window.setTimeout(() => {
          setRevealPhaseIds(newPhases);
          setMessage(`${phase?.label ?? "Giai đoạn mới"} vừa hiện ra`);
          mapRef.current?.focusNode(pid, 0.42);
        }, delay),
      );
      timers.push(window.setTimeout(() => setRevealPhaseIds([]), delay + 2600));
      timers.push(window.setTimeout(() => setMessage(null), delay + 3400));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [litKey, unlockKey, p.hydrated]);

  // Gợi ý một việc duy nhất cho hôm nay
  const suggestion = useMemo(() => {
    const id = ALL_ITEM_IDS.find((i) => {
      const node = LAYOUT.byId.get(i);
      return (p.brightness[i] ?? 0) < 0.8 && node && p.unlocked[node.phaseId];
    });
    if (!id) return null;
    const node = LAYOUT.byId.get(id);
    const phase = PHASES.find((ph) => ph.id === node?.phaseId);
    return {
      item: ITEM_BY_ID[id]!,
      groupLabel: GROUP_LABELS[ITEM_PARENT[id]!] ?? "",
      phaseLabel: phase?.label ?? "",
    };
  }, [p.brightness, p.unlocked]);

  // Xem lại hành trình — dùng everLit (mốc thắp lần đầu, không bị gỡ khi sao nguội)
  const journeyDays = useMemo(
    () => [...new Set(Object.values(p.state.everLit))].sort(),
    [p.state.everLit],
  );
  useEffect(() => {
    setReplayIndex(journeyDays.length);
  }, [journeyDays.length]);

  const replayDone = useMemo(() => {
    if (!replayOn || replayIndex >= journeyDays.length) return null;
    const cutoff = journeyDays[replayIndex]!;
    return new Set(
      Object.entries(p.state.everLit)
        .filter(([, d]) => d <= cutoff)
        .map(([id]) => id),
    );
  }, [replayOn, replayIndex, journeyDays, p.state.everLit]);

  const labelOverrides = useMemo(
    () => ({
      [MY_NODE_ID.base]: `Từ của tôi (${myCards.countByScope("base")} từ)`,
      [MY_NODE_ID.toeic]: `Từ của tôi (${myCards.countByScope("toeic")} từ)`,
      [MY_NODE_ID.ielts]: `Từ của tôi (${myCards.countByScope("ielts")} từ)`,
    }),
    [myCards],
  );

  const openSuggestion = () => {
    if (!suggestion) return;
    const node = LAYOUT.byId.get(suggestion.item.id);
    if (!node) return;
    mapRef.current?.focusNode(node.id, 0.85);
    setSelected(node);
  };

  return (
    <main
      className={`relative h-[100dvh] w-screen overflow-hidden bg-night ${sky === "day" ? "day" : ""}`}
      style={skyVars(sky, contrast)}
    >
      <div className="pointer-events-none absolute inset-0 bg-night-glow" />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-4 p-4 md:p-6">
        <div className="pointer-events-auto">
          <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground md:text-lg">
            <Sparkles size={18} className="text-star-done" />
            Bản đồ IELTS
          </h1>
          <p className="mt-1 hidden max-w-xs text-xs leading-relaxed text-muted-foreground md:block">
            Mỗi ngôi sao là một bài học học ngay tại đây. Sao sáng theo kết quả bài bạn làm được,
            không phải theo nút bấm.
          </p>
        </div>

        {/* max-h + min-h-0: giữ cả cột trong khung màn hình, để panel Cài đặt
            (khối cao nhất) co lại và tự cuộn thay vì tràn ra ngoài mất hút. */}
        <div className="pointer-events-auto flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col items-end gap-2 md:max-h-[calc(100dvh-3rem)]">
          <div className="hidden shrink-0 rounded-xl border border-border bg-card/70 px-4 py-3 text-right backdrop-blur md:block">
            <p className="text-xs text-muted-foreground">
              Bầu trời sáng {p.percent}% · {p.litCount}/{p.total} sao trọn · {p.streak} ngày liên
              tiếp
            </p>
            <div className="mt-2 space-y-1">
              {PHASES.map((ph) => (
                <div key={ph.id} className="flex items-center justify-end gap-2 text-[11px]">
                  <span
                    className={p.unlocked[ph.id] ? "text-foreground" : "text-muted-foreground/60"}
                  >
                    {ph.short}
                  </span>
                  <span className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-star-done transition-[width] duration-700"
                      style={{ width: `${p.unlocked[ph.id] ? p.phasePercent[ph.id] : 0}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setSky((v) => (v === "night" ? "day" : "night"))}
              aria-label="Đổi giao diện Đêm / Ngày"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              {sky === "night" ? <Sun size={13} /> : <Moon size={13} />}
              {sky === "night" ? "Ngày" : "Đêm"}
            </button>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Cài đặt hiển thị"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              <SlidersHorizontal size={13} /> Cài đặt
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-card/70 p-1 backdrop-blur">
            {(
              [
                { id: "toeic", label: "Chòm TOEIC" },
                { id: "ielts", label: "Chòm IELTS" },
                { id: "all", label: "Toàn bản đồ" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => showScope(s.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                  scope === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {settingsOpen && (
            <div className="min-h-0 w-64 overflow-y-auto no-scrollbar overscroll-contain rounded-xl border border-border bg-card/85 p-4 text-left backdrop-blur-xl">
              <label htmlFor="contrast" className="text-xs font-medium text-foreground">
                Độ tương phản nút chưa học
              </label>
              <input
                id="contrast"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="mt-3 w-full accent-star-done"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Kéo sang phải nếu bạn thấy các ngôi sao chưa thắp còn khó nhìn.
              </p>
              <label className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={vocabUnlockAll}
                  onChange={(e) => setVocabUnlockAll(e.target.checked)}
                  className="mt-0.5 accent-star-done"
                />
                <span>
                  <span className="font-medium text-foreground">Mở sớm mọi tầng từ vựng</span> —
                  dành cho người đã có nền, không cần chờ tầng trước sáng 75%.
                </span>
              </label>
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={ieltsEarly}
                  onChange={(e) => setIeltsEarly(e.target.checked)}
                  className="mt-0.5 accent-star-done"
                />
                <span>
                  <span className="font-medium text-foreground">Mở sớm chòm IELTS</span> — không cần
                  chờ chòm TOEIC sáng 60%.
                </span>
              </label>
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={quickMode === "sidecar"}
                  onChange={(e) => setQuickAddMode(e.target.checked ? "sidecar" : "closed")}
                  className="mt-0.5 accent-star-done"
                />
                <span>
                  <span className="font-medium text-foreground">Vừa xem vừa ghi</span> — thu app
                  thành một panel hẹp bên phải, chỉ còn form thêm thẻ để bạn mở tài liệu ở nửa còn
                  lại.
                </span>
              </label>
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-foreground">Tài liệu của tôi</p>
                <MyDocsEditor docs={docs.docs} onAdd={docs.add} onRemove={docs.remove} />
              </div>
            </div>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/khoa-hoc"
              className="flex items-center gap-1.5 rounded-lg border border-star-done/50 bg-card/70 px-3 py-1.5 text-xs text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              <GraduationCap size={13} className="text-star-done" /> Khoá học
            </Link>
            <Link
              to="/nang-luc"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
            >
              <BarChart3 size={13} /> Năng lực
            </Link>
            <Link
              to="/the-cua-toi"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
            >
              <Layers size={13} /> Thẻ của tôi
            </Link>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  p.reset();
                  setConfirmReset(false);
                  setSelected(null);
                }}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground"
              >
                Xoá hết, chắc chắn
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
              >
                Huỷ
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw size={13} /> Đặt lại tiến độ
            </button>
          )}
        </div>
      </header>

      {/* thanh bên trái */}
      {/* Cột thẻ bên trái. Neo cả top lẫn bottom để khung ngoài luôn cao đúng
          bằng khoảng trống thật của màn hình — tính max-height theo 100dvh trừ
          một con số đoán trước sẽ sai mỗi khi có banner đẩy nó xuống.
          Khung ngoài không nhận chuột; lớp trong mới cuộn và mới chặn chuột, nên
          lúc ít thẻ nó co lại và bản đồ phía sau vẫn kéo được. */}
      <div className="pointer-events-none absolute bottom-4 left-4 top-28 z-20 flex w-[min(16rem,calc(100vw-2rem))] flex-col md:top-44">
        <div className="pointer-events-auto flex max-h-full flex-col gap-3 overflow-y-auto no-scrollbar overscroll-contain">
          {p.amnestyOffer && (
            <AmnestyCard
              lost={p.amnestyLost}
              onStart={openSuggestion}
              onDecline={p.declineAmnesty}
            />
          )}

          <TodayCard
            suggestion={suggestion}
            course={coursePlan}
            streak={p.streak}
            last7={p.last7}
            freezeAvailable={p.freezeAvailable}
            onOpen={openSuggestion}
            onFreeze={p.useFreeze}
          />
          <div className="pointer-events-auto">
            <ToeicScoreCard scores={p.state.scores} />
          </div>
          <AboutPanel open={about} onClose={() => setAbout(false)} />
        </div>
      </div>

      <div className="absolute bottom-20 left-4 z-20 md:bottom-5 md:left-72">
        <JourneySlider
          days={journeyDays}
          active={replayOn}
          index={replayIndex}
          onToggle={() => {
            setReplayOn((v) => !v);
            setReplayIndex(journeyDays.length);
          }}
          onChange={setReplayIndex}
        />
      </div>

      <StarMap
        ref={mapRef}
        brightness={p.brightness}
        selfReported={p.selfReported}
        unlocked={p.unlocked}
        lockedNodes={lockedNodes}
        phasePercent={p.phasePercent}
        percent={p.percent}
        toeicPercent={p.constellationPercent.toeic}
        ieltsPercent={p.constellationPercent.ielts}
        streak={p.streak}
        onSelect={setSelected}
        selectedId={selected?.id}
        igniteId={igniteId}
        rippleGroupId={rippleGroupId}
        revealPhaseIds={revealPhaseIds}
        replayDone={replayDone}
        labelOverrides={labelOverrides}
      />

      <AmbientMessage text={message} />

      <DetailPanel
        node={selected}
        mastery={selected ? p.mastery[selected.id] : undefined}
        locked={locked}
        note={selected ? (p.state.notes[selected.id] ?? "") : ""}
        onClose={() => setSelected(null)}
        onPractice={() => selected && setSessionId(selected.id)}
        onExtraPractice={(id) => setSessionId(id)}
        onNote={(v) => selected && p.setNote(selected.id, v)}
        myDocs={docs.forConstellation(selected ? ITEM_CONSTELLATION[selected.id] : undefined)}
      />

      <SessionHost
        nodeId={sessionId}
        title={sessionId ? (SESSION_TITLE[sessionId] ?? ITEM_BY_ID[sessionId]?.label ?? "") : ""}
        p={p}
        onClose={() => setSessionId(null)}
      />

      <WelcomeOverlay open={p.hydrated && !p.state.seenIntro} onClose={p.markIntroSeen} />
    </main>
  );
}
