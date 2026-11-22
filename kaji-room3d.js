
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { makeOrnament, makeDeco } from './kaji-orn3d.js';
import { makeMochibana } from './kaji-mochi3d.js';
import { buildTown, buildSleigh } from './kaji-out3d.js';

/* ---------- 家具の一覧（アドベントで手に入る） ---------- */
export const FURN_SLOTS = [['wallpaper', '壁紙'], ['flooring', '床'], ['topper', 'ツリーのてっぺん'], ['treelights', 'ツリーの電球'], ['garland', 'ツリーのモール'], ['fireplace', '暖炉'], ['stockings', 'くつした'], ['mantel', '暖炉の上のかざり'], ['wall', '壁かざり'], ['curtain', 'カーテン'], ['wintop', '窓の上のかざり'], ['sill', '窓辺のかざり'], ['outside', '窓の外'],
  ['shelf', '棚・時計'], ['sofa', 'ソファ・ベンチ'], ['lamp', 'あかり'], ['table', 'テーブル・いす'], ['rug', 'ラグ'], ['toys', 'おもちゃ'], ['treebase', 'ツリーの足もと'], ['special', 'クリスマスの特別'],
  ['plant', 'グリーン'], ['zakka', 'こもの'], ['seat', 'クッション・いす'], ['wall2', 'かべの小物'], ['xzakka', 'クリスマスのこもの'], ['xwall', 'クリスマスのかべかざり'], ['garden', '庭のもの'], ['xgarden', 'クリスマスの庭かざり']];
const NAMES = {
  wallpaper:['雪の結晶の赤い壁紙', 'ヒイラギのストライプ壁紙', '金の星のみどりの壁紙', '障子の壁紙'], flooring:['ジンジャークッキーの床', 'タータンチェックのじゅうたん', 'キャンディの市松タイル', 'たたみ'],
  topper:['金の星', '雪の結晶', '赤いリボン'], treelights:['カラフルな電球', 'あたたかい白の電球', '雪玉ライト'], garland:['金のモール', '銀のモール', '赤と白のビーズ'],
  fireplace:['石の暖炉', 'レンガの暖炉', '白い暖炉'], stockings:['フェルトのくつした', 'ニットのくつした', 'チェックのくつした'], mantel:['ろうそくとくるみ割り人形', 'おかしの家とミニツリー', 'スノードームとランタン'],
  wall:['リース', '木の掛け時計', '雪の町の絵', 'しめ飾り', '富士の掛け軸'], curtain:['赤いチェックのカーテン', 'みどりのベルベットのカーテン', '白いレースのカーテン', '紅白幕'], wintop:['電飾', '星のガーランド', '雪の結晶のモビール'],
  sill:['ランタンと松ぼっくり', 'キャンドルの瓶', 'ポインセチアの鉢', '小さな鏡もちと梅'], outside:['雪だるま', '雪うさぎ', 'かまくら', '初日の出'], shelf:['食器棚', '本棚', '柱時計'], sofa:['赤いソファ', 'ひとりがけとサイドテーブル', '木のベンチ', '座布団'],
  lamp:['フロアランプ', '燭台', 'ヒイラギの鉢', '行灯', '門松'], table:['テーブルとクッキー', 'お茶のテーブル', 'ロッキングチェア', 'こたつとみかん'], rug:['赤とみどりのラグ', 'まるい編みラグ', 'ふわふわの白いラグ', '青海波のラグ'],
  toys:['木馬', '汽車とスノードーム', 'くまのぬいぐるみ', '羽子板とこま'], treebase:['赤いツリースカート', '木のかご', '雪のじゅうたん', '赤い毛せん'], special:['金色のきらきら', '七草のかご'],
  plant:['モンステラ', 'サボテン', 'パキラ', 'ポトスのつり鉢', 'オリーブの木', '多肉植物の寄せ植え'], zakka:['つみき', '地球儀', '本の山', 'ラジオ', '金魚鉢', 'レコードプレーヤー', 'ねこのクッション'],
  xzakka:['そり', '汽車の置物', 'トナカイの置物', '大きなくるみ割り人形', 'おかしの家', 'サンタのブーツ', 'クリスマスのオルゴール', '大きなランタン', 'ポインセチアの大鉢', '天使の置物', 'プレゼントの山', '白いミニツリー'],
  xwall:['ヒイラギのガーランド', 'くつしたのガーランド', 'クリスマスカードのかざり', 'ベルのかざり', '松ぼっくりのリース'],
  garden:['雪のランタン', '小鳥のえさ台', '薪の山', '雪のくま', '電飾の小さなもみの木', '赤いポスト', '雪のベンチ', '街灯'], xgarden:['光るトナカイ', 'イルミネーションのアーチ', '雪だるまの家族', '庭のクリスマスツリー'],
  seat:['ビーズクッション', 'まるいスツール', 'クッションの山'], wall2:['まるい鏡', '旗のガーランド', '写真フレーム', 'ドライフラワーのスワッグ', 'マグの棚', 'はと時計'],
};
export const FURN_ITEMS = [], FURN_BY = {};
for (const [slot] of FURN_SLOTS) NAMES[slot].forEach((name, k) => { const it = { key:slot + '_' + 'abcdefghijklmnop'[k], slot, k, name }; FURN_ITEMS.push(it); FURN_BY[it.key] = it; });
// 11/19 から 12/25 までの37日。はじめの15日で各場所の1つめ、そのあと2つめ・3つめ、12/25は特別
const FIRST = ['fireplace', 'rug', 'curtain', 'stockings', 'wintop', 'lamp', 'mantel', 'wall', 'sofa', 'sill', 'table', 'outside', 'shelf', 'toys', 'treebase'];
export const FLOOR_SLOTS = ['fireplace', 'shelf', 'sofa', 'lamp', 'table', 'toys', 'rug', 'plant', 'zakka', 'seat', 'xzakka'], WALL_SLOTS = ['wall', 'wall2', 'xwall'];
// ふくびきで当たる家具（XKUJI はクリスマスふくびき：12/25までの期間限定）
export const KUJI_SLOTS = ['plant', 'zakka', 'seat', 'wall2', 'garden'], XKUJI_SLOTS = ['xzakka', 'xwall', 'xgarden'];
// 庭のもの：窓の外の庭に自由に置ける。はじめから持っているもの・アドベントで届くもの・ふくびきで当たるもの
export const GARDEN_SLOTS = ['garden', 'xgarden'], START_FURN = ['garden_a', 'garden_b', 'xgarden_d'];
export const TREE_PARTS = ['wallpaper', 'flooring', 'topper', 'treelights', 'garland']; // 1つめは最初から持っている
export const ADVENT = Array.from({ length:50 }, () => []); // 11/19〜12/25がクリスマス、12/26〜1/7が年末年始
FIRST.forEach((s, i) => ADVENT[i].push(s + '_a')); { const rest = [...FIRST.map(s => s + '_b'), 'wallpaper_b', 'topper_b', 'flooring_b', 'garland_b', 'treelights_b', ...FIRST.map(s => s + '_c'), 'wallpaper_c', 'topper_c', 'flooring_c', 'garland_c', 'treelights_c']; rest.forEach((k, i) => ADVENT[15 + Math.floor(i * 21 / rest.length)].push(k)); } ADVENT[36].push('special_a');
[[4, 'garden_c'], [10, 'garden_d'], [18, 'garden_e']].forEach(([i, k]) => ADVENT[i].push(k));
['wallpaper_d flooring_d', 'curtain_d', 'wall_d', 'table_d', 'sofa_d', 'lamp_d', 'lamp_e sill_d', 'wall_e', 'toys_d', 'outside_d', 'rug_d', 'treebase_d', 'special_b'].forEach((ks, i) => ADVENT[37 + i].push(...ks.split(' ')));
export const KUJI_SKIP = [...START_FURN, ...ADVENT.flat()];
export const advDate = (year, i) => new Date(year, 10, 19 + i);
// ありがとうのプレゼントの種類
export const GIFT_TYPES = [
  { k:'red', n:'赤いしましまの箱', a:'#c8352e', b:'#f3ead9', p:'stripe', r:'#f2c14e', s:'box' },
  { k:'blue', n:'青い水玉の箱', a:'#3a6ab8', b:'#ffffff', p:'dot', r:'#f2c14e', s:'box' },
  { k:'yellow', n:'黄色いチェックの箱', a:'#f2c14e', b:'#e0564a', p:'check', r:'#c8352e', s:'box' },
  { k:'green', n:'みどりの水玉の箱', a:'#3f9a4f', b:'#f3ead9', p:'dot', r:'#c8352e', s:'box' },
  { k:'cream', n:'クリーム色のしましまの箱', a:'#f3ead9', b:'#c8352e', p:'stripe', r:'#c8352e', s:'box' },
  { k:'purple', n:'むらさきのチェックの箱', a:'#8a5ab8', b:'#f2c14e', p:'check', r:'#f2c14e', s:'box' },
  { k:'pink', n:'ピンクの水玉の箱', a:'#f4a6bc', b:'#ffffff', p:'dot', r:'#c8352e', s:'box' },
  { k:'tallgold', n:'背の高い金の箱', a:'#d9a52a', b:'#fff1a8', p:'dot', r:'#c8352e', s:'tall' },
  { k:'hatred', n:'まるい赤の帽子箱', a:'#c8352e', b:'#ffffff', p:'dot', r:'#ffffff', s:'round' },
  { k:'hatblue', n:'まるい水色の帽子箱', a:'#7cc0e4', b:'#ffffff', p:'stripe', r:'#c8352e', s:'round' },
  { k:'flat', n:'ぺたんこのみどりの箱', a:'#3f9a4f', b:'#f2c14e', p:'stripe', r:'#f2c14e', s:'flat' },
  { k:'silver', n:'銀のキューブ', a:'#c8ccd6', b:'#ffffff', p:'check', r:'#3a6ab8', s:'cube' },
];
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

const camera = new THREE.PerspectiveCamera(32, VW() / VH(), .1, 320);
const target = new THREE.Vector3(0, 1.5, -.6);
function placeCamera(){
  const aspect = VW() / VH(), fov = THREE.MathUtils.degToRad(camera.fov);
  const halfW = 4.6 / 2 + .3, distW = halfW / (Math.tan(fov / 2) * aspect);
  // 横向き（横長の画面）では幅に合わせると近づきすぎるので、高さでも部屋がおさまる距離をとる
  const distH = 4.6 / Math.tan(fov / 2), dist = Math.max(distW, distH), pitch = THREE.MathUtils.degToRad(43);
  camera.position.set(0, target.y + Math.sin(pitch) * dist, target.z + Math.cos(pitch) * dist);
  camera.aspect = aspect; camera.lookAt(target); const off = ((opts.shiftY || 0) + (aspect > 1 ? .1 : 0)) * VH(); /* 横向きは下のボタンにかくれないよう少し上へ */ camera.setViewOffset(VW(), VH(), 0, off, VW(), VH()); camera.updateProjectionMatrix();
}
placeCamera();
/* ---------- ながめるモード：なぞって見回す・2本指で寄る（部屋の中から出ないように） ---------- */
let view = null; const vptr = new Map();
function viewApply(){ if (!view) return; const { yaw, pitch } = view, t = view.t, d = view.dist, p = new THREE.Vector3();
  p.set(t.x + Math.sin(yaw) * Math.cos(pitch) * d, Math.max(.3, t.y + Math.sin(pitch) * d), t.z + Math.cos(yaw) * Math.cos(pitch) * d);
  camera.position.copy(p); camera.aspect = VW() / VH(); camera.lookAt(t); camera.clearViewOffset(); camera.updateProjectionMatrix(); cutaway(p); shadowsDirty = true; }
// どうぶつの森みたいに、カメラと部屋のあいだにある壁は透かす（その壁にかけた物も）
function cutaway(p){ const hide = p ? { left:p.x < -RW / 2 + .02, right:p.x > RW / 2 - .02, back:p.z < bz + .02 } : {};
  sideWalls[0].visible = wainS[0].visible = !hide.left; sideWalls[1].visible = wainS[1].visible = !hide.right;
  back.visible = wainB.visible = win.visible = outside.visible = !hide.back; for (const k of ['curtain', 'wintop', 'sill', 'outside']) if (mounted[k]) mounted[k].visible = !hide.back;
  for (const o of Object.values(inst)) if (o.rec.wall) o.g.visible = !hide[o.rec.wall];
  const fr = !!p && p.z < FRONT - .02; frontWall.visible = wainF.visible = fr; if (fr) ensureDoor(); if (doorG){ doorG.visible = fr; doorG.userData.wreath.visible = !nyMode; } }
/* 手前の壁の入り口（木のドア・真ちゅうのノブ・リース・玄関マット）。はじめて手前を向いたときに作る */
let doorG = null;
function ensureDoor(){ if (doorG) return; const g = doorG = new THREE.Group(); const DW = .92, DH = 2.15, DX = 1.1, z = FRONT;
  const wood = M('#a8703e', { roughness:.55 }), dark = M('#7a4b2a', { roughness:.6 }), brass = M('#d9b45a', { roughness:.3, metalness:.7 });
  // 枠
  for (const [w, h, x, y] of [[DW + .24, .12, 0, DH + .06], [.12, DH + .12, -DW / 2 - .06, DH / 2], [.12, DH + .12, DW / 2 + .06, DH / 2]]) addM(g, RB(w, h, .18, .02), dark, DX + x, y, z - .09);
  // 扉と4枚のパネル
  addM(g, RB(DW, DH, .07, .02), wood, DX, DH / 2, z - .12);
  for (const [x, y, h] of [[-.2, 1.55, .78], [.2, 1.55, .78], [-.2, .55, .78], [.2, .55, .78]]) addM(g, RB(.3, h, .03, .02), M('#b8804a', { roughness:.5 }), DX + x, y, z - .17);
  // ノブと鍵穴
  addM(g, new THREE.SphereGeometry(.045, 16, 12), brass, DX - DW / 2 + .12, 1.02, z - .2); addM(g, RB(.05, .16, .02, .01), brass, DX - DW / 2 + .12, 1.02, z - .16);
  // ドアのリース（クリスマスの間）
  const wr = wallDeco('a'); wr.scale.setScalar(.55); wr.rotation.y = Math.PI; wr.position.set(DX, 1.72, z - .18); g.add(wr); g.userData.wreath = wr;
  // 玄関マット
  addM(g, RB(.9, .03, .55, .015), M('#8a5a32', { roughness:1 }), DX, .015, z - .55); addM(g, RB(.78, .032, .43, .012), M('#c8302c', { roughness:1 }), DX, .017, z - .55);
  g.traverse(o => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; } }); scene.add(g); }
function setView(on){ vptr.clear(); if (on){ placeCamera(); const t = target.clone(), off = camera.position.clone().sub(t), dist = off.length();
    view = { t, dist, d0:dist, yaw:0, pitch:Math.asin(off.y / dist), y0:Math.asin(off.y / dist) }; viewApply(); } else { view = null; cutaway(null); if (doorG) doorG.visible = false; placeCamera(); shadowsDirty = true; } }
function viewReset(){ if (!view) return; Object.assign(view, { yaw:0, pitch:view.y0, dist:view.d0 }); view.t.copy(target); viewApply(); }
function viewDown(e){ cv.setPointerCapture(e.pointerId); vptr.set(e.pointerId, { x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY, t:performance.now() }); view.pinch = null; }
function viewMove(e){ const q = vptr.get(e.pointerId); if (!q) return;
  if (vptr.size >= 2){ const [a, b] = [...vptr.values()]; const d0 = Math.hypot(a.x - b.x, a.y - b.y), m0x = (a.x + b.x) / 2, m0y = (a.y + b.y) / 2; q.x = e.clientX; q.y = e.clientY;
    const d1 = Math.hypot(a.x - b.x, a.y - b.y), m1x = (a.x + b.x) / 2, m1y = (a.y + b.y) / 2;
    if (d0 > 10) view.dist = Math.max(1.2, Math.min(view.d0 * 1.2, view.dist * d0 / d1));
    // 2本指をそろえて動かすと、見ている中心が床の上をすべる（部屋の隅に寄れる）
    const s2 = view.dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2 / Math.max(1, cv.clientHeight), dx = (m1x - m0x) * s2, dy = (m1y - m0y) * s2;
    const right = new THREE.Vector3(Math.cos(view.yaw), 0, -Math.sin(view.yaw)), fwd = new THREE.Vector3(-Math.sin(view.yaw), 0, -Math.cos(view.yaw));
    view.t.addScaledVector(right, -dx).addScaledVector(fwd, dy / Math.max(.35, Math.sin(view.pitch) + .2) * .6);
    view.t.x = Math.max(-RW / 2 + .2, Math.min(RW / 2 - .2, view.t.x)); view.t.z = Math.max(bz + .2, Math.min(FRONT - .2, view.t.z)); viewApply(); return; }
  const dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY; const k = Math.PI / Math.max(700, cv.clientWidth * 2.2);
  view.yaw = view.yaw - dx * k; view.pitch = Math.max(.04, Math.min(1.4, view.pitch + dy * k)); viewApply(); }
function viewUp(e){ const q = vptr.get(e.pointerId); vptr.delete(e.pointerId); if (q && vptr.size === 0 && Math.hypot(e.clientX - q.x0, e.clientY - q.y0) < 7 && performance.now() - q.t < 400) tapAt(e); }

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
/* 床（3種）：ジンジャークッキーの板・赤とみどりのタータン・キャンディの市松 */
const FLOOR_REP = { a:[2, 2 * RD / RW], b:[2.4, 2.4 * RD / RW], c:[2.2, 2.2 * RD / RW], d:[2.3, 2.3 * RD / RW / 1.4] };
function floorTexOf(kind){ return canvasTex(512, 512, (g, w, h) => {
  if (kind === 'd'){ // たたみ：い草の目と黒いへり
    g.fillStyle = '#c8c070'; g.fillRect(0, 0, w, h); const mat = (x, y, mw, mh, vert) => { const gr = g.createLinearGradient(x, y, vert ? x + mw : x, vert ? y : y + mh); gr.addColorStop(0, '#d4cc82'); gr.addColorStop(1, '#bfb666'); g.fillStyle = gr; g.fillRect(x, y, mw, mh);
      g.strokeStyle = 'rgba(120,110,40,.35)'; g.lineWidth = 1.5; if (vert) for (let i = x + 4; i < x + mw; i += 5){ g.beginPath(); g.moveTo(i, y); g.lineTo(i, y + mh); g.stroke(); } else for (let i = y + 4; i < y + mh; i += 5){ g.beginPath(); g.moveTo(x, i); g.lineTo(x + mw, i); g.stroke(); }
      g.fillStyle = '#2a3a3a'; if (vert){ g.fillRect(x, y, mw, 10); g.fillRect(x, y + mh - 10, mw, 10); } else { g.fillRect(x, y, 10, mh); g.fillRect(x + mw - 10, y, 10, mh); } };
    mat(0, 0, 256, 512, false); mat(256, 0, 256, 256, true); mat(256, 256, 256, 256, true); return; }
  if (kind === 'a'){ g.fillStyle = '#f6efe2'; g.fillRect(0, 0, w, h); const ph = 64;
    for (let r = 0; r < h / ph; r++){ let x = -((r * 173) % 300); while (x < w){ const L = 200 + ((x * 7 + r * 31) % 120), sh = .93 + ((r * 13 + x) % 17) / 17 * .1;
      g.fillStyle = `rgb(${196 * sh | 0},${132 * sh | 0},${78 * sh | 0})`; g.beginPath(); g.roundRect ? g.roundRect(x + 3, r * ph + 3, L - 6, ph - 6, 10) : g.rect(x + 3, r * ph + 3, L - 6, ph - 6); g.fill();
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 10, r * ph + 7, L - 20, 5);
      g.strokeStyle = '#fffaf0'; g.lineWidth = 3; g.setLineDash([2, 7]); g.lineCap = 'round'; g.beginPath(); g.roundRect ? g.roundRect(x + 10, r * ph + 10, L - 20, ph - 20, 6) : g.rect(x + 10, r * ph + 10, L - 20, ph - 20); g.stroke(); g.setLineDash([]); x += L; } } return; }
  if (kind === 'b'){ g.fillStyle = '#b83a32'; g.fillRect(0, 0, w, h); const band = (c, a, x0, wd, vert) => { g.fillStyle = c; g.globalAlpha = a; for (let k = 0; k < 4; k++){ const p = k * 128 + x0; vert ? g.fillRect(p, 0, wd, h) : g.fillRect(0, p, w, wd); } g.globalAlpha = 1; };
    for (const v of [true, false]){ band('#2f6a46', .55, 20, 46, v); band('#1f4a30', .35, 34, 18, v); band('#f2d27a', .7, 90, 4, v); band('#fff6e6', .45, 106, 3, v); }
    for (let i = 0; i < 2200; i++){ g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},.05)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } return; }
  const n = 8, c = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++){ const red = (i + j) % 2; g.fillStyle = red ? '#d8433a' : '#fff7ec'; g.beginPath(); g.roundRect ? g.roundRect(i * c + 2, j * c + 2, c - 4, c - 4, 8) : g.rect(i * c + 2, j * c + 2, c - 4, c - 4); g.fill();
    if (red){ g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(i * c + 12, j * c + c - 12); g.lineTo(i * c + c - 12, j * c + 12); g.stroke(); } else { g.fillStyle = '#7cc4a8'; g.beginPath(); g.arc(i * c + c / 2, j * c + c / 2, 5, 0, 7); g.fill(); } }
  g.strokeStyle = 'rgba(160,90,70,.25)'; g.lineWidth = 3; for (let i = 0; i <= n; i++){ g.beginPath(); g.moveTo(i * c, 0); g.lineTo(i * c, h); g.stroke(); g.beginPath(); g.moveTo(0, i * c); g.lineTo(w, i * c); g.stroke(); }
}, FLOOR_REP[kind] || FLOOR_REP.a); }
const floorTex = floorTexOf('a');
const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), std('#ffffff', { map:floorTex, roughness:.75 }));
floor.rotation.x = -Math.PI / 2; floor.position.z = RZ; floor.receiveShadow = true; scene.add(floor);

/* 壁紙（3種）：赤い北欧もよう・ヒイラギとキャンディのストライプ・みどりに金の星 */
const flakeAt = (g, cx, cy, r, col, lw = 2.2) => { g.save(); g.translate(cx, cy); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; for (let k = 0; k < 6; k++){ g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r); g.moveTo(0, -r * .55); g.lineTo(-r * .3, -r * .82); g.moveTo(0, -r * .55); g.lineTo(r * .3, -r * .82); g.stroke(); } g.restore(); };
const starAt = (g, cx, cy, r, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
const hollyAt = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.fillStyle = '#3d8a55'; for (const a of [-.6, .6]){ g.save(); g.rotate(a); g.beginPath(); g.ellipse(0, -9, 5, 10, 0, 0, 7); g.fill(); g.restore(); } g.fillStyle = '#d8303a'; for (const [x, y] of [[-3, 1], [3, 1], [0, -3]]){ g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill(); } g.restore(); };
function wallTexOf(kind){ return canvasTex(256, 256, (g, w, h) => {
  if (kind === 'd'){ // 障子：白い和紙に木の桟
    g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++){ g.strokeStyle = `rgba(170,140,90,${Math.random() * .1})`; const a = Math.random() * w, b = Math.random() * h; g.beginPath(); g.moveTo(a, b); g.lineTo(a + (Math.random() - .5) * 18, b + (Math.random() - .5) * 18); g.stroke(); }
    g.fillStyle = '#b8864a'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 6, h); for (let y = 0; y < h; y += 85) g.fillRect(0, y, w, 6); g.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < w; x += 64) g.fillRect(x + 1, 0, 2, h); return; }
  if (kind === 'a'){ g.fillStyle = '#c23b34'; g.fillRect(0, 0, w, h); flakeAt(g, 64, 64, 20, 'rgba(255,248,236,.92)', 3); flakeAt(g, 192, 192, 20, 'rgba(255,248,236,.92)', 3);
    for (const [x, y] of [[192, 64], [64, 192]]){ g.fillStyle = 'rgba(255,248,236,.85)'; g.beginPath(); g.moveTo(x, y + 9); g.bezierCurveTo(x - 14, y - 2, x - 6, y - 14, x, y - 5); g.bezierCurveTo(x + 6, y - 14, x + 14, y - 2, x, y + 9); g.fill(); }
    g.fillStyle = 'rgba(255,248,236,.6)'; for (const [x, y] of [[128, 20], [20, 128], [236, 128], [128, 236], [128, 128], [20, 20], [236, 236], [236, 20], [20, 236]]){ g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); } return; }
  if (kind === 'b'){ g.fillStyle = '#fbf3e2'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64){ g.fillStyle = '#d8433a'; g.fillRect(x + 4, 0, 10, h); g.fillStyle = '#3d8a55'; g.fillRect(x + 18, 0, 4, h); g.fillStyle = '#d8433a'; g.fillRect(x + 26, 0, 3, h); }
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) hollyAt(g, x + 46, y + 32 + (x / 64 % 2) * 32, .9); return; }
  g.fillStyle = '#2f6a46'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 7, h);
  starAt(g, 64, 64, 14, '#f2c14e'); starAt(g, 192, 192, 14, '#f2c14e'); starAt(g, 192, 64, 7, '#fbe3a0'); starAt(g, 64, 192, 7, '#fbe3a0');
  g.fillStyle = 'rgba(255,248,236,.55)'; for (const [x, y] of [[128, 30], [30, 128], [226, 128], [128, 226], [128, 128]]){ g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); }
}, [5, 4]); }
const wallTex = wallTexOf('a');
const WX = -.05, WY = 2.45, WW = 1.24, WH = 1.44; // 窓の開口
const backShape = new THREE.Shape(); backShape.moveTo(-RW / 2, 0); backShape.lineTo(RW / 2, 0); backShape.lineTo(RW / 2, RH); backShape.lineTo(-RW / 2, RH); backShape.closePath();
{ const h = new THREE.Path(); h.moveTo(WX - WW / 2, WY - WH / 2); h.lineTo(WX - WW / 2, WY + WH / 2); h.lineTo(WX + WW / 2, WY + WH / 2); h.lineTo(WX + WW / 2, WY - WH / 2); h.closePath(); backShape.holes.push(h); }
const backTex = wallTex.clone(); backTex.needsUpdate = true; backTex.repeat.set(5 / RW, 4 / RH);
const sideWalls = [];
const back = new THREE.Mesh(new THREE.ShapeGeometry(backShape), std('#ffffff', { map:backTex })); back.position.set(0, 0, bz); back.receiveShadow = true; scene.add(back);
for (const s of [-1, 1]){ const t = wallTex.clone(); t.needsUpdate = true; t.repeat.set(5 * RD / RW, 4); const side = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), std('#ead2cc', { map:t })); sideWalls.push(side); side.rotation.y = -s * Math.PI / 2; side.position.set(s * RW / 2, RH / 2, RZ); side.receiveShadow = true; scene.add(side); }
// 腰板と巾木（奥の壁と左右の壁）
const wainMat = std('#efe2c8', { roughness:.7 }), trimMat = std('#7a4b2a', { roughness:.6 }), panelMat = std('#e4d4b4', { roughness:.7 }), railMat = std('#7a4b2a', { roughness:.5 }), baseMat = std('#7a4b2a', { roughness:.6 });
/* 壁紙ごとの腰板（下の板・パネル・上の縁・巾木）の色 */
// 腰板があるのは一部の壁紙だけ（null は巾木だけ）
const WAIN = { a:null, b:null, c:['#8a5a32', '#9a6a3e', '#e0b84e', '#5a3a22'], d:['#a8763e', '#b8864a', '#6a3a1e', '#5a3420'] }, BASE = { a:'#6a3a22', b:'#7a4b2a', c:'#5a3a22', d:'#5a3420' }; const wainParts = [];
function applyWain(kind){ const W = WAIN[kind]; wainParts.forEach(m => m.visible = !!W); baseMat.color.set(W ? W[3] : (BASE[kind] || BASE.a)); if (W){ wainMat.color.set(W[0]); panelMat.color.set(W[1]); railMat.color.set(W[2]); railMat.metalness = .35; railMat.needsUpdate = true; } shadowsDirty = true; }
function wainscot(len, place){ const g = new THREE.Group(); const w = new THREE.Mesh(new RoundedBoxGeometry(len, 1.05, .08, 2, .02), wainMat); w.position.set(0, .525, .04); w.receiveShadow = true; g.add(w); wainParts.push(w);
  const n = Math.round(len / .76); for (let i = 0; i < n; i++){ const p = new THREE.Mesh(new RoundedBoxGeometry(.62, .62, .03, 2, .02), panelMat); p.position.set(-len / 2 + (i + .5) * len / n, .55, .09); g.add(p); wainParts.push(p); }
  const rail = new THREE.Mesh(new RoundedBoxGeometry(len, .07, .14, 2, .025), railMat); rail.position.set(0, 1.07, .07); g.add(rail); wainParts.push(rail);
  const base = new THREE.Mesh(new RoundedBoxGeometry(len, .14, .12, 2, .03), baseMat); base.position.set(0, .07, .06); base.receiveShadow = true; g.add(base); place(g); scene.add(g); return g; }
const wainB = wainscot(RW, g => g.position.set(0, 0, bz));
const wainS = [-1, 1].map(s => wainscot(RD, g => { g.position.set(s * RW / 2, 0, RZ); g.rotation.y = -s * Math.PI / 2; }));
// 手前の壁：ながめるモードで手前を向いたときだけ出す
const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), std('#ead2cc', { map:(() => { const t = wallTex.clone(); t.needsUpdate = true; t.repeat.set(5, 4); return t; })() }));
frontWall.rotation.y = Math.PI; frontWall.position.set(0, RH / 2, FRONT); frontWall.receiveShadow = true; frontWall.visible = false; scene.add(frontWall);
const wainF = wainscot(RW, g => { g.position.set(0, 0, FRONT); g.rotation.y = Math.PI; }); wainF.visible = false;
wainParts.forEach(m => m.visible = !!WAIN.a); baseMat.color.set(BASE.a);

// 窓（壁にあいた穴）と、その向こうの雪の外
const win = new THREE.Group(); win.position.set(WX, WY, bz); scene.add(win);
const frameMat = std('#f3ead9', { roughness:.6 });
for (const [w, h, x, y] of [[WW + .26, .13, 0, WH / 2 + .065], [WW + .26, .15, 0, -WH / 2 - .075], [.13, WH + .28, -WW / 2 - .065, 0], [.13, WH + .28, WW / 2 + .065, 0], [.06, WH, 0, 0], [WW, .06, 0, 0]]){ const f = new THREE.Mesh(new RoundedBoxGeometry(w, h, .12, 2, .03), frameMat); f.position.set(x, y, .06); f.castShadow = true; win.add(f); }
const revealMat = std('#f6efe2', { roughness:.8 });
for (const [w, h, d, x, y] of [[WW, .02, .3, 0, WH / 2], [WW, .02, .3, 0, -WH / 2], [.02, WH, .3, -WW / 2, 0], [.02, WH, .3, WW / 2, 0]]){ const r = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), revealMat); r.position.set(x, y, -.15); r.receiveShadow = true; win.add(r); }
const sill = new THREE.Mesh(new RoundedBoxGeometry(WW + .45, .09, .34, 2, .03), frameMat); sill.position.set(0, -WH / 2 - .17, .16); sill.castShadow = true; win.add(sill);
const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshPhysicalMaterial({ color:'#dfeeff', transparent:true, opacity:.12, roughness:.05, depthWrite:false })); glassPane.position.z = -.02; win.add(glassPane);
// 外：空・雪の地面・木
let wallKind = 'a', floorKind = 'a';
function applyWall(kind){ kind = kind || 'a'; if (kind === wallKind) return; wallKind = kind; applyWain(kind); const t = wallTexOf(kind), bt = t.clone(); bt.needsUpdate = true; bt.repeat.set(5 / RW, 4 / RH); back.material.map.dispose(); back.material.map = bt; back.material.needsUpdate = true;
  { const ft = t.clone(); ft.needsUpdate = true; ft.repeat.set(5, 4); frontWall.material.map.dispose(); frontWall.material.map = ft; frontWall.material.color.set('#ead8d0'); frontWall.material.needsUpdate = true; }
  sideWalls.forEach(sw => { const st = t.clone(); st.needsUpdate = true; st.repeat.set(5 * RD / RW, 4); sw.material.map.dispose(); sw.material.map = st; sw.material.color.set('#ead8d0'); sw.material.needsUpdate = true; }); }
