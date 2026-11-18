
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
export function mountRoom(el, opts = {}){
const VW = () => el.clientWidth || innerWidth, VH = () => el.clientHeight || innerHeight;

/* ---------- 基本 ---------- */
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(VW(), VH());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
el.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:manipulation';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#2a1c14');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .35;

const camera = new THREE.PerspectiveCamera(32, VW() / VH(), .1, 100);
const target = new THREE.Vector3(0, 1.55, -.35);
function placeCamera(){
  const aspect = VW() / VH(), fov = THREE.MathUtils.degToRad(camera.fov);
  const halfW = 4.6 / 2 - .35, distW = halfW / (Math.tan(fov / 2) * aspect);
  const dist = distW, pitch = THREE.MathUtils.degToRad(34);
  camera.position.set(0, target.y + Math.sin(pitch) * dist, target.z + Math.cos(pitch) * dist);
  camera.aspect = aspect; camera.lookAt(target); const off = (opts.shiftY || 0) * VH(); camera.setViewOffset(VW(), VH(), 0, off, VW(), VH()); camera.updateProjectionMatrix();
}
placeCamera();

/* ---------- 便利関数 ---------- */
const rnd = (() => { let s = 20261118; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness:.9, metalness:0, ...o });
function canvasTex(w, h, draw, rep = [1, 1]){
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 4; return t;
}
const blobTex = canvasTex(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(58,36,22,.55)'); r.addColorStop(.6, 'rgba(58,36,22,.22)'); r.addColorStop(1, 'rgba(58,36,22,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
function blob(x, z, sx, sz = sx, op = 1){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map:blobTex, transparent:true, depthWrite:false, opacity:op }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .006, z); m.scale.set(sx, sz, 1); scene.add(m); return m;
}
const glowTex = canvasTex(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
function glow(color, size, op = .9){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color, transparent:true, opacity:op, blending:THREE.AdditiveBlending, depthWrite:false })); s.scale.set(size, size, 1); return s; }

/* ---------- 部屋：床・壁・腰板・巾木・窓 ---------- */
const RW = 4.6, RD = 9, RH = 7;
const floorTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#c98f5a'; g.fillRect(0, 0, w, h);
  const pw = 128, ph = 32; // ヘリンボーン
  for (let y = -ph * 4; y < h + ph * 4; y += ph) for (let x = -pw; x < w + pw; x += pw){
    const off = (Math.floor(y / ph) % 2) * pw / 2;
    for (const dir of [1, -1]){ g.save(); g.translate(x + off + (dir > 0 ? 0 : pw / 2), y); g.rotate(dir * Math.PI / 4);
      const shade = 0.88 + ((x * 7 + y * 13 + dir * 5) % 23) / 23 * 0.2; g.fillStyle = `rgb(${201 * shade | 0},${143 * shade | 0},${90 * shade | 0})`; g.fillRect(0, 0, pw * .7, ph * .7);
      g.strokeStyle = 'rgba(110,64,32,.45)'; g.lineWidth = 2; g.strokeRect(0, 0, pw * .7, ph * .7);
      g.strokeStyle = 'rgba(255,230,190,.12)'; g.beginPath(); for (let k = 4; k < ph * .7; k += 5){ g.moveTo(2, k); g.lineTo(pw * .7 - 2, k + Math.sin(k + x) * 1.5); } g.stroke(); g.restore(); }
  }
}, [3, 6]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), std('#ffffff', { map:floorTex, roughness:.75 }));
floor.rotation.x = -Math.PI / 2; floor.position.z = -RD / 2 + 1.6 + (RD - 6); floor.receiveShadow = true; scene.add(floor);

const wallTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#b5403a'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h);
  const motif = (cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.fillStyle = '#d9a441'; g.globalAlpha = .55;
    g.beginPath(); g.moveTo(0, -26); g.bezierCurveTo(14, -14, 14, 8, 0, 26); g.bezierCurveTo(-14, 8, -14, -14, 0, -26); g.fill();
    g.globalAlpha = .45; for (const sx of [-1, 1]){ g.beginPath(); g.ellipse(sx * 14, 0, 6, 12, sx * .5, 0, Math.PI * 2); g.fill(); } g.restore(); };
  motif(64, 64, 1); motif(192, 192, 1); motif(192, 64, .55); motif(64, 192, .55);
}, [5, 4]);
const wallMat = std('#ffffff', { map:wallTex });
const back = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat); back.position.set(0, RH / 2, -6 / 2 + 1.6); back.receiveShadow = true; scene.add(back);
const bzz = -6 / 2 + 1.6;
for (const s of [-1, 1]){ const side = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), wallMat.clone()); side.material.color.set('#e6d0cc'); side.rotation.y = -s * Math.PI / 2; side.position.set(s * RW / 2, RH / 2, 1.6 - RD / 2 + RD / 2 - RD / 2); side.position.z = bzz + RD / 2; side.receiveShadow = true; scene.add(side); }
// 腰板と巾木
const wainMat = std('#efe2c8', { roughness:.7 }), trimMat = std('#7a4b2a', { roughness:.6 });
const bz = -6 / 2 + 1.6;
const wain = new THREE.Mesh(new RoundedBoxGeometry(RW, 1.05, .08, 2, .02), wainMat); wain.position.set(0, .525, bz + .04); wain.receiveShadow = true; scene.add(wain);
for (let i = 0; i < 6; i++){ const p = new THREE.Mesh(new RoundedBoxGeometry(.62, .62, .03, 2, .02), std('#e4d4b4', { roughness:.7 })); p.position.set(-RW / 2 + .4 + i * .76, .55, bz + .09); scene.add(p); }
const rail = new THREE.Mesh(new RoundedBoxGeometry(RW, .07, .14, 2, .025), trimMat); rail.position.set(0, 1.07, bz + .07); scene.add(rail);
const base = new THREE.Mesh(new RoundedBoxGeometry(RW, .14, .12, 2, .03), trimMat); base.position.set(0, .07, bz + .06); scene.add(base);
for (const s of [-1, 1]){ const w2 = new THREE.Mesh(new RoundedBoxGeometry(RD, 1.05, .08, 2, .02), wainMat); w2.rotation.y = Math.PI / 2; w2.position.set(s * (RW / 2 - .04), .525, bz + RD / 2); scene.add(w2); }

// 窓（奥の壁・右寄り）と、外の夜景
const win = new THREE.Group(); win.position.set(1.05, 2.45, bz + .02); scene.add(win);
const skyTex = canvasTex(256, 256, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#1b2a55'); l.addColorStop(1, '#3b4f8a'); g.fillStyle = l; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++){ g.fillStyle = `rgba(255,255,255,${.4 + Math.random() * .6})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h * .75, Math.random() * 1.6 + .4, 0, 7); g.fill(); }
  g.fillStyle = '#eef4ff'; g.beginPath(); g.ellipse(w * .5, h * 1.02, w * .9, h * .22, 0, 0, 7); g.fill(); g.fillStyle = '#c9d8f0'; g.beginPath(); g.ellipse(w * .2, h * 1.05, w * .5, h * .16, 0, 0, 7); g.fill(); });
const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.7), new THREE.MeshBasicMaterial({ map:skyTex })); sky.position.z = -.01; win.add(sky);
const frameMat = std('#f3ead9', { roughness:.6 });
for (const [w, h, x, y] of [[1.7, .14, 0, .9], [1.7, .16, 0, -.92], [.12, 1.9, -.8, 0], [.12, 1.9, .8, 0], [.06, 1.7, 0, 0], [1.5, .06, 0, 0]]){ const f = new THREE.Mesh(new RoundedBoxGeometry(w, h, .12, 2, .03), frameMat); f.position.set(x, y, .05); f.castShadow = true; win.add(f); }
const sill = new THREE.Mesh(new RoundedBoxGeometry(1.95, .09, .32, 2, .03), frameMat); sill.position.set(0, -1.0, .14); win.add(sill);
// カーテン（チェック柄、波打つ）
const checkTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#c8352e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 4; i++){ g.fillRect(i * 32 + 10, 0, 12, h); g.fillRect(0, i * 32 + 10, w, 12); } g.fillStyle = 'rgba(80,10,10,.18)'; for (let i = 0; i < 4; i++) g.fillRect(i * 32, 0, 3, h); }, [2, 4]);
for (const s of [-1, 1]){ const geo = new THREE.PlaneGeometry(.55, 2.3, 24, 1), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 26) * .045); geo.computeVertexNormals();
  const c = new THREE.Mesh(geo, std('#ffffff', { map:checkTex, side:THREE.DoubleSide })); c.position.set(s * 1.0, .02, .16); c.castShadow = true; win.add(c); }
