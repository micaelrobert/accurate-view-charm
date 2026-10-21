import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

type Point = { x: number; y: number };
/** Pontos normalizados pela largura da área, para redesenhar sem distorcer ao redimensionar. */
type Stroke = Point[];

export type SignaturePadHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  /** PNG transparente, recortado nos traços. Retorna null se não houver assinatura. */
  toPng: () => string | null;
};

type Props = {
  onChange?: (hasInk: boolean) => void;
  disabled?: boolean;
  className?: string;
  label: string;
};

const LINE_WIDTH = 2.6; // em px CSS, relativo a uma largura de 320px
const BASE_WIDTH = 320;

function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number, lineWidth: number, color: string, offset: Point = { x: 0, y: 0 }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  for (const stroke of strokes) {
    const pts = stroke.map((p) => ({ x: p.x * scale - offset.x, y: p.y * scale - offset.y }));
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0]!.x, pts[0]!.y, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mid = { x: (pts[i]!.x + pts[i + 1]!.x) / 2, y: (pts[i]!.y + pts[i + 1]!.y) / 2 };
      ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, mid.x, mid.y);
    }
    const last = pts[pts.length - 1]!;
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
}

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { onChange, disabled, className = "", label },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef<number | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const inkColor = useRef("#3b1f1a");

  const lineWidthFor = (w: number) => Math.max(2, (LINE_WIDTH * w) / BASE_WIDTH);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.current.w, size.current.h);
    drawStrokes(ctx, strokes.current, size.current.w, lineWidthFor(size.current.w), inkColor.current);
  }, []);

  // Ajusta a resolução ao tamanho real, mantendo os traços proporcionais
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const color = getComputedStyle(canvas).color;
    if (color) inkColor.current = color;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      size.current = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width || 1;
    return { x: (e.clientX - rect.left) / w, y: (e.clientY - rect.top) / w };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || drawing.current !== null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = e.pointerId;
    strokes.current.push([pointFrom(e)]);
    redraw();
    onChange?.(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawing.current !== e.pointerId) return;
    e.preventDefault();
    const stroke = strokes.current[strokes.current.length - 1];
    if (!stroke) return;
    const events = typeof e.nativeEvent.getCoalescedEvents === "function" ? e.nativeEvent.getCoalescedEvents() : [];
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width || 1;
    if (events.length > 1) {
      for (const ev of events) stroke.push({ x: (ev.clientX - rect.left) / w, y: (ev.clientY - rect.top) / w });
    } else {
      stroke.push(pointFrom(e));
    }
    redraw();
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawing.current !== e.pointerId) return;
    drawing.current = null;
  };

  useImperativeHandle(ref, () => ({
    clear() {
      strokes.current = [];
      drawing.current = null;
      redraw();
      onChange?.(false);
    },
    isEmpty() {
      return strokes.current.length === 0;
    },
    toPng() {
      if (strokes.current.length === 0) return null;
      // Exporta em resolução fixa e generosa, com fundo transparente
      const exportWidth = 900;
      const lw = lineWidthFor(exportWidth) * 1.1;
      const all = strokes.current.flat();
      const xs = all.map((p) => p.x * exportWidth);
      const ys = all.map((p) => p.y * exportWidth);
      const pad = lw * 4;
      const minX = Math.max(0, Math.min(...xs) - pad);
      const minY = Math.max(0, Math.min(...ys) - pad);
      const maxX = Math.max(...xs) + pad;
      const maxY = Math.max(...ys) + pad;
      const out = document.createElement("canvas");
      out.width = Math.max(1, Math.ceil(maxX - minX));
      out.height = Math.max(1, Math.ceil(maxY - minY));
      const ctx = out.getContext("2d");
      if (!ctx) return null;
      drawStrokes(ctx, strokes.current, exportWidth, lw, inkColor.current, { x: minX, y: minY });
      return out.toDataURL("image/png");
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onLostPointerCapture={endStroke}
      className={`block h-full w-full touch-none select-none text-signature-ink ${disabled ? "cursor-default" : "cursor-crosshair"} ${className}`}
      style={{ touchAction: "none" }}
    />
  );
});