function applyFloor(kind){ kind = kind || 'a'; if (kind === floorKind) return; floorKind = kind; floor.material.map.dispose(); floor.material.map = floorTexOf(kind); floor.material.needsUpdate = true; }
const OUT_Z = bz - .02, outside = new THREE.Group(); scene.add(outside);
/* ---------- 窓の外：雪の夜の住宅街（空・遠くの山・家なみ・もみの木・柵・街灯・足あと・降る雪） ---------- */
const OR = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(20261224); // 毎回同じ景色になるように
// 空（夜と昼）
const skyNightTex = canvasTex(1024, 768, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#0b1433'); l.addColorStop(.45, '#1c2c5e'); l.addColorStop(.8, '#3a4c86'); l.addColorStop(1, '#6a76a8'); g.fillStyle = l; g.fillRect(0, 0, w, h);
  // うっすら天の川
  g.save(); g.translate(w * .5, h * .35); g.rotate(-.5); const mw = g.createLinearGradient(0, -90, 0, 90); mw.addColorStop(0, 'rgba(180,190,255,0)'); mw.addColorStop(.5, 'rgba(190,200,255,.12)'); mw.addColorStop(1, 'rgba(180,190,255,0)'); g.fillStyle = mw; g.fillRect(-w, -90, w * 2, 180); g.restore();
  for (let i = 0; i < 900; i++){ const x = OR() * w, y = Math.pow(OR(), 1.4) * h * .75, r = OR() < .04 ? 1.6 + OR() * 1.2 : .4 + OR() * .9, a = .3 + OR() * .7; g.fillStyle = `rgba(${235 + OR() * 20 | 0},${235 + OR() * 20 | 0},255,${a})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    if (r > 1.7){ const gl = g.createRadialGradient(x, y, 0, x, y, r * 5); gl.addColorStop(0, `rgba(220,230,255,${a * .5})`); gl.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 5, 0, 7); g.fill(); } }
  // 月（かさ・海の模様）
  const mx = w * .76, my = h * .2, mr = 34; const halo = g.createRadialGradient(mx, my, mr * .8, mx, my, mr * 5); halo.addColorStop(0, 'rgba(255,246,214,.45)'); halo.addColorStop(.4, 'rgba(200,210,255,.12)'); halo.addColorStop(1, 'rgba(200,210,255,0)'); g.fillStyle = halo; g.beginPath(); g.arc(mx, my, mr * 5, 0, 7); g.fill();
  const mg = g.createRadialGradient(mx - 10, my - 10, 4, mx, my, mr); mg.addColorStop(0, '#fffbea'); mg.addColorStop(1, '#efe4c0'); g.fillStyle = mg; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
  for (const [dx, dy, r] of [[-10, -6, 9], [8, 6, 7], [10, -12, 5], [-4, 14, 6], [-16, 8, 4]]){ g.fillStyle = 'rgba(190,180,150,.35)'; g.beginPath(); g.arc(mx + dx, my + dy, r, 0, 7); g.fill(); }
  // 地平線の街あかり
  const hz = g.createLinearGradient(0, h * .82, 0, h); hz.addColorStop(0, 'rgba(255,190,140,0)'); hz.addColorStop(1, 'rgba(255,190,140,.22)'); g.fillStyle = hz; g.fillRect(0, h * .82, w, h * .18); });
const skyDayTex = canvasTex(1024, 768, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#7fa6d8'); l.addColorStop(.6, '#b8cfe8'); l.addColorStop(1, '#e6eef6'); g.fillStyle = l; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++){ const cx = OR() * w, cy = h * (.1 + OR() * .45), s = 40 + OR() * 70; for (let k = 0; k < 9; k++){ const x = cx + (OR() - .5) * s * 2.2, y = cy + (OR() - .5) * s * .4, r = s * (.35 + OR() * .45); const c = g.createRadialGradient(x, y, 0, x, y, r); c.addColorStop(0, 'rgba(255,255,255,.55)'); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } } });
const sky = new THREE.Mesh(new THREE.PlaneGeometry(300, 110), new THREE.MeshBasicMaterial({ map:skyNightTex, fog:false })); sky.position.set(WX, 22, OUT_Z - 150); outside.add(sky);
// 遠くの山なみ（2列）
function ridgeTex(seed, col, cap, haze){ return canvasTex(1024, 256, (g, w, h) => { let r = seed; const R = () => (r = (r * 16807) % 2147483647) / 2147483647; const pts = []; let y = h * .45; for (let x = 0; x <= w; x += 8){ y += (R() - .5) * 18; y = Math.max(h * .12, Math.min(h * .7, y)); pts.push([x, y]); }
  g.beginPath(); g.moveTo(0, h); pts.forEach(([x, y2]) => g.lineTo(x, y2)); g.lineTo(w, h); g.closePath(); g.fillStyle = col; g.fill();
  g.save(); g.clip(); g.beginPath(); pts.forEach(([x, y2], i) => i ? g.lineTo(x, y2 + 14 + R() * 10) : g.moveTo(x, y2 + 16)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1] - 2); g.closePath(); g.fillStyle = cap; g.fill(); g.restore();
  const hz = g.createLinearGradient(0, 0, 0, h); hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, haze); g.fillStyle = hz; g.globalCompositeOperation = 'source-atop'; g.fillRect(0, 0, w, h); }); }
const ridges = [[ridgeTex(7, '#33416e', '#a9b4d8', 'rgba(120,130,180,.5)'), OUT_Z - 140, 8, 40, 300], [ridgeTex(91, '#2a3660', '#c3cbe6', 'rgba(90,100,150,.45)'), OUT_Z - 118, 2, 26, 240]].map(([t, z, y, hh, ww]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), new THREE.MeshBasicMaterial({ map:t, transparent:true, fog:false })); m.position.set(WX, y, z); outside.add(m); return m; });
// 雪の地面（なだらかな起伏＋キラキラ）
const snowSparkle = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++){ const v = 228 + OR() * 27 | 0; g.fillStyle = `rgb(${v - 8},${v - 4},${v})`; g.fillRect(OR() * w, OR() * h, 2, 2); } for (let i = 0; i < 260; i++){ g.fillStyle = '#ffffff'; g.fillRect(OR() * w, OR() * h, 1.5, 1.5); } }, [6, 6]);
const snowMat = std('#f4f8ff', { roughness:.92, map:snowSparkle });
// 地形：別荘の建つ高台 → 急な斜面 → はるか下の町（函館山から見おろす夜景のイメージ）。dz は壁からの距離
const CITY_Y = -15;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const terH = (x, dz) => { let y = .6 + (CITY_Y - .6) * smooth(4.2, 15, dz); y += (Math.sin(x * .9) * .05 + Math.sin(dz * 1.3 + x * .4) * .06) * (1 - smooth(4.2, 15, dz) * .5);
  if (dz > 15) y += Math.sin(x * .35 + dz * .2) * .25 + Math.sin(x * .13 - dz * .17) * .4; if (dz > 84) y += smooth(84, 98, dz) * (7 + Math.sin(x * .25) * 3 + Math.sin(x * .6 + 1) * 1.2); return y; };
const gGeo = new THREE.PlaneGeometry(110, 100, 220, 200); { const P = gGeo.attributes.position; for (let i = 0; i < P.count; i++){ const x = P.getX(i), dz = 50 + P.getY(i); P.setZ(i, terH(x, dz)); } gGeo.computeVertexNormals(); }
const ground = new THREE.Mesh(gGeo, snowMat); ground.rotation.x = -Math.PI / 2; ground.position.set(WX, 0, OUT_Z - 50); ground.receiveShadow = true; outside.add(ground);
for (const [x, z, r] of [[-2.6, -3.3, 1.0], [2.8, -3.5, 1.0]]){ const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 14), snowMat); m.scale.y = .28; m.position.set(WX + x, .58, OUT_Z + z); m.receiveShadow = true; outside.add(m); }
// もみの木（ぎざぎざの枝の段＋つもった雪）
const pineM = std('#245040', { roughness:.88 }), pineM2 = std('#1d4535', { roughness:.9 }), trunkM = std('#5a3a28');
function jagCone(r, h, seed){ const g = new THREE.ConeGeometry(r, h, 18, 2, true); const P = g.attributes.position; let q = seed; const R = () => (q = (q * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < P.count; i++){ const y = P.getY(i); if (y < -h / 2 + .001){ const k = 1 + (i % 2 ? .22 : -.05) + R() * .08; P.setX(i, P.getX(i) * k); P.setZ(i, P.getZ(i) * k); P.setY(i, y - (i % 2 ? .04 : 0) * h); } } g.computeVertexNormals(); return g; }
function pine(x, z, h, lit){ const t = new THREE.Group(); t.position.set(WX + x, .58, OUT_Z + z); t.rotation.y = OR() * 6; outside.add(t); const tiers = 5;
  for (let k = 0; k < tiers; k++){ const f = k / tiers, r = h * (.42 - f * .3), hh = h * .34, y = h * (.2 + f * .62);
    const c = new THREE.Mesh(jagCone(r, hh, 31 + k * 7 + (x * 100 | 0)), k % 2 ? pineM2 : pineM); c.position.y = y; c.castShadow = true; t.add(c);
    const sc = new THREE.Mesh(jagCone(r * .55, hh * .22, 77 + k), snowMat); sc.position.y = y + hh * .36; t.add(sc); }
  const top = new THREE.Mesh(new THREE.ConeGeometry(h * .06, h * .16, 10), snowMat); top.position.y = h * .9; t.add(top);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(h * .035, h * .05, h * .22, 8), trunkM); tr.position.y = h * .08; t.add(tr);
  if (lit){ const cols = ['#ff5a4a', '#ffd84a', '#5ad0ff', '#7aff8a', '#ff8ad8']; t.userData.bulbs = []; for (let i = 0; i < 46; i++){ const a = i * 2.4, yy = .15 + (i / 46) * .78, rr = h * (.42 - (yy - .15) * .38) * .95; const b = new THREE.Mesh(new THREE.SphereGeometry(.022, 6, 4), new THREE.MeshBasicMaterial({ color:cols[i % 5] })); b.position.set(Math.cos(a) * rr, yy * h, Math.sin(a) * rr); t.add(b); t.userData.bulbs.push(b); } litTrees.push(t); }
  return t; }
const litTrees = [];
// 庭をまだ使わない人（テスト中）には、もとの庭の木と雪の吹きだまりを出す
const oldTrees = new THREE.Group(); outside.add(oldTrees);
{ const n0 = outside.children.length; for (const [x, z, h, lit] of [[-1.8, -1.6, 1.2], [2.0, -2.0, 1.1], [-1.7, -4.0, 1.3, 1]]) pine(x, z, h, lit);
  for (const [x, z, r] of [[-1.2, -2.0, .7], [1.4, -2.6, .6]]){ const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 14), snowMat); m.scale.y = .28; m.position.set(WX + x, .58, OUT_Z + z); m.receiveShadow = true; outside.add(m); }
  outside.children.slice(n0).forEach(c => oldTrees.add(c)); }
for (const [x, z, h, lit] of [[-3.0, -2.4, 1.7], [3.1, -2.8, 1.8], [-3.6, -4.2, 2.0], [3.8, -4.4, 2.0], [-5.6, -4.6, 1.6], [5.8, -4.8, 1.7]]) pine(x, z, h, lit);
// 町なみ（家・教会・広場のツリー・街灯）
const roofSnow = std('#f6f8ff', { roughness:.9 });
// はるか下の町の灯り（家は見えないほど小さく、窓と街灯のつぶが道すじに沿って広がる）
let riverM = null; const village = new THREE.Group(); village.visible = false; outside.add(village); const vLights = [], puffs = [];
{ const dotTex = canvasTex(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.2, 'rgba(255,255,255,.9)'); r.addColorStop(.45, 'rgba(255,255,255,.25)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const pts = (arr, color, size, op) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr.flat()), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, map:dotTex, transparent:true, opacity:op, depthWrite:false, blending:THREE.AdditiveBlending })); village.add(p); vLights.push(p); return p; };
  // 川（灯りのない、くねった帯）
  const riverX = dz => Math.sin(dz * .11 + .8) * 7 + Math.sin(dz * .27) * 2.2 - 2;
  const inCity = (x, dz) => { if (dz < 16.5 || dz > 82) return false; const half = 9 + (dz - 16) * .55 + Math.sin(dz * .4) * 2 + Math.sin(x * .3) * 1.5; if (Math.abs(x) > half) return false; return Math.abs(x - riverX(dz)) > .55 + Math.sin(dz * .7) * .15; };
  const hY = (x, dz) => terH(x, dz) + .06;
  const warm = [], white = [], street = [], color = [], bridges = [];
  // 町の広がり：中心街から外へ行くほどまばらに。幹線道路が放射状にのび、沿道とまわりの小さな町に家が集まる。公園や畑はぽっかり空く
  const cores = [[-2, 46, 9, .8], [-16, 64, 6, .6], [14, 34, 4.5, .5], [9, 73, 5.5, .55], [-10, 28, 3, .4], [21, 60, 4.5, .45], [-25, 77, 5, .45], [26, 80, 4, .4]];
  const voids = [[4.5, 34, 1.7], [-7, 47, 2.3], [11, 50, 2], [-2.5, 55, 1.5], [17, 42, 2.6], [-19, 38, 3]];
  const arts = [], artNear = new Map(), akey = (x, dz) => ((x / 1.2) | 0) + ',' + ((dz / 1.2) | 0);
  const addArt = (x, dz, h, len, wob) => { const line = []; for (let d = 0; d < len; d += .22){ h += Math.sin(d * .09 + wob) * .012 + (OR() - .5) * .02; x += Math.cos(h) * .22; dz += Math.sin(h) * .22; if (dz < 16.8 || dz > 83 || Math.abs(x) > 34) break; line.push([x, dz]); const k = akey(x, dz); if (!artNear.has(k)) artNear.set(k, []); artNear.get(k).push([x, dz]); } arts.push(line); };
  for (let i = 0; i < 6; i++) addArt(-2, 46, i / 6 * 6.28 + OR() * .6, 60, OR() * 6);
  addArt(-15, 60, -.3, 30, 2); addArt(14, 30, 2.2, 26, 4); addArt(-30, 70, -.1, 60, 1);
  { const line = []; for (let dz = 17; dz < 83; dz += .22){ const x = riverX(dz) + 1.1; line.push([x, dz]); const k = akey(x, dz); if (!artNear.has(k)) artNear.set(k, []); artNear.get(k).push([x, dz]); } arts.push(line); }
  const artDist = (x, dz) => { let m = 9; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++){ const L = artNear.get((((x / 1.2) | 0) + a) + ',' + (((dz / 1.2) | 0) + b)); if (L) for (const [px, pz] of L){ const d = Math.hypot(px - x, pz - dz); if (d < m) m = d; } } return m; };
  const dens = (x, dz) => { if (!inCity(x, dz)) return 0; for (const [vx, vz, r] of voids) if (Math.hypot(x - vx, (dz - vz) * 1.2) < r * (1 + Math.sin(x * 3 + dz) * .12)) return 0;
    let d = 0; for (const [cx, cz, r, w] of cores){ const q = ((x - cx) ** 2 + ((dz - cz) * 1.3) ** 2) / (r * r); d = Math.max(d, w * Math.exp(-q * .55)); }
    const ad = artDist(x, dz); d += .28 * Math.exp(-ad * ad * 4); return Math.min(1, d + .05 + .13 * Math.min(1, Math.max(0, (dz - 17) / 60))); };
  // 幹線道路の街灯（オレンジの連なり）と橋
  for (const line of arts) line.forEach(([x, dz], i) => { if (Math.abs(x - riverX(dz)) < .62){ if (i % 2 === 0) bridges.push([WX + x, hY(x, dz) + .05, OUT_Z - dz]); return; } if (!inCity(x, dz) && OR() < .7) return; if (i % 2 === 0) street.push([WX + x, hY(x, dz) + .04, OUT_Z - dz]); });
  // 区画ごとに向きのちがう街路（中心ほど細かく、外は粗く）
  for (const [cx, cz, r, w] of cores){ const ang = OR() * 1.2 - .6, ca = Math.cos(ang), sa = Math.sin(ang), R = r * 2.4, sp = .5 + (1 - w) * .25;
    for (let u = -R; u <= R; u += sp) for (let v = -R; v <= R; v += .2) for (const sw of [0, 1]){ const a = sw ? u : v, b = sw ? v : u, x = cx + a * ca - b * sa, dz = cz + (a * sa + b * ca) / 1.3, dd = dens(x, dz); if (dd < .14 || OR() > dd * .75) continue;
      if (OR() < .35) street.push([WX + x, hY(x, dz) + .03, OUT_Z - dz]);
      for (const s of [-1, 1]) if (OR() < dd * .8){ const o = .1 + OR() * .14, px = x + (sw ? -sa : ca) * 0 + (sw ? ca : -sa) * o * s * 0 + (sw ? -1 : 0) * 0, nx = sw ? -sa : ca, nz = sw ? ca : sa; const hx = x - nz * o * s, hz = dz + nx * o * s / 1.3; if (!dens(hx, hz)) continue; (OR() < (dd > .7 ? .5 : .85) ? warm : white).push([WX + hx, hY(hx, hz) + (dd > .75 ? OR() * .3 : 0), OUT_Z - hz]); } } }
  // 沿道と郊外の家（まばら）
  for (let i = 0; i < 9000; i++){ const x = (OR() - .5) * 64, dz = 17 + OR() * 66, dd = dens(x, dz); if (!dd || OR() > dd * .45) continue; (OR() < .8 ? warm : white).push([WX + x, hY(x, dz), OUT_Z - dz]); }
  // クリスマスの広場（色とりどり）と大きなツリー
  for (let i = 0; i < 120; i++){ const a = OR() * 6.28, r = Math.sqrt(OR()) * 1.4; color.push([WX + .6 + Math.cos(a) * r, hY(.6, 27) + .05, OUT_Z - 27 + Math.sin(a) * r]); }
  const tree = []; for (let i = 0; i < 60; i++){ const t = i / 60, a = t * 30; tree.push([WX + .6 + Math.cos(a) * (1 - t) * .35, hY(.6, 27) + .15 + t * 1.3, OUT_Z - 27 + Math.sin(a) * (1 - t) * .35]); }
  pts(street, '#ffc070', .34, .9); pts(warm, '#ff9a3a', .3, .9); pts(white, '#fff0d8', .26, .85); pts(color, '#ff6a8a', .4, .95); pts(tree, '#8affb0', .32, 1); pts(bridges, '#fff4c8', .4, 1);
  const star = pts([[WX + .6, hY(.6, 27) + 1.55, OUT_Z - 27]], '#ffe070', 1.1, 1);
  // 昼にも見える家並み（灯りの位置に小さな家と雪のつもった屋根。夜は暗く沈む）
  { const src = [...warm, ...white], hs = []; const stp = Math.max(1, src.length / 3600); for (let i = 0; i < src.length; i += stp) hs.push(src[i | 0]);
    const N = hs.length, wallG = new THREE.BoxGeometry(1, 1, 1), roofG = new THREE.ConeGeometry(.74, 1, 4); roofG.rotateY(Math.PI / 4);
    const iw = new THREE.InstancedMesh(wallG, std('#ffffff', { roughness:.9 }), N), ir = new THREE.InstancedMesh(roofG, std('#ffffff', { roughness:.85 }), N), d = new THREE.Object3D(), c = new THREE.Color();
    const WC = ['#f3e6d0', '#e8d6bc', '#f7f1e6', '#d8c2a8', '#e4ded4', '#cfd6de', '#e9cfc0'], RC = ['#f4f6fb', '#f4f6fb', '#eef2fa', '#8a3a32', '#4a5a7a', '#6a4a3a', '#3f5a4c'];
    hs.forEach(([wx, y0, wz], i) => { const x = wx - WX, dz = OUT_Z - wz, g = terH(x, dz), tall = y0 - hY(x, dz) > .05, w = .13 + OR() * .13, dd = w * (.8 + OR() * .5), h = tall ? .3 + OR() * .45 : w * (.7 + OR() * .7), ry = OR() * 3.14;
      d.position.set(wx, g + h / 2, wz); d.rotation.set(0, ry, 0); d.scale.set(w, h, dd); d.updateMatrix(); iw.setMatrixAt(i, d.matrix); iw.setColorAt(i, c.set(WC[(OR() * WC.length) | 0]));
      const rh = tall ? .02 : w * .5; d.position.set(wx, g + h + rh / 2, wz); d.scale.set(w * 1.02, rh, dd * 1.02); d.updateMatrix(); ir.setMatrixAt(i, d.matrix); ir.setColorAt(i, c.set(tall ? '#e8ecf4' : RC[(OR() * RC.length) | 0])); });
    iw.userData.house = ir.userData.house = true; village.add(iw, ir);
    const pt = new THREE.Mesh(new THREE.ConeGeometry(.35, 1.3, 10), std('#2a5a44', { roughness:.9 })); pt.position.set(WX + .6, terH(.6, 27) + .75, OUT_Z - 27); village.add(pt); }
  // 川の水面（暗い帯）と、うつりこむ灯り
  { const pos = [], refl = []; for (let dz = 16; dz < 84; dz += .5){ const x = riverX(dz), w = .26 + (dz - 16) * .002; pos.push(WX + x - w, hY(x, dz) - .02, OUT_Z - dz, WX + x + w, hY(x, dz) - .02, OUT_Z - dz); if (OR() < .5) refl.push([WX + x + (OR() - .5) * .6, hY(x, dz), OUT_Z - dz]); }
    const idx = []; for (let i = 0; i < pos.length / 6 - 1; i++){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    riverM = new THREE.MeshBasicMaterial({ color:'#2a3460', transparent:true, opacity:.55, side:THREE.DoubleSide }); village.add(new THREE.Mesh(g, riverM)); pts(refl, '#ffa050', .22, .45); }
  // 斜面の森
  const FN = 320, fi = new THREE.InstancedMesh(new THREE.ConeGeometry(.16, .5, 7), std('#1f4438', { roughness:.9 }), FN), fs = new THREE.InstancedMesh(new THREE.ConeGeometry(.1, .18, 7), std('#eef2ff'), FN), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), ps = new THREE.Vector3(), sc = new THREE.Vector3(); let f = 0;
  for (let i = 0; i < 3000 && f < FN; i++){ const x = (OR() - .5) * 46, dz = 4.5 + OR() * 10; const y = terH(x, dz), s0 = .8 + OR() * 1.0;
    m4.compose(ps.set(WX + x, y + .22 * s0, OUT_Z - dz), q, sc.set(s0, s0, s0)); fi.setMatrixAt(f, m4); m4.compose(ps.set(WX + x, y + .4 * s0, OUT_Z - dz), q, sc.set(s0, s0, s0)); fs.setMatrixAt(f, m4); f++; }
  fi.count = fs.count = f; village.add(fi, fs); }
// 手前の木の柵（雪がのっている）
{ const fenceM = std('#8a6a4e', { roughness:.85 }); const fz = OUT_Z - 4.3;
  for (const z of [0]){ for (let i = 0; i < 26; i++){ const x = WX - 3.2 + i * .26 + (OR() - .5) * .02; const pk = new THREE.Mesh(new RoundedBoxGeometry(.07, .52, .04, 2, .015), fenceM); pk.position.set(x, .58 + .26, fz + z); pk.rotation.z = (OR() - .5) * .06; outside.add(pk); const cap = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), roofSnow); cap.scale.set(1, .5, .9); cap.position.set(x, .58 + .53, fz + z); outside.add(cap); }
    for (const y of [.2, .4]){ const rail = new THREE.Mesh(new RoundedBoxGeometry(6.8, .05, .035, 2, .012), fenceM); rail.position.set(WX, .58 + y, fz - .03); outside.add(rail); const sn = new THREE.Mesh(new RoundedBoxGeometry(6.8, .03, .05, 2, .012), roofSnow); sn.position.set(WX, .58 + y + .035, fz - .03); outside.add(sn); } } }
// 雪の上の足あと
/* 庭の雪の上の、動物の足あと（日替わりで、動物の組み合わせと道すじがランダム） */
const FP_C = 'rgba(78,96,150,1)';
const fpTex = draw => canvasTex(64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = FP_C; g.strokeStyle = FP_C; const E = (x, y, rx, ry, a = 0) => { g.beginPath(); g.ellipse(x * w, y * w, rx * w, ry * w, a, 0, Math.PI * 2); g.fill(); }; draw(E, g, w); });
const FPT = {
  rabbit: [fpTex(E => { E(.36, .2, .08, .17, .1); E(.64, .2, .08, .17, -.1); E(.47, .62, .07, .08); E(.5, .84, .07, .08); }), .26, 'hop', .5],
  squirrel: [fpTex(E => { E(.26, .26, .09, .13, .3); E(.74, .26, .09, .13, -.3); E(.4, .66, .06, .08); E(.6, .7, .06, .08); }), .16, 'hop', .34],
  mouse: [fpTex((E, g, w) => { E(.38, .3, .06, .08); E(.62, .3, .06, .08); E(.4, .58, .045, .05); E(.6, .58, .045, .05); g.lineWidth = w * .03; g.beginPath(); g.moveTo(w * .5, w * .62); g.quadraticCurveTo(w * .56, w * .82, w * .5, w); g.stroke(); }), .08, 'hop', .1],
  bird: [fpTex((E, g, w) => { g.lineWidth = w * .045; g.lineCap = 'round'; for (const ox of [.3, .7]){ g.beginPath(); g.moveTo(w * ox, w * .55); g.lineTo(w * ox, w * .85); g.moveTo(w * ox, w * .55); g.lineTo(w * (ox - .14), w * .25); g.moveTo(w * ox, w * .55); g.lineTo(w * ox, w * .18); g.moveTo(w * ox, w * .55); g.lineTo(w * (ox + .14), w * .25); g.stroke(); } }), .09, 'hop', .13],
  fox: [fpTex(E => { E(.5, .62, .16, .14); for (const [x, y] of [[.34, .34], [.66, .34], [.42, .2], [.58, .2]]) E(x, y, .07, .08); }), .085, 'line', .2],
  cat: [fpTex(E => { E(.5, .64, .2, .16); for (const [x, y] of [[.26, .4], [.42, .28], [.58, .28], [.74, .4]]) E(x, y, .08, .09); }), .07, 'walk', .17],
  dog: [fpTex(E => { E(.5, .64, .18, .17); for (const [x, y] of [[.27, .4], [.42, .25], [.58, .25], [.73, .4]]) E(x, y, .085, .1); for (const [x, y] of [[.42, .1], [.58, .1]]) E(x, y, .03, .04); }), .1, 'walk', .25],
  deer: [fpTex(E => { E(.38, .45, .12, .3, -.12); E(.62, .45, .12, .3, .12); E(.4, .85, .05, .05); E(.6, .85, .05, .05); }), .1, 'line', .3],
  tanuki: [fpTex(E => { E(.5, .64, .17, .15); for (const [x, y] of [[.22, .44], [.34, .26], [.5, .2], [.66, .26], [.78, .44]]) E(x, y, .065, .08); }), .085, 'walk', .16],
};
const fpGroup = new THREE.Group(); outside.add(fpGroup); const fpMats = {};
// 日ごとに、9種類の動物から1〜3種類をランダムに選び、道すじもランダム（同じ日は同じ足あと）
function fpPick(day){ const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)((day * 2654435761 >>> 0) % 2147483646 + 1); R(); R(); const types = Object.keys(FPT), n = R() < .45 ? 1 : R() < .75 ? 2 : 3, out = [];
  while (out.length < n){ const t = types[(R() * types.length) | 0]; if (t === 'bird' || !out.some(o => o[0] === t)) out.push([t, (R() * 1e6) | 0 + 1]); } return out; }
function buildFootprints(day){ while (fpGroup.children.length){ const c = fpGroup.children.pop(); c.geometry.dispose(); }
  for (const [type, seed] of fpPick(day)){ const [tex, size, mode, stride] = FPT[type], R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(seed * 7919 + 13);
    const mat = fpMats[type] || (fpMats[type] = new THREE.MeshBasicMaterial({ map:tex, transparent:true, opacity:.6, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2 }));
    // 庭を横切る道すじ（はしからはしへ、ゆるく曲がる）
    const side = R() < .5 ? -1 : 1, short = mode === 'hop' && size < .1, x0 = side * (short ? .6 + R() * 1.2 : 3.4), x1 = -side * (short ? .2 + R() * 1.4 : 3.4) , z0 = 1.4 + R() * 2.6, z1 = 1.4 + R() * 2.6, cx = (R() - .5) * 2.4, cz = 1.2 + R() * 3;
    const P = t => { const u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * z0 + 2 * u * t * cz + t * t * z1]; };
    let len = 0, prev = P(0); const pts = [prev]; for (let i = 1; i <= 200; i++){ const p = P(i / 200); len += Math.hypot(p[0] - prev[0], p[1] - prev[1]); pts.push(p); prev = p; }
    let acc = 0, k = 0, n = 0; const wob = mode === 'walk' ? .045 : mode === 'line' ? .012 : 0;
    for (let i = 1; i < pts.length; i++){ const [ax, az] = pts[i - 1], [bx, bz] = pts[i], seg = Math.hypot(bx - ax, bz - az); acc += seg; if (acc < stride * (.85 + R() * .3)) continue; acc = 0; n++;
      const dx = (bx - ax) / seg, dz = (bz - az) / seg, s = (n % 2 ? 1 : -1) * wob + (mode === 'hop' && type === 'bird' ? (R() - .5) * .05 : 0), x = bx - dz * s, z = bz + dx * s, wx = WX + x, wz = OUT_Z - z;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size * 1.2, size * 1.2), mat); m.rotation.set(-Math.PI / 2, 0, Math.atan2(dx, dz) + (type === 'bird' ? (R() - .5) * .5 : 0)); m.position.set(wx, Math.max(.55, terH(x, z)) + .012, wz); fpGroup.add(m); } } }
const fpDay = () => { if (window.KAJI_FP != null) return window.KAJI_FP; const d = new Date(Date.now() - 4 * 36e5); return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5); };
let fpCur = -1; const fpCheck = () => { const d = fpDay(); if (d !== fpCur){ fpCur = d; buildFootprints(d); } }; fpCheck();
// 降る雪（遠く・近くの2層）
const snowN = 320, snowGeo = new THREE.BufferGeometry(), snowPos = new Float32Array(snowN * 3); for (let i = 0; i < snowN; i++){ snowPos[i * 3] = WX + (Math.random() - .5) * 8; snowPos[i * 3 + 1] = .6 + Math.random() * 5; snowPos[i * 3 + 2] = OUT_Z - .3 - Math.random() * 8; }
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3)); const snowPts = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color:'#ffffff', size:.06, transparent:true, opacity:.9, map:glowTex, depthWrite:false })); outside.add(snowPts);
const nearN = 40, nearGeo = new THREE.BufferGeometry(), nearPos = new Float32Array(nearN * 3); for (let i = 0; i < nearN; i++){ nearPos[i * 3] = WX + (Math.random() - .5) * 2.4; nearPos[i * 3 + 1] = .8 + Math.random() * 3.4; nearPos[i * 3 + 2] = OUT_Z - .25 - Math.random() * .8; }
nearGeo.setAttribute('position', new THREE.BufferAttribute(nearPos, 3)); const nearSnow = new THREE.Points(nearGeo, new THREE.PointsMaterial({ color:'#ffffff', size:.11, transparent:true, opacity:.85, map:glowTex, depthWrite:false })); outside.add(nearSnow);
// 窓の外側の桟につもった雪
{ const ls = new THREE.Mesh(new RoundedBoxGeometry(WW - .02, .07, .16, 3, .03), roofSnow); ls.position.set(WX, WY - WH / 2 + .03, bz - .24); outside.add(ls); }
function outsideTime(night){ fpCheck(); sky.material.map = night ? skyNightTex : skyDayTex; sky.material.needsUpdate = true; ridges[0].material.color.set(night ? '#ffffff' : '#c8d4ee'); ridges[1].material.color.set(night ? '#ffffff' : '#d8e0f2');
  vLights.forEach(p => p.visible = night); village.children.forEach(c => { if (c.isInstancedMesh) c.material.color.set(night ? '#5a6080' : '#ffffff'); if (c.userData.house) c.visible = !night; }); if (riverM) riverM.color.set(night ? '#2a3460' : '#7f9cc4'); }
function outsideTick(now){ const t = now / 1000;
  { const a = snowGeo.attributes.position; for (let i = 0; i < snowN; i++){ let y = a.getY(i) - .01 - (i % 3) * .003; if (y < .6) y = 5.6; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * 1.1 + i) * .0016); } a.needsUpdate = true; }
  { const a = nearGeo.attributes.position; for (let i = 0; i < nearN; i++){ let y = a.getY(i) - .016; if (y < .7) y = 4.2; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * .9 + i * 1.7) * .0026); } a.needsUpdate = true; }
  for (const lt of litTrees) lt.userData.bulbs.forEach((b, i) => { b.visible = Math.sin(t * 2.2 + i * 1.7) > -.6; }); if (village.visible) vLights.forEach((p, i) => { p.material.opacity = .78 + Math.sin(t * 3.1 + i * 1.7) * .17; }); }
/* クリスマスの時期（12/25まで、朝4時区切り）は、窓の外の夜空をサンタのそりがときどき横切る */
const isEve = () => { if (window.KAJI_EVE) return true; const d = new Date(Date.now() - 4 * 36e5), m = d.getMonth(); return (m === 10 && d.getDate() >= 19) || (m === 11 && d.getDate() <= 25); };
const SL = buildSleigh(), sleigh = SL.root; sleigh.visible = false; sleigh.scale.setScalar(1.6); outside.add(sleigh);
// そりのうしろのキラキラ
const trailN = 120, trailGeo = new THREE.BufferGeometry(), trailPos = new Float32Array(trailN * 3).fill(-99); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color:'#ffe9a8', size:.09, transparent:true, opacity:.95, map:glowTex, depthWrite:false, blending:THREE.AdditiveBlending })); trail.visible = false; outside.add(trail);
let trailI = 0, sleighBell = 0;
/* そりの飛ぶ道：手前を横切ってから町へ降りていき、大きく蛇行しながら町へ向かい、最後は中心街のまんなかへ旋回しながら降りていく（x, 高さ, 窓からの奥行き） */
const SLP = new THREE.CatmullRomCurve3([[-16, 2.2, 8], [-6, .6, 11], [3, -.5, 14], [9, -2.5, 18], [6, -4.5, 23], [-4, -6, 26], [-10, -7.5, 30], [-7, -9, 35], [3, -10, 37], [9, -11, 41], [6, -12, 47], [-2, -12.6, 50], [-7, -13, 46], [-4, -13.6, 42], [-1, -14, 44], [-2, 'L', 46]].map(([x, y, d]) => new THREE.Vector3(WX + x, y === 'L' ? terH(x, d) + .15 : y, OUT_Z - d)), false, 'centripetal');
SLP.arcLengthDivisions = 4000; SLP.updateArcLengths(); /* 長い道なので細かく測って、速さのムラ（カクつき）をなくす */
let slJump = true, slPrev = 0; const slGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:'#ffd890', transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending })); slGlow.scale.setScalar(1.6); slGlow.position.set(.4, .5, 0); sleigh.add(slGlow);
const SLT = 40000, SLPER = 56000, slTan = new THREE.Vector3(), slTan2 = new THREE.Vector3(); sleigh.rotation.order = 'YZX';
const sleighTick = () => { const now = performance.now(), on = isEve(); trail.visible = on; if (!on){ sleigh.visible = false; return; }
  const p = (now % SLPER) / SLPER, k = window.KAJI_SLEIGH_K != null ? window.KAJI_SLEIGH_K : p * SLPER / SLT; if (k > 1){ sleigh.visible = false; slJump = true; return; } sleigh.visible = true;
  const pos = SLP.getPointAt(k); SLP.getTangentAt(k, slTan); SLP.getTangentAt(Math.min(1, k + .01), slTan2); const x = pos.x, y = pos.y, z = pos.z; sleigh.position.copy(pos);
  const hz = Math.hypot(slTan.x, slTan.z), yaw = Math.atan2(-slTan.z, slTan.x), turn = Math.atan2(slTan.x * slTan2.z - slTan.z * slTan2.x, slTan.x * slTan2.x + slTan.z * slTan2.z);
  // 向き・かたむきは急に変えず、なめらかに追いかける
  const sdt = Math.min(.1, (now - (slPrev || now)) / 1000); slPrev = now; const R = sleigh.rotation, ease = k < .002 || slJump ? 1 : 1 - Math.exp(-sdt * 6); let dy = yaw - R.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); R.y += dy * ease; R.z += (Math.atan2(slTan.y, hz) * .8 - R.z) * ease; R.x += (THREE.MathUtils.clamp(-turn * 14, -.5, .5) - R.x) * ease * .7; slJump = false;
  // 遠くへ行くと小さくなる（見失わないよう、ほんの少しだけ大きく＋光をまとう）
  const dist = camera.position.distanceTo(pos), sc = 1.6; const land = Math.max(0, (k - .84) / .16), lf = land * land * (3 - 2 * land); sleigh.scale.setScalar(Math.max(.001, sc * (1 - lf))); slGlow.scale.setScalar(1.6 + lf * .8); trail.material.size = .05 * sc + dist * .004; slGlow.material.opacity = THREE.MathUtils.clamp((dist - 14) / 20, 0, .8) * (isNight ? 1 : .5) * (1 - Math.max(0, (k - .9) / .1));
  SL.animate(now);
  trailPos[trailI * 3] = x - slTan.x * .3 * sc + (Math.random() - .5) * .08 * sc; trailPos[trailI * 3 + 1] = y + .06 * sc + (Math.random() - .5) * .08 * sc; trailPos[trailI * 3 + 2] = z - slTan.z * .3 * sc; trailI = (trailI + 1) % trailN; trailGeo.attributes.position.needsUpdate = true;
  if (peek && now - sleighBell > SLPER * .8 && k > .05 && k < .2){ sleighBell = now; try { const c = window.kajiAudio && window.kajiAudio(); if (c) [1568, 1976, 2349, 1976, 1568].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + i * .11; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + .5); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .55); }); } catch (e) {} } };
const winLight = new THREE.PointLight('#9fc4ff', 1.5, 4); winLight.position.set(WX, 2.4, bz + .6); scene.add(winLight);
const outLight = new THREE.DirectionalLight('#bcd4ff', 1.2); outLight.position.set(WX - 2, 6, OUT_Z + 2); outLight.target.position.set(WX, .6, OUT_Z - 2.5); scene.add(outLight, outLight.target);

/* ---------- ツリー ---------- */
const treeRoot = new THREE.Group(); treeRoot.position.set(-1.15, 0, -1.65); scene.add(treeRoot); treeRoot.userData.inst = 'tree';
let nyMode = false, mochi = null, MOCHI_SLOTS = null; // 年末年始は餅花
const tree = new THREE.Group(); tree.scale.setScalar(.86); tree.rotation.y = opts.rot || 0; treeRoot.add(tree);
const potH = .62;
// 段（下から）：[下端y, 半径, 高さ]
// 高さは1.5倍（幅はそのまま）。飾りが広く散らばるように
const TREE_TALL = 1.5, TIERS = [[.86, 1.24, 1.22], [1.5, 1.0, 1.08], [2.06, .78, .94], [2.55, .55, .8], [2.96, .33, .64]].map(([yb, R, h]) => [.86 + (yb - .86) * TREE_TALL, R, h * TREE_TALL]);
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
const firBase = [...tree.children];
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
const TREE_SLOTS = slots.slice(); // ツリーのときの場所（年末年始は餅花の場所に入れかえる）
const placed = [], appear = [];
const usedSlots = new Set();
// ツリー全体で、まわりの飾りからいちばん離れたあいている場所を選ぶ
function pickSlot(){ const rot = tree.rotation.y, used = [...usedSlots].map(i => slots[i]); let best = -1, bs = -1e9, near = -1, nd = 1e9;
  for (let i = 0; i < slots.length; i++){ if (usedSlots.has(i)) continue; const p = slots[i]; let d = Math.atan2(p.x, p.z) + rot; d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
    if (d < nd){ nd = d; near = i; } // 裏側にもつく（正面寄りをほんの少しだけ好む）
    // まわりの飾りからいちばん離れたところ（上下にも左右にも散らばる）。正面寄りを少しだけ好む
    let m = 9; for (const q of used) m = Math.min(m, p.distanceTo(q)); const sc = Math.min(m, 1.2) - d * .05 + rnd() * .12; if (sc > bs){ bs = sc; best = i; } }
  return best >= 0 ? best : near; }
// 決まった場所があればそこ。ふたりがたまたま同じ場所を選んでいたら、いちばん近いあいている場所。なければ前から順に（どの端末でも同じ結果）
function slotFor(want){ if (Number.isInteger(want) && want >= 0 && want < slots.length){ if (!usedSlots.has(want)) return want; let best = -1, bd = 1e9; for (let i = 0; i < slots.length; i++){ if (usedSlots.has(i)) continue; const d = slots[i].distanceToSquared(slots[want]); if (d < bd){ bd = d; best = i; } } return best; }
  for (let i = 0; i < slots.length; i++) if (!usedSlots.has(i)) return i; return -1; }
function addOrnament(animate = true, id = null, type = null, want = null){ const idx = placed.length; let si = slotFor(want), p; if (si >= 0){ usedSlots.add(si); p = slots[si].clone(); } else { p = slots[idx % slots.length].clone().multiplyScalar(1.02).add(new THREE.Vector3(0, -.04 * Math.floor(idx / slots.length), 0)); } const o = makeOrnament(type || 'red'), OS = nyMode ? 3.3 : 1.45; o.userData.id = id; o.userData.base = OS; o.scale.setScalar(OS); o.children[0].position.y -= .13; if (nyMode) o.position.copy(p); else o.position.copy(p).add(new THREE.Vector3(0, .13 * 1.45, 0)); o.userData.orn = true; o.userData.ph = rnd() * 6; o.rotation.order = 'YXZ'; o.rotation.y = Math.atan2(p.x, p.z) + (rnd() - .5) * .6; o.rotation.z = (rnd() - .5) * .25; o.userData.rz = o.rotation.z; o.traverse(m => { if (m.isMesh) m.castShadow = true; }); tree.add(o); placed.push(o);
  if (animate){ o.scale.setScalar(.001); appear.push({ o, t0:performance.now() }); } shadowsDirty = true; }

/* ---------- プレゼント ---------- */
const WRAPS = [['#c8352e', '#f3ead9', 'stripe'], ['#3a6ab8', '#ffffff', 'dot'], ['#f2c14e', '#e0564a', 'check'], ['#3f9a4f', '#f3ead9', 'dot'], ['#f3ead9', '#c8352e', 'stripe'], ['#8a5ab8', '#f2c14e', 'check'], ['#f4a6bc', '#ffffff', 'dot']];
function wrapTex(a, b, kind){ return canvasTex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b;
  if (kind === 'stripe') for (let i = -4; i < 8; i++){ g.beginPath(); g.moveTo(i * 24, 0); g.lineTo(i * 24 + 10, 0); g.lineTo(i * 24 + 10 + h, h); g.lineTo(i * 24 + h, h); g.fill(); }
  if (kind === 'dot') for (let y = 10; y < h; y += 20) for (let x = (y / 20 % 2) * 10 + 6; x < w; x += 20){ g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  if (kind === 'check'){ g.globalAlpha = .45; for (let i = 0; i < 4; i++){ g.fillRect(i * 32 + 8, 0, 14, h); g.fillRect(0, i * 32 + 8, w, 14); } } }); }
const gifts = [];
const GIFT_SPOTS = Array.from({ length:9 }, (_, i) => { const t = i / 9 * Math.PI * 2 + .35; return [Math.sin(t) * .86, Math.cos(t) * .86]; }); // ツリーの枝の下に、ぐるっと
const giftRing = new THREE.Group(); treeRoot.add(giftRing);
// 8か所に置ききったら、その上に重ねていく（上ほど少し小さく）
function giftSeed(id){ let h = 2166136261; for (const ch of String(id || '')){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function buildGift(id){ const T = GIFT_TYPES[giftSeed(id) % GIFT_TYPES.length], g = new THREE.Group(), s1 = (giftSeed(id + 'w') % 1000) / 1000, s2 = (giftSeed(id + 'h') % 1000) / 1000;
  const rm = std(T.r, { roughness:.45, metalness:T.r === '#f2c14e' || T.r === '#d9a52a' ? .35 : .1 }), mat = std('#ffffff', { map:wrapTex(T.a, T.b, T.p), roughness:.6 });
  let w, h, d;
  if (T.s === 'round'){ const r = .19 + s1 * .04; h = .26 + s2 * .08; w = d = r * 2;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), mat); body.position.y = h / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(r + .02, r + .02, .06, 28), std(T.a, { roughness:.55 })); lid.position.y = h - .02; lid.castShadow = true; g.add(lid);
    // リボン：側面は筒に沿った細い帯、ふたの上は十字（面が重なってちらつかないよう、少し浮かせる）
    const bw = .05 / (r + .03);
    for (let q = 0; q < 4; q++){ const band = new THREE.Mesh(new THREE.CylinderGeometry(r + .028, r + .028, h + .012, 6, 1, true, q * Math.PI / 2 - bw / 2, bw), rm); band.position.y = h / 2 + .004; g.add(band); }
    for (const rot of [0, Math.PI / 2]){ const b = new THREE.Mesh(new THREE.BoxGeometry(r * 2 + .05, .012, .05), rm); b.position.y = h + .018; b.rotation.y = rot; g.add(b); } }
  else { [w, h, d] = T.s === 'tall' ? [.3 + s1 * .06, .52 + s2 * .14, .3 + s1 * .06] : T.s === 'flat' ? [.56 + s1 * .1, .15 + s2 * .05, .44 + s2 * .06] : T.s === 'cube' ? [.36, .36, .36] : [.34 + s1 * .22, .26 + s2 * .2, .3 + s2 * .2];
    const box = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, .035), mat); box.position.y = h / 2; box.castShadow = box.receiveShadow = true; g.add(box);
    const r1 = new THREE.Mesh(new RoundedBoxGeometry(w + .012, h + .012, .06, 2, .01), rm); r1.position.y = h / 2; g.add(r1);
    const r2 = new THREE.Mesh(new RoundedBoxGeometry(.06, h + .012, d + .012, 2, .01), rm); r2.position.y = h / 2; g.add(r2); }
  for (const s of [-1, 1]){ const t = new THREE.Mesh(new THREE.TorusGeometry(.06, .022, 8, 16), rm); t.position.set(s * .055, h + .045, 0); t.rotation.set(0, Math.PI / 2, s * .5); t.scale.set(1, 1.25, .8); t.castShadow = true; g.add(t); }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), rm); knot.position.y = h + .03; g.add(knot);
  g.userData.h = h; g.userData.w = w; g.userData.d = d; return g; }
// 8か所に置ききったら、その上に重ねていく（上ほど少し小さく）。見た目はプレゼントごとにランダム（どの端末でも同じ）
function addGift(animate = true, id = null){ const i = gifts.length, N = GIFT_SPOTS.length, lv = Math.floor(i / N); if (lv >= 2) return;
  // 場所もランダム（プレゼントごとに決まる）。あいている場所を、その子の番号から順にさがす
  const taken = new Set(gifts.filter(o => o.userData.lv === lv).map(o => o.userData.spot)); let spot = giftSeed(id + 'spot') % N; while (taken.has(spot)) spot = (spot + 1) % N;
  const ja = ((giftSeed(id + 'a') % 1000) / 1000 - .5) * .14, jr = .86 + ((giftSeed(id + 'r') % 1000) / 1000 - .5) * .12, t0 = spot / N * Math.PI * 2 + .35 + ja;
  const under = lv ? gifts.find(o => o.userData.lv === 0 && o.userData.spot === spot) : null, sc = Math.pow(.82, lv);
  const [x, z] = under ? [under.position.x, under.position.z] : [Math.sin(t0) * jr, Math.cos(t0) * jr];
  const g = buildGift(id || 'g' + i), h = g.userData.h, w = g.userData.w, d = g.userData.d;
  const y0 = under ? under.position.y + under.userData.h * under.userData.base : 0; g.userData.base = sc; g.userData.lv = lv; g.userData.spot = spot; g.scale.setScalar(sc);
  g.position.set(x + (lv ? (rnd() - .5) * .05 : 0), y0, z + (lv ? (rnd() - .5) * .05 : 0)); g.rotation.y = Math.atan2(x, z) + (rnd() - .5) * (lv ? 1.2 : .6); g.userData.id = id; g.userData.gift = true; giftRing.add(g); gifts.push(g); if (!lv){ g.userData.blob = blob(x, z, w * 2.1, d * 2.1, .9); giftRing.add(g.userData.blob); }
  if (animate){ g.scale.setScalar(.001); appear.push({ o:g, t0:performance.now() }); } shadowsDirty = true; }
function thumbGift(id){ const key = 'gift:' + (GIFT_TYPES[giftSeed(id) % GIFT_TYPES.length].k); if (thCache[key]) return thCache[key]; thumbFurn('tree'); const g = buildGift(id); thS.add(g); g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  thC.position.copy(c).addScaledVector(new THREE.Vector3(.35, .55, 1).normalize(), r / Math.sin(THREE.MathUtils.degToRad(14))); thC.lookAt(c); thR.render(thS, thC); const url = thR.domElement.toDataURL('image/png'); thS.remove(g); disposeG(g); return thCache[key] = url; }

// アドベントの開けていない箱：ツリーの足もと、正面でぴょこぴょこ
const advBox = (() => { const g = new THREE.Group(), w = .44, h = .38, d = .4;
  const box = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, .04), std('#ffffff', { map:wrapTex('#2f7a4a', '#f6d36a', 'dot'), roughness:.55 })); box.position.y = h / 2; box.castShadow = true; g.add(box);
  const rm = std('#d8303a', { roughness:.4, metalness:.1 });
  const r1 = new THREE.Mesh(new RoundedBoxGeometry(w + .014, h + .014, .07, 2, .012), rm); r1.position.y = h / 2; g.add(r1);
  const r2 = new THREE.Mesh(new RoundedBoxGeometry(.07, h + .014, d + .014, 2, .012), rm); r2.position.y = h / 2; g.add(r2);
  for (const s of [-1, 1]){ const t = new THREE.Mesh(new THREE.TorusGeometry(.075, .026, 8, 16), rm); t.position.set(s * .07, h + .055, 0); t.rotation.set(0, Math.PI / 2, s * .5); t.scale.set(1, 1.25, .8); g.add(t); }
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .035 : .08; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return sh; })(), { depth:.02, bevelEnabled:false }), std('#f2c14e', { roughness:.3, metalness:.5, emissive:'#7a5a10', emissiveIntensity:.4 }));
  star.position.set(0, h / 2, d / 2 + .02); g.add(star);
  g.position.set(.05, 0, 1.08); g.rotation.y = -.15; g.userData.id = 'advbox'; g.userData.gift = true; g.visible = false; treeRoot.add(g); return g; })();
function setAdvBox(on){ advBox.visible = !!on; shadowsDirty = true; }

/* ---------- 家具（アドベントで手に入る。場所ごとに3種類から選べる） ---------- */
const FPX = 1.28, FPW = 1.3, FPH = 1.32, OW = .7, OH = .72;
const fireLight = new THREE.PointLight('#ff9a4a', 4, 4.5); fireLight.position.set(FPX, .55, bz + .8); fireLight.intensity = 0; scene.add(fireLight);
const lampLight = new THREE.PointLight('#ffc878', 0, 3.2); lampLight.castShadow = false; scene.add(lampLight);
const kamaLight = new THREE.PointLight('#ff9a3a', 0, 1.6); scene.add(kamaLight);
let flames = [], fireGlow = null, fireBoost = -1e9;
const M = (c, o = {}) => std(c, o);
const feltM = c => std(c, { roughness:1 });
function blobIn(g, x, z, sx, sz = sx, op = 1){ const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map:blobTex, transparent:true, depthWrite:false, opacity:op })); m.rotation.x = -Math.PI / 2; m.position.set(x, .006, z); m.scale.set(sx, sz, 1); g.add(m); return m; }
function addM(g, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; }
const RB = (w, h, d, r = .04) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001));
function glowIn(g, c, s, op, x, y, z){ const gl = glow(c, s, op); gl.userData.glow = true; gl.position.set(x, y, z); g.add(gl); return gl; }
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
  if (kind === 'a'){ const w = makeDeco('c9', .78); g.add(w); g.userData.onTap = () => sway(w, .08, 1500, 'z'); }
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
  if (kind === 'a'){ const sm = new THREE.Group(); sm.rotation.y = -.25; sm.scale.setScalar(.8); g.add(sm); g.userData.onTap = () => sway(sm, .12, 1800, 'z'); const coal = M('#2a2a2e', { roughness:.4 });
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
  const tex = kind === 'd' ? canvasTex(128, 64, (c, w, h) => { for (let i = 0; i < 4; i++){ c.fillStyle = i % 2 ? '#fbf6ea' : '#d8303a'; c.fillRect(i * 32, 0, 32, h); } }, [2, 1]) : kind === 'a' ? canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c8352e'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 4; i++){ c.fillRect(i * 32 + 10, 0, 12, h); c.fillRect(0, i * 32 + 10, w, 12); } c.fillStyle = 'rgba(80,10,10,.18)'; for (let i = 0; i < 4; i++) c.fillRect(i * 32, 0, 3, h); }, [2, 4])
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
  if (kind === 'c'){ const ch = new THREE.Group(); ch.rotation.y = -.7; g.add(ch); g.userData.onTap = () => sway(ch, .14, 2600, 'x'); // ロッキングチェアがゆれる const cw = M('#9a6a3e', { roughness:.55 });
    for (const s of [-1, 1]){ addM(ch, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s * .25, .03, -.38), new THREE.Vector3(s * .25, .0, 0), new THREE.Vector3(s * .25, .04, .35)]), 20, .025, 8), cw); addM(ch, new THREE.CylinderGeometry(.025, .025, .42, 8), cw, s * .25, .22, .22); addM(ch, new THREE.CylinderGeometry(.025, .025, 1.05, 8), cw, s * .25, .52, -.24, -.18); addM(ch, new THREE.CylinderGeometry(.02, .02, .4, 8), cw, s * .25, .62, .05, Math.PI / 2 - .1); }
    addM(ch, RB(.56, .06, .5, .02), cw, 0, .42, 0); for (let i = 0; i < 5; i++) addM(ch, new THREE.CylinderGeometry(.015, .015, .5, 6), cw, -.2 + i * .1, .72, -.3, -.18); addM(ch, RB(.56, .06, .06, .02), cw, 0, 1.02, -.36, -.18);
    addM(ch, RB(.5, .08, .44, .04), M('#c8352e', { roughness:.9 }), 0, .48, .02); const bl = new THREE.PlaneGeometry(.55, .7, 10, 14), bp = bl.attributes.position; for (let i = 0; i < bp.count; i++){ const y = bp.getY(i); bp.setZ(i, y > 0 ? -y * .55 : 0); bp.setY(i, y > 0 ? .35 * (1 - .4) + y * .55 : y); } bl.computeVertexNormals();
    addM(ch, bl, M('#ffffff', { map:knitTexR('#f3ead9', '#3a8a52'), side:THREE.DoubleSide, roughness:1 }), 0, .55, -.05, -.25); blobIn(g, 0, 0, 1.0, 1.0, .6); }
  return g; }

/* 床のおもちゃ（3種）。位置はラグの上 */
function toys(kind){ const g = new THREE.Group();
  if (kind === 'a'){ const h = makeDeco('horse', .5); h.rotation.y = -.5; g.add(h); blobIn(g, 0, 0, .7, .5, .6); g.userData.onTap = () => sway(h, .22, 2200, 'z'); } // 木馬がゆれる
  if (kind === 'b'){ const curve = new THREE.CatmullRomCurve3(new THREE.EllipseCurve(0, 0, .55, .3).getPoints(64).slice(0, -1).map(p => new THREE.Vector3(p.x, 0, p.y)), true); for (const o of [-.03, .03]){ const m = addM(g, new THREE.TubeGeometry(curve, 120, .012, 4, true), M('#8a8e98', { metalness:.6, roughness:.3 }), 0, .012, 0); m.scale.set(1 + o, 1, 1 + o * 1.6); m.castShadow = false; }
    for (let i = 0; i < 22; i++){ const p = curve.getPoint(i / 22), t = curve.getTangent(i / 22); addM(g, RB(.03, .012, .13, .004), M('#7a4a2a'), p.x, .006, p.z, 0, Math.atan2(t.x, t.z)); }
    const t = makeDeco('c3', .26); t.position.set(.1, .02, .3); t.rotation.y = 0; g.add(t); let u = .25; // 汽車がひとまわり
    g.userData.onTap = () => { const u0 = u; animate(3200, k => { u = (u0 + (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)) % 1; const p = curve.getPointAt(u), tg = curve.getTangentAt(u); t.position.set(p.x, .02, p.z); t.rotation.y = Math.atan2(tg.x, tg.z) - Math.PI / 2; }); }; const b = makeDeco('w6', .26); b.position.set(-.75, 0, .35); g.add(b); blobIn(g, 0, 0, 1.4, .9, .5); }
  if (kind === 'c'){ const b = new THREE.Group(); b.rotation.y = -.3; g.add(b); g.userData.onTap = () => animate(900, k => { b.position.y = Math.abs(Math.sin(k * Math.PI * 2)) * .12 * (1 - k * .5); b.rotation.z = Math.sin(k * Math.PI * 4) * .08 * (1 - k); }); // くまがぴょんぴょん const fm = std('#b8783e', { roughness:1 }), lm = std('#e8c8a0', { roughness:1 });
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
function swatch(kind, isWall){ const g = new THREE.Group(); const t = isWall ? wallTexOf(kind) : floorTexOf(kind); t.repeat.set(isWall ? 1.2 : .9, isWall ? 1.2 : .9);
  const m = new THREE.Mesh(new RoundedBoxGeometry(1.2, isWall ? 1.2 : .05, isWall ? .05 : 1.2, 2, .02), std('#ffffff', { map:t, roughness:.7 })); m.position.y = isWall ? .6 : 0; g.add(m); g.userData.flatThumb = isWall ? 'wall' : 'floor';
  if (isWall && WAIN[kind]){ const [w, p, r, b] = WAIN[kind]; const add = (W, H, D, c, y, z) => { const x = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 2, .01), std(c, { roughness:.6 })); x.position.set(0, y, z); g.add(x); return x; };
    add(1.2, .42, .04, w, .21, .04); for (const x of [-.4, 0, .4]){ const pn = add(.3, .26, .02, p, .22, .07); pn.position.x = x; } add(1.22, .04, .08, r, .43, .06); add(1.22, .06, .07, b, .03, .06); }
  return g; }

/* ===== 年末年始の家具（12/26〜1/7に毎日とどく） ===== */
const washi = (c = '#fbf6ea') => canvasTex(128, 128, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++){ x.strokeStyle = `rgba(150,120,80,${Math.random() * .12})`; x.lineWidth = 1; const a = Math.random() * w, b = Math.random() * h; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (Math.random() - .5) * 20, b + (Math.random() - .5) * 20); x.stroke(); } }, [1, 1]);
function nyShimekazari(){ const g = new THREE.Group(); const straw = M('#d8b468', { roughness:.95 });
  const ring = new THREE.TorusGeometry(.26, .06, 10, 40); addM(g, ring, straw, 0, .5, .03); for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2; addM(g, new THREE.TorusGeometry(.06, .02, 6, 12), M('#c8a050', { roughness:.95 }), Math.cos(a) * .26, .5 + Math.sin(a) * .26, .05, 0, 0, a); }
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) addM(g, RB(.06, .07, .01, .005), M('#ffffff', { roughness:.7 }), s * (.08 + (k % 2) * .03), .2 - k * .07, .08, 0, 0, s * .2);
  for (let i = 0; i < 9; i++) addM(g, new THREE.CylinderGeometry(.008, .004, .3, 4), straw, -.12 + i * .03, .08, .04);
  const o = makeDeco('e_mikan', .15); o.position.set(0, .36, .1); g.add(o); const f = makeDeco('e_sensu0', .22); f.position.set(0, .62, .07); g.add(f); const mz = makeDeco('e_mizuhiki', .16); mz.position.set(0, .26, .1); g.add(mz); return g; }
function nyKakejiku(){ const g = new THREE.Group(); const art = canvasTex(192, 448, (x, w, h) => { x.fillStyle = '#f6ecd6'; x.fillRect(0, 0, w, h); const sky = x.createLinearGradient(0, 40, 0, 300); sky.addColorStop(0, '#f8c8a0'); sky.addColorStop(1, '#fbecd6'); x.fillStyle = sky; x.fillRect(20, 40, w - 40, 260);
    x.fillStyle = '#e8402e'; x.beginPath(); x.arc(w / 2, 120, 34, 0, 7); x.fill(); x.fillStyle = '#3a5a9a'; x.beginPath(); x.moveTo(20, 300); x.lineTo(w / 2, 170); x.lineTo(w - 20, 300); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(w / 2 - 34, 210); x.lineTo(w / 2, 170); x.lineTo(w / 2 + 34, 210); for (let i = 0; i < 5; i++) x.lineTo(w / 2 + 34 - i * 17, 210 + (i % 2 ? 10 : 0)); x.fill();
    x.fillStyle = '#231c1c'; x.font = 'bold 54px serif'; x.textAlign = 'center'; x.fillText('福', w / 2, 370); x.fillStyle = '#d8303a'; x.fillRect(w / 2 + 30, 392, 18, 18); });
  addM(g, RB(.46, 1.2, .015, .005), M('#3a4a6a', { roughness:.7 }), 0, .7, 0); addM(g, new THREE.PlaneGeometry(.38, .9), M('#ffffff', { map:art, roughness:.8 }), 0, .72, .01);
  for (const y of [1.31, .1]) addM(g, new THREE.CylinderGeometry(.022, .022, .54, 12), M('#6a3a1e', { roughness:.4 }), 0, y, .01, 0, 0, Math.PI / 2); for (const s of [-1, 1]) addM(g, new THREE.SphereGeometry(.03, 10, 8), M('#e7b84a', { metalness:.6, roughness:.3 }), s * .28, .1, .01);
  addM(g, new THREE.CylinderGeometry(.004, .004, .25, 4), M('#6a3a1e'), -.1, 1.42, .005, 0, 0, -.7); addM(g, new THREE.CylinderGeometry(.004, .004, .25, 4), M('#6a3a1e'), .1, 1.42, .005, 0, 0, .7); return g; }
function nyKotatsu(){ const g = new THREE.Group(); const quilt = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#c8352e'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8a040'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++){ const cx = 22 + i * 44, cy = 22 + j * 44; for (let k = 0; k < 5; k++){ const a = k / 5 * 7; x.beginPath(); x.arc(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 6, 0, 7); x.fill(); } } x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < w; i += 32) x.fillRect(i, 0, 3, h); }, [2, 2]);
  const geo = new THREE.BoxGeometry(1.5, .4, 1.2, 12, 4, 10), p = geo.attributes.position; for (let i = 0; i < p.count; i++){ const y = p.getY(i); if (y < .1){ const k = 1 + (.1 - y) * .35; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } p.setY(i, y + Math.sin(p.getX(i) * 9) * .01); } geo.computeVertexNormals();
  addM(g, geo, M('#ffffff', { map:quilt, roughness:.95 }), 0, .2, 0); addM(g, RB(1.25, .06, .95, .03), M('#9a6438', { roughness:.4 }), 0, .43, 0);
  const basket = new THREE.Group(); basket.position.set(.15, .46, .05); g.add(basket); addM(basket, new THREE.CylinderGeometry(.2, .15, .08, 24, 1, true), M('#b8864a', { roughness:.8, side:THREE.DoubleSide }), 0, .04); addM(basket, new THREE.CylinderGeometry(.15, .15, .01, 24), M('#a8763a'), 0, .005);
  for (const [x, z, y] of [[-.07, -.04, .07], [.07, -.02, .07], [0, .07, .07], [0, 0, .15]]){ const m = makeDeco('e_mikan', .11); m.position.set(x, y - .05, z); basket.add(m); }
  const tea = new THREE.Group(); tea.position.set(-.35, .46, -.1); g.add(tea); addM(tea, new THREE.CylinderGeometry(.05, .045, .09, 16), M('#3f6a4a', { roughness:.4 }), 0, .045); return g; }
function nyZabuton(){ const g = new THREE.Group(); const t = (bg, fg) => canvasTex(128, 128, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = fg; x.lineWidth = 3; for (let i = 0; i < 6; i++){ x.beginPath(); x.arc(64, 64, 10 + i * 10, 0, 7); x.stroke(); } }, [1, 1]);
  for (const [x, z, ry, bg] of [[-.45, 0, .1, '#3a4a8a'], [.45, .05, -.15, '#c8352e']]){ const c = addM(g, RB(.62, .1, .62, .05), M('#ffffff', { map:t(bg, 'rgba(255,255,255,.35)'), roughness:.9 }), x, .05, z, 0, ry); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) addM(g, new THREE.SphereGeometry(.03, 8, 6), M('#e7b84a', { roughness:.5 }), x + sx * .3 * Math.cos(ry) + sz * .3 * Math.sin(ry), .07, z - sx * .3 * Math.sin(ry) + sz * .3 * Math.cos(ry)); addM(g, new THREE.SphereGeometry(.035, 8, 6), M('#e7b84a'), x, .105, z); }
  blobIn(g, 0, 0, 1.8, .9, .3); return g; }
function nyAndon(){ const g = new THREE.Group(); const wd = M('#4a2a1a', { roughness:.5 }); const pm = new THREE.MeshStandardMaterial({ color:'#fff4dc', map:washi('#fff4dc'), emissive:'#ffc070', emissiveIntensity:.85, roughness:.9 });
  addM(g, RB(.36, .04, .36, .01), wd, 0, .02); for (const [x, z] of [[-.16, -.16], [.16, -.16], [-.16, .16], [.16, .16]]) addM(g, RB(.03, .9, .03, .01), wd, x, .47, z); addM(g, RB(.3, .66, .3, .005), pm, 0, .52); for (const y of [.18, .86]) addM(g, RB(.36, .03, .36, .01), wd, 0, y);
  addM(g, RB(.03, .03, .3, .005), wd, 0, .52, .155); glowIn(g, '#ffb860', 1.1, .55, 0, .52, .2); g.userData.lamp = [0, .55, 0]; return g; }
function nyKadomatsu(){ const g = new THREE.Group(); for (const s of [-1, 1]){ const k = makeDeco('e_kado', 1.15); k.position.set(s * .42, 0, 0); g.add(k); } blobIn(g, 0, 0, 1.6, .7, .3); return g; }
function nySillKagami(){ const g = new THREE.Group(); const k = makeDeco('e_kagami', .34); k.position.set(-.38, 0, .22); g.add(k); const u = makeDeco('e_ume0', .14); u.position.set(.32, .04, .22); g.add(u); const u2 = makeDeco('e_ume1', .11); u2.position.set(.45, 0, .26); g.add(u2); return g; }
function nyToys(){ const g = new THREE.Group(); const h = makeDeco('e_hg0', .62); h.position.set(-.2, 0, -.05); h.rotation.set(-.25, .2, .1); g.add(h); const h2 = makeDeco('e_hg1', .55); h2.position.set(.05, 0, -.1); h2.rotation.set(-.25, -.15, -.12); g.add(h2);
  for (const [x, z] of [[.3, .15], [.45, -.05]]){ const k = makeDeco('e_koma', .18); k.position.set(x, 0, z); g.add(k); } const tk = makeDeco('e_tako', .4); tk.position.set(-.45, 0, .2); tk.rotation.set(-1.45, 0, .3); g.add(tk); blobIn(g, 0, 0, 1.4, .9, .35); return g; }
function nySunrise(){ const g = new THREE.Group(); const f = makeDeco('e_fuji', .9); f.position.set(0, 0, -.2); g.add(f); addM(g, new THREE.SphereGeometry(.22, 32, 20), new THREE.MeshStandardMaterial({ color:'#ff6a3a', emissive:'#ff5a2a', emissiveIntensity:1.4 }), .35, .9, -.5); glowIn(g, '#ff9a5a', 1.4, .7, .35, .9, -.45); return g; }
function nyRug(){ const g = new THREE.Group(); const tex = canvasTex(512, 384, (x, w, h) => { x.fillStyle = '#2f4a7a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f3ead9'; x.lineWidth = 3; for (let r = 0; r < 10; r++) for (let q = -1; q < 12; q++){ const cx = q * 48 + (r % 2) * 24, cy = r * 40; for (let k = 1; k <= 3; k++){ x.beginPath(); x.arc(cx, cy, k * 8, Math.PI, 0); x.stroke(); } }
    x.strokeStyle = '#c8352e'; x.lineWidth = 18; x.strokeRect(9, 9, w - 18, h - 18); x.strokeStyle = '#e7b84a'; x.lineWidth = 4; x.strokeRect(22, 22, w - 44, h - 44); });
  const geo = new THREE.BoxGeometry(2.2, .03, 1.6); const m = addM(g, geo, [M('#c8352e'), M('#c8352e'), M('#ffffff', { map:tex, roughness:.9 }), M('#c8352e'), M('#c8352e'), M('#c8352e')], 0, .015, 0); m.castShadow = false; return g; }
function nyMousen(){ const g = new THREE.Group(); addM(g, new THREE.CylinderGeometry(1.1, 1.12, .03, 64), M('#c8302c', { roughness:.95 }), 0, .015); addM(g, new THREE.TorusGeometry(1.11, .025, 8, 72), M('#e7b84a', { roughness:.4, metalness:.4 }), 0, .03, 0, Math.PI / 2); return g; }
function nyNanakusa(){ const g = new THREE.Group(); addM(g, new THREE.CylinderGeometry(.42, .32, .18, 28, 1, true), M('#b8864a', { roughness:.85, side:THREE.DoubleSide }), 0, .09); addM(g, new THREE.CylinderGeometry(.32, .32, .02, 28), M('#a8763a'), 0, .01);
  const greens = ['#5aac4a', '#7cc05a', '#3f8a3a', '#9ad06a']; for (let i = 0; i < 26; i++){ const a = i * 2.4, r = Math.sqrt(i / 26) * .3; addM(g, new THREE.SphereGeometry(.07, 10, 8), M(greens[i % 4], { roughness:.7 }), Math.cos(a) * r, .17 + (i % 3) * .02, Math.sin(a) * r, 0, a, 0, 1.4, .5, .8); }
  for (const [x, z] of [[.12, .05], [-.1, -.08]]) addM(g, new THREE.SphereGeometry(.06, 12, 10), M('#fbf6ea', { roughness:.5 }), x, .2, z); blobIn(g, 0, 0, 1.1, 1.1, .3); return g; }

/* 動く家具（金魚など）：部屋に置かれている間だけ毎フレーム動かす */
const ANIMS = []; function animate(dur, f){ ANIMS.push({ t0:performance.now(), dur, f }); }
function stepAnims(now){ for (let i = ANIMS.length - 1; i >= 0; i--){ const a = ANIMS[i], k = Math.min(1, (now - a.t0) / a.dur); a.f(k); if (k >= 1){ ANIMS.splice(i, 1); shadowsDirty = true; } } }
const decay = (k, n = 3) => Math.sin(k * Math.PI * n) * (1 - k);
function sway(o, amp = .12, dur = 1400, axis = 'z'){ const r0 = o.rotation[axis]; animate(dur, k => { o.rotation[axis] = r0 + amp * decay(k, 4); }); }
const TICK = []; function ticker(o, f){ o.userData.tick = f; o.userData.born = performance.now(); TICK.push(o); }
ticker(sleigh, sleighTick);
function tickAll(now){ for (let i = TICK.length - 1; i >= 0; i--){ const o = TICK[i]; let p = o; while (p.parent) p = p.parent; if (p !== scene){ if (now - o.userData.born > 4000) TICK.splice(i, 1); continue; } o.userData.tick(now / 1000); } }
/* ===== ふくびきで当たる家具（つくりこみ版） ===== */
const kjCache = {};
const woodT = (c1 = '#b07a48', c2 = '#8a5a32', rep = [1, 1]) => kjCache['w' + c1 + c2 + rep] || (kjCache['w' + c1 + c2 + rep] = canvasTex(256, 256, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++){ g.strokeStyle = `rgba(70,40,20,${.05 + Math.random() * .12})`; g.lineWidth = .6 + Math.random() * 1.6; const y = Math.random() * h; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * .03 + i) * 3); g.stroke(); } g.fillStyle = c2; g.globalAlpha = .18; for (let i = 0; i < 4; i++){ g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8, 3, 0, 0, 7); g.fill(); } g.globalAlpha = 1; }, rep));
const fabT = (c, line = 'rgba(255,255,255,.08)', rep = [2, 2]) => kjCache['f' + c + line + rep] || (kjCache['f' + c + line + rep] = canvasTex(128, 128, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.strokeStyle = line; g.lineWidth = 1; for (let i = 0; i < w; i += 3){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } for (let i = 0; i < 600; i++){ g.fillStyle = `rgba(0,0,0,${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } }, rep));
const WOOD = (c1, c2, o = {}) => M('#ffffff', { map:woodT(c1, c2), roughness:.55, ...o });
const glaze = (c) => new THREE.MeshPhysicalMaterial({ color:c, roughness:.28, clearcoat:.8, clearcoatRoughness:.2 });
const soilM = () => kjCache.soil || (kjCache.soil = M('#ffffff', { map:canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#4a3222'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++){ g.fillStyle = `rgba(${Math.random() < .5 ? '20,10,5' : '120,90,60'},.5)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [1, 1]), roughness:1 }));
// 鉢：ふちと受け皿つき
function kpot(g, r = .2, h = .32, mat = glaze('#f3ead9'), saucer = true){ const prof = [[.001, 0], [r * .78, 0], [r * .8, .02], [r * .97, h * .9], [r * 1.08, h * .92], [r * 1.1, h], [r * .95, h], [r * .9, h * .93]].map(([x, y]) => new THREE.Vector2(x, y));
  addM(g, new THREE.LatheGeometry(prof, 40), mat, 0, saucer ? .03 : 0); if (saucer) addM(g, new THREE.CylinderGeometry(r * 1.05, r * .95, .03, 40), mat, 0, .015); addM(g, new THREE.CylinderGeometry(r * .9, r * .9, .015, 32), soilM(), 0, h * .9 + (saucer ? .03 : 0)); return h * .9 + (saucer ? .03 : 0); }
// 葉：葉脈つき、ふくらみと反り
const veinT = (c, c2) => kjCache['v' + c] || (kjCache['v' + c] = canvasTex(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, c2); gr.addColorStop(.5, c); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(220,240,200,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke(); g.lineWidth = 1.3; for (let y = 20; y < h; y += 22) for (const s of [-1, 1]){ g.beginPath(); g.moveTo(w / 2, y + 14); g.quadraticCurveTo(w / 2 + s * 30, y + 4, w / 2 + s * 60, y - 6); g.stroke(); } }, [1, 1]));
function leafGeo(shape, bend = .25, cup = .15){ const geo = new THREE.ShapeGeometry(shape, 10), p = geo.attributes.position, uv = geo.attributes.uv; geo.computeBoundingBox(); const bb = geo.boundingBox, H = bb.max.y - bb.min.y || 1, Wd = (bb.max.x - bb.min.x) || 1;
  for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), t = (y - bb.min.y) / H; p.setZ(i, -bend * t * t * H + cup * (x / Wd) * (x / Wd) * Wd * 2); uv.setXY(i, (x - bb.min.x) / Wd, t); } geo.computeVertexNormals(); return geo; }
