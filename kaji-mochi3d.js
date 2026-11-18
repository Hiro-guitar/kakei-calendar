import * as THREE from 'three';
// 餅花（年末年始のツリーのかわり）。枝・おもち・壺と、枝につるす縁起物
export function makeMochibana(seed = 7){
let s0 = seed; const rnd = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
const M = new THREE.Group();
/* ---------- 餅花 ---------- */
const gl = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color:c, roughness:.25, clearcoat:.8, clearcoatRoughness:.15, ...o });
const ctex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

// 壺：白い陶器に藍の唐草、首に紅白の水引
const potTex = ctex(512, 256, (g, w, h) => { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2d4f8e'; g.lineWidth = 5; g.fillStyle = '#2d4f8e';
  g.fillRect(0, 58, w, 9); g.fillRect(0, 196, w, 7); for (let i = 0; i < 10; i++){ const x = 26 + i * 51; g.beginPath(); for (let t = 0; t < 6.3; t += .1){ const r = 6 + t * 3.2; g.lineTo(x + Math.cos(t) * r, 130 + Math.sin(t) * r * .8); } g.stroke(); g.beginPath(); g.arc(x + 25, 112, 5, 0, 7); g.fill(); g.beginPath(); g.arc(x + 25, 150, 5, 0, 7); g.fill(); } });
potTex.wrapS = THREE.RepeatWrapping;
const pp = []; [[.001, 0], [.2, 0], [.27, .04], [.33, .18], [.35, .34], [.3, .52], [.19, .66], [.15, .74], [.17, .8], [.21, .84], [.2, .86]].forEach(([x, y]) => pp.push(new THREE.Vector2(x, y)));
const pot = new THREE.Mesh(new THREE.LatheGeometry(pp, 64), new THREE.MeshPhysicalMaterial({ color:'#ffffff', map:potTex, roughness:.18, clearcoat:1, clearcoatRoughness:.08 })); pot.castShadow = pot.receiveShadow = true; M.add(pot);
for (const [c, y] of [['#d8303a', .705], ['#ffffff', .725], ['#d8303a', .745]]){ const t = new THREE.Mesh(new THREE.TorusGeometry(.158, .009, 8, 40), gl(c, { roughness:.4 })); t.rotation.x = Math.PI / 2; t.position.y = y; M.add(t); }
{ const bow = new THREE.Group(); for (const s of [-1, 1]){ const l = new THREE.Mesh(new THREE.TorusGeometry(.05, .008, 8, 20), gl('#d8303a', { roughness:.4 })); l.scale.set(1.4, .8, 1); l.position.set(s * .065, 0, 0); bow.add(l); const tl = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .14, 6), gl('#ffffff', { roughness:.4 })); tl.position.set(s * .03, -.08, 0); tl.rotation.z = s * .3; bow.add(tl); } bow.position.set(0, .725, .165); M.add(bow); }
// 枝：根元が太く先が細い。小枝もわかれる
const bark = new THREE.MeshStandardMaterial({ color:'#5e3f2a', roughness:.9 }), branches = [];
function taper(cv, r0, r1, t0 = 0, t1 = 1){ const n = 5; for (let k = 0; k < n; k++){ const a = t0 + (t1 - t0) * k / n, b = t0 + (t1 - t0) * (k + 1) / n, pts = []; for (let q = 0; q <= 8; q++) pts.push(cv.getPointAt(a + (b - a) * q / 8)); const r = r0 + (r1 - r0) * (k + .5) / n; const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, r, 6), bark); m.castShadow = true; M.add(m); } }
const NB = 11;
for (let i = 0; i < NB; i++){
  const a = (i + .5) / NB * Math.PI * 2 + (rnd() - .5) * .4, top = 2.05 + rnd() * .75, reach = .5 + rnd() * .55, dx = Math.sin(a), dz = Math.cos(a) * .75, fall = .7 + rnd() * .6;
  const p = [new THREE.Vector3(dx * .03, .8, dz * .03), new THREE.Vector3(dx * .1, 1.35, dz * .1), new THREE.Vector3(dx * reach * .55, top - .12, dz * reach * .55), new THREE.Vector3(dx * reach, top + .04, dz * reach), new THREE.Vector3(dx * (reach + .3), top - .3, dz * (reach + .3)), new THREE.Vector3(dx * (reach + .42), top - fall, dz * (reach + .45))];
  const cv = new THREE.CatmullRomCurve3(p); branches.push(cv); taper(cv, .02, .007);
  // 小枝
  for (const t of [.5, .66]){ const o = cv.getPointAt(t), tg = cv.getTangentAt(t), side = new THREE.Vector3(-dz, 0, dx).multiplyScalar(rnd() < .5 ? 1 : -1);
    const q = [o, o.clone().add(side.clone().multiplyScalar(.14)).add(new THREE.Vector3(0, .06, 0)), o.clone().add(side.clone().multiplyScalar(.24)).add(tg.clone().multiplyScalar(.08)).add(new THREE.Vector3(0, -.12, 0)), o.clone().add(side.clone().multiplyScalar(.28)).add(new THREE.Vector3(0, -.42 - rnd() * .2, 0))];
    const sc = new THREE.CatmullRomCurve3(q); branches.push(sc); taper(sc, .008, .004); }
}
// おもち：白・ピンク・うす黄・うすみどり。やわらかくて、ちょっとつやのある丸
const mochiG = new THREE.SphereGeometry(.045, 18, 14);
const MOCHI = ['#fffaf2', '#fffaf2', '#f49aac', '#f49aac', '#ffe9a8', '#cfe9b8'].map(c => new THREE.MeshPhysicalMaterial({ color:c, roughness:.55, sheen:.6, sheenColor:new THREE.Color('#ffffff'), clearcoat:.25, clearcoatRoughness:.5 }));
branches.forEach((cv, bi) => { const L = cv.getLength(), n = Math.max(3, Math.floor(L / .19)); for (let k = 0; k < n; k++){ const t = .22 + (k + rnd() * .4) / n * .76; if (t > 1) continue; const p = cv.getPointAt(Math.min(1, t)); const m = new THREE.Mesh(mochiG, MOCHI[Math.floor(rnd() * MOCHI.length)]); const q = .8 + rnd() * .4; m.position.copy(p).add(new THREE.Vector3((rnd() - .5) * .02, (rnd() - .5) * .02, (rnd() - .5) * .02)); m.scale.set(q, q * .86, q); m.rotation.set(rnd(), rnd(), rnd()); m.castShadow = true; M.add(m); } });

