/**
 * A one-shot burst of dust particles on a canvas laid over a figure.
 * Points are given in the figure's SVG coordinates and mapped to the canvas.
 * The loop stops by itself once every particle has faded.
 */
export interface DustBurstOptions {
  /** viewBox width of the SVG the points belong to. */
  viewWidth: number;
  /** Top of the SVG viewBox, if it is cropped. */
  viewY?: number;
  count?: number;
  color?: string;
}

interface Grain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
}

export function createDust(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  let grains: Grain[] = [];
  let raf = 0;
  let last = 0;
  let scale = 1;
  let color = '60, 52, 40';

  const resize = (viewWidth: number, viewY = 0): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(hgt * dpr);
    scale = w / viewWidth;
    ctx?.setTransform(dpr * scale, 0, 0, dpr * scale, 0, -viewY * dpr * scale);
  };

  const frame = (now: number): void => {
    if (!ctx) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, -1e4, canvas.width / scale, 2e4);
    let alive = 0;
    for (const g of grains) {
      g.life += dt;
      if (g.life >= g.max) continue;
      alive++;
      g.vy += 60 * dt; // gentle gravity
      g.vx *= 0.985;
      g.vy *= 0.985;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      const a = (1 - g.life / g.max) * 0.55;
      ctx.fillStyle = `rgba(${color}, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = alive ? requestAnimationFrame(frame) : 0;
  };

  return {
    burst(points: { x: number; y: number }[], opts: DustBurstOptions): void {
      if (!ctx) return;
      resize(opts.viewWidth, opts.viewY);
      if (opts.color) color = opts.color;
      const count = opts.count ?? 160;
      for (let i = 0; i < count; i++) {
        const p = points[Math.floor(Math.random() * points.length)];
        const ang = -Math.PI * Math.random(); // mostly upward and sideways
        const speed = 20 + Math.random() * 90;
        grains.push({
          x: p.x + (Math.random() - 0.5) * 10,
          y: p.y + (Math.random() - 0.5) * 6,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed * 0.6,
          r: 0.6 + Math.random() * 1.8,
          life: 0,
          max: 1.4 + Math.random() * 2.2,
        });
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    clear(): void {
      cancelAnimationFrame(raf);
      raf = 0;
      grains = [];
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

export type Dust = ReturnType<typeof createDust>;