const leafShape = (w = .5, len = 1, tip = .1) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(w * .9, len * .15, w, len * .6, 0, len); s.bezierCurveTo(-w, len * .6, -w * .9, len * .15, 0, 0); return s; };
const leafMat = (c = '#2f7a3e', c2 = '#25602f') => M('#ffffff', { map:veinT(c, c2), side:THREE.DoubleSide, roughness:.5 });
function leafAt(g, geo, mat, base, dir, scale, roll = 0){ const l = new THREE.Mesh(geo, mat); l.position.copy(base); l.scale.setScalar(scale); const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize()); l.quaternion.copy(q); l.rotateY(roll); l.castShadow = true; g.add(l); return l; }
function stem(g, pts, r, mat){ const m = addM(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, r, 6), mat); m.castShadow = true; return m; }
const KV = (x, y, z) => new THREE.Vector3(x, y, z);

function kjMonstera(){ const g = new THREE.Group(); const top = kpot(g, .23, .36, glaze('#f1ece2'));
  const sh = (() => { const s = new THREE.Shape(); const w = .55; s.moveTo(0, 0); s.bezierCurveTo(w, .05, w * 1.05, .7, 0, 1); s.bezierCurveTo(-w * 1.05, .7, -w, .05, 0, 0);
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ const hl = new THREE.Path(), y = .3 + k * .2, x = sd * (.22 + k * .02); hl.moveTo(x, y); hl.ellipse(x, y, .045, .07, 0, Math.PI * 2, false, sd * .5); s.holes.push(hl); } return s; })();
  const geo = leafGeo(sh, .35, .1), mat = leafMat('#2e7a3c', '#21592b'), pm = M('#5a8a3a', { roughness:.6 });
  for (let i = 0; i < 9; i++){ const a = i * 2.39 + .3, out = .2 + (i % 3) * .12, hgt = .5 + (i % 4) * .16; const tip = KV(Math.cos(a) * out, top + hgt, Math.sin(a) * out);
    stem(g, [KV(Math.cos(a) * .03, top, Math.sin(a) * .03), KV(Math.cos(a) * out * .4, top + hgt * .7, Math.sin(a) * out * .4), tip], .011, pm);
    leafAt(g, geo, mat, tip, KV(Math.cos(a) * .9, .55, Math.sin(a) * .9), .62 + (i % 3) * .08, (i % 2 ? .4 : -.4)); }
  for (const a of [1, 3.5]) stem(g, [KV(Math.cos(a) * .05, top + .3, Math.sin(a) * .05), KV(Math.cos(a) * .2, top + .1, Math.sin(a) * .2), KV(Math.cos(a) * .24, top - .02, Math.sin(a) * .24)], .006, M('#8a6a4a')); g.userData.onTap = () => sway(g, .08, 1600, 'z'); return g; }
