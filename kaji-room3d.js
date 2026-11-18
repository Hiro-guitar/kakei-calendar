
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { makeOrnament, makeDeco } from './kaji-orn3d.js';

/* ---------- 家具の一覧（アドベントで手に入る） ---------- */
export const FURN_SLOTS = [['topper', 'ツリーのてっぺん'], ['treelights', 'ツリーの電球'], ['garland', 'ツリーのモール'], ['fireplace', '暖炉'], ['stockings', 'くつした'], ['mantel', '暖炉の上'], ['wall', '暖炉の上の壁'], ['curtain', 'カーテン'], ['wintop', '窓の上'], ['sill', '窓辺'], ['outside', '窓の外'],
  ['shelf', '左の壁ぎわ'], ['sofa', '右の壁ぎわ'], ['lamp', 'あかり'], ['table', 'テーブル'], ['rug', 'ラグ'], ['toys', '床のおもちゃ'], ['treebase', 'ツリーの足もと'], ['special', 'クリスマスの特別']];
const NAMES = {
  topper:['金の星', '雪の結晶', '赤いリボン'], treelights:['カラフルな電球', 'あたたかい白の電球', '雪玉ライト'], garland:['金のモール', '銀のモール', '赤と白のビーズ'],
  fireplace:['石の暖炉', 'レンガの暖炉', '白い暖炉'], stockings:['フェルトのくつした', 'ニットのくつした', 'チェックのくつした'], mantel:['ろうそくとくるみ割り人形', 'おかしの家とミニツリー', 'スノードームとランタン'],
  wall:['リース', '木の掛け時計', '雪の町の絵'], curtain:['赤いチェックのカーテン', 'みどりのベルベットのカーテン', '白いレースのカーテン'], wintop:['電飾', '星のガーランド', '雪の結晶のモビール'],
  sill:['ランタンと松ぼっくり', 'キャンドルの瓶', 'ポインセチアの鉢'], outside:['雪だるま', '雪うさぎ', 'かまくら'], shelf:['食器棚', '本棚', '柱時計'], sofa:['赤いソファ', 'ひとりがけとサイドテーブル', '木のベンチ'],
  lamp:['フロアランプ', '燭台', 'ヒイラギの鉢'], table:['テーブルとクッキー', 'お茶のテーブル', 'ロッキングチェア'], rug:['赤とみどりのラグ', 'まるい編みラグ', 'ふわふわの白いラグ'],
  toys:['木馬', '汽車とスノードーム', 'くまのぬいぐるみ'], treebase:['赤いツリースカート', '木のかご', '雪のじゅうたん'], special:['金色のきらきら'],
};
export const FURN_ITEMS = [], FURN_BY = {};
for (const [slot] of FURN_SLOTS) NAMES[slot].forEach((name, k) => { const it = { key:slot + '_' + 'abc'[k], slot, k, name }; FURN_ITEMS.push(it); FURN_BY[it.key] = it; });
// 11/19 から 12/25 までの37日。はじめの15日で各場所の1つめ、そのあと2つめ・3つめ、12/25は特別
const FIRST = ['fireplace', 'rug', 'curtain', 'stockings', 'wintop', 'lamp', 'mantel', 'wall', 'sofa', 'sill', 'table', 'outside', 'shelf', 'toys', 'treebase'];
export const TREE_PARTS = ['topper', 'treelights', 'garland']; // 1つめは最初から持っている
export const ADVENT = Array.from({ length:37 }, () => []);
FIRST.forEach((s, i) => ADVENT[i].push(s + '_a')); { const rest = [...FIRST.map(s => s + '_b'), 'topper_b', 'garland_b', 'treelights_b', ...FIRST.map(s => s + '_c'), 'topper_c', 'garland_c', 'treelights_c']; rest.forEach((k, i) => ADVENT[15 + Math.floor(i * 21 / rest.length)].push(k)); } ADVENT[36].push('special_a');
export const advDate = (year, i) => new Date(year, 10, 19 + i);
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
const target = new THREE.Vector3(0, 1.5, -.6);
function placeCamera(){
  const aspect = VW() / VH(), fov = THREE.MathUtils.degToRad(camera.fov);
  const halfW = 4.6 / 2 + .3, distW = halfW / (Math.tan(fov / 2) * aspect);
  const dist = distW, pitch = THREE.MathUtils.degToRad(43);
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

/* ---------- 部屋：床・壁・腰板・巾木・窓（奥行きのある部屋） ---------- */
const RW = 4.6, RH = 7, FRONT = 4.2, bz = -2.7, RD = FRONT - bz, RZ = (bz + FRONT) / 2;
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
}, [3, 3 * RD / RW]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), std('#ffffff', { map:floorTex, roughness:.75 }));
floor.rotation.x = -Math.PI / 2; floor.position.z = RZ; floor.receiveShadow = true; scene.add(floor);

const wallTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#b5403a'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h);
  const motif = (cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.fillStyle = '#d9a441'; g.globalAlpha = .55;
    g.beginPath(); g.moveTo(0, -26); g.bezierCurveTo(14, -14, 14, 8, 0, 26); g.bezierCurveTo(-14, 8, -14, -14, 0, -26); g.fill();
    g.globalAlpha = .45; for (const sx of [-1, 1]){ g.beginPath(); g.ellipse(sx * 14, 0, 6, 12, sx * .5, 0, Math.PI * 2); g.fill(); } g.restore(); };
  motif(64, 64, 1); motif(192, 192, 1); motif(192, 64, .55); motif(64, 192, .55);
}, [5, 4]);
const WX = -.05, WY = 2.45, WW = 1.24, WH = 1.44; // 窓の開口
const backShape = new THREE.Shape(); backShape.moveTo(-RW / 2, 0); backShape.lineTo(RW / 2, 0); backShape.lineTo(RW / 2, RH); backShape.lineTo(-RW / 2, RH); backShape.closePath();
{ const h = new THREE.Path(); h.moveTo(WX - WW / 2, WY - WH / 2); h.lineTo(WX - WW / 2, WY + WH / 2); h.lineTo(WX + WW / 2, WY + WH / 2); h.lineTo(WX + WW / 2, WY - WH / 2); h.closePath(); backShape.holes.push(h); }
const backTex = wallTex.clone(); backTex.needsUpdate = true; backTex.repeat.set(5 / RW, 4 / RH);
const back = new THREE.Mesh(new THREE.ShapeGeometry(backShape), std('#ffffff', { map:backTex })); back.position.set(0, 0, bz); back.receiveShadow = true; scene.add(back);
for (const s of [-1, 1]){ const t = wallTex.clone(); t.needsUpdate = true; t.repeat.set(5 * RD / RW, 4); const side = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), std('#ead2cc', { map:t })); side.rotation.y = -s * Math.PI / 2; side.position.set(s * RW / 2, RH / 2, RZ); side.receiveShadow = true; scene.add(side); }
// 腰板と巾木（奥の壁と左右の壁）
const wainMat = std('#efe2c8', { roughness:.7 }), trimMat = std('#7a4b2a', { roughness:.6 }), panelMat = std('#e4d4b4', { roughness:.7 });
function wainscot(len, place){ const g = new THREE.Group(); const w = new THREE.Mesh(new RoundedBoxGeometry(len, 1.05, .08, 2, .02), wainMat); w.position.set(0, .525, .04); w.receiveShadow = true; g.add(w);
  const n = Math.round(len / .76); for (let i = 0; i < n; i++){ const p = new THREE.Mesh(new RoundedBoxGeometry(.62, .62, .03, 2, .02), panelMat); p.position.set(-len / 2 + (i + .5) * len / n, .55, .09); g.add(p); }
  const rail = new THREE.Mesh(new RoundedBoxGeometry(len, .07, .14, 2, .025), trimMat); rail.position.set(0, 1.07, .07); g.add(rail);
  const base = new THREE.Mesh(new RoundedBoxGeometry(len, .14, .12, 2, .03), trimMat); base.position.set(0, .07, .06); base.receiveShadow = true; g.add(base); place(g); scene.add(g); }
wainscot(RW, g => g.position.set(0, 0, bz));
for (const s of [-1, 1]) wainscot(RD, g => { g.position.set(s * RW / 2, 0, RZ); g.rotation.y = -s * Math.PI / 2; });
// 天井の梁（奥行きを感じさせる）
const beamMat = std('#6a4028', { roughness:.7 });
for (const z of [bz + .02]){ const b = new THREE.Mesh(new RoundedBoxGeometry(RW, .22, .26, 2, .04), beamMat); b.position.set(0, 4.6, z + .13); scene.add(b); }

// 窓（壁にあいた穴）と、その向こうの雪の外
const win = new THREE.Group(); win.position.set(WX, WY, bz); scene.add(win);
const frameMat = std('#f3ead9', { roughness:.6 });
for (const [w, h, x, y] of [[WW + .26, .13, 0, WH / 2 + .065], [WW + .26, .15, 0, -WH / 2 - .075], [.13, WH + .28, -WW / 2 - .065, 0], [.13, WH + .28, WW / 2 + .065, 0], [.06, WH, 0, 0], [WW, .06, 0, 0]]){ const f = new THREE.Mesh(new RoundedBoxGeometry(w, h, .12, 2, .03), frameMat); f.position.set(x, y, .06); f.castShadow = true; win.add(f); }
const revealMat = std('#f6efe2', { roughness:.8 });
for (const [w, h, d, x, y] of [[WW, .02, .3, 0, WH / 2], [WW, .02, .3, 0, -WH / 2], [.02, WH, .3, -WW / 2, 0], [.02, WH, .3, WW / 2, 0]]){ const r = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), revealMat); r.position.set(x, y, -.15); r.receiveShadow = true; win.add(r); }
const sill = new THREE.Mesh(new RoundedBoxGeometry(WW + .45, .09, .34, 2, .03), frameMat); sill.position.set(0, -WH / 2 - .17, .16); sill.castShadow = true; win.add(sill);
const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshPhysicalMaterial({ color:'#dfeeff', transparent:true, opacity:.12, roughness:.05, depthWrite:false })); glassPane.position.z = -.02; win.add(glassPane);
// 外：空・雪の地面・木
const OUT_Z = bz - .02, outside = new THREE.Group(); scene.add(outside);
const skyTex = canvasTex(512, 512, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#1b2a55'); l.addColorStop(.7, '#3b4f8a'); l.addColorStop(1, '#5a6aa0'); g.fillStyle = l; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++){ g.fillStyle = `rgba(255,255,255,${.35 + Math.random() * .65})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h * .7, Math.random() * 1.8 + .4, 0, 7); g.fill(); }
  g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(w * .72, h * .2, 26, 0, 7); g.fill(); g.fillStyle = '#2a3a6c'; g.beginPath(); g.arc(w * .72 + 12, h * .2 - 8, 23, 0, 7); g.fill(); });
const sky = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshBasicMaterial({ map:skyTex })); sky.position.set(WX, 3.6, OUT_Z - 6.5); outside.add(sky);
const snowMat = std('#f4f8ff', { roughness:.95 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), snowMat); ground.rotation.x = -Math.PI / 2; ground.position.set(WX, .6, OUT_Z - 3.5); ground.receiveShadow = true; outside.add(ground);
for (const [x, z, r] of [[-1.0, -2.4, .6], [1.0, -3.4, .8], [.2, -4.6, 1.0], [-1.4, -4.0, .9]]){ const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12), snowMat); m.scale.y = .35; m.position.set(WX + x, .6, OUT_Z + z); m.receiveShadow = true; outside.add(m); }
const pineM = std('#2e5a48', { roughness:.85 });
for (const [x, z, h] of [[-.55, -3.1, .9], [-.25, -3.9, 1.1], [.6, -3.5, .8], [.4, -4.4, 1.2], [-.7, -4.6, 1.3], [.1, -4.9, 1.2], [.9, -4.2, 1.0]]){ const t = new THREE.Group(); t.position.set(WX + x, .6, OUT_Z + z); outside.add(t);
  for (let k = 0; k < 3; k++){ const c = new THREE.Mesh(new THREE.ConeGeometry(h * (.36 - k * .09), h * .5, 20), pineM); c.position.y = h * (.32 + k * .22); c.castShadow = true; t.add(c); const sc = new THREE.Mesh(new THREE.ConeGeometry(h * (.26 - k * .07), h * .2, 20), snowMat); sc.position.y = h * (.47 + k * .22); t.add(sc); }
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, .3, 8), std('#5a3a28')); tr.position.y = .1; t.add(tr); }
const snowN = 140, snowGeo = new THREE.BufferGeometry(), snowPos = new Float32Array(snowN * 3); for (let i = 0; i < snowN; i++){ snowPos[i * 3] = WX + (Math.random() - .5) * 4; snowPos[i * 3 + 1] = .6 + Math.random() * 4; snowPos[i * 3 + 2] = OUT_Z - .3 - Math.random() * 3.5; }
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3)); const snowPts = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color:'#ffffff', size:.05, transparent:true, opacity:.9, map:glowTex, depthWrite:false })); outside.add(snowPts);
const winLight = new THREE.PointLight('#9fc4ff', 1.5, 4); winLight.position.set(WX, 2.4, bz + .6); scene.add(winLight);
const outLight = new THREE.DirectionalLight('#bcd4ff', 1.2); outLight.position.set(WX - 2, 6, OUT_Z + 2); outLight.target.position.set(WX, .6, OUT_Z - 2.5); scene.add(outLight, outLight.target);

