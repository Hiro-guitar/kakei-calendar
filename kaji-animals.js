/* 庭にやってくる動物（なめらかな皮膚＋骨格＋毛並み）
   体は「やわらかく溶け合う形（距離関数）」を組み合わせて1枚の皮膚にし、骨を入れて関節ごと曲がるようにする。
   毛は表面を少しずつ外へずらした層を重ねて描く（毛の根元から先へ、まばらになっていく） */
import * as THREE from 'three';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25; };
// 太さが変わる筒（根元 r1 → 先 r2）
function sdCone(p, a, b, r1, r2){ const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2], pax = p[0] - a[0], pay = p[1] - a[1], paz = p[2] - a[2];
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz))); const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h; return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r1 + (r2 - r1) * h); }
// 胴〜首をひとつながりの筒で（断面は楕円、太さは少しずつ変わる）。節ができないよう、細かく区切った中心線に沿って測る
function makeTube(ctrl){ const C = new THREE.CatmullRomCurve3(ctrl.map(c => V3(c[4] || 0, c[1], c[0]))), R = new THREE.CatmullRomCurve3(ctrl.map(c => V3(c[2], c[3], 0))), N = (ctrl.length - 1) * 8, pts = [];
  for (let i = 0; i <= N; i++){ const t = i / N, p = C.getPoint(t), r = R.getPoint(t), seg = Math.min(ctrl.length - 2, Math.floor(t * (ctrl.length - 1))), f = t * (ctrl.length - 1) - seg; pts.push({ x:p.x, y:p.y, z:p.z, rx:r.x, ry:r.y, b0:ctrl[seg][5], b1:ctrl[seg + 1][5], f, tag:(f < .5 ? ctrl[seg] : ctrl[seg + 1])[6] }); } return pts; }
function tubeHit(p, T){ let best = 1e9, bi = 0, bh = 0;
  for (let i = 0; i < T.length - 1; i++){ const a = T[i], b = T[i + 1], bx = b.x - a.x, by = b.y - a.y, bz = b.z - a.z, L2 = bx * bx + by * by + bz * bz, h = Math.max(0, Math.min(1, ((p[0] - a.x) * bx + (p[1] - a.y) * by + (p[2] - a.z) * bz) / L2));
    const cx = a.x + bx * h, cy = a.y + by * h, cz = a.z + bz * h, rx = a.rx + (b.rx - a.rx) * h, ry = a.ry + (b.ry - a.ry) * h, L = Math.sqrt(L2), tx = bx / L, ty = by / L, tz = bz / L;
    let dx = p[0] - cx, dy = p[1] - cy, dz = p[2] - cz; const al = dx * tx + dy * ty + dz * tz; // 横（x）と、進む向きに直交する上向き成分に分ける
    const ux = -ty * tx, uy = 1 - ty * ty, uz = -ty * tz, uL = Math.hypot(ux, uy, uz) || 1, up = (dx * ux + dy * uy + dz * uz) / uL, side = dx, along = al;
    const e = Math.sqrt((side / rx) ** 2 + (up / ry) ** 2 + (along / Math.min(rx, ry)) ** 2 * (h > 0 && h < 1 ? 0 : 1)), d = (e - 1) * Math.min(rx, ry);
    if (d < best){ best = d; bi = i; bh = h; } } return [best, bi, bh]; }
function sdEll(p, c, r){ const x = (p[0] - c[0]) / r[0], y = (p[1] - c[1]) / r[1], z = (p[2] - c[2]) / r[2], k0 = Math.sqrt(x * x + y * y + z * z), x1 = x / r[0], y1 = y / r[1], z1 = z / r[2], k1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1); return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -Math.min(...r); }