function kjCactus(){ const g = new THREE.Group(); const top = kpot(g, .16, .2, glaze('#c8724a')); addM(g, new THREE.CylinderGeometry(.14, .14, .012, 28), M('#e8d8b0', { roughness:1 }), 0, top + .005);
  const ribbed = (r, h) => { const geo = new THREE.LatheGeometry(Array.from({ length:12 }, (_, i) => { const t = i / 11; return new THREE.Vector2(r * Math.sin(Math.min(1, t * 3.5) * Math.PI / 2) * (1 - Math.max(0, t - .8) * 2.2), t * h); }), 48), p = geo.attributes.position; for (let i = 0; i < p.count; i++){ const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + .09 * Math.cos(a * 10); p.setX(i, x * k); p.setZ(i, z * k); } geo.computeVertexNormals(); return geo; };
  const cm = M('#4f8f4a', { roughness:.55 }), spine = M('#f6efd8'); const body = (r, h, x, y, z, rz) => { const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.z = rz; g.add(grp); addM(grp, ribbed(r, h), cm); for (let k = 0; k < 40; k++){ const a = k / 10 * Math.PI * 2 / 1 + (k % 2) * .3, t = .15 + (k % 8) / 8 * .7; addM(grp, new THREE.ConeGeometry(.004, .03, 4), spine, Math.cos(a) * r * 1.08, t * h, Math.sin(a) * r * 1.08, 0, 0, -Math.cos(a) * 1.4); } return grp; };
  body(.1, .62, 0, top, 0, 0); const arm1 = body(.055, .22, .12, top + .25, 0, -.9); const arm2 = body(.05, .18, -.11, top + .32, .02, .9);
  for (let k = 0; k < 6; k++){ const a = k / 6 * Math.PI * 2; addM(g, new THREE.SphereGeometry(.022, 8, 6), M('#f27a9a', { roughness:.5 }), Math.cos(a) * .025, top + .64, Math.sin(a) * .025, 0, 0, 0, 1, .6, 1); } addM(g, new THREE.SphereGeometry(.015, 8, 6), M('#f6d040'), 0, top + .65, 0); g.userData.onTap = () => sway(g, .08, 1600, 'z'); return g; }
function kjPachira(){ const g = new THREE.Group(); const top = kpot(g, .21, .34, glaze('#5a4a3e')); const tr = WOOD('#9a8060', '#6a5238', { roughness:.8 });
  for (let k = 0; k < 3; k++){ const pts = []; for (let i = 0; i <= 12; i++){ const t = i / 12, a = t * Math.PI * 4 + k * Math.PI * 2 / 3; pts.push(KV(Math.cos(a) * .035, top + t * .85, Math.sin(a) * .035)); } stem(g, pts, .022, tr); }
  const geo = leafGeo(leafShape(.28, 1), .2, .12), mat = leafMat('#4f9a46', '#3a7a36'), pm = M('#6a9a4a');
  for (let i = 0; i < 7; i++){ const a = i * 2.2, base = KV(Math.cos(a) * .03, top + .8 + (i % 3) * .07, Math.sin(a) * .03), tip = KV(Math.cos(a) * .3, top + 1.0 + (i % 3) * .1, Math.sin(a) * .3); stem(g, [base, base.clone().lerp(tip, .5).add(KV(0, .05, 0)), tip], .006, pm);
    for (let k = 0; k < 5; k++){ const b = a + (k - 2) * .45; leafAt(g, geo, mat, tip, KV(Math.cos(b), .45, Math.sin(b)), .34, 0); } } g.userData.onTap = () => sway(g, .08, 1600, 'z'); return g; }
function kjPothos(){ const g = new THREE.Group(); const wd = WOOD('#c89a62', '#9a6a3a'); // 木のプラントスタンド
  addM(g, new THREE.CylinderGeometry(.2, .2, .03, 32), wd, 0, .62); for (let i = 0; i < 3; i++){ const a = i / 3 * Math.PI * 2; addM(g, new THREE.CylinderGeometry(.018, .022, .66, 10), wd, Math.cos(a) * .16, .31, Math.sin(a) * .16, Math.sin(a) * .12, 0, -Math.cos(a) * .12); }
  addM(g, new THREE.TorusGeometry(.14, .012, 6, 30), wd, 0, .25, 0, Math.PI / 2); const top = new THREE.Group(); top.position.y = .635; g.add(top); const t2 = kpot(top, .15, .2, glaze('#fbf7ee'), false);
  const geo = leafGeo((() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(.55, .1, .5, .7, 0, 1); s.bezierCurveTo(-.5, .7, -.55, .1, 0, 0); return s; })(), .15, .2), m1 = leafMat('#5aa84a', '#3f8a3a'), m2 = leafMat('#9ac85a', '#6aa840'), vine = M('#6a9a4a');
  for (let v = 0; v < 7; v++){ const a = v / 7 * Math.PI * 2 + .2, len = .4 + (v % 3) * .2, pts = []; for (let k = 0; k <= 8; k++){ const t = k / 8; pts.push(KV(Math.cos(a) * (.1 + t * .12), t2 - t * len + Math.sin(t * 3) * .05, Math.sin(a) * (.1 + t * .12))); } stem(top, pts, .006, vine);
    pts.forEach((p, k) => { if (k < 1) return; leafAt(top, geo, k % 2 ? m1 : m2, p, KV(Math.cos(a + (k % 2 ? .6 : -.6)), .25, Math.sin(a + (k % 2 ? .6 : -.6))), .09 + (k < 3 ? .03 : 0), 0); }); }
  for (let k = 0; k < 8; k++){ const a = k * 2.4; leafAt(top, geo, k % 2 ? m1 : m2, KV(Math.cos(a) * .05, t2, Math.sin(a) * .05), KV(Math.cos(a) * .5, 1, Math.sin(a) * .5), .11, 0); } g.userData.onTap = () => sway(g, .08, 1600, 'z'); return g; }
function kjOlive(){ const g = new THREE.Group(); const top = kpot(g, .2, .32, M('#ffffff', { map:fabT('#d8c8a8', 'rgba(120,90,50,.15)'), roughness:.95 })); const bark = WOOD('#8a7a62', '#5a4a3a', { roughness:.85 });
  stem(g, [KV(0, top, 0), KV(.03, top + .35, 0), KV(-.02, top + .7, .02), KV(0, top + .95, 0)], .025, bark); const br = [[.25, .15, .8], [-.22, .05, .88], [.05, -.22, .82], [-.08, .24, .95], [.2, -.1, 1.02]];
  br.forEach(([x, z, y]) => stem(g, [KV(0, top + y - .25, 0), KV(x * .5, top + y - .05, z * .5), KV(x, top + y + .05, z)], .01, bark));
  const geo = leafGeo(leafShape(.12, 1), .15, .05), mat = leafMat('#8aa680', '#6a8a64'), ol = M('#3a4a2a', { roughness:.3 });
  br.forEach(([x, z, y], bi) => { for (let k = 0; k < 26; k++){ const t = k / 26, p = KV(x * (.4 + t * .7), top + y - .05 + t * .1 + (k % 3 - 1) * .04, z * (.4 + t * .7)); const a = k * 2.4; leafAt(g, geo, mat, p, KV(Math.cos(a), .5 + (k % 3) * .2, Math.sin(a)), .1, 0); if (k % 7 === 3) addM(g, new THREE.SphereGeometry(.016, 10, 8), ol, p.x, p.y - .02, p.z, 0, 0, 0, 1, 1.3, 1); } }); g.userData.onTap = () => sway(g, .08, 1600, 'z'); return g; }
function kjSucculent(){ const g = new THREE.Group(); const wd = WOOD('#c89a62', '#9a6a3a'); for (const [w, d, x, z] of [[.6, .03, 0, .17], [.6, .03, 0, -.17], [.03, .34, .3, 0], [.03, .34, -.3, 0]]) addM(g, RB(w, .16, d, .01), wd, x, .08, z); addM(g, RB(.58, .02, .32, .005), soilM(), 0, .14);
  const rosette = (x, z, c, c2, n, s) => { const grp = new THREE.Group(); grp.position.set(x, .14, z); grp.scale.setScalar(s); g.add(grp); for (let l = 0; l < 4; l++) for (let k = 0; k < n; k++){ const a = k / n * Math.PI * 2 + l * .4, r = .05 - l * .011, tilt = .9 - l * .25; const p = addM(grp, new THREE.SphereGeometry(.03 - l * .004, 10, 8), M(l < 2 ? c : c2, { roughness:.45 }), Math.cos(a) * r, .015 + l * .012, Math.sin(a) * r, 0, -a, tilt, 1.5, .45, .8); p.castShadow = true; } };
  rosette(-.17, -.05, '#8ab8a0', '#a8d0b8', 9, 1.1); rosette(.02, .06, '#c8a0b0', '#e0c0c8', 8, .9); rosette(.18, -.06, '#9ab870', '#b8d090', 10, 1.0); rosette(-.05, -.08, '#7aa8b8', '#a0c8d0', 7, .7); rosette(.16, .09, '#b8b070', '#d8d098', 8, .6);
  for (let i = 0; i < 5; i++) addM(g, new THREE.SphereGeometry(.02, 8, 6), M('#f6f0e0'), -.25 + i * .1, .155, .1 - (i % 2) * .2, 0, 0, 0, 1, .5, 1); g.userData.onTap = () => sway(g, .08, 1600, 'z'); return g; }
function kjBlocks(){ const g = new THREE.Group(); const cs = ['#e8503a', '#f2c14e', '#4a8ad8', '#5aac5a', '#f49aac']; const face = (ch, c) => canvasTex(96, 96, (x, w, h) => { x.fillStyle = '#f3e2c0'; x.fillRect(0, 0, w, h); x.fillStyle = c; x.fillRect(8, 8, w - 16, h - 16); x.fillStyle = '#fff8e8'; x.font = 'bold 56px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, w / 2, h / 2 + 3); }, [1, 1]);
  [['A', 0, 0, 0, 0], ['B', .14, 0, .03, 1], ['C', .07, .135, .01, 2], ['D', -.16, 0, .12, 3], ['E', .28, 0, -.14, 4], ['F', .07, .27, .02, 0]].forEach(([ch, x, y, z, c], i) => { const mats = Array.from({ length:6 }, (_, k) => M('#ffffff', { map:face(k === 4 ? ch : '', cs[(c + k) % 5]), roughness:.55 })); addM(g, RB(.13, .13, .13, .015), mats, x, y + .065, z, 0, i * .25, 0); });
  addM(g, new THREE.CylinderGeometry(.065, .065, .13, 24), WOOD('#e8b84a', '#c8902a'), -.28, .065, -.1); const cone = addM(g, new THREE.ConeGeometry(.09, .14, 4), M(cs[0], { roughness:.5 }), .07, .465, .01, 0, Math.PI / 4); g.userData.onTap = () => animate(700, k => { cone.position.y = .465 + Math.sin(k * Math.PI) * .12; cone.rotation.y = Math.PI / 4 + k * Math.PI; }); addM(g, RB(.26, .05, .07, .01), WOOD('#5aac5a', '#3a8a3a'), -.05, .025, .2, 0, .4); return g; }
// 世界地図（経度・緯度のおおまかな輪郭）
const WORLD = [
 [[-168,66],[-162,70],[-152,71],[-140,70],[-128,70],[-115,68],[-95,72],[-82,73],[-80,63],[-94,59],[-87,55],[-80,52],[-78,62],[-70,60],[-64,60],[-56,52],[-60,46],[-66,45],[-70,42],[-74,40],[-76,35],[-81,31],[-80,26],[-82,25],[-84,30],[-90,30],[-97,27],[-97,22],[-92,18],[-87,21],[-88,16],[-84,11],[-79,9],[-82,8],[-86,12],[-92,15],[-105,20],[-110,24],[-112,30],[-117,32],[-121,35],[-124,41],[-124,48],[-128,51],[-133,55],[-140,59],[-150,60],[-158,57],[-165,60],[-166,64]],
 [[-78,9],[-73,11],[-64,10],[-58,7],[-52,4],[-50,0],[-44,-2],[-38,-4],[-35,-8],[-38,-13],[-40,-20],[-45,-23],[-48,-26],[-52,-32],[-57,-36],[-62,-39],[-65,-42],[-66,-47],[-68,-51],[-70,-54],[-74,-50],[-74,-44],[-73,-38],[-71,-30],[-70,-18],[-76,-14],[-80,-6],[-81,-2],[-78,2],[-78,6]],
 [[-10,36],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[10,58],[5,60],[5,62],[12,66],[18,70],[25,71],[32,70],[40,67],[44,68],[55,69],[68,72],[80,73],[95,76],[105,77],[115,74],[130,72],[140,72],[150,71],[160,70],[172,69],[180,66],[175,62],[163,60],[160,55],[156,51],[150,59],[143,59],[137,54],[141,47],[135,43],[130,42],[127,38],[126,35],[121,31],[122,28],[119,25],[114,22],[108,21],[106,17],[109,12],[105,9],[103,11],[100,13],[101,7],[103,2],[98,8],[98,15],[94,17],[92,22],[88,22],[86,20],[80,15],[78,8],[73,16],[72,21],[67,25],[61,25],[57,26],[56,23],[59,22],[55,17],[52,16],[45,13],[43,15],[39,21],[35,28],[33,31],[35,36],[30,36],[27,37],[26,40],[29,41],[36,41],[41,41],[40,44],[35,45],[30,46],[28,44],[24,40],[22,37],[21,40],[19,42],[15,45],[13,44],[16,41],[18,40],[15,38],[12,42],[9,44],[4,43],[0,39],[-2,37],[-6,36]],
 [[-17,21],[-16,28],[-10,30],[-9,33],[-6,36],[0,36],[10,37],[11,33],[20,31],[25,32],[32,31],[34,28],[37,22],[39,17],[43,12],[51,12],[49,6],[43,-1],[40,-5],[40,-11],[36,-18],[35,-24],[33,-27],[28,-33],[20,-35],[18,-31],[14,-24],[12,-18],[13,-11],[12,-5],[9,-1],[9,4],[4,6],[-3,5],[-8,4],[-12,7],[-15,11],[-17,15]],
 [[114,-22],[114,-26],[115,-34],[118,-35],[124,-34],[129,-32],[134,-33],[138,-35],[141,-38],[146,-39],[150,-37],[153,-31],[153,-26],[150,-22],[146,-19],[145,-15],[142,-11],[141,-17],[136,-12],[132,-11],[129,-15],[125,-14],[122,-18]],
 [[-180,-78],[-150,-77],[-120,-74],[-90,-72],[-65,-64],[-58,-64],[-60,-70],[-45,-78],[-20,-74],[0,-70],[30,-69],[60,-67],[90,-66],[120,-66],[150,-69],[170,-72],[180,-78],[180,-90],[-180,-90]],
 [[-55,60],[-44,60],[-35,66],[-22,70],[-18,77],[-30,83],[-50,82],[-62,81],[-70,77],[-60,74],[-55,68]],
 [[-5,50],[1,51],[2,53],[0,55],[-2,57],[-5,58],[-6,56],[-4,54],[-3,52]],
 [[130,31],[132,33],[135,34],[138,35],[140,36],[141,38],[142,41],[140,40],[139,37],[136,36],[133,35],[130,34]],
 [[140,42],[143,42],[145,44],[142,45],[141,44]],
 [[44,-16],[47,-14],[50,-15],[49,-21],[47,-25],[44,-23]],
 [[95,5],[100,1],[104,-2],[106,-6],[101,-4],[97,2]],[[105,-6],[112,-7],[115,-8],[108,-8]],[[109,2],[116,6],[119,5],[117,-2],[114,-4],[110,-2]],[[131,-1],[138,-2],[145,-5],[150,-10],[142,-9],[137,-5],[132,-3]],
 [[172,-34],[175,-37],[178,-38],[176,-41],[172,-44],[168,-46],[170,-43],[173,-41]],
 [[120,22],[122,24],[121,25],[120,23]],[[-85,22],[-77,22],[-74,20],[-80,20]],[[80,8],[82,7],[81,6]],[[-24,64],[-14,65],[-14,66],[-22,66]],
];
function kjGlobe(){ const g = new THREE.Group(); const t = canvasTex(1024, 512, (c, w, h) => { const sea = c.createLinearGradient(0, 0, 0, h); sea.addColorStop(0, '#9ccfe8'); sea.addColorStop(.5, '#5aa6d6'); sea.addColorStop(1, '#9ccfe8'); c.fillStyle = sea; c.fillRect(0, 0, w, h);
    const X = lon => (lon + 180) / 360 * w, Y = lat => (90 - lat) / 180 * h; c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1; for (let la = -60; la <= 60; la += 30){ c.beginPath(); c.moveTo(0, Y(la)); c.lineTo(w, Y(la)); c.stroke(); } for (let lo = -180; lo < 180; lo += 30){ c.beginPath(); c.moveTo(X(lo), 0); c.lineTo(X(lo), h); c.stroke(); }
    WORLD.forEach((poly, i) => { c.beginPath(); poly.forEach(([lo, la], k) => k ? c.lineTo(X(lo), Y(la)) : c.moveTo(X(lo), Y(la))); c.closePath(); c.fillStyle = i === 5 || i === 6 ? '#f4f6f2' : ['#e6d394', '#b8d488', '#d8c27a', '#cfe0a0'][i % 4]; c.fill(); c.strokeStyle = 'rgba(90,70,40,.45)'; c.lineWidth = 1.4; c.stroke(); });
    c.strokeStyle = 'rgba(200,60,50,.5)'; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(0, Y(0)); c.lineTo(w, Y(0)); c.stroke(); c.setLineDash([]); });
  const wd = WOOD('#7a4a2a', '#5a3218'); addM(g, new THREE.LatheGeometry([[.001, 0], [.16, 0], [.17, .02], [.14, .05], [.05, .07], [.035, .12], [.05, .16], [.02, .2]].map(([x, y]) => new THREE.Vector2(x, y)), 32), wd);
  const tilt = new THREE.Group(); tilt.position.y = .43; tilt.rotation.z = .41; g.add(tilt); const sp = addM(tilt, new THREE.SphereGeometry(.2, 64, 40), new THREE.MeshPhysicalMaterial({ map:t, roughness:.35, clearcoat:.6 })); sp.rotation.y = -Math.PI / 2 - 110 / 180 * Math.PI; // 日本が手前
  g.userData.onTap = () => { const r0 = sp.rotation.y; animate(1800, k => { sp.rotation.y = r0 + (1 - Math.pow(1 - k, 3)) * Math.PI * 4; }); }; // くるくる回る
  const brass = M('#c8a050', { metalness:.7, roughness:.28 }); addM(tilt, new THREE.TorusGeometry(.215, .009, 8, 64, Math.PI * 1.15), brass, 0, 0, 0, 0, Math.PI / 2, -Math.PI * .575); addM(tilt, new THREE.CylinderGeometry(.006, .006, .46, 8), brass); addM(g, new THREE.CylinderGeometry(.012, .012, .1, 8), brass, -.06, .2, 0, 0, 0, .41); return g; }
function kjBooks(){ const g = new THREE.Group(); const cs = [['#a8302a', '#e7b84a'], ['#2f4a7a', '#f3ead9'], ['#d8a03a', '#7a4a2a'], ['#3a7a52', '#e7b84a'], ['#7a3a5a', '#f3ead9'], ['#e8dcc0', '#a8302a']];
  const pages = kjCache.pages || (kjCache.pages = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#f6efde'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(160,140,110,.35)'; for (let y = 0; y < h; y += 2){ c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }, [1, 1])); let y = 0;
  cs.forEach(([c, band], i) => { const h = .045 + (i % 3) * .016, w = .36 - (i % 2) * .05, d = .25 - (i % 3) * .02, rot = (i - 2.5) * .09, x = (i % 2 ? .025 : -.02); const spine = canvasTex(128, 32, (q, W, H) => { q.fillStyle = c; q.fillRect(0, 0, W, H); q.fillStyle = band; q.fillRect(14, 0, 6, H); q.fillRect(W - 20, 0, 6, H); q.fillRect(44, H / 2 - 3, 40, 6); }, [1, 1]);
    const cover = M('#ffffff', { map:spine, roughness:.6 }), pg = M('#ffffff', { map:pages, roughness:.9 }), cv = M(c, { roughness:.6 }); const b = new THREE.Group(); b.position.set(x, y + h / 2, 0); b.rotation.y = rot; g.add(b);
    addM(b, RB(w, h, d, .006), [pg, cover, cv, cv, pg, pg]); addM(b, RB(w + .01, .006, d + .01, .002), cv, 0, h / 2 - .003); addM(b, RB(w + .01, .006, d + .01, .002), cv, 0, -h / 2 + .003); y += h; });
  const mug = new THREE.Group(); mug.position.set(.04, y, .02); g.add(mug); addM(mug, new THREE.LatheGeometry([[.001, 0], [.04, 0], [.045, .01], [.048, .09], [.044, .09], [.04, .012], [.001, .012]].map(([a, b]) => new THREE.Vector2(a, b)), 28), glaze('#fbf7ee')); addM(mug, new THREE.CylinderGeometry(.041, .041, .005, 24), M('#6a3a1e', { roughness:.2 }), 0, .075); addM(mug, new THREE.TorusGeometry(.025, .008, 8, 16, Math.PI), glaze('#fbf7ee'), .05, .045, 0, 0, 0, -Math.PI / 2); return g; }
function kjRadio(){ const g = new THREE.Group(); const wd = WOOD('#b8723e', '#7a4a22', { roughness:.35 }); const grille = canvasTex(128, 96, (c, w, h) => { c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,90,50,.35)'; for (let i = 0; i < w; i += 2){ c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); } for (let i = 0; i < h; i += 2){ c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.strokeStyle = '#7a4a22'; c.lineWidth = 5; for (let i = 1; i < 5; i++){ c.beginPath(); c.moveTo(i * w / 5, 0); c.lineTo(i * w / 5, h); c.stroke(); } });
  const dial = canvasTex(128, 32, (c, w, h) => { c.fillStyle = '#f6e8c0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#5a3a1e'; for (let i = 0; i < 30; i++){ c.beginPath(); c.moveTo(6 + i * 4, h * .55); c.lineTo(6 + i * 4, h * (i % 5 ? .75 : .9)); c.stroke(); } c.fillStyle = '#5a3a1e'; c.font = '10px sans-serif'; ['54', '70', '90', '120', '160'].forEach((t, i) => c.fillText(t, 4 + i * 25, 12)); c.fillStyle = '#d8303a'; c.fillRect(60, 6, 2, h - 8); });
  const sh = new THREE.Shape(); sh.moveTo(-.26, 0); sh.lineTo(.26, 0); sh.lineTo(.26, .24); sh.quadraticCurveTo(.26, .34, .16, .34); sh.lineTo(-.16, .34); sh.quadraticCurveTo(-.26, .34, -.26, .24); sh.closePath();
  addM(g, new THREE.ExtrudeGeometry(sh, { depth:.2, bevelEnabled:true, bevelSize:.012, bevelThickness:.012, bevelSegments:3 }), wd, 0, 0, -.1); addM(g, new THREE.PlaneGeometry(.3, .2), M('#ffffff', { map:grille, roughness:.9 }), -.07, .17, .113);
  addM(g, new THREE.PlaneGeometry(.14, .045), M('#ffffff', { map:dial, roughness:.4, emissive:'#5a4020', emissiveIntensity:.2 }), .16, .25, .113); for (const [x, y] of [[.12, .14], [.2, .14]]){ addM(g, new THREE.CylinderGeometry(.026, .028, .025, 20), M('#f3e8d0', { roughness:.3 }), x, y, .12, Math.PI / 2); addM(g, new THREE.CylinderGeometry(.006, .006, .03, 6), M('#7a4a22'), x, y + .013, .132, Math.PI / 2); }
  addM(g, new THREE.TorusGeometry(.09, .012, 8, 20, Math.PI), M('#4a2a14', { roughness:.4 }), 0, .34, 0); const ant = addM(g, new THREE.CylinderGeometry(.004, .006, .45, 6), M('#d8dce4', { metalness:.8, roughness:.25 }), .2, .5, -.06, 0, 0, -.35); g.userData.onTap = () => sway(ant, .25, 1200, 'z'); for (const s of [-1, 1]) addM(g, RB(.06, .02, .18, .008), M('#3a2a1a'), s * .2, .005, 0); return g; }
function kjFishbowl(){ const g = new THREE.Group(); const wd = WOOD('#9a6236', '#6a3e1e'); addM(g, new THREE.CylinderGeometry(.24, .24, .03, 40), wd, 0, .52); for (let i = 0; i < 3; i++){ const a = i / 3 * Math.PI * 2; addM(g, new THREE.LatheGeometry([[.02, 0], [.025, .1], [.018, .2], [.028, .3], [.02, .5]].map(([x, y]) => new THREE.Vector2(x, y)), 10), wd, Math.cos(a) * .17, 0, Math.sin(a) * .17); }
  addM(g, new THREE.CylinderGeometry(.18, .18, .02, 32), wd, 0, .2); const by = .72;
  addM(g, new THREE.SphereGeometry(.19, 24, 18, 0, Math.PI * 2, Math.PI * .32, Math.PI * .68), new THREE.MeshStandardMaterial({ color:'#5ab0e0', transparent:true, opacity:.35, roughness:.1 }), 0, by); addM(g, new THREE.CircleGeometry(.16, 32), new THREE.MeshStandardMaterial({ color:'#a8dcf4', transparent:true, opacity:.55 }), 0, by + .1, 0, -Math.PI / 2);
  for (let i = 0; i < 26; i++){ const a = i * 2.4, r = Math.sqrt(i / 26) * .12; addM(g, new THREE.SphereGeometry(.014, 6, 5), M(['#e8d8b0', '#a8b8c8', '#d8a080'][i % 3]), Math.cos(a) * r, by - .16, Math.sin(a) * r); }
  for (let k = 0; k < 3; k++) stem(g, [KV(-.06 + k * .02, by - .16, -.04), KV(-.07 + k * .03, by - .05, -.05), KV(-.05 + k * .02, by + .04, -.03)], .006, M('#4a9a4a'));
  const fishes = []; for (const [c, r0, y0, sp, ph] of [['#f2602a', .09, by - .03, .7, 0], ['#f6a03a', .06, by + .03, -.95, 2]]){ const f = new THREE.Group(); g.add(f); const fm = M(c, { roughness:.35 }); addM(f, new THREE.SphereGeometry(.03, 14, 10), fm, 0, 0, 0, 0, 0, 0, 1.4, 1, .7);
    const tail = new THREE.Group(); tail.position.x = -.04; f.add(tail); addM(tail, new THREE.ConeGeometry(.035, .05, 8, 1, true), M('#f2905a', { transparent:true, opacity:.85, side:THREE.DoubleSide }), -.02, 0, 0, 0, 0, Math.PI / 2, 1, 1, .3);
    for (const s2 of [-1, 1]) addM(f, new THREE.SphereGeometry(.006, 6, 4), M('#1a1a1a'), .03, .008, s2 * .018); fishes.push({ f, tail, r0, y0, sp, ph, ex:0 }); }
  g.userData.onTap = () => fishes.forEach(F => { const e0 = F.ex; animate(1800, k => { F.ex = e0 + (1 - Math.pow(1 - k, 2)) * Math.PI * 2 * Math.sign(F.sp); }); }); // さわると、すいっと泳ぐ
  // 金魚はゆっくり円をえがいて泳ぐ。しっぽもふりふり
  ticker(g, t => fishes.forEach(({ f, tail, r0, y0, sp, ph, ex }) => { const a = t * sp + ph + ex, r = r0 + Math.sin(t * .7 + ph) * .015; f.position.set(Math.cos(a) * r, y0 + Math.sin(t * 1.3 + ph) * .012, Math.sin(a) * r); f.rotation.y = -a - Math.sign(sp) * Math.PI / 2; tail.rotation.y = Math.sin(t * 9 + ph) * .5; }));
  addM(g, new THREE.SphereGeometry(.2, 40, 28), new THREE.MeshPhysicalMaterial({ color:'#ffffff', roughness:.02, transmission:.92, thickness:.05, ior:1.4, transparent:true, opacity:.4, side:THREE.DoubleSide }), 0, by); addM(g, new THREE.TorusGeometry(.11, .012, 8, 32), new THREE.MeshPhysicalMaterial({ color:'#ffffff', roughness:.05, transmission:.9, transparent:true, opacity:.5 }), 0, by + .17, 0, Math.PI / 2); return g; }
function kjRecord(){ const g = new THREE.Group(); const wd = WOOD('#8a4a22', '#5a2a10', { roughness:.35 }); addM(g, RB(.52, .13, .42, .025), wd, 0, .065); addM(g, RB(.5, .01, .4, .004), M('#2a2a2a', { roughness:.5 }), 0, .132);
  const vinyl = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#141414'; c.fillRect(0, 0, w, h); for (let r = 40; r < 126; r += 1.6){ c.strokeStyle = `rgba(255,255,255,${.03 + (r % 7) * .006})`; c.beginPath(); c.arc(w / 2, h / 2, r, 0, 7); c.stroke(); } c.fillStyle = '#d8303a'; c.beginPath(); c.arc(w / 2, h / 2, 38, 0, 7); c.fill(); c.fillStyle = '#f6e8c0'; c.font = 'bold 12px serif'; c.textAlign = 'center'; c.fillText('♪', w / 2, h / 2 - 12); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(w / 2, h / 2, 4, 0, 7); c.fill(); }, [1, 1]);
  addM(g, new THREE.CylinderGeometry(.165, .165, .012, 48), M('#c8ccd6', { metalness:.7, roughness:.3 }), -.05, .14); const disc = addM(g, new THREE.CylinderGeometry(.16, .16, .004, 48), [M('#141414'), M('#ffffff', { map:vinyl, roughness:.25 }), M('#141414')], -.05, .148);
  g.userData.onTap = () => { const r0 = disc.rotation.y; animate(4000, k => { disc.rotation.y = r0 - k * Math.PI * 2 * 2.2; }); }; // レコードが回る
  const chrome = M('#d8dce4', { metalness:.85, roughness:.2 }); addM(g, new THREE.CylinderGeometry(.025, .03, .03, 16), chrome, .18, .15, -.12); stem(g, [KV(.18, .17, -.12), KV(.16, .17, 0), KV(.06, .165, .06)], .005, chrome); addM(g, RB(.025, .012, .04, .004), M('#2a2a2a'), .055, .162, .065, 0, .6, 0);
  addM(g, new THREE.CylinderGeometry(.012, .012, .03, 10), M('#e8b84a', { metalness:.6, roughness:.3 }), .2, .14, .14, Math.PI / 2); const horn = new THREE.Group(); horn.position.set(.17, .14, -.15); g.add(horn); const brass = M('#e2b04a', { metalness:.65, roughness:.25, side:THREE.DoubleSide });
  stem(horn, [KV(0, 0, 0), KV(0, .2, 0), KV(-.03, .3, .05)], .014, brass); const bell = new THREE.Mesh(new THREE.LatheGeometry(Array.from({ length:14 }, (_, i) => { const t = i / 13; return new THREE.Vector2(.015 + Math.pow(t, 2.6) * .2, t * .3); }), 32), brass); bell.position.set(-.03, .3, .05); bell.rotation.set(-.6, 0, .9); bell.castShadow = true; horn.add(bell); return g; }
function kjCatCushion(){ const g = new THREE.Group(); const fur = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f2a65a'; c.fillRect(0, 0, w, h); c.fillStyle = '#d87a32'; for (let i = 0; i < 9; i++){ c.beginPath(); c.moveTo(i * 30 + 6, 0); c.quadraticCurveTo(i * 30 + 18, h * .3, i * 30 + 8, h * .5); c.lineTo(i * 30 + 2, h * .5); c.quadraticCurveTo(i * 30 + 10, h * .3, i * 30, 0); c.fill(); } for (let i = 0; i < 900; i++){ c.fillStyle = `rgba(255,255,255,${Math.random() * .06})`; c.fillRect(Math.random() * w, Math.random() * h, 1, 3); } }, [1, 1]);
  const fm = M('#ffffff', { map:fur, roughness:.95 }); const body = new THREE.SphereGeometry(.3, 40, 24), p = body.attributes.position; for (let i = 0; i < p.count; i++){ const y = p.getY(i); p.setY(i, y < 0 ? y * .35 : y * .55); } body.computeVertexNormals(); addM(g, body, fm, 0, .1, 0, 0, 0, 0, 1.25, 1, 1);
  const face = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#f6c890'; c.fillRect(0, 0, w, h); c.fillStyle = '#fbe8d0'; c.beginPath(); c.ellipse(64, 84, 34, 26, 0, 0, 7); c.fill(); c.fillStyle = '#2a2020'; for (const s of [-1, 1]){ c.beginPath(); c.ellipse(64 + s * 24, 60, 7, 9, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(64 + s * 24 - 2, 57, 2.5, 0, 7); c.fill(); c.fillStyle = '#2a2020'; } c.fillStyle = '#f49aac'; c.beginPath(); c.moveTo(58, 76); c.lineTo(70, 76); c.lineTo(64, 83); c.fill(); c.strokeStyle = '#2a2020'; c.lineWidth = 2; c.beginPath(); c.arc(59, 86, 5, 0, Math.PI); c.arc(69, 86, 5, 0, Math.PI); c.stroke(); c.lineWidth = 1.2; for (const s of [-1, 1]) for (const d of [-4, 3]){ c.beginPath(); c.moveTo(64 + s * 18, 84 + d); c.lineTo(64 + s * 54, 80 + d * 1.6); c.stroke(); } c.fillStyle = 'rgba(255,140,150,.5)'; for (const s of [-1, 1]){ c.beginPath(); c.arc(64 + s * 36, 78, 8, 0, 7); c.fill(); } }, [1, 1]);
  const head = new THREE.Group(); head.position.set(0, .2, .22); g.add(head); g.userData.onTap = () => sway(head, .3, 1400, 'z'); // くびをかしげる addM(head, new THREE.SphereGeometry(.16, 32, 24), fm, 0, 0, 0, 0, 0, 0, 1.15, .95, .85); addM(head, new THREE.CircleGeometry(.12, 32), M('#ffffff', { map:face, roughness:.9, transparent:true }), 0, -.01, .135);
  for (const s of [-1, 1]){ addM(head, new THREE.ConeGeometry(.06, .1, 16), fm, s * .1, .14, -.01, 0, 0, -s * .35); addM(head, new THREE.ConeGeometry(.035, .06, 12), M('#f49aac', { roughness:.9 }), s * .1, .135, .02, 0, 0, -s * .35); }
  for (const s of [-1, 1]) addM(g, new THREE.SphereGeometry(.06, 16, 10), fm, s * .13, .05, .3, 0, 0, 0, 1, .6, 1.2); stem(g, [KV(.3, .06, -.1), KV(.42, .1, .05), KV(.38, .08, .22), KV(.28, .06, .26)], .035, fm); return g; }
function kjBeanbag(){ const g = new THREE.Group(); const geo = new THREE.SphereGeometry(.48, 48, 32), p = geo.attributes.position; for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const sag = y > 0 ? y * .72 - Math.max(0, z) * .3 + Math.sin(x * 9) * .01 : y * .45; p.setY(i, sag); p.setX(i, x * (1 + Math.max(0, -y) * .2)); p.setZ(i, z * (1 + Math.max(0, -y) * .2)); } geo.computeVertexNormals();
  addM(g, geo, M('#ffffff', { map:fabT('#4a7aa8', 'rgba(255,255,255,.07)', [6, 4]), roughness:1 }), 0, .23); addM(g, new THREE.TorusGeometry(.5, .012, 6, 64), M('#3a6a98', { roughness:1 }), 0, .14, 0, Math.PI / 2, 0, 0, 1, 1, .6);
  addM(g, RB(.12, .04, .02, .01), M('#3a3a3a', { roughness:.6 }), 0, .2, .52); blobIn(g, 0, 0, 1.2, 1.2, .45); return g; }
function kjStool(){ const g = new THREE.Group(); const wd = WOOD('#c8945a', '#9a6a3a'); addM(g, new THREE.CylinderGeometry(.2, .19, .045, 40), wd, 0, .455);
  const cush = new THREE.SphereGeometry(.19, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2); addM(g, cush, M('#ffffff', { map:fabT('#d8503a', 'rgba(255,255,255,.08)'), roughness:1 }), 0, .478, 0, 0, 0, 0, 1, .28, 1); addM(g, new THREE.TorusGeometry(.19, .008, 6, 40), M('#a8302a'), 0, .48, 0, Math.PI / 2); addM(g, new THREE.SphereGeometry(.012, 8, 6), M('#a8302a'), 0, .53);
  const leg = new THREE.LatheGeometry([[.012, 0], [.02, .02], [.017, .12], [.024, .2], [.016, .3], [.02, .44]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
  for (let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2 + Math.PI / 4; addM(g, leg, wd, Math.cos(a) * .15, 0, Math.sin(a) * .15, Math.sin(a) * .1, 0, -Math.cos(a) * .1); } addM(g, new THREE.TorusGeometry(.155, .01, 6, 32), wd, 0, .16, 0, Math.PI / 2); return g; }
function kjCushions(){ const g = new THREE.Group(); const pat = (a, b, kind) => canvasTex(128, 128, (c, w, h) => { c.fillStyle = a; c.fillRect(0, 0, w, h); c.fillStyle = b; if (kind === 0) for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 32){ c.fillRect(x, y, 16, 16); c.fillRect(x + 16, y + 16, 16, 16); } else if (kind === 1) for (let x = 8; x < w; x += 24) for (let y = 8; y < h; y += 24){ c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); } else { for (let i = -h; i < w; i += 20){ c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.lineTo(i + h + 8, h); c.lineTo(i + 8, 0); c.fill(); } } for (let i = 0; i < 400; i++){ c.fillStyle = `rgba(0,0,0,${Math.random() * .05})`; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } }, [1, 1]);
  const pillow = (a, b, kind, edge) => { const grp = new THREE.Group(); const geo = new THREE.BoxGeometry(.42, .15, .42, 10, 4, 10), p = geo.attributes.position; for (let i = 0; i < p.count; i++){ const x = p.getX(i), z = p.getZ(i), y = p.getY(i), k = 1 - Math.pow(Math.max(Math.abs(x), Math.abs(z)) / .21, 3); p.setY(i, y * (.35 + .65 * k)); } geo.computeVertexNormals(); addM(grp, geo, M('#ffffff', { map:pat(a, b, kind), roughness:1 }));
    const pts = [[-.21, -.21], [.21, -.21], [.21, .21], [-.21, .21]].map(([x, z]) => KV(x, 0, z)); addM(grp, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 40, .011, 6, true), M(edge, { roughness:.8 })); for (const [x, z] of [[-.22, -.22], [.22, .22]]) addM(grp, new THREE.CylinderGeometry(.004, .016, .06, 8), M(edge), x, -.01, z, Math.PI / 2, 0, Math.atan2(x, z)); return grp; };
  [[pillow('#f2c14e', '#fbe8a8', 0, '#c8902a'), -.2, .07, 0, .2, 0], [pillow('#7ab8a0', '#f6efe0', 1, '#4a8a70'), .22, .07, .08, -.35, 0], [pillow('#e88a9a', '#fbe0e4', 2, '#c85a6a'), .02, .2, .03, .5, .25]].forEach(([p, x, y, z, ry, rz]) => { p.position.set(x, y, z); p.rotation.set(0, ry, rz); g.add(p); });
  blobIn(g, .02, .04, 1.1, .9, .4); return g; }
function kjMirror(){ const g = new THREE.Group(); const gold = M('#d0a848', { metalness:.75, roughness:.25 }); addM(g, new THREE.TorusGeometry(.26, .035, 12, 64), gold, 0, .62, .03); addM(g, new THREE.CircleGeometry(.25, 48), new THREE.MeshStandardMaterial({ color:'#eef4f8', metalness:.6, roughness:.06, emissive:'#a8c0d4', emissiveIntensity:.3 }), 0, .62, .025);
  for (let i = 0; i < 24; i++){ const a = i / 24 * Math.PI * 2, L = i % 2 ? .16 : .24; addM(g, new THREE.CylinderGeometry(.006, .012, L, 6), gold, Math.cos(a) * (.3 + L / 2), .62 + Math.sin(a) * (.3 + L / 2), .02, 0, 0, a - Math.PI / 2); addM(g, new THREE.SphereGeometry(i % 2 ? .014 : .02, 10, 8), gold, Math.cos(a) * (.31 + L), .62 + Math.sin(a) * (.31 + L), .02); } return g; }
function kjFlags(){ const g = new THREE.Group(); const pats = [['#e8503a', '#fbe0d8', 0], ['#f2c14e', '#fff6d0', 1], ['#4a8ad8', '#e0ecf8', 2], ['#5aac5a', '#e4f4e0', 0], ['#f49aac', '#ffffff', 1], ['#8a6ab8', '#efe6f8', 2]];
  const tex = ([a, b, k]) => canvasTex(64, 64, (c, w, h) => { c.fillStyle = a; c.fillRect(0, 0, w, h); c.fillStyle = b; if (k === 0) for (let x = 4; x < w; x += 12) for (let y = 4; y < h; y += 12){ c.beginPath(); c.arc(x + (y / 12 % 2) * 6, y, 2.4, 0, 7); c.fill(); } else if (k === 1) for (let x = 0; x < w; x += 10) c.fillRect(x, 0, 5, h); else { for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 8, h); c.globalAlpha = .5; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 8); } }, [1, 1]);
  const N = 9, sag = t => .82 - Math.sin(t * Math.PI) * .2, xs = t => -.95 + t * 1.9; stem(g, Array.from({ length:13 }, (_, i) => KV(xs(i / 12), sag(i / 12), .025)), .004, M('#c8b48a', { roughness:1 }));
  for (const s of [-1, 1]) addM(g, new THREE.SphereGeometry(.015, 8, 6), M('#a8a8b0', { metalness:.6, roughness:.3 }), s * .95, .82, .02);
  for (let i = 0; i < N; i++){ const t = (i + .5) / N, x = xs(t), y = sag(t); const geo = new THREE.PlaneGeometry(.15, .19, 4, 6), p = geo.attributes.position; for (let k = 0; k < p.count; k++){ const yy = p.getY(k), xx = p.getX(k); const f = (yy + .095) / .19; p.setX(k, xx * f); p.setZ(k, Math.sin(xx * 20 + i) * .006); p.setY(k, yy - .095); } geo.computeVertexNormals();
    const f = addM(g, geo, M('#ffffff', { map:tex(pats[i % pats.length]), side:THREE.DoubleSide, roughness:.9 }), x, y, .03, 0, 0, (i - 4) * -.04); f.castShadow = true; addM(g, RB(.012, .03, .008, .003), WOOD('#d8b078', '#a8804a'), x, y + .005, .035); } g.userData.onTap = () => sway(g, .035, 1600, 'z'); return g; }