/* ---------- ツリー ---------- */
const tree = new THREE.Group(); tree.position.set(-1.15, 0, -1.65); tree.scale.setScalar(.86); tree.rotation.y = opts.rot || 0; scene.add(tree);
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
// ツリーの飾り（モール・電球・てっぺん）は入れかえられる。作り方は下の treeGarland / treeLights / treeTopper
const spiral = (turns = 3.4, off = .04, n = 300, ph = 0) => { const pts = [], yA = treeTopY - .45, yB = TIERS[0][0] + .18; for (let i = 0; i <= n; i++){ const t = i / n, y = yA + (yB - yA) * t, a = ph + t * turns * Math.PI * 2, r = radiusAt(y) + off; pts.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)); } return pts; };
const tinselTexOf = (base, hi, lo) => canvasTex(64, 64, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++){ g.fillStyle = Math.random() < .5 ? hi : lo; g.fillRect(Math.random() * w, Math.random() * h, 2, 6); } }, [90, 1]);
function treeGarland(kind){ const g = new THREE.Group();
  if (kind === 'a' || kind === 'b'){ const tex = kind === 'a' ? tinselTexOf('#d9a52a', '#fff1a8', '#a87810') : tinselTexOf('#c8ccd6', '#ffffff', '#8a90a0');
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral()), 700, .04, 8), std('#ffffff', { map:tex, roughness:.35, metalness:kind === 'a' ? .55 : .7 })); m.castShadow = true; g.add(m); }
  if (kind === 'c'){ const pts = spiral(3.0, .05, 900), cr = new THREE.CatmullRomCurve3(pts), len = cr.getLength(), n = Math.floor(len / .075), geo = new THREE.SphereGeometry(.032, 12, 8), mr = std('#d8202a', { roughness:.2, metalness:.1 }), mw = std('#fbf8f0', { roughness:.25 });
    const ir = new THREE.InstancedMesh(geo, mr, Math.ceil(n / 2)), iw = new THREE.InstancedMesh(geo, mw, Math.ceil(n / 2)), dm = new THREE.Object3D(); let a = 0, b = 0;
    for (let i = 0; i < n; i++){ dm.position.copy(cr.getPointAt(i / n)); dm.updateMatrix(); if (i % 2) iw.setMatrixAt(b++, dm.matrix); else ir.setMatrixAt(a++, dm.matrix); } ir.count = a; iw.count = b; ir.castShadow = iw.castShadow = true; g.add(ir, iw); }
  return g; }
function treeLights(kind){ const g = new THREE.Group(), list = [];
  const cols = kind === 'a' ? ['#ffd25a', '#ff7a7a', '#7ad8ff', '#a8ff8a', '#ff9ae0'] : kind === 'b' ? ['#ffe2a0', '#fff0c8', '#ffd890'] : ['#f4f8ff', '#cfe4ff', '#e8f0ff'];
  const N = kind === 'b' ? 200 : kind === 'c' ? 70 : 150, size = kind === 'b' ? .02 : kind === 'c' ? .055 : .03;
  for (let i = 0; i < N; i++){ const u = Math.sqrt((i + .5) / N), y = treeTopY - .3 - u * (treeTopY - .3 - TIERS[0][0] - .1), a = i * 2.39996, r = radiusAt(y) * .98 + (kind === 'c' ? .04 : 0);
    const c = cols[i % cols.length], b = new THREE.Mesh(new THREE.SphereGeometry(size, kind === 'c' ? 16 : 10, kind === 'c' ? 12 : 8), kind === 'c' ? new THREE.MeshStandardMaterial({ color:'#ffffff', emissive:c, emissiveIntensity:.9, roughness:.6 }) : new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:1.6 }));
    b.position.set(Math.sin(a) * r, y, Math.cos(a) * r); g.add(b); const gl = glow(c, size * (kind === 'b' ? 8 : 6.5), .5); gl.position.copy(b.position); g.add(gl); list.push({ gl, ph:i * 1.7 % 6.28 }); }
  g.userData.bulbs = list; return g; }
const starShape = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .1 : .24; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? starShape.lineTo(x, y) : starShape.moveTo(x, y); } starShape.closePath();
function treeTopper(kind){ const g = new THREE.Group(); g.position.y = treeTopY;
  if (kind === 'a'){ const s = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth:.06, bevelEnabled:true, bevelThickness:.04, bevelSize:.035, bevelSegments:3 }), new THREE.MeshStandardMaterial({ color:'#f2c14e', roughness:.25, metalness:.75, emissive:'#a86a10', emissiveIntensity:.35 })); s.position.set(0, .2, -.03); s.castShadow = true; g.add(s);
    g.userData.glow = glow('#fff2b0', 1.0, .65); g.userData.glow.position.set(0, .22, .05); g.add(g.userData.glow); }
  if (kind === 'b'){ // 雪の結晶
    const ice = new THREE.MeshPhysicalMaterial({ color:'#e8f4ff', roughness:.1, metalness:.2, clearcoat:1, emissive:'#6aa0e0', emissiveIntensity:.25 }), f = new THREE.Group(); f.position.set(0, .3, 0); g.add(f);
    for (let k = 0; k < 6; k++){ const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 3; f.add(arm); const bar = new THREE.Mesh(new RoundedBoxGeometry(.05, .3, .04, 2, .015), ice); bar.position.y = .15; arm.add(bar);
      for (const [y, l] of [[.12, .08], [.21, .06]]) for (const s of [-1, 1]){ const t = new THREE.Mesh(new RoundedBoxGeometry(.035, l, .035, 2, .01), ice); t.position.set(s * l * .38, y + l * .3, 0); t.rotation.z = -s * .9; arm.add(t); } }
    f.add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .05, 6), ice)).rotation.x = Math.PI / 2; f.traverse(m => { if (m.isMesh) m.castShadow = true; });
    g.userData.glow = glow('#cfe6ff', .9, .55); g.userData.glow.position.set(0, .3, .05); g.add(g.userData.glow); }
  if (kind === 'c'){ // 赤いリボン
    const rb = std('#d02a2a', { roughness:.35, metalness:.1 }), r2 = std('#b01e22', { roughness:.4 });
    for (const s of [-1, 1]){ const lp = new THREE.Mesh(new THREE.TorusGeometry(.13, .065, 14, 32), rb); lp.position.set(s * .15, .28, 0); lp.rotation.set(0, s * .5, s * .35); lp.scale.set(1.1, .8, 1); lp.castShadow = true; g.add(lp);
      const tl = new THREE.Mesh(new RoundedBoxGeometry(.08, .32, .025, 2, .01), r2); tl.position.set(s * .08, .06, .03); tl.rotation.z = s * .3; g.add(tl); }
    const kn = new THREE.Mesh(new THREE.SphereGeometry(.08, 16, 12), rb); kn.position.set(0, .28, .03); g.add(kn); for (const s of [-1, 1]){ const b = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), std('#f2c14e', { metalness:.7, roughness:.25 })); b.position.set(s * .2, .05, .05); g.add(b); } }
  return g; }

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
const slots = []; { const N = 120, yTop = treeTopY - .4, yBot = TIERS[0][0] + .12; for (let i = 0; i < N; i++){ const u = Math.sqrt((i + .5) / N), y = yTop - u * (yTop - yBot), a = i * 2.39996; const ang = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); const d = ang > Math.PI ? ang - Math.PI * 2 : ang; const r = radiusAt(y) * .98 + .16; slots.push(new THREE.Vector3(Math.sin(a) * r, y - .05, Math.cos(a) * r)); } }
{ const w = slots.map(p => [p, Math.abs(Math.atan2(p.x, p.z)) + rnd() * 2.2]); w.sort((a, b) => a[1] - b[1]); slots.length = 0; w.forEach(a => slots.push(a[0])); } // 前から順に、ばらして飾る
const placed = [], appear = [];
const usedSlots = new Set();
// いま手前を向いている面の、あいている場所を選ぶ（回したあとでも、見えている側に付く）
function pickSlot(){ const rot = tree.rotation.y; let best = -1, bs = 1e9; for (let i = 0; i < slots.length; i++){ if (usedSlots.has(i)) continue; const p = slots[i]; let d = Math.atan2(p.x, p.z) + rot; d = Math.atan2(Math.sin(d), Math.cos(d)); const sc = Math.abs(d) + rnd() * 1.1; if (sc < bs){ bs = sc; best = i; } } return best; }
// 決まった場所があればそこ。ふたりがたまたま同じ場所を選んでいたら、いちばん近いあいている場所。なければ前から順に（どの端末でも同じ結果）
function slotFor(want){ if (Number.isInteger(want) && want >= 0 && want < slots.length){ if (!usedSlots.has(want)) return want; let best = -1, bd = 1e9; for (let i = 0; i < slots.length; i++){ if (usedSlots.has(i)) continue; const d = slots[i].distanceToSquared(slots[want]); if (d < bd){ bd = d; best = i; } } return best; }
  for (let i = 0; i < slots.length; i++) if (!usedSlots.has(i)) return i; return -1; }
function addOrnament(animate = true, id = null, type = null, want = null){ const idx = placed.length; let si = slotFor(want), p; if (si >= 0){ usedSlots.add(si); p = slots[si].clone(); } else { p = slots[idx % slots.length].clone().multiplyScalar(1.02).add(new THREE.Vector3(0, -.04 * Math.floor(idx / slots.length), 0)); } const o = makeOrnament(type || 'red'); o.userData.id = id; o.userData.base = 1.45; o.scale.setScalar(1.45); o.children[0].position.y -= .13; o.position.copy(p).add(new THREE.Vector3(0, .13 * 1.45, 0)); o.userData.orn = true; o.userData.ph = rnd() * 6; o.rotation.order = 'YXZ'; o.rotation.y = Math.atan2(p.x, p.z) + (rnd() - .5) * .6; o.rotation.z = (rnd() - .5) * .25; o.userData.rz = o.rotation.z; o.traverse(m => { if (m.isMesh) m.castShadow = true; }); tree.add(o); placed.push(o);
  if (animate){ o.scale.setScalar(.001); appear.push({ o, t0:performance.now() }); } shadowsDirty = true; }

/* ---------- プレゼント ---------- */
const WRAPS = [['#c8352e', '#f3ead9', 'stripe'], ['#3a6ab8', '#ffffff', 'dot'], ['#f2c14e', '#e0564a', 'check'], ['#3f9a4f', '#f3ead9', 'dot'], ['#f3ead9', '#c8352e', 'stripe'], ['#8a5ab8', '#f2c14e', 'check'], ['#f4a6bc', '#ffffff', 'dot']];
function wrapTex(a, b, kind){ return canvasTex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b;
  if (kind === 'stripe') for (let i = -4; i < 8; i++){ g.beginPath(); g.moveTo(i * 24, 0); g.lineTo(i * 24 + 10, 0); g.lineTo(i * 24 + 10 + h, h); g.lineTo(i * 24 + h, h); g.fill(); }
  if (kind === 'dot') for (let y = 10; y < h; y += 20) for (let x = (y / 20 % 2) * 10 + 6; x < w; x += 20){ g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  if (kind === 'check'){ g.globalAlpha = .45; for (let i = 0; i < 4; i++){ g.fillRect(i * 32 + 8, 0, 14, h); g.fillRect(0, i * 32 + 8, w, 14); } } }); }
const gifts = [];
const GIFT_SPOTS = [[-1.7, -.7], [-.6, -.65], [-1.15, -.3], [-.25, -1.0], [-1.95, -1.2], [-.45, -.15], [-.0, -.5], [-1.65, -.05]];
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

