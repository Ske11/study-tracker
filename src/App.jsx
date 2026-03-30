import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeftRight, SlidersHorizontal, Search, GitFork, Layers,
  Diamond, AlignJustify, Hash, TreePine, Share2, Link, RotateCcw,
  BarChart3, Network, BookOpen, Binary, MoreHorizontal,
  Plus, Bell, LayoutGrid, List, Pencil, Flame, Clock,
  ChevronRight, ChevronDown, X, Trash2, Save, Sparkles, Target, Trophy, Percent,
  FileText, GitBranch, CalendarDays, ArrowRight, ArrowUp, ArrowDown, Minus,
  Code, Zap, Eye, TrendingUp, CircleDot, Check, AlertTriangle, ArrowUpDown,
  Download, Upload, FileUp,
} from "lucide-react";
import { db } from "./db.js";

/* ═══════════════════════ 数据定义 ═══════════════════════ */

const PATTERNS = [
  { id: "two-pointers",   label: "双指针",       Icon: ArrowLeftRight,    color: "#DC5656" },
  { id: "sliding-window", label: "滑动窗口",     Icon: SlidersHorizontal, color: "#D9566E" },
  { id: "binary-search",  label: "二分查找",     Icon: Search,            color: "#8B6FD6" },
  { id: "bfs-dfs",        label: "广度/深度优先", Icon: GitFork,          color: "#6A70D6" },
  { id: "dp",             label: "动态规划",     Icon: Layers,            color: "#5558CC" },
  { id: "greedy",         label: "贪心算法",     Icon: Diamond,           color: "#1EA896" },
  { id: "stack-queue",    label: "栈与队列",     Icon: AlignJustify,      color: "#22A97A" },
  { id: "hash",           label: "哈希表",       Icon: Hash,              color: "#36B065" },
  { id: "tree",           label: "树",           Icon: TreePine,          color: "#7DA828" },
  { id: "graph",          label: "图",           Icon: Share2,            color: "#D4A017" },
  { id: "linked-list",    label: "链表",         Icon: Link,              color: "#D97A2B" },
  { id: "backtrack",      label: "回溯",         Icon: RotateCcw,         color: "#DC5656" },
  { id: "monotonic-stack", label: "单调栈",      Icon: BarChart3,         color: "#C25CD6" },
  { id: "union-find",     label: "并查集",       Icon: Network,           color: "#6A70D6" },
  { id: "trie",           label: "字典树",       Icon: BookOpen,          color: "#4A8FD6" },
  { id: "bit",            label: "位运算",       Icon: Binary,            color: "#1EA896" },
  { id: "other",          label: "其他",         Icon: MoreHorizontal,    color: "#7C8898" },
];

const DIFFICULTY = [
  { id: "easy", label: "简单", color: "#22A97A" },
  { id: "medium", label: "中等", color: "#D4A017" },
  { id: "hard", label: "困难", color: "#DC5656" },
];

const CONFIDENCE = [
  { id: 1, label: "完全不会",     emoji: "😵", next: 1,  color: "#DC5656" },
  { id: 2, label: "看提示才会",   emoji: "🤔", next: 2,  color: "#D97A2B" },
  { id: 3, label: "磕磕绊绊写出", emoji: "😅", next: 4,  color: "#D4A017" },
  { id: 4, label: "比较顺利",     emoji: "😊", next: 7,  color: "#22A97A" },
  { id: 5, label: "轻松秒杀",     emoji: "🔥", next: 14, color: "#1EA896" },
];

/* ═══════ 模式速查手册数据 ═══════ */

