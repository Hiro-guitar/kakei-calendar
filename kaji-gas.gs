/**
 * うちの家事 — 同期用 Google Apps Script
 * 1. 新しいスプレッドシートを作り「拡張機能 > Apps Script」にこのコードを貼る
 * 2. 下の KEY を好きな合言葉に変える（アプリの設定にも同じものを入れる）
 * 3. デプロイ > 新しいデプロイ > 種類「ウェブアプリ」
 *    実行ユーザー：自分 / アクセスできるユーザー：全員
 * 4. 発行された URL（…/exec）をアプリの設定に貼る
 */
const KEY = 'ここを合言葉に変える';
const SHEET = 'items';

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['id', 'kind', 'serverAt', 'updatedAt', 'deleted', 'json']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== KEY) return json_({ ok: false, error: 'bad key' });
  const since = Number(p.since || 0);
  const values = sheet_().getDataRange().getValues();
  values.shift();
  const items = [];
  values.forEach(r => {
    if (Number(r[2]) > since) {
      try { items.push(JSON.parse(r[5])); } catch (err) {}
    }
  });
  return json_({ ok: true, items: items, now: Date.now() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (body.key !== KEY) return json_({ ok: false, error: 'bad key' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    const values = sh.getDataRange().getValues();
    const index = {};
    for (let i = 1; i < values.length; i++) index[values[i][0]] = i + 1; // 行番号
    const now = Date.now();
    const appends = [];
    (body.items || []).forEach(it => {
      if (!it || !it.id) return;
      const row = [it.id, it.kind || '', now, it.updatedAt || 0, it.deleted ? 1 : 0, JSON.stringify(it)];
      const r = index[it.id];
      if (r) {
        const cur = Number(values[r - 1][3] || 0);
        if ((it.updatedAt || 0) >= cur) sh.getRange(r, 1, 1, 6).setValues([row]);
      } else {
        appends.push(row);
        index[it.id] = -1;
      }
    });
    if (appends.length) sh.getRange(sh.getLastRow() + 1, 1, appends.length, 6).setValues(appends);
    return json_({ ok: true, now: now });
  } finally {
    lock.releaseLock();
  }
}