/* ---------- 家具（アドベントで手に入る。場所ごとに3種類から選べる） ---------- */
const FPX = 1.28, FPW = 1.3, FPH = 1.32, OW = .7, OH = .72;
const fireLight = new THREE.PointLight('#ff9a4a', 4, 4.5); fireLight.position.set(FPX, .55, bz + .8); fireLight.intensity = 0; scene.add(fireLight);
const lampLight = new THREE.PointLight('#ffc878', 0, 3.2); lampLight.castShadow = false; scene.add(lampLight);
const kamaLight = new THREE.PointLight('#ff9a3a', 0, 1.6); scene.add(kamaLight);
let flames = [], fireGlow = null;
const M = (c, o = {}) => std(c, o);
const feltM = c => std(c, { roughness:1 });
function blobIn(g, x, z, sx, sz = sx, op = 1){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map:blobTex, transparent:true, depthWrite:false, opacity:op })); m.rotation.x = -Math.PI / 2; m.position.set(x, .006, z); m.scale.set(sx, sz, 1); g.add(m); return m; }
function addM(g, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; }
const RB = (w, h, d, r = .04) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001));
function glowIn(g, c, s, op, x, y, z){ const gl = glow(c, s, op); gl.position.set(x, y, z); g.add(gl); return gl; }
function bulbsIn(g, pts, size = .03){ const list = []; pts.forEach(([x, y, z], i) => { const c = ['#ffd25a', '#ff7a7a', '#7ad8ff', '#a8ff8a'][i % 4]; const b = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 8), new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:1.8 })); b.position.set(x, y, z); g.add(b); list.push({ gl:glowIn(g, c, size * 6.5, .6, x, y, z), ph:i * .7 }); }); g.userData.bulbs = list; }
// テクスチャ
const stoneTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9a8670'; g.fillRect(0, 0, w, h); let y = 0, r = 0; while (y < h){ const rh = 26 + (r * 7) % 12; let x = -((r * 23) % 40); while (x < w){ const rw = 38 + ((x * 13 + r * 29) % 30); g.fillStyle = ['#cdbb9e', '#c2ae8e', '#d8c8ac', '#b8a282'][(Math.abs(x) + r) % 4];
  g.beginPath(); g.roundRect ? g.roundRect(x + 3, y + 3, rw - 6, rh - 6, 9) : g.rect(x + 3, y + 3, rw - 6, rh - 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 8, y + 5, rw - 18, 4); x += rw; } y += rh; r++; } });
const brickTex2 = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e2d2c0'; g.fillRect(0, 0, w, h); for (let r = 0; r < 10; r++) for (let q = -1; q < 5; q++){ const x = q * 64 + (r % 2) * 32, y = r * 26; g.fillStyle = ['#a8483a', '#b85a44', '#9a3e30', '#c0644c'][(r * 3 + q + 8) % 4]; g.fillRect(x + 3, y + 3, 58, 20); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 3, y + 3, 58, 5); } });
const barkTexR = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#6a3e22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 50; i++){ g.strokeStyle = Math.random() < .5 ? 'rgba(40,18,6,.6)' : 'rgba(160,104,64,.5)'; g.lineWidth = 2 + Math.random() * 2; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.lineTo(w, y + (Math.random() - .5) * 6); g.stroke(); } });
const knitTexR = (a, b) => canvasTex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 12){ g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(x + 4, y + 6, 3.4, 6, .5, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 12, y + 6, 3.4, 6, -.5, 0, 7); g.fill(); } g.fillStyle = b; for (const y of [24, 30, 92, 98]) g.fillRect(0, y, w, 4); for (let x = 8; x < w; x += 16){ g.beginPath(); g.moveTo(x, 54); g.lineTo(x + 6, 62); g.lineTo(x, 70); g.lineTo(x - 6, 62); g.fill(); } }, [2, 2]);
const plaidTex = (a, b, c) => canvasTex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.globalAlpha = .5; g.fillStyle = b; for (let i = 0; i < 4; i++){ g.fillRect(i * 32 + 6, 0, 14, h); g.fillRect(0, i * 32 + 6, w, 14); } g.globalAlpha = .7; g.fillStyle = c; for (let i = 0; i < 4; i++){ g.fillRect(i * 32 + 24, 0, 3, h); g.fillRect(0, i * 32 + 24, w, 3); } g.globalAlpha = 1; }, [2, 2]);
function planarUV(geo, sx = 1, sy = 1){ geo.computeBoundingBox(); const b = geo.boundingBox, p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - b.min.x) / (b.max.x - b.min.x) * sx, (p.getY(i) - b.min.y) / (b.max.y - b.min.y) * sy); return geo; }

/* 暖炉（3種）。どれもマントルの高さと幅は同じ */
function fireplace(style){ const g = new THREE.Group(); const fs = new THREE.Shape(); fs.moveTo(-FPW / 2, 0); fs.lineTo(FPW / 2, 0); fs.lineTo(FPW / 2, FPH); fs.lineTo(-FPW / 2, FPH); fs.closePath();
  const h = new THREE.Path(); h.moveTo(-OW / 2, 0); h.lineTo(-OW / 2, OH - OW / 2); h.absarc(0, OH - OW / 2, OW / 2, Math.PI, 0, true); h.lineTo(OW / 2, 0); h.closePath(); fs.holes.push(h);
  const geo = new THREE.ExtrudeGeometry(fs, { depth:.34, bevelEnabled:true, bevelThickness:.03, bevelSize:.03, bevelSegments:2, curveSegments:24 }); { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + FPW / 2) / FPW * 1.4, p.getY(i) / FPH * 1.4); }
  const body = style === 'brick' ? M('#ffffff', { map:brickTex2, roughness:.85 }) : style === 'white' ? M('#f6f0e4', { roughness:.55 }) : M('#ffffff', { map:stoneTex, roughness:.85 });
  addM(g, geo, body);
  if (style === 'white'){ for (const s of [-1, 1]){ addM(g, RB(.16, FPH - .1, .1, .03), M('#fbf8f0', { roughness:.5 }), s * (FPW / 2 - .14), (FPH - .1) / 2, .4); addM(g, RB(.22, .1, .14, .03), M('#fbf8f0', { roughness:.5 }), s * (FPW / 2 - .14), .05, .4); }
    addM(g, RB(FPW - .2, .14, .06, .03), M('#fbf8f0', { roughness:.5 }), 0, FPH - .2, .4); addM(g, new THREE.TorusGeometry(OW / 2 + .04, .025, 8, 32, Math.PI), M('#d9b45a', { roughness:.35, metalness:.5 }), 0, OH - OW / 2, .38); }
  addM(g, new THREE.BoxGeometry(OW, OH, .3), M('#2a1a14', { roughness:1, side:THREE.BackSide }), 0, OH / 2, .17);
  addM(g, RB(FPW + .2, .08, .42, .03), style === 'white' ? M('#3a3a40', { roughness:.4 }) : style === 'brick' ? M('#ffffff', { map:brickTex2, roughness:.8 }) : M('#ffffff', { map:stoneTex, roughness:.8 }), 0, .04, .5);
  const mc = style === 'white' ? '#fbf8f0' : style === 'brick' ? '#5a3a2a' : '#8a5a32';
  addM(g, RB(FPW + .3, .12, .5, .04), M(mc, { roughness:.55 }), 0, FPH + .06, .2); addM(g, RB(FPW + .16, .06, .44, .02), M(style === 'white' ? '#efe6d4' : style === 'brick' ? '#6a4632' : '#a8703e', { roughness:.55 }), 0, FPH - .02, .2);
  if (style === 'brick') addM(g, RB(.95, .05, .1, .02), M('#d9b45a', { roughness:.35, metalness:.5 }), 0, .02, .73);
  for (const [x, ry, z] of [[-.08, .5, .28], [.1, -.45, .26], [0, 0, .14]]) addM(g, new THREE.CylinderGeometry(.07, .07, .52, 14), M('#ffffff', { map:barkTexR }), x, .1 + (z < .2 ? .11 : 0), z, 0, ry, Math.PI / 2);
  const fl = []; for (const [x, hh, c, w] of [[0, .46, '#ff7a2a', .17], [-.12, .32, '#ff9a3a', .12], [.12, .34, '#ff9a3a', .12], [0, .28, '#ffd25a', .1], [-.05, .2, '#fff0a0', .06]]){ const f = new THREE.Mesh(new THREE.ConeGeometry(w, hh, 16), new THREE.MeshBasicMaterial({ color:c, transparent:true, opacity:.92, depthWrite:false })); f.position.set(x, .2 + hh / 2, .26); g.add(f); fl.push({ f, h:hh, ph:Math.random() * 6 }); }
  const gw = glowIn(g, '#ffb050', 1.3, .7, 0, .4, .4); g.userData.fire = { fl, gw };
  // ガーランドと電球（暖炉に付いている）
  const gm = [M('#2f7a4a', { roughness:.8 }), M('#3f9058', { roughness:.8 }), M('#245c3a', { roughness:.8 })];
  for (let i = 0; i < 46; i++){ const x = -.78 + i / 45 * 1.56, y = FPH + .12 - .06 * Math.sin(i / 45 * Math.PI * 3) ** 2 - .02; addM(g, new THREE.ConeGeometry(.05, .2, 6), gm[i % 3], x, y, .44 + (i % 2) * .04, Math.PI / 2 + (i % 3 - 1) * .4, 0, (i % 5 - 2) * .5); }
  bulbsIn(g, Array.from({ length:9 }, (_, i) => { const x = -.72 + i * .18; return [x, FPH + .12 - .06 * Math.sin((x + .78) / 1.56 * Math.PI * 3) ** 2 - .03, .51]; }), .022);
  blobIn(g, 0, .55, 1.9, .9, .5); return g; }

/* くつした3つ（3種） */
const stockShape = (() => { const pts = [[-.45, .9], [.35, .9], [.35, -.3], [.95, -.65], [1.05, -1.0], [.7, -1.18], [-.1, -1.1], [-.45, -.85]].map(p => new THREE.Vector2(...p)); const s = new THREE.Shape(); s.setFromPoints(new THREE.SplineCurve(pts.concat([pts[0]])).getPoints(80)); return s; })();
function stocking(mat, cuffMat){ const g = new THREE.Group(); const geo = planarUV(new THREE.ExtrudeGeometry(stockShape, { depth:.4, bevelEnabled:true, bevelThickness:.12, bevelSize:.12, bevelSegments:3 })); geo.translate(0, 0, -.2); addM(g, geo, mat); addM(g, RB(1.05, .45, .7, .2), cuffMat, -.05, 1.0); g.scale.setScalar(.2); return g; }
function stockings(kind){ const g = new THREE.Group(); const sets = kind === 'knit' ? [['#c8352e', '#fbfbf6'], ['#2f7a4a', '#fbfbf6'], ['#fbfbf6', '#c8352e']] : kind === 'plaid' ? [['#c8352e', '#2f7a4a', '#f2c14e'], ['#2f5a8a', '#c8352e', '#fbfbf6'], ['#2f7a4a', '#c8352e', '#f2c14e']] : [['#d8403a'], ['#3a8a52'], ['#3a6ab8']];
  sets.forEach((c, i) => { const mat = kind === 'knit' ? M('#ffffff', { map:knitTexR(c[0], c[1]), roughness:1 }) : kind === 'plaid' ? M('#ffffff', { map:plaidTex(...c), roughness:.95 }) : feltM(c[0]); const cuff = kind === 'plaid' ? feltM('#5a3a2a') : feltM('#fbfbf6');
    const s = stocking(mat, cuff); s.position.set(-.42 + i * .42, -.25, .5); s.rotation.z = (i - 1) * .06; g.add(s); addM(g, new THREE.TorusGeometry(.03, .01, 6, 12), M('#e8b84a', { metalness:.6, roughness:.3 }), -.42 + i * .42, 0, .5); }); return g; }

/* マントルの上（3種） */
function mantelTop(kind){ const g = new THREE.Group();
  if (kind === 'a'){ const c1 = makeDeco('c6', .26); c1.position.set(-.48, 0, .02); g.add(c1); glowIn(g, '#ffd890', .5, .55, -.48, .27, .04); const c2 = makeDeco('c6', .2); c2.position.set(-.34, 0, .1); g.add(c2); glowIn(g, '#ffd890', .4, .5, -.34, .21, .12);
    const nut = makeDeco('c0', .42); nut.position.set(.44, 0, .04); g.add(nut); const pt = makeDeco('c11', .2); pt.position.set(.12, 0, -.02); g.add(pt); }
  if (kind === 'b'){ const h = makeDeco('s10', .3); h.position.set(.32, 0, .04); h.rotation.y = -.3; g.add(h); const t = makeDeco('c15', .4); t.position.set(-.38, 0, .02); g.add(t); for (const [x, z] of [[-.08, .12], [.02, .06]]){ const c = makeDeco('s4', .1); c.position.set(x, 0, z); c.rotation.x = -1.4; g.add(c); } }
  if (kind === 'c'){ const s = makeDeco('w6', .3); s.position.set(-.36, 0, .04); g.add(s); const l = makeDeco('c7', .36); l.position.set(.4, 0, .04); g.add(l); glowIn(g, '#ffd070', .6, .5, .4, .17, .1); for (const [x, s2] of [[0, .16], [.12, .13]]){ const p = makeDeco('pine', s2); p.position.set(x, 0, .1); g.add(p); } }
  return g; }