/* 縁起物 */
const gold = new THREE.MeshPhysicalMaterial({ color:'#e7b84a', roughness:.22, metalness:.85, clearcoat:.6 }), redG = gl('#d8303a'), whG = gl('#fffaf0'), blk = gl('#231c1c', { roughness:.15 });
const faceTex = (draw) => ctex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); draw(g, w, h); });
function tai(){ const g = new THREE.Group();
  const sk = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d8343c'); gr.addColorStop(.6, '#ee6a5a'); gr.addColorStop(1, '#fbd2c0'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(160,20,30,.35)'; c.lineWidth = 2; for (let y = 8; y < h * .6; y += 12) for (let x = (y / 12 % 2) * 8; x < w; x += 16){ c.beginPath(); c.arc(x, y, 7, 0, Math.PI); c.stroke(); } });
  const b = new THREE.Mesh(new THREE.SphereGeometry(.1, 28, 20), gl('#ffffff', { map:sk })); b.scale.set(1.45, .95, .48); g.add(b);
  const fins = gl('#e2453b'); const tail = new THREE.Mesh(new THREE.CylinderGeometry(.075, .01, .11, 3, 1), fins); tail.rotation.z = Math.PI / 2; tail.position.x = -.18; tail.scale.z = .25; g.add(tail);
  const df = new THREE.Mesh(new THREE.ConeGeometry(.07, .08, 4), fins); df.position.set(-.01, .1, 0); df.scale.set(1.4, 1, .2); g.add(df);
  for (const s of [-1, 1]){ const e = new THREE.Mesh(new THREE.SphereGeometry(.02, 12, 8), whG); e.position.set(.1, .025, s * .04); g.add(e); const pu = new THREE.Mesh(new THREE.SphereGeometry(.011, 10, 8), blk); pu.position.set(.112, .027, s * .05); g.add(pu); }
  return g; }