function kjPhotos(){ const g = new THREE.Group(); const pic = (k) => canvasTex(128, 128, (c, w, h) => { const sky = [['#a8d8f0', '#e8f4fb'], ['#f8b890', '#fde0c0'], ['#bfe0f0', '#f0f6e0']][k]; const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    if (k === 0){ c.fillStyle = '#7ab0d8'; c.fillRect(0, h * .62, w, h); c.fillStyle = '#e8d8a8'; c.fillRect(0, h * .78, w, h); c.fillStyle = '#fff'; c.beginPath(); c.arc(30, 30, 10, 0, 7); c.fill(); } if (k === 1){ c.fillStyle = '#e86a3a'; c.beginPath(); c.arc(w * .6, h * .55, 18, 0, 7); c.fill(); c.fillStyle = '#5a6a8a'; c.beginPath(); c.moveTo(0, h); c.lineTo(w * .35, h * .5); c.lineTo(w * .7, h * .8); c.lineTo(w, h * .6); c.lineTo(w, h); c.fill(); }
    if (k === 2){ c.fillStyle = '#6aac5a'; c.beginPath(); c.moveTo(0, h); c.quadraticCurveTo(w * .5, h * .45, w, h * .75); c.lineTo(w, h); c.fill(); c.fillStyle = '#f49aac'; for (let i = 0; i < 14; i++){ c.beginPath(); c.arc(10 + i * 9, h * .85 + (i % 3) * 5, 3, 0, 7); c.fill(); } } }, [1, 1]);
  [[-.33, .62, .3, .38, 0, WOOD('#f3ead9', '#d8c8a8')], [.03, .72, .26, .26, 1, WOOD('#8a5a32', '#5a3418')], [.33, .56, .24, .3, 2, M('#2a2a2a', { roughness:.4 })]].forEach(([x, y, w, h, k, fm]) => { const grp = new THREE.Group(); grp.position.set(x, y, .015); grp.rotation.z = (k - 1) * .04; g.add(grp);
    addM(grp, RB(w, h, .03, .008), fm); addM(grp, new THREE.PlaneGeometry(w - .05, h - .05), M('#fbf7ee', { roughness:.8 }), 0, 0, .0155); addM(grp, new THREE.PlaneGeometry(w - .1, h - .1), M('#ffffff', { map:pic(k), roughness:.5 }), 0, 0, .016); addM(grp, new THREE.PlaneGeometry(w - .1, h - .1), new THREE.MeshPhysicalMaterial({ color:'#ffffff', transparent:true, opacity:.08, roughness:0, metalness:.2 }), 0, 0, .017); });
  addM(g, RB(.1, .025, .002, .001), M('#f49aac', { transparent:true, opacity:.85 }), .02, .86, .035, 0, 0, .3); return g; }
function kjSwag(){ const g = new THREE.Group(); const st = M('#8a7a52', { roughness:.9 }); for (let i = 0; i < 15; i++) stem(g, [KV((i - 7) * .006, .25, .03), KV((i - 7) * .014, .55, .04), KV((i - 7) * .03 + Math.sin(i) * .02, .9 + (i % 4) * .03, .04)], .0035, st);
  const euc = M('#8aa89a', { roughness:.7, side:THREE.DoubleSide }); for (let i = 0; i < 26; i++){ const a = (i - 13) * .05, y = .5 + (i % 7) * .06; addM(g, new THREE.CircleGeometry(.03 + (i % 3) * .006, 14), euc, Math.sin(a) * (y - .2) * 1.2, y, .05 + (i % 3) * .012, (i % 2 - .5) * .6, (i % 3 - 1) * .5, a); }
  const lav = M('#8a76b8', { roughness:.85 }); for (const x of [-.11, -.05, .04, .1]) for (let k = 0; k < 9; k++) addM(g, new THREE.SphereGeometry(.011, 6, 5), lav, x * (1 + k * .08), .74 + k * .022, .065, 0, 0, 0, 1, 1.4, 1);
  const wh = M('#f6efe0', { roughness:.8 }), yc = M('#e8c860'); for (let i = 0; i < 9; i++){ const a = (i - 4) * .1, y = .62 + (i % 3) * .07, x = Math.sin(a) * (y - .2) * 1.1; for (let k = 0; k < 6; k++){ const b = k / 6 * Math.PI * 2; addM(g, new THREE.SphereGeometry(.009, 6, 4), wh, x + Math.cos(b) * .013, y + Math.sin(b) * .013, .075, 0, 0, 0, 1.4, .8, .5); } addM(g, new THREE.SphereGeometry(.007, 6, 4), yc, x, y, .08); }
  const tw = M('#c8a878', { roughness:1 }); for (let k = 0; k < 3; k++) addM(g, new THREE.TorusGeometry(.03, .004, 4, 16), tw, 0, .34 + k * .012, .05, Math.PI / 2 - .2); for (const s of [-1, 1]){ addM(g, new THREE.TorusGeometry(.025, .004, 4, 12), tw, s * .028, .36, .055, 0, 0, s * .6); stem(g, [KV(0, .35, .055), KV(s * .02, .3, .056), KV(s * .035, .25, .055)], .003, tw); } g.userData.onTap = () => sway(g, .035, 1600, 'z'); return g; }
function kjMugShelf(){ const g = new THREE.Group(); addM(g, RB(.82, .035, .2, .008), WOOD('#b07a48', '#7a4a22'), 0, .45, .1); const iron = M('#2a2a2a', { roughness:.5, metalness:.4 });
  for (const s of [-1, 1]){ stem(g, [KV(s * .32, .43, .01), KV(s * .32, .3, .01), KV(s * .32, .3, .02)], .007, iron); stem(g, [KV(s * .32, .3, .015), KV(s * .32, .36, .1), KV(s * .32, .43, .18)], .006, iron); }
  const mug = (c, x, z, hang) => { const m = new THREE.Group(); m.position.set(x, hang ? .33 : .468, z); g.add(m); const mm = glaze(c); addM(m, new THREE.LatheGeometry([[.001, 0], [.038, 0], [.042, .01], [.044, .085], [.04, .085], [.037, .01], [.001, .01]].map(([a, b]) => new THREE.Vector2(a, b)), 28), mm, 0, hang ? -.09 : 0); addM(m, new THREE.TorusGeometry(.024, .008, 8, 16, Math.PI), mm, .045, hang ? -.045 : .045, 0, 0, 0, -Math.PI / 2); return m; };
  mug('#e8603a', -.22, .1); mug('#4a8ad8', -.06, .1); mug('#f2c14e', .1, .1); for (const [x, c] of [[-.15, '#fbf7ee'], [.15, '#7ab8a0']]){ stem(g, [KV(x, .43, .08), KV(x, .38, .08), KV(x + .015, .36, .08)], .004, iron); mug(c, x - .03, .08, true); }
  const pl = new THREE.Group(); pl.position.set(.3, .468, .1); g.add(pl); const t = kpot(pl, .055, .08, glaze('#c8724a'), false); const geo = leafGeo(leafShape(.4, 1), .2, .2), lm = leafMat('#5aa84a', '#3f8a3a'); for (let k = 0; k < 7; k++){ const a = k * 2.4; leafAt(pl, geo, lm, KV(0, t, 0), KV(Math.cos(a) * .6, 1, Math.sin(a) * .6), .07, 0); } return g; }
function kjHato(){ const g = new THREE.Group(); const wd = WOOD('#7a4a26', '#4a2a12', { roughness:.5 }), dk = WOOD('#5a3218', '#3a1e0a'); addM(g, RB(.36, .42, .14, .02), wd, 0, .56, .07);
  const roof = new THREE.Shape(); roof.moveTo(-.27, 0); roof.lineTo(0, .17); roof.lineTo(.27, 0); roof.lineTo(.23, 0); roof.lineTo(0, .13); roof.lineTo(-.23, 0); roof.closePath(); addM(g, new THREE.ExtrudeGeometry(roof, { depth:.17, bevelEnabled:false }), dk, 0, .76, -.015);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) addM(g, new THREE.CircleGeometry(.03, 5), leafMat('#3a6a2a', '#2a5a1e'), s * (.06 + k * .045), .8 + (3 - k) * .025, .158, 0, 0, s * .6); addM(g, new THREE.SphereGeometry(.03, 12, 8), dk, 0, .93, .07);
  const face = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#f6efde'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.fillStyle = '#3a2a1e'; c.font = 'bold 14px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++){ const a = i / 12 * Math.PI * 2 - Math.PI / 2; c.fillText(String(i), 64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48); } });
  addM(g, new THREE.CircleGeometry(.105, 40), M('#ffffff', { map:face, roughness:.6 }), 0, .53, .142); addM(g, new THREE.TorusGeometry(.105, .008, 6, 40), M('#c8a050', { metalness:.6, roughness:.3 }), 0, .53, .142); addM(g, RB(.006, .07, .003, .001), M('#2a2020'), 0, .555, .146); addM(g, RB(.05, .006, .003, .001), M('#2a2020'), .02, .53, .147, 0, 0, .3);
  addM(g, RB(.1, .07, .012, .005), dk, 0, .7, .143); const bird = new THREE.Group(); bird.position.set(0, .7, .16); g.add(bird); g.userData.onTap = () => animate(1600, k => { bird.position.z = .16 + Math.max(0, Math.sin(k * Math.PI * 3)) * .07; }); // ポッポー addM(bird, new THREE.SphereGeometry(.022, 12, 8), M('#e8e0d0'), 0, 0, 0, 0, 0, 0, 1.3, 1, 1); addM(bird, new THREE.ConeGeometry(.008, .02, 6), M('#e8a03a'), .03, .005, 0, 0, 0, -Math.PI / 2);
  const brass = M('#c8a050', { metalness:.6, roughness:.3 }); addM(g, new THREE.CylinderGeometry(.003, .003, .24, 4), brass, 0, .23, .1); addM(g, new THREE.CircleGeometry(.04, 24), brass, 0, .12, .1);
  for (const x of [-.08, .08]){ addM(g, new THREE.CylinderGeometry(.002, .002, .3, 4), brass, x, .2, .07); const pc = new THREE.Group(); pc.position.set(x, .05, .07); g.add(pc); for (let k = 0; k < 5; k++) addM(pc, new THREE.ConeGeometry(.022 - k * .003, .03, 8), M('#8a5a2a', { metalness:.3, roughness:.5 }), 0, -k * .018, 0, Math.PI); } return g; }


/* ===== クリスマスふくびき（12/25までの期間限定） ===== */
function xkSled(){ const g = new THREE.Group(); const wd = WOOD('#b07a48', '#7a4a22'), red = M('#c8302c', { roughness:.35, metalness:.2 });
  for (const s of [-1, 1]){ const pts = [KV(-.55, .03, s * .22), KV(.4, .03, s * .22), KV(.55, .08, s * .22), KV(.62, .2, s * .22), KV(.55, .3, s * .22), KV(.45, .26, s * .22)]; stem(g, pts, .022, red); for (const x of [-.4, 0, .35]) addM(g, new THREE.CylinderGeometry(.015, .015, .14, 8), red, x, .1, s * .22); }
  for (let i = 0; i < 6; i++) addM(g, RB(.14, .03, .5, .01), wd, -.42 + i * .16, .18, 0); addM(g, RB(.95, .03, .05, .01), wd, -.05, .2, -.24); addM(g, RB(.95, .03, .05, .01), wd, -.05, .2, .24);
  const gift = makeDeco('gift', .26); gift.position.set(-.18, .195, 0); gift.rotation.y = .4; g.add(gift); const g2 = makeDeco('gift', .18); g2.position.set(.12, .195, .08); g2.rotation.y = -.3; g.add(g2);
  const bl = new THREE.PlaneGeometry(.4, .32, 8, 8), bp = bl.attributes.position; for (let i = 0; i < bp.count; i++){ const x = bp.getX(i), y = bp.getY(i); bp.setZ(i, Math.abs(x) > .12 ? (Math.abs(x) - .12) * .9 : 0); } bl.computeVertexNormals(); addM(g, bl, M('#ffffff', { map:knitTexR('#2f7a4a', '#fbf6ea'), side:THREE.DoubleSide, roughness:1 }), .25, .2, 0, -Math.PI / 2, 0, 0); blobIn(g, 0, 0, 1.4, .8, .4); return g; }
function xkTrain(){ const g = new THREE.Group(); const t = makeDeco('c3', .42); t.rotation.y = -.2; g.add(t); const rail = M('#8a8e98', { metalness:.6, roughness:.3 }); for (const z of [-.06, .06]) addM(g, new THREE.CylinderGeometry(.008, .008, 1.1, 6), rail, 0, .008, z, 0, 0, Math.PI / 2); for (let i = 0; i < 9; i++) addM(g, RB(.03, .01, .2, .004), WOOD('#7a4a2a', '#5a3218'), -.5 + i * .125, .005, 0);
  const car = new THREE.Group(); car.position.set(-.4, .02, 0); g.add(car); addM(car, RB(.24, .14, .16, .02), M('#2f6a46', { roughness:.45 }), 0, .1); for (const x of [-.07, .07]) for (const z of [-.08, .08]) addM(car, new THREE.CylinderGeometry(.03, .03, .02, 16), M('#2a2a2a'), x, .03, z, Math.PI / 2);
  for (let i = 0; i < 3; i++){ const p = makeDeco('gift', .09); p.position.set(-.06 + i * .06, .17, 0); car.add(p); } let u = 0; g.userData.onTap = () => { const u0 = u; animate(2400, k => { u = u0 + k; const x = Math.sin(k * Math.PI) * .25; t.position.x = x; car.position.x = -.4 + x; }); }; return g; }
function xkReindeer(){ const g = new THREE.Group(); const d = new THREE.Group(); g.add(d); d.rotation.y = -.5; const fur = WOOD('#a8743e', '#8a5a2e', { roughness:.6 }), dk = M('#5a3a22', { roughness:.6 }), cream = M('#f3e2c0', { roughness:.7 });
  addM(d, new THREE.CapsuleGeometry(.12, .32, 8, 16), fur, 0, .5, 0, 0, 0, Math.PI / 2); addM(d, new THREE.SphereGeometry(.1, 16, 12), cream, .02, .45, 0, 0, 0, 0, 2, .7, 1.1);
  for (const [x, z] of [[-.14, -.07], [-.14, .07], [.14, -.07], [.14, .07]]){ addM(d, new THREE.CylinderGeometry(.028, .022, .38, 10), fur, x, .22, z); addM(d, new THREE.CylinderGeometry(.03, .03, .04, 10), dk, x, .02, z); }
  const neck = new THREE.Group(); neck.position.set(.2, .58, 0); neck.rotation.z = -.5; d.add(neck); addM(neck, new THREE.CapsuleGeometry(.055, .14, 6, 12), fur, 0, .1, 0);
  const head = new THREE.Group(); head.position.set(.27, .8, 0); d.add(head); addM(head, new THREE.SphereGeometry(.08, 18, 14), fur, 0, 0, 0, 0, 0, 0, 1.3, 1, 1); addM(head, new THREE.SphereGeometry(.03, 12, 10), M('#e8302a', { roughness:.25, emissive:'#a01810', emissiveIntensity:.4 }), .11, -.01, 0);
  for (const s2 of [-1, 1]){ addM(head, new THREE.SphereGeometry(.012, 8, 6), M('#1a1414'), .05, .03, s2 * .055); addM(head, new THREE.ConeGeometry(.025, .07, 10), fur, -.02, .06, s2 * .07, s2 * 1.1, 0, 0);
    const ant = [KV(-.02, .07, s2 * .03), KV(-.05, .17, s2 * .07), KV(-.02, .26, s2 * .1)]; stem(head, ant, .01, cream); stem(head, [KV(-.04, .14, s2 * .06), KV(.02, .2, s2 * .08)], .008, cream); stem(head, [KV(-.03, .22, s2 * .09), KV(-.1, .28, s2 * .1)], .007, cream); }
  addM(d, new THREE.TorusGeometry(.065, .014, 8, 20), M('#c8302c', { roughness:.4 }), .22, .66, 0, Math.PI / 2, 0, -.5); addM(d, new THREE.SphereGeometry(.025, 10, 8), M('#e7b84a', { metalness:.6, roughness:.3 }), .27, .63, 0);
  addM(d, new THREE.ConeGeometry(.03, .06, 8), cream, -.24, .56, 0, 0, 0, 1.2); blobIn(g, 0, 0, .7, .5, .45); g.userData.onTap = () => sway(head, .25, 1400, 'z'); return g; }
function xkNutcracker(){ const g = new THREE.Group(); const n = makeDeco('c0', 1.0); g.add(n); addM(g, new THREE.CylinderGeometry(.2, .22, .06, 28), WOOD('#5a3218', '#3a1e0a'), 0, .03); n.position.y = .06; blobIn(g, 0, 0, .6, .6, .5); g.userData.onTap = () => animate(600, k => { n.position.y = .06 + Math.sin(k * Math.PI) * .08; }); return g; }
function xkGingerHouse(){ const g = new THREE.Group(); const h = makeDeco('s10', .62); g.add(h); addM(g, new THREE.CylinderGeometry(.42, .44, .04, 40), M('#fbfbf6', { roughness:.3 }), 0, .02); h.position.y = .04; for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; const c = makeDeco(i % 2 ? 'candy' : 's4', .1); c.position.set(Math.cos(a) * .36, .04, Math.sin(a) * .36); g.add(c); } return g; }
function xkBoot(){ const g = new THREE.Group(); const red = M('#c8302c', { roughness:.75 }), fur = M('#fbf6ec', { roughness:1 }); addM(g, RB(.22, .12, .4, .05), red, 0, .06, .08); addM(g, new THREE.CylinderGeometry(.13, .12, .42, 24), red, 0, .3, -.03); addM(g, new THREE.TorusGeometry(.14, .045, 10, 24), fur, 0, .52, -.03, Math.PI / 2); addM(g, RB(.24, .03, .42, .02), M('#2a2020'), 0, .01, .08);
  for (const [k, x, y, z, r] of [['gift', -.02, .52, -.05, .2], ['candy', .07, .55, 0, .1], ['c15', -.08, .55, .02, -.2]]){ const o = makeDeco(k, .2); o.position.set(x, y, z); o.rotation.y = r; g.add(o); } return g; }
