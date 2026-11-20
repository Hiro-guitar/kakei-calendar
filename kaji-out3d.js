/* 窓の外：雪の夜の町なみ（家・教会・広場のツリー）と、イブに空を飛ぶサンタのそり */
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness:.85, metalness:0, ...o });
const basic = color => new THREE.MeshBasicMaterial({ color });
function tex(w, h, draw, rep = [1, 1]){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 4; return t; }
const RND = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(1225);
const shade = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); };
function addM(g, geo, mat, x = 0, y = 0, z = 0){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; }

/* ---------- テクスチャ ---------- */
const sidingCache = {};
function siding(color){ if (sidingCache[color]) return sidingCache[color];
  return (sidingCache[color] = tex(256, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16){ g.fillStyle = shade(color, -.08); g.fillRect(0, y + 13, w, 3); g.fillStyle = shade(color, .05); g.fillRect(0, y, w, 2); }
    for (let i = 0; i < 400; i++){ g.fillStyle = `rgba(0,0,0,${RND() * .05})`; g.fillRect(RND() * w, RND() * h, 2 + RND() * 30, 1); } })); }
const brick = tex(256, 256, (g, w, h) => { g.fillStyle = '#c8bcb0'; g.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = -1; c < 9; c++){ const x = c * 32 + (r % 2) * 16, y = r * 16, v = RND() * .12 - .06; g.fillStyle = shade('#a8523e', v); g.fillRect(x + 1, y + 1, 30, 14); } });
const stone = tex(256, 256, (g, w, h) => { g.fillStyle = '#9a9488'; g.fillRect(0, 0, w, h); for (let r = 0; r < 10; r++) for (let c = -1; c < 7; c++){ const x = c * 44 + (r % 2) * 22, y = r * 26, v = RND() * .14 - .07; g.fillStyle = shade('#d8d0c0', v); g.fillRect(x + 2, y + 2, 40, 22); } });
const shingle = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a3a40'; g.fillRect(0, 0, w, h); for (let r = 0; r < 12; r++) for (let c = -1; c < 10; c++){ const x = c * 28 + (r % 2) * 14, y = r * 22; g.fillStyle = shade('#5a4650', RND() * .1 - .05); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 26, y); g.lineTo(x + 26, y + 18); g.quadraticCurveTo(x + 13, y + 24, x, y + 18); g.fill(); } });
// あかりの灯った窓（カーテンのシルエット・十字の桟）
const winTexs = [0, 1, 2].map(k => tex(128, 160, (g, w, h) => { const l = g.createRadialGradient(w * .5, h * .55, 4, w * .5, h * .55, h * .8); l.addColorStop(0, '#fff2c0'); l.addColorStop(.6, '#ffc870'); l.addColorStop(1, '#d88a40'); g.fillStyle = l; g.fillRect(0, 0, w, h);
  g.fillStyle = ['rgba(200,60,50,.55)', 'rgba(90,130,90,.5)', 'rgba(220,170,90,.5)'][k]; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * .3, 0); g.quadraticCurveTo(w * .14, h * .5, w * .22, h); g.lineTo(0, h); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(w * .7, 0); g.quadraticCurveTo(w * .86, h * .5, w * .78, h); g.lineTo(w, h); g.fill();
  if (k === 1){ g.fillStyle = 'rgba(60,90,60,.8)'; g.beginPath(); g.moveTo(w * .5, h * .45); g.lineTo(w * .62, h * .85); g.lineTo(w * .38, h * .85); g.fill(); for (let i = 0; i < 6; i++){ g.fillStyle = ['#ff5a4a', '#ffe060', '#7ad0ff'][i % 3]; g.beginPath(); g.arc(w * (.42 + (i % 3) * .08), h * (.62 + (i / 3 | 0) * .1), 2.5, 0, 7); g.fill(); } }
  if (k === 2){ g.fillStyle = 'rgba(90,60,40,.55)'; g.beginPath(); g.arc(w * .5, h * .7, 14, Math.PI, 0); g.fill(); g.fillRect(w * .5 - 14, h * .7, 28, 30); }
  g.fillStyle = '#f4ece0'; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, h / 2 - 4, w, 8); g.lineWidth = 10; g.strokeStyle = '#f4ece0'; g.strokeRect(0, 0, w, h); }));