/* 暖炉の上の壁（3種） */
function wallDeco(kind){ const g = new THREE.Group();
  if (kind === 'a'){ const w = makeDeco('c9', .78); g.add(w); }
  if (kind === 'b'){ const face = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2a1e'; c.font = 'bold 30px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++){ const a = i / 12 * Math.PI * 2; c.fillText(String(i), w / 2 + Math.sin(a) * 96, h / 2 - Math.cos(a) * 96); } c.strokeStyle = '#3a2a1e'; c.lineCap = 'round'; c.lineWidth = 8; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 50, 128 - 22); c.stroke(); c.lineWidth = 5; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 - 12, 128 - 80); c.stroke(); c.fillStyle = '#c8352e'; c.beginPath(); c.arc(128, 128, 9, 0, 7); c.fill(); });
    addM(g, new THREE.CylinderGeometry(.3, .3, .08, 48), M('#8a5a32', { roughness:.5 }), 0, .38, 0, Math.PI / 2); addM(g, new THREE.CircleGeometry(.26, 48), M('#ffffff', { map:face, roughness:.6 }), 0, .38, .045); addM(g, new THREE.TorusGeometry(.3, .035, 10, 48), M('#d9b45a', { roughness:.3, metalness:.6 }), 0, .38, .04);
    const h = makeDeco('c12', .22); h.position.set(.2, .58, .06); h.rotation.z = -.4; g.add(h); }
  if (kind === 'c'){ const art = canvasTex(256, 192, (c, w, h) => { const l = c.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#2a3a6c'); l.addColorStop(1, '#6a7ab0'); c.fillStyle = l; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++){ c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h * .6, Math.random() * 1.6 + .4, 0, 7); c.fill(); }
      c.fillStyle = '#f4f8ff'; c.beginPath(); c.ellipse(w / 2, h * 1.05, w * .7, h * .32, 0, 0, 7); c.fill(); for (const [x, s] of [[60, 1], [150, 1.3], [200, .9]]){ c.fillStyle = '#c8603a'; c.fillRect(x - 18 * s, h * .66 - 20 * s, 36 * s, 26 * s); c.fillStyle = '#fbfdff'; c.beginPath(); c.moveTo(x - 24 * s, h * .66 - 18 * s); c.lineTo(x, h * .66 - 40 * s); c.lineTo(x + 24 * s, h * .66 - 18 * s); c.fill(); c.fillStyle = '#ffd870'; c.fillRect(x - 6 * s, h * .66 - 12 * s, 10 * s, 9 * s); }
      c.fillStyle = '#2e5a48'; for (const x of [20, 110, 236]){ c.beginPath(); c.moveTo(x, h * .45); c.lineTo(x - 16, h * .72); c.lineTo(x + 16, h * .72); c.fill(); } });
    addM(g, RB(.86, .68, .06, .02), M('#d9b45a', { roughness:.35, metalness:.55 }), 0, .4, 0); addM(g, new THREE.PlaneGeometry(.72, .54), M('#ffffff', { map:art, roughness:.8 }), 0, .4, .035); addM(g, RB(.06, .3, .02), M('#8a5a32'), 0, .8, -.01);
    for (const s of [-1, 1]){ const b = makeDeco('c10', .2); b.position.set(s * .38, .62, .05); g.add(b); } }
  return g; }

/* 窓の外（3種） */
function outsideDeco(kind){ const g = new THREE.Group(); const snowM = snowMat;
  if (kind === 'a'){ const sm = new THREE.Group(); sm.rotation.y = -.25; sm.scale.setScalar(.8); g.add(sm); const coal = M('#2a2a2e', { roughness:.4 });
    addM(sm, new THREE.SphereGeometry(.34, 32, 24), snowM, 0, .3); addM(sm, new THREE.SphereGeometry(.24, 32, 24), snowM, 0, .78); for (const x of [-.08, .08]) addM(sm, new THREE.SphereGeometry(.026, 10, 8), coal, x, .83, .21); for (let i = 0; i < 5; i++){ const a = -.5 + i * .25; addM(sm, new THREE.SphereGeometry(.016, 8, 6), coal, Math.sin(a) * .12, .71 + Math.abs(a) * .04, .215); }
    addM(sm, new THREE.ConeGeometry(.035, .2, 12), M('#f08a2a', { roughness:.5 }), 0, .78, .3, Math.PI / 2); for (const y of [.25, .38, .5]) addM(sm, new THREE.SphereGeometry(.03, 10, 8), coal, 0, y, Math.sqrt(Math.max(0, .34 * .34 - (y - .3) * (y - .3))) + .005);
    const hm = M('#2a2a32', { roughness:.35 }); const hat = new THREE.Group(); hat.rotation.z = -.12; hat.position.x = .03; sm.add(hat); addM(hat, new THREE.CylinderGeometry(.14, .14, .22, 24), hm, 0, 1.08); addM(hat, new THREE.CylinderGeometry(.22, .22, .03, 24), hm, 0, .98); addM(hat, new THREE.CylinderGeometry(.142, .142, .05, 24), M('#c8352e'), 0, 1.01);
    const sf = M('#c8352e', { roughness:.95 }); addM(sm, new THREE.TorusGeometry(.19, .055, 10, 28), sf, 0, .58, 0, Math.PI / 2); addM(sm, RB(.09, .3, .04, .02), sf, .1, .44, .2, 0, 0, .25);
    const br = M('#6a4630'); for (const s of [-1, 1]){ addM(sm, new THREE.CylinderGeometry(.015, .022, .42, 6), br, s * .45, .48, 0, 0, 0, s * -1.0); addM(sm, new THREE.CylinderGeometry(.01, .012, .12, 6), br, s * .6, .62, 0, 0, 0, s * -.3); } }
  if (kind === 'b'){ for (const [x, z, s, ry] of [[-.2, 0, 1, .4], [.25, .2, .8, -.5]]){ const r = new THREE.Group(); r.position.set(x, 0, z); r.rotation.y = ry; r.scale.setScalar(s); g.add(r); addM(r, new THREE.SphereGeometry(.22, 24, 16), snowM, 0, .12, 0, 0, 0, 0, 1.25, .62, .85); for (const sx of [-1, 1]){ addM(r, new THREE.SphereGeometry(.07, 12, 8), M('#4aa04a', { roughness:.5 }), .1, .24, sx * .07, 0, 0, sx * .4, .4, 1.3, .2); addM(r, new THREE.SphereGeometry(.022, 10, 8), M('#d8202a', { roughness:.2 }), .2, .17, sx * .07); } } }
  if (kind === 'c'){ const dome = new THREE.SphereGeometry(.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2); addM(g, dome, snowM, 0, 0, 0, 0, 0, 0, 1, .85, 1); const door = new THREE.Shape(); door.moveTo(-.16, 0); door.lineTo(-.16, .18); door.absarc(0, .18, .16, Math.PI, 0, true); door.lineTo(.16, 0); door.closePath();
    addM(g, new THREE.ShapeGeometry(door), new THREE.MeshStandardMaterial({ color:'#ffb050', emissive:'#ff9a3a', emissiveIntensity:1.1 }), 0, 0, .47); addM(g, new THREE.TorusGeometry(.17, .05, 10, 24, Math.PI), snowM, 0, .18, .46); glowIn(g, '#ffb860', .9, .7, 0, .18, .55);
    for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; addM(g, new THREE.SphereGeometry(.12, 12, 8), snowM, Math.cos(a) * .52, .04, Math.sin(a) * .52, 0, 0, 0, 1, .5, 1); } g.userData.kama = [0, .2, .7]; }
  blobIn(g, .05, .04, .9, .9, .35); return g; }

/* 窓辺（3種） */
function sillDeco(kind){ const g = new THREE.Group();
  if (kind === 'a'){ const c = makeDeco('c7', .32); c.position.set(-.42, 0, .22); g.add(c); glowIn(g, '#ffd070', .7, .6, -.42, .14, .3); const p1 = makeDeco('pine', .2); p1.position.set(.38, 0, .22); g.add(p1); const p2 = makeDeco('pine', .15); p2.position.set(.52, 0, .26); p2.rotation.z = 1.3; g.add(p2); }
  if (kind === 'b'){ [[-.45, .2], [-.3, .15], [.42, .18]].forEach(([x, h]) => { addM(g, new THREE.CylinderGeometry(.06, .06, h, 24), new THREE.MeshPhysicalMaterial({ color:'#e8f2ff', roughness:.05, transparent:true, opacity:.35, depthWrite:false }), x, h / 2, .22); addM(g, new THREE.CylinderGeometry(.045, .045, h * .55, 20), M('#fbf2e2', { roughness:.6 }), x, h * .28, .22); addM(g, new THREE.ConeGeometry(.018, .06, 10), new THREE.MeshBasicMaterial({ color:'#ffc040' }), x, h * .55 + .04, .22); glowIn(g, '#ffd27a', .32, .7, x, h * .6, .25); addM(g, new THREE.TorusGeometry(.062, .008, 6, 24), M('#c8352e'), x, h * .7, .22, Math.PI / 2); }); }
  if (kind === 'c'){ addM(g, new THREE.CylinderGeometry(.13, .1, .18, 24), M('#c87a4a', { roughness:.7 }), -.4, .09, .2); addM(g, new THREE.TorusGeometry(.13, .02, 8, 24), M('#b8693a'), -.4, .18, .2, Math.PI / 2); const p = makeDeco('c11', .24); p.position.set(-.4, .16, .2); p.rotation.x = -1.2; g.add(p);
    addM(g, new THREE.CylinderGeometry(.08, .065, .12, 20), M('#fbf6ea', { roughness:.4 }), .42, .06, .22); const t = makeDeco('c15', .26); t.position.set(.42, .1, .22); g.add(t); }
  return g; }

/* 窓の上（3種） */
function winTop(kind){ const g = new THREE.Group(); const X0 = -(WW / 2 + .5), X1 = WW / 2 + .5; const curve = (t) => [X0 + t * (X1 - X0), -.12 * Math.sin(t * Math.PI * 4) ** 2, 0];
  const wire = (c) => addM(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length:41 }, (_, i) => new THREE.Vector3(...curve(i / 40)).add(new THREE.Vector3(0, .02, -.01)))), 100, .006, 4), M(c));
  if (kind === 'a'){ bulbsIn(g, Array.from({ length:17 }, (_, i) => curve(i / 16))); wire('#2a5a3a'); }
  if (kind === 'b'){ wire('#c8a86a'); const st = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .04 : .09; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const sg = new THREE.ExtrudeGeometry(st, { depth:.02, bevelEnabled:true, bevelThickness:.012, bevelSize:.01, bevelSegments:2 });
    for (let i = 0; i < 13; i++){ const [x, y] = curve(i / 12); addM(g, sg, M(i % 3 === 1 ? '#fbfbf6' : '#e8b84a', { roughness:.3, metalness:i % 3 === 1 ? 0 : .6 }), x, y - .1, 0, 0, 0, (i % 3 - 1) * .2); } }
  if (kind === 'c'){ addM(g, new THREE.CylinderGeometry(.015, .015, X1 - X0, 8), M('#a8703e'), 0, .02, 0, 0, 0, Math.PI / 2); for (let i = 0; i < 9; i++){ const x = X0 + .15 + i / 8 * (X1 - X0 - .3), L = .12 + (i % 3) * .1; addM(g, new THREE.CylinderGeometry(.004, .004, L, 4), M('#e8e8e8'), x, -L / 2, 0); const f = makeDeco(i % 2 ? 'w0' : 'snow', .16); f.position.set(x, -L - .16, 0); g.add(f); } }
  return g; }