const CHEAT_SHEETS = {
  "two-pointers": {
    when: "有序数组查找配对、原地操作数组、链表快慢指针",
    signals: ["有序", "两数之和", "移除元素", "回文", "容器盛水"],
    template: `let l = 0, r = arr.length - 1;
while (l < r) {
  if (满足条件) return;
  if (需要更大) l++;
  else r--;
}`,
    complexity: "时间 O(n)，空间 O(1)",
    tips: "先排序再用双指针是常见组合；快慢指针可以检测环",
    related: ["sliding-window", "binary-search"],
  },
  "sliding-window": {
    when: "连续子数组/子串问题、固定或可变窗口大小",
    signals: ["最长子串", "最小覆盖", "连续子数组", "不重复", "至多K个"],
    template: `let l = 0;
for (let r = 0; r < n; r++) {
  // 扩展窗口: 加入 arr[r]
  while (窗口不合法) {
    // 收缩窗口: 移除 arr[l]
    l++;
  }
  // 更新答案
}`,
    complexity: "时间 O(n)，空间 O(k)",
    tips: "固定窗口用 if(r-l+1===k)；可变窗口用 while 收缩",
    related: ["two-pointers", "hash"],
  },
  "binary-search": {
    when: "有序数据中查找、搜索空间可二分、求最小/最大满足条件的值",
    signals: ["有序数组", "旋转排序", "第K小", "最小化最大值", "搜索插入位置"],
    template: `let lo = 左边界, hi = 右边界;
while (lo < hi) {
  const mid = (lo + hi) >> 1;
  if (check(mid)) hi = mid;
  else lo = mid + 1;
}
return lo;`,
    complexity: "时间 O(log n)，空间 O(1)",
    tips: "关键是确定 check 函数和边界；二分答案是高频变体",
    related: ["two-pointers"],
  },
  "bfs-dfs": {
    when: "树/图遍历、层序处理、连通性判断、最短路径",
    signals: ["层序遍历", "最短路径", "岛屿数量", "连通分量", "拓扑排序"],
    template: `// BFS
const queue = [起点];
while (queue.length) {
  const node = queue.shift();
  for (const next of 邻居) {
    if (!visited.has(next)) {
      visited.add(next);
      queue.push(next);
    }
  }
}`,
    complexity: "时间 O(V+E)，空间 O(V)",
    tips: "无权图最短路用 BFS；回溯/路径搜索用 DFS；记得标记已访问",
    related: ["tree", "graph", "backtrack"],
  },
  "dp": {
    when: "最优子结构 + 重叠子问题、计数方案数、序列问题",
    signals: ["最长", "最少", "方案数", "能否达到", "子序列", "背包"],
    template: `// 1. 定义状态: dp[i] = ...
// 2. 状态转移: dp[i] = f(dp[i-1], ...)
// 3. 初始化: dp[0] = ...
// 4. 遍历顺序
for (let i = 1; i <= n; i++) {
  dp[i] = Math.min(dp[i-1]+1, ...);
}`,
    complexity: "时间 O(n²) 或 O(n·k)，空间可滚动优化",
    tips: "先画状态转移方程再写代码；空间优化用滚动数组",
    related: ["greedy", "backtrack"],
  },
  "greedy": {
    when: "局部最优能推出全局最优、区间调度、跳跃问题",
    signals: ["最少数量", "区间覆盖", "跳跃游戏", "分配问题", "任务调度"],
    template: `// 排序后贪心选择
items.sort(贪心排序规则);
let result = 0;
for (const item of items) {
  if (可以选择) {
    选择 item;
    result++;
  }
}`,
    complexity: "时间 O(n log n)（排序），空间 O(1)",
    tips: "先证明贪心正确性；如果不确定，考虑用 DP",
    related: ["dp"],
  },
  "stack-queue": {
    when: "括号匹配、表达式求值、下一个更大元素、滑动窗口最值",
    signals: ["有效括号", "计算器", "下一个更大", "每日温度", "柱状图面积"],
    template: `const stack = [];
for (let i = 0; i < n; i++) {
  while (stack.length && 栈顶不满足) {
    const top = stack.pop();
    // 处理 top
  }
  stack.push(i);
}`,
    complexity: "时间 O(n)，空间 O(n)",
    tips: "单调栈存下标比存值更灵活；双端队列可处理滑动窗口",
    related: ["monotonic-stack"],
  },
  "hash": {
    when: "快速查找、去重、计数、映射关系",
    signals: ["两数之和", "字母异位词", "最长无重复", "频率统计", "子数组和"],
    template: `const map = new Map();
for (const x of arr) {
  if (map.has(目标)) {
    // 找到配对
  }
  map.set(key, value);
}`,
    complexity: "时间 O(n)，空间 O(n)",
    tips: "前缀和 + 哈希表是求子数组和的经典搭配",
    related: ["two-pointers", "sliding-window"],
  },
  "tree": {
    when: "树的遍历、构造、路径、公共祖先",
    signals: ["前/中/后序遍历", "最近公共祖先", "路径和", "序列化", "平衡判断"],
    template: `function dfs(node) {
  if (!node) return 基准值;
  const left = dfs(node.left);
  const right = dfs(node.right);
  // 当前节点处理
  return 合并(left, right);
}`,
    complexity: "时间 O(n)，空间 O(h) 递归栈",
    tips: "大部分树题用后序遍历（先处理子树再处理当前）",
    related: ["bfs-dfs", "backtrack"],
  },
  "graph": {
    when: "拓扑排序、最短路径、连通性、二分图",
    signals: ["课程表", "网络延迟", "冗余连接", "单词接龙", "二分图"],
    template: `// 拓扑排序 (BFS)
const indeg = new Array(n).fill(0);
// 建图并统计入度
const queue = indeg筛选入度为0的;
while (queue.length) {
  const u = queue.shift();
  for (const v of graph[u]) {
    if (--indeg[v] === 0) queue.push(v);
  }
}`,
    complexity: "时间 O(V+E)，空间 O(V+E)",
    tips: "有向无环图→拓扑排序；带权最短路→Dijkstra",
    related: ["bfs-dfs", "union-find"],
  },
  "linked-list": {
    when: "链表操作、合并、反转、环检测",
    signals: ["反转链表", "合并排序", "环检测", "删除节点", "相交链表"],
    template: `// 反转链表
let prev = null, curr = head;
while (curr) {
  const next = curr.next;
  curr.next = prev;
  prev = curr;
  curr = next;
}
return prev;`,
    complexity: "时间 O(n)，空间 O(1)",
    tips: "哨兵节点简化边界处理；快慢指针找中点",
    related: ["two-pointers"],
  },
  "backtrack": {
    when: "排列组合、子集枚举、N皇后、数独等搜索问题",
    signals: ["所有组合", "全排列", "子集", "路径总和", "单词搜索"],
    template: `function bt(path, start) {
  if (满足条件) { result.push([...path]); return; }
  for (let i = start; i < n; i++) {
    if (剪枝条件) continue;
    path.push(choices[i]);
    bt(path, i + 1); // 或 i（可重复）
    path.pop();
  }
}`,
    complexity: "时间 O(2ⁿ) 或 O(n!)，空间 O(n)",
    tips: "排列用 visited 数组，组合用 start 参数避免重复",
    related: ["bfs-dfs", "dp"],
  },
  "monotonic-stack": {
    when: "下一个更大/更小元素、直方图面积、接雨水",
    signals: ["下一个更大", "每日温度", "柱状图最大矩形", "接雨水", "股票跨度"],
    template: `const stack = []; // 递减栈
const result = new Array(n).fill(-1);
for (let i = 0; i < n; i++) {
  while (stack.length && arr[stack.at(-1)] < arr[i]) {
    result[stack.pop()] = arr[i];
  }
  stack.push(i);
}`,
    complexity: "时间 O(n)，空间 O(n)",
    tips: "找更大用递减栈，找更小用递增栈；存下标更通用",
    related: ["stack-queue"],
  },
  "union-find": {
    when: "动态连通性、集合合并、判断环",
    signals: ["连通分量", "冗余连接", "朋友圈", "等式方程", "最小生成树"],
    template: `const parent = Array.from({length:n}, (_,i)=>i);
const rank = new Array(n).fill(0);
function find(x) {
  if (parent[x] !== x) parent[x] = find(parent[x]);
  return parent[x];
}
function union(x, y) {
  const px = find(x), py = find(y);
  if (px === py) return false;
  if (rank[px] < rank[py]) parent[px] = py;
  else if (rank[px] > rank[py]) parent[py] = px;
  else { parent[py] = px; rank[px]++; }
  return true;
}`,
    complexity: "时间 近似 O(α(n))，空间 O(n)",
    tips: "路径压缩 + 按秩合并是标配优化",
    related: ["graph"],
  },
  "trie": {
    when: "字符串前缀匹配、字典查找、自动补全",
    signals: ["前缀匹配", "单词搜索", "自动补全", "最长公共前缀", "回文对"],
    template: `class TrieNode {
  children = {}; isEnd = false;
}
function insert(word) {
  let node = root;
  for (const c of word) {
    if (!node.children[c]) node.children[c] = new TrieNode();
    node = node.children[c];
  }
  node.isEnd = true;
}`,
    complexity: "时间 O(L) 每次操作，空间 O(Σ·L)",
    tips: "搭配 DFS 可以做复杂的字符串搜索",
    related: ["bfs-dfs", "backtrack"],
  },
  "bit": {
    when: "状态压缩、奇偶判断、位操作技巧",
    signals: ["只出现一次", "汉明距离", "2的幂", "子集枚举", "状态压缩"],
    template: `// 常用技巧
n & (n-1)   // 去掉最低位的1
n & (-n)    // 取最低位的1
n >> k & 1  // 取第k位
n ^ n === 0 // 异或自身为0`,
    complexity: "时间 O(1) 或 O(log n)，空间 O(1)",
    tips: "异或 XOR 是找唯一数的利器；状态压缩 DP 用位运算表示集合",
    related: ["dp"],
  },
};

/* ═══════════════════════ 工具函数 ═══════════════════════ */

const getToday = () => new Date().toISOString().slice(0, 10);
const daysDiff = (a, b) => { const x = new Date(a), y = new Date(b); x.setHours(0,0,0,0); y.setHours(0,0,0,0); return Math.round((x - y) / 864e5); };
const fmtDate = (iso) => { const d = new Date(iso); return `${d.getMonth()+1}月${d.getDate()}日`; };
const fmtWeekday = (iso) => ["日","一","二","三","四","五","六"][new Date(iso).getDay()];

function cl(min, max) { return `clamp(${min}px, ${((min + max) / 2 / 16 * 100 / 6).toFixed(1)}vw, ${max}px)`; }

/* ═══════════════════════ 导入导出 ═══════════════════════ */