const rod = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.5, 12), trimMat); rod.rotation.z = Math.PI / 2; rod.position.set(0, 1.12, .2); win.add(rod);
const winLight = new THREE.PointLight('#9fc4ff', 1.5, 4); winLight.position.set(1.05, 2.4, bz + .6); scene.add(winLight);

// ラグ
const rugTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#f3ead9'; g.fillRect(0, 0, w, h); g.fillStyle = '#3f8a52'; g.fillRect(28, 28, w - 56, h - 56); g.fillStyle = '#f3ead9'; g.fillRect(46, 46, w - 92, h - 92);
  g.fillStyle = '#c8352e'; for (let x = 70; x < w - 60; x += 44) for (let y = 70; y < h - 60; y += 44){ g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-8, -8, 16, 16); g.restore(); }
  g.strokeStyle = '#d9a441'; g.lineWidth = 6; g.strokeRect(16, 16, w - 32, h - 32); });
const rugShape = new THREE.Shape(); { const w = 2.4, d = 1.6, r = .18; rugShape.moveTo(-w / 2 + r, -d / 2); rugShape.lineTo(w / 2 - r, -d / 2); rugShape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); rugShape.lineTo(w / 2, d / 2 - r); rugShape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); rugShape.lineTo(-w / 2 + r, d / 2); rugShape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); rugShape.lineTo(-w / 2, -d / 2 + r); rugShape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2); }
const rugGeo = new THREE.ExtrudeGeometry(rugShape, { depth:.03, bevelEnabled:true, bevelSize:.02, bevelThickness:.01, bevelSegments:2 });
{ const uv = rugGeo.attributes.uv, p = rugGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 2.4 + .5, p.getY(i) / 1.6 + .5); }
const rug = new THREE.Mesh(rugGeo, std('#ffffff', { map:rugTex })); rug.rotation.x = -Math.PI / 2; rug.position.set(.55, .0, .55); rug.receiveShadow = true; scene.add(rug);

