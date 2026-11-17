import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  Cable,
  Cpu,
  Download,
  Eye,
  Grid3X3,
  Layers,
  Maximize2,
  Move,
  RotateCcw,
  Ruler,
  Wand2,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  computeLedCanvasWiringPlan,
  computeLedProgramColor,
  getLedById,
  suggestGridFromDimensions,
  type LedCategoryId,
  type PsuMountSide,
  type SoftProgramId,
  type WiringPattern,
} from '../../shared/studio-calc';

interface StudioLedCanvasDiagramProps {
  boardWidthCm: number;
  boardHeightCm: number;
  sheetWidthCm?: number;
  sheetHeightCm?: number;
  rows: number;
  cols: number;
  pattern: WiringPattern;
  programId: SoftProgramId;
  ledId: LedCategoryId;
  tick: number;
  selectedNodeIdx: number;
  onSelectNode: (index: number) => void;
  onChangeBoardDimensions?: (widthCm: number, heightCm: number) => void;
  onApplySuggestedGrid?: (rows: number, cols: number) => void;
}

const PSU_COLORS = ['#F5D061', '#38BDF8', '#A78BFA', '#34D399', '#FB7185', '#FBBF24'];

const MOUNT_SIDE_OPTIONS: Array<{ id: PsuMountSide; labelAr: string }> = [
  { id: 'bottom', labelAr: 'أسفل اللوحة' },
  { id: 'top', labelAr: 'أعلى اللوحة' },
  { id: 'right', labelAr: 'يمين الشاسيه' },
  { id: 'left', labelAr: 'يسار الشاسيه' },
  { id: 'distributed', labelAr: 'توزيع متوازن داخل الشعار' },
];