function exportData(items) {
  const data = JSON.stringify(items, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leetcode-tracker-${getToday()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function validateImport(data) {
  if (!Array.isArray(data)) return { ok: false, msg: "文件格式错误：应为数组" };
  const errors = [];
  const valid = [];
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    if (!p.id || !p.title) { errors.push(`第 ${i + 1} 项缺少 id 或 title`); continue; }
    valid.push({
      id: String(p.id),
      number: p.number || "",
      title: p.title,
      pattern: p.pattern || "other",
      difficulty: p.difficulty || "medium",
      confidence: p.confidence || 3,
      notes: p.notes || "",
      addedAt: p.addedAt || getToday(),
      lastReview: p.lastReview || getToday(),
      nextReview: p.nextReview || getToday(),
      reviewCount: p.reviewCount || 1,
      history: Array.isArray(p.history) ? p.history : [{ date: getToday(), confidence: p.confidence || 3 }],
    });
  }
  return { ok: true, items: valid, errors };
}

/* ═══════════════════════ 样式 ═══════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg: #FAFBFE; --bg2: #F0F2F8; --sf: #FFFFFF; --sf2: #F6F7FB; --sf3: #EEF0F6;
  --bd: rgba(0,0,0,.10); --bd2: rgba(0,0,0,.18);
  --tx: #2D3142; --txd: #525A78; --txm: #7880A0;
  --ac: #6366F1; --ac2: #8B5CF6;
  --green: #22A97A; --orange: #D4A017; --red: #DC5656;
  --R: 16px; --Rs: 12px; --Rxs: 8px;
  --shadow: 0 1px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05);
  --shadow-up: 0 4px 20px rgba(0,0,0,.12);
  --mono: 'JetBrains Mono', monospace; --sans: 'Noto Sans SC', system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) { :root {
  --bg: #0F1117; --bg2: #1A1C28; --sf: #1E2030; --sf2: #252738; --sf3: #2E3046;
  --bd: rgba(255,255,255,.12); --bd2: rgba(255,255,255,.20);
  --tx: #E8EAF6; --txd: #8B95B8; --txm: #5D6580;
  --ac: #818CF8; --ac2: #A78BFA;
  --green: #5AD6A0; --orange: #E8B84A; --red: #E87070;
  --shadow: 0 1px 4px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.25);
  --shadow-up: 0 4px 20px rgba(0,0,0,.40);
}}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
body { background: var(--bg); color: var(--tx); font-family: var(--sans); line-height: 1.55; overflow-x: hidden; }
input, textarea, button { font-family: inherit; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 3px; }

.shell { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; }
.hdr { position: sticky; top: 0; z-index: 100; background: var(--sf); border-bottom: 1px solid var(--bd); box-shadow: var(--shadow); backdrop-filter: blur(12px); background: rgba(255,255,255,.85); }
@media (prefers-color-scheme: dark) { .hdr { background: rgba(30,32,48,.85); } }
.hdr-in { max-width: 860px; margin: 0 auto; width: 100%; padding: ${cl(12,18)} ${cl(16,28)}; }
.cnt { flex: 1; max-width: 860px; margin: 0 auto; width: 100%; padding: ${cl(14,22)} ${cl(16,28)} 80px; }
.sg { display: grid; grid-template-columns: repeat(4,1fr); gap: ${cl(8,12)}; margin-bottom: ${cl(14,20)}; }
@media (max-width: 560px) { .sg { grid-template-columns: repeat(2,1fr); } }
.pg { display: grid; gap: ${cl(8,10)}; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); }
.card { background: var(--sf); border: 1px solid var(--bd); border-radius: var(--R); box-shadow: var(--shadow); transition: border-color .2s, box-shadow .25s; }
.card:hover { border-color: var(--bd2); box-shadow: var(--shadow-up); }
.btn { border: none; border-radius: var(--Rs); cursor: pointer; font-weight: 600; font-size: 13px; padding: ${cl(7,9)} ${cl(12,18)}; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; }
.btn:active { transform: scale(.97); }
.btn-pri { background: linear-gradient(135deg, var(--ac), var(--ac2)); color: #fff; }
.btn-pri:hover { filter: brightness(1.1); box-shadow: 0 4px 14px rgba(99,102,241,.25); }
.btn-soft { background: var(--sf2); color: var(--txd); border: 1px solid var(--bd); }
.btn-soft:hover { background: var(--sf3); color: var(--tx); border-color: var(--bd2); }
.btn-red { background: var(--red); color: #fff; }
.btn-sm { padding: 5px 10px; font-size: 12px; border-radius: var(--Rxs); }
.tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; background: var(--sf2); border: 1px solid var(--bd); white-space: nowrap; transition: all .15s; }
.tag-btn { cursor: pointer; }
.tag-btn:hover { background: var(--sf3); border-color: var(--bd2); }
.tag-on { color: #fff !important; border-color: transparent !important; }
.tabs { display: flex; gap: 2px; background: var(--sf2); border-radius: var(--Rs); padding: 3px; border: 1px solid var(--bd); }
.tab { flex: 1; padding: ${cl(6,8)} ${cl(4,10)}; border-radius: 10px; border: none; background: transparent; color: var(--txm); font-size: ${cl(11,13)}; font-weight: 500; cursor: pointer; transition: all .2s; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 4px; }
.tab:hover { color: var(--txd); background: var(--sf); }
.tab-on { background: var(--ac) !important; color: #fff !important; }
.badge { min-width: 18px; height: 18px; border-radius: 9px; background: var(--red); color: #fff; font-size: 10px; font-weight: 700; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; }
.tab-on .badge { background: rgba(255,255,255,.3); }
.ipt { width: 100%; padding: 10px 14px; border-radius: var(--Rs); border: 1px solid var(--bd); background: var(--bg); color: var(--tx); font-size: 14px; transition: border-color .2s, box-shadow .2s; line-height: 1.5; }
.ipt:focus { outline: none; border-color: var(--ac); box-shadow: 0 0 0 3px rgba(126,148,186,.12); }
.ipt::placeholder { color: var(--txm); }
.cb { flex: 1; min-width: 0; padding: ${cl(8,12)} 4px; border-radius: var(--Rs); border: 2px solid var(--bd); background: var(--sf); cursor: pointer; transition: all .2s; text-align: center; }
.cb:hover { border-color: var(--ac); }
.cb-on { border-color: var(--ac); background: rgba(126,148,186,.08); }
.pt { height: 5px; background: var(--bg2); border-radius: 3px; overflow: hidden; }
.pf { height: 100%; border-radius: 3px; transition: width .6s cubic-bezier(.22,1,.36,1); }
.ov { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,.3); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.md { background: var(--sf); border: 1px solid var(--bd); border-radius: var(--R); width: 100%; max-width: 520px; max-height: 88vh; max-height: 88dvh; overflow-y: auto; padding: ${cl(18,26)}; box-shadow: var(--shadow-up); }
.fu { animation: fu .3s ease-out both; }
@keyframes fu { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.ps { animation: ps 2.5s ease-in-out infinite; }
@keyframes ps { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
@media (max-width: 480px) { .hx { display: none !important; } }

/* 代码块 */
.code-block { font-family: var(--mono); font-size: 12px; line-height: 1.6; padding: 14px 16px; background: var(--bg); border: 1px solid var(--bd); border-radius: var(--Rs); overflow-x: auto; white-space: pre; color: var(--tx); }

/* Toast */
.toast-wrap { position: fixed; top: 16px; right: 16px; z-index: 2000; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.toast { pointer-events: auto; display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: var(--Rs); background: var(--sf); border: 1px solid var(--bd); box-shadow: var(--shadow-up); font-size: 13px; font-weight: 500; animation: toast-in .3s ease-out both; max-width: 320px; }
.toast-ok { border-left: 3px solid var(--green); }
.toast-err { border-left: 3px solid var(--red); }
@keyframes toast-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

/* 搜索和排序栏 */
.search-bar { position: relative; }
.search-bar input { padding-left: 34px; }
.search-bar svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--txm); pointer-events: none; }
.sort-drop { position: absolute; right: 0; top: calc(100% + 6px); z-index: 60; min-width: 160px; background: var(--sf); border: 1px solid var(--bd); border-radius: var(--Rs); box-shadow: var(--shadow-up); padding: 4px; }
.sort-drop-item { width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: none; background: none; border-radius: var(--Rxs); color: var(--txd); font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .15s; }
.sort-drop-item:hover { background: var(--sf2); color: var(--tx); }
.sort-drop-on { color: var(--ac) !important; background: rgba(99,102,241,.06); }
.sort-drop-on:hover { background: rgba(99,102,241,.10); }

/* 导入拖拽区 */
.drop-zone { border: 2px dashed var(--bd2); border-radius: var(--R); padding: 32px 16px; text-align: center; cursor: pointer; transition: all .2s; background: var(--bg); }
.drop-zone:hover { border-color: var(--ac); background: rgba(99,102,241,.04); }
.import-mode .cb { text-align: left; padding: 12px 16px; }
`;

/* ═══════════════════════ 主应用 ═══════════════════════ */

export default function App() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nextReview");
  const [toasts, setToasts] = useState([]);
  const [showImport, setShowImport] = useState(false);

  const toast = useCallback((msg, ok = true) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, ok }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    db.load().then(d => { setItems(d); setLoaded(true); }).catch(() => { toast("数据加载失败，使用本地缓存", false); setLoaded(true); });
  }, []);
  useEffect(() => {
    if (!loaded) return;
    db.save(items).catch(() => toast("云端保存失败，已保存到本地", false));
  }, [items, loaded]);

  const t = getToday();
  const due = useMemo(() => items.filter(p => p.nextReview <= t), [items, t]);
  const mast = useMemo(() => items.filter(p => p.confidence >= 4).length, [items]);
  const patStats = useMemo(() =>
    PATTERNS.map(pat => {
      const arr = items.filter(p => p.pattern === pat.id);
      return { ...pat, total: arr.length, mastered: arr.filter(p => p.confidence >= 4).length, due: arr.filter(p => p.nextReview <= t).length };
    }).filter(p => p.total > 0)
  , [items, t]);

  function addItem(data) {
    const nd = new Date(); nd.setDate(nd.getDate() + (CONFIDENCE.find(c => c.id === data.confidence)?.next || 1));
    setItems(prev => [{ id: Date.now().toString(), ...data, addedAt: t, lastReview: t, nextReview: nd.toISOString().slice(0, 10), reviewCount: 1, history: [{ date: t, confidence: data.confidence }] }, ...prev]);
    setModal(null);
    toast("题目已添加");
  }

  function reviewItem(pid, confidence) {
    const nd = new Date(); nd.setDate(nd.getDate() + (CONFIDENCE.find(c => c.id === confidence)?.next || 1));
    setItems(prev => prev.map(p => p.id === pid ? { ...p, confidence, lastReview: t, nextReview: nd.toISOString().slice(0, 10), reviewCount: p.reviewCount + 1, history: [...p.history, { date: t, confidence }] } : p));
    setModal(null);
    toast("复习已记录");
  }

  const filtered = useMemo(() => {
    let base = filter === "all" ? items : items.filter(p => p.pattern === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      base = base.filter(p => (p.title || "").toLowerCase().includes(q) || (p.number || "").includes(q));
    }
    const sorters = {
      nextReview: (a, b) => a.nextReview.localeCompare(b.nextReview),
      addedAt: (a, b) => b.addedAt.localeCompare(a.addedAt),
      difficulty: (a, b) => { const o = { easy: 0, medium: 1, hard: 2 }; return (o[a.difficulty] ?? 1) - (o[b.difficulty] ?? 1); },
      confidence: (a, b) => a.confidence - b.confidence,
      number: (a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0),
    };
    return [...base].sort(sorters[sortBy] || sorters.nextReview);
  }, [items, filter, search, sortBy]);

  function handleImport(validItems, mode) {
    if (mode === "replace") {
      setItems(validItems);
      toast(`已导入 ${validItems.length} 道题`);
    } else if (mode === "merge") {
      setItems(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        validItems.forEach(p => map.set(p.id, p));
        return [...map.values()];
      });
      toast(`已合并 ${validItems.length} 道题`);
    } else {
      setItems(prev => {
        const existing = new Set(prev.map(p => p.id));
        const newItems = validItems.filter(p => !existing.has(p.id));
        toast(`已添加 ${newItems.length} 道新题`);
        return [...prev, ...newItems];
      });
    }
    setShowImport(false);
  }

  if (!loaded) return (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><style>{CSS}</style><p style={{ color: "var(--txm)" }}>加载中…</p></div>);

  const TABS = [
    { id: "dashboard", label: "总览", Icon: LayoutGrid },
    { id: "due", label: "待复习", Icon: Bell, badge: due.length },
    { id: "all", label: "全部", Icon: List },
    { id: "cheatsheet", label: "速查", Icon: FileText },
    { id: "graph", label: "图谱", Icon: GitBranch },
    { id: "report", label: "复盘", Icon: CalendarDays },
  ];

  return (<>
    <style>{CSS}</style>
    <div className="shell">
      <header className="hdr">
        <div className="hdr-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, var(--ac), var(--ac2))", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: cl(15, 18), fontWeight: 700, letterSpacing: "-.3px", lineHeight: 1.2 }}>算法复习追踪</h1>
                <p style={{ fontSize: 11, color: "var(--txm)", marginTop: 1 }}>间隔重复 · 模式归类 · 掌握度追踪</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button className="btn btn-soft btn-sm" onClick={() => exportData(items)} title="导出数据"><Download size={14} /></button>
              <button className="btn btn-soft btn-sm" onClick={() => setShowImport(true)} title="导入数据"><Upload size={14} /></button>
              <button className="btn btn-pri" onClick={() => setModal({ type: "add" })}><Plus size={15} /><span className="hx">添加题目</span></button>
            </div>
          </div>
          <div className="tabs" style={{ overflowX: "auto" }}>
            {TABS.map(tb => (
              <button key={tb.id} className={`tab ${view === tb.id ? "tab-on" : ""}`} onClick={() => setView(tb.id)}>
                <tb.Icon size={13} /><span className="hx">{tb.label}</span>
                {!tb.label && tb.label}
                {tb.badge > 0 && <span className="badge">{tb.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="cnt">
        {view === "dashboard" && <DashboardView items={items} due={due} mast={mast} patStats={patStats} setView={setView} />}
        {view === "due" && <DueView due={due} setModal={setModal} />}
        {view === "all" && <AllView items={items} filtered={filtered} filter={filter} setFilter={setFilter} patStats={patStats} setModal={setModal} search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />}
        {view === "cheatsheet" && <CheatSheetView />}
        {view === "graph" && <GraphView items={items} />}
        {view === "report" && <ReportView items={items} />}
      </div>
    </div>

    {modal?.type === "add" && <AddM close={() => setModal(null)} add={addItem} items={items} />}
    {modal?.type === "review" && <RevM p={modal.data} close={() => setModal(null)} rev={c => reviewItem(modal.data.id, c)} />}
    {modal?.type === "edit" && <EditM p={modal.data} close={() => setModal(null)}
      save={d => { setItems(prev => prev.map(p => p.id === modal.data.id ? { ...p, ...d } : p)); setModal(null); toast("已保存"); }}
      del={() => { setItems(prev => prev.filter(p => p.id !== modal.data.id)); setModal(null); toast("已删除"); }}
    />}
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.ok ? "toast-ok" : "toast-err"}`}>
          {t.ok ? <Check size={14} color="var(--green)" /> : <AlertTriangle size={14} color="var(--red)" />}
          {t.msg}
        </div>
      ))}
    </div>
    {showImport && <ImportM close={() => setShowImport(false)} onImport={handleImport} />}
  </>);
}