/* カーテン（3種）：窓グループの中に置く */
function curtains(kind){ const g = new THREE.Group(); const lace = kind === 'c';
  const tex = kind === 'a' ? canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c8352e'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 4; i++){ c.fillRect(i * 32 + 10, 0, 12, h); c.fillRect(0, i * 32 + 10, w, 12); } c.fillStyle = 'rgba(80,10,10,.18)'; for (let i = 0; i < 4; i++) c.fillRect(i * 32, 0, 3, h); }, [2, 4])
    : kind === 'b' ? canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#2a5a3e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++){ c.fillStyle = `rgba(255,255,255,${Math.random() * .05})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [1, 1])
    : canvasTex(128, 128, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 3; for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32){ c.beginPath(); c.arc(x, y, 10, 0, 7); c.stroke(); for (let k = 0; k < 6; k++){ const a = k / 6 * 7; c.beginPath(); c.arc(x + Math.cos(a) * 14, y + Math.sin(a) * 14, 3, 0, 7); c.stroke(); } } }, [2, 5]);
  for (const s of [-1, 1]){ const geo = new THREE.PlaneGeometry(.5, WH + .75, 28, 1), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * (kind === 'b' ? 20 : 26)) * (kind === 'b' ? .06 : .045)); geo.computeVertexNormals();
    const m = lace ? new THREE.MeshStandardMaterial({ map:tex, color:'#ffffff', transparent:true, side:THREE.DoubleSide, roughness:.9, depthWrite:false }) : M('#ffffff', { map:tex, side:THREE.DoubleSide, roughness:kind === 'b' ? .55 : .9 });
    const c = addM(g, geo, m, s * (WW / 2 + .3), -.08, .2); c.castShadow = !lace;
    if (kind === 'b') for (let i = 0; i < 12; i++) addM(g, new THREE.CylinderGeometry(.012, .006, .07, 6), M('#e8b84a', { metalness:.5, roughness:.35 }), s * (WW / 2 + .3) - .22 + i * .04, -.08 - (WH + .75) / 2 - .03, .2 + Math.sin((-.22 + i * .04) * 20) * .06);
    addM(g, RB(.54, .08, .1, .03), kind === 'c' ? M('#f4a6bc', { roughness:.5 }) : M('#e8b84a', { roughness:.5, metalness:.3 }), s * (WW / 2 + .3), -.3, .24); }
  addM(g, new THREE.CylinderGeometry(.03, .03, WW + 1.1, 12), trimMat, 0, WH / 2 + .3, .24, 0, 0, Math.PI / 2); for (const s of [-1, 1]) addM(g, new THREE.SphereGeometry(.06, 12, 8), trimMat, s * (WW / 2 + .55), WH / 2 + .3, .24);
  return g; }

/* テーブルの場所（3種） */
function tableSpot(kind){ const g = new THREE.Group(); const wd = M('#a8703e', { roughness:.5 });
  const roundTable = () => { addM(g, new THREE.CylinderGeometry(.46, .46, .06, 40), wd, 0, .62); addM(g, new THREE.TorusGeometry(.46, .03, 8, 40), M('#8a5a32'), 0, .62, 0, Math.PI / 2); addM(g, new THREE.LatheGeometry([[.06, 0], [.12, .02], [.05, .12], [.07, .3], [.04, .5], [.08, .6]].map(([r, y]) => new THREE.Vector2(r, y)), 24), wd); addM(g, new THREE.CylinderGeometry(.2, .24, .04, 24), wd, 0, .02); blobIn(g, 0, 0, 1.1, 1.1, .6); };
  if (kind === 'a'){ roundTable(); addM(g, new THREE.CylinderGeometry(.3, .3, .005, 40), M('#f3ead9'), 0, .655); const gh = makeDeco('s10', .32); gh.position.set(-.08, .66, -.05); gh.rotation.y = .3; g.add(gh);
    const P = new THREE.Group(); P.position.set(.22, .66, .11); g.add(P); addM(P, new THREE.CylinderGeometry(.13, .1, .02, 32), M('#fbfbf6', { roughness:.3 })); for (const [x, z] of [[-.04, 0], [.05, .03], [0, -.05]]) addM(P, new THREE.CylinderGeometry(.045, .045, .018, 20), M('#c8823a', { roughness:.7 }), x, .025 + (x === 0 ? .018 : 0), z);
    addM(P, new THREE.CylinderGeometry(.036, .033, .1, 20), M('#fbfbf6', { roughness:.4 }), .18, .052, -.12); }
  if (kind === 'b'){ roundTable(); addM(g, new THREE.CylinderGeometry(.34, .34, .005, 40), M('#ffffff', { map:plaidTex('#f3ead9', '#c8352e', '#2f7a4a') }), 0, .655);
    const pot = new THREE.Group(); pot.position.set(-.12, .66, -.05); g.add(pot); const pm = new THREE.MeshPhysicalMaterial({ color:'#fbf8f2', roughness:.15, clearcoat:1 }); addM(pot, new THREE.LatheGeometry([[0, 0], [.09, .01], [.13, .08], [.12, .16], [.06, .2], [0, .2]].map(([r, y]) => new THREE.Vector2(r, y)), 32), pm); addM(pot, new THREE.SphereGeometry(.03, 12, 8), pm, 0, .22); addM(pot, new THREE.TorusGeometry(.06, .015, 8, 20, Math.PI), pm, -.15, .1, 0, 0, 0, Math.PI / 2); addM(pot, new THREE.CylinderGeometry(.018, .028, .14, 10), pm, .17, .12, 0, 0, 0, -.9); addM(pot, new THREE.TorusGeometry(.12, .012, 8, 32), M('#c8352e'), 0, .1, 0, Math.PI / 2);
    for (const [x, z] of [[.2, .12], [.08, .22]]){ addM(g, new THREE.CylinderGeometry(.08, .06, .012, 24), pm, x, .665, z); addM(g, new THREE.LatheGeometry([[0, 0], [.03, 0], [.05, .02], [.055, .07], [0, .07]].map(([r, y]) => new THREE.Vector2(r, y)), 24), pm, x, .67, z); addM(g, new THREE.CylinderGeometry(.048, .048, .005, 20), M('#a85a2a', { roughness:.2 }), x, .735, z); addM(g, new THREE.TorusGeometry(.02, .006, 6, 12), pm, x + .055, .705, z); }
    const cake = makeDeco('s11', .12); cake.position.set(.18, .66, -.16); cake.rotation.y = .6; g.add(cake); }
  if (kind === 'c'){ const ch = new THREE.Group(); ch.rotation.y = -.7; g.add(ch); const cw = M('#9a6a3e', { roughness:.55 });
    for (const s of [-1, 1]){ addM(ch, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s * .25, .03, -.38), new THREE.Vector3(s * .25, .0, 0), new THREE.Vector3(s * .25, .04, .35)]), 20, .025, 8), cw); addM(ch, new THREE.CylinderGeometry(.025, .025, .42, 8), cw, s * .25, .22, .22); addM(ch, new THREE.CylinderGeometry(.025, .025, 1.05, 8), cw, s * .25, .52, -.24, -.18); addM(ch, new THREE.CylinderGeometry(.02, .02, .4, 8), cw, s * .25, .62, .05, Math.PI / 2 - .1); }
    addM(ch, RB(.56, .06, .5, .02), cw, 0, .42, 0); for (let i = 0; i < 5; i++) addM(ch, new THREE.CylinderGeometry(.015, .015, .5, 6), cw, -.2 + i * .1, .72, -.3, -.18); addM(ch, RB(.56, .06, .06, .02), cw, 0, 1.02, -.36, -.18);
    addM(ch, RB(.5, .08, .44, .04), M('#c8352e', { roughness:.9 }), 0, .48, .02); const bl = new THREE.PlaneGeometry(.55, .7, 10, 14), bp = bl.attributes.position; for (let i = 0; i < bp.count; i++){ const y = bp.getY(i); bp.setZ(i, y > 0 ? -y * .55 : 0); bp.setY(i, y > 0 ? .35 * (1 - .4) + y * .55 : y); } bl.computeVertexNormals();
    addM(ch, bl, M('#ffffff', { map:knitTexR('#f3ead9', '#3a8a52'), side:THREE.DoubleSide, roughness:1 }), 0, .55, -.05, -.25); blobIn(g, 0, 0, 1.0, 1.0, .6); }
  return g; }

/* 床のおもちゃ（3種）。位置はラグの上 */
function toys(kind){ const g = new THREE.Group();
  if (kind === 'a'){ const h = makeDeco('horse', .5); h.rotation.y = -.5; g.add(h); blobIn(g, 0, 0, .7, .5, .6); }
  if (kind === 'b'){ const curve = new THREE.CatmullRomCurve3(new THREE.EllipseCurve(0, 0, .55, .3).getPoints(64).slice(0, -1).map(p => new THREE.Vector3(p.x, 0, p.y)), true); for (const o of [-.03, .03]){ const m = addM(g, new THREE.TubeGeometry(curve, 120, .012, 4, true), M('#8a8e98', { metalness:.6, roughness:.3 }), 0, .012, 0); m.scale.set(1 + o, 1, 1 + o * 1.6); m.castShadow = false; }
    for (let i = 0; i < 22; i++){ const p = curve.getPoint(i / 22), t = curve.getTangent(i / 22); addM(g, RB(.03, .012, .13, .004), M('#7a4a2a'), p.x, .006, p.z, 0, Math.atan2(t.x, t.z)); }
    const t = makeDeco('c3', .26); t.position.set(.1, .02, .3); t.rotation.y = 0; g.add(t); const b = makeDeco('w6', .26); b.position.set(-.75, 0, .35); g.add(b); blobIn(g, 0, 0, 1.4, .9, .5); }
  if (kind === 'c'){ const b = new THREE.Group(); b.rotation.y = -.3; g.add(b); const fm = std('#b8783e', { roughness:1 }), lm = std('#e8c8a0', { roughness:1 });
    addM(b, new THREE.SphereGeometry(.16, 24, 16), fm, 0, .17, 0, 0, 0, 0, 1, 1.1, .9); addM(b, new THREE.SphereGeometry(.13, 24, 16), fm, 0, .42); addM(b, new THREE.SphereGeometry(.06, 16, 10), lm, 0, .4, .11, 0, 0, 0, 1, .8, .7); addM(b, new THREE.SphereGeometry(.018, 10, 8), M('#2a1a10', { roughness:.2 }), 0, .42, .155);
    for (const s of [-1, 1]){ addM(b, new THREE.SphereGeometry(.05, 16, 10), fm, s * .1, .53, -.01); addM(b, new THREE.SphereGeometry(.028, 12, 8), lm, s * .1, .53, .02); addM(b, new THREE.SphereGeometry(.018, 10, 8), M('#2a1a10', { roughness:.2 }), s * .05, .46, .11); addM(b, new THREE.SphereGeometry(.06, 16, 10), fm, s * .17, .2, .06, 0, 0, s * .5, .8, 1.4, .8); addM(b, new THREE.SphereGeometry(.065, 16, 10), fm, s * .09, .05, .12, 0, 0, 0, .9, .7, 1.3); addM(b, new THREE.CircleGeometry(.04, 16), lm, s * .09, .05, .2); }
    addM(b, new THREE.TorusGeometry(.07, .02, 8, 16), M('#c8352e', { roughness:.5 }), -.05, .32, .1, 0, .3, .5, 1, .6, .6); addM(b, new THREE.TorusGeometry(.07, .02, 8, 16), M('#c8352e', { roughness:.5 }), .05, .32, .1, 0, -.3, -.5, 1, .6, .6); blobIn(g, 0, 0, .5, .5, .6);
    const p = makeDeco('gift', .18); p.position.set(-.35, 0, .2); p.rotation.y = .5; g.add(p); blobIn(g, -.35, .2, .3, .3, .5); }
  return g; }