/* ===== 形（プリミティブの集まり）から、皮膚・骨・重みを作る ===== */
function buildSkin(spec){
  const P = spec.prims, K = spec.k, n = P.length;
  const dist = (p, i) => { const q = P[i]; return q.t === 'c' ? sdCone(p, q.a, q.b, q.r1, q.r2) : q.t === 'u' ? tubeHit(p, q.T)[0] : sdEll(p, q.c, q.r); };
  const sdf = p => { let d = 1e9; for (let i = 0; i < n; i++){ const di = dist(p, i); d = smin(d, di, P[i].k ?? K); } return d; };
  // 範囲
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; const grow = (pt, r) => { for (let j = 0; j < 3; j++){ mn[j] = Math.min(mn[j], pt[j] - r); mx[j] = Math.max(mx[j], pt[j] + r); } };
  for (const q of P){ if (q.t === 'c'){ grow(q.a, q.r1); grow(q.b, q.r2); } else if (q.t === 'u'){ for (const t of q.T) grow([t.x, t.y, t.z], Math.max(t.rx, t.ry)); } else grow(q.c, Math.max(...q.r)); }
  const pad = K + .01; mn = mn.map(v => v - pad); mx = mx.map(v => v + pad); const ext = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]), h = ext / (spec.res || 72);
  const NX = Math.ceil((mx[0] - mn[0]) / h) + 1, NY = Math.ceil((mx[1] - mn[1]) / h) + 1, NZ = Math.ceil((mx[2] - mn[2]) / h) + 1, F = new Float32Array(NX * NY * NZ), id = (i, j, k) => i + NX * (j + NY * k);
  for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) F[id(i, j, k)] = sdf([mn[0] + i * h, mn[1] + j * h, mn[2] + k * h]);
  // なめらかな面を取り出す（各セルに頂点を1つ、符号がかわる辺ごとに四角形）
  const cellV = new Int32Array(NX * NY * NZ).fill(-1), pos = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]], C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  for (let k = 0; k < NZ - 1; k++) for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++){ const v = C.map(([a, b, c]) => F[id(i + a, j + b, k + c)]); let neg = 0; for (const x of v) if (x < 0) neg++; if (!neg || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, c = 0; for (const [a, b] of E){ if ((v[a] < 0) === (v[b] < 0)) continue; const t = v[a] / (v[a] - v[b]); sx += C[a][0] + (C[b][0] - C[a][0]) * t; sy += C[a][1] + (C[b][1] - C[a][1]) * t; sz += C[a][2] + (C[b][2] - C[a][2]) * t; c++; }
    cellV[id(i, j, k)] = pos.length / 3; pos.push(mn[0] + (i + sx / c) * h, mn[1] + (j + sy / c) * h, mn[2] + (k + sz / c) * h); }
  const idx = [], quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; flip ? idx.push(a, c, b, a, d, c) : idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < NZ - 1; k++) for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++){ const f0 = F[id(i, j, k)] < 0;
    if (i < NX - 1 && f0 !== (F[id(i + 1, j, k)] < 0)) quad(cellV[id(i, j - 1, k - 1)], cellV[id(i, j, k - 1)], cellV[id(i, j, k)], cellV[id(i, j - 1, k)], !f0);
    if (j < NY - 1 && f0 !== (F[id(i, j + 1, k)] < 0)) quad(cellV[id(i - 1, j, k - 1)], cellV[id(i - 1, j, k)], cellV[id(i, j, k)], cellV[id(i, j, k - 1)], !f0);
    if (k < NZ - 1 && f0 !== (F[id(i, j, k + 1)] < 0)) quad(cellV[id(i - 1, j - 1, k)], cellV[id(i, j - 1, k)], cellV[id(i, j, k)], cellV[id(i - 1, j, k)], !f0); }
  // 面をすこしなでて、段差をならす → 距離関数で表面に戻す
  const nv = pos.length / 3, nb = Array.from({ length:nv }, () => new Set()); for (let t = 0; t < idx.length; t += 3){ const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  for (let it = 0; it < 2; it++){ const np = pos.slice(); for (let v = 0; v < nv; v++){ if (!nb[v].size) continue; let x = 0, y = 0, z = 0; for (const u of nb[v]){ x += pos[u * 3]; y += pos[u * 3 + 1]; z += pos[u * 3 + 2]; } const s = nb[v].size; np[v * 3] = pos[v * 3] * .5 + x / s * .5; np[v * 3 + 1] = pos[v * 3 + 1] * .5 + y / s * .5; np[v * 3 + 2] = pos[v * 3 + 2] * .5 + z / s * .5; } for (let i = 0; i < np.length; i++) pos[i] = np[i]; }
  const nrm = new Float32Array(nv * 3), e = h * .5;
  for (let v = 0; v < nv; v++){ let p = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
    for (let r = 0; r < 2; r++){ const d = sdf(p), gx = sdf([p[0] + e, p[1], p[2]]) - sdf([p[0] - e, p[1], p[2]]), gy = sdf([p[0], p[1] + e, p[2]]) - sdf([p[0], p[1] - e, p[2]]), gz = sdf([p[0], p[1], p[2] + e]) - sdf([p[0], p[1], p[2] - e]), L = Math.hypot(gx, gy, gz) || 1;
      if (r === 0){ p = [p[0] - gx / L * d, p[1] - gy / L * d, p[2] - gz / L * d]; } else { nrm[v * 3] = gx / L; nrm[v * 3 + 1] = gy / L; nrm[v * 3 + 2] = gz / L; } }
    pos[v * 3] = p[0]; pos[v * 3 + 1] = p[1]; pos[v * 3 + 2] = p[2]; }
  // 骨の重み・部位・色
  const bones = spec.bones, bi = Object.fromEntries(bones.map((b, i) => [b.name, i])), sk = new Uint16Array(nv * 4), sw = new Float32Array(nv * 4), col = new Float32Array(nv * 3), c3 = new THREE.Color(), sig = spec.sig || K * .45;
  for (let v = 0; v < nv; v++){ const p = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]], ds = []; let dm = 1e9, best = 0; for (let i = 0; i < n; i++){ const d = dist(p, i); ds.push(d); if (d < dm){ dm = d; best = i; } }
    const acc = new Map(); let tubeTag = ''; for (let i = 0; i < n; i++){ const w = Math.exp(-(ds[i] - dm) / sig); if (w < .002) continue;
      if (P[i].t === 'u'){ const [, si, sh] = tubeHit(p, P[i].T), a = P[i].T[si], b = P[i].T[si + 1], f = a.f + (b.f - a.f) * sh, f2 = b.f < a.f ? 1 : f; const k0 = bi[a.b0], k1 = bi[a.b1], wb = f2 * f2 * (3 - 2 * f2); acc.set(k0, (acc.get(k0) || 0) + w * (1 - wb)); acc.set(k1, (acc.get(k1) || 0) + w * wb); if (i === best) tubeTag = (sh < .5 ? a : b).tag; continue; }
      const b = bi[P[i].bone]; acc.set(b, (acc.get(b) || 0) + w); }
    const top = [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4), tot = top.reduce((s, x) => s + x[1], 0); top.forEach(([b, w], j) => { sk[v * 4 + j] = b; sw[v * 4 + j] = w / tot; });
    c3.set(spec.color(p, (P[best].t === 'u' ? tubeTag : P[best].tag) || '', [nrm[v * 3], nrm[v * 3 + 1], nrm[v * 3 + 2]])); col[v * 3] = c3.r; col[v * 3 + 1] = c3.g; col[v * 3 + 2] = c3.b; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(sk, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4)); g.setIndex(idx); g.computeBoundingSphere(); return g; }

