/* ScienceHub Live Icon V1
   Orbit: 360° every 3.5s. Live animation remains active continuously.
   The 10s value is the preview cycle marker; it does not stop the live orbit.
*/
(() => {
  const ORBIT_SECONDS = 3.5;
  const PREVIEW_SECONDS = 10;
  const TAU = Math.PI * 2;
  const canvas = document.getElementById('brandIconCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = './assets/brand/sciencehub-icon-512.png';

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    const size = Math.max(96, Math.min(r.width || 44, r.height || 44));
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas._cssSize = size;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const paths = [
    {rx:.40, ry:.19, rot:-.34, phase:0, hue:195},
    {rx:.40, ry:.19, rot:.34, phase:Math.PI, hue:285},
    {rx:.36, ry:.25, rot:.78, phase:Math.PI/2, hue:35},
    {rx:.36, ry:.25, rot:-.78, phase:Math.PI*1.5, hue:315}
  ];

  function point(p, a, s) {
    const x = Math.cos(a) * p.rx * s;
    const y = Math.sin(a) * p.ry * s;
    const c = Math.cos(p.rot), q = Math.sin(p.rot);
    return {x:x*c-y*q, y:x*q+y*c};
  }

  function frame(now) {
    const s = canvas._cssSize || 96;
    const cx = s/2, cy = s/2;
    ctx.clearRect(0,0,s,s);
    if (img.complete && img.naturalWidth) ctx.drawImage(img,0,0,s,s);

    const elapsed = now / 1000;
    const base = (elapsed % ORBIT_SECONDS) / ORBIT_SECONDS * TAU;
    const lineW = Math.max(0.55, s * .007);
    paths.forEach((p, i) => {
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0,0,p.rx*s,p.ry*s,0,0,TAU);
      ctx.strokeStyle = `hsla(${p.hue},100%,72%,.52)`;
      ctx.lineWidth = lineW;
      ctx.stroke();
      ctx.restore();

      const a = base + p.phase;
      const pt = point(p,a,s);
      const px = cx + pt.x, py = cy + pt.y;
      const r = Math.max(1.6, s*.026);
      const g = ctx.createRadialGradient(px,py,0,px,py,r*3.2);
      g.addColorStop(0,`hsla(${p.hue},100%,92%,1)`);
      g.addColorStop(.35,`hsla(${p.hue},100%,70%,.9)`);
      g.addColorStop(1,`hsla(${p.hue},100%,60%,0)`);
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,r*3.2,0,TAU); ctx.fill();
      ctx.fillStyle=`hsl(${p.hue},100%,82%)`; ctx.beginPath(); ctx.arc(px,py,r,0,TAU); ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  img.onload = () => requestAnimationFrame(frame);
})();