function koban(){ const g = new THREE.Group(); const t = ctex(128, 192, (c, w, h) => { c.fillStyle = '#e7b84a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8862a'; c.lineWidth = 5; for (let y = 30; y < h - 20; y += 16){ c.beginPath(); c.moveTo(18, y); c.lineTo(w - 18, y); c.stroke(); } c.fillStyle = '#9a6a1a'; c.font = 'bold 34px serif'; c.textAlign = 'center'; c.fillText('福', w / 2, h / 2 + 12); });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .014, 36), [new THREE.MeshPhysicalMaterial({ color:'#e7b84a', roughness:.25, metalness:.8 }), new THREE.MeshPhysicalMaterial({ map:t, roughness:.25, metalness:.6 }), gold]); c.rotation.x = Math.PI / 2; c.scale.set(1, 1, 1.45); g.add(c); g.scale.set(1, 1, 1); return g; }
function kozuchi(){ const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, .15, 24), gold); h.rotation.z = Math.PI / 2; g.add(h);
  for (const x of [-.045, .045]){ const b = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .018, 24), redG); b.rotation.z = Math.PI / 2; b.position.x = x; g.add(b); }
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(.018, .024, .17, 12), gl('#8a5a32', { roughness:.5 })); hd.position.y = -.12; g.add(hd);
  const tas = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 8), redG); tas.position.y = -.21; tas.scale.y = 1.5; g.add(tas); return g; }
function daruma(){ const g = new THREE.Group();
  const ft = faceTex((c, w, h) => { c.fillStyle = '#d8303a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff8ee'; c.beginPath(); c.ellipse(w * .5, h * .44, 46, 40, 0, 0, 7); c.fill(); c.fillStyle = '#231c1c'; for (const s of [-1, 1]){ c.beginPath(); c.arc(w * .5 + s * 17, h * .42, 9, 0, 7); c.fill(); c.lineWidth = 4; c.strokeStyle = '#231c1c'; c.beginPath(); c.arc(w * .5 + s * 18, h * .34, 14, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } c.strokeStyle = '#d8303a'; c.lineWidth = 3; c.beginPath(); c.arc(w * .5, h * .5, 8, .2, Math.PI - .2); c.stroke(); c.fillStyle = '#e7b84a'; c.font = 'bold 30px serif'; c.textAlign = 'center'; c.fillText('福', w * .5, h * .78); c.fillStyle = 'rgba(255,170,170,.7)'; for (const s of [-1, 1]){ c.beginPath(); c.arc(w * .5 + s * 32, h * .5, 7, 0, 7); c.fill(); } });
  ft.offset.x = .25; const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 32, 24), gl('#ffffff', { map:ft })); b.scale.set(1, 1.12, .95); g.add(b); return g; }
function neko(){ const g = new THREE.Group(); const ft = faceTex((c, w, h) => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, w, h); c.fillStyle = '#231c1c'; for (const s of [-1, 1]){ c.lineWidth = 5; c.strokeStyle = '#231c1c'; c.beginPath(); c.arc(w * .5 + s * 18, h * .46, 8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } c.fillStyle = '#f49aac'; c.beginPath(); c.arc(w * .5, h * .53, 5, 0, 7); c.fill(); c.strokeStyle = '#231c1c'; c.lineWidth = 2; for (const s of [-1, 1]) for (const d of [-4, 4]){ c.beginPath(); c.moveTo(w * .5 + s * 14, h * .55 + d); c.lineTo(w * .5 + s * 40, h * .54 + d * 1.6); c.stroke(); } c.fillStyle = 'rgba(255,150,160,.6)'; for (const s of [-1, 1]){ c.beginPath(); c.arc(w * .5 + s * 30, h * .55, 7, 0, 7); c.fill(); } c.fillStyle = '#f2a040'; c.beginPath(); c.arc(w * .3, h * .3, 14, 0, 7); c.fill(); });
  ft.offset.x = .25; const body = new THREE.Mesh(new THREE.SphereGeometry(.075, 24, 18), whG); body.scale.set(1, 1.05, .9); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.068, 28, 20), gl('#ffffff', { map:ft })); head.position.y = .11; g.add(head);
  for (const s of [-1, 1]){ const ear = new THREE.Mesh(new THREE.ConeGeometry(.024, .045, 12), whG); ear.position.set(s * .042, .17, 0); ear.rotation.z = -s * .25; g.add(ear); const inr = new THREE.Mesh(new THREE.ConeGeometry(.013, .028, 10), gl('#f49aac')); inr.position.set(s * .042, .168, .01); inr.rotation.z = -s * .25; g.add(inr); }
  const col = new THREE.Mesh(new THREE.TorusGeometry(.052, .011, 8, 24), redG); col.rotation.x = Math.PI / 2; col.position.y = .055; g.add(col);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(.016, 12, 10), gold); bell.position.set(0, .043, .055); g.add(bell);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.018, .05, 4, 10), whG); arm.position.set(.065, .14, .02); arm.rotation.z = -.3; g.add(arm);
  const kb = koban(); kb.scale.setScalar(.6); kb.position.set(0, -.005, .07); g.add(kb); return g; }