/* ラグ（3種） */
function rugItem(kind){ const g = new THREE.Group();
  if (kind === 'a'){ const tex = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#f3ead9'; c.fillRect(0, 0, w, h); c.fillStyle = '#3f8a52'; c.fillRect(28, 28, w - 56, h - 56); c.fillStyle = '#f3ead9'; c.fillRect(46, 46, w - 92, h - 92); c.fillStyle = '#c8352e'; for (let x = 70; x < w - 60; x += 44) for (let y = 70; y < h - 60; y += 44){ c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-8, -8, 16, 16); c.restore(); } c.strokeStyle = '#d9a441'; c.lineWidth = 6; c.strokeRect(16, 16, w - 32, h - 32); });
    const sh = new THREE.Shape(); const w = 2.4, d = 1.6, r = .18; sh.moveTo(-w / 2 + r, -d / 2); sh.lineTo(w / 2 - r, -d / 2); sh.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); sh.lineTo(w / 2, d / 2 - r); sh.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); sh.lineTo(-w / 2 + r, d / 2); sh.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); sh.lineTo(-w / 2, -d / 2 + r); sh.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
    const geo = planarUV(new THREE.ExtrudeGeometry(sh, { depth:.03, bevelEnabled:true, bevelSize:.02, bevelThickness:.01, bevelSegments:2 })); const m = addM(g, geo, M('#ffffff', { map:tex }), 0, 0, 0, -Math.PI / 2); m.castShadow = false; }
  if (kind === 'b'){ const tex = canvasTex(512, 512, (c, w, h) => { const cols = ['#c8352e', '#f3ead9', '#3f8a52', '#f3ead9', '#e8b84a', '#f3ead9']; for (let r = 256, i = 0; r > 12; r -= 18, i++){ c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(256, 256, r, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; for (let a = 0; a < 7; a += .12){ c.beginPath(); c.arc(256, 256, r - 9, a, a + .06); c.stroke(); } } });
    const m = addM(g, new THREE.CylinderGeometry(1.0, 1.0, .03, 64), M('#ffffff', { map:tex, roughness:.95 }), 0, .015, 0); m.castShadow = false; m.scale.set(1.15, 1, .85); }
  if (kind === 'c'){ const tex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#f8f4ec'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++){ const v = 225 + Math.random() * 30 | 0; c.strokeStyle = `rgb(${v},${v - 4},${v - 10})`; c.lineWidth = 1.2; const x = Math.random() * w, y = Math.random() * h, a = Math.random() * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); c.stroke(); } }, [3, 3]);
    const geo = new THREE.SphereGeometry(1, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++){ const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), r = 1 + .05 * Math.sin(a * 13) + .03 * Math.sin(a * 29); p.setX(i, x * r); p.setZ(i, z * r); } geo.computeVertexNormals();
    const m = addM(g, geo, M('#ffffff', { map:tex, roughness:1 }), 0, 0, 0, 0, 0, 0, 1.25, .06, .82); m.castShadow = false; }
  blobIn(g, 0, 0, 3.0, 2.1, .3); return g; }

/* ツリーの足もと（3種）。ツリーの中心に置く */
function treeBase(kind){ const g = new THREE.Group();
  if (kind === 'a'){ addM(g, new THREE.CylinderGeometry(1.05, 1.1, .03, 64), M('#c8352e', { roughness:.9 }), 0, .015); addM(g, new THREE.TorusGeometry(1.08, .06, 12, 72), M('#fbfbf6', { roughness:1 }), 0, .04, 0, Math.PI / 2); for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2; const s = new THREE.Shape(); for (let k = 0; k < 10; k++){ const aa = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .025 : .055; k ? s.lineTo(Math.cos(aa) * r, Math.sin(aa) * r) : s.moveTo(Math.cos(aa) * r, Math.sin(aa) * r); } addM(g, new THREE.ShapeGeometry(s), M('#f2c14e', { roughness:.4, metalness:.4 }), Math.cos(a) * .82, .035, Math.sin(a) * .82, -Math.PI / 2); } }
  if (kind === 'b'){ const tex = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#b8864a'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16){ c.fillStyle = ((x + y) / 16) % 2 ? '#d8a868' : '#a8763a'; c.fillRect(x + 1, y + 1, 14, 14); } }, [8, 2]); addM(g, new THREE.CylinderGeometry(.66, .58, .62, 40, 1, true), M('#ffffff', { map:tex, roughness:.9, side:THREE.DoubleSide }), 0, .31); addM(g, new THREE.TorusGeometry(.66, .04, 10, 48), M('#8a5a2a'), 0, .62, 0, Math.PI / 2); addM(g, new THREE.TorusGeometry(.58, .035, 10, 48), M('#8a5a2a'), 0, .02, 0, Math.PI / 2); addM(g, new THREE.TorusGeometry(.645, .03, 8, 48), M('#c8352e', { roughness:.5 }), 0, .4, 0, Math.PI / 2); }
  if (kind === 'c'){ const geo = new THREE.SphereGeometry(1, 48, 12, 0, Math.PI * 2, 0, Math.PI / 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++){ const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x); p.setX(i, x * (1 + .06 * Math.sin(a * 9))); p.setZ(i, z * (1 + .06 * Math.sin(a * 9))); } geo.computeVertexNormals(); addM(g, geo, snowMat, 0, 0, 0, 0, 0, 0, 1.05, .1, 1.05);
    for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2 + .3; addM(g, new THREE.SphereGeometry(.12, 16, 10), snowMat, Math.cos(a) * .8, .05, Math.sin(a) * .8, 0, 0, 0, 1, .55, 1); } for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; const b = makeDeco(i % 2 ? 'pine' : 'c13', .12); b.position.set(Math.cos(a) * .95, .02, Math.sin(a) * .95); g.add(b); } }
  return g; }


/* 左の壁ぎわ（3種）：+z が部屋の内側 */
function shelfSpot(kind){ const g = new THREE.Group(); const wd = M('#9a6236', { roughness:.55 }), wd2 = M('#7a4626', { roughness:.6 });
  if (kind === 'a'){ // 食器棚
    addM(g, RB(1.1, .86, .5, .03), wd, 0, .43, .25); for (const s of [-1, 1]){ addM(g, RB(.5, .66, .03, .02), wd2, s * .26, .45, .51); addM(g, new THREE.SphereGeometry(.025, 10, 8), M('#d9b45a', { metalness:.6, roughness:.3 }), s * .06, .5, .54); }
    addM(g, RB(1.18, .05, .56, .02), wd2, 0, .885, .27); addM(g, RB(1.04, 1.0, .06, .02), wd, 0, 1.41, .03); for (const s of [-1, 1]) addM(g, RB(.06, 1.0, .3, .02), wd, s * .5, 1.41, .15); addM(g, RB(1.14, .08, .34, .02), wd2, 0, 1.94, .17);
    for (const y of [1.22, 1.58]) addM(g, RB(1.0, .035, .28, .01), wd, 0, y, .15);
    const plate = (c, x, y) => { const p = addM(g, new THREE.CylinderGeometry(.12, .12, .018, 28), M('#fbf8f2', { roughness:.25 }), x, y + .12, .1, Math.PI / 2 - .2); addM(g, new THREE.TorusGeometry(.095, .01, 6, 28), M(c, { roughness:.4 }), x, y + .12, .115, -.2); };
    [-.32, -.06, .2].forEach((x, i) => plate(['#c8352e', '#3f8a52', '#3a6ab8'][i], x, 1.24)); for (const x of [-.3, -.12, .06, .24]){ addM(g, new THREE.CylinderGeometry(.04, .035, .09, 16), M(['#c8352e', '#fbf8f2', '#3f8a52', '#fbf8f2'][Math.round((x + .3) / .18)], { roughness:.3 }), x, 1.645, .17); }
    const gm = [M('#2f7a4a', { roughness:.8 }), M('#3f9058', { roughness:.8 })]; for (let i = 0; i < 26; i++){ const x = -.55 + i / 25 * 1.1; addM(g, new THREE.ConeGeometry(.045, .16, 6), gm[i % 2], x, 2.0 + (i % 3) * .015, .2 + (i % 2) * .05, (i % 3 - 1) * .5, 0, Math.PI / 2 + (i % 5 - 2) * .3); }
    for (const x of [-.36, 0, .36]) addM(g, new THREE.SphereGeometry(.03, 10, 8), M('#c8352e', { roughness:.25 }), x, 2.02, .3); }
  if (kind === 'b'){ // 本棚
    addM(g, RB(.95, 1.62, .06, .02), wd2, 0, .81, .03); for (const s of [-1, 1]) addM(g, RB(.06, 1.62, .36, .02), wd, s * .45, .81, .18); for (const y of [.04, .55, 1.06, 1.6]) addM(g, RB(.96, .05, .36, .015), wd, 0, y, .18);
    const cols = ['#c8352e', '#2f5a8a', '#3f8a52', '#e8b84a', '#6a3e8a', '#f3ead9', '#a8483a', '#2a6a6a'];
    for (const [y0, n] of [[.065, 11], [.575, 9], [1.085, 7]]){ let x = -.4; for (let i = 0; i < n && x < .38; i++){ const w = .045 + ((i * 7 + y0 * 100) % 4) * .012, h = .3 + ((i * 5 + y0 * 50) % 5) * .035; addM(g, RB(w, h, .24, .008), M(cols[(i * 3 + Math.round(y0 * 10)) % cols.length], { roughness:.6 }), x + w / 2, y0 + h / 2, .18, 0, 0, i === n - 1 ? -.25 : 0); x += w + .006; } }
    const t = makeDeco('c15', .3); t.position.set(.25, 1.625, .18); g.add(t); const c = makeDeco('c6', .18); c.position.set(-.22, 1.625, .2); g.add(c); g.userData.candle = glowIn(g, '#ffd890', .35, .55, -.22, 1.8, .22); const gl = makeDeco('w6', .18); gl.position.set(.25, .58, .22); g.add(gl); }
  if (kind === 'c'){ // 柱時計
    const cw = M('#7a4626', { roughness:.4 }); addM(g, RB(.56, .3, .4, .04), cw, 0, .15, .22); addM(g, RB(.46, 1.1, .32, .03), cw, 0, .85, .2); addM(g, RB(.58, .56, .42, .05), cw, 0, 1.68, .22); addM(g, RB(.62, .08, .46, .02), M('#5a3218'), 0, 1.98, .22);
    addM(g, RB(.3, .7, .02, .01), new THREE.MeshPhysicalMaterial({ color:'#e8f2ff', roughness:.05, transparent:true, opacity:.25 }), 0, .88, .37);
    const pend = new THREE.Group(); pend.position.set(0, 1.25, .3); g.add(pend); addM(pend, new THREE.CylinderGeometry(.008, .008, .5, 6), M('#d9b45a', { metalness:.7, roughness:.3 }), 0, -.25, 0); addM(pend, new THREE.CylinderGeometry(.08, .08, .02, 24), M('#d9b45a', { metalness:.7, roughness:.25 }), 0, -.55, 0, Math.PI / 2); g.userData.pend = pend;
    const face = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2a1e'; c.font = 'bold 32px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++){ const a = i / 12 * Math.PI * 2; c.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], w / 2 + Math.sin(a) * 92, h / 2 - Math.cos(a) * 92); } c.strokeStyle = '#3a2a1e'; c.lineCap = 'round'; c.lineWidth = 7; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 46, 128 + 20); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 - 8, 128 - 82); c.stroke(); });
    addM(g, new THREE.CircleGeometry(.2, 40), M('#ffffff', { map:face, roughness:.5 }), 0, 1.68, .435); addM(g, new THREE.TorusGeometry(.2, .02, 8, 40), M('#d9b45a', { metalness:.7, roughness:.3 }), 0, 1.68, .435);
    const h = makeDeco('c12', .24); h.position.set(.1, 2.02, .3); h.rotation.z = -.3; g.add(h); }
  blobIn(g, 0, .3, 1.3, .8, .6); return g; }