/* ---------- ツリー ---------- */
const tree = new THREE.Group(); tree.position.set(-.9, 0, -.45); tree.scale.setScalar(.92); scene.add(tree);
const potH = .62;
// 段（下から）：[下端y, 半径, 高さ]
const TIERS = [[.86, 1.24, 1.22], [1.5, 1.0, 1.08], [2.06, .78, .94], [2.55, .55, .8], [2.96, .33, .64]];
const treeTopY = TIERS[4][0] + TIERS[4][2];
// 鉢（れんがの箱）
const brickTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#e8d8c4'; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let q = -1; q < 5; q++){ const x = q * 64 + (r % 2) * 32, y = r * 32; g.fillStyle = ['#8a3a2c', '#9a4634', '#7e3226'][(r + q + 3) % 3]; g.fillRect(x + 3, y + 3, 58, 26); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 3, y + 3, 58, 6); } }, [1, 1]);
const pot = new THREE.Mesh(new RoundedBoxGeometry(.85, potH, .85, 3, .05), std('#ffffff', { map:brickTex })); pot.position.y = potH / 2; pot.castShadow = pot.receiveShadow = true; tree.add(pot);
const potRim = new THREE.Mesh(new RoundedBoxGeometry(.95, .08, .95, 2, .03), std('#9a4634')); potRim.position.y = potH; tree.add(potRim);
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, .4, 12), std('#6a4630')); trunk.position.y = potH + .15; tree.add(trunk);
const greenTop = new THREE.Color('#3f9a4f'), greenBot = new THREE.Color('#1c5e34');
const tierR = (R, h, y) => { const t = 1 - y / h; return R * Math.pow(Math.max(0, t), .85) * (1 + .1 * Math.sin(Math.PI * Math.max(0, t))); };
function tierGeo(R, h){
  const pts = [new THREE.Vector2(.001, -.05), new THREE.Vector2(R * .45, -.07), new THREE.Vector2(R * .88, -.06)];
  for (let i = 0; i <= 16; i++){ const y = h * i / 16; pts.push(new THREE.Vector2(Math.max(.001, tierR(R, h, y)), y)); }
  const g = new THREE.LatheGeometry(pts, 72), p = g.attributes.position, col = [];
  for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ang = Math.atan2(z, x);
    const edge = y < h * .2 ? (1 - y / (h * .2)) : 0, wav = 1 + edge * (.08 * Math.sin(ang * 16) + .03 * Math.sin(ang * 37)) + (rnd() - .5) * .02;
    p.setX(i, x * wav); p.setZ(i, z * wav); if (edge > .5) p.setY(i, y - .07 * edge * Math.max(0, Math.sin(ang * 16)));
    const t = Math.min(1, Math.max(0, y / h)), c = greenBot.clone().lerp(greenTop, Math.pow(t, .7) * .85 + rnd() * .12); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
const needleTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++){ const x = Math.random() * w, y = Math.random() * h, l = 5 + Math.random() * 7, a = Math.PI / 2 + (Math.random() - .5) * .8; g.strokeStyle = Math.random() < .55 ? 'rgba(0,40,10,.25)' : 'rgba(255,255,220,.25)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }, [8, 2]);
const tierMat = std('#ffffff', { vertexColors:true, map:needleTex, roughness:.9 });
TIERS.forEach(([yb, R, h]) => { const m = new THREE.Mesh(tierGeo(R, h), tierMat); m.position.y = yb; m.castShadow = m.receiveShadow = true; tree.add(m); });
function radiusAt(y){ let best = 0; for (const [yb, R, h] of TIERS){ if (y >= yb && y <= yb + h) best = Math.max(best, tierR(R, h, y - yb)); } return best; }
// 金のモール（らせんの Tube）
const spiralPts = []; { const yA = treeTopY - .45, yB = TIERS[0][0] + .18, turns = 3.4; for (let i = 0; i <= 300; i++){ const t = i / 300, y = yA + (yB - yA) * t, a = t * turns * Math.PI * 2, r = radiusAt(y) + .04; spiralPts.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)); } }
const tinselTex = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#d9a52a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++){ g.fillStyle = Math.random() < .5 ? '#fff1a8' : '#a87810'; g.fillRect(Math.random() * w, Math.random() * h, 2, 6); } }, [90, 1]);
const tinsel = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiralPts), 700, .04, 8), std('#ffffff', { map:tinselTex, roughness:.35, metalness:.55 })); tinsel.castShadow = true; tree.add(tinsel);
// 電球
const bulbColors = ['#ffd25a', '#ff7a7a', '#7ad8ff', '#a8ff8a', '#ff9ae0'], bulbs = [];
for (let i = 0; i < 90; i++){ const u = Math.sqrt((i + .5) / 90), y = treeTopY - .3 - u * (treeTopY - .3 - TIERS[0][0] - .1), a = i * 2.39996; if (Math.cos(a) < -.15) continue; const r = radiusAt(y) * .98;
  const c = bulbColors[i % 5], b = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:1.6 })); b.position.set(Math.sin(a) * r, y, Math.cos(a) * r); tree.add(b);
  const gl = glow(c, .2, .5); gl.position.copy(b.position); tree.add(gl); bulbs.push({ gl, ph:rnd() * 6 }); }
// 星
const starShape = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .1 : .24; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? starShape.lineTo(x, y) : starShape.moveTo(x, y); } starShape.closePath();
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth:.06, bevelEnabled:true, bevelThickness:.04, bevelSize:.035, bevelSegments:3 }), new THREE.MeshStandardMaterial({ color:'#f2c14e', roughness:.25, metalness:.75, emissive:'#a86a10', emissiveIntensity:.35 }));
star.position.set(0, treeTopY + .2, -.03); star.castShadow = true; tree.add(star);
const starGlow = glow('#fff2b0', 1.0, .65); starGlow.position.set(0, treeTopY + .22, .05); tree.add(starGlow);