const winDayTex = tex(128, 160, (g, w, h) => { const l = g.createLinearGradient(0, 0, w, h); l.addColorStop(0, '#9ab4d8'); l.addColorStop(.5, '#5a6e94'); l.addColorStop(1, '#3a4a6c'); g.fillStyle = l; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(w * .1, 0); g.lineTo(w * .35, 0); g.lineTo(0, h * .4); g.lineTo(0, h * .15); g.fill();
  g.fillStyle = '#f4ece0'; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, h / 2 - 4, w, 8); g.lineWidth = 10; g.strokeStyle = '#f4ece0'; g.strokeRect(0, 0, w, h); });

const M = { snow:std('#f6f8ff', { roughness:.95 }), trim:std('#f4ece0', { roughness:.7 }), dark:std('#3a2a22'), door:[std('#7a2a24', { roughness:.6 }), std('#2a4a3a', { roughness:.6 }), std('#2a3a5a', { roughness:.6 })],
  green:std('#2a6a3a'), red:std('#c8302c', { roughness:.5 }), gold:std('#e8b84a', { roughness:.3, metalness:.6 }), iron:std('#2a2e38', { roughness:.5, metalness:.5 }), ice:new THREE.MeshPhysicalMaterial({ color:'#e8f4ff', roughness:.1, transmission:.4, transparent:true, opacity:.85 }) };