/* ═══════════════════════ 页面视图 ═══════════════════════ */

function DashboardView({ items, due, mast, patStats, setView }) {
  return (<div className="fu">
    <div className="sg">
      {[
        { label: "总题数", val: items.length, color: "var(--ac)", Icon: Target },
        { label: "待复习", val: due.length, color: due.length > 0 ? "var(--orange)" : "var(--green)", Icon: Clock },
        { label: "已掌握", val: mast, color: "var(--green)", Icon: Trophy },
        { label: "掌握率", val: items.length > 0 ? Math.round(mast / items.length * 100) + "%" : "—", color: "var(--ac2)", Icon: Percent },
      ].map((s, i) => (
        <div key={i} className="card" style={{ padding: cl(12, 18), textAlign: "center" }}>
          <s.Icon size={15} color={s.color} style={{ marginBottom: 6, opacity: .6 }} />
          <div style={{ fontFamily: "var(--mono)", fontSize: cl(22, 28), fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
          <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 6 }}>{s.label}</div>
        </div>
      ))}
    </div>
    {due.length > 0 && (
      <div className="card" style={{ padding: cl(12, 18), marginBottom: cl(14, 20), display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", borderLeft: "3px solid var(--orange)" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
            <div className="ps" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }} />
            {due.length} 道题需要复习
          </div>
          <div style={{ fontSize: 12, color: "var(--txd)", marginTop: 4 }}>根据遗忘曲线，现在是最佳复习时间</div>
        </div>
        <button className="btn btn-pri" onClick={() => setView("due")}>开始复习 <ChevronRight size={14} /></button>
      </div>
    )}
    <Sec>模式掌握度</Sec>
    {patStats.length === 0 ? <Empty text="添加第一道题开始追踪吧" /> : (
      <div className="pg">
        {patStats.map(p => (
          <div key={p.id} className="card" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: p.color + "18", color: p.color, display: "grid", placeItems: "center" }}><p.Icon size={15} /></div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {p.due > 0 && <span className="tag" style={{ background: "var(--orange)" + "18", color: "var(--orange)", borderColor: "transparent", fontSize: 10 }}>{p.due} 待复习</span>}
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txd)" }}>{p.mastered}<span style={{ color: "var(--txm)" }}>/{p.total}</span></span>
              </div>
            </div>
            <div className="pt"><div className="pf" style={{ width: `${p.total > 0 ? (p.mastered / p.total * 100) : 0}%`, background: p.color }} /></div>
          </div>
        ))}
      </div>
    )}
  </div>);
}