/* ---------- オーナメント ---------- */
const capMat = new THREE.MeshStandardMaterial({ color:'#d9a52a', roughness:.3, metalness:.85 });
function stripeTex(a, b, dots){ return canvasTex(128, 64, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; if (dots){ for (let y = 8; y < h; y += 16) for (let x = (y / 16 % 2) * 8 + 4; x < w; x += 16){ g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } } else for (let y = 6; y < h; y += 18) g.fillRect(0, y, w, 6); }); }
const ORN_TYPES = [
  () => ball('#c8352e'), () => ball('#f2c14e', .2, .85), () => ball('#3a6ab8'), () => ball('#3f9a4f'), () => ball('#f3ead9'),
  () => ball('#e0564a', .35, .3, stripeTex('#e0564a', '#f3ead9')), () => ball('#3a6ab8', .35, .3, stripeTex('#3a6ab8', '#f2f6ff', true)), () => ball('#f4a6bc', .3, .3, stripeTex('#f4a6bc', '#ffffff', true)),
  () => bell(), () => candy(), () => miniStar(), () => ball('#8a5ab8'),
];
function ball(color, rough = .25, metal = .6, map = null){ const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.SphereGeometry(.105, 24, 18), new THREE.MeshStandardMaterial({ color:map ? '#ffffff' : color, map, roughness:rough, metalness:map ? .15 : metal })); s.castShadow = true; g.add(s);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.03, .035, .04, 12), capMat); cap.position.y = .11; g.add(cap); const loop = new THREE.Mesh(new THREE.TorusGeometry(.018, .006, 6, 12), capMat); loop.position.y = .14; g.add(loop); return g; }
function bell(){ const pts = []; for (let i = 0; i <= 12; i++){ const t = i / 12; pts.push(new THREE.Vector2(.02 + .1 * Math.pow(t, 1.6) + (t > .85 ? .02 : 0), .16 - t * .16)); } const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), new THREE.MeshStandardMaterial({ color:'#f2c14e', roughness:.3, metalness:.8, side:THREE.DoubleSide })); m.position.y = -.06; g.add(m); const cl = new THREE.Mesh(new THREE.SphereGeometry(.025, 10, 8), capMat); cl.position.y = -.07; g.add(cl); const bow = new THREE.Mesh(new THREE.TorusGeometry(.03, .012, 6, 12), std('#c8352e')); bow.position.y = .11; g.add(bow); return g; }
function candy(){ const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -.14, 0), new THREE.Vector3(0, .06, 0), new THREE.Vector3(.02, .12, 0), new THREE.Vector3(.07, .14, 0), new THREE.Vector3(.11, .1, 0)]);
  return new THREE.Mesh(new THREE.TubeGeometry(c, 40, .022, 10), std('#ffffff', { map:canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8303a'; for (let i = -2; i < 4; i++){ g.beginPath(); g.moveTo(i * 22, 0); g.lineTo(i * 22 + 11, 0); g.lineTo(i * 22 + 11 + 32, h); g.lineTo(i * 22 + 32, h); g.fill(); } }, [6, 1]), roughness:.4 })); }
function miniStar(){ const m = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth:.02, bevelEnabled:true, bevelThickness:.015, bevelSize:.012, bevelSegments:2 }), new THREE.MeshStandardMaterial({ color:'#f8d468', roughness:.3, metalness:.7 })); m.scale.setScalar(.55); return m; }
// スロット：円錐の表面に黄金角スパイラル、カメラ側だけ
const slots = []; { const N = 110, yTop = treeTopY - .4, yBot = TIERS[0][0] + .12; for (let i = 0; i < N; i++){ const u = Math.sqrt((i + .5) / N), y = yTop - u * (yTop - yBot), a = i * 2.39996; const ang = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); const d = ang > Math.PI ? ang - Math.PI * 2 : ang; if (Math.abs(d) > THREE.MathUtils.degToRad(105)) continue; const r = radiusAt(y) * 1.02 + .07; slots.push(new THREE.Vector3(Math.sin(a) * r, y - .05, Math.cos(a) * r)); } }
slots.sort(() => rnd() - .5);
const placed = [], appear = [];
function addOrnament(animate = true, id = null, type = null){ const idx = placed.length, p = slots[idx % slots.length].clone(); if (idx >= slots.length) p.multiplyScalar(1.02).add(new THREE.Vector3(0, -.04 * Math.floor(idx / slots.length), 0)); const o = (type || ORN_TYPES[Math.floor(rnd() * ORN_TYPES.length)])(); o.userData.id = id; o.position.copy(p); o.rotation.y = Math.atan2(p.x, p.z) + (rnd() - .5) * .6; o.rotation.z = (rnd() - .5) * .25; o.traverse(m => { if (m.isMesh) m.castShadow = true; }); tree.add(o); placed.push(o);
  if (animate){ o.scale.setScalar(.001); appear.push({ o, t0:performance.now() }); } shadowsDirty = true; }