/* ===== クリスマスのオルゴール：さわるたびに次の曲、鳴っているときにさわると止まる（曲はどれも作者没後かなり経った古い曲） ===== */
const MB_SONGS = [
  ['ジングルベル', 150, 4, 'E1 E1 E2 E1 E1 E2 E1 G1 C1.5 D.5 E4 F1 F1 F1.5 F.5 F1 E1 E1 E.5 E.5 E1 D1 D1 E1 D2 G2 E1 E1 E2 E1 E1 E2 E1 G1 C1.5 D.5 E4 F1 F1 F1 F1 F1 E1 E1 E.5 E.5 G1 G1 F1 D1 C4', 'C4 C4 C4 C4 F4 C4 D74 G74 C4 C4 C4 C4 F4 C4 G74 C4'],
  ['きらきら星', 116, 4, 'C1 C1 G1 G1 A1 A1 G2 F1 F1 E1 E1 D1 D1 C2 G1 G1 F1 F1 E1 E1 D2 G1 G1 F1 F1 E1 E1 D2 C1 C1 G1 G1 A1 A1 G2 F1 F1 E1 E1 D1 D1 C2', 'C4 F2 C2 F2 C2 G2 C2 C2 F2 C2 G2 C2 F2 C2 G2 C4 F2 C2 F2 C2 G2 C2'],
  ['ひいらぎかざろう', 132, 4, 'G1.5 F.5 E1 D1 C1 D1 E1 C1 D.5 E.5 F.5 D.5 E1.5 D.5 C1 b1 C2 G1.5 F.5 E1 D1 C1 D1 E1 C1 D.5 E.5 F.5 D.5 E1.5 D.5 C1 b1 C2 D1.5 E.5 F1 D1 E1.5 F.5 G1 D1 E.5 #F.5 G1 A.5 B.5 c1 B1 A1 G2 G1.5 F.5 E1 D1 C1 D1 E1 C1 A.5 A.5 A.5 A.5 G1.5 F.5 E1 D1 C2', 'C4 C4 G4 C2 G1 C1 C4 C4 G4 C2 G1 C1 G4 C2 G2 C2 D72 G4 C4 C4 F2 C2 G2 C2'],
  ['もみの木', 96, 3, 'G1 c.75 c.25 c1.5 d.5 e.75 e.25 e1.5 e.5 d.5 e.5 f1 B1 d1 c1 G1 c.75 c.25 c1.5 d.5 e.75 e.25 e1.5 e.5 d.5 e.5 f1 B1 d1 c2 g1 g1 e1 a1.5 g.5 g1 f1 f2 f1 f1 d1 g1.5 f.5 f1 e1 e1 G1 c.75 c.25 c1.5 d.5 e.75 e.25 e1.5 e.5 d.5 e.5 f1 B1 d1 c2', 'G1 C3 C3 G73 C3 C3 C3 G73 C3 C3 F3 G73 Dm3 G73 C3 C3 C3 G73 C3'],
  ['もろびとこぞりて', 116, 4, 'c2 B1.5 A.5 G3 F1 E2 D2 C3 G1 A3 A1 B3 B1 c3 R4 c1 c1 B1 A1 G1 G1.5 F.5 E1 c1 c1 B1 A1 G1 G1.5 F.5 E1 E1 E1 E1 E1 E.5 F.5 G3 F.5 E.5 D1 D1 D1 D.5 E.5 F3 E.5 D.5 C1 c2 A1 G1.5 F.5 E1 F1 E2 D2 C4', 'C2 G2 C3 F1 C2 G2 C3 G1 F4 G4 C3 R4 C4 G73 C1 C4 G73 C1 C8 G71 G78 C3 F1 C2 F2 C2 G72 C4'],
  ['まきびとひつじを', 120, 3, 'E.5 D.5 C1.5 D.5 E.5 F.5 G2 A.5 B.5 c1 B1 A1 G2 A.5 B.5 c1 B1 A1 G1 A1 B1 c1 G1 F1 E2 E.5 D.5 C1.5 D.5 E.5 F.5 G2 A.5 B.5 c1 B1 A1 G2 A.5 B.5 c1 B1 A1 G1 A1 B1 c1 G1 F1 E2 E.5 D.5 C1.5 D.5 E.5 F.5 G2 c.5 B.5 A2 A1 G2 c1 B1 A1 G1 c1 G1 F1 E3', 'C1 C3 C3 F3 C3 F3 C3 F1 G72 C2 C1 C3 C3 F3 C3 F3 C3 F1 G72 C2 C1 C3 C3 F3 C3 G73 F1 G72 C3'],
  ['荒野のはてに', 120, 4, 'E1 E1 E1 G1 G1.5 F.5 E2 E1 D1 E1 G1 E1.5 D.5 C2 E1 E1 E1 G1 G1.5 F.5 E2 E1 D1 E1 G1 E1.5 D.5 C2 G2 A.5 G.5 F.5 E.5 F2 G.5 F.5 E.5 D.5 E2 F.5 E.5 D.5 C.5 D1.5 _G.5 _G2 C1 D1 E1 F1 E2 D2 C4 G2 A.5 G.5 F.5 E.5 F2 G.5 F.5 E.5 D.5 E2 F.5 E.5 D.5 C.5 D1.5 _G.5 _G2 C1 D1 E1 F1 E2 D2 C4', 'C4 G72 C2 C4 G72 C2 C4 G72 C2 C4 G72 C2 C4 F4 C4 G4 C1 G1 C1 F1 C2 G72 C4 C4 F4 C4 G4 C1 G1 C1 F1 C2 G72 C4'],
  ['神の御子は', 100, 4, 'C1 C2 _G1 C1 D2 _G2 E1 D1 E1 F1 E2 D1 C1 C2 _B1 _A1 _B1 C1 D1 E1 _B2 _A1.5 _G.5 _G4 G2 F1 E1 F2 E2 D1 E1 C1 D1 _B1.5 _A.5 _G2 C1 C1 _B1 C1 D2 C1 _G1 E1 E1 D1 E1 F2 E1 D1 E1 F1 E1 D1 C1 _B1 C1 F1 E2 D1.5 C.5 C3', 'C1 C4 G4 C2 F2 C2 G72 Am2 E72 G4 G4 G4 C4 F2 C2 G72 C2 G4 C4 G72 C2 C4 F2 G2 C2 F1 G1 C1 G1 C1 F1 C2 G72 C3'],
  ['きよしこの夜', 96, 3, 'G1.5 A.5 G1 E3 G1.5 A.5 G1 E3 d2 d1 B3 c2 c1 G3 A2 A1 c1.5 B.5 A1 G1.5 A.5 G1 E3 A2 A1 c1.5 B.5 A1 G1.5 A.5 G1 E3 d2 d1 f1.5 d.5 B1 c3 e3 c1.5 G.5 E1 G1.5 F.5 D1 C6', 'C3 C3 C3 C3 G73 G73 C3 C3 F3 F3 C3 C3 F3 F3 C3 C3 G73 G73 C3 C3 C3 G73 C3 C3'],
  ['おめでとうクリスマス', 132, 3, 'G1 c1 c.5 d.5 c.5 B.5 A1 A1 A1 d1 d.5 e.5 d.5 c.5 B1 G1 G1 e1 e.5 f.5 e.5 d.5 c1 A1 G.5 G.5 A1 d1 B1 c3', 'G1 C3 F3 D73 G3 E73 Am3 F1 G2 C3']
];
const MB_NOTE = { C:60, D:62, E:64, F:65, G:67, A:69, B:71 };
const mbParse = str => str.split(' ').map(t => { if (t[0] === 'R') return [null, +t.slice(1)]; const m = /^(_?)(#?)([A-Ga-g])([\d.]+)$/.exec(t); const up = m[3] === m[3].toLowerCase(); let n = MB_NOTE[m[3].toUpperCase()] + (up ? 12 : 0) + (m[2] ? 1 : 0) - (m[1] ? 12 : 0); if (m[3] === 'b') n = 59; return [n, +m[4]]; });
const MB = { on:false, i:0, ctx:null, out:null, timer:0 };
const mbSessionOff = () => {}; // 音の種類を途中で切りかえると、iPhoneで次に鳴らなくなることがあるので切りかえない
function mbStop(){ if (!MB.on) return; MB.on = false; setTimeout(mbSessionOff, 1000); clearTimeout(MB.timer); const o = MB.out; if (o){ try { o.gain.setTargetAtTime(0, MB.ctx.currentTime, .15); const c = MB.comp; setTimeout(() => { o.disconnect(); if (c) c.disconnect(); }, 900); } catch (e) {} } MB.out = null; MB.comp = null; }
// 伴奏の和音：[ベース, [和音]]
const MB_CH = { C:[48, [55, 60, 64]], F:[53, [57, 60, 65]], G:[43, [55, 59, 62]], G7:[43, [53, 59, 62]], D7:[50, [54, 57, 60]], E7:[52, [56, 59, 62]], Am:[45, [57, 60, 64]], Dm:[50, [57, 62, 65]] };
let mbIR = null;
function mbReverb(ctx){ // 小さなホールの響き（ノイズを減衰させたインパルス）。曲ごとに新しく作る（前の曲の響きが残らないように）
  if (!mbIR || mbIR.sampleRate !== ctx.sampleRate){ const len = ctx.sampleRate * 2.4; mbIR = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++){ const d = mbIR.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); } }
  const cv = ctx.createConvolver(); cv.buffer = mbIR; return cv;
}
function mbNote(ctx, out, t, n, vol, pan, lead){
  const f = 440 * Math.pow(2, (n + 12 - 69) / 12), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null, dst = p || out; if (p){ p.pan.value = pan; p.connect(out); }
  // オルゴールの櫛の音：わずかにずらした2本の基音（うなり）＋高い倍音
  const parts = lead ? [[1, .1, 1.8, -3], [1, .06, 1.8, 4], [3, .022, .4, 0], [5.2, .01, .2, 0], [8.1, .004, .1, 0]] : [[1, .1, 1.3, 0], [3, .014, .3, 0]];
  for (const [mul, amp, dec, cents] of parts){
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * mul; o.detune.value = cents;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp * vol, t + .005); g.gain.exponentialRampToValueAtTime(.0004, t + dec * (n > 84 ? .7 : 1));
    o.connect(g); g.connect(dst); o.start(t); o.stop(t + dec + .05); (MB.osc || (MB.osc = [])).push(o);
  }
}
// iPhoneは「指をはなした」タイミングでしか音を出す許可をくれないので、最初のタッチで音の準備をしておく
// iPhoneは電話・通知・画面ロックのあと音の準備が「中断」のまま戻らないことがある。さわった瞬間（同期）に作り直して確実に鳴らす
function mbCtx(fresh){ if (window.kajiAudio) return (MB.ctx = window.kajiAudio(fresh)); const AC = window.AudioContext || window.webkitAudioContext;
  if (MB.ctx && fresh && MB.ctx.state !== 'running'){ try { MB.ctx.close(); } catch (e) {} MB.ctx = null; }
  if (!MB.ctx) MB.ctx = new AC(); if (MB.ctx.state !== 'running'){ try { MB.ctx.resume(); } catch (e) {} } return MB.ctx; }
function mbUnlock(){ try { const c = mbCtx(), b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) {} }
for (const ev of ['touchend', 'pointerup', 'click']) document.addEventListener(ev, () => { if (!MB.ctx || MB.ctx.state !== 'running') mbUnlock(); }, { capture:true });
function musicBoxTap(){ if (MB.on && MB.ctx && MB.ctx.state === 'running'){ mbStop(); return; } if (MB.on) mbStop(); mbCtx(true); mbUnlock(); mbPlay(); }
// 1曲おわったら少し間をあけて次の曲へ（さわって止めるまで順番に流れる）
function mbPlay(){
  MB.osc = (MB.osc || []).filter(o => o._t > (MB.ctx ? MB.ctx.currentTime : 0));
  try {
    const ctx = mbCtx();
    const [name, bpm, meter, score, chords] = MB_SONGS[MB.i % MB_SONGS.length]; MB.i++;
    const out = MB.out = ctx.createGain(), lim = ctx.createDynamicsCompressor(); out.gain.value = 1; lim.threshold.value = -4; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .15; out.connect(lim); lim.connect(ctx.destination); /* 音割れしないように最後にリミッター */
    const dry = ctx.createGain(), wet = ctx.createGain(), comp = ctx.createDynamicsCompressor(); dry.gain.value = 1; wet.gain.value = .32;
    MB.comp = comp; comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(dry); dry.connect(out); const rv = mbReverb(ctx); comp.connect(rv); rv.connect(wet); wet.connect(out);
    const beat = 60 / bpm, t0 = ctx.currentTime + .1; let t = t0, last = t0;
    // メロディ（すこしだけ揺らして手回しっぽく）
    for (const [n, b] of mbParse(score)){ if (n !== null) mbNote(ctx, comp, t + (Math.random() - .5) * .012, n, 1, .15, true); last = t; t += b * beat; }
    // 伴奏：拍の頭にベース、ほかの拍に和音をパラランと
    let ct = t0;
    for (const tok of chords.split(' ')){
      if (tok[0] === 'R'){ ct += +tok.slice(1) * beat; continue; } const m = /^(Am|Dm|G7|D7|E7|[CFG])([\d.]+)$/.exec(tok), [bass, tri] = MB_CH[m[1]], len = +m[2];
      for (let i = 0; i < len; i++){
        const bt = ct + i * beat;
        if (meter === 3 ? i % 3 === 0 : i % 2 === 0) mbNote(ctx, comp, bt, bass + (meter === 4 && i % 4 === 2 ? 7 : 0), .75, -.25);
        else tri.forEach((x, j) => mbNote(ctx, comp, bt + j * .028, x, .42, -.1 + j * .1));
      }
      ct += len * beat;
    }
    MB.on = true; const end = (t - ctx.currentTime + 1.8) * 1000; MB.timer = setTimeout(() => { if (!MB.on) return; const o = MB.out; setTimeout(() => { try { o.disconnect(); } catch (e) {} }, 4000); mbPlay(); }, end);
    if (window.kajiToast) window.kajiToast(`♪ ${name}`);
  } catch (e) { MB.on = false; }
}
// アプリを閉じるときは、ゆっくり消さずにその場で全部止める（途中で音が止められると「プー」と鳴り続けることがあるため）
function mbKill(){ clearTimeout(MB.timer); const was = MB.on; MB.on = false; for (const o of MB.osc || []){ try { o.stop(0); } catch (e) {} try { o.disconnect(); } catch (e) {} } MB.osc = [];
  for (const n of [MB.out, MB.comp]) if (n){ try { if (n.gain) n.gain.value = 0; n.disconnect(); } catch (e) {} } MB.out = MB.comp = null; if (was && MB.ctx){ try { MB.ctx.suspend(); } catch (e) {} } }
document.addEventListener('visibilitychange', () => { if (document.hidden) mbKill(); });
addEventListener('pagehide', mbKill);
function xkMusicBox(){ const g = new THREE.Group(); const wd = WOOD('#8a4a22', '#5a2a10', { roughness:.3 }); addM(g, RB(.42, .2, .3, .02), wd, 0, .1); addM(g, RB(.44, .02, .32, .008), M('#e7b84a', { metalness:.6, roughness:.3 }), 0, .2);
  const lid = new THREE.Group(); lid.position.set(0, .21, -.15); lid.rotation.x = -1.2; g.add(lid); addM(lid, RB(.42, .03, .3, .01), wd, 0, 0, .15); addM(lid, new THREE.PlaneGeometry(.36, .24), new THREE.MeshStandardMaterial({ color:'#eef4f8', metalness:.6, roughness:.08 }), 0, -.016, .15, Math.PI / 2);
  const stage = new THREE.Group(); stage.position.set(0, .21, .02); g.add(stage); addM(stage, new THREE.CylinderGeometry(.09, .09, .02, 28), M('#c8302c', { roughness:.6 }), 0, .01); const tr = makeDeco('c15', .2); tr.position.y = .02; stage.add(tr); const sm = makeDeco('snowman', .1); sm.position.set(.06, .02, .02); stage.add(sm);
  ticker(stage, () => { if (MB.on){ const n = performance.now(); stage.rotation.y += Math.min(.05, (n - (stage.userData.t || n)) / 1000) * 1.6; stage.userData.t = n; lid.rotation.x += (-1.75 - lid.rotation.x) * .08; } else { stage.userData.t = 0; lid.rotation.x += (-1.2 - lid.rotation.x) * .08; } });
  g.userData.onTap = () => musicBoxTap(); for (const s of [-1, 1]) addM(g, new THREE.SphereGeometry(.018, 10, 8), M('#e7b84a', { metalness:.6 }), s * .17, .015, .12); return g; }
function xkLantern(){ const g = new THREE.Group(); const l = makeDeco('c7', .9); g.add(l); glowIn(g, '#ffd070', 1.3, .6, 0, .42, .05); g.userData.lamp = [0, .45, 0]; const p = makeDeco('pine', .14); p.position.set(.22, 0, .1); g.add(p); const p2 = makeDeco('c12', .12); p2.position.set(-.2, 0, .12); g.add(p2); blobIn(g, 0, 0, .6, .6, .5); return g; }
function xkPoinsettia(){ const g = new THREE.Group(); const top = kpot(g, .24, .34, glaze('#c8302c')); addM(g, new THREE.TorusGeometry(.26, .02, 8, 32), M('#e7b84a', { metalness:.5, roughness:.3 }), 0, top - .02, 0, Math.PI / 2);
  const geo = leafGeo(leafShape(.35, 1), .1, .1), red = leafMat('#d8302e', '#a82020'), grn = leafMat('#2f7a3e', '#21592b'); for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++){ const a = k / 7 * Math.PI * 2 + r * .45, c = KV(Math.cos(a) * r * .06, top + .2 + r * .05, Math.sin(a) * r * .06); leafAt(g, geo, r < 2 ? grn : red, c, KV(Math.cos(a), .35 + r * .15, Math.sin(a)), .26 - r * .03, 0); }
  for (let k = 0; k < 6; k++){ const a = k * 1.2; leafAt(g, geo, red, KV(Math.cos(a) * .05, top + .32, Math.sin(a) * .05), KV(Math.cos(a), .6, Math.sin(a)), .18, 0); addM(g, new THREE.SphereGeometry(.012, 8, 6), M('#f2c14e'), Math.cos(a) * .02, top + .34, Math.sin(a) * .02); } g.userData.onTap = () => sway(g, .06, 1500, 'z'); return g; }
function xkAngel(){ const g = new THREE.Group(); const a = makeDeco('angel', .75); a.position.y = .12; g.add(a); addM(g, new THREE.LatheGeometry([[.001, 0], [.2, 0], [.2, .04], [.15, .06], [.13, .12], [.001, .12]].map(([x, y]) => new THREE.Vector2(x, y)), 32), M('#fbf6ec', { roughness:.25 })); glowIn(g, '#fff0c0', .9, .35, 0, .6, .05); g.userData.onTap = () => animate(1400, k => { a.position.y = .12 + Math.sin(k * Math.PI) * .1; a.rotation.y = k * Math.PI * 2; }); return g; }
function xkGiftPile(){ const g = new THREE.Group(); [[0, 0, 0, .42, .3], [.3, 0, .15, .3, -.4], [-.28, 0, .12, .3, .5], [.05, .36, .02, .26, .8], [.15, 0, -.25, .26, .1]].forEach(([x, y, z, h, r]) => { const p = makeDeco('gift', h); p.position.set(x, y, z); p.rotation.y = r; g.add(p); }); blobIn(g, 0, 0, 1.2, .9, .4); return g; }
function xkWhiteTree(){ const g = new THREE.Group(); const top = kpot(g, .16, .2, glaze('#c8a050')); const wm = M('#f6f8fb', { roughness:.7 }); for (let i = 0; i < 4; i++){ const r = .26 - i * .055, y = top + .1 + i * .17; addM(g, new THREE.ConeGeometry(r, .28, 24), wm, 0, y + .12); }
  const cs = ['#c8302c', '#e7b84a', '#9ab8d8', '#c8302c']; for (let i = 0; i < 18; i++){ const t = i / 18, y = top + .14 + t * .62, r = (.26 - t * .2), a = i * 2.4; addM(g, new THREE.SphereGeometry(.022, 10, 8), M(cs[i % 4], { roughness:.25, metalness:.3 }), Math.cos(a) * r, y, Math.sin(a) * r); } const st = makeDeco('star', .12); st.position.y = top + .82; g.add(st); return g; }
function xkHollyGarland(){ const g = new THREE.Group(); const xs = t => -1 + t * 2, ys = t => .86 - Math.sin(t * Math.PI) * .2;
  // 細い麻ひもに、トゲのあるヒイラギの葉を2枚ずつ・赤い実・電球を間をあけてつける
  stem(g, Array.from({ length:21 }, (_, i) => KV(xs(i / 20), ys(i / 20), .03)), .006, M('#c8a878', { roughness:1 }));
  const holly = (() => { const s = new THREE.Shape(); const pts = []; for (let k = 0; k <= 6; k++){ const t = k / 6, y = t, w = Math.sin(t * Math.PI) * .32; pts.push([w + (k % 2 ? .08 : 0), y]); } s.moveTo(0, 0); pts.forEach(([x, y]) => s.lineTo(x, y)); for (let k = pts.length - 1; k >= 0; k--){ const [x, y] = pts[k]; s.lineTo(-x, y); } s.closePath(); return s; })();
  const geo = leafGeo(holly, .12, .18), lm = new THREE.MeshPhysicalMaterial({ map:veinT('#2c7a3c', '#1e5a2c'), side:THREE.DoubleSide, roughness:.3, clearcoat:.6 }), berry = M('#d8302e', { roughness:.2 });
  const N = 6; for (let i = 0; i < N; i++){ const t = (i + .5) / N, p = KV(xs(t), ys(t), .05);
    leafAt(g, geo, lm, p, KV(-.75, -.55, .4), .2, .3); leafAt(g, geo, lm, p, KV(.75, -.55, .4), .2, -.3); leafAt(g, geo, lm, p, KV(0, .9, .45), .15, 0);
    for (const [dx, dy] of [[-.015, -.012], [.015, -.012], [0, .006]]) addM(g, new THREE.SphereGeometry(.02, 12, 10), berry, p.x + dx, p.y + dy, p.z + .03);
    if (i < N - 1){ const t2 = (i + 1) / N, q = KV(xs(t2), ys(t2) - .045, .045); stem(g, [KV(q.x, ys(t2), .035), KV(q.x, q.y + .02, .04)], .003, M('#3a5a2a')); addM(g, new THREE.SphereGeometry(.016, 10, 8), new THREE.MeshStandardMaterial({ color:'#fff2c0', emissive:'#ffd070', emissiveIntensity:1.2 }), q.x, q.y, q.z); } }
  for (const s2 of [-1, 1]){ const b = makeDeco('c16', .14); b.position.set(s2 * 1.0, .84, .05); g.add(b); } g.userData.onTap = () => sway(g, .03, 1500, 'z'); return g; }
function xkStockingGarland(){ const g = new THREE.Group(); const xs = t => -.85 + t * 1.7, ys = t => .85 - Math.sin(t * Math.PI) * .12; stem(g, Array.from({ length:13 }, (_, i) => KV(xs(i / 12), ys(i / 12), .03)), .005, M('#c8a878', { roughness:1 }));
  const cs = [['#c8302c', '#fbf6ec'], ['#2f7a4a', '#fbf6ec'], ['#fbf6ec', '#c8302c'], ['#c8302c', '#2f7a4a'], ['#2f7a4a', '#c8302c']]; cs.forEach(([a, b], i) => { const t = (i + .5) / 5, x = xs(t), y = ys(t); const st = new THREE.Group(); st.position.set(x, y - .02, .04); st.rotation.z = (i - 2) * .06; g.add(st);
    const sh = new THREE.Shape(); sh.moveTo(-.05, 0); sh.lineTo(.05, 0); sh.lineTo(.05, -.15); sh.quadraticCurveTo(.05, -.22, .12, -.22); sh.quadraticCurveTo(.15, -.26, .1, -.28); sh.lineTo(-.02, -.28); sh.quadraticCurveTo(-.06, -.26, -.05, -.18); sh.closePath();
    addM(st, new THREE.ExtrudeGeometry(sh, { depth:.03, bevelEnabled:true, bevelSize:.01, bevelThickness:.01, bevelSegments:2 }), M('#ffffff', { map:knitTexR(a, b), roughness:1 }), 0, 0, -.015); addM(st, RB(.13, .045, .05, .02), M('#fbf6ec', { roughness:1 }), 0, -.01, 0); addM(st, RB(.012, .03, .008, .003), WOOD('#d8b078', '#a8804a'), 0, .02, .02); }); return g; }
function xkCards(){ const g = new THREE.Group(); const xs = t => -.85 + t * 1.7, ys = t => .8 - Math.sin(t * Math.PI) * .1; stem(g, Array.from({ length:13 }, (_, i) => KV(xs(i / 12), ys(i / 12), .025)), .004, M('#c8302c', { roughness:.8 }));
  const card = (k) => canvasTex(96, 128, (c, w, h) => { const bg = ['#c8302c', '#2f6a46', '#fbf3e2', '#2a3a6c', '#fbf3e2'][k]; c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#e7b84a'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
    if (k === 0 || k === 3){ c.fillStyle = '#fbf6ec'; for (let i = 0; i < 6; i++){ c.save(); c.translate(w / 2, h * .42); c.rotate(i * Math.PI / 3); c.fillRect(-2, -26, 4, 26); c.restore(); } } if (k === 1){ c.fillStyle = '#e7b84a'; c.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 10 : 24; c.lineTo(w / 2 + Math.cos(a) * r, h * .4 + Math.sin(a) * r); } c.fill(); }
    if (k === 2 || k === 4){ c.fillStyle = '#2f7a4a'; c.beginPath(); c.moveTo(w / 2, 24); c.lineTo(w / 2 - 28, h * .66); c.lineTo(w / 2 + 28, h * .66); c.fill(); c.fillStyle = '#c8302c'; for (let i = 0; i < 6; i++){ c.beginPath(); c.arc(w / 2 + (i % 3 - 1) * 12, 50 + i * 9, 3.5, 0, 7); c.fill(); } }
    c.fillStyle = k === 2 || k === 4 ? '#c8302c' : '#fbf6ec'; c.font = 'bold 11px serif'; c.textAlign = 'center'; c.fillText('Merry Xmas', w / 2, h - 16); }, [1, 1]);
  for (let i = 0; i < 6; i++){ const t = (i + .5) / 6, x = xs(t), y = ys(t); const cd = addM(g, RB(.14, .19, .006, .002), M('#ffffff', { map:card(i % 5), roughness:.7 }), x, y - .1, .03, 0, 0, (i - 2.5) * .05); addM(g, RB(.012, .03, .008, .003), WOOD('#d8b078', '#a8804a'), x, y - .005, .035); } return g; }
function xkBells(){ const g = new THREE.Group(); const r = M('#c8302c', { roughness:.4 }); addM(g, RB(.06, .04, .02, .01), r, 0, .9, .03); for (const s of [-1, 1]){ addM(g, new THREE.TorusGeometry(.06, .016, 8, 20), r, s * .06, .88, .04, 0, 0, s * .4); stem(g, [KV(0, .88, .04), KV(s * .05, .7, .04), KV(s * .04, .5, .045)], .012, r); }
  const gold = M('#e7b84a', { metalness:.7, roughness:.22 }); const bells = []; for (const [x, y, sc] of [[-.07, .45, 1.8], [.08, .42, 1.6], [0, .3, 1.5]]){ const b = new THREE.Group(); b.position.set(x, y, .06); b.scale.setScalar(sc); g.add(b); addM(b, new THREE.LatheGeometry(Array.from({ length:12 }, (_, i) => { const t = i / 11; return new THREE.Vector2(.02 + Math.pow(t, 1.8) * .08 + (t > .9 ? (t - .9) * .3 : 0), .12 - t * .14); }), 28), gold); addM(b, new THREE.SphereGeometry(.018, 10, 8), gold, 0, -.03); bells.push(b); }
  const h = makeDeco('c12', .2); h.position.set(0, .82, .06); g.add(h); g.userData.onTap = () => bells.forEach((b, i) => sway(b, .35, 1400 + i * 200, 'z')); return g; }
function xkPineWreath(){ const g = new THREE.Group(); const w = makeDeco('c9', .7); w.position.y = .2; g.add(w); for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; const p = makeDeco('pine', .09); p.position.set(Math.cos(a) * .26, .55 + Math.sin(a) * .26, .06); p.rotation.z = a; g.add(p); } g.userData.onTap = () => sway(w, .08, 1500, 'z'); return g; }

// 部屋のほかの家具とつりあう大きさに
/* ===== 庭のもの（窓の外の庭に、自由に置いて動かせる） ===== */
const GLOWM = c => new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:1.6 });
function gdBird(c){ const b = new THREE.Group(), m = M(c, { roughness:.6 }); addM(b, new THREE.SphereGeometry(.05, 14, 10), m, 0, .05, 0, 0, 0, 0, 1.3, 1, 1); addM(b, new THREE.SphereGeometry(.035, 12, 8), m, .05, .09, 0);
  addM(b, new THREE.ConeGeometry(.012, .03, 8), M('#e8a23a'), .092, .088, 0, 0, 0, -Math.PI / 2); for (const s of [-1, 1]) addM(b, new THREE.SphereGeometry(.007, 6, 4), M('#1a1a1a'), .07, .1, s * .022); addM(b, RB(.07, .012, .045, .005), m, -.075, .075, 0, 0, 0, .45); return b; }
function gdLantern(){ const g = new THREE.Group(), sn = snowMat;
  addM(g, new THREE.CylinderGeometry(.24, .28, .14, 22), sn, 0, .07, 0);
  for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; addM(g, RB(.11, .17, .1, .035), sn, Math.cos(a) * .16, .225, Math.sin(a) * .16, 0, -a, 0); }
  addM(g, new THREE.SphereGeometry(.22, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), sn, 0, .31, 0, 0, 0, 0, 1, .55, 1); addM(g, new THREE.SphereGeometry(.07, 12, 8), sn, 0, .43, 0);
  addM(g, new THREE.CylinderGeometry(.035, .035, .08, 12), M('#fbf2e2'), 0, .19, 0); addM(g, new THREE.ConeGeometry(.02, .05, 10), new THREE.MeshBasicMaterial({ color:'#ffc040' }), 0, .255, 0);
  glowIn(g, '#ffc870', .95, .85, 0, .24, 0); return g; }
function gdFeeder(){ const g = new THREE.Group(), wd = WOOD('#a8744a', '#6a4226');
  addM(g, new THREE.CylinderGeometry(.03, .04, .82, 10), wd, 0, .41, 0); addM(g, RB(.4, .03, .3, .01), wd, 0, .82, 0); for (const s of [-1, 1]) addM(g, RB(.4, .04, .02, .008), wd, 0, .85, s * .14);
  for (const x of [-.16, .16]) addM(g, RB(.03, .2, .03, .01), wd, x, .93, 0);
  for (const s of [-1, 1]){ addM(g, RB(.48, .025, .2, .008), wd, 0, 1.06, s * .085, s * .62, 0, 0); addM(g, RB(.48, .03, .18, .012), snowMat, 0, 1.085, s * .09, s * .62, 0, 0); }
  for (let i = 0; i < 18; i++) addM(g, new THREE.SphereGeometry(.012, 6, 4), M(i % 3 ? '#d8b878' : '#8a6a3a'), (Math.sin(i * 7.1)) * .12, .845, Math.cos(i * 3.3) * .08);
  const b1 = gdBird('#d8303a'); b1.position.set(-.08, .84, .05); b1.rotation.y = .5; g.add(b1); const b2 = gdBird('#6a8ab8'); b2.position.set(.1, .84, -.02); b2.rotation.y = 2.6; b2.scale.setScalar(.9); g.add(b2);
  addM(g, new THREE.SphereGeometry(.09, 12, 8), snowMat, 0, .02, 0, 0, 0, 0, 1.6, .4, 1.6); return g; }
function gdWoodpile(){ const g = new THREE.Group(), bark = M('#6a4630', { map:barkTexR, roughness:.9 }), end = M('#d8b080', { roughness:.8 }), ring = [bark, end, end];
  const rows = [[4, .055], [3, .16], [2, .265]]; rows.forEach(([n, y], r) => { for (let i = 0; i < n; i++){ const x = (i - (n - 1) / 2) * .115; const m = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .62, 12), ring); m.rotation.x = Math.PI / 2; m.position.set(x + (r % 2 ? .01 : 0), y, (i % 2 ? .02 : -.02)); m.castShadow = m.receiveShadow = true; g.add(m); } });
  addM(g, new THREE.SphereGeometry(.13, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), snowMat, 0, .3, 0, 0, 0, 0, 1.3, .35, 2.4);
  addM(g, new THREE.CylinderGeometry(.13, .15, .2, 18), M('#7a5236', { map:barkTexR }), .48, .1, .05); addM(g, new THREE.CylinderGeometry(.13, .13, .01, 18), end, .48, .205, .05); addM(g, new THREE.CylinderGeometry(.1, .12, .03, 14), snowMat, .48, .22, .05);
  const ax = new THREE.Group(); ax.position.set(.48, .2, .05); ax.rotation.z = -.5; g.add(ax); addM(ax, new THREE.CylinderGeometry(.012, .014, .32, 8), WOOD('#c89a62', '#8a6236'), 0, .14, 0); addM(ax, RB(.1, .06, .02, .006), M('#8a8e98', { metalness:.7, roughness:.35 }), .04, .02, 0); return g; }
function gdSnowBear(){ const g = new THREE.Group(), sn = snowMat, dk = M('#2a2a2e', { roughness:.4 });
  addM(g, new THREE.SphereGeometry(.24, 26, 18), sn, 0, .22, 0, 0, 0, 0, 1, .95, .9); addM(g, new THREE.SphereGeometry(.17, 24, 16), sn, 0, .52, .03);
  for (const s of [-1, 1]){ addM(g, new THREE.SphereGeometry(.06, 14, 10), sn, s * .12, .66, 0, 0, 0, 0, 1, 1, .6); addM(g, new THREE.SphereGeometry(.08, 14, 10), sn, s * .17, .07, .12, 0, 0, 0, 1, .8, 1.3); addM(g, new THREE.SphereGeometry(.065, 12, 8), sn, s * .2, .28, .08, 0, 0, 0, .8, 1.3, .8); addM(g, new THREE.SphereGeometry(.014, 8, 6), dk, s * .06, .56, .17); }
  addM(g, new THREE.SphereGeometry(.07, 14, 10), sn, 0, .48, .16, 0, 0, 0, 1, .8, 1); addM(g, new THREE.SphereGeometry(.022, 10, 8), dk, 0, .5, .23);
  addM(g, new THREE.TorusGeometry(.14, .028, 8, 22), M('#2f7a4a', { roughness:.9 }), 0, .4, .02, Math.PI / 2 - .1); addM(g, RB(.05, .14, .02, .01), M('#2f7a4a', { roughness:.9 }), .08, .33, .15, 0, 0, .2); return g; }
function gdLitPine(){ const g = new THREE.Group(), pm = std('#245040', { roughness:.88 }), pts = [];
  for (let k = 0; k < 4; k++){ const f = k / 4, r = .42 - f * .27, hh = .32, y = .2 + f * .5; addM(g, new THREE.ConeGeometry(r, hh, 16), pm, 0, y, 0); addM(g, new THREE.ConeGeometry(r * .5, hh * .2, 14), snowMat, 0, y + hh * .38, 0);
    for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2 + k; pts.push([Math.cos(a) * r * .82, y - hh * .36, Math.sin(a) * r * .82]); } }
  addM(g, new THREE.CylinderGeometry(.04, .05, .14, 8), M('#5a3a28'), 0, .07, 0); bulbsIn(g, pts, .022);
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .035 : .08; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  addM(g, new THREE.ExtrudeGeometry(st, { depth:.02, bevelEnabled:false }), GLOWM('#ffd25a'), 0, .86, -.01); glowIn(g, '#ffe08a', .4, .8, 0, .86, .02); return g; }
function gdMailbox(){ const g = new THREE.Group(), red = M('#c8302c', { roughness:.4, metalness:.15 });
  addM(g, new THREE.CylinderGeometry(.035, .04, .72, 10), M('#3a3a42', { roughness:.5 }), 0, .36, 0); addM(g, RB(.24, .24, .36, .05), red, 0, .8, 0);
  addM(g, new THREE.SphereGeometry(.13, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), snowMat, 0, .915, 0, 0, 0, 0, .95, .4, 1.4);
  addM(g, RB(.02, .14, .03, .008), M('#f2c14e', { metalness:.5, roughness:.3 }), .13, .9, -.08); addM(g, RB(.02, .05, .09, .006), M('#f2c14e', { metalness:.5, roughness:.3 }), .13, .99, -.03);
  addM(g, RB(.16, .012, .01, .003), M('#2a2a2e'), 0, .86, .181); const lt = makeDeco('gift', .1); lt.position.set(-.04, .74, .2); lt.rotation.set(.3, 0, .2); g.add(lt);
  addM(g, new THREE.SphereGeometry(.1, 12, 8), snowMat, 0, .02, 0, 0, 0, 0, 1.4, .4, 1.4); return g; }
