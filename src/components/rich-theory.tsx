import { Fragment, type ReactNode } from "react";

/**
 * Render bài lý thuyết dạng chuỗi có <b>, <i> và xuống dòng \n thành React element.
 * Không dùng dangerouslySetInnerHTML — mọi thẻ đều được parse thủ công.
 * Khối bắt đầu bằng ⚠️ được làm nổi bật (nền vàng nhạt + viền trái).
 */
export function RichTheory({ text }: { text: string }) {
  const blocks = splitBlocks(text);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {blocks.map((b, i) =>
        b.warn ? (
          <div
            key={i}
            className="rounded-r-lg border-l-4 border-star-doing bg-star-doing/10 py-3 pl-4 pr-3 text-foreground"
          >
            {b.lines.map((l, j) => (
              <p key={j} className={j > 0 ? "mt-1" : undefined}>
                <Inline text={l} />
              </p>
            ))}
          </div>
        ) : (
          <p key={i}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={l} />
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

type Block = { warn: boolean; lines: string[] };

function splitBlocks(text: string): Block[] {
  const out: Block[] = [];
  for (const para of text.split("\n\n")) {
    const lines = para.split("\n");
    let cur: Block | null = null;
    for (const line of lines) {
      const warn = line.trimStart().startsWith("⚠️");
      if (!cur || (warn && !cur.warn)) {
        cur = { warn, lines: [] };
        out.push(cur);
      }
      cur.lines.push(line);
    }
  }
  return out.filter((b) => b.lines.some((l) => l.trim() !== ""));
}

/** Parse <b>, <i> và tô màu ❌ / ✅ trong một dòng. */
function Inline({ text }: { text: string }) {
  return <>{parseTags(text).map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}

function parseTags(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /<(b|i)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...colorMarks(text.slice(last, m.index)));
    const inner = colorMarks(m[2]!);
    out.push(
      m[1] === "b" ? (
        <strong className="font-semibold text-foreground">{inner}</strong>
      ) : (
        <em className="italic">{inner}</em>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...colorMarks(text.slice(last)));
  return out;
}

/** ❌ đỏ, ✅ xanh lá — tô cho cả ký hiệu lẫn phần chữ ngay sau nó. */
function colorMarks(text: string): ReactNode[] {
  const parts = text.split(/(❌[^❌✅]*|✅[^❌✅]*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("❌"))
      return (
        <span key={i} className="text-destructive">
          {p}
        </span>
      );
    if (p.startsWith("✅"))
      return (
        <span key={i} className="text-star-done">
          {p}
        </span>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}