function DueView({ due, setModal }) {
  return (<div className="fu">
    {due.length === 0 ? <Empty emoji="🎉" text="今天没有待复习的题目" sub="可以做新题，或等下次复习提醒" /> : (
      <div style={{ display: "grid", gap: cl(8, 12) }}>
        {due.map((p, i) => <div key={p.id} className="fu" style={{ animationDelay: `${i * 40}ms` }}><QCard p={p} onR={() => setModal({ type: "review", data: p })} onE={() => setModal({ type: "edit", data: p })} /></div>)}
      </div>
    )}
  </div>);
}

function AllView({ items, filtered, filter, setFilter, patStats, setModal, search, setSearch, sortBy, setSortBy }) {
  const [sortOpen, setSortOpen] = useState(false);
  const SORT_OPTS = [
    { id: "nextReview", label: "按复习日期", Icon: Clock },
    { id: "addedAt", label: "按添加时间", Icon: CalendarDays },
    { id: "number", label: "按题号", Icon: Hash },
    { id: "difficulty", label: "按难度", Icon: Flame },
    { id: "confidence", label: "按掌握度", Icon: Target },
  ];
  const curSort = SORT_OPTS.find(s => s.id === sortBy) || SORT_OPTS[0];
  return (<div className="fu">
    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
      <div className="search-bar" style={{ flex: 1, minWidth: 160 }}>
        <Search size={14} />
        <input className="ipt" style={{ paddingLeft: 34 }} placeholder="搜索题号或题目名称…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ position: "relative" }}>
        <button className="btn btn-soft" onClick={() => setSortOpen(v => !v)} style={{ gap: 5, fontSize: 12, padding: "0 14px", height: 41, borderRadius: "var(--Rs)" }}>
          <ArrowUpDown size={13} />
          <span className="hx">{curSort.label}</span>
          <ChevronDown size={12} style={{ transition: "transform .2s", transform: sortOpen ? "rotate(180deg)" : "none", opacity: .5 }} />
        </button>
        {sortOpen && <>
          <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setSortOpen(false)} />
          <div className="sort-drop fu">
            {SORT_OPTS.map(s => (
              <button key={s.id} className={`sort-drop-item ${sortBy === s.id ? "sort-drop-on" : ""}`} onClick={() => { setSortBy(s.id); setSortOpen(false); }}>
                <s.Icon size={13} />
                {s.label}
                {sortBy === s.id && <Check size={13} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
        </>}
      </div>
    </div>
    <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
      <button className={`tag tag-btn ${filter === "all" ? "tag-on" : ""}`} style={filter === "all" ? { background: "var(--ac)" } : {}} onClick={() => setFilter("all")}>全部 ({items.length})</button>
      {patStats.map(p => (
        <button key={p.id} className={`tag tag-btn ${filter === p.id ? "tag-on" : ""}`} style={filter === p.id ? { background: p.color } : {}} onClick={() => setFilter(p.id)}>
          <p.Icon size={10} /> {p.label} ({p.total})
        </button>
      ))}
    </div>
    {filtered.length === 0 ? <Empty text={search ? "没有匹配的题目" : "没有题目"} /> : (
      <div style={{ display: "grid", gap: cl(8, 12) }}>
        {filtered.map((p, i) => <div key={p.id} className="fu" style={{ animationDelay: `${i * 30}ms` }}><QCard p={p} onR={() => setModal({ type: "review", data: p })} onE={() => setModal({ type: "edit", data: p })} sd /></div>)}
      </div>
    )}
  </div>);
}

/* ═══════════════════════ 模式速查手册 ═══════════════════════ */

function CheatSheetView() {
  const [open, setOpen] = useState(null);
  return (<div className="fu">
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <FileText size={16} color="var(--ac)" />
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>模式速查手册</h2>
      </div>
      <p style={{ fontSize: 12, color: "var(--txd)" }}>每种算法模式的信号词、代码模板和核心技巧，做题时快速查阅</p>
    </div>
    <div style={{ display: "grid", gap: 8 }}>
      {PATTERNS.filter(p => CHEAT_SHEETS[p.id]).map(pat => {
        const cs = CHEAT_SHEETS[pat.id];
        const isOpen = open === pat.id;
        return (
          <div key={pat.id} className="card" style={{ overflow: "hidden" }}>
            <button onClick={() => setOpen(isOpen ? null : pat.id)} style={{
              width: "100%", padding: "14px 16px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
              color: "var(--tx)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: pat.color + "18", color: pat.color, display: "grid", placeItems: "center" }}>
                  <pat.Icon size={16} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{pat.label}</div>
                  <div style={{ fontSize: 11, color: "var(--txd)", marginTop: 2 }}>{cs.when}</div>
                </div>
              </div>
              <ChevronDown size={16} color="var(--txm)" style={{ transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {isOpen && (
              <div className="fu" style={{ padding: "0 16px 16px", display: "grid", gap: 14 }}>
                <div>
                  <SheetLabel icon={<Eye size={12} />}>信号词</SheetLabel>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {cs.signals.map((s, i) => <span key={i} className="tag" style={{ color: pat.color, borderColor: pat.color + "33" }}>{s}</span>)}
                  </div>
                </div>
                <div>
                  <SheetLabel icon={<Code size={12} />}>代码模板</SheetLabel>
                  <div className="code-block">{cs.template}</div>
                </div>
                <div>
                  <SheetLabel icon={<Zap size={12} />}>复杂度</SheetLabel>
                  <p style={{ fontSize: 13, fontFamily: "var(--mono)" }}>{cs.complexity}</p>
                </div>
                <div>
                  <SheetLabel icon={<Sparkles size={12} />}>核心技巧</SheetLabel>
                  <p style={{ fontSize: 13, color: "var(--txd)", lineHeight: 1.6 }}>{cs.tips}</p>
                </div>
                {cs.related.length > 0 && (
                  <div>
                    <SheetLabel icon={<GitBranch size={12} />}>关联模式</SheetLabel>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {cs.related.map(rid => {
                        const rp = PATTERNS.find(x => x.id === rid);
                        return rp ? <span key={rid} className="tag" style={{ color: rp.color, borderColor: rp.color + "33" }}><rp.Icon size={10} /> {rp.label}</span> : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>);
}

function SheetLabel({ icon, children }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--txm)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>{icon}{children}</div>);
}

/* ═══════════════════════ 题目关联图谱 ═══════════════════════ */

function GraphView({ items }) {
  const groups = useMemo(() => {
    const map = {};
    items.forEach(item => {
      if (!map[item.pattern]) map[item.pattern] = [];
      map[item.pattern].push(item);
    });
    return map;
  }, [items]);

  const patternKeys = Object.keys(groups);

  if (items.length === 0) return <div className="fu"><Empty text="添加题目后可以查看关联图谱" sub="题目会按算法模式自动分组，并展示模式间的关联关系" /></div>;

  return (<div className="fu">
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <GitBranch size={16} color="var(--ac)" />
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>题目关联图谱</h2>
      </div>
      <p style={{ fontSize: 12, color: "var(--txd)" }}>按模式分组，展示题目之间和模式之间的关联关系</p>
    </div>

    {/* 模式关联网络 */}
    <Sec>模式关联</Sec>
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {patternKeys.map(pid => {
          const pat = PATTERNS.find(x => x.id === pid);
          const cs = CHEAT_SHEETS[pid];
          const relatedInUse = (cs?.related || []).filter(r => groups[r]);
          return (
            <div key={pid} style={{ textAlign: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: "0 auto 6px",
                background: pat.color + "18", color: pat.color,
                display: "grid", placeItems: "center", border: `2px solid ${pat.color}44`,
              }}>
                <pat.Icon size={20} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{pat.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--txm)" }}>{groups[pid].length} 题</div>
              {relatedInUse.length > 0 && (
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 4 }}>
                  {relatedInUse.map(r => {
                    const rp = PATTERNS.find(x => x.id === r);
                    return <div key={r} style={{ width: 6, height: 6, borderRadius: 3, background: rp?.color || "var(--bd)" }} title={`关联: ${rp?.label}`} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* 分组题目列表 */}
    <Sec>按模式分组</Sec>
    <div style={{ display: "grid", gap: 10 }}>
      {patternKeys.map(pid => {
        const pat = PATTERNS.find(x => x.id === pid);
        const cs = CHEAT_SHEETS[pid];
        const problemList = groups[pid].sort((a, b) => {
          const da = DIFFICULTY.findIndex(d => d.id === a.difficulty);
          const db2 = DIFFICULTY.findIndex(d => d.id === b.difficulty);
          return da - db2;
        });
        const relatedPats = (cs?.related || []).filter(r => groups[r]);
        return (
          <div key={pid} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: pat.color + "18", color: pat.color, display: "grid", placeItems: "center" }}><pat.Icon size={14} /></div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{pat.label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--txm)" }}>{problemList.length} 题</span>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {problemList.map((item, idx) => {
                const diff = DIFFICULTY.find(d => d.id === item.difficulty);
                const conf = CONFIDENCE.find(c => c.id === item.confidence);
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--bg)", borderRadius: "var(--Rxs)" }}>
                    {item.number && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ac)", fontWeight: 600, minWidth: 32 }}>#{item.number}</span>}
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.title || "无标题"}</span>
                    <span style={{ fontSize: 11, color: diff?.color }}>{diff?.label}</span>
                    <span style={{ fontSize: 13 }}>{conf?.emoji}</span>
                    {idx < problemList.length - 1 && problemList[idx + 1] && (
                      <ArrowDown size={10} color="var(--txm)" style={{ opacity: 0.4 }} />
                    )}
                  </div>
                );
              })}
            </div>
            {relatedPats.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--bd)" }}>
                <span style={{ fontSize: 11, color: "var(--txm)", marginRight: 6 }}>关联模式：</span>
                {relatedPats.map(r => {
                  const rp = PATTERNS.find(x => x.id === r);
                  return <span key={r} className="tag" style={{ color: rp.color, borderColor: rp.color + "33", marginRight: 4 }}><rp.Icon size={10} /> {rp.label}</span>;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>);
}

/* ═══════════════════════ 每周复盘报告 ═══════════════════════ */

function ReportView({ items }) {
  const t = getToday();
  const todayDate = new Date(t);
  const dayOfWeek = todayDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartISO = weekStart.toISOString().slice(0, 10);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekStartISO = prevWeekStart.toISOString().slice(0, 10);

  // 本周复习记录
  const thisWeekReviews = [];
  const prevWeekReviews = [];
  items.forEach(item => {
    item.history.forEach(h => {
      if (h.date >= weekStartISO) thisWeekReviews.push({ ...h, item });
      else if (h.date >= prevWeekStartISO && h.date < weekStartISO) prevWeekReviews.push({ ...h, item });
    });
  });

  // 本周新增题目
  const thisWeekAdded = items.filter(p => p.addedAt >= weekStartISO);
  const prevWeekAdded = items.filter(p => p.addedAt >= prevWeekStartISO && p.addedAt < weekStartISO);

  // 掌握度变化
  const improvedThisWeek = [];
  const declinedThisWeek = [];
  items.forEach(item => {
    const weekHistory = item.history.filter(h => h.date >= weekStartISO);
    if (weekHistory.length >= 2) {
      const first = weekHistory[0].confidence;
      const last = weekHistory[weekHistory.length - 1].confidence;
      if (last > first) improvedThisWeek.push({ item, from: first, to: last });
      else if (last < first) declinedThisWeek.push({ item, from: first, to: last });
    }
  });

  // 每日活跃度（本周 7 天）
  const dailyActivity = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const count = thisWeekReviews.filter(r => r.date === iso).length;
    dailyActivity.push({ date: iso, day: ["一","二","三","四","五","六","日"][i], count, isToday: iso === t });
  }
  const maxDaily = Math.max(...dailyActivity.map(d => d.count), 1);

  // 模式分析
  const patternReviewCount = {};
  thisWeekReviews.forEach(r => {
    const pid = r.item.pattern;
    patternReviewCount[pid] = (patternReviewCount[pid] || 0) + 1;
  });
  const topPatterns = Object.entries(patternReviewCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 薄弱模式推荐
  const weakPatterns = useMemo(() => {
    return PATTERNS.map(pat => {
      const arr = items.filter(p => p.pattern === pat.id);
      if (arr.length === 0) return null;
      const avgConf = arr.reduce((s, p) => s + p.confidence, 0) / arr.length;
      const dueCount = arr.filter(p => p.nextReview <= t).length;
      return { ...pat, avgConf, total: arr.length, dueCount };
    }).filter(Boolean).sort((a, b) => a.avgConf - b.avgConf).slice(0, 3);
  }, [items, t]);

  const delta = (cur, prev) => {
    if (prev === 0) return cur > 0 ? { icon: ArrowUp, color: "var(--green)", text: `+${cur}` } : { icon: Minus, color: "var(--txm)", text: "持平" };
    const diff = cur - prev;
    if (diff > 0) return { icon: ArrowUp, color: "var(--green)", text: `+${diff}` };
    if (diff < 0) return { icon: ArrowDown, color: "var(--red)", text: `${diff}` };
    return { icon: Minus, color: "var(--txm)", text: "持平" };
  };

  const reviewDelta = delta(thisWeekReviews.length, prevWeekReviews.length);
  const addedDelta = delta(thisWeekAdded.length, prevWeekAdded.length);

  return (<div className="fu">
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CalendarDays size={16} color="var(--ac)" />
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>每周复盘报告</h2>
      </div>
      <p style={{ fontSize: 12, color: "var(--txd)" }}>
        {fmtDate(weekStartISO)} — {fmtDate(t)}（本周）
      </p>
    </div>

    {/* 核心数据 */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
      {[
        { label: "本周复习次数", val: thisWeekReviews.length, d: reviewDelta },
        { label: "本周新增题目", val: thisWeekAdded.length, d: addedDelta },
        { label: "掌握度提升", val: improvedThisWeek.length + " 题", d: { icon: TrendingUp, color: "var(--green)", text: "" } },
      ].map((s, i) => (
        <div key={i} className="card" style={{ padding: cl(12, 16) }}>
          <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 6 }}>{s.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: cl(20, 26), fontWeight: 700, color: "var(--tx)" }}>{s.val}</span>
            {s.d.text && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600, color: s.d.color }}>
                <s.d.icon size={11} /> {s.d.text}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* 每日活跃度 */}
    <Sec>每日活跃度</Sec>
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
        {dailyActivity.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: d.count > 0 ? "var(--tx)" : "var(--txm)" }}>{d.count || ""}</span>
            <div style={{
              width: "100%", maxWidth: 36, borderRadius: 6,
              height: `${Math.max(d.count / maxDaily * 56, d.count > 0 ? 8 : 3)}px`,
              background: d.isToday ? "var(--ac)" : d.count > 0 ? "var(--ac2)" + "66" : "var(--bg2)",
              transition: "height .4s ease",
            }} />
            <span style={{ fontSize: 11, fontWeight: d.isToday ? 700 : 400, color: d.isToday ? "var(--ac)" : "var(--txm)" }}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* 进步最大的题目 */}
    {improvedThisWeek.length > 0 && (<>
      <Sec>本周进步的题</Sec>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {improvedThisWeek.map(({ item, from, to }) => {
          const pat = PATTERNS.find(x => x.id === item.pattern);
          const fromC = CONFIDENCE.find(c => c.id === from);
          const toC = CONFIDENCE.find(c => c.id === to);
          return (
            <div key={item.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              {item.number && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ac)", fontWeight: 600 }}>#{item.number}</span>}
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.title}</span>
              <span style={{ fontSize: 12 }}>{fromC?.emoji}</span>
              <ArrowRight size={12} color="var(--green)" />
              <span style={{ fontSize: 12 }}>{toC?.emoji}</span>
            </div>
          );
        })}
      </div>
    </>)}

    {/* 薄弱模式推荐 */}
    <Sec>下周重点攻克</Sec>
    {weakPatterns.length === 0 ? <Empty text="需要更多数据来生成推荐" /> : (
      <div style={{ display: "grid", gap: 8 }}>
        {weakPatterns.map((wp, i) => (
          <div key={wp.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: wp.color + "18", color: wp.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <wp.Icon size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{wp.label}</div>
              <div style={{ fontSize: 11, color: "var(--txd)", marginTop: 2 }}>
                平均掌握度 {wp.avgConf.toFixed(1)}/5 · {wp.total} 题 · {wp.dueCount} 题待复习
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "var(--orange)" + "18",
              color: "var(--orange)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
            }}>
              {i + 1}
            </div>
          </div>
        ))}
      </div>
    )}

    {items.length === 0 && <Empty text="还没有数据，添加题目后复盘报告会自动生成" />}
  </div>);
}

/* ═══════════════════════ 题目卡片 ═══════════════════════ */

function QCard({ p, onR, onE, sd }) {
  const pat = PATTERNS.find(x => x.id === p.pattern);
  const diff = DIFFICULTY.find(x => x.id === p.difficulty);
  const conf = CONFIDENCE.find(x => x.id === p.confidence);
  const t = getToday(), isDue = p.nextReview <= t, dd = daysDiff(p.nextReview, t);
  return (
    <div className="card" style={{ padding: cl(12, 16) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {p.number && <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--ac)", background: "var(--ac)" + "14", padding: "1px 7px", borderRadius: 6 }}>#{p.number}</span>}
            <span style={{ fontSize: 14, fontWeight: 600 }}>{p.title || "无标题"}</span>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            {pat && <span className="tag" style={{ color: pat.color, borderColor: pat.color + "33" }}><pat.Icon size={11} /> {pat.label}</span>}
            {diff && <span className="tag" style={{ color: diff.color, borderColor: diff.color + "33" }}>{diff.label}</span>}
            <span className="tag">{conf?.emoji} {conf?.label}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--txm)" }}>复习{p.reviewCount}次</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <button className="btn btn-soft btn-sm" onClick={onE}><Pencil size={12} /></button>
          {isDue ? <button className="btn btn-pri btn-sm" onClick={onR}><Flame size={12} /> 复习</button> : <button className="btn btn-soft btn-sm" onClick={onR}>提前复习</button>}
        </div>
      </div>
      {p.notes && <div style={{ fontSize: 12, color: "var(--txd)", marginTop: 8, padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--Rs)", lineHeight: 1.65, borderLeft: `2px solid ${pat?.color || "var(--bd)"}` }}>{p.notes}</div>}
      {sd && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--txm)", marginTop: 8 }}>
        {isDue ? <span style={{ color: "var(--orange)" }}>● 已到复习时间</span> : <span>○ {dd}天后复习 · {p.nextReview}</span>}
      </div>}
    </div>
  );
}

/* ═══════════════════════ 弹窗组件 ═══════════════════════ */

function Mdl({ children, close, title }) {
  return (<div className="ov" onClick={e => e.target === e.currentTarget && close()}>
    <div className="md fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2>
        <button onClick={close} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--bd)", background: "var(--sf2)", color: "var(--txd)", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={14} /></button>
      </div>
      {children}
    </div>
  </div>);
}

function AddM({ close, add, items }) {
  const [f, sF] = useState({ number: "", title: "", pattern: "", difficulty: "medium", confidence: 3, notes: "" });
  const [err, setErr] = useState("");
  const u = (k, v) => { sF(p => ({ ...p, [k]: v })); setErr(""); };
  const submit = () => {
    const num = f.number.trim();
    const title = f.title.trim();
    if (!title) { setErr("请输入题目名称"); return; }
    if (num && items.some(p => p.number === num)) { setErr(`题号 #${num} 已存在`); return; }
    add({ ...f, number: num, title, pattern: f.pattern || "other" });
  };
  return (<Mdl title="添加题目" close={close}>
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
        <FG label="题号"><input className="ipt" style={{ fontFamily: "var(--mono)" }} placeholder="1" value={f.number} onChange={e => u("number", e.target.value)} /></FG>
        <FG label="题目名称"><input className="ipt" placeholder="两数之和" value={f.title} onChange={e => u("title", e.target.value)} /></FG>
      </div>
      {err && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 500, padding: "6px 10px", background: "var(--red)" + "10", borderRadius: "var(--Rxs)" }}>{err}</div>}
      <FG label="算法模式"><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {PATTERNS.map(p => <button key={p.id} className={`tag tag-btn ${f.pattern === p.id ? "tag-on" : ""}`} style={f.pattern === p.id ? { background: p.color } : {}} onClick={() => u("pattern", p.id)}><p.Icon size={11} /> {p.label}</button>)}
      </div></FG>
      <FG label="难度"><div style={{ display: "flex", gap: 8 }}>
        {DIFFICULTY.map(d => <button key={d.id} className={`tag tag-btn ${f.difficulty === d.id ? "tag-on" : ""}`} style={f.difficulty === d.id ? { background: d.color } : {}} onClick={() => u("difficulty", d.id)}>{d.label}</button>)}
      </div></FG>
      <FG label="掌握程度（决定下次复习间隔）"><div style={{ display: "flex", gap: 6 }}>
        {CONFIDENCE.map(c => (
          <button key={c.id} className={`cb ${f.confidence === c.id ? "cb-on" : ""}`} onClick={() => u("confidence", c.id)}>
            <div style={{ fontSize: cl(18, 22) }}>{c.emoji}</div>
            <div style={{ fontSize: cl(10, 11), marginTop: 4, color: "var(--txd)" }}>{c.label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 2, color: c.color }}>{c.next}天后</div>
          </button>
        ))}
      </div></FG>
      <FG label="解题笔记（核心思路、易错点）"><textarea className="ipt" style={{ minHeight: 64, resize: "vertical" }} placeholder="例如：关键是用哈希表存差值…" value={f.notes} onChange={e => u("notes", e.target.value)} /></FG>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn-soft" onClick={close}>取消</button>
        <button className="btn btn-pri" onClick={submit}><Plus size={14} /> 添加并追踪</button>
      </div>
    </div>
  </Mdl>);
}

function RevM({ p, close, rev }) {
  const pat = PATTERNS.find(x => x.id === p.pattern); const diff = DIFFICULTY.find(x => x.id === p.difficulty);
  return (<Mdl title="复习评估" close={close}>
    <div style={{ padding: cl(12, 16), background: "var(--bg)", borderRadius: "var(--Rs)", border: "1px solid var(--bd)", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {p.number && <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--ac)" }}>#{p.number}</span>}
        <span style={{ fontSize: 15, fontWeight: 700 }}>{p.title}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {pat && <span className="tag" style={{ color: pat.color, borderColor: pat.color + "33" }}><pat.Icon size={11} /> {pat.label}</span>}
        {diff && <span className="tag" style={{ color: diff.color, borderColor: diff.color + "33" }}>{diff.label}</span>}
      </div>
      {p.notes && <div style={{ fontSize: 12, color: "var(--txd)", marginTop: 10, padding: "8px 12px", background: "var(--sf)", borderRadius: "var(--Rxs)", lineHeight: 1.6, borderLeft: `2px solid ${pat?.color || "var(--bd)"}` }}>{p.notes}</div>}
    </div>
    <p style={{ fontSize: 13, color: "var(--txd)", marginBottom: 12, fontWeight: 500 }}>这道题做完后，你觉得掌握如何？</p>
    <div style={{ display: "flex", gap: 6 }}>
      {CONFIDENCE.map(c => (
        <button key={c.id} className="cb" onClick={() => rev(c.id)}>
          <div style={{ fontSize: cl(20, 24) }}>{c.emoji}</div>
          <div style={{ fontSize: cl(10, 12), marginTop: 4, fontWeight: 500 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 2, color: c.color }}>{c.next}天后</div>
        </button>
      ))}
    </div>
    {p.history.length > 1 && (<div style={{ marginTop: 18 }}>
      <Sec small>历史趋势</Sec>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 44, marginTop: 8 }}>
        {p.history.slice(-12).map((h, i) => {
          const c = CONFIDENCE.find(x => x.id === h.confidence);
          return (<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", maxWidth: 20, height: `${h.confidence * 8}px`, background: c?.color || "var(--bd)", borderRadius: 4, transition: "height .4s ease" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--txm)" }}>{fmtDate(h.date)}</span>
          </div>);
        })}
      </div>
    </div>)}
  </Mdl>);
}

function EditM({ p, close, save, del }) {
  const [f, sF] = useState({ number: p.number || "", title: p.title || "", notes: p.notes || "" });
  const [cd, sCd] = useState(false);
  const u = (k, v) => sF(prev => ({ ...prev, [k]: v }));
  return (<Mdl title="编辑题目" close={close}>
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
        <FG label="题号"><input className="ipt" style={{ fontFamily: "var(--mono)" }} value={f.number} onChange={e => u("number", e.target.value)} /></FG>
        <FG label="题目名称"><input className="ipt" value={f.title} onChange={e => u("title", e.target.value)} /></FG>
      </div>
      <FG label="解题笔记"><textarea className="ipt" style={{ minHeight: 80, resize: "vertical" }} value={f.notes} onChange={e => u("notes", e.target.value)} /></FG>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {!cd ? <button className="btn btn-soft btn-sm" style={{ color: "var(--red)" }} onClick={() => sCd(true)}><Trash2 size={12} /> 删除</button> : <button className="btn btn-red btn-sm" onClick={del}>确认删除</button>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-soft" onClick={close}>取消</button>
          <button className="btn btn-pri" onClick={() => save(f)}><Save size={13} /> 保存</button>
        </div>
      </div>
    </div>
  </Mdl>);
}

function ImportM({ close, onImport }) {
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("merge");
  const [err, setErr] = useState("");
  const fileRef = { current: null };

  const handleFile = (file) => {
    if (!file) return;
    setErr("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target.result);
        const result = validateImport(raw);
        if (!result.ok) { setErr(result.msg); return; }
        setPreview(result);
      } catch { setErr("无法解析 JSON 文件"); }
    };
    reader.readAsText(file);
  };

  const MODES = [
    { id: "replace", label: "替换全部", desc: "清空现有数据，使用导入数据" },
    { id: "merge", label: "智能合并", desc: "相同ID用导入版本覆盖，其余保留" },
    { id: "addNew", label: "仅添加新题", desc: "保留现有数据，只添加ID不重复的题目" },
  ];

  return (<Mdl title="导入数据" close={close}>
    {!preview ? (
      <div style={{ display: "grid", gap: 16 }}>
        <label className="drop-zone" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <FileUp size={28} color="var(--txm)" style={{ opacity: .5 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)" }}>选择 JSON 文件</div>
            <div style={{ fontSize: 12, color: "var(--txm)", marginTop: 4 }}>支持从本应用导出的 .json 文件</div>
          </div>
          <input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
        </label>
        {err && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 500, padding: "6px 10px", background: "var(--red)" + "10", borderRadius: "var(--Rxs)" }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-soft" onClick={close}>取消</button>
        </div>
      </div>
    ) : (
      <div style={{ display: "grid", gap: 16 }}>
        <div className="card" style={{ padding: "12px 16px", borderLeft: "3px solid var(--green)" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>解析成功</div>
          <div style={{ fontSize: 12, color: "var(--txd)", marginTop: 4 }}>
            找到 <strong>{preview.items.length}</strong> 道有效题目
            {preview.errors.length > 0 && <span style={{ color: "var(--orange)" }}> · {preview.errors.length} 项跳过</span>}
          </div>
        </div>

        {preview.errors.length > 0 && (
          <div style={{ fontSize: 12, color: "var(--orange)", padding: "8px 12px", background: "var(--orange)" + "10", borderRadius: "var(--Rxs)", maxHeight: 80, overflowY: "auto" }}>
            {preview.errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        <FG label="导入模式">
          <div className="import-mode" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODES.map(m => (
              <button key={m.id} className={`cb ${mode === m.id ? "cb-on" : ""}`} style={{ textAlign: "left", padding: "12px 16px" }} onClick={() => setMode(m.id)}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "var(--txd)", marginTop: 2 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </FG>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-soft" onClick={() => { setPreview(null); setErr(""); }}>重新选择</button>
          <button className="btn btn-pri" onClick={() => onImport(preview.items, mode)}><Download size={14} /> 确认导入</button>
        </div>
      </div>
    )}
  </Mdl>);
}

/* ═══════════════════════ 通用组件 ═══════════════════════ */

function Sec({ children, small }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: small ? 0 : 12 }}>
    <h3 style={{ fontSize: small ? 11 : 13, fontWeight: 600, color: "var(--txd)", whiteSpace: "nowrap" }}>{children}</h3>
    <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
  </div>);
}
function FG({ label, children }) { return (<div><label style={{ display: "block", fontSize: 12, color: "var(--txm)", marginBottom: 6, fontWeight: 500 }}>{label}</label>{children}</div>); }
function Empty({ emoji = "📝", text, sub }) {
  return (<div className="card" style={{ textAlign: "center", padding: cl(28, 48), color: "var(--txm)" }}>
    <div style={{ fontSize: 28, marginBottom: 8, opacity: .5 }}>{emoji}</div>
    <p style={{ fontSize: 13, fontWeight: 500 }}>{text}</p>
    {sub && <p style={{ fontSize: 12, marginTop: 4 }}>{sub}</p>}
  </div>);
}