/* ---------- プレゼント ---------- */
const WRAPS = [['#c8352e', '#f3ead9', 'stripe'], ['#3a6ab8', '#ffffff', 'dot'], ['#f2c14e', '#e0564a', 'check'], ['#3f9a4f', '#f3ead9', 'dot'], ['#f3ead9', '#c8352e', 'stripe'], ['#8a5ab8', '#f2c14e', 'check'], ['#f4a6bc', '#ffffff', 'dot']];
function wrapTex(a, b, kind){ return canvasTex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b;
  if (kind === 'stripe') for (let i = -4; i < 8; i++){ g.beginPath(); g.moveTo(i * 24, 0); g.lineTo(i * 24 + 10, 0); g.lineTo(i * 24 + 10 + h, h); g.lineTo(i * 24 + h, h); g.fill(); }
  if (kind === 'dot') for (let y = 10; y < h; y += 20) for (let x = (y / 20 % 2) * 10 + 6; x < w; x += 20){ g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  if (kind === 'check'){ g.globalAlpha = .45; for (let i = 0; i < 4; i++){ g.fillRect(i * 32 + 8, 0, 14, h); g.fillRect(0, i * 32 + 8, w, 14); } } }); }
const gifts = [];
const GIFT_SPOTS = [[-1.55, .45], [-.35, .5], [-.95, .85], [.1, .15], [-1.8, -.1], [-.1, .95], [.35, .65], [-1.4, 1.15]];
function addGift(animate = true, id = null){ const i = gifts.length; if (i >= GIFT_SPOTS.length) return; const [x, z] = GIFT_SPOTS[i], [a, b, kind] = WRAPS[i % WRAPS.length];
  const w = .34 + rnd() * .22, h = .26 + rnd() * .2, d = .3 + rnd() * .2, g = new THREE.Group();
  const box = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, .035), std('#ffffff', { map:wrapTex(a, b, kind), roughness:.6 })); box.position.y = h / 2; box.castShadow = box.receiveShadow = true; g.add(box);
  const rc = a === '#f2c14e' || a === '#f3ead9' ? '#c8352e' : '#f2c14e', rm = std(rc, { roughness:.45, metalness:.15 });
  const r1 = new THREE.Mesh(new RoundedBoxGeometry(w + .012, h + .012, .06, 2, .01), rm); r1.position.y = h / 2; g.add(r1);
  const r2 = new THREE.Mesh(new RoundedBoxGeometry(.06, h + .012, d + .012, 2, .01), rm); r2.position.y = h / 2; g.add(r2);
  for (const s of [-1, 1]){ const t = new THREE.Mesh(new THREE.TorusGeometry(.06, .022, 8, 16), rm); t.position.set(s * .055, h + .045, 0); t.rotation.set(0, Math.PI / 2, s * .5); t.scale.set(1, 1.25, .8); t.castShadow = true; g.add(t); }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), rm); knot.position.y = h + .03; g.add(knot);
  g.position.set(x, 0, z); g.rotation.y = (rnd() - .5) * .6; g.userData.id = id; g.userData.gift = true; scene.add(g); gifts.push(g); g.userData.blob = blob(x, z, w * 2.1, d * 2.1, .9);
  if (animate){ g.scale.setScalar(.001); appear.push({ o:g, t0:performance.now() }); } shadowsDirty = true; }

/* ---------- 丸影 ---------- */
blob(tree.position.x, tree.position.z, 2.6, 2.4, 1); blob(rug.position.x, rug.position.z, 3.0, 2.1, .35);