/* 右の壁ぎわ（3種）：+z が部屋の内側 */
function sofaSpot(kind){ const g = new THREE.Group();
  if (kind === 'a'){ // 赤いソファ
    const v = M('#b8302c', { roughness:.75 }), v2 = M('#a42824', { roughness:.75 }); addM(g, RB(1.6, .36, .8, .08), v, 0, .32, .42); addM(g, RB(1.6, .62, .24, .1), v, 0, .74, .12, -.1);
    for (const s of [-1, 1]){ addM(g, RB(.2, .5, .82, .09), v2, s * .8, .5, .42); addM(g, new THREE.CylinderGeometry(.11, .11, .82, 20), v2, s * .8, .78, .42, Math.PI / 2); }
    for (const s of [-1, 1]) addM(g, RB(.68, .14, .62, .07), v, s * .35, .56, .5); for (const [x, z] of [[-.7, .14], [.7, .14], [-.7, .74], [.7, .74]]) addM(g, new THREE.CylinderGeometry(.03, .02, .14, 10), M('#5a3218'), x, .07, z);
    addM(g, RB(.4, .38, .14, .07), M('#ffffff', { map:plaidTex('#2f7a4a', '#c8352e', '#f2c14e'), roughness:.9 }), -.45, .82, .3, -.25, 0, .15); addM(g, RB(.36, .34, .13, .07), M('#fbf6ea', { roughness:.95 }), .48, .8, .3, -.2, 0, -.12);
    const bl = new THREE.PlaneGeometry(.5, .9, 8, 16), bp = bl.attributes.position; for (let i = 0; i < bp.count; i++){ const y = bp.getY(i); bp.setZ(i, y > .15 ? 0 : y < -.25 ? (y + .25) * .2 : 0); bp.setY(i, y); } bl.computeVertexNormals(); const b = addM(g, bl, M('#ffffff', { map:knitTexR('#f3ead9', '#c8352e'), side:THREE.DoubleSide, roughness:1 }), .62, .58, .82, -1.2); b.rotation.order = 'YXZ'; }
  if (kind === 'b'){ // ひとりがけ＋サイドテーブル
    const ch = new THREE.Group(); ch.position.set(-.2, 0, .45); g.add(ch); const v = M('#2f6a4a', { roughness:.6 }), v2 = M('#285c40', { roughness:.6 });
    addM(ch, RB(.8, .34, .74, .08), v, 0, .3, 0); addM(ch, RB(.82, .78, .2, .1), v, 0, .8, -.32, -.12); for (const s of [-1, 1]){ addM(ch, RB(.16, .42, .74, .08), v2, s * .42, .55, 0); addM(ch, new THREE.CylinderGeometry(.1, .1, .74, 20), v2, s * .42, .76, 0, Math.PI / 2); }
    addM(ch, RB(.62, .14, .58, .07), v, 0, .53, .05); for (const [x, z] of [[-.35, -.3], [.35, -.3], [-.35, .3], [.35, .3]]) addM(ch, new THREE.CylinderGeometry(.03, .02, .14, 10), M('#5a3218'), x, .07, z); addM(ch, RB(.36, .34, .13, .07), M('#ffffff', { map:plaidTex('#c8352e', '#2f5a8a', '#f2c14e'), roughness:.9 }), 0, .8, -.16, -.25);
    const st = new THREE.Group(); st.position.set(.58, 0, .45); g.add(st); const wd = M('#a8703e', { roughness:.5 }); addM(st, new THREE.CylinderGeometry(.22, .22, .04, 32), wd, 0, .56); for (let i = 0; i < 3; i++){ const a = i / 3 * Math.PI * 2; addM(st, new THREE.CylinderGeometry(.018, .014, .56, 8), wd, Math.cos(a) * .14, .28, Math.sin(a) * .14, Math.sin(a) * .2, 0, -Math.cos(a) * .2); }
    const mug = makeDeco('s9', .14); mug.position.set(-.05, .58, .02); st.add(mug); const bk = addM(st, RB(.16, .03, .22, .005), M('#2f5a8a', { roughness:.6 }), .08, .595, -.05, 0, .4); blobIn(g, .58, .45, .55, .55, .5); }
  if (kind === 'c'){ // 木のベンチとクッション
    const wd = M('#b07a48', { roughness:.55 }); addM(g, RB(1.5, .08, .5, .02), wd, 0, .44, .35); for (const s of [-1, 1]){ addM(g, RB(.08, .44, .44, .02), wd, s * .66, .22, .35); } addM(g, RB(1.5, .06, .06, .02), wd, 0, .9, .1); for (const x of [-.66, -.22, .22, .66]) addM(g, RB(.06, .5, .05, .01), wd, x, .66, .1);
    addM(g, RB(1.3, .1, .44, .05), M('#ffffff', { map:knitTexR('#c8352e', '#fbf6ea'), roughness:1 }), 0, .53, .36); addM(g, RB(.38, .36, .13, .07), M('#3f8a52', { roughness:.9 }), -.4, .72, .2, -.2, 0, .1); addM(g, RB(.34, .32, .12, .07), M('#fbf6ea', { roughness:.95 }), .1, .7, .2, -.2, 0, -.1);
    const p = makeDeco('gift', .22); p.position.set(.5, .58, .35); p.rotation.y = .4; g.add(p); const p2 = makeDeco('gift', .16); p2.position.set(.5, 0, .7); g.add(p2); const pc = makeDeco('pine', .14); pc.position.set(-.1, 0, .7); g.add(pc); }
  blobIn(g, 0, .45, 1.9, 1.1, .6); return g; }

/* 暖炉と右の壁のあいだ（3種） */
function lampSpot(kind){ const g = new THREE.Group(); g.userData.lamp = null;
  if (kind === 'a'){ // フロアランプ
    const br = M('#c8a060', { metalness:.6, roughness:.3 }); addM(g, new THREE.CylinderGeometry(.18, .2, .04, 32), br, 0, .02); addM(g, new THREE.CylinderGeometry(.018, .018, 1.55, 10), br, 0, .8);
    const sh = addM(g, new THREE.CylinderGeometry(.16, .28, .34, 32, 1, true), new THREE.MeshStandardMaterial({ color:'#f8e8c8', emissive:'#ffcf80', emissiveIntensity:.55, side:THREE.DoubleSide, roughness:.9 }), 0, 1.66); sh.castShadow = false;
    addM(g, new THREE.TorusGeometry(.28, .012, 6, 32), M('#c8352e'), 0, 1.49, 0, Math.PI / 2); g.userData.lamp = [0, 1.6, 0]; glowIn(g, '#ffd890', 1.0, .45, 0, 1.6, .05); }
  if (kind === 'b'){ // 燭台スタンド
    const ir = M('#2a2a2e', { metalness:.5, roughness:.4 }); addM(g, new THREE.CylinderGeometry(.16, .2, .05, 24), ir, 0, .025); addM(g, new THREE.CylinderGeometry(.02, .02, 1.1, 8), ir, 0, .6);
    addM(g, new THREE.TorusGeometry(.22, .015, 6, 24, Math.PI), ir, 0, 1.15, 0, Math.PI, 0, 0); for (const x of [-.22, 0, .22]){ const y = x ? 1.15 : 1.2; addM(g, new THREE.CylinderGeometry(.05, .03, .04, 12), ir, x, y, 0); addM(g, new THREE.CylinderGeometry(.03, .03, .2, 16), M('#fbf2e2', { roughness:.6 }), x, y + .12, 0); addM(g, new THREE.ConeGeometry(.016, .06, 10), new THREE.MeshBasicMaterial({ color:'#ffc040' }), x, y + .26, 0); glowIn(g, '#ffd27a', .4, .7, x, y + .27, .03); }
    const w = makeDeco('c9', .26); w.position.set(0, .62, .03); g.add(w); g.userData.lamp = [0, 1.4, 0]; }
  if (kind === 'c'){ // 鉢植えのヒイラギの木
    addM(g, new THREE.LatheGeometry([[0, 0], [.2, 0], [.24, .3], [.26, .32], [0, .32]].map(([r, y]) => new THREE.Vector2(r, y)), 32), M('#fbf6ea', { roughness:.35 })); addM(g, new THREE.TorusGeometry(.25, .025, 8, 32), M('#c8352e', { roughness:.4 }), 0, .2, 0, Math.PI / 2);
    addM(g, new THREE.CylinderGeometry(.03, .04, .5, 8), M('#6a4630'), 0, .55); const lm = [M('#2f6a3a', { roughness:.5 }), M('#3a8048', { roughness:.5 })];
    for (let i = 0; i < 60; i++){ const u = i / 60, a = i * 2.39996, r = .32 * Math.sqrt(1 - Math.pow(u * 2 - 1, 2)) + .05, y = .75 + u * .8; addM(g, new THREE.SphereGeometry(.07, 8, 6), lm[i % 2], Math.cos(a) * r, y, Math.sin(a) * r, a, a * 2, 0, 1, .4, .7); }
    for (let i = 0; i < 16; i++){ const u = (i + .5) / 16, a = i * 2.1 + 1, r = .34 * Math.sqrt(1 - Math.pow(u * 2 - 1, 2)) + .08; addM(g, new THREE.SphereGeometry(.028, 10, 8), M('#d8202a', { roughness:.2 }), Math.cos(a) * r, .75 + u * .8, Math.sin(a) * r); }
    bulbsIn(g, Array.from({ length:12 }, (_, i) => { const u = (i + .5) / 12, a = i * 1.7, r = .36 * Math.sqrt(1 - Math.pow(u * 2 - 1, 2)) + .08; return [Math.cos(a) * r, .75 + u * .8, Math.sin(a) * r]; }), .02); }
  blobIn(g, 0, 0, .7, .7, .6); return g; }

/* 12/25の特別：ツリーのまわりに金色のきらきら */
function sparkle(){ const g = new THREE.Group(); const n = 90, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++){ const a = Math.random() * 7, r = .6 + Math.random() * .9, y = .3 + Math.random() * 3.2; pos[i * 3] = Math.cos(a) * r * (1 - y / 4); pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * r * (1 - y / 4); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color:'#ffe08a', size:.09, map:glowTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending })); g.add(pts); g.userData.sparkle = pts; const st = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .18 : .42; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const sm = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth:.08, bevelEnabled:true, bevelThickness:.05, bevelSize:.04, bevelSegments:3 }), M('#f2c14e', { metalness:.7, roughness:.25, emissive:'#a86a10', emissiveIntensity:.4 })); sm.visible = false; sm.userData.thumbOnly = true; g.add(sm); return g; }

/* 場所ごとの作り方（種類は FURN_ITEMS の順） */
const BUILD = {
  topper:k => treeTopper('abc'[k]), treelights:k => treeLights('abc'[k]), garland:k => treeGarland('abc'[k]),
  fireplace:k => fireplace(['stone', 'brick', 'white'][k]), stockings:k => stockings(['felt', 'knit', 'plaid'][k]), mantel:k => mantelTop('abc'[k]), wall:k => wallDeco('abc'[k]),
  curtain:k => curtains('abc'[k]), wintop:k => winTop('abc'[k]), sill:k => sillDeco('abc'[k]), outside:k => outsideDeco('abc'[k]), table:k => tableSpot('abc'[k]), toys:k => toys('abc'[k]),
  rug:k => rugItem('abc'[k]), treebase:k => treeBase('abc'[k]), shelf:k => shelfSpot('abc'[k]), sofa:k => sofaSpot('abc'[k]), lamp:k => lampSpot('abc'[k]), special:() => sparkle(),
};
function buildFurn(key){ const it = FURN_BY[key]; if (!it) return null; const g = BUILD[it.slot](it.k); g.userData.key = key; return g; }
// 置き場所：[x, y, z, 向き]
const ANCHOR = { fireplace:[FPX, 0, bz], stockings:[FPX, FPH, bz], mantel:[FPX, FPH + .12, bz + .2], wall:[FPX, FPH + .2, bz + .05], curtain:[WX, WY, bz], wintop:[WX, WY + WH / 2 + .2, bz + .3], sill:[WX, WY - WH / 2 - .12, bz], outside:[WX + .15, .6, bz - .02 - 2.7],
  table:[1.05, 0, -.55], toys:[.05, 0, .95], rug:[.15, 0, .35], shelf:[-RW / 2 + .32, 0, .45, Math.PI / 2 - .6], sofa:[RW / 2 - .1, 0, .75, -Math.PI / 2 + .2], lamp:[1.98, 0, -1.55], treebase:null, special:null, topper:null, treelights:null, garland:null };
const NEEDS_FP = { stockings:1, mantel:1 };
const mounted = {};
function disposeG(o){ o.traverse(m => { if (m.isMesh || m.isPoints){ m.geometry && m.geometry.dispose(); } }); }
function placeItem(slot, key){ const cur = mounted[slot]; if (cur && cur.userData.key === key) return; if (cur){ (cur.parent || scene).remove(cur); disposeG(cur); delete mounted[slot]; }
  if (!key || !FURN_BY[key]) return; const g = buildFurn(key);
  if (TREE_PARTS.includes(slot)){ tree.add(g); mounted[slot] = g; return; }
  if (slot === 'treebase' || slot === 'special'){ g.position.set(tree.position.x, 0, tree.position.z); if (slot === 'treebase') g.scale.setScalar(tree.scale.x); }
  else { const a = ANCHOR[slot]; g.position.set(a[0], a[1], a[2]); g.rotation.y = a[3] || 0; }
  scene.add(g); mounted[slot] = g; }
function setRoom(sel){ sel = sel || {}; const fp = sel.fireplace; for (const [slot] of FURN_SLOTS){ let k = sel[slot]; if (TREE_PARTS.includes(slot) && k === undefined) k = slot + '_a'; if (k === 'none') k = null; if (NEEDS_FP[slot] && !fp) k = null; placeItem(slot, k); }
  const f = mounted.fireplace; flames = f ? f.userData.fire.fl : []; fireGlow = f ? f.userData.fire.gw : null;
  const lp = mounted.lamp, ll = lp && lp.userData.lamp; if (ll){ lampLight.position.copy(lp.localToWorld(new THREE.Vector3(...ll))); } lampOn = !!ll;
  const ou = mounted.outside, kl = ou && ou.userData.kama; if (kl) kamaLight.position.copy(ou.localToWorld(new THREE.Vector3(...kl))); kamaOn = !!kl;
  applyTime(); shadowsDirty = true; }
let lampOn = false, kamaOn = false;