/* ===== 毛並み：同じ皮膚を少しずつ外へふくらませた層を重ね、根元から先へまばらにしていく ===== */
function furMat(level, off, den, shade){ const m = new THREE.MeshStandardMaterial({ vertexColors:true, roughness:.95, metalness:0 });
  m.onBeforeCompile = sh => { sh.uniforms.uOff = { value:off }; sh.uniforms.uLev = { value:level }; sh.uniforms.uDen = { value:den };
    sh.vertexShader = 'uniform float uOff;\nvarying vec3 vFP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vFP = position; transformed += normal * uOff;');
    sh.fragmentShader = 'uniform float uLev; uniform float uDen;\nvarying vec3 vFP;\nfloat fh(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }\n' + sh.fragmentShader
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (uLev > 0.0){ vec3 q = vFP * uDen; vec3 c = floor(q); vec3 f = fract(q) - .5; float r = fh(c); if (r < uLev * .92 || dot(f.xz, f.xz) + dot(f.xy, f.xy) > .55 - uLev * .3) discard; }')
      .replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb *= ${shade.toFixed(3)} + uLev * ${(1 - shade).toFixed(3)};`); };
  m.customProgramCacheKey = () => 'fur' + level.toFixed(3) + off.toFixed(4) + den; return m; }

/* ===== 4本足の動物の組み立て ===== */
// a: 体の寸法（z=前、y=上、x=横。地面 y=0）
function quadruped(a){
  const bones = [], prims = [], B = (name, parent, p) => bones.push({ name, parent, p });
  B('root', null, [0, 0, 0]); B('hip', 'root', [0, a.hip[1], a.hip[0]]); B('chest', 'hip', [0, a.chest[1], a.chest[0]]);
  // 胴（腰〜胸の間に、ふくらみを持った楕円を何個か）
  if (a.body) prims.push({ t:'u', T:makeTube(a.body), k:a.bodyK }); else for (const [z, y, rx, ry, rz, bone, tag] of a.torso) prims.push({ t:'e', c:[0, y, z], r:[rx, ry, rz], bone, tag:tag || 'body' });
  // 首と頭
  const nk = a.neck; B('neck', 'chest', [0, nk[0][1], nk[0][0]]); B('neck2', 'neck', [0, nk[1][1], nk[1][0]]); B('head', 'neck2', [0, a.head.j[1], a.head.j[0]]);
  if (!a.body) for (let i = 0; i < nk.length - 1; i++) prims.push({ t:'c', a:[0, nk[i][1], nk[i][0]], b:[0, nk[i + 1][1], nk[i + 1][0]], r1:nk[i][2], r2:nk[i + 1][2], bone:i ? 'neck2' : 'neck', tag:'neck' });
  for (const [z, y, rx, ry, rz, tag] of a.head.parts) prims.push({ t:'e', c:[0, y, z], r:[rx, ry, rz], bone:'head', tag:tag || 'head' });
  for (const [z1, y1, r1, z2, y2, r2, tag] of a.head.cones || []) prims.push({ t:'c', a:[0, y1, z1], b:[0, y2, z2], r1, r2, bone:'head', tag:tag || 'muzzle' });
  for (const s of [-1, 1]) for (const [x1, y1, z1, r1, x2, y2, z2, r2, tag] of a.head.pair || []) prims.push({ t:'c', a:[s * x1, y1, z1], b:[s * x2, y2, z2], r1, r2, bone:'head', tag:tag || 'ear', k:a.head.pairK });
  // しっぽ
  const tl = a.tail || []; tl.forEach((t, i) => { if (i < tl.length - 1) B('tail' + i, i ? 'tail' + (i - 1) : 'hip', [0, t[1], t[0]]); });
  for (let i = 0; i < tl.length - 1; i++) prims.push({ t:'c', a:[0, tl[i][1], tl[i][0]], b:[0, tl[i + 1][1], tl[i + 1][0]], r1:tl[i][2], r2:tl[i + 1][2], bone:'tail' + i, tag:'tail', k:a.tailK });
  // 脚（付け根の筋肉・上の骨・下の骨・足先）
  const legs = [];
  for (const [side, nm, L, parent] of [[-1, 'lf', a.front, 'chest'], [1, 'rf', a.front, 'chest'], [-1, 'lh', a.hind, 'hip'], [1, 'rh', a.hind, 'hip']]){
    const x = side * L.x, J = L.j; // J: [[z,y,r] 付け根, ひじ/ひざ, 手首/かかと, つま先]
    B(nm + '1', parent, [x, J[0][1], J[0][0]]); B(nm + '2', nm + '1', [x, J[1][1], J[1][0]]); B(nm + '3', nm + '2', [x, J[2][1], J[2][0]]);
    prims.push({ t:'e', c:[x * (L.mx || 1), L.m[1], L.m[0]], r:L.mr, bone:nm + '1', tag:'thigh' });
    for (let i = 0; i < 3; i++) prims.push({ t:'c', a:[x, J[i][1], J[i][0]], b:[x * (i === 2 ? 1 : 1), J[i + 1][1], J[i + 1][0]], r1:J[i][2], r2:J[i + 1][2], bone:nm + (i + 1), tag:i === 2 ? 'foot' : i ? 'leg' : 'upper', k:L.k });
    legs.push(nm); }
  return { bones, prims, legs }; }

const GEO = {};
function assemble(spec, extras, key){
  const g0 = GEO[key] || (GEO[key] = buildSkin(spec)), bs = {}, list = [];
  for (const b of spec.bones){ const bone = new THREE.Bone(); bone.name = b.name; const pp = b.parent ? spec.bones.find(x => x.name === b.parent).p : [0, 0, 0]; bone.position.set(b.p[0] - pp[0], b.p[1] - pp[1], b.p[2] - pp[2]); if (b.parent) bs[b.parent].add(bone); bs[b.name] = bone; list.push(bone); }
  bs.root.updateMatrixWorld(true);
  const skel = new THREE.Skeleton(list), g = new THREE.Group(), meshes = [], N = spec.fur ? spec.fur.n : 0;
  for (let i = 0; i <= N; i++){ const lv = N ? i / N : 0, m = new THREE.SkinnedMesh(g0, i === 0 ? new THREE.MeshStandardMaterial({ vertexColors:true, roughness:.9 }) : furMat(lv, spec.fur.len * lv, spec.fur.den, spec.fur.shade ?? .72));
    if (i === 0){ m.add(bs.root); m.castShadow = true; } m.bind(skel); m.frustumCulled = false; meshes.push(m); g.add(m); }
  if (extras) extras(bs, g); return { g, bs, meshes }; }

const furN = (x, y, z = 0) => { const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return v - Math.floor(v); };
const mix = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t))).getHex();
function eyesOn(bone, x, y, z, r, iris = '#2a1a0c'){ const e = new THREE.MeshStandardMaterial({ color:iris, roughness:.08, metalness:.1 }), hl = new THREE.MeshBasicMaterial({ color:'#ffffff' });
  for (const s of [-1, 1]){ const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), e); m.position.set(s * x, y, z); m.scale.set(.8, 1, 1); bone.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(r * .25, 6, 4), hl); h.position.set(s * (x + r * .3), y + r * .4, z + r * .55); bone.add(h); } }
function noseOn(bone, y, z, r){ const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), new THREE.MeshStandardMaterial({ color:'#140e0a', roughness:.2 })); m.position.set(0, y, z); m.scale.set(1.2, .85, .9); bone.add(m); }
function earOn(bone, x, y, z, w, hgt, c1, c2, rz, rx = -.15, ry = 0){ const e = new THREE.Group(); e.position.set(x, y, z); e.rotation.set(rx, ry, rz); bone.add(e); const sh = new THREE.Shape(); sh.moveTo(-w, 0); sh.quadraticCurveTo(-w * .75, hgt * .65, 0, hgt); sh.quadraticCurveTo(w * .75, hgt * .65, w, 0); sh.quadraticCurveTo(0, -w * .35, -w, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth:w * .3, bevelEnabled:true, bevelSize:w * .2, bevelThickness:w * .22, bevelSegments:3, curveSegments:10 }); geo.translate(0, 0, -w * .15); e.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:c1, roughness:.95 })));
  if (c2){ const s2 = new THREE.Shape(); s2.moveTo(-w * .55, hgt * .08); s2.quadraticCurveTo(-w * .2, hgt * .55, 0, hgt * .82); s2.quadraticCurveTo(w * .2, hgt * .55, w * .55, hgt * .08); const m2 = new THREE.Mesh(new THREE.ShapeGeometry(s2, 8), new THREE.MeshStandardMaterial({ color:c2, roughness:1, side:THREE.DoubleSide })); m2.position.z = w * .38; e.add(m2); } return e; }

function whisk(bone, y, z, len){ const m = new THREE.LineBasicMaterial({ color:'#f4f0e8', transparent:true, opacity:.7 }); for (const s of [-1, 1]) for (let i = 0; i < 3; i++){ const a = (i - 1) * .2, g = new THREE.BufferGeometry().setFromPoints([V3(s * .006, y, z), V3(s * len * Math.cos(a), y + len * Math.sin(a) * .5 - len * .08, z - len * .3)]); bone.add(new THREE.Line(g, m)); } }
/* ===== 動物ごとの形 ===== */
const DEFS = {
  fox(){ const a = { hip:[-.15, .31], chest:[.12, .32],
      torso:[[-.13, .315, .068, .085, .13, 'hip'], [.0, .305, .072, .09, .12, 'hip', 'belly'], [.11, .315, .074, .1, .1, 'chest', 'chest']],
      neck:[[.16, .34, .055], [.22, .37, .046], [.27, .39, .042]], head:{ j:[.27, .39], parts:[[.295, .4, .058, .054, .062], [.33, .385, .045, .04, .045, 'cheek']], cones:[[.33, .392, .036, .42, .372, .01, 'muzzle']] },
      tail:[[-.24, .32, .035], [-.33, .31, .058], [-.43, .29, .07], [-.53, .27, .062], [-.62, .255, .03], [-.66, .25, .008]], tailK:.07,
      front:{ x:.04, j:[[.12, .3, .028], [.135, .17, .014], [.127, .045, .009], [.15, .006, .009]], m:[.12, .26], mr:[.034, .075, .05], k:.014 },
      hind:{ x:.044, j:[[-.16, .3, .032], [-.11, .17, .017], [-.2, .055, .01], [-.178, .006, .009]], m:[-.15, .23], mr:[.04, .085, .065], mx:1.05, k:.014 } };
    a.body = [[-.24, .31, .04, .045, 0, 'hip', 'hip'], [-.18, .315, .066, .08, 0, 'hip', 'hip'], [-.06, .31, .07, .085, 0, 'hip', 'belly'], [.06, .315, .073, .095, 0, 'chest', 'chest'], [.14, .32, .07, .095, 0, 'chest', 'chest'], [.2, .355, .052, .058, 0, 'neck', 'neck'], [.25, .38, .045, .047, 0, 'neck2', 'neck'], [.28, .395, .04, .04, 0, 'head', 'head']];
    const q = quadruped(a), OR = '#c2622a', RD = '#a54a1c', WH = '#f2ebe0', BL = '#231711';
    return { ...q, k:.045, res:120, fur:{ n:7, len:.011, den:900, shade:.62 },
      color:(p, tag, n) => tag === 'tail' ? (p[2] < -.54 ? WH : mix(OR, RD, n[1] * .4 + .3)) : tag === 'foot' || (tag === 'leg' && p[1] < .15) ? BL : tag === 'muzzle' ? (p[2] > .415 ? BL : n[1] < .2 ? WH : OR) : tag === 'cheek' && n[1] < .3 ? WH : (tag === 'neck' && n[1] < -.2) || (tag === 'chest' && n[1] < -.45 && Math.abs(n[0]) < .6) ? WH : tag === 'belly' && n[1] < -.75 ? '#e8dccc' : tag === 'head' && n[1] < -.3 ? WH : mix(OR, RD, n[1] * .45 + furN(p[0] * 9, p[1] * 9, p[2] * 9) * .15),
      extras:(bs) => { eyesOn(bs.head, .05, .03, .062, .011, '#3a2208'); noseOn(bs.head, -.02, .153, .011); for (const s of [-1, 1]) earOn(bs.head, s * .032, .05, .005, .027, .07, OR, BL, -s * .28, -.2, s * .3); },
      gait:'walk' }; },
  cat(){ const a = { hip:[-.12, .2], chest:[.1, .21],
      torso:[[-.11, .2, .055, .066, .1, 'hip'], [0, .195, .058, .066, .1, 'hip', 'belly'], [.1, .21, .058, .072, .08, 'chest', 'chest']],
      neck:[[.15, .23, .042], [.19, .26, .036], [.21, .28, .034]], head:{ j:[.21, .28], parts:[[.235, .29, .05, .045, .045], [.262, .277, .033, .027, .027, 'cheek']], cones:[[.27, .28, .02, .29, .274, .008, 'muzzle']] },
      tail:[[-.16, .21, .014], [-.24, .2, .012], [-.31, .24, .011], [-.34, .31, .01], [-.33, .36, .009], [-.31, .38, .005]], tailK:.012,
      front:{ x:.032, j:[[.1, .19, .022], [.11, .11, .012], [.105, .025, .009], [.12, .005, .009]], m:[.1, .17], mr:[.026, .048, .036], k:.012 },
      hind:{ x:.035, j:[[-.12, .19, .026], [-.08, .11, .014], [-.15, .04, .009], [-.13, .005, .009]], m:[-.12, .16], mr:[.032, .058, .046], k:.012 } };
    a.body = [[-.17, .2, .03, .035, 0, 'hip', 'hip'], [-.12, .205, .052, .06, 0, 'hip', 'hip'], [-.02, .198, .056, .062, 0, 'hip', 'belly'], [.08, .205, .056, .066, 0, 'chest', 'chest'], [.13, .215, .05, .06, 0, 'chest', 'chest'], [.17, .245, .04, .042, 0, 'neck', 'neck'], [.2, .27, .034, .035, 0, 'neck2', 'neck'], [.215, .28, .03, .03, 0, 'head', 'head']];
    const q = quadruped(a), C1 = '#a8957c', C2 = '#5c4c3c', WH = '#f2eee6';
    return { ...q, k:.035, res:104, fur:{ n:7, len:.006, den:1500, shade:.66 },
      color:(p, tag, n) => (tag === 'muzzle' || tag === 'cheek') && n[1] < .4 || (tag === 'chest' && n[1] < -.55) || (tag === 'foot') ? WH : mix(C1, C2, Math.pow(Math.sin(p[2] * 80 + furN(Math.round(p[2] * 40), Math.round(p[1] * 30)) * 2 + Math.abs(p[0]) * 25) * .5 + .5, 4) * .28 * (n[1] > -.3 ? 1 : .2) + n[1] * .15 + furN(p[0] * 20, p[1] * 20, p[2] * 20) * .08),
      extras:(bs) => { eyesOn(bs.head, .02, .021, .072, .014, '#a8ae2a'); for (const s2 of [-1, 1]){ const pu = new THREE.Mesh(new THREE.SphereGeometry(.0042, 10, 8), new THREE.MeshBasicMaterial({ color:'#0a0806' })); pu.scale.set(.55, 1.5, .5); pu.position.set(s2 * .021, .021, .0857); bs.head.add(pu); } noseOn(bs.head, -.004, .088, .006); for (const s of [-1, 1]) earOn(bs.head, s * .03, .036, -.005, .022, .045, C1, '#e8b4ac', -s * .3, -.1, s * .25); whisk(bs.head, -.008, .078, .07); }, gait:'walk' }; },
  dog(){ const a = { hip:[-.15, .3], chest:[.13, .31],
      torso:[[-.14, .3, .07, .082, .12, 'hip'], [0, .29, .075, .087, .12, 'hip', 'belly'], [.12, .31, .078, .097, .09, 'chest', 'chest']],
      neck:[[.17, .35, .056], [.21, .39, .05], [.24, .42, .048]], head:{ j:[.24, .42], parts:[[.265, .43, .06, .056, .058], [.3, .415, .045, .04, .04, 'cheek']], cones:[[.3, .418, .036, .365, .405, .017, 'muzzle']] },
      tail:[[-.19, .37, .024], [-.215, .43, .03], [-.17, .47, .03], [-.12, .445, .018], [-.105, .425, .008]], tailK:.03,
      front:{ x:.042, j:[[.13, .29, .03], [.14, .16, .016], [.13, .04, .012], [.15, .006, .012]], m:[.13, .26], mr:[.034, .072, .05], k:.014 },
      hind:{ x:.046, j:[[-.16, .29, .032], [-.11, .16, .018], [-.19, .05, .012], [-.17, .006, .012]], m:[-.15, .235], mr:[.036, .072, .056], k:.014 } };
    a.body = [[-.21, .31, .04, .045, 0, 'hip', 'hip'], [-.15, .305, .07, .08, 0, 'hip', 'hip'], [-.03, .295, .074, .085, 0, 'hip', 'belly'], [.08, .305, .077, .095, 0, 'chest', 'chest'], [.15, .32, .072, .093, 0, 'chest', 'chest'], [.2, .37, .055, .058, 0, 'neck', 'neck'], [.235, .405, .05, .05, 0, 'neck2', 'neck'], [.25, .42, .045, .045, 0, 'head', 'head']];
    const q = quadruped(a), RD = '#c47838', DK = '#a05a26', CR = '#f2e4c8';
    return { ...q, k:.04, res:98, fur:{ n:7, len:.008, den:1200, shade:.66 },
      color:(p, tag, n) => tag === 'muzzle' ? (p[2] > .36 ? '#1a1410' : CR) : tag === 'cheek' && n[1] < .5 ? CR : (tag === 'chest' || tag === 'neck') && n[1] < -.1 ? CR : tag === 'belly' && n[1] < -.5 ? CR : (tag === 'foot' || (tag === 'leg' && Math.abs(p[0]) < .04)) ? CR : tag === 'tail' && n[1] < -.2 ? CR : mix(RD, DK, n[1] * .4 + furN(p[0] * 11, p[1] * 11, p[2] * 11) * .12),
      extras:(bs) => { eyesOn(bs.head, .033, .022, .055, .0105, '#2a1608'); noseOn(bs.head, -.012, .127, .013); for (const s of [-1, 1]) earOn(bs.head, s * .034, .048, -.01, .027, .055, RD, '#e8c8a8', -s * .2, -.12, s * .25); }, gait:'walk' }; },
  tanuki(){ const a = { hip:[-.1, .21], chest:[.08, .215],
      torso:[[-.1, .205, .09, .095, .1, 'hip'], [0, .205, .095, .1, .1, 'hip', 'belly'], [.08, .215, .088, .095, .08, 'chest', 'chest']],
      neck:[[.12, .235, .064], [.16, .25, .058], [.19, .262, .054]], head:{ j:[.19, .262], parts:[[.21, .272, .064, .056, .055], [.24, .26, .056, .043, .04, 'cheek']], cones:[[.25, .262, .028, .295, .25, .01, 'muzzle']] },
      tail:[[-.16, .23, .04], [-.23, .2, .052], [-.29, .165, .048], [-.325, .145, .02]], tailK:.05,
      front:{ x:.045, j:[[.08, .18, .026], [.085, .1, .016], [.08, .03, .012], [.095, .006, .012]], m:[.08, .16], mr:[.03, .05, .04], k:.012 },
      hind:{ x:.05, j:[[-.11, .18, .03], [-.07, .1, .018], [-.12, .035, .012], [-.105, .006, .012]], m:[-.1, .15], mr:[.035, .06, .05], k:.012 } };
    a.body = [[-.16, .21, .05, .055, 0, 'hip', 'hip'], [-.1, .205, .088, .093, 0, 'hip', 'hip'], [0, .205, .094, .098, 0, 'hip', 'belly'], [.08, .212, .088, .094, 0, 'chest', 'chest'], [.13, .23, .07, .075, 0, 'neck', 'neck'], [.17, .25, .058, .058, 0, 'neck2', 'neck'], [.195, .262, .052, .052, 0, 'head', 'head']];
    const q = quadruped(a), GR = '#6e604c', LT = '#b8a88a', DK = '#221c16';
    return { ...q, k:.045, res:96, fur:{ n:8, len:.016, den:900, shade:.55 },
      color:(p, tag, n) => tag === 'foot' || tag === 'leg' || (tag === 'thigh' && p[1] < .13) ? DK : tag === 'muzzle' ? (p[2] > .29 ? DK : LT) : (tag === 'cheek' || tag === 'head') && Math.hypot(Math.abs(p[0]) - .034, p[1] - .272, p[2] - .248) < .028 ? DK : tag === 'cheek' ? LT : tag === 'tail' ? (p[2] < -.3 ? DK : mix(GR, DK, Math.pow(Math.sin(p[2] * 70) * .5 + .5, 2) * .5)) : (tag === 'chest' && n[1] < -.2) ? DK : mix(GR, LT, n[1] * .35 + .2 + furN(p[0] * 13, p[1] * 13, p[2] * 13) * .35),
      extras:(bs) => { eyesOn(bs.head, .028, .012, .062, .009, '#1a1006'); noseOn(bs.head, -.012, .107, .011); for (const s of [-1, 1]) earOn(bs.head, s * .042, .038, -.015, .02, .03, DK, LT, -s * .35, -.15, s * .2); }, gait:'walk' }; },
  deer(){ const a = { hip:[-.36, .72], chest:[.2, .74],
      torso:[[-.36, .72, .105, .12, .16, 'hip'], [-.1, .71, .12, .135, .18, 'hip', 'belly'], [.15, .73, .12, .15, .14, 'chest', 'chest']],
      neck:[[.25, .8, .078], [.33, .95, .062], [.37, 1.06, .056]], head:{ j:[.37, 1.06], parts:[[.4, 1.075, .056, .06, .07], [.45, 1.05, .046, .046, .05, 'cheek']], cones:[[.46, 1.05, .039, .6, .99, .018, 'muzzle']] },
      tail:[[-.46, .79, .032], [-.5, .75, .026], [-.51, .72, .01]], tailK:.03,
      front:{ x:.07, j:[[.2, .66, .05], [.22, .38, .022], [.21, .1, .014], [.225, .005, .016]], m:[.2, .62], mr:[.05, .12, .08], k:.016 },
      hind:{ x:.075, j:[[-.38, .68, .06], [-.3, .42, .028], [-.42, .16, .016], [-.405, .005, .016]], m:[-.36, .6], mr:[.06, .14, .1], k:.016 } };
    a.body = [[-.46, .74, .05, .06, 0, 'hip', 'hip'], [-.38, .73, .105, .12, 0, 'hip', 'hip'], [-.15, .71, .115, .13, 0, 'hip', 'belly'], [.08, .72, .12, .145, 0, 'chest', 'chest'], [.2, .74, .105, .13, 0, 'chest', 'chest'], [.28, .84, .07, .075, 0, 'neck', 'neck'], [.34, .98, .06, .062, 0, 'neck2', 'neck'], [.37, 1.06, .055, .056, 0, 'head', 'head']];
    const q = quadruped(a), BR = '#6e5a46', LT = '#a89480', WH = '#f2ece2', DK = '#2a2018';
    return { ...q, k:.06, res:104, fur:{ n:6, len:.007, den:900, shade:.7 },
      color:(p, tag, n) => tag === 'foot' && p[1] < .035 ? DK : tag === 'muzzle' && p[2] > .58 ? DK : tag === 'tail' ? (n[1] > .2 ? DK : WH) : (tag === 'hip' && p[2] < -.44 && Math.abs(n[0]) < .7 && n[1] > -.5) ? WH : (tag === 'belly' || tag === 'chest') && n[1] < -.5 ? LT : tag === 'leg' || tag === 'foot' ? '#8a7460' : mix(BR, '#54442f', n[1] * .4 + furN(p[0] * 7, p[1] * 7, p[2] * 7) * .1),
      extras:(bs) => { eyesOn(bs.head, .045, .03, .06, .013, '#1a0e06'); noseOn(bs.head, -.07, .235, .02); for (const s of [-1, 1]) earOn(bs.head, s * .055, .045, -.03, .03, .09, BR, '#e0ccb4', -s * 1.15, -.25, s * .3);
        const an = new THREE.MeshStandardMaterial({ color:'#d4c0a0', roughness:.55 }); for (const s of [-1, 1]){ const g = new THREE.Group(); g.position.set(s * .03, .06, -.005); g.rotation.set(-.45, 0, -s * .3); bs.head.add(g);
          const seg = (a, b, r1, r2) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, d.length(), 8), an); m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); g.add(m); };
          seg([0, 0, 0], [0, .16, -.02], .012, .009); seg([0, .16, -.02], [0, .32, -.07], .009, .005); seg([0, .07, -.008], [0, .14, .07], .007, .003); seg([0, .2, -.03], [0, .26, .04], .006, .003); } }, gait:'walk', swing:.3 }; },
  rabbit(){ const a = { hip:[-.08, .13], chest:[.08, .12],
      torso:[[-.08, .13, .07, .075, .09, 'hip'], [0, .12, .066, .07, .09, 'hip', 'belly'], [.07, .12, .056, .062, .07, 'chest', 'chest']],
      neck:[[.1, .14, .046], [.13, .165, .041], [.15, .18, .039]], head:{ j:[.15, .18], parts:[[.17, .186, .043, .045, .055], [.205, .175, .031, .031, .031, 'cheek']], cones:[[.21, .18, .022, .238, .17, .008, 'muzzle']] },
      tail:[[-.15, .15, .026], [-.17, .15, .024], [-.18, .15, .01]], tailK:.03,
      front:{ x:.03, j:[[.08, .1, .018], [.1, .06, .012], [.11, .02, .009], [.13, .005, .008]], m:[.08, .09], mr:[.02, .036, .03], k:.01 },
      hind:{ x:.05, j:[[-.07, .12, .03], [-.01, .07, .024], [-.12, .03, .014], [.0, .006, .012]], m:[-.06, .09], mr:[.042, .06, .07], k:.012 } };
    a.body = [[-.15, .14, .05, .05, 0, 'hip', 'hip'], [-.08, .13, .07, .075, 0, 'hip', 'hip'], [0, .12, .066, .07, 0, 'hip', 'belly'], [.07, .12, .056, .062, 0, 'chest', 'chest'], [.11, .145, .045, .045, 0, 'neck', 'neck'], [.14, .17, .04, .04, 0, 'neck2', 'neck'], [.155, .18, .039, .039, 0, 'head', 'head']];
    const q = quadruped(a), WH = '#f4f2ee', GY = '#dcd8d0';
    return { ...q, k:.04, res:92, fur:{ n:8, len:.01, den:1100, shade:.72 },
      color:(p, tag, n) => tag === 'muzzle' && p[2] > .233 ? '#c89a98' : mix(WH, GY, n[1] * .35 + furN(p[0] * 15, p[1] * 15, p[2] * 15) * .25),
      extras:(bs) => { eyesOn(bs.head, .034, .012, .036, .011, '#1a0e08'); for (const s of [-1, 1]){ const e = earOn(bs.head, s * .018, .04, -.015, .021, .12, WH, '#ecc8c4', -s * .12, -.38, s * .2); const t = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color:'#1e1a18', roughness:.9 })); t.scale.set(.012, .02, .006); t.position.set(0, .115, 0); e.add(t); } whisk(bs.head, -.006, .062, .05); },
      gait:'hop', hopH:.07 }; },
  squirrel(){ const a = { hip:[-.03, .07], chest:[.04, .07],
      torso:[[-.03, .07, .035, .04, .05, 'hip'], [.01, .07, .034, .038, .045, 'hip', 'belly'], [.045, .078, .03, .035, .035, 'chest', 'chest']],
      neck:[[.06, .085, .024], [.075, .1, .022], [.085, .11, .021]], head:{ j:[.085, .11], parts:[[.095, .112, .025, .026, .03], [.112, .105, .016, .016, .016, 'cheek']], cones:[[.115, .108, .012, .13, .102, .004, 'muzzle']] },
      tail:[[-.06, .07, .014], [-.1, .085, .03], [-.12, .13, .04], [-.1, .18, .04], [-.065, .2, .03], [-.045, .19, .01]], tailK:.05,
      front:{ x:.016, j:[[.045, .06, .01], [.055, .035, .007], [.06, .012, .005], [.07, .003, .005]], m:[.045, .055], mr:[.01, .018, .015], k:.006 },
      hind:{ x:.026, j:[[-.03, .065, .016], [0, .04, .012], [-.045, .015, .007], [0, .003, .006]], m:[-.03, .05], mr:[.02, .028, .032], k:.008 } };
    a.body = [[-.06, .068, .02, .022, 0, 'hip', 'hip'], [-.03, .07, .035, .04, 0, 'hip', 'hip'], [.01, .07, .034, .038, 0, 'hip', 'belly'], [.045, .078, .03, .035, 0, 'chest', 'chest'], [.07, .092, .024, .024, 0, 'neck', 'neck'], [.085, .108, .021, .021, 0, 'head', 'head']];
    const q = quadruped(a), BR = '#8a7262', RD = '#94705a', WH = '#f0e8dc';
    return { ...q, k:.022, res:86, fur:{ n:7, len:.006, den:2200, shade:.62 },
      color:(p, tag, n) => (tag === 'chest' || tag === 'belly' || tag === 'neck' || tag === 'cheek') && n[1] < -.25 ? WH : tag === 'leg' || tag === 'foot' || tag === 'upper' ? RD : tag === 'tail' ? mix(BR, '#5a4638', .3 + furN(p[0] * 40, p[1] * 40, p[2] * 40) * .5) : mix(BR, '#6a5444', n[1] * .4 + furN(p[0] * 30, p[1] * 30, p[2] * 30) * .2),
      extras:(bs) => { eyesOn(bs.head, .017, .008, .022, .0065, '#0e0804'); for (const s of [-1, 1]){ const e = earOn(bs.head, s * .013, .018, -.008, .009, .024, BR, '#d8b8a8', -s * .2, -.1, s * .2); const t = new THREE.Mesh(new THREE.ConeGeometry(.004, .014, 6), new THREE.MeshStandardMaterial({ color:'#4a3a30' })); t.position.set(0, .028, 0); e.add(t); } },
      gait:'hop', hopH:.04 }; },
  mouse(){ const a = { hip:[-.02, .025], chest:[.02, .025],
      torso:[[-.02, .026, .019, .019, .03, 'hip'], [0, .025, .019, .018, .028, 'hip', 'belly'], [.025, .025, .016, .016, .02, 'chest', 'chest']],
      neck:[[.035, .028, .013], [.045, .031, .012], [.05, .032, .012]], head:{ j:[.05, .032], parts:[[.06, .032, .014, .014, .018]], cones:[[.065, .031, .01, .085, .026, .003, 'muzzle']] },
      tail:[[-.04, .02, .004], [-.07, .012, .003], [-.1, .01, .0026], [-.13, .014, .0022]], tailK:.004,
      front:{ x:.009, j:[[.025, .018, .005], [.028, .01, .0038], [.03, .004, .003], [.035, .0025, .003]], m:[.025, .02], mr:[.006, .01, .01], k:.004 },
      hind:{ x:.012, j:[[-.02, .02, .007], [-.01, .012, .005], [-.025, .004, .0035], [-.012, .0025, .003]], m:[-.02, .018], mr:[.008, .012, .014], k:.004 } };
    a.body = [[-.04, .024, .012, .012, 0, 'hip', 'hip'], [-.02, .026, .019, .019, 0, 'hip', 'hip'], [0, .025, .019, .018, 0, 'hip', 'belly'], [.025, .025, .016, .016, 0, 'chest', 'chest'], [.042, .03, .012, .012, 0, 'neck', 'neck'], [.05, .032, .012, .012, 0, 'head', 'head']];
    const q = quadruped(a), OR = '#a8724a', WH = '#f2ece4', PK = '#d8a8a0';
    return { ...q, k:.01, res:104, sig:.004, fur:{ n:5, len:.0025, den:4000, shade:.7 },
      color:(p, tag, n) => tag === 'tail' || tag === 'foot' ? PK : n[1] < -.3 ? WH : tag === 'muzzle' && p[2] > .082 ? PK : mix(OR, '#7a5236', n[1] * .4),
      extras:(bs) => { eyesOn(bs.head, .01, .004, .018, .0045, '#080404'); for (const s of [-1, 1]) earOn(bs.head, s * .009, .01, -.002, .009, .013, OR, PK, -s * .5, -.1, s * .4); whisk(bs.head, -.004, .033, .03); },
      gait:'hop', hopH:.012, scale:1.35 }; },
  bird(){ const bones = [{ name:'root', parent:null, p:[0, 0, 0] }, { name:'body', parent:'root', p:[0, .05, 0] }, { name:'head', parent:'body', p:[0, .07, .03] }, { name:'tail', parent:'body', p:[0, .05, -.03] }];
    const prims = [{ t:'e', c:[0, .05, 0], r:[.025, .025, .036], bone:'body', tag:'back' }, { t:'e', c:[0, .044, .014], r:[.024, .023, .026], bone:'body', tag:'breast' },
      { t:'e', c:[0, .076, .038], r:[.019, .019, .021], bone:'head', tag:'head' }, { t:'c', a:[0, .073, .056], b:[0, .07, .068], r1:.006, r2:.0012, bone:'head', tag:'beak', k:.003 },
      { t:'e', c:[0, .054, -.058], r:[.013, .004, .03], bone:'tail', tag:'tail', k:.008 }, ...[-1, 1].map(s => ({ t:'e', c:[s * .021, .056, -.008], r:[.008, .016, .034], bone:'body', tag:'wing', k:.01 }))];
    const BR = '#8a5e3a', CH = '#7a3e22', DK = '#1e1610', GY = '#d8d2c6';
    return { bones, prims, legs:[], k:.016, res:110, sig:.006,
      color:(p, tag, n) => tag === 'beak' ? DK : tag === 'head' ? (p[1] > .082 && n[1] > .2 ? CH : p[2] > .04 && p[1] < .07 && Math.abs(p[0]) < .012 ? DK : Math.abs(p[0]) > .012 && p[1] < .08 ? (Math.abs(p[0]) > .016 && p[1] > .07 && p[1] < .076 && p[2] > .032 && p[2] < .04 ? DK : '#f4f0e8') : CH) : tag === 'breast' ? (p[1] > .05 && p[2] > .025 && Math.abs(p[0]) < .012 ? DK : GY) : tag === 'wing' ? (Math.abs(p[1] - .058) < .003 ? '#f0ece4' : mix(BR, DK, Math.sin(p[2] * 300) > .3 ? .6 : .1)) : tag === 'tail' ? '#5a3e28' : n[1] < -.3 ? GY : mix(BR, DK, Math.sin(p[2] * 260 + p[0] * 90) > .4 ? .55 : .05),
      extras:(bs) => { eyesOn(bs.head, .014, .009, .016, .0035, '#0a0604'); const lm = new THREE.MeshStandardMaterial({ color:'#c09070', roughness:.6 }); for (const s of [-1, 1]){ const l = new THREE.Mesh(new THREE.CylinderGeometry(.0018, .0018, .032, 5), lm); l.position.set(s * .008, .016, .004); bs.root.add(l); const f = new THREE.Mesh(new THREE.BoxGeometry(.003, .0015, .014), lm); f.position.set(s * .008, .001, .008); bs.root.add(f); } },
      gait:'bird', hopH:.03, scale:1.2 }; },
};

/* 皮膚と骨は1回作ったらとっておく（同じ動物は形を使い回す） */
const CACHE = {};
export const ANIMAL_TYPES = Object.keys(DEFS);
export function buildAnimal(type){ const def = DEFS[type](), A = assemble(def, def.extras, type), g = A.g, bs = A.bs; if (def.scale) bs.root.scale.setScalar(def.scale);
  const y0 = {}; for (const [k, b] of Object.entries(bs)) y0[k] = b.position.y;
  // 歩く：左後ろ→左前→右後ろ→右前の順に脚を出す。上の骨を前後に振り、前へ運ぶ間は下の関節を曲げて足を持ち上げる
  const OFF = { lh:0, lf:Math.PI * .5, rh:Math.PI, rf:Math.PI * 1.5 }, sw = def.swing || .42;
  function walk(ph){ for (const nm of def.legs){ const p = ph + OFF[nm], s = Math.sin(p), lift = Math.max(0, Math.cos(p)), b1 = bs[nm + '1'], b2 = bs[nm + '2'], b3 = bs[nm + '3'];
      b1.rotation.x = -s * sw; if (nm[1] === 'f'){ b2.rotation.x = lift * .85; b3.rotation.x = -lift * .55; } else { b2.rotation.x = -lift * .65; b3.rotation.x = lift * .85; } }
    bs.hip.position.y = y0.hip + Math.abs(Math.cos(ph)) * .006; bs.hip.rotation.z = Math.sin(ph) * .025; bs.chest.rotation.z = -Math.sin(ph) * .03;
    bs.neck.rotation.x = Math.sin(ph * 2) * .025; bs.head.rotation.x = -Math.sin(ph * 2) * .025;
    for (let i = 0; bs['tail' + i]; i++){ bs['tail' + i].rotation.y = Math.sin(ph * .5 - i * .6) * .12; } }
  // 跳ねる（うさぎ・りす・ねずみ）：後ろ足でけって前足から着地。空中では体が伸び、着地で縮む
  function hop(fr, hp){ const up = hp > 0, push = up ? Math.cos(fr * Math.PI) : 0; bs.root.position.y = hp * (def.hopH || .05);
    bs.hip.rotation.x = up ? -push * .18 : 0; bs.chest.rotation.x = up ? push * .1 : 0;
    for (const nm of def.legs){ const b1 = bs[nm + '1'], b2 = bs[nm + '2'], b3 = bs[nm + '3'];
      if (nm[1] === 'h'){ b1.rotation.x = up ? Math.max(0, push) * .9 : 0; b2.rotation.x = up ? -Math.max(0, push) * .5 : 0; b3.rotation.x = up ? Math.max(0, push) * .9 : 0; }
      else { b1.rotation.x = up ? -Math.sin(fr * Math.PI) * .7 : 0; b2.rotation.x = up ? Math.max(0, -push) * .4 : 0; b3.rotation.x = 0; } }
    for (let i = 0; bs['tail' + i]; i++) bs['tail' + i].rotation.x = up ? push * .12 : 0; bs.neck.rotation.x = up ? push * .1 : 0; }
  // 小鳥：両足でちょんちょん。頭をちょこちょこ、しっぽをぴくっと
  function bird(fr, hp){ bs.root.position.y = hp * (def.hopH || .03); bs.body.rotation.x = hp > 0 ? -Math.cos(fr * Math.PI) * .15 : 0; bs.head.rotation.x = Math.sin(fr * Math.PI * 2) * .15; bs.tail.rotation.x = hp > 0 ? .3 * Math.sin(fr * Math.PI) : 0; }
  const mode = def.gait === 'walk' ? 'walk' : 'hop'; if (mode === 'walk') walk(0); else (def.gait === 'bird' ? bird : hop)(0, 0);
  // 首をふる・うつむく（のんびりしている時用）。y：左右、p：下向き
  const look = (y, p) => { if (bs.neck){ bs.neck.rotation.y = y * .45; if (p) bs.neck.rotation.x = p * .6; } bs.head.rotation.y = y * .55; if (p) bs.head.rotation.x = p * .5; };
  return { g, mode, hopH:def.hopH || 0, look, anim:(ph, fr, hp) => mode === 'walk' ? walk(ph) : (def.gait === 'bird' ? bird(fr, hp) : hop(fr, hp)) }; }