/* ---------- 光 ---------- */
const hemi = new THREE.HemisphereLight('#fff1dc', '#b98a6a', 1.1); scene.add(hemi);
const key = new THREE.DirectionalLight('#ffe2bd', 2.2); key.position.set(-3, 8, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -.0005; key.shadow.normalBias = .02;
Object.assign(key.shadow.camera, { left:-3.5, right:3.5, top:4.5, bottom:-2, near:1, far:20 }); scene.add(key);
const treeLight = new THREE.PointLight('#ffd890', 1.2, 3.2); treeLight.position.set(tree.position.x + .4, 1.8, tree.position.z + 1); scene.add(treeLight);
let isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
function applyTime(){ hemi.intensity = isNight ? .75 : 1.1; key.intensity = isNight ? 1.2 : 2.2; key.color.set(isNight ? '#ffd2a0' : '#ffe2bd'); treeLight.intensity = isNight ? 2.4 : 1.2; winLight.intensity = isNight ? 1.8 : 1.0;
  sky.material.color.set(isNight ? '#ffffff' : '#9fc0ff'); shadowsDirty = true; }

/* ---------- 初期状態 ---------- */
let shadowsDirty = true;
applyTime();

/* ---------- 描画（必要なときだけ。電球と星のゆらぎは30fps） ---------- */
renderer.shadowMap.autoUpdate = false;
let last = 0, stopped = false;
function frame(now){
  requestAnimationFrame(frame);
  if (document.hidden || stopped || now - last < 33) return; last = now;
  for (let k = appear.length - 1; k >= 0; k--){ const a = appear[k], t = Math.min(1, (now - a.t0) / 420), s = t < 1 ? 1 + 1.7 * Math.pow(t - 1, 3) + .7 * Math.pow(t - 1, 2) : 1; a.o.scale.setScalar(Math.max(.001, s)); if (t >= 1){ a.o.scale.setScalar(1); appear.splice(k, 1); shadowsDirty = true; } }
  bulbs.forEach(b => b.gl.material.opacity = .35 + .3 * (Math.sin(now / 600 + b.ph) * .5 + .5));
  starGlow.material.opacity = .55 + .15 * Math.sin(now / 900);
  if (shadowsDirty){ renderer.shadowMap.needsUpdate = true; shadowsDirty = false; }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
addEventListener('resize', () => { renderer.setSize(VW(), VH()); placeCamera(); });
renderer.domElement.addEventListener('webglcontextlost', e => e.preventDefault());
/* 種類 → 3Dの形 */
const TYPE = { ball:(c, map) => () => ball(c, map ? .35 : .25, map ? .3 : .6, map), bell:() => bell, candy:() => candy, star:() => miniStar };
function typeFor(o){ if (o.ball) return () => ball(o.color, o.pat ? .35 : .25, o.pat ? .3 : .6, o.pat ? stripeTex(o.color, o.pat === 'dot' ? '#ffffff' : '#f3ead9', o.pat === 'dot') : null);
  if (o.shape === 'bell') return bell; if (o.shape === 'candy') return candy; if (o.shape === 'star') return miniStar; return () => ball(o.color || '#c8352e'); }
function clearAll(){ placed.splice(0).forEach(o => tree.remove(o)); gifts.splice(0).forEach(g => { scene.remove(g); scene.remove(g.userData.blob); }); }
let sig = '';
function sync(list, giftList){
  const s2 = list.map(o => o.id).join(',') + '|' + giftList.map(g => g.id).join(',');
  if (s2 === sig) return; const prev = sig; sig = s2;
  const prevIds = new Set(prev.split('|')[0].split(',').filter(Boolean)), prevG = new Set((prev.split('|')[1] || '').split(',').filter(Boolean));
  const append = list.length >= placed.length && placed.every((o, i) => list[i] && list[i].id === o.userData.id) && gifts.every((g, i) => giftList[i] && giftList[i].id === g.userData.id);
  if (!append) clearAll();
  list.slice(placed.length).forEach(o => addOrnament(append && !!prev && !prevIds.has(o.id), o.id, typeFor(o)));
  giftList.slice(gifts.length).forEach(g => addGift(append && !!prev && !prevG.has(g.id), g.id));
  shadowsDirty = true;
}
// タップ
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
renderer.domElement.addEventListener('click', e => { const r = renderer.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera);
  const hit = ray.intersectObjects([...placed, ...gifts], true)[0]; if (hit){ let o = hit.object; while (o && !o.userData.id) o = o.parent; if (o){ o.scale.setScalar(.85); appear.push({ o, t0:performance.now() - 120 }); opts.onTap && opts.onTap(o.userData.id, !!o.userData.gift); return; } }
  const th = ray.intersectObjects(tree.children, true)[0]; if (th){ tree.rotation.z = .02; setTimeout(() => tree.rotation.z = -.015, 120); setTimeout(() => tree.rotation.z = 0, 260); opts.onTree && opts.onTree(); } });
return { sync, setNight(n){ if (n !== isNight){ isNight = n; applyTime(); } }, pause(p){ stopped = p; }, resize(){ renderer.setSize(VW(), VH()); placeCamera(); } };
}