/* 家具のサムネイル */
let thR = null, thS = null, thC = null; const thCache = {};
function thumbFurn(key){ if (thCache[key]) return thCache[key];
  if (!thR){ thR = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true }); thR.setPixelRatio(1); thR.setSize(200, 200); thR.outputColorSpace = THREE.SRGBColorSpace; thR.toneMapping = THREE.NeutralToneMapping;
    thS = new THREE.Scene(); thS.environment = scene.environment; thS.environmentIntensity = .5; thS.add(new THREE.HemisphereLight('#fff1dc', '#b98a6a', 1.5)); const d = new THREE.DirectionalLight('#fff4e0', 2.2); d.position.set(-2, 5, 5); thS.add(d); thC = new THREE.PerspectiveCamera(28, 1, .01, 100); }
  const g = buildFurn(key); if (!g) return ''; const drop = []; g.traverse(m => { if (m.material && m.material.map === blobTex) drop.push(m); }); g.traverse(m => { if (m.userData.thumbOnly){ m.visible = true; m.position.y = 1.8; } }); drop.forEach(m => m.parent.remove(m));
  if (FURN_BY[key].slot === 'treelights' || FURN_BY[key].slot === 'garland'){ tree.children.forEach(m => { if (m.isMesh && m.material === tierMat){ const c = m.clone(); c.userData.thumbTree = 1; g.add(c); } }); }
  if (FURN_BY[key].slot === 'topper'){ const top = tree.children.find(m => m.isMesh && m.material === tierMat && m.position.y === TIERS[4][0]); if (top){ const c = top.clone(); c.scale.setScalar(.6); c.position.y = -TIERS[4][2] * .6 - .02; g.add(c); } }
  thS.add(g); g.updateMatrixWorld(true); const box = new THREE.Box3(); g.traverse(m => { if (m.isMesh && !(m.material && m.material.blending === THREE.AdditiveBlending)) box.expandByObject(m); }); if (box.isEmpty()) box.setFromObject(g);
  const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2; const flat = FURN_BY[key].slot === 'rug' || FURN_BY[key].slot === 'treebase', dir = new THREE.Vector3(.35, flat ? 1.3 : .45, 1).normalize();
  thC.position.copy(c).addScaledVector(dir, r / Math.sin(THREE.MathUtils.degToRad(14))); thC.lookAt(c); thR.render(thS, thC); const url = thR.domElement.toDataURL('image/png');
  thS.remove(g); disposeG(g); thCache[key] = url; return url; }

/* ---------- 光 ---------- */
const hemi = new THREE.HemisphereLight('#fff1dc', '#b98a6a', 1.1); scene.add(hemi);
const key = new THREE.DirectionalLight('#ffe2bd', 2.2); key.position.set(-3, 8, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -.0005; key.shadow.normalBias = .02;
Object.assign(key.shadow.camera, { left:-3.5, right:3.5, top:4.5, bottom:-2, near:1, far:20 }); scene.add(key);
const treeLight = new THREE.PointLight('#ffd890', 1.2, 3.2); treeLight.position.set(tree.position.x + .4, 1.8, tree.position.z + 1); scene.add(treeLight);
let isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
function applyTime(){ hemi.intensity = isNight ? .75 : 1.1; key.intensity = isNight ? 1.2 : 2.2; key.color.set(isNight ? '#ffd2a0' : '#ffe2bd'); treeLight.intensity = isNight ? 2.4 : 1.2; winLight.intensity = isNight ? 1.8 : 1.0;
  sky.material.color.set(isNight ? '#ffffff' : '#a8c8ff'); outLight.intensity = isNight ? .25 : 1.4; snowMat.color.set(isNight ? '#8e9cd0' : '#f4f8ff'); pineM.color.set(isNight ? '#1e3a3a' : '#2e5a48'); snowPts.material.opacity = isNight ? 1 : .8; fireLight.intensity = flames.length ? (isNight ? 5.5 : 3.5) : 0; lampLight.intensity = lampOn ? (isNight ? 3.2 : 1.6) : 0; kamaLight.intensity = kamaOn ? 1.4 : 0; shadowsDirty = true; }

/* ---------- 初期状態 ---------- */
let shadowsDirty = true;
setRoom(opts.room || {});
applyTime();

/* ---------- 描画（必要なときだけ。電球と星のゆらぎは30fps） ---------- */
renderer.shadowMap.autoUpdate = false;
let last = 0, stopped = false;
function frame(now){
  requestAnimationFrame(frame);
  if (document.hidden || stopped || now - last < 33) return; last = now;
  for (let k = appear.length - 1; k >= 0; k--){ const a = appear[k], t = Math.min(1, (now - a.t0) / 420), s = t < 1 ? 1 + 1.7 * Math.pow(t - 1, 3) + .7 * Math.pow(t - 1, 2) : 1; const bs = a.o.userData.base || 1; a.o.scale.setScalar(Math.max(.001, s * bs)); if (t >= 1){ a.o.scale.setScalar(bs); appear.splice(k, 1); shadowsDirty = true; } }
  if (!drag && Math.abs(spin) > .0004){ tree.rotation.y += spin; spin *= .93; shadowsDirty = true; if (Math.abs(spin) <= .0004 && opts.onRot) opts.onRot(tree.rotation.y); }
  // 回したときの振り子：回転の加速で横にふれ、速さで外へ広がる
  { const fdt = Math.min(.1, (now - (frame.prevT || now)) / 1000) || .033; frame.prevT = now; const rot = tree.rotation.y, w = (rot - (frame.prevRot ?? rot)) / fdt, acc = (w - (frame.prevW ?? w)) / fdt; frame.prevRot = rot; frame.prevW = w;
    placed.forEach(o => { const u = o.userData, r = Math.hypot(o.position.x, o.position.z) || .5, L = .22; u.th = u.th || 0; u.om = u.om || 0;
      const al = -(9.8 / L) * u.th - 3.2 * u.om - THREE.MathUtils.clamp(acc * r, -40, 40) * .22 / L; u.om += al * fdt; u.th = THREE.MathUtils.clamp(u.th + u.om * fdt, -.7, .7);
      const tgt = Math.min(.75, Math.atan(w * w * r / 9.8)); u.tilt = (u.tilt || 0) + (tgt - (u.tilt || 0)) * Math.min(1, fdt * 8);
      const sw = u.swing, dt = sw ? now - sw : 1e9, tap = dt < 2200 ? .55 * Math.exp(-dt / 520) * Math.sin(dt / 85) : 0;
      o.rotation.z = u.rz + .035 * Math.sin(now / 1150 + u.ph) + tap + u.th; o.rotation.x = tap * .35 - u.tilt; }); }
  flames.forEach(o => { const k = 1 + .14 * Math.sin(now / 110 + o.ph) + .08 * Math.sin(now / 47 + o.ph * 2); o.f.scale.set(1 - (k - 1) * .5, k, 1 - (k - 1) * .5); o.f.position.y = .2 + o.h * k / 2; }); if (flames.length){ fireLight.intensity = (isNight ? 5.5 : 3.5) * (1 + .12 * Math.sin(now / 90) + .06 * Math.sin(now / 37)); fireGlow.material.opacity = .6 + .1 * Math.sin(now / 70); }
  for (const g of Object.values(mounted)){ const u = g.userData; if (u.glow) u.glow.material.opacity = .55 + .15 * Math.sin(now / 900); if (u.bulbs) u.bulbs.forEach(b => b.gl.material.opacity = .35 + .3 * (Math.sin(now / 600 + b.ph) * .5 + .5)); if (u.pend) u.pend.rotation.z = .22 * Math.sin(now / 1000 * Math.PI); if (u.sparkle){ u.sparkle.rotation.y = now / 9000; u.sparkle.material.opacity = .6 + .4 * Math.sin(now / 400); } }
  { const a = snowGeo.attributes.position; for (let i = 0; i < snowN; i++){ let y = a.getY(i) - .012; if (y < .6) y = 4.6; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(now / 900 + i) * .0015); } a.needsUpdate = true; }
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
function clearAll(){ usedSlots.clear(); placed.splice(0).forEach(o => tree.remove(o)); gifts.splice(0).forEach(g => { scene.remove(g); scene.remove(g.userData.blob); }); }
let sig = '', lastList = [], lastGifts = [];
function sync(list, giftList){ lastList = list; lastGifts = giftList;
  const s2 = list.map(o => o.id).join(',') + '|' + giftList.map(g => g.id).join(',');
  if (s2 === sig) return; const prev = sig; sig = s2;
  const prevIds = new Set(prev.split('|')[0].split(',').filter(Boolean)), prevG = new Set((prev.split('|')[1] || '').split(',').filter(Boolean));
  const append = list.length >= placed.length && placed.every((o, i) => list[i] && list[i].id === o.userData.id) && gifts.every((g, i) => giftList[i] && giftList[i].id === g.userData.id);
  if (!append) clearAll();
  list.slice(placed.length).forEach(o => addOrnament(append && !!prev && !prevIds.has(o.id), o.id, o.key, o.slot));
  giftList.slice(gifts.length).forEach(g => addGift(append && !!prev && !prevG.has(g.id), g.id));
  shadowsDirty = true;
}
// タップ
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
// ツリーを指で回す（タップとドラッグを区別）
let drag = null, spin = 0; const cv = renderer.domElement; cv.style.touchAction = 'none';
cv.addEventListener('pointerdown', e => { drag = { x:e.clientX, y:e.clientY, last:e.clientX, t:performance.now(), moved:false, onTree:false }; spin = 0; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.last; if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 7) drag.moved = true;
  if (drag.moved){ const now = performance.now(), k = 2 * Math.PI / Math.max(260, cv.clientWidth * .9); tree.rotation.y += dx * k; spin = dx * k / Math.max(8, now - drag.t) * 16; drag.t = now; shadowsDirty = true; } drag.last = e.clientX; });
cv.addEventListener('pointerup', e => { const d = drag; drag = null; if (d && d.moved){ opts.onSpin && opts.onSpin(); opts.onRot && opts.onRot(tree.rotation.y); return; } if (d) tapAt(e); });
cv.addEventListener('pointercancel', () => { drag = null; });
function tapAt(e){ const r = renderer.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera);
  const hit = ray.intersectObjects([...placed, ...gifts], true)[0]; if (hit){ let o = hit.object; while (o && !o.userData.id) o = o.parent; if (o){ if (o.userData.orn) o.userData.swing = performance.now(); else { o.scale.setScalar(.85 * (o.userData.base || 1)); appear.push({ o, t0:performance.now() - 120 }); } opts.onTap && opts.onTap(o.userData.id, !!o.userData.gift); return; } }
  const th = ray.intersectObjects(tree.children, true)[0]; if (th){ tree.rotation.z = .02; setTimeout(() => tree.rotation.z = -.015, 120); setTimeout(() => tree.rotation.z = 0, 260); opts.onTree && opts.onTree(); } }
function ornScreen(i){ const o = placed[i]; if (!o) return null; const v = new THREE.Vector3(); o.children[0].getWorldPosition(v); v.y -= .1; v.project(camera); const r = renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }
const ornRot = i => placed[i] && [+placed[i].userData.th.toFixed(3), +(placed[i].userData.tilt || 0).toFixed(3)];
/* ある日のツリーを写真にする（週の画面用）。いまのツリーはあとで元にもどす */
let snR = null; const snCam = new THREE.PerspectiveCamera(30, 1, .1, 100);
function snapshot(list, giftList, w = 640, h = 720){
  const keepL = lastList, keepG = lastGifts, rot = tree.rotation.y;
  clearAll(); sig = ''; tree.rotation.y = 0; list.forEach(o => addOrnament(false, o.id, o.key, o.slot)); giftList.forEach(g => addGift(false, g.id)); placed.forEach(o => { o.rotation.z = o.userData.rz; o.rotation.x = 0; });
  if (!snR){ snR = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true }); snR.setPixelRatio(1); snR.outputColorSpace = THREE.SRGBColorSpace; snR.toneMapping = THREE.NeutralToneMapping; snR.shadowMap.enabled = true; snR.shadowMap.type = THREE.PCFSoftShadowMap; }
  snR.setSize(w, h); snCam.aspect = w / h; const c = new THREE.Vector3(tree.position.x + .25, 1.45, tree.position.z + .3), dir = new THREE.Vector3(.18, .42, 1).normalize();
  snCam.position.copy(c).addScaledVector(dir, 8.2); snCam.lookAt(c); snCam.updateProjectionMatrix(); scene.updateMatrixWorld(true); snR.render(scene, snCam);
  const url = snR.domElement.toDataURL('image/jpeg', .88);
  clearAll(); sig = ''; tree.rotation.y = rot; sync(keepL, keepG); shadowsDirty = true; return url; }
return { sync, setRoom, snapshot, frontSlot:pickSlot, thumbFurn, ornScreen, ornRot, setNight(n){ if (n !== isNight){ isNight = n; applyTime(); } }, pause(p){ stopped = p; }, resize(){ renderer.setSize(VW(), VH()); placeCamera(); } };
}