/* ---------- 家 ---------- */
export function buildTown(root, opts = {}){
  const glowTex = opts.glowTex, lit = [], bulbs = [], smokes = [], winMeshes = [];
  const winMatsNight = winTexs.map(t => new THREE.MeshBasicMaterial({ map:t })), winMatDay = new THREE.MeshStandardMaterial({ map:winDayTex, roughness:.2 });
  function windowAt(g, x, y, z, ww, wh, ry = 0, shutters = null){ const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = ry; g.add(w);
    const k = (RND() * 3) | 0, pane = addM(w, new THREE.PlaneGeometry(ww, wh), winMatsNight[k], 0, 0, .012); pane.userData.k = k; winMeshes.push(pane);
    addM(w, new RoundedBoxGeometry(ww + .05, .035, .07, 2, .012), M.trim, 0, wh / 2 + .015, .02); const sill = addM(w, new RoundedBoxGeometry(ww + .08, .03, .08, 2, .01), M.trim, 0, -wh / 2 - .015, .03);
    addM(w, new RoundedBoxGeometry(ww + .07, .025, .07, 2, .01), M.snow, 0, -wh / 2 + .008, .035);
    if (shutters) for (const s of [-1, 1]){ const sh = addM(w, new RoundedBoxGeometry(ww * .42, wh + .02, .02, 1, .006), shutters, s * (ww / 2 + ww * .24), 0, .015); for (let i = 0; i < 5; i++) addM(w, new THREE.BoxGeometry(ww * .36, .006, .025), std(shade('#' + shutters.color.getHexString(), -.08)), s * (ww / 2 + ww * .24), -wh / 2 + (i + .5) * wh / 5, .018); }
    // 部屋からもれる光
    if (glowTex){ const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:'#ffb860', transparent:true, opacity:.35, depthWrite:false, blending:THREE.AdditiveBlending })); gl.scale.set(ww * 3, wh * 2.6, 1); gl.position.z = .05; w.add(gl); lit.push(gl); }
    return w; }
  function wreath(g, x, y, z, r = .06){ const w = new THREE.Group(); w.position.set(x, y, z); g.add(w); for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2, b = addM(w, new THREE.SphereGeometry(r * .32, 6, 5), i % 2 ? M.green : std('#3a7a44'), Math.cos(a) * r, Math.sin(a) * r, 0); b.scale.z = .6; }
    for (let i = 0; i < 4; i++){ const a = i * 1.6 + .4; addM(w, new THREE.SphereGeometry(r * .12, 6, 4), M.red, Math.cos(a) * r, Math.sin(a) * r, r * .15); } addM(w, new THREE.SphereGeometry(r * .22, 8, 6), M.red, 0, -r * .9, .01); return w; }
  function icicles(g, x0, x1, y, z, n){ for (let i = 0; i < n; i++){ const x = x0 + (x1 - x0) * (i + RND() * .6) / n, L = .04 + RND() * .1, c = addM(g, new THREE.ConeGeometry(.012, L, 5), M.ice, x, y - L / 2, z); c.rotation.x = Math.PI; } }
  function eaveLights(g, x0, x1, y, z, warm){ const n = Math.round((x1 - x0) / .07); const cols = warm ? ['#ffd890'] : ['#ff5a4a', '#ffd84a', '#5ad0ff', '#7aff8a', '#ff8ad8'];
    const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length:n + 1 }, (_, i) => new THREE.Vector3(x0 + (x1 - x0) * i / n, y - Math.abs(Math.sin(i / n * Math.PI * 5)) * .03, z))), n * 2, .004, 4), M.dark); g.add(wire);
    for (let i = 0; i < n; i++){ const x = x0 + (x1 - x0) * (i + .5) / n, yy = y - Math.abs(Math.sin((i + .5) / n * Math.PI * 5)) * .03 - .015; const b = addM(g, new THREE.SphereGeometry(.014, 6, 5), basic(cols[i % cols.length]), x, yy, z); bulbs.push(b); } }
  function chimney(g, x, y, z, h){ const c = addM(g, new THREE.BoxGeometry(.16, h, .16), new THREE.MeshStandardMaterial({ map:brick, roughness:.9 }), x, y + h / 2, z); c.castShadow = true;
    addM(g, new RoundedBoxGeometry(.2, .04, .2, 2, .01), std('#6a5a50'), x, y + h, z); addM(g, new THREE.SphereGeometry(.1, 10, 6), M.snow, x, y + h + .025, z).scale.set(1, .35, 1); smokes.push(new THREE.Vector3(x, y + h + .08, z)); }
  // 切妻屋根（下に屋根板、上に厚い雪、軒につらら）
  function gableRoof(g, w, d, y, pitch, over = .1){ const rise = Math.tan(pitch) * (w / 2), L = (w / 2 + over) / Math.cos(pitch);
    for (const s of [-1, 1]){ const p = new THREE.Group(); p.position.set(0, y + rise, 0); p.rotation.z = s > 0 ? -pitch : pitch; g.add(p);
      const pl = addM(p, new THREE.BoxGeometry(L, .04, d + over * 2), new THREE.MeshStandardMaterial({ map:shingle, roughness:.8 }), s * L / 2, 0, 0); pl.castShadow = true;
      const sn = addM(p, new RoundedBoxGeometry(L + .03, .08, d + over * 2 + .04, 3, .035), M.snow, s * L / 2, .055, 0); sn.castShadow = true; }
    const tri = new THREE.Shape(); tri.moveTo(-w / 2, 0); tri.lineTo(0, rise); tri.lineTo(w / 2, 0); tri.closePath(); return { rise, tri }; }
  function house(x, z, o){ const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = o.ry || 0; root.add(g); const { w, d, h } = o, col = o.col;
    const wall = new THREE.MeshStandardMaterial({ map:siding(col).clone(), roughness:.85 }); wall.map.needsUpdate = true; wall.map.repeat.set(w * 2.2, h * 2.2);
    const body = addM(g, new THREE.BoxGeometry(w, h, d), wall, 0, h / 2, 0); body.castShadow = body.receiveShadow = true;
    addM(g, new THREE.BoxGeometry(w + .04, .08, d + .04), new THREE.MeshStandardMaterial({ map:stone }), 0, .04, 0);
    // 角の柱
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) addM(g, new THREE.BoxGeometry(.035, h, .035), M.trim, sx * w / 2, h / 2, sz * d / 2);
    const { rise, tri } = gableRoof(g, w, d, h, o.pitch || .62);
    for (const sz of [-1, 1]){ const gw = new THREE.Mesh(new THREE.ShapeGeometry(tri), wall); gw.position.set(0, h, sz * d / 2 + sz * .001); if (sz < 0) gw.rotation.y = Math.PI; g.add(gw); }
    // 正面の妻に丸窓
    if (o.round){ const rw = addM(g, new THREE.CircleGeometry(.07, 20), winMatsNight[0], 0, h + rise * .42, d / 2 + .01); winMeshes.push(rw); rw.userData.k = 0; addM(g, new THREE.TorusGeometry(.075, .012, 6, 20), M.trim, 0, h + rise * .42, d / 2 + .012); }
    icicles(g, -w / 2 - .08, w / 2 + .08, h + .01, d / 2 + .1, Math.round(w * 14));
    // 窓とドア（階ごと）
    const st = o.stories || 1, fh = h / st, nW = Math.max(2, Math.round(w / .34)), shut = o.shut ? std(o.shut, { roughness:.6 }) : null, di = o.door != null ? o.door : 1;
    for (let s = 0; s < st; s++) for (let i = 0; i < nW; i++){ if (s === 0 && i === di) continue; windowAt(g, -w / 2 + (i + .5) * w / nW, fh * s + fh * .56, d / 2, .13, .17, 0, shut); }
    { const dx = -w / 2 + (di + .5) * w / nW, dg = new THREE.Group(); dg.position.set(dx, 0, d / 2); g.add(dg);
      addM(dg, new RoundedBoxGeometry(.18, .32, .04, 2, .01), M.trim, 0, .16 + .04, .005); addM(dg, new RoundedBoxGeometry(.14, .28, .03, 2, .01), M.door[(RND() * 3) | 0], 0, .16 + .04, .02);
      addM(dg, new THREE.SphereGeometry(.008, 6, 4), M.gold, .045, .17, .04); wreath(dg, 0, .27, .04, .035);
      const lamp = addM(dg, new THREE.SphereGeometry(.018, 8, 6), basic('#ffe0a0'), .12, .3, .03); lit.push(lamp);
      for (let k = 0; k < 2; k++){ addM(dg, new RoundedBoxGeometry(.26 - k * .04, .03, .08 - k * .025, 2, .008), new THREE.MeshStandardMaterial({ map:stone }), 0, .015 + k * .03, .05 - k * .012); addM(dg, new RoundedBoxGeometry(.25 - k * .04, .015, .07 - k * .025, 2, .006), M.snow, 0, .033 + k * .03, .05 - k * .012); } }
    // 雪の吹きだまり
    for (let i = 0; i < 5; i++){ const m = addM(g, new THREE.SphereGeometry(.12 + RND() * .1, 12, 8), M.snow, -w / 2 + RND() * w, .02, d / 2 + .06 + RND() * .08); m.scale.set(1.4, .35, .8); }
    if (o.chimney !== false) chimney(g, w * .26, h + rise * .45, -d * .12, rise * .7);
    if (o.lights) eaveLights(g, -w / 2 - .06, w / 2 + .06, h - .02, d / 2 + .11, o.lights === 'warm');
    return g; }
  function church(x, z, ry){ const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); const w = .9, d = 1.4, h = .85, ws = new THREE.MeshStandardMaterial({ map:stone, roughness:.9 }); ws.map = stone.clone(); ws.map.needsUpdate = true; ws.map.repeat.set(2, 2);
    addM(g, new THREE.BoxGeometry(w, h, d), ws, 0, h / 2, 0).castShadow = true; const { rise, tri } = gableRoof(g, w, d, h, .8);
    for (const sz of [-1, 1]){ const gw = new THREE.Mesh(new THREE.ShapeGeometry(tri), ws); gw.position.set(0, h, sz * d / 2 + sz * .001); if (sz < 0) gw.rotation.y = Math.PI; g.add(gw); }
    // 塔と尖塔
    const tw = .36, th = 1.5, tz = d / 2 - .1; addM(g, new THREE.BoxGeometry(tw, th, tw), ws, 0, th / 2, tz).castShadow = true;
    const spire = addM(g, new THREE.ConeGeometry(tw * .78, .9, 4), new THREE.MeshStandardMaterial({ map:shingle }), 0, th + .45, tz); spire.rotation.y = Math.PI / 4;
    addM(g, new THREE.ConeGeometry(tw * .5, .3, 4), M.snow, 0, th + .2, tz).rotation.y = Math.PI / 4;
    addM(g, new THREE.BoxGeometry(.02, .18, .02), M.gold, 0, th + .99, tz); addM(g, new THREE.BoxGeometry(.1, .02, .02), M.gold, 0, th + 1.02, tz);
    const bell = addM(g, new THREE.CircleGeometry(.08, 20), winMatsNight[2], 0, th - .25, tz + tw / 2 + .005); winMeshes.push(bell); bell.userData.k = 2; addM(g, new THREE.TorusGeometry(.085, .015, 6, 20), M.trim, 0, th - .25, tz + tw / 2 + .007);
    // アーチ窓（ステンドグラス風）
    const sg = tex(64, 128, (c, W, H) => { const cols = ['#ff7a5a', '#ffd860', '#6ab8ff', '#8ae07a', '#d880ff']; for (let i = 0; i < 40; i++){ c.fillStyle = cols[i % 5]; c.fillRect((i % 4) * 16, ((i / 4) | 0) * 13, 16, 13); } c.strokeStyle = '#2a2a2a'; c.lineWidth = 2; for (let x = 0; x <= W; x += 16){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } });
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++){ const a = addM(g, new THREE.PlaneGeometry(.12, .3), new THREE.MeshBasicMaterial({ map:sg }), sx * (w / 2 + .005), .48, -d / 2 + .35 + i * .35); a.rotation.y = sx * Math.PI / 2; lit.push(a); }
    const door = addM(g, new RoundedBoxGeometry(.2, .36, .04, 2, .02), M.door[0], 0, .18, tz + tw / 2 + .01); wreath(g, 0, .42, tz + tw / 2 + .04, .05);
    icicles(g, -w / 2 - .1, w / 2 + .1, h + .01, d / 2 + .12, 14); return g; }
  // 広場の大きなツリー
  function townTree(x, z, H){ const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); const pm = std('#1f4a38', { roughness:.9 });
    for (let k = 0; k < 7; k++){ const f = k / 7, r = H * (.36 - f * .27), hh = H * .26, c = addM(g, new THREE.ConeGeometry(r, hh, 16), pm, 0, H * (.16 + f * .7), 0); c.castShadow = true; addM(g, new THREE.ConeGeometry(r * .55, hh * .2, 16), M.snow, 0, H * (.16 + f * .7) + hh * .35, 0); }
    addM(g, new THREE.CylinderGeometry(H * .04, H * .05, H * .14, 8), std('#5a3a28'), 0, H * .07, 0);
    const cols = ['#ff5a4a', '#ffd84a', '#5ad0ff', '#ffffff', '#ff8ad8']; for (let i = 0; i < 90; i++){ const t = i / 90, a = t * 40, y = H * (.12 + t * .78), r = H * (.36 - t * .3) * .96; bulbs.push(addM(g, new THREE.SphereGeometry(.018, 6, 4), basic(cols[i % 5]), Math.cos(a) * r, y, Math.sin(a) * r)); }
    const star = new THREE.Shape(); for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? .05 : .12; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const sm = addM(g, new THREE.ExtrudeGeometry(star, { depth:.03, bevelEnabled:false }), new THREE.MeshBasicMaterial({ color:'#ffe070' }), 0, H * .98, 0); lit.push(sm);
    if (glowTex){ const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:'#ffd870', transparent:true, opacity:.7, depthWrite:false, blending:THREE.AdditiveBlending })); gl.scale.setScalar(.7); gl.position.y = H * .99; g.add(gl); lit.push(gl); }
    // 足もとのプレゼント
    for (let i = 0; i < 5; i++){ const a = i * 1.3, b = addM(g, new RoundedBoxGeometry(.1, .08, .1, 2, .01), std(['#c8302c', '#2a6a9a', '#e8b84a', '#3a8a5a', '#a84ab0'][i]), Math.cos(a) * H * .3, .04, Math.sin(a) * H * .3); b.rotation.y = a; } }
  // 街灯（リースつき）
  function streetLamp(x, z){ const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); addM(g, new THREE.CylinderGeometry(.025, .04, 1.3, 10), M.iron, 0, .65, 0); addM(g, new THREE.CylinderGeometry(.06, .08, .1, 10), M.iron, 0, .05, 0);
    addM(g, new THREE.CylinderGeometry(.08, .05, .16, 6, 1, true), M.iron, 0, 1.38, 0); addM(g, new THREE.ConeGeometry(.11, .09, 6), M.iron, 0, 1.5, 0); addM(g, new THREE.ConeGeometry(.09, .05, 12), M.snow, 0, 1.55, 0);
    const b = addM(g, new THREE.SphereGeometry(.045, 10, 8), basic('#ffe2a8'), 0, 1.38, 0); lit.push(b); wreath(g, 0, 1.05, .04, .06);
    if (glowTex){ const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:'#ffc888', transparent:true, opacity:.75, depthWrite:false, blending:THREE.AdditiveBlending })); gl.scale.setScalar(.8); gl.position.y = 1.38; g.add(gl); lit.push(gl); }
    const pl = new THREE.PointLight('#ffc888', 1.4, 2.2, 1.6); pl.position.y = 1.36; g.add(pl); lit.push(pl); }

  // 配置（左右に家なみ、奥に教会と広場のツリー）
  const y0 = opts.y || 0, cx = opts.x || 0, cz = opts.z || 0; root.position.set(cx, y0, cz);
  house(-2.3, -1.2, { w:.95, d:.75, h:.62, col:'#c86a52', ry:.35, shut:'#2a4a3a', lights:'multi', door:1 });
  house(-1.15, -2.3, { w:.8, d:.7, h:1.0, stories:2, col:'#e8dcc0', ry:.18, shut:'#7a2a24', round:1, lights:'warm', door:0 });
  house(1.25, -2.1, { w:1.05, d:.75, h:.95, stories:2, col:'#7a8aa8', ry:-.2, lights:'multi', door:2 });
  house(2.5, -1.0, { w:.8, d:.7, h:.6, col:'#a8c0a0', ry:-.45, shut:'#e8dcc0', lights:'warm', door:0 });
  house(-3.4, -3.0, { w:.9, d:.7, h:.95, stories:2, col:'#d8b86a', ry:.5, lights:'warm' });
  house(3.5, -3.2, { w:.95, d:.7, h:.62, col:'#c86a52', ry:-.5, shut:'#2a3a5a', lights:'multi' });
  church(.15, -4.4, 0);
  townTree(-.55, -2.9, 1.7);
  streetLamp(-.45, -.6); streetLamp(1.0, -1.1);
  return { lit, bulbs, smokes, winMeshes, setNight(n){ for (const m of winMeshes) m.material = n ? winMatsNight[m.userData.k || 0] : winMatDay; for (const o of lit) o.visible = n; } };
}