function gdBench(){ const g = new THREE.Group(), iron = M('#2c3530', { roughness:.45, metalness:.4 }), wd = WOOD('#b07a48', '#7a4a22');
  for (const x of [-.45, .45]){ addM(g, RB(.04, .4, .04, .01), iron, x, .2, .14); addM(g, RB(.04, .7, .04, .01), iron, x, .35, -.14, -.12, 0, 0); addM(g, RB(.04, .04, .32, .01), iron, x, .24, 0); addM(g, RB(.04, .04, .3, .01), iron, x, .5, .02); }
  for (let i = 0; i < 4; i++) addM(g, RB(1.04, .03, .065, .01), wd, 0, .275, -.11 + i * .075);
  for (let i = 0; i < 3; i++) addM(g, RB(1.04, .06, .025, .01), wd, 0, .45 + i * .085, -.17 - i * .012, -.12, 0, 0);
  addM(g, RB(.95, .045, .26, .02), snowMat, 0, .31, .0); addM(g, RB(1.0, .03, .05, .015), snowMat, 0, .66, -.2);
  const mf = new THREE.Mesh(new THREE.TorusGeometry(.08, .028, 8, 18), M('#c8302c', { roughness:1 })); mf.position.set(.2, .34, .02); mf.rotation.x = Math.PI / 2; mf.scale.set(1, 1.6, 1); mf.castShadow = true; g.add(mf); return g; }
function gdStreetLamp(){ const g = new THREE.Group(), iron = M('#22302a', { roughness:.4, metalness:.5 });
  addM(g, new THREE.CylinderGeometry(.09, .12, .14, 14), iron, 0, .07, 0); addM(g, new THREE.CylinderGeometry(.03, .04, 1.5, 12), iron, 0, .85, 0); addM(g, new THREE.TorusGeometry(.05, .012, 6, 16), iron, 0, 1.45, 0, Math.PI / 2);
  addM(g, new THREE.CylinderGeometry(.06, .1, .06, 6), iron, 0, 1.5, 0); for (let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2 + Math.PI / 4; addM(g, RB(.012, .22, .012, .004), iron, Math.cos(a) * .1, 1.64, Math.sin(a) * .1); }
  addM(g, new THREE.CylinderGeometry(.09, .09, .2, 4, 1, true), new THREE.MeshStandardMaterial({ color:'#fff1c0', emissive:'#ffcf70', emissiveIntensity:1.4, transparent:true, opacity:.85, side:THREE.DoubleSide }), 0, 1.64, 0, 0, Math.PI / 4);
  addM(g, new THREE.ConeGeometry(.16, .14, 4), iron, 0, 1.82, 0, 0, Math.PI / 4); addM(g, new THREE.ConeGeometry(.13, .07, 4), snowMat, 0, 1.86, 0, 0, Math.PI / 4); addM(g, new THREE.SphereGeometry(.025, 8, 6), iron, 0, 1.92, 0);
  glowIn(g, '#ffd27a', 1.5, .8, 0, 1.64, 0); const w = makeDeco('c9', .22); w.position.set(0, 1.12, .05); g.add(w); return g; }
function gdReindeer(){ const g = new THREE.Group(), wm = new THREE.MeshStandardMaterial({ color:'#fff6dc', emissive:'#ffe6a8', emissiveIntensity:1.1, roughness:.5 });
  const lim = (a, b, r = .018) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), wm); m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); };
  addM(g, new THREE.SphereGeometry(.2, 18, 12), wm, 0, .55, 0, 0, 0, 0, 1.6, .75, .75);
  for (const [x, z] of [[-.22, -.08], [-.22, .08], [.22, -.08], [.22, .08]]) lim([x, .5, z], [x + (x > 0 ? .02 : -.02), 0, z], .022);
  lim([.26, .62, 0], [.36, .86, 0], .045); addM(g, new THREE.SphereGeometry(.08, 14, 10), wm, .42, .9, 0, 0, 0, -.3, 1.4, .9, .9); addM(g, new THREE.SphereGeometry(.025, 8, 6), new THREE.MeshBasicMaterial({ color:'#ff4a3a' }), .53, .87, 0);
  for (const s of [-1, 1]){ lim([.4, .96, s * .04], [.36, 1.14, s * .12]); lim([.37, 1.08, s * .09], [.45, 1.16, s * .13], .012); lim([.36, 1.14, s * .12], [.3, 1.22, s * .16], .012); lim([.4, .94, s * .05], [.37, .99, s * .11], .014); }
  lim([-.3, .6, 0], [-.38, .68, 0], .03);
  for (const [x, y] of [[0, .55], [.3, .75], [.42, .95], [-.2, .58], [.22, .3], [-.22, .3]]) glowIn(g, '#ffe6a8', .45, .45, x, y, 0); return g; }
function gdArch(){ const g = new THREE.Group(), R = .62, gm = std('#2f6a46', { roughness:.9 });
  const arc = new THREE.TorusGeometry(R, .045, 10, 40, Math.PI); for (const z of [0]) addM(g, arc, gm, 0, 0, z);
  for (const s of [-1, 1]) addM(g, new THREE.CylinderGeometry(.03, .04, .06, 10), M('#3a3a42'), s * R, .03, 0);
  const pts = []; for (let i = 0; i <= 18; i++){ const a = i / 18 * Math.PI; pts.push([Math.cos(a) * R, Math.sin(a) * R, .045]); } bulbsIn(g, pts, .026);
  for (let i = 1; i < 18; i += 2){ const a = i / 18 * Math.PI; addM(g, new THREE.SphereGeometry(.05, 10, 8), snowMat, Math.cos(a) * R, Math.sin(a) * R + .04, 0, 0, 0, 0, 1, .5, 1); }
  const bw = new THREE.Group(); bw.position.set(0, R + .02, .06); g.add(bw); const red = M('#c8302c', { roughness:.5 }); for (const s of [-1, 1]) addM(bw, new THREE.SphereGeometry(.06, 12, 8), red, s * .06, 0, 0, 0, 0, s * .4, 1.3, .7, .5); addM(bw, new THREE.SphereGeometry(.03, 10, 8), red, 0, 0, .01);
  for (const s of [-1, 1]) addM(bw, RB(.03, .14, .01, .004), red, s * .03, -.08, 0, 0, 0, s * .25);
  for (const s of [-1, 1]) addM(g, new THREE.SphereGeometry(.1, 12, 8), snowMat, s * R, .01, 0, 0, 0, 0, 1.2, .35, 1.2); return g; }
function gdXTree(){ const g = new THREE.Group(), pm = std('#1f5a3e', { roughness:.85 }), pts = [], H = 1.75, n = 6;
  addM(g, new THREE.CylinderGeometry(.07, .09, .3, 10), M('#5a3a28', { map:barkTexR }), 0, .15, 0);
  for (let k = 0; k < n; k++){ const f = k / n, r = .58 - f * .46, hh = .48 - f * .1, y = .32 + f * (H - .55); const cone = new THREE.ConeGeometry(r, hh, 22, 3), P = cone.attributes.position;
    for (let i = 0; i < P.count; i++){ const x = P.getX(i), z = P.getZ(i), yy = P.getY(i); if (yy < -hh / 2 + .01){ const a = Math.atan2(z, x), w = 1 + Math.sin(a * 11) * .08; P.setX(i, x * w); P.setZ(i, z * w); P.setY(i, yy - Math.abs(Math.sin(a * 11)) * .04); } } cone.computeVertexNormals(); addM(g, cone, pm, 0, y, 0);
    addM(g, new THREE.ConeGeometry(r * .78, hh * .3, 22), snowMat, 0, y + hh * .2, 0, 0, k, 0, 1, 1, 1);
    for (let i = 0; i < 9 + (n - k) * 2; i++){ const a = i * 2.39996 + k, rr = r * .86; pts.push([Math.cos(a) * rr, y - hh * .4 + (i % 3) * .05, Math.sin(a) * rr]); } }
  bulbsIn(g, pts, .024);
  const cols = ['#c8302c', '#f2c14e', '#3a6ab8', '#e8e8f0', '#c8302c', '#2f8a5a'];
  for (let i = 0; i < 26; i++){ const t = i / 26, y = .35 + t * (H - .7), r = (.56 - t * .42) * .9, a = i * 1.7; addM(g, new THREE.SphereGeometry(.04 - t * .012, 12, 8), M(cols[i % cols.length], { metalness:.5, roughness:.25 }), Math.cos(a) * r, y, Math.sin(a) * r); }
  const sp = []; for (let i = 0; i <= 80; i++){ const t = i / 80, y = .3 + t * (H - .6), r = (.58 - t * .46) * .84 + .02, a = t * Math.PI * 2 * 3.2; sp.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); }
  addM(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp), 200, .014, 6), M('#f2c14e', { metalness:.6, roughness:.3 }), 0, 0, 0);
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .055 : .13; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  addM(g, new THREE.ExtrudeGeometry(st, { depth:.03, bevelEnabled:true, bevelSize:.008, bevelThickness:.008, bevelSegments:1 }), GLOWM('#ffd25a'), 0, 1.6, -.015); glowIn(g, '#ffe08a', .7, .9, 0, 1.6, .02);
  for (const [x, z, w, c, rb] of [[.3, .26, .18, '#c8302c', '#f2c14e'], [-.28, .3, .15, '#3a6ab8', '#ffffff'], [.02, .42, .13, '#2f8a5a', '#c8302c']]){ addM(g, RB(w, w * .8, w, .02), M(c, { roughness:.5 }), x, w * .4, z, 0, x * 2, 0); addM(g, RB(w + .01, w * .8 + .01, .03, .005), M(rb), x, w * .4, z, 0, x * 2, 0); }
  addM(g, new THREE.SphereGeometry(.5, 20, 10), snowMat, 0, 0, 0, 0, 0, 0, 1, .1, 1); return g; }
function gdSnowFamily(){ const g = new THREE.Group();
  const one = (x, z, s, c, ry) => { const m = new THREE.Group(); m.position.set(x, 0, z); m.scale.setScalar(s); m.rotation.y = ry; g.add(m);
    for (const [r, y] of [[.2, .17], [.145, .46], [.1, .68]]) addM(m, new THREE.SphereGeometry(r, 20, 14), snowMat, 0, y, 0); for (const sx of [-1, 1]) addM(m, new THREE.SphereGeometry(.012, 8, 6), M('#2a2a2e'), sx * .035, .71, .09);
    addM(m, new THREE.ConeGeometry(.018, .09, 8), M('#f08a3a'), 0, .68, .14, Math.PI / 2); addM(m, new THREE.TorusGeometry(.115, .026, 8, 20), M(c, { roughness:1 }), 0, .58, 0, Math.PI / 2);
    addM(m, new THREE.SphereGeometry(.085, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(c, { roughness:1 }), 0, .74, 0, -.15); addM(m, new THREE.SphereGeometry(.03, 10, 8), M('#fbfbf6', { roughness:1 }), 0, .83, -.01); };
  one(-.32, 0, 1, '#c8302c', .2); one(.12, -.05, .88, '#3a6ab8', -.15); one(-.08, .28, .55, '#f2c14e', .1); addM(g, new THREE.SphereGeometry(.4, 16, 10), snowMat, -.05, .0, .05, 0, 0, 0, 1.6, .12, 1.1); return g; }
function kjScale(o, k){ const g = new THREE.Group(); o.scale.setScalar(k); g.add(o); return g; }
const BUILD = {
  wallpaper:k => swatch('abcd'[k], true), flooring:k => swatch('abcd'[k], false),
  topper:k => treeTopper('abc'[k]), treelights:k => treeLights('abc'[k]), garland:k => treeGarland('abc'[k]),
  fireplace:k => fireplace(['stone', 'brick', 'white'][k]), stockings:k => stockings(['felt', 'knit', 'plaid'][k]), mantel:k => mantelTop('abc'[k]), wall:k => k === 3 ? nyShimekazari() : k === 4 ? nyKakejiku() : wallDeco('abc'[k]),
  curtain:k => curtains('abcd'[k]), wintop:k => winTop('abc'[k]), sill:k => k === 3 ? nySillKagami() : sillDeco('abc'[k]), outside:k => k === 3 ? nySunrise() : outsideDeco('abc'[k]), table:k => k === 3 ? nyKotatsu() : tableSpot('abc'[k]), toys:k => k === 3 ? nyToys() : toys('abc'[k]),
  rug:k => k === 3 ? nyRug() : rugItem('abc'[k]), treebase:k => k === 3 ? nyMousen() : treeBase('abc'[k]), shelf:k => shelfSpot('abc'[k]), sofa:k => k === 3 ? nyZabuton() : sofaSpot('abc'[k]), lamp:k => k === 3 ? nyAndon() : k === 4 ? nyKadomatsu() : lampSpot('abc'[k]), special:k => k === 1 ? nyNanakusa() : sparkle(),
  plant:k => kjScale([kjMonstera, kjCactus, kjPachira, kjPothos, kjOlive, kjSucculent][k](), 1.35), zakka:k => kjScale([kjBlocks, kjGlobe, kjBooks, kjRadio, kjFishbowl, kjRecord, kjCatCushion][k](), [1.6, 1.5, 1.5, 1.5, 1.7, 1.5, 1.4][k]), seat:k => kjScale([kjBeanbag, kjStool, kjCushions][k](), 1.25), wall2:k => kjScale([kjMirror, kjFlags, kjPhotos, kjSwag, kjMugShelf, kjHato][k](), 1.25),
  xzakka:k => [xkSled, xkTrain, xkReindeer, xkNutcracker, xkGingerHouse, xkBoot, xkMusicBox, xkLantern, xkPoinsettia, xkAngel, xkGiftPile, xkWhiteTree][k](), garden:k => kjScale([gdLantern, gdFeeder, gdWoodpile, gdSnowBear, gdLitPine, gdMailbox, gdBench, gdStreetLamp][k](), .85), xgarden:k => kjScale([gdReindeer, gdArch, gdSnowFamily, gdXTree][k](), .85),
  xwall:k => kjScale([xkHollyGarland, xkStockingGarland, xkCards, xkBells, xkPineWreath][k](), 1.1),
};
function buildFurn(key){ const it = FURN_BY[key]; if (!it) return null; const g = BUILD[it.slot](it.k); g.userData.key = key; return g; }
// 置き場所：[x, y, z, 向き]
const ANCHOR = { fireplace:[FPX, 0, bz], stockings:[FPX, FPH, bz], mantel:[FPX, FPH + .12, bz + .2], wall:[FPX, FPH + .2, bz + .05], curtain:[WX, WY, bz], wintop:[WX, WY + WH / 2 + .2, bz + .3], sill:[WX, WY - WH / 2 - .12, bz], outside:[WX + .15, .6, bz - .02 - 2.7],
  table:[1.05, 0, -.55], toys:[.05, 0, .95], rug:[.15, 0, .35], shelf:[-RW / 2 + .32, 0, .8, Math.PI / 2 - .6], sofa:[RW / 2 - .1, 0, .75, -Math.PI / 2 + .2], lamp:[1.98, 0, -1.55], plant:[-1.9, 0, -1.6], zakka:[.9, 0, .55], xzakka:[-.4, 0, .9], xwall:[1.2, 1.95, bz + .05], seat:[-.95, 0, 1.0], garden:[WX + .7, .6, OUT_Z - 2.5], xgarden:[WX - .8, .6, OUT_Z - 3.1], wall2:[1.35, 1.9, bz + .05], treebase:null, special:null, wallpaper:null, flooring:null, topper:null, treelights:null, garland:null };
const NEEDS_FP = { stockings:1, mantel:1 };
const mounted = {};
function disposeG(o){ o.traverse(m => { if (m.isMesh || m.isPoints){ m.geometry && m.geometry.dispose(); } }); }
function placeItem(slot, key){ if (slot === 'wallpaper'){ applyWall(key ? key.slice(-1) : 'a'); return; } if (slot === 'flooring'){ applyFloor(key ? key.slice(-1) : 'a'); return; } const cur = mounted[slot]; if (cur && cur.userData.key === key) return; if (cur){ (cur.parent || scene).remove(cur); disposeG(cur); delete mounted[slot]; }
  if (!key || !FURN_BY[key]) return; const g = buildFurn(key);
  if (TREE_PARTS.includes(slot)){ g.visible = !nyMode; tree.add(g); mounted[slot] = g; return; }
  if (slot === 'treebase' || slot === 'special'){ if (slot === 'treebase') g.scale.setScalar(tree.scale.x); treeRoot.add(g); mounted[slot] = g; return; }
  if (slot === 'stockings' || slot === 'mantel'){ const fp = Object.values(inst).find(x => x.rec.key.startsWith('fireplace_')); if (!fp) return; const a = ANCHOR[slot]; g.position.set(0, a[1], a[2] - bz); fp.g.add(g); mounted[slot] = g; return; }
  const a = ANCHOR[slot]; g.position.set(a[0], a[1], a[2]); g.rotation.y = a[3] || 0;
  scene.add(g); mounted[slot] = g; }
/* ===== 置き場所（床と壁の家具は自由に動かせる。同じ家具を2つ以上も） ===== */
const GRID = .25, ZMAX = 2.6;
const inst = {}; // id → { g, rec }
/* 庭のもの：rec.yard=1。外の地面の上（窓の外のグループ）に置く */
const isYardKey = k => !!(FURN_BY[k] && GARDEN_SLOTS.includes(FURN_BY[k].slot)), isYard = o => !!(o && o.rec && o.rec.yard);
const YB = { x0:WX - 1.65, x1:WX + 1.4, z0:OUT_Z - 4.05, z1:OUT_Z - 1.6 }, YY = .6;
const yardY = (x, z) => Math.max(.55, terH(x - WX, OUT_Z - z)) - .02;
const YOBS = [[-3.0, -2.4, .5], [3.1, -2.8, .5]].map(([x, z, r]) => new THREE.Box3(new THREE.Vector3(WX + x - r, 0, OUT_Z + z - r), new THREE.Vector3(WX + x + r, 3, OUT_Z + z + r)));
const GARDEN = () => !opts.garden || !!opts.garden(); let hiddenYard = [];
const parentFor = k => isYardKey(k) ? outside : scene;
function partBox(g, opt = {}){ g.updateMatrixWorld(true); const box = new THREE.Box3(); g.traverse(m => { if (!m.isMesh || !m.visible) return; if (m.material && (m.material.map === blobTex || m.material.blending === THREE.AdditiveBlending)) return; if (m.userData.thumbTree || m.userData.selMark) return; if (opt.noGift && m.parent && m.parent.userData.gift) return; box.expandByObject(m); }); return box; }
// ツリーは、まわりのプレゼント置き場（いくつ置いてあっても）まで含めて場所をとる
function instBox(o){ if (o.rec.key === 'tree'){ const b = partBox(tree); const c = treeRoot.position, R0 = 1.02; b.expandByPoint(new THREE.Vector3(c.x - R0, 0, c.z - R0)); b.expandByPoint(new THREE.Vector3(c.x + R0, .9, c.z + R0)); return b; } return partBox(o.g); }
function recDefault(key){ const it = FURN_BY[key]; if (!it) return null; const a = ANCHOR[it.slot]; if (GARDEN_SLOTS.includes(it.slot)) return { key, yard:1, x:a[0], z:a[2], r:0 }; if (WALL_SLOTS.includes(it.slot)) return { key, wall:'back', u:a[0], y:a[1] }; return { key, x:a[0], z:a[2], r:a[3] || 0 }; }
/* 暖炉の上（棚板）には小さな家具を置ける。のせた家具は rec.on に暖炉のid、lx/lz に棚の上での位置を持つ */
const hostTop = o => o && o.rec && o.rec.key.startsWith('fireplace_') ? { y:FPH + .12, x0:-.74, x1:.74, z0:.0, z1:.42 } : null;
const riders = h => Object.values(inst).filter(p => p.rec.on && p.rec.on === h.rec.id);
function canRide(o){ if (hostTop(o) || isRug(o) || o.rec.key === 'tree' || o.rec.wall) return false; const s = o.rec.on ? null : instBox(o).getSize(new THREE.Vector3()); if (!s) return true; return Math.min(s.x, s.z) <= .5 && Math.max(s.x, s.z) <= 1.1 && s.y <= 1.2; }
function placeInst(o){ const r = o.rec;
  if (r.yard){ o.g.position.set(r.x, yardY(r.x, r.z), r.z); o.g.rotation.y = r.r || 0; return; }
  if (r.on && !r.wall && r.key !== 'tree'){ const h = inst[r.on], t = hostTop(h); if (t){ h.g.updateMatrixWorld(true); const p = h.g.localToWorld(new THREE.Vector3(r.lx || 0, t.y, r.lz || 0)); o.g.position.copy(p); o.g.rotation.y = h.g.rotation.y + (r.r || 0); r.x = +p.x.toFixed(3); r.z = +p.z.toFixed(3); return; } }
  if (r.key === 'tree'){ treeRoot.position.set(r.x, 0, r.z); return; }
  if (r.wall){ const W = r.wall; if (W === 'back'){ o.g.position.set(r.u, r.y, bz + .05); o.g.rotation.y = 0; } else { const s2 = W === 'left' ? -1 : 1; o.g.position.set(s2 * (RW / 2 - .05), r.y, r.u); o.g.rotation.y = -s2 * Math.PI / 2; } return; }
  o.g.position.set(r.x, 0, r.z); o.g.rotation.y = r.r || 0; if (hostTop(o)) for (const p of riders(o)) placeInst(p); }
function syncLayout(layout){ const want = new Map(), gOn = GARDEN(); hiddenYard = []; oldTrees.visible = !gOn; (layout || []).forEach(r => { if (!r || !r.id) return; if (r.yard && !gOn){ hiddenYard.push({ ...r }); return; } want.set(r.id, r); });
  for (const [id, o] of Object.entries(inst)) if (id !== 'tree' && (!want.has(id) || want.get(id).key !== o.rec.key)){ (o.g.parent || scene).remove(o.g); disposeG(o.g); delete inst[id]; }
  for (const [id, r] of want){ if (r.key === 'tree'){ inst.tree = inst.tree || { g:treeRoot, rec:{ id:'tree', key:'tree', x:-1.15, z:-1.65 } }; inst.tree.rec = { ...r }; placeInst(inst.tree); continue; }
    if (!FURN_BY[r.key]) continue; let o = inst[id]; if (!o){ const g = buildFurn(r.key); g.userData.inst = id; parentFor(r.key).add(g); o = inst[id] = { g, rec:{ ...r } }; } o.rec = { ...r }; placeInst(o); }
  for (const o of Object.values(inst)) if (o.rec.on) placeInst(o);
  if (!inst.tree) inst.tree = { g:treeRoot, rec:{ id:'tree', key:'tree', x:treeRoot.position.x, z:treeRoot.position.z } }; }
function layoutOf(){ return [...Object.values(inst).map(o => ({ ...o.rec })), ...hiddenYard.map(r => ({ ...r }))]; }
function legacyLayout(sel){ const L = [{ id:'tree', key:'tree', x:-1.15, z:-1.65 }]; for (const slot of [...FLOOR_SLOTS, ...WALL_SLOTS]){ const k = sel[slot]; if (k && k !== 'none' && FURN_BY[k]) L.push({ id:slot + '_1', ...recDefault(k) }); } return L; }
function setRoom(sel, layout){ sel = sel || {}; lastSel = sel; syncLayout(layout || legacyLayout(sel));
  for (const [slot] of FURN_SLOTS){ if (FLOOR_SLOTS.includes(slot) || WALL_SLOTS.includes(slot) || GARDEN_SLOTS.includes(slot)) continue; let k = sel[slot]; if (TREE_PARTS.includes(slot) && k === undefined) k = slot + '_a'; if (k === 'none') k = null; placeItem(slot, k); }
  // 暖炉にくっつくもの（くつした・暖炉の上）は、暖炉が変わったら付けなおす
  for (const slot of ['stockings', 'mantel']){ const cur = mounted[slot]; if (cur && !cur.parent){ delete mounted[slot]; } if (cur && cur.parent && !Object.values(inst).some(o => o.g === cur.parent)){ cur.parent.remove(cur); delete mounted[slot]; } let k = sel[slot]; if (k === 'none') k = null; if (mounted[slot] && mounted[slot].userData.key !== k){ mounted[slot].parent && mounted[slot].parent.remove(mounted[slot]); delete mounted[slot]; } if (!mounted[slot] && k) placeItem(slot, k); }
  const fpI = Object.values(inst).find(o => o.rec.key.startsWith('fireplace_')); const f = fpI && fpI.g; flames = f ? f.userData.fire.fl : []; fireGlow = f ? f.userData.fire.gw : null; if (f) fireLight.position.copy(f.localToWorld(new THREE.Vector3(0, .55, .8)));
  const lpI = Object.values(inst).find(o => o.rec.key.startsWith('lamp_')), lp = lpI && lpI.g, ll = lp && lp.userData.lamp; if (ll){ lampLight.position.copy(lp.localToWorld(new THREE.Vector3(...ll))); } lampOn = !!ll;
  const ou = mounted.outside, kl = ou && ou.userData.kama; if (kl) kamaLight.position.copy(ou.localToWorld(new THREE.Vector3(...kl))); kamaOn = !!kl;
  applyTime(); shadowsDirty = true; }
/* 重なりチェック（床の家具とツリー。ラグはラグ同士だけ） */
const isRug = o => o.rec.key.startsWith('rug_');
function yardOK(o, b){ if (b.min.x < YB.x0 || b.max.x > YB.x1 || b.min.z < YB.z0 || b.max.z > YB.z1) return false; const sb = b.clone().expandByScalar(-.05);
  if (YOBS.some(x => sb.intersectsBox(x))) return false; const ou = mounted.outside; if (ou && ou.visible !== false && ou.parent){ const ob = partBox(ou); if (!ob.isEmpty() && sb.intersectsBox(ob.expandByScalar(-.08))) return false; }
  for (const p of Object.values(inst)) if (p !== o && isYard(p) && sb.intersectsBox(instBox(p).expandByScalar(-.05))) return false; return true; }
function yardNear(o){ const b0 = instBox(o), x0 = o.rec.x, z0 = o.rec.z, cand = []; for (let dx = -5; dx <= 5.001; dx += GRID) for (let dz = -3.5; dz <= 3.501; dz += GRID) cand.push([dx, dz]); cand.sort((a, c) => Math.hypot(a[0], a[1]) - Math.hypot(c[0], c[1]));
  for (const [dx, dz] of cand){ const b = b0.clone().translate(new THREE.Vector3(dx, 0, dz)); if (!yardOK(o, b)) continue; o.rec = { ...o.rec, x:+(x0 + dx).toFixed(3), z:+(z0 + dz).toFixed(3) }; placeInst(o); return true; } return false; }
function boxOK(o){ const b = instBox(o); if (isYard(o)) return yardOK(o, b); if (o.rec.wall){ const W = o.rec.wall; if (b.max.y > RH - .1 || b.min.y < 1.12) return false;
    if (W === 'back'){ if (b.min.x < -RW / 2 + .05 || b.max.x > RW / 2 - .05) return false; if (b.max.x > WX - WW / 2 - .12 && b.min.x < WX + WW / 2 + .12 && b.max.y > WY - WH / 2 - .25) return false; }
    else if (b.min.z < bz + .05 || b.max.z > ZMAX) return false;
    for (const p of Object.values(inst)) if (p !== o && p.rec.wall === W && b.intersectsBox(instBox(p).expandByScalar(-.02))) return false; return true; }
  const shrink = x => x.expandByScalar(-.06);
  if (o.rec.on){ const h = inst[o.rec.on], t = hostTop(h); if (!t) return false; h.g.updateMatrixWorld(true);
    for (const x of [b.min.x, b.max.x]) for (const z of [b.min.z, b.max.z]){ const l = h.g.worldToLocal(new THREE.Vector3(x, t.y, z)); if (l.x < t.x0 - .06 || l.x > t.x1 + .06 || l.z < t.z0 - .12 || l.z > t.z1 + .12) return false; }
    for (const p of riders(h)) if (p !== o && shrink(b.clone()).intersectsBox(shrink(instBox(p)))) return false; return true; }
  if (b.min.x < -RW / 2 - .08 || b.max.x > RW / 2 + .08 || b.min.z < bz - .16 || b.max.z > ZMAX) return false;
  for (const p of Object.values(inst)){ if (p === o || p.rec.wall || p.rec.on) continue; if (isRug(o) !== isRug(p)) continue; const pb = instBox(p); if (shrink(b.clone()).intersectsBox(shrink(pb))) return false; } return true; }
// おけない場所で指をはなしたら、いちばん近くのおける場所へずらす
function findNear(o){ if (isYard(o)) return yardNear(o); if (o.rec.wall || o.rec.on) return false; const b0 = instBox(o), x0 = o.rec.x, z0 = o.rec.z, shrink = x => x.expandByScalar(-.06);
  const others = Object.values(inst).filter(p => p !== o && !p.rec.wall && !p.rec.on && isRug(p) === isRug(o) && !riders(o).includes(p)).map(p => shrink(instBox(p)));
  const cand = []; for (let dx = -3; dx <= 3.001; dx += GRID) for (let dz = -3; dz <= 3.001; dz += GRID) cand.push([dx, dz]); cand.sort((a, c) => Math.hypot(a[0], a[1]) - Math.hypot(c[0], c[1]));
  for (const [dx, dz] of cand){ const b = b0.clone().translate(new THREE.Vector3(dx, 0, dz)); if (b.min.x < -RW / 2 - .08 || b.max.x > RW / 2 + .08 || b.min.z < bz - .16 || b.max.z > ZMAX) continue;
    const sb = shrink(b.clone()); if (others.some(p => sb.intersectsBox(p))) continue; o.rec = { ...o.rec, x:+(x0 + dx).toFixed(3), z:+(z0 + dz).toFixed(3) }; placeInst(o); return true; }
  return false; }
function autoPlace(key){ if (isYardKey(key) && !GARDEN()) return null; const id = key.split('_')[0] + '_' + Math.random().toString(36).slice(2, 7), it = FURN_BY[key]; if (!it) return null; const g = buildFurn(key); g.userData.inst = id; parentFor(key).add(g);
  const o = inst[id] = { g, rec:{ id, ...recDefault(key) } }; placeInst(o); if (boxOK(o)) return { ...o.rec };
  if (o.rec.yard){ if (yardNear(o)) return { ...o.rec }; g.parent.remove(g); delete inst[id]; return null; }
  if (o.rec.wall){ for (const W of ['back', 'left', 'right']) for (let y = 1.6; y < 3.4; y += .2) for (let u = -2; u <= 2; u += .2){ o.rec = { id, key, wall:W, u:+u.toFixed(2), y:+y.toFixed(2) }; placeInst(o); if (boxOK(o)) return { ...o.rec }; } }
  else { const cand = []; for (let x = -2; x <= 2; x += GRID) for (let z = bz + .5; z <= ZMAX - .3; z += GRID) cand.push([x, z]); cand.sort((a, b) => Math.hypot(a[0] - .3, a[1] + .2) - Math.hypot(b[0] - .3, b[1] + .2));
    for (const rr of [o.rec.r || 0, 0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const [x, z] of cand){ o.rec = { id, key, x:+x.toFixed(3), z:+z.toFixed(3), r:rr }; placeInst(o); if (boxOK(o)) return { ...o.rec }; } }
  scene.remove(g); delete inst[id]; return null; }
/* ===== もようがえモード：指でなぞって動かす ===== */
let editOn = false, sel = null, mv = null; const selMark = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color:'#ffd25a', transparent:true, opacity:.35, depthWrite:false })); selMark.rotation.x = -Math.PI / 2; selMark.visible = false; selMark.userData.selMark = 1; scene.add(selMark);
function markSel(bad){ if (!sel){ selMark.visible = false; return; } const b = instBox(sel); selMark.visible = true; selMark.material.color.set(bad ? '#ff5a4a' : '#ffd25a');
  if (sel.rec.wall){ const W = sel.rec.wall, c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3()); selMark.rotation.set(0, W === 'back' ? 0 : W === 'left' ? Math.PI / 2 : -Math.PI / 2, 0); selMark.position.copy(c); if (W === 'back') selMark.position.z = bz + .03; else selMark.position.x = (W === 'left' ? -1 : 1) * (RW / 2 - .03); selMark.scale.set((W === 'back' ? sz.x : sz.z) + .2, sz.y + .2, 1); }
  else { selMark.rotation.set(-Math.PI / 2, 0, 0); selMark.position.set((b.min.x + b.max.x) / 2, isYard(sel) ? b.min.y + .03 : .012, (b.min.z + b.max.z) / 2); selMark.scale.set(b.max.x - b.min.x + .16, b.max.z - b.min.z + .16, 1); } shadowsDirty = true; }
function pickInst(e){ const r = cv.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera);
  const objs = Object.values(inst).filter(o => isYard(o) === !!peek).map(o => o.g); const hits = ray.intersectObjects(objs, true).filter(h => !(h.object.material && (h.object.material.map === blobTex || h.object.material.blending === THREE.AdditiveBlending)));
  // ラグは他の家具より後回し
  hits.sort((a, b) => { const ra = rootInst(a.object), rb = rootInst(b.object); return (ra && isRug(ra) ? 1 : 0) - (rb && isRug(rb) ? 1 : 0) || a.distance - b.distance; }); const h = hits[0]; return h ? rootInst(h.object) : null; }
function rootInst(m){ let o = m; while (o && !o.userData.inst) o = o.parent; return o ? inst[o.userData.inst] : null; }
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), yardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -YY);
function hitPlane(e, plane){ const r = cv.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera); const p = new THREE.Vector3(); return ray.ray.intersectPlane(plane, p) ? p : null; }
function wallHit(e){ const cands = [['back', new THREE.Plane(new THREE.Vector3(0, 0, 1), -bz)], ['left', new THREE.Plane(new THREE.Vector3(1, 0, 0), RW / 2)], ['right', new THREE.Plane(new THREE.Vector3(-1, 0, 0), RW / 2)]]; let best = null;
  for (const [W, pl] of cands){ const p = hitPlane(e, pl); if (!p) continue; const ok = W === 'back' ? Math.abs(p.x) <= RW / 2 : p.z >= bz && p.z <= ZMAX; if (!ok) continue; const d = p.distanceTo(camera.position); if (!best || d < best.d) best = { W, p, d }; } return best; }
