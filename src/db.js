import { supabase } from "./supabase.js";

const SK = "lc-tracker-v3";

function toDbRow(item, userId) {
  const row = {
    id: item.id,
    number: item.number || "",
    title: item.title || "",
    pattern: JSON.stringify(item.pattern || ["other"]),
    alt_pattern: JSON.stringify(item.altPattern || []),
    difficulty: item.difficulty || "medium",
    confidence: item.confidence || 3,
    notes: item.notes || "",
    url: item.url || "",
    added_at: item.addedAt,
    last_review: item.lastReview,
    next_review: item.nextReview,
    review_count: item.reviewCount ?? 0,
  };
  if (userId) row.user_id = userId;
  return row;
}

function fromDbRow(row, history) {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    pattern: (() => { try { const p = JSON.parse(row.pattern); return Array.isArray(p) ? p : [row.pattern || "other"]; } catch { return [row.pattern || "other"]; } })(),
    altPattern: (() => { try { const p = JSON.parse(row.alt_pattern); return Array.isArray(p) ? p : []; } catch { return []; } })(),
    difficulty: row.difficulty,
    confidence: row.confidence,
    notes: row.notes,
    url: row.url || "",
    addedAt: row.added_at,
    lastReview: row.last_review,
    nextReview: row.next_review,
    reviewCount: row.review_count,
    history: history || [],
  };
}

function throwIfError({ error }) {
  if (error) throw error;
}

async function supabaseLoad() {
  const { data: problems, error: pErr } = await supabase
    .from("problems")
    .select("*")
    .order("created_at", { ascending: false });
  if (pErr) throw pErr;

  const { data: historyRows, error: hErr } = await supabase
    .from("review_history")
    .select("*")
    .order("created_at", { ascending: true });
  if (hErr) throw hErr;

  const historyMap = {};
  for (const h of historyRows) {
    if (!historyMap[h.problem_id]) historyMap[h.problem_id] = [];
    historyMap[h.problem_id].push({ date: h.date, confidence: h.confidence });
  }

  return problems.map((row) => fromDbRow(row, historyMap[row.id] || []));
}

let cancelled = false;

async function supabaseSave(items, userId) {
  cancelled = false;

  // 1. 查现有 ID，删除已移除的题目
  const { data: existing, error: fetchErr } = await supabase.from("problems").select("id");
  if (fetchErr) throw fetchErr;
  if (cancelled) return;

  const existingIds = new Set((existing || []).map((r) => r.id));
  const currentIds = new Set(items.map((i) => i.id));

  const toDelete = [...existingIds].filter((id) => !currentIds.has(id));
  if (toDelete.length > 0) {
    throwIfError(await supabase.from("problems").delete().in("id", toDelete));
    if (cancelled) return;
  }

  // 2. 批量 upsert 所有 problems
  const rows = items.map((item) => toDbRow(item, userId));
  for (let i = 0; i < rows.length; i += 100) {
    throwIfError(await supabase.from("problems").upsert(rows.slice(i, i + 100), { onConflict: "id" }));
    if (cancelled) return;
  }

  // 3. 批量重建 review_history：一次删除 + 一次插入
  throwIfError(await supabase.from("review_history").delete().eq("user_id", userId));
  if (cancelled) return;

  const allHistory = [];
  for (const item of items) {
    if (item.history && item.history.length > 0) {
      for (const h of item.history) {
        allHistory.push({ problem_id: item.id, date: h.date, confidence: h.confidence, user_id: userId });
      }
    }
  }
  for (let i = 0; i < allHistory.length; i += 500) {
    throwIfError(await supabase.from("review_history").insert(allHistory.slice(i, i + 500)));
    if (cancelled) return;
  }
}

function localLoad() {
  try {
    return JSON.parse(localStorage.getItem(SK)) || [];
  } catch {
    return [];
  }
}

function localSave(data) {
  try {
    localStorage.setItem(SK, JSON.stringify(data));
  } catch {}
}

let saveQueue = Promise.resolve();
let debounceTimer = null;
let pendingResolvers = [];

export const db = {
  async load() {
    if (supabase) {
      try {
        const data = await supabaseLoad();
        console.log(`[db] Loaded ${data.length} items from Supabase`);
        return data;
      } catch (e) {
        console.error("[db] Supabase load failed, falling back to localStorage:", e);
        return localLoad();
      }
    }
    console.log("[db] No Supabase config, using localStorage");
    return localLoad();
  },

  cancelSave() {
    cancelled = true;
    clearTimeout(debounceTimer);
    pendingResolvers.splice(0).forEach((r) => r.resolve());
  },

  save(data, userId) {
    localSave(data);

    if (!supabase || !userId) return Promise.resolve();

    return new Promise((resolve, reject) => {
      pendingResolvers.push({ resolve, reject });
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const resolvers = pendingResolvers.splice(0);
        saveQueue = saveQueue
          .then(() => supabaseSave(data, userId))
          .then(() => resolvers.forEach((r) => r.resolve()))
          .catch((e) => {
            if (cancelled) { resolvers.forEach((r) => r.resolve()); return; }
            console.error("[db] Supabase save failed:", e);
            resolvers.forEach((r) => r.reject(e));
          });
      }, 500);
    });
  },
};