/* ---------- サンタのそりとトナカイ ---------- */
export function buildSleigh(){
  const root = new THREE.Group(), legs = [], deer = [];
  const red = std('#c8202a', { roughness:.45 }), redD = std('#8a1a20', { roughness:.5 }), gold = std('#e8b84a', { roughness:.25, metalness:.75 }), fur = std('#fbf8f2', { roughness:1 }), skin = std('#ffd2b8', { roughness:.7 }),
    black = std('#1e1a1a', { roughness:.4 }), brown = std('#8a5a32', { roughness:.8 }), brownL = std('#c8a070', { roughness:.85 }), antlerM = std('#e8d8b8', { roughness:.7 }), hoof = std('#3a2a22'), boot = std('#1a1616', { roughness:.35 });
  // そり本体：前がくるっと巻いた側板
  const side = new THREE.Shape(); side.moveTo(-.34, .02); side.lineTo(.18, .02); side.bezierCurveTo(.34, .02, .4, .14, .38, .26); side.bezierCurveTo(.36, .36, .26, .38, .24, .3); side.bezierCurveTo(.22, .24, .3, .22, .3, .28);
  side.bezierCurveTo(.3, .2, .2, .2, .14, .24); side.lineTo(-.18, .24); side.lineTo(-.24, .42); side.bezierCurveTo(-.26, .48, -.36, .48, -.38, .42); side.lineTo(-.36, .1); side.closePath();
  const sg = new THREE.ExtrudeGeometry(side, { depth:.04, bevelEnabled:true, bevelSize:.01, bevelThickness:.01, bevelSegments:2, curveSegments:24 });
  for (const z of [-.16, .12]) addM(root, sg, red, 0, 0, z);
  addM(root, new RoundedBoxGeometry(.56, .04, .32, 2, .015), redD, -.06, .06, 0); addM(root, new RoundedBoxGeometry(.06, .3, .3, 2, .02), redD, -.34, .25, 0);
  addM(root, new RoundedBoxGeometry(.2, .05, .28, 2, .02), std('#6a2a2a', { roughness:.9 }), -.2, .14, 0); // 座席
  // 金のふち飾り
  const trimC = new THREE.CatmullRomCurve3([[-.36, .4], [-.24, .4], [-.18, .22], [.14, .22], [.3, .25], [.36, .3]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  for (const z of [-.165, .165]){ const t = addM(root, new THREE.TubeGeometry(trimC, 40, .008, 6), gold); t.position.z = z; }
  // ランナー（前がくるりと巻く）
  const runC = new THREE.CatmullRomCurve3([[-.42, -.02], [.1, -.04], [.32, -.02], [.44, .08], [.42, .18], [.34, .18], [.34, .1], [.4, .1]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  for (const z of [-.15, .15]){ const r = addM(root, new THREE.TubeGeometry(runC, 60, .013, 8), gold); r.position.z = z; for (const x of [-.24, .12]) addM(root, new THREE.CylinderGeometry(.008, .008, .08, 6), gold, x, .02, z); }
  // プレゼントの袋とはみ出す箱
  const sack = addM(root, new THREE.SphereGeometry(.15, 16, 12), brownL, -.28, .38, 0); sack.scale.set(.9, 1.15, 1); addM(root, new THREE.TorusGeometry(.05, .012, 6, 14), gold, -.28, .53, 0).rotation.x = Math.PI / 2;
  for (const [x, y, z, c, s] of [[-.22, .55, .06, '#2a8a5a', .08], [-.33, .58, -.05, '#3a6ac8', .07], [-.27, .6, .02, '#e8b84a', .06]]){ const b = addM(root, new RoundedBoxGeometry(s, s, s, 2, .008), std(c, { roughness:.5 }), x, y, z); b.rotation.set(.3, .5, .2); addM(b, new THREE.BoxGeometry(s * 1.02, s * .2, s * 1.02), std('#ffffff'), 0, 0, 0); addM(b, new THREE.BoxGeometry(s * .2, s * 1.02, s * 1.02), std('#ffffff'), 0, 0, 0); }
  // サンタ
  const santa = new THREE.Group(); santa.position.set(-.04, .16, 0); root.add(santa);
  const body = addM(santa, new THREE.SphereGeometry(.13, 20, 16), red, 0, .14, 0); body.scale.set(1, 1.1, 1.05);
  addM(santa, new THREE.TorusGeometry(.12, .03, 8, 24), fur, 0, .05, 0).rotation.x = Math.PI / 2;
  const belt = addM(santa, new THREE.TorusGeometry(.128, .016, 6, 24), black, 0, .12, 0); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 1.05, 1);
  addM(santa, new RoundedBoxGeometry(.045, .04, .02, 2, .006), gold, .13, .12, 0).rotation.y = Math.PI / 2;
  addM(santa, new THREE.CylinderGeometry(.018, .018, .2, 6), fur, .12, .18, 0).rotation.z = .1; // 前あわせの毛皮
  for (const z of [-.06, .06]){ const leg = addM(santa, new THREE.CylinderGeometry(.04, .04, .16, 10), red, .1, .04, z); leg.rotation.z = Math.PI / 2; const bt = addM(santa, new RoundedBoxGeometry(.09, .06, .06, 2, .02), boot, .2, .0, z); }
  for (const z of [-1, 1]){ const arm = addM(santa, new THREE.CylinderGeometry(.032, .028, .15, 10), red, .1, .2, z * .1); arm.rotation.set(z * .35, 0, -1.1); addM(santa, new THREE.TorusGeometry(.03, .012, 6, 12), fur, .16, .17, z * .12).rotation.y = Math.PI / 2; addM(santa, new THREE.SphereGeometry(.03, 10, 8), black, .19, .16, z * .12); }
  const head = new THREE.Group(); head.position.set(.02, .32, 0); santa.add(head);
  addM(head, new THREE.SphereGeometry(.075, 20, 16), skin);
  for (const z of [-1, 1]){ addM(head, new THREE.SphereGeometry(.009, 8, 6), black, .07, .015, z * .026); addM(head, new THREE.SphereGeometry(.018, 8, 6), std('#ff9a9a', { roughness:1 }), .06, -.008, z * .04).scale.set(.5, .7, 1); const br = addM(head, new THREE.CapsuleGeometry(.008, .025, 4, 6), fur, .068, .04, z * .026); br.rotation.x = Math.PI / 2; }
  addM(head, new THREE.SphereGeometry(.016, 10, 8), std('#ffb0a0', { roughness:.6 }), .078, -.002, 0);
  const beard = addM(head, new THREE.SphereGeometry(.075, 16, 12), fur, .03, -.06, 0); beard.scale.set(.85, 1.1, 1.05);
  for (const z of [-1, 1]){ const mu = addM(head, new THREE.SphereGeometry(.028, 10, 8), fur, .074, -.022, z * .022); mu.scale.set(.6, .55, 1.2); mu.rotation.x = z * .4; }
  addM(head, new THREE.TorusGeometry(.072, .022, 8, 24), fur, 0, .045, 0).rotation.x = Math.PI / 2;
  // ぐにゃっと曲がった帽子
  const hatC = new THREE.CatmullRomCurve3([[0, .05, 0], [-.01, .12, 0], [-.05, .17, 0], [-.11, .17, 0], [-.14, .13, 0]].map(a => new THREE.Vector3(...a)));
  const hat = new THREE.Mesh(new THREE.TubeGeometry(hatC, 24, .06, 14), red); head.add(hat); { const P = hat.geometry.attributes.position, n = 25, rs = 15; for (let i = 0; i < P.count; i++){ const seg = Math.floor(i / rs), t = seg / (n - 1), sc = 1 - t * .82, c = hatC.getPoint(t); P.setXYZ(i, c.x + (P.getX(i) - c.x) * sc, c.y + (P.getY(i) - c.y) * sc, c.z + (P.getZ(i) - c.z) * sc); } hat.geometry.computeVertexNormals(); }
  addM(head, new THREE.SphereGeometry(.026, 10, 8), fur, -.145, .12, 0);
  // トナカイ（2列×2頭）
  function reindeer(nose){ const g = new THREE.Group(), L = [];
    const b = addM(g, new THREE.CapsuleGeometry(.07, .2, 6, 12), brown); b.rotation.z = Math.PI / 2; const belly = addM(g, new THREE.CapsuleGeometry(.055, .16, 4, 10), brownL, 0, -.03, 0); belly.rotation.z = Math.PI / 2;
    const neck = addM(g, new THREE.CapsuleGeometry(.04, .12, 4, 10), brown, .15, .08, 0); neck.rotation.z = -.8;
    const hd = new THREE.Group(); hd.position.set(.22, .17, 0); g.add(hd); addM(hd, new THREE.SphereGeometry(.05, 14, 10), brown).scale.set(1.15, .9, .85);
    const sn = addM(hd, new THREE.CapsuleGeometry(.03, .04, 4, 8), brownL, .055, -.02, 0); sn.rotation.z = Math.PI / 2;
    addM(hd, new THREE.SphereGeometry(.018, 10, 8), nose ? new THREE.MeshStandardMaterial({ color:'#ff3a2a', emissive:'#ff2a1a', emissiveIntensity:1.2 }) : black, .1, -.015, 0);
    for (const z of [-1, 1]){ addM(hd, new THREE.SphereGeometry(.008, 6, 4), black, .03, .02, z * .035); const ear = addM(hd, new THREE.ConeGeometry(.015, .05, 6), brown, -.01, .045, z * .045); ear.rotation.x = z * -.9;
      // 角（枝分かれ）
      const main = new THREE.CatmullRomCurve3([[-.01, .04, z * .02], [-.02, .1, z * .05], [-.05, .15, z * .06], [-.09, .18, z * .05]].map(a => new THREE.Vector3(...a)));
      hd.add(new THREE.Mesh(new THREE.TubeGeometry(main, 12, .007, 5), antlerM));
      for (const [t, dx, dy] of [[.4, .03, .04], [.7, .02, .05]]){ const p = main.getPoint(t); hd.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p, p.clone().add(new THREE.Vector3(dx, dy * .6, 0)), p.clone().add(new THREE.Vector3(dx * 1.2, dy, z * .005))]), 6, .005, 4), antlerM)); } }
    // 首輪と鈴
    const col = addM(g, new THREE.TorusGeometry(.045, .012, 6, 16), std('#b0202a', { roughness:.5 }), .15, .07, 0); col.rotation.set(0, Math.PI / 2, .8);
    for (const z of [-.04, 0, .04]) addM(g, new THREE.SphereGeometry(.013, 8, 6), gold, .17, .03, z);
    const strap = addM(g, new THREE.TorusGeometry(.075, .01, 6, 20), std('#b0202a'), 0, 0, 0); strap.rotation.y = Math.PI / 2;
    addM(g, new THREE.SphereGeometry(.03, 8, 6), fur, -.17, .04, 0);
    // 脚（前後・左右）
    for (const [x, z, ph] of [[.1, -.04, 0], [.1, .04, .5], [-.1, -.04, .25], [-.1, .04, .75]]){ const lg = new THREE.Group(); lg.position.set(x, -.04, z); g.add(lg); const u = addM(lg, new THREE.CapsuleGeometry(.018, .08, 4, 8), brown, 0, -.05, 0);
      const lo = new THREE.Group(); lo.position.y = -.1; lg.add(lo); addM(lo, new THREE.CapsuleGeometry(.013, .07, 4, 8), brown, 0, -.04, 0); addM(lo, new THREE.CylinderGeometry(.016, .018, .02, 8), hoof, 0, -.085, 0);
      L.push({ lg, lo, ph, front:x > 0 }); }
    g.userData.legs = L; return g; }
  let k = 0; for (const [x, z] of [[.85, -.09], [.85, .09], [1.35, -.09], [1.35, .09]]){ const r = reindeer(k === 2); r.position.set(x, .2, z); r.userData.ph = k * .17; root.add(r); deer.push(r); k++; }
  // 引き綱
  for (const z of [-.09, .09]){ const c = new THREE.CatmullRomCurve3([new THREE.Vector3(.1, .34, z * .6), new THREE.Vector3(.5, .3, z), new THREE.Vector3(.9, .26, z), new THREE.Vector3(1.35, .26, z)]); root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, .004, 4), std('#6a3a1a'))); }
  root.traverse(o => { if (o.isMesh) o.castShadow = false; });
  function animate(now){ const t = now / 1000; for (const d of deer){ d.position.y = .2 + Math.sin(t * 7 + d.userData.ph * 6) * .025; d.rotation.z = Math.sin(t * 7 + d.userData.ph * 6) * .05;
      for (const l of d.userData.legs){ const a = Math.sin(t * 7 + (l.ph + d.userData.ph) * Math.PI * 2); l.lg.rotation.z = (l.front ? .5 : -.5) + a * .5; l.lo.rotation.z = (l.front ? -.9 : .6) + Math.max(0, a) * .5; } }
    santa.rotation.z = Math.sin(t * 3.5) * .03; }
  return { root, animate };
}