function editDown(e){ const o = pickInst(e); sel = o; mv = o ? { o, start:{ ...o.rec }, moved:false, x0:e.clientX, y0:e.clientY, ride:canRide(o), rstart:o.rec.on ? riders(inst[o.rec.on] || o).map(p => p) : [] } : null;
  if (o && o.rec.on){ mv.off = [0, 0]; }
  else if (o && isYard(o)){ const p = hitPlane(e, yardPlane); mv.off = p ? [p.x - o.rec.x, p.z - o.rec.z] : [0, 0]; mv.ride = false; }
  else if (o && !o.rec.wall){ const p = hitPlane(e, floorPlane); mv.off = p ? [p.x - o.rec.x, p.z - o.rec.z] : [0, 0]; }
  if (o && o.rec.wall){ const w = wallHit(e); mv.off = w ? (w.W === 'back' ? [w.p.x - o.rec.u, w.p.y - o.rec.y] : [w.p.z - o.rec.u, w.p.y - o.rec.y]) : [0, 0]; }
  markSel(false); opts.onSelect && opts.onSelect(o ? { id:o.rec.id, key:o.rec.key, wall:!!o.rec.wall } : null); }
function editMove(e){ if (!mv) return; if (!mv.moved && Math.hypot(e.clientX - mv.x0, e.clientY - mv.y0) < 6) return; mv.moved = true; const o = mv.o;
  if (o.rec.wall){ const w = wallHit(e); if (!w) return; const u = (w.W === 'back' ? w.p.x : w.p.z) - (w.W === o.rec.wall ? mv.off[0] : 0), y = w.p.y - mv.off[1]; o.rec = { ...o.rec, wall:w.W, u:+(Math.round(u / .1) * .1).toFixed(2), y:+(Math.round(y / .1) * .1).toFixed(2) }; }
  else if (isYard(o)){ const p = hitPlane(e, yardPlane); if (!p) return; o.rec = { ...o.rec, x:+(Math.round((p.x - mv.off[0]) / GRID) * GRID).toFixed(3), z:+(Math.round((p.z - mv.off[1]) / GRID) * GRID).toFixed(3) }; }
  else { let rode = false;
    if (mv.ride) for (const h of Object.values(inst)){ const t = hostTop(h); if (!t || h === o) continue; const hp = hitPlane(e, new THREE.Plane(new THREE.Vector3(0, 1, 0), -t.y)); if (!hp) continue; h.g.updateMatrixWorld(true); const l = h.g.worldToLocal(hp.clone());
      if (l.x < t.x0 - .1 || l.x > t.x1 + .1 || l.z < t.z0 - .2 || l.z > t.z1 + .35) continue; const cl = (v, a, b2) => Math.max(a, Math.min(b2, v));
      o.rec = { ...o.rec, on:h.rec.id, lx:+(Math.round(cl(l.x, t.x0, t.x1) / .05) * .05).toFixed(2), lz:+(Math.round(cl(l.z, t.z0, t.z1) / .05) * .05).toFixed(2) }; rode = true; break; }
    if (rode){ placeInst(o); mv.bad = !boxOK(o); markSel(mv.bad); shadowsDirty = true; return; }
    if (o.rec.on){ const { on, lx, lz, ...rest } = o.rec; o.rec = rest; mv.off = [0, 0]; }
    const p = hitPlane(e, floorPlane); if (!p) return; o.rec = { ...o.rec, x:+(Math.round((p.x - mv.off[0]) / GRID) * GRID).toFixed(3), z:+(bz + Math.round((p.z - mv.off[1] - bz) / GRID) * GRID).toFixed(3) }; }
  placeInst(o); if (o.rec.key === 'tree') treeRoot.updateMatrixWorld(true); mv.bad = !boxOK(o); markSel(mv.bad); shadowsDirty = true; }
function editUp(){ if (!mv) return; const o = mv.o; if (mv.moved){ if (mv.bad && !o.rec.on && !o.rec.wall && o.rec.key !== 'tree' && findNear(o)) mv.bad = false; if (mv.bad){ o.rec = { ...mv.start }; placeInst(o); } else commit(); setRoomLights(); } markSel(false); mv = null; }
function setRoomLights(){ const fpI = Object.values(inst).find(o => o.rec.key.startsWith('fireplace_')); if (fpI) fireLight.position.copy(fpI.g.localToWorld(new THREE.Vector3(0, .55, .8))); const lpI = Object.values(inst).find(o => o.rec.key.startsWith('lamp_')); if (lpI && lpI.g.userData.lamp) lampLight.position.copy(lpI.g.localToWorld(new THREE.Vector3(...lpI.g.userData.lamp))); shadowsDirty = true; }
function commit(){ opts.onLayout && opts.onLayout(layoutOf()); }
function editRotate(){ if (!sel || sel.rec.wall || sel.rec.key === 'tree') return; if (sel.rec.on){ const prev = { ...sel.rec }; sel.rec = { ...sel.rec, r:(sel.rec.r || 0) + Math.PI / 2 }; placeInst(sel); if (!boxOK(sel)){ sel.rec = prev; placeInst(sel); markSel(false); return false; } markSel(false); commit(); return true; } const b0 = instBox(sel), c0 = b0.getCenter(new THREE.Vector3()), prev = { ...sel.rec };
  sel.rec = { ...sel.rec, r:((sel.rec.r || 0) + Math.PI / 2) }; placeInst(sel); const c1 = instBox(sel).getCenter(new THREE.Vector3()); sel.rec.x = +(Math.round((sel.rec.x + c0.x - c1.x) / GRID) * GRID).toFixed(3); sel.rec.z = +(bz + Math.round((sel.rec.z + c0.z - c1.z - bz) / GRID) * GRID).toFixed(3); placeInst(sel);
  if (!boxOK(sel) && !findNear(sel)){ sel.rec = prev; placeInst(sel); markSel(false); return false; } markSel(false); commit(); setRoomLights(); return true; }
function editRemove(){ if (!sel || sel.rec.key === 'tree') return; const id = sel.rec.id; if (hostTop(sel)) for (const p of riders(sel)){ const { on, lx, lz, ...rest } = p.rec; p.rec = rest; placeInst(p); if (!boxOK(p)) findNear(p); } (sel.g.parent || scene).remove(sel.g); disposeG(sel.g); delete inst[id]; sel = null; markSel(false); commit(); setRoom(lastSel, layoutOf()); opts.onSelect && opts.onSelect(null); }
function setEdit(on){ editOn = !!on; sel = null; mv = null; markSel(false); }
let lastSel = {};
let lampOn = false, kamaOn = false, lampOff = false, nightNow = false;


/* 電飾のサムネイル：コードでつながった電球を近くで */
function lightsThumb(k){ const g = new THREE.Group(); const kind = 'abc'[k], cols = kind === 'a' ? ['#ffd25a', '#ff7a7a', '#7ad8ff', '#a8ff8a', '#ff9ae0'] : kind === 'b' ? ['#ffe2a0', '#fff0c8', '#ffd890'] : ['#f4f8ff', '#cfe4ff', '#e8f0ff'];
  const pts = Array.from({ length:9 }, (_, i) => new THREE.Vector3(-1 + i * .25, -.18 * Math.sin(i / 8 * Math.PI) + .06 * Math.sin(i * 1.7), 0)); const cur = new THREE.CatmullRomCurve3(pts);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(cur, 80, .014, 6), std(kind === 'a' ? '#2a5a3a' : '#d8d4c8', { roughness:.5 })); g.add(wire);
  const N = 6; for (let i = 0; i < N; i++){ const t = (i + .5) / N, p = cur.getPointAt(t), c = cols[i % cols.length], hang = new THREE.Group(); hang.position.copy(p); hang.rotation.z = (i % 2 ? .25 : -.2); g.add(hang);
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(.035, .04, .07, 12), std(kind === 'a' ? '#2a5a3a' : '#c8c4b8', { roughness:.4 })); sock.position.y = -.05; hang.add(sock);
    const bulb = kind === 'c' ? new THREE.Mesh(new THREE.SphereGeometry(.085, 20, 16), new THREE.MeshStandardMaterial({ color:'#ffffff', emissive:c, emissiveIntensity:.8, roughness:.6 })) : new THREE.Mesh(new THREE.SphereGeometry(kind === 'b' ? .05 : .065, 18, 14), new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:1.5, roughness:.3 }));
    if (kind !== 'c') bulb.scale.y = 1.45; bulb.position.y = kind === 'c' ? -.16 : -.15; hang.add(bulb); const gl = glow(c, kind === 'c' ? .5 : .42, .45); gl.position.y = bulb.position.y; hang.add(gl); }
  return g; }
/* 家具のサムネイル */
let thR = null, thS = null, thC = null; const thCache = {};
function thumbFurn(key){ if (thCache[key]) return thCache[key];
  if (!thR){ thR = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true }); thR.setPixelRatio(1); thR.setSize(200, 200); thR.outputColorSpace = THREE.SRGBColorSpace; thR.toneMapping = THREE.NeutralToneMapping;
    thS = new THREE.Scene(); thS.environment = scene.environment; thS.environmentIntensity = .5; thS.add(new THREE.HemisphereLight('#fff1dc', '#b98a6a', 1.5)); const d = new THREE.DirectionalLight('#fff4e0', 2.2); d.position.set(-2, 5, 5); thS.add(d); thC = new THREE.PerspectiveCamera(28, 1, .01, 100); }
  if (key === 'tree'){ const g = new THREE.Group(); firBase.forEach(m => g.add(m.clone())); g.scale.setScalar(.86); thS.add(g); g.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
    thC.position.copy(c).addScaledVector(new THREE.Vector3(.35, .45, 1).normalize(), r / Math.sin(THREE.MathUtils.degToRad(14))); thC.lookAt(c); thR.render(thS, thC); const url = thR.domElement.toDataURL('image/png'); thS.remove(g); return thCache[key] = url; }
  const g = FURN_BY[key] && FURN_BY[key].slot === 'treelights' ? lightsThumb(FURN_BY[key].k) : buildFurn(key); if (!g) return ''; const drop = []; g.traverse(m => { if (m.material && m.material.map === blobTex) drop.push(m); }); g.traverse(m => { if (m.userData.thumbOnly){ m.visible = true; m.position.y = 1.8; } }); drop.forEach(m => m.parent.remove(m));
  const snow0 = snowMat.color.clone(); snowMat.color.set('#f4f8ff'); thS.add(g); g.updateMatrixWorld(true); const box = new THREE.Box3(); g.traverse(m => { if (m.isMesh && !(m.material && m.material.blending === THREE.AdditiveBlending)) box.expandByObject(m); }); if (box.isEmpty()) box.setFromObject(g);
  const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2; const ft = g.userData.flatThumb, flat = FURN_BY[key].slot === 'rug' || FURN_BY[key].slot === 'treebase', dir = ft === 'wall' ? new THREE.Vector3(0, 0, 1) : ft === 'floor' ? new THREE.Vector3(0, 1, .001) : new THREE.Vector3(.35, flat ? 1.3 : .45, 1).normalize();
  thC.position.copy(c).addScaledVector(dir, r / Math.sin(THREE.MathUtils.degToRad(14))); thC.lookAt(c); thR.render(thS, thC); const url = thR.domElement.toDataURL('image/png'); snowMat.color.copy(snow0);
  thS.remove(g); disposeG(g); thCache[key] = url; return url; }

/* ---------- 光 ---------- */
const hemi = new THREE.HemisphereLight('#fff1dc', '#b98a6a', 1.1); scene.add(hemi);
const key = new THREE.DirectionalLight('#ffe2bd', 2.2); key.position.set(-3, 8, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -.0005; key.shadow.normalBias = .02;
Object.assign(key.shadow.camera, { left:-3.5, right:3.5, top:4.5, bottom:-2, near:1, far:20 }); scene.add(key);
const treeLight = new THREE.PointLight('#ffd890', .7, 5.5); treeLight.position.set(.2, 2.1, 2.8); /* 近すぎると葉の一部だけ白く光るので、少し離してやわらかく当てる */ treeRoot.add(treeLight);
let isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
function applyTime(){ hemi.intensity = isNight ? .75 : 1.1; key.intensity = isNight ? 1.2 : 2.2; key.color.set(isNight ? '#ffd2a0' : '#ffe2bd'); treeLight.intensity = isNight ? 1.4 : .7; winLight.intensity = isNight ? 1.8 : 1.0;
  outsideTime(isNight); outLight.intensity = isNight ? .25 : 1.4; snowMat.color.set(isNight ? '#5c6a96' : '#f4f8ff'); pineM.color.set(isNight ? '#1f4a40' : '#245040'); pineM2.color.set(isNight ? '#173c34' : '#1d4535'); snowPts.material.opacity = isNight ? 1 : .8; fireLight.intensity = flames.length ? (isNight ? 5.5 : 3.5) : 0; nightNow = isNight; lampLight.intensity = lampOn && !lampOff ? (isNight ? 3.2 : 1.6) : 0; kamaLight.intensity = kamaOn ? 1.4 : 0; shadowsDirty = true; }

/* ---------- 初期状態 ---------- */
let shadowsDirty = true;
setRoom(opts.room || {});
applyTime();

/* ---------- 描画（必要なときだけ。電球と星のゆらぎは30fps） ---------- */
renderer.shadowMap.autoUpdate = false;
let last = 0, stopped = false;
/* オーナメントにズーム */
let zoom = null, zoomed = false; const zLook = new THREE.Vector3();
function camLook(){ const d = new THREE.Vector3(); camera.getWorldDirection(d); return camera.position.clone().addScaledVector(d, camera.position.distanceTo(target)); }
function zoomTo(id){ const o = placed.find(x => x.userData.id === id) || gifts.find(x => x.userData.id === id); if (!o) return; const p = new THREE.Vector3(); (o.children[0] || o).getWorldPosition(p);
  const dir = camera.position.clone().sub(p).normalize(), far = o.userData.gift ? 2.6 : 2.0; zoom = { t0:performance.now(), fromP:camera.position.clone(), fromL:camLook(), toP:p.clone().addScaledVector(dir, far), toL:p.clone().add(new THREE.Vector3(0, -far * .17, 0)), dur:650 }; zoomed = true; }
// 窓をのぞく：窓をさわると、窓の前まで寄って外をながめる。どこかをさわると戻る
let peek = false;
function peekWindow(){ if (zoomed || view || !GARDEN()) return; /* 窓をのぞく機能もテスト中（ひろきの端末だけ） */ peek = true; village.visible = true; oldTrees.visible = false; fpCheck(); const px = WX, toP = new THREE.Vector3(px - .2, 3.2, OUT_Z - .6), toL = new THREE.Vector3(px, -16, OUT_Z - 27);
  zoom = { t0:performance.now(), fromP:camera.position.clone(), fromL:camLook(), toP, toL, dur:800, fromF:camera.fov, toF:Math.min(78, 52 / Math.min(1, camera.aspect + .25)) }; zoomed = true; if (window.kajiToast && !editOn) setTimeout(() => { if (peek && !editOn) window.kajiToast('どこかをさわるともどるよ'); }, 900); }
function zoomOut(){ if (!zoomed) return; zoomed = false; const wasPeek = peek; peek = false; if (wasPeek) setTimeout(() => { if (!peek) village.visible = false; }, 600); const keepP = camera.position.clone(), keepL = camLook(), keepF = camera.fov; camera.fov = 32; placeCamera(); const toP = camera.position.clone(); camera.position.copy(keepP); camera.lookAt(keepL); zoom = { t0:performance.now(), fromP:keepP, fromL:keepL, toP, toL:target.clone(), dur:550, end:true, ...(wasPeek ? { fromF:keepF, toF:32 } : {}) }; if (wasPeek){ camera.fov = keepF; camera.updateProjectionMatrix(); } }
function stepZoom(now){ if (!zoom) return; const t = Math.min(1, (now - zoom.t0) / zoom.dur), k = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  camera.position.lerpVectors(zoom.fromP, zoom.toP, k); zLook.lerpVectors(zoom.fromL, zoom.toL, k); camera.lookAt(zLook); if (zoom.toF){ camera.fov = zoom.fromF + (zoom.toF - zoom.fromF) * k; camera.updateProjectionMatrix(); } if (t >= 1){ if (zoom.end) placeCamera(); zoom = null; } }
function frame(now){
  requestAnimationFrame(frame);
  if (document.hidden || stopped || now - last < (peek ? 4 : 33)) return; last = now; /* のぞいている間はなめらかに（60fps） */
  for (let k = appear.length - 1; k >= 0; k--){ const a = appear[k], t = Math.min(1, (now - a.t0) / 420), s = t < 1 ? 1 + 1.7 * Math.pow(t - 1, 3) + .7 * Math.pow(t - 1, 2) : 1; const bs = a.o.userData.base || 1; a.o.scale.setScalar(Math.max(.001, s * bs)); if (t >= 1){ a.o.scale.setScalar(bs); appear.splice(k, 1); shadowsDirty = true; } }
  giftRing.rotation.y = tree.rotation.y;
  tickAll(now); stepAnims(now);
  if (advBox.visible){ const p = (now % 2600) / 2600, j = p < .22 ? Math.sin(p / .22 * Math.PI) : 0; advBox.position.y = .1 * j; advBox.scale.set(1 + .06 * j, 1 - .06 * j * (p < .05 ? -1 : 1), 1 + .06 * j); }
  if (!drag && Math.abs(spin) > .0004){ tree.rotation.y += spin; spin *= .93; shadowsDirty = true; if (Math.abs(spin) <= .0004 && opts.onRot) opts.onRot(tree.rotation.y); }
  // 回したときの振り子：回転の加速で横にふれ、速さで外へ広がる
  { const fdt = Math.min(.1, (now - (frame.prevT || now)) / 1000) || .033; frame.prevT = now; const rot = tree.rotation.y, w = (rot - (frame.prevRot ?? rot)) / fdt, acc = (w - (frame.prevW ?? w)) / fdt; frame.prevRot = rot; frame.prevW = w;
    placed.forEach(o => { const u = o.userData, r = Math.hypot(o.position.x, o.position.z) || .5, L = .22; u.th = u.th || 0; u.om = u.om || 0;
      const al = -(9.8 / L) * u.th - 3.2 * u.om - THREE.MathUtils.clamp(acc * r, -40, 40) * .22 / L; u.om += al * fdt; u.th = THREE.MathUtils.clamp(u.th + u.om * fdt, -.7, .7);
      const tgt = Math.min(.75, Math.atan(w * w * r / 9.8)); u.tilt = (u.tilt || 0) + (tgt - (u.tilt || 0)) * Math.min(1, fdt * 8);
      const sw = u.swing, dt = sw ? now - sw : 1e9, tap = dt < 2200 ? .55 * Math.exp(-dt / 520) * Math.sin(dt / 85) : 0;
      o.rotation.z = u.rz + .035 * Math.sin(now / 1150 + u.ph) + tap + u.th; o.rotation.x = tap * .35 - u.tilt; }); }
  const fb = 1 + Math.max(0, 1 - (now - fireBoost) / 1600) * .7; flames.forEach(o => { const k = (1 + .14 * Math.sin(now / 110 + o.ph) + .08 * Math.sin(now / 47 + o.ph * 2)) * fb; o.f.scale.set(1 - (k - 1) * .5, k, 1 - (k - 1) * .5); o.f.position.y = .2 + o.h * k / 2; }); if (flames.length){ fireLight.intensity = (isNight ? 5.5 : 3.5) * (1 + .12 * Math.sin(now / 90) + .06 * Math.sin(now / 37)); fireGlow.material.opacity = .6 + .1 * Math.sin(now / 70); }
  for (const g of [...Object.values(mounted), ...Object.values(inst).map(o => o.g)]){ const u = g.userData; if (u.glow) u.glow.material.opacity = .55 + .15 * Math.sin(now / 900); if (u.bulbs) u.bulbs.forEach(b => b.gl.material.opacity = .35 + .3 * (Math.sin(now / 600 + b.ph) * .5 + .5)); if (u.pend) u.pend.rotation.z = .22 * Math.sin(now / 1000 * Math.PI); if (u.sparkle){ u.sparkle.rotation.y = now / 9000; u.sparkle.material.opacity = .6 + .4 * Math.sin(now / 400); } }
  if (outside.visible) outsideTick(now);
  if (shadowsDirty){ renderer.shadowMap.needsUpdate = true; shadowsDirty = false; }
  stepZoom(now); renderer.render(scene, camera);
  if (!el.classList.contains('ready')) setTimeout(() => el.classList.add('ready'), 60);
}
requestAnimationFrame(frame);
// のぞいている／よっている最中は、カメラの位置はそのままで画面の比率だけ合わせる
function refit(){ renderer.setSize(VW(), VH()); if (zoomed && !zoom){ camera.aspect = VW() / VH(); camera.setViewOffset(VW(), VH(), 0, (opts.shiftY || 0) * VH(), VW(), VH()); camera.updateProjectionMatrix(); return; } placeCamera(); if (view) viewApply(); }
addEventListener('resize', refit);
renderer.domElement.addEventListener('webglcontextlost', e => e.preventDefault());
/* 種類 → 3Dの形 */
const TYPE = { ball:(c, map) => () => ball(c, map ? .35 : .25, map ? .3 : .6, map), bell:() => bell, candy:() => candy, star:() => miniStar };
function typeFor(o){ if (o.ball) return () => ball(o.color, o.pat ? .35 : .25, o.pat ? .3 : .6, o.pat ? stripeTex(o.color, o.pat === 'dot' ? '#ffffff' : '#f3ead9', o.pat === 'dot') : null);
  if (o.shape === 'bell') return bell; if (o.shape === 'candy') return candy; if (o.shape === 'star') return miniStar; return () => ball(o.color || '#c8352e'); }
function clearAll(){ usedSlots.clear(); placed.splice(0).forEach(o => tree.remove(o)); gifts.splice(0).forEach(g => { giftRing.remove(g); if (g.userData.blob) giftRing.remove(g.userData.blob); }); }
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
cv.addEventListener('pointerdown', e => { if (view){ viewDown(e); return; } if (zoomed){ if (peek){ cv.setPointerCapture(e.pointerId); if (editOn){ editDown(e); return; }
      // 庭をのぞいている時：長押しで庭の家具をつかむ、ふつうにさわると部屋にもどる
      const pp = peekPress = { x:e.clientX, y:e.clientY, moved:false }, pt = { clientX:e.clientX, clientY:e.clientY }; clearTimeout(lpTimer);
      lpTimer = setTimeout(() => { if (peekPress !== pp || pp.moved || editOn || !opts.onLongPress) return; if (!pickInst(pt)) return; peekPress = null; opts.onLongPress(); if (editOn) editDown(pt); }, 450); return; } opts.onZoomTap && opts.onZoomTap(); return; } if (editOn){ cv.setPointerCapture(e.pointerId); editDown(e); return; } drag = { x:e.clientX, y:e.clientY, last:e.clientX, t:performance.now(), moved:false, onTree:false }; spin = 0; cv.setPointerCapture(e.pointerId);
  // 長押し（指を動かさずに0.45秒）で、その家具をつかんだまま もようがえ に入る
  clearTimeout(lpTimer); const d0 = drag, pt = { clientX:e.clientX, clientY:e.clientY };
  lpTimer = setTimeout(() => { if (drag !== d0 || d0.moved || editOn || zoomed || !opts.onLongPress) return; if (!pickInst(pt)) return; drag = null; opts.onLongPress(); if (!editOn) return; editDown(pt); }, 450); });
let lpTimer = 0, peekPress = null;
cv.addEventListener('pointermove', e => { if (view){ viewMove(e); return; } if (editOn){ editMove(e); return; } if (peekPress && Math.hypot(e.clientX - peekPress.x, e.clientY - peekPress.y) > 9) peekPress.moved = true; if (!drag) return; const dx = e.clientX - drag.last; if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 7) drag.moved = true;
  if (drag.moved){ const now = performance.now(), k = 2 * Math.PI / Math.max(260, cv.clientWidth * .9); tree.rotation.y += dx * k; spin = dx * k / Math.max(8, now - drag.t) * 16; drag.t = now; shadowsDirty = true; } drag.last = e.clientX; });
cv.addEventListener('pointerup', e => { if (view){ viewUp(e); return; } clearTimeout(lpTimer); if (editOn){ editUp(); return; } if (peekPress){ peekPress = null; if (peek) zoomOut(); return; } const d = drag; drag = null; if (d && d.moved){ opts.onSpin && opts.onSpin(); opts.onRot && opts.onRot(tree.rotation.y); return; } if (d) tapAt(e); });
cv.addEventListener('pointercancel', e => { if (view){ vptr.delete(e.pointerId); return; } clearTimeout(lpTimer); peekPress = null; drag = null; if (editOn) editUp(); });
function furnTap(g){ let lamp = null; g.traverse(m => { if (!lamp && m.userData.lamp) lamp = m; });
  if (lamp){ lampOff = !lampOff; lampLight.intensity = lampOn && !lampOff ? (nightNow ? 3.2 : 1.6) : 0; lamp.traverse(m => { if (m.userData.glow) m.visible = !lampOff; if (m.material && m.material.emissive && m.material.userData.em0 == null) m.material.userData.em0 = m.material.emissiveIntensity; if (m.material && m.material.userData.em0 != null) m.material.emissiveIntensity = lampOff ? 0 : m.material.userData.em0; }); shadowsDirty = true; return; } // あかりをつけたり消したり
  let key = null; g.traverse(m => { if (!key && m.userData.key) key = m.userData.key; }); const slot = key && FURN_BY[key] ? FURN_BY[key].slot : '';
  { let f0 = null; g.traverse(m => { if (!f0 && m.userData.onTap) f0 = m.userData.onTap; }); if (f0){ f0(); return; } }
  if (slot === 'fireplace'){ fireBoost = performance.now(); return; } // 火がぼっと大きくなる
  if (['curtain', 'wintop', 'stockings'].includes(slot)){ sway(g, .025, 1400, 'z'); return; } if (['fireplace', 'shelf', 'rug', 'treebase', 'outside', 'mantel', 'sill'].includes(slot)) return;
  let f = null; g.traverse(m => { if (!f && m.userData.onTap) f = m.userData.onTap; }); if (f){ f(); return; }
  const s0 = g.scale.clone(); animate(700, k => { const d = decay(k, 2); g.scale.set(s0.x * (1 + .06 * d), s0.y * (1 - .12 * d), s0.z * (1 + .06 * d)); }); }
function tapAt(e){ const r = renderer.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera);
  const hit = ray.intersectObjects([...placed, ...gifts, ...(advBox.visible ? [advBox] : [])], true)[0];
  // 窓をさわると外をのぞく（ツリーや家具が手前にないとき）
  if (!hit && win.visible && GARDEN()){ const wh = ray.intersectObject(win, true)[0]; if (wh){ const blk = ray.intersectObjects([treeRoot, ...Object.values(inst).filter(o => o.rec.key !== 'tree').map(o => o.g)], true)[0]; if (!blk || blk.distance > wh.distance){ peekWindow(); return; } } }
  // 家具をさわると、ちょっと動く（ツリーより手前にあるときだけ）
  if (!hit){ const fs = [...Object.values(inst).filter(o => o.rec.key !== 'tree').map(o => o.g), ...Object.values(mounted).filter(m => m && m.visible && m.parent !== tree)], fh = ray.intersectObjects(fs, true)[0], th = ray.intersectObject(treeRoot, true)[0];
    if (fh && (!th || fh.distance < th.distance)){ let o = fh.object; while (o.parent && !fs.includes(o)) o = o.parent; furnTap(o); return; } }
  if (hit){ let o = hit.object; while (o && !o.userData.id) o = o.parent; if (o){ if (o.userData.orn) o.userData.swing = performance.now(); else { o.scale.setScalar(.85 * (o.userData.base || 1)); appear.push({ o, t0:performance.now() - 120 }); } opts.onTap && opts.onTap(o.userData.id, !!o.userData.gift); return; } }
  { const r2 = renderer.domElement.getBoundingClientRect(), tc = new THREE.Vector3(); treeRoot.getWorldPosition(tc); let best = null, bd = 30;
    for (const o of placed){ const w = new THREE.Vector3(); o.children[0].getWorldPosition(w); const toCam = camera.position.clone().sub(tc), toO = w.clone().sub(tc); toCam.y = 0; toO.y = 0; if (toCam.dot(toO) < 0) continue;
      const v = w.clone().project(camera), sx = r2.left + (v.x + 1) / 2 * r2.width, sy = r2.top + (1 - v.y) / 2 * r2.height, d = Math.hypot(sx - e.clientX, sy - e.clientY); if (d < bd){ bd = d; best = o; } }
    if (best){ best.userData.swing = performance.now(); opts.onTap && opts.onTap(best.userData.id, false); return; } }
  const th = ray.intersectObjects(tree.children, true)[0]; if (th){ tree.rotation.z = .02; setTimeout(() => tree.rotation.z = -.015, 120); setTimeout(() => tree.rotation.z = 0, 260); opts.onTree && opts.onTree(); } }
function ornScreen(i){ const o = placed[i]; if (!o) return null; const v = new THREE.Vector3(); o.children[0].getWorldPosition(v); v.y -= .1; v.project(camera); const r = renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }
const ornRot = i => placed[i] && [+placed[i].userData.th.toFixed(3), +(placed[i].userData.tilt || 0).toFixed(3)];
/* ある日のツリーを写真にする（週の画面用）。いまのツリーはあとで元にもどす */
let snR = null; const snCam = new THREE.PerspectiveCamera(30, 1, .1, 100);
function snapshot(list, giftList, w = 640, h = 720, ny = nyMode){
  const keepL = lastList, keepG = lastGifts, rot = tree.rotation.y, wasNY = nyMode; setSeason(ny);
  const abv = advBox.visible; advBox.visible = false; clearAll(); sig = ''; tree.rotation.y = 0; list.forEach(o => addOrnament(false, o.id, o.key, o.slot)); giftList.forEach(g => addGift(false, g.id)); placed.forEach(o => { o.rotation.z = o.userData.rz; o.rotation.x = 0; });
  if (!snR){ snR = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true }); snR.setPixelRatio(1); snR.outputColorSpace = THREE.SRGBColorSpace; snR.toneMapping = THREE.NeutralToneMapping; snR.shadowMap.enabled = true; snR.shadowMap.type = THREE.PCFSoftShadowMap; }
  // 部屋ぜんたいを、ふだんと同じ向きから
  snR.setSize(w, h); snCam.fov = camera.fov; snCam.aspect = w / h; const look = new THREE.Vector3(0, 1.35, -.7), dir = new THREE.Vector3(0, .36, 1).normalize();
  const halfW = RW / 2 + .25, dist = halfW / (Math.tan(THREE.MathUtils.degToRad(snCam.fov / 2)) * snCam.aspect);
  snCam.position.copy(look).addScaledVector(dir, dist); snCam.lookAt(look); snCam.updateProjectionMatrix(); scene.updateMatrixWorld(true); snR.render(scene, snCam);
  const url = snR.domElement.toDataURL('image/jpeg', .88);
  advBox.visible = abv; clearAll(); sig = ''; tree.rotation.y = rot; if (wasNY !== nyMode){ lastList = keepL; lastGifts = keepG; setSeason(wasNY); } else sync(keepL, keepG); shadowsDirty = true; return url; }
const _proj = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(camera), r = cv.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; };
const _dbg = () => Object.values(inst).map(o => { const b = instBox(o); return [o.rec.key, ...[b.min.x, b.max.x, b.min.y, b.max.y, b.min.z, b.max.z].map(v => +v.toFixed(2)), boxOK(o)]; });
/* ---------- 年末年始：ツリーのかわりに餅花 ---------- */
function buildMochi(){ if (mochi) return; mochi = makeMochibana(7); const S = 1.6 / tree.scale.x; mochi.group.scale.setScalar(S); mochi.group.visible = false; tree.add(mochi.group);
  // 縁起物をつるす場所：大きな枝は外側の垂れたところ、小枝は先のほう
  MOCHI_SLOTS = []; mochi.branches.forEach((cv, i) => (i % 3 === 0 ? [.45, .6, .74, .88] : [.5, .92]).forEach(t => { const q = cv.getPointAt(t).multiplyScalar(S), rr = Math.hypot(q.x, q.z) || 1; MOCHI_SLOTS.push(q.add(new THREE.Vector3(q.x / rr * .08, -.04, q.z / rr * .08))); }));
  const w = MOCHI_SLOTS.map((p, i) => [p, Math.abs(Math.atan2(p.x, p.z)) + ((i * 7919) % 100) / 45]); w.sort((a, b) => a[1] - b[1]); MOCHI_SLOTS = w.map(a => a[0]); }
function setSeason(ny){ ny = !!ny; if (ny === nyMode) return; nyMode = ny; if (ny) buildMochi();
  firBase.forEach(m => m.visible = !ny); for (const k of TREE_PARTS) if (mounted[k]) mounted[k].visible = !ny; if (mochi) mochi.group.visible = ny;
  slots.length = 0; (ny ? MOCHI_SLOTS : TREE_SLOTS).forEach(p => slots.push(p)); const L = lastList, G = lastGifts; clearAll(); sig = ''; if (L) sync(L, G || []); shadowsDirty = true; }
const _mochi = (n = 14, sc = 1.6) => { const mb = makeMochibana(7); mb.group.scale.setScalar(sc); mb.branches.slice(0, n * 2).forEach((cv, i) => { if (i % 2) return; const o = mb.makers[(i / 2) % mb.makers.length](); o.scale.setScalar(1.25); mb.hang(o, cv.getPointAt(.55 + (i % 5) * .07), .05 + (i % 3) * .025); }); mb.group.traverse(m => { if (m.isMesh) m.castShadow = true; }); tree.visible = false; treeRoot.add(mb.group); shadowsDirty = true; };
return { setView, viewReset, viewing:() => !!view, _view:(y, p, d) => { if (!view) return; view.yaw = y; view.pitch = p; if (d) view.dist = d; viewApply(); }, setSeason, _mochi, thumbGift, giftType:id => GIFT_TYPES[giftSeed(id) % GIFT_TYPES.length], setAdvBox, zoomTo, zoomOut, zoomed:() => zoomed, _dbg, _proj, sync, setRoom, snapshot, setEdit, editRotate, editRemove, autoPlace, peekGarden(){ if (view || !GARDEN()) return; if (zoomed && !peek){ zoomed = false; zoom = null; placeCamera(); } peekWindow(); }, peeking:() => peek, layoutOf, frontSlot:pickSlot, thumbFurn, ornScreen, ornRot, setNight(n){ if (n !== isNight){ isNight = n; applyTime(); } }, pause(p){ stopped = p; }, resize: refit };
}