export function StudioLedCanvasDiagram({
  boardWidthCm,
  boardHeightCm,
  sheetWidthCm = 122,
  sheetHeightCm = 244,
  rows,
  cols,
  pattern,
  programId,
  ledId,
  tick,
  selectedNodeIdx,
  onSelectNode,
  onChangeBoardDimensions,
  onApplySuggestedGrid,
}: StudioLedCanvasDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mountSide, setMountSide] = useState<PsuMountSide>('bottom');
  const [customPsuPositions, setCustomPsuPositions] = useState<
    Record<string, { xCm: number; yCm: number }>
  >({});
  const [selectedPsuId, setSelectedPsuId] = useState<string | null>(null);
  const [draggingPsuId, setDraggingPsuId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<
    | { kind: 'led'; index: number; code: string; xCm: number; yCm: number; psuIndex: number }
    | { kind: 'psu'; id: string; labelAr: string; ampsRating: number; voltage: number; xCm: number; yCm: number }
    | null
  >(null);

  const [showDataPath, setShowDataPath] = useState(true);
  const [showPowerLines, setShowPowerLines] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showSheetSeams, setShowSheetSeams] = useState(true);
  const [colorMode, setColorMode] = useState<'program' | 'circuits'>('program');
  const [zoom, setZoom] = useState(1);
  const [canvasPixelSize, setCanvasPixelSize] = useState({ width: 920, height: 470 });

  const activeLed = getLedById(ledId);

  const plan = useMemo(
    () =>
      computeLedCanvasWiringPlan({
        widthCm: boardWidthCm,
        heightCm: boardHeightCm,
        rows,
        cols,
        pattern,
        ledId,
        mountSide,
        customPsuPositions,
      }),
    [boardWidthCm, boardHeightCm, rows, cols, pattern, ledId, mountSide, customPsuPositions]
  );

  // Compute responsive canvas container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = Math.max(320, Math.floor(el.clientWidth));
      const aspect = Math.max(0.42, Math.min(0.85, (boardHeightCm + 50) / Math.max(100, boardWidthCm + 50)));
      const h = Math.max(340, Math.min(560, Math.round(w * aspect)));
      setCanvasPixelSize({ width: w, height: h });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [boardWidthCm, boardHeightCm]);

  // Compute coordinate transform helpers between CM space and Canvas CSS pixels
  const transform = useMemo(() => {
    const padLeft = 72;
    const padRight = 72;
    const padTop = 68;
    const padBottom = 88;
    const availW = Math.max(120, canvasPixelSize.width - padLeft - padRight);
    const availH = Math.max(120, canvasPixelSize.height - padTop - padBottom);
    const baseScale = Math.min(availW / plan.widthCm, availH / plan.heightCm);
    const scale = baseScale * zoom;
    const drawW = plan.widthCm * scale;
    const drawH = plan.heightCm * scale;
    const originX = (canvasPixelSize.width - drawW) / 2;
    const originY = (canvasPixelSize.height - drawH) / 2 - 4;

    return {
      scale,
      originX,
      originY,
      drawW,
      drawH,
      toPxX: (xCm: number) => originX + xCm * scale,
      toPxY: (yCm: number) => originY + yCm * scale,
      toCmX: (pxX: number) => (pxX - originX) / scale,
      toCmY: (pxY: number) => (pxY - originY) / scale,
    };
  }, [canvasPixelSize, plan.widthCm, plan.heightCm, zoom]);

  // Main Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasPixelSize.width * dpr;
    canvas.height = canvasPixelSize.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { width, height } = canvasPixelSize;
    const { originX, originY, drawW, drawH, toPxX, toPxY, scale } = transform;

    // 1. Background fill
    ctx.fillStyle = '#040508';
    ctx.fillRect(0, 0, width, height);

    // Subtle radial gold ambient glow behind sign
    const bgGlow = ctx.createRadialGradient(
      width / 2,
      height / 2,
      20,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.6
    );
    bgGlow.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
    bgGlow.addColorStop(1, 'rgba(4, 5, 8, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Engineering CM Grid inside sign board
    ctx.save();
    ctx.beginPath();
    ctx.rect(originX, originY, drawW, drawH);
    ctx.clip();

    ctx.fillStyle = '#090B10';
    ctx.fillRect(originX, originY, drawW, drawH);

    const stepCm = plan.widthCm > 600 ? 50 : 25;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = stepCm; x < plan.widthCm; x += stepCm) {
      const px = toPxX(x);
      ctx.beginPath();
      ctx.moveTo(px, originY);
      ctx.lineTo(px, originY + drawH);
      ctx.stroke();
    }
    for (let y = stepCm; y < plan.heightCm; y += stepCm) {
      const py = toPxY(y);
      ctx.beginPath();
      ctx.moveTo(originX, py);
      ctx.lineTo(originX + drawW, py);
      ctx.stroke();
    }

    // Optional Standard Sheet Seams (e.g. 122x244)
    if (showSheetSeams && sheetWidthCm > 10 && sheetHeightCm > 10) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 5]);
      for (let sx = sheetWidthCm; sx < plan.widthCm; sx += sheetWidthCm) {
        const px = toPxX(sx);
        ctx.beginPath();
        ctx.moveTo(px, originY);
        ctx.lineTo(px, originY + drawH);
        ctx.stroke();
      }
      for (let sy = sheetHeightCm; sy < plan.heightCm; sy += sheetHeightCm) {
        const py = toPxY(sy);
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(originX + drawW, py);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // 3. Sign Board Metallic Gold Border
    ctx.save();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(originX, originY, drawW, drawH);

    // Outer Chassis Corner Brackets
    const cornerLen = 12;
    ctx.strokeStyle = '#FFF1B8';
    ctx.lineWidth = 2.5;
    const corners = [
      [originX, originY, 1, 1],
      [originX + drawW, originY, -1, 1],
      [originX, originY + drawH, 1, -1],
      [originX + drawW, originY + drawH, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * cornerLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * cornerLen);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Dimension Rulers (Width at Top, Height at Left)
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 208, 97, 0.65)';
    ctx.fillStyle = '#F5D061';
    ctx.lineWidth = 1;
    ctx.font = 'bold 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top horizontal ruler
    const topRulerY = originY - 18;
    ctx.beginPath();
    ctx.moveTo(originX, topRulerY);
    ctx.lineTo(originX + drawW, topRulerY);
    ctx.moveTo(originX, originY - 23);
    ctx.lineTo(originX, originY - 13);
    ctx.moveTo(originX + drawW, originY - 23);
    ctx.lineTo(originX + drawW, originY - 13);
    ctx.stroke();

    const widthLabel = `${plan.widthCm} cm (${cols} col · ${plan.pitchXCm}cm pitch)`;
    const widthBadgeW = Math.min(drawW - 12, ctx.measureText(widthLabel).width + 16);
    if (widthBadgeW > 40) {
      ctx.fillStyle = '#07080C';
      ctx.fillRect(originX + drawW / 2 - widthBadgeW / 2, topRulerY - 9, widthBadgeW, 18);
      ctx.fillStyle = '#F5D061';
      ctx.fillText(widthLabel, originX + drawW / 2, topRulerY);
    }

    // Left vertical ruler
    const leftRulerX = originX - 20;
    ctx.beginPath();
    ctx.moveTo(leftRulerX, originY);
    ctx.lineTo(leftRulerX, originY + drawH);
    ctx.moveTo(originX - 25, originY);
    ctx.lineTo(originX - 15, originY);
    ctx.moveTo(originX - 25, originY + drawH);
    ctx.lineTo(originX - 15, originY + drawH);
    ctx.stroke();

    ctx.save();
    ctx.translate(leftRulerX - 12, originY + drawH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#F5D061';
    ctx.fillText(`${plan.heightCm} cm (${rows} row)`, 0, 0);
    ctx.restore();
    ctx.restore();

    // 5. Data Signal Wiring Diagram Path + Directional Arrows
    if (showDataPath && plan.nodeCoords.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.72)';
      ctx.lineWidth = Math.max(1.4, Math.min(2.6, scale * 0.6));
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      plan.nodeCoords.forEach((n, idx) => {
        const px = toPxX(n.xCm);
        const py = toPxY(n.yCm);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Directional arrows along segments
      const arrowStride = plan.nodeCoords.length > 120 ? 3 : 1;
      for (let i = 0; i < plan.nodeCoords.length - 1; i += arrowStride) {
        const a = plan.nodeCoords[i];
        const b = plan.nodeCoords[i + 1];
        const ax = toPxX(a.xCm);
        const ay = toPxY(a.yCm);
        const bx = toPxX(b.xCm);
        const by = toPxY(b.yCm);
        const dist = Math.hypot(bx - ax, by - ay);
        if (dist < 18) continue;

        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        const angle = Math.atan2(by - ay, bx - ax);
        const sz = 5;
        ctx.fillStyle = '#FFF1B8';
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(angle) * sz, my + Math.sin(angle) * sz);
        ctx.lineTo(mx + Math.cos(angle + 2.4) * sz, my + Math.sin(angle + 2.4) * sz);
        ctx.lineTo(mx + Math.cos(angle - 2.4) * sz, my + Math.sin(angle - 2.4) * sz);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Power Supply Feeder Lines (+V Red & GND Slate)
    if (showPowerLines) {
      for (const branch of plan.powerBranches) {
        const psu = plan.psuUnits.find((p) => p.id === branch.psuId);
        const psuColor = PSU_COLORS[((psu?.index || 1) - 1) % PSU_COLORS.length];
        const isHighlighted =
          selectedPsuId === branch.psuId ||
          selectedNodeIdx === branch.targetNodeIndex ||
          (hoveredItem?.kind === 'psu' && hoveredItem.id === branch.psuId) ||
          (hoveredItem?.kind === 'led' && hoveredItem.index === branch.targetNodeIndex);

        const fx = toPxX(branch.fromXCm);
        const fy = toPxY(branch.fromYCm);
        const tx = toPxX(branch.toXCm);
        const ty = toPxY(branch.toYCm);

        // Orthogonal/Elbow cable trace (+V crimson + PSU tint)
        const midY = fy + (ty - fy) * 0.55;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // GND companion wire (slightly offset)
        ctx.strokeStyle = isHighlighted ? 'rgba(148, 163, 184, 0.9)' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = isHighlighted ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(fx + 3, fy + 2);
        ctx.lineTo(fx + 3, midY + 2);
        ctx.lineTo(tx + 3, midY + 2);
        ctx.lineTo(tx + 3, ty + 2);
        ctx.stroke();

        // +V positive wire
        ctx.strokeStyle = isHighlighted ? '#FB7185' : 'rgba(244, 63, 94, 0.62)';
        ctx.lineWidth = isHighlighted ? 2.8 : 1.7;
        ctx.beginPath();
        ctx.moveTo(fx - 2, fy);
        ctx.lineTo(fx - 2, midY);
        ctx.lineTo(tx - 2, midY);
        ctx.lineTo(tx - 2, ty);
        ctx.stroke();

        // Cable length label badge
        if (isHighlighted || plan.powerBranches.length <= 8) {
          const lx = (fx + tx) / 2;
          const ly = midY - 9;
          const tag = `${branch.cableLengthMeters}م`;
          ctx.font = 'bold 10px ui-monospace, monospace';
          const tw = ctx.measureText(tag).width + 8;
          ctx.fillStyle = 'rgba(7, 8, 12, 0.92)';
          ctx.fillRect(lx - tw / 2, ly - 7, tw, 14);
          ctx.strokeStyle = psuColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(lx - tw / 2, ly - 7, tw, 14);
          ctx.fillStyle = '#FECDD3';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tag, lx, ly);
        }
        ctx.restore();
      }
    }

    // 7. LED Nodes
    const cellPxW = drawW / Math.max(1, cols);
    const cellPxH = drawH / Math.max(1, rows);
    const radius = Math.max(5.5, Math.min(18, Math.min(cellPxW, cellPxH) * 0.34));

    for (const node of plan.nodeCoords) {
      const cx = toPxX(node.xCm);
      const cy = toPxY(node.yCm);
      const isSelected = selectedNodeIdx === node.index;
      const isHovered = hoveredItem?.kind === 'led' && hoveredItem.index === node.index;
      const psuColor = PSU_COLORS[(node.assignedPsuIndex - 1) % PSU_COLORS.length];

      let fill = psuColor;
      let glowColor: string | null = null;
      let darkText = true;

      if (colorMode === 'program') {
        const sim = computeLedProgramColor(programId, node.index, plan.totalNodes, tick);
        fill = sim.bg;
        glowColor = sim.brightness > 0.5 ? sim.bg : null;
        darkText = sim.brightness > 0.45;
      } else {
        darkText = node.assignedPsuIndex === 1 || node.assignedPsuIndex === 4 || node.assignedPsuIndex === 6;
      }

      ctx.save();
      if (glowColor || isSelected || isHovered) {
        ctx.shadowColor = isSelected ? '#FFFFFF' : glowColor || psuColor;
        ctx.shadowBlur = isSelected || isHovered ? 16 : 9;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, isSelected ? radius * 1.18 : radius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.lineWidth = isSelected || isHovered ? 2.5 : node.needsPowerInjection ? 2 : 1;
      ctx.strokeStyle = isSelected
        ? '#FFFFFF'
        : node.needsPowerInjection
        ? '#FB7185'
        : 'rgba(212, 175, 55, 0.5)';
      ctx.stroke();

      // Power injection dot badge on top-right
      if (node.needsPowerInjection && radius >= 7) {
        ctx.beginPath();
        ctx.arc(cx + radius * 0.72, cy - radius * 0.72, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FB7185';
        ctx.fill();
        ctx.strokeStyle = '#040508';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // LED Number label
      if (showNumbers && radius >= 8) {
        ctx.fillStyle = darkText ? '#050608' : '#F4F4F6';
        ctx.font = `bold ${radius >= 12 ? 9.5 : 8}px ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(node.index).padStart(3, '0'), cx, cy + 0.5);
      }

      ctx.restore();
    }

    // 8. Interactive Draggable Power Supply Units (PSUs)
    for (const psu of plan.psuUnits) {
      const px = toPxX(psu.xCm);
      const py = toPxY(psu.yCm);
      const psuColor = PSU_COLORS[(psu.index - 1) % PSU_COLORS.length];
      const isActive =
        selectedPsuId === psu.id ||
        draggingPsuId === psu.id ||
        (hoveredItem?.kind === 'psu' && hoveredItem.id === psu.id);

      const boxW = 86;
      const boxH = 38;
      const x = Math.max(8, Math.min(width - boxW - 8, px - boxW / 2));
      const y = Math.max(8, Math.min(height - boxH - 8, py - boxH / 2));

      ctx.save();
      ctx.shadowColor = isActive ? psuColor : 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = isActive ? 16 : 8;

      // Metallic PSU chassis card
      const grad = ctx.createLinearGradient(x, y, x, y + boxH);
      grad.addColorStop(0, '#1B1F2A');
      grad.addColorStop(1, '#080A0F');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 8);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = isActive ? '#FFFFFF' : psuColor;
      ctx.lineWidth = isActive ? 2.2 : 1.5;
      ctx.stroke();

      // Terminal strip indicator (+ / -)
      ctx.fillStyle = '#FB7185';
      ctx.fillRect(x + 7, y + 6, 4, 10);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(x + 13, y + 6, 4, 10);

      // PSU Labels
      ctx.fillStyle = psuColor;
      ctx.font = 'bold 10px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`PSU #${psu.index}`, x + boxW - 7, y + 5);

      ctx.fillStyle = '#E5E7EB';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillText(`${psu.voltage}V · ${psu.ampsRating}A`, x + boxW - 7, y + 20);
      ctx.restore();
    }
  }, [
    canvasPixelSize,
    transform,
    plan,
    cols,
    rows,
    showDataPath,
    showPowerLines,
    showNumbers,
    showSheetSeams,
    sheetWidthCm,
    sheetHeightCm,
    colorMode,
    programId,
    tick,
    selectedNodeIdx,
    selectedPsuId,
    draggingPsuId,
    hoveredItem,
  ]);

  // Helper to hit-test pointer coordinates against PSUs & LEDs
  const getCanvasPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasPixelSize.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasPixelSize.height,
    };
  };

  const hitTestPsu = (pxX: number, pxY: number) => {
    for (const psu of plan.psuUnits) {
      const cx = Math.max(51, Math.min(canvasPixelSize.width - 51, transform.toPxX(psu.xCm)));
      const cy = Math.max(27, Math.min(canvasPixelSize.height - 27, transform.toPxY(psu.yCm)));
      if (Math.abs(pxX - cx) <= 44 && Math.abs(pxY - cy) <= 21) {
        return psu;
      }
    }
    return null;
  };

  const hitTestLed = (pxX: number, pxY: number) => {
    const cellPxW = transform.drawW / Math.max(1, cols);
    const cellPxH = transform.drawH / Math.max(1, rows);
    const hitRadius = Math.max(10, Math.min(22, Math.min(cellPxW, cellPxH) * 0.45));
    let closest: (typeof plan.nodeCoords)[number] | null = null;
    let bestDist = hitRadius;
    for (const n of plan.nodeCoords) {
      const dist = Math.hypot(pxX - transform.toPxX(n.xCm), pxY - transform.toPxY(n.yCm));
      if (dist <= bestDist) {
        bestDist = dist;
        closest = n;
      }
    }
    return closest;
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPoint(e);
    const hitPsu = hitTestPsu(x, y);
    if (hitPsu) {
      setDraggingPsuId(hitPsu.id);
      setSelectedPsuId(hitPsu.id);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    const hitLed = hitTestLed(x, y);
    if (hitLed) {
      onSelectNode(hitLed.index);
      setSelectedPsuId(`PSU-${hitLed.assignedPsuIndex}`);
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPoint(e);

    if (draggingPsuId) {
      const rawXCm = transform.toCmX(x);
      const rawYCm = transform.toCmY(y);
      const clampedX = Math.max(-plan.widthCm * 0.15, Math.min(plan.widthCm * 1.15, rawXCm));
      const clampedY = Math.max(-plan.heightCm * 0.3, Math.min(plan.heightCm * 1.35, rawYCm));
      setCustomPsuPositions((prev) => ({
        ...prev,
        [draggingPsuId]: {
          xCm: Number(clampedX.toFixed(1)),
          yCm: Number(clampedY.toFixed(1)),
        },
      }));
      return;
    }

    const hitPsu = hitTestPsu(x, y);
    if (hitPsu) {
      setHoveredItem({
        kind: 'psu',
        id: hitPsu.id,
        labelAr: hitPsu.labelAr,
        ampsRating: hitPsu.ampsRating,
        voltage: hitPsu.voltage,
        xCm: hitPsu.xCm,
        yCm: hitPsu.yCm,
      });
      return;
    }

    const hitLed = hitTestLed(x, y);
    if (hitLed) {
      setHoveredItem({
        kind: 'led',
        index: hitLed.index,
        code: hitLed.code,
        xCm: hitLed.xCm,
        yCm: hitLed.yCm,
        psuIndex: hitLed.assignedPsuIndex,
      });
      return;
    }

    setHoveredItem(null);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (draggingPsuId) {
      setDraggingPsuId(null);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleAutoSuggestGrid = () => {
    const suggestion = suggestGridFromDimensions(boardWidthCm, boardHeightCm, activeLed);
    onApplySuggestedGrid?.(suggestion.rows, suggestion.cols);
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `mahmoud-led-canvas-${plan.widthCm}x${plan.heightCm}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fullBoardSuggestion = useMemo(
    () => suggestGridFromDimensions(boardWidthCm, boardHeightCm, activeLed),
    [boardWidthCm, boardHeightCm, activeLed]
  );

  return (
    <section className="glossy-black-card rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="glossy-black-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <Cable className="w-5 h-5 text-[#F5D061]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              خريطة توزيع الليدات ومسارات التوصيل والباور سبلاي (Canvas التفاعلي)
            </h3>
            <p className="text-xs text-[#A1A6B3]">
              رسم هندسي بمقياس الأبعاد الفعلية — اسحب أي باور سبلاي لتعديل مكانه ورؤية أطوال الأسلاك الفورية
            </p>
          </div>
        </div>

        <div className="print:hidden flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoSuggestGrid}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>ضبط التوزيع للأبعاد ({fullBoardSuggestion.rows}×{fullBoardSuggestion.cols})</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080A0F] border border-[#D4AF37]/50 text-[#F5D061] hover:bg-[#141720] text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل المخطط PNG</span>
          </button>
        </div>
      </div>

      {/* Dimensions + Mounting Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Editable Width & Height */}
        <div className="md:col-span-5 bg-[#07080C] border border-white/10 rounded-xl p-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="canvas-width-cm" className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] mb-1">
              <Ruler className="w-3 h-3" />
              <span>عرض اللوحة (سم)</span>
            </label>
            <input
              id="canvas-width-cm"
              type="number"
              min={30}
              max={5000}
              value={boardWidthCm}
              onChange={(e) =>
                onChangeBoardDimensions?.(Math.max(30, Number(e.target.value) || 100), boardHeightCm)
              }
              className="w-full bg-[#040508] border border-white/15 focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs font-mono-tabular text-white outline-none"
            />
          </div>
          <div>
            <label htmlFor="canvas-height-cm" className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] mb-1">
              <Ruler className="w-3 h-3" />
              <span>ارتفاع اللوحة (سم)</span>
            </label>
            <input
              id="canvas-height-cm"
              type="number"
              min={20}
              max={2000}
              value={boardHeightCm}
              onChange={(e) =>
                onChangeBoardDimensions?.(boardWidthCm, Math.max(20, Number(e.target.value) || 50))
              }
              className="w-full bg-[#040508] border border-white/15 focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs font-mono-tabular text-white outline-none"
            />
          </div>
        </div>

        {/* Power Supply Placement Presets */}
        <div className="md:col-span-7 bg-[#07080C] border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37]">
              <Zap className="w-3.5 h-3.5" />
              <span>موضع تركيب الباور سبلاي (أو اسحبه مباشرة بالماوس):</span>
            </span>
            {Object.keys(customPsuPositions).length > 0 && (
              <button
                type="button"
                onClick={() => setCustomPsuPositions({})}
                className="inline-flex items-center gap-1 text-[11px] text-[#F5D061] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة الترتيب التلقائي</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MOUNT_SIDE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setMountSide(opt.id);
                  setCustomPsuPositions({});
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  mountSide === opt.id
                    ? 'bg-[#D4AF37] text-[#050608] border-[#F5D061]'
                    : 'bg-[#040508] text-[#D4D7E0] border-white/10 hover:border-[#D4AF37]/45'
                }`}
              >
                {opt.labelAr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer Toggles & Zoom Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-2 bg-[#07080C] border border-white/10 rounded-xl p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowDataPath((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
              showDataPath
                ? 'bg-[#201909] border-[#F5D061]/60 text-[#F5D061]'
                : 'bg-[#040508] border-white/10 text-[#9EA4B3]'
            }`}
          >
            <Cable className="w-3.5 h-3.5" />
            <span>مسار الداتا</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPowerLines((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
              showPowerLines
                ? 'bg-rose-950/50 border-rose-400/50 text-rose-200'
                : 'bg-[#040508] border-white/10 text-[#9EA4B3]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>خطوط الباور (+V / GND)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNumbers((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
              showNumbers
                ? 'bg-[#201909] border-[#F5D061]/60 text-[#F5D061]'
                : 'bg-[#040508] border-white/10 text-[#9EA4B3]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>أرقام الليد</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSheetSeams((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
              showSheetSeams
                ? 'bg-sky-950/50 border-sky-400/50 text-sky-200'
                : 'bg-[#040508] border-white/10 text-[#9EA4B3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>فواصل الألواح</span>
          </button>
          <button
            type="button"
            onClick={() => setColorMode((m) => (m === 'program' ? 'circuits' : 'program'))}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-[#0D1017] border-[#D4AF37]/40 text-[#E5E7EB] hover:border-[#F5D061] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>{colorMode === 'program' ? 'نمط: محاكاة السوفت' : 'نمط: دوائر الباور'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
            aria-label="تصغير المخطط"
            className="p-1.5 rounded-lg bg-[#040508] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/60 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono-tabular text-[#F5D061] px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
            aria-label="تكبير المخطط"
            className="p-1.5 rounded-lg bg-[#040508] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/60 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            aria-label="ملاءمة المخطط"
            className="p-1.5 rounded-lg bg-[#040508] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/60 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-[#040508]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            setHoveredItem(null);
            setDraggingPsuId(null);
          }}
          style={{
            width: `${canvasPixelSize.width}px`,
            height: `${canvasPixelSize.height}px`,
            touchAction: 'none',
          }}
          className={`block ${draggingPsuId ? 'cursor-grabbing' : hoveredItem?.kind === 'psu' ? 'cursor-grab' : 'cursor-crosshair'}`}
        />

        {/* Floating Legend / Hover Inspector */}
        <div className="bg-[#07080C]/95 border-t border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3 text-[#B5BAC7]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] inline-block" />
              <span>مسار الداتا ({pattern})</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>حقن باور +V (كل {plan.injectionEveryNodes} ليد)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Move className="w-3 h-3 text-[#F5D061]" />
              <span>اسحب الباور سبلاي لتغيير مكانه</span>
            </span>
          </div>

          <div className="font-mono-tabular text-[#F5D061] font-bold">
            {hoveredItem ? (
              hoveredItem.kind === 'psu' ? (
                <span>
                  {hoveredItem.labelAr} ({hoveredItem.voltage}V · {hoveredItem.ampsRating}A) · X:{hoveredItem.xCm}سم Y:{hoveredItem.yCm}سم
                </span>
              ) : (
                <span>
                  {hoveredItem.code} · X:{hoveredItem.xCm}سم Y:{hoveredItem.yCm}سم · تغذية PSU #{hoveredItem.psuIndex}
                </span>
              )
            ) : (
              <span>
                الشبكة: {plan.totalNodes} نقطة · التباعد: {plan.pitchXCm}×{plan.pitchYCm} سم · الكابل الكلي: {plan.totalFeederCableMeters}م
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PSU Mounting & Wiring Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {plan.psuUnits.map((psu, idx) => {
          const psuBranches = plan.powerBranches.filter((b) => b.psuId === psu.id);
          const color = PSU_COLORS[idx % PSU_COLORS.length];
          const isSelected = selectedPsuId === psu.id;
          return (
            <button
              key={psu.id}
              type="button"
              onClick={() => setSelectedPsuId(isSelected ? null : psu.id)}
              className={`text-start rounded-xl p-3.5 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#171308] border-[#F5D061]'
                  : 'bg-[#07080C] border-white/10 hover:border-[#D4AF37]/45'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-extrabold text-white">{psu.labelAr}</span>
                </div>
                <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded bg-black/80 border border-white/15 text-[#F5D061]">
                  {psu.voltage}V · {psu.ampsRating}A
                </span>
              </div>
              <div className="text-[11px] text-[#B5BAC7] space-y-1">
                <div className="flex items-center justify-between">
                  <span>نطاق التغذية:</span>
                  <span className="font-mono-tabular text-white">
                    LED {String(psu.assignedNodeStart).padStart(3, '0')} → LED{' '}
                    {String(psu.assignedNodeEnd).padStart(3, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الحمل الفعلي للشبكة:</span>
                  <span className="font-mono-tabular">
                    {psu.estimatedWatts}W ({psu.estimatedAmps}A)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>نقاط الحقن / السلك:</span>
                  <span className="font-mono-tabular text-rose-300">
                    {psuBranches.length} فرع · سلك {psuBranches[0]?.wireGaugeMm2 || '1.5mm²'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#8C92A0]">
                  <span>الموضع (X, Y):</span>
                  <span className="font-mono-tabular">
                    {psu.xCm} سم ، {psu.yCm} سم
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {/* Summary KPI Card for Full-Board Real Pitch Estimate */}
        <div className="bg-[#07080C] border border-[#D4AF37]/30 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#F5D061]">
            <Cpu className="w-4 h-4" />
            <span>ملخص الكثافة والتوصيل للأبعاد ({plan.widthCm}×{plan.heightCm} سم)</span>
          </div>
          <div className="text-[11px] text-[#B5BAC7] space-y-1">
            <div className="flex justify-between">
              <span>تقدير اللوحة الكاملة بتباعد {activeLed.recommendedSpacingCm} سم:</span>
              <strong className="text-white font-mono-tabular">
                ~{fullBoardSuggestion.estimatedFullBoardLeds} {activeLed.unitLabelAr}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>إجمالي طول كابلات التغذية (+V / -GND):</span>
              <strong className="text-rose-300 font-mono-tabular">
                {plan.totalFeederCableMeters} متر (مزدوج)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>مكان التركيب الموصى به:</span>
              <strong className="text-[#F5D061]">
                {MOUNT_SIDE_OPTIONS.find((o) => o.id === mountSide)?.labelAr}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
