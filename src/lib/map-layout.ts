import { PHASES, type ConstellationId, type ItemNode } from "@/data/ielts-map";

export type MapNode = {
  id: string;
  kind: "center" | "phase" | "group" | "item";
  label: string;
  x: number;
  y: number;
  phaseId: string;
  constellation: ConstellationId | "center";
  parentId?: string;
  item?: ItemNode;
};

export type MapEdge = { id: string; from: string; to: string; phaseId: string; toId: string };

export type Box = { x0: number; y0: number; x1: number; y1: number };

const TAU = Math.PI * 2;

/** Mỗi chòm sao chiếm một cung riêng, chòm Nền tảng nằm ở trung tâm. */
const RINGS: Record<
  ConstellationId,
  { center: number; span: number; phaseR: number; groupR: number; itemR: number }
> = {
  base: { center: -Math.PI / 2, span: TAU, phaseR: 300, groupR: 720, itemR: 1150 },
  toeic: { center: Math.PI, span: 1.45, phaseR: 1900, groupR: 2400, itemR: 2950 },
  ielts: { center: 0, span: 2.7, phaseR: 2100, groupR: 2700, itemR: 3400 },
};

function polar(angle: number, radius: number) {
  const round = (v: number) => Math.round(v * 100) / 100;
  return { x: round(Math.cos(angle) * radius), y: round(Math.sin(angle) * radius) };
}

function build() {
  const nodes: MapNode[] = [
    {
      id: "center",
      kind: "center",
      label: "TOEIC 700 → IELTS 6.5",
      x: 0,
      y: 0,
      phaseId: "center",
      constellation: "center",
    },
  ];
  const edges: MapEdge[] = [];

  (Object.keys(RINGS) as ConstellationId[]).forEach((cid) => {
    const ring = RINGS[cid];
    const phases = PHASES.filter((p) => p.constellation === cid);
    const sector = ring.span / Math.max(phases.length, 1);

    phases.forEach((phase, pi) => {
      const center = ring.center - ring.span / 2 + sector * pi + sector / 2;
      const leaves = phase.groups.reduce((n, g) => n + g.items.length, 0);
      const pad = sector * 0.08;
      const usable = sector - pad * 2;
      const step = usable / Math.max(leaves - 1, 1);
      // hai vòng so le để giữ khoảng cách giữa các sao
      const itemR = Math.max(ring.itemR, 60 / Math.max(step, 0.0001));

      const p = polar(center, ring.phaseR);
      nodes.push({
        id: phase.id,
        kind: "phase",
        label: phase.short,
        x: p.x,
        y: p.y,
        phaseId: phase.id,
        constellation: cid,
        parentId: "center",
      });
      edges.push({
        id: `e-center-${phase.id}`,
        from: "center",
        to: phase.id,
        phaseId: phase.id,
        toId: phase.id,
      });

      let index = 0;
      phase.groups.forEach((group) => {
        const angles: number[] = [];
        group.items.forEach((it) => {
          const a = center - usable / 2 + step * index;
          angles.push(a);
          const pos = polar(a, index % 2 === 0 ? itemR : itemR * 1.14);
          nodes.push({
            id: it.id,
            kind: "item",
            label: it.label,
            x: pos.x,
            y: pos.y,
            phaseId: phase.id,
            constellation: cid,
            parentId: group.id,
            item: it,
          });
          index += 1;
          edges.push({
            id: `e-${group.id}-${it.id}`,
            from: group.id,
            to: it.id,
            phaseId: phase.id,
            toId: it.id,
          });
        });
        const ga = angles.reduce((a, b) => a + b, 0) / angles.length;
        const gp = polar(ga, ring.groupR);
        nodes.push({
          id: group.id,
          kind: "group",
          label: group.label,
          x: gp.x,
          y: gp.y,
          phaseId: phase.id,
          constellation: cid,
          parentId: phase.id,
        });
        edges.push({
          id: `e-${phase.id}-${group.id}`,
          from: phase.id,
          to: group.id,
          phaseId: phase.id,
          toId: group.id,
        });
      });
    });
  });

  const byId = new Map(nodes.map((n) => [n.id, n] as const));

  const boxOf = (list: MapNode[]): Box => {
    const xs = list.map((n) => n.x);
    const ys = list.map((n) => n.y);
    return {
      x0: Math.min(...xs),
      y0: Math.min(...ys),
      x1: Math.max(...xs),
      y1: Math.max(...ys),
    };
  };

  const boxes: Record<string, Box> = {
    all: boxOf(nodes),
    base: boxOf(nodes.filter((n) => n.constellation === "base" || n.kind === "center")),
    toeic: boxOf(nodes.filter((n) => n.constellation === "toeic")),
    ielts: boxOf(nodes.filter((n) => n.constellation === "ielts")),
  };

  return { nodes, edges, byId, boxes };
}

export const LAYOUT = build();

export const STARFIELD = Array.from({ length: 200 }, (_, i) => {
  const a = (i * 2.399963) % TAU;
  const r = 200 + ((i * 137.5) % 3600);
  return {
    id: i,
    x: Math.round(Math.cos(a) * r * (1 + ((i % 7) / 10)) * 100) / 100,
    y: Math.round(Math.sin(a) * r * (1 + ((i % 5) / 10)) * 100) / 100,
    r: 0.8 + ((i % 4) * 0.5),
    delay: (i % 11) * 0.7,
  };
});

export const DUST = Array.from({ length: 40 }, (_, i) => {
  const a = (i * 1.618033) % (Math.PI * 2);
  const r = 400 + ((i * 211) % 3400);
  return {
    id: i,
    x: Math.round(Math.cos(a) * r * 100) / 100,
    y: Math.round(Math.sin(a) * r * 100) / 100,
    r: 1 + ((i % 3) * 0.6),
    delay: (i % 13) * 1.4,
    dur: 40 + (i % 7) * 8,
  };
});