function suzu(){ const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.055, 28, 20), gold); g.add(b);
  const sl = new THREE.Mesh(new THREE.TorusGeometry(.055, .006, 6, 28, Math.PI), blk); sl.rotation.y = Math.PI / 2; sl.rotation.x = Math.PI / 2; sl.position.y = -.012; g.add(sl);
  const hole = new THREE.Mesh(new THREE.SphereGeometry(.012, 10, 8), blk); hole.position.set(0, -.03, .046); g.add(hole);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(.018, .006, 6, 14), gold); loop.position.y = .065; g.add(loop);
  const tas = new THREE.Mesh(new THREE.CylinderGeometry(.006, .022, .09, 10), redG); tas.position.y = -.1; g.add(tas); return g; }
function hagoita(){ const g = new THREE.Group(); const pic = ctex(128, 224, (c, w, h) => { c.fillStyle = '#f6e7c8'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8303a'; c.fillRect(10, 10, w - 20, h - 20); c.fillStyle = '#f2c14e'; for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 18, 80 + Math.sin(a) * 18, 14, 0, 7); c.fill(); } c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, 80, 8, 0, 7); c.fill(); c.strokeStyle = '#3f9a4f'; c.lineWidth = 6; c.beginPath(); c.moveTo(30, 180); c.quadraticCurveTo(64, 140, 100, 170); c.stroke(); });
  const shape = new THREE.Shape(); shape.moveTo(-.055, -.09); shape.lineTo(.055, -.09); shape.lineTo(.062, .09); shape.quadraticCurveTo(0, .13, -.062, .09); shape.closePath();
  const pg = new THREE.ExtrudeGeometry(shape, { depth:.012, bevelEnabled:true, bevelThickness:.003, bevelSize:.003, bevelSegments:2 }); pg.computeBoundingBox(); const uv = pg.attributes.uv, pos = pg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + .065) / .13, (pos.getY(i) + .095) / .23);
  const p = new THREE.Mesh(pg, [gl('#ffffff', { map:pic, roughness:.35 }), gl('#c89a5a')]); p.position.z = -.006; g.add(p);
  const hd = new THREE.Mesh(new THREE.BoxGeometry(.03, .09, .014), gl('#a8743e', { roughness:.5 })); hd.position.y = -.13; g.add(hd); return g; }
const MAKERS = [tai, koban, kozuchi, daruma, neko, suzu, hagoita];
const strM = new THREE.MeshStandardMaterial({ color:'#c8352e', roughness:.6 });
function hang(obj, p, drop){ const top = obj.userData.top || .08; obj.position.copy(p).add(new THREE.Vector3(0, -drop - top * 1.25, 0)); obj.rotation.y = (rnd() - .5) * .8; M.add(obj); obj.traverse(m => { if (m.isMesh) m.castShadow = true; });
  const st = new THREE.Mesh(new THREE.CylinderGeometry(.003, .003, drop, 4), strM); st.position.copy(p).add(new THREE.Vector3(0, -drop / 2, 0)); M.add(st); }

return { group:M, branches, makers:MAKERS, hang };
}
