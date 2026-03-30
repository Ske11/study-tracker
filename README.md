# ⚡ LeetCode 复习追踪器

基于间隔重复算法的 LeetCode 刷题复习工具。

## 功能

- 📊 按算法模式分类管理题目（17 种模式）
- 🔔 间隔重复提醒（根据掌握度自动安排 1-14 天后复习）
- 📝 每道题记录解题笔记和核心思路
- 📈 可视化掌握度进度
- 🌓 自动适配深色/浅色主题
- ☁️ Supabase 云端数据存储（可选，默认 localStorage）

## 本地开发

```bash
npm install
npm run dev
```

## 配置 Supabase（可选）

不配置 Supabase 时，数据自动存储在浏览器 localStorage 中。

如需云端存储：

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `supabase/schema.sql`
3. 复制 `.env.example` 为 `.env`，填入你的项目 URL 和 anon key

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. 重启开发服务器

## 部署到 Vercel（推荐）

### 方式一：命令行部署

```bash
npm i -g vercel
vercel
```

### 方式二：GitHub + Vercel

1. 把这个项目推到 GitHub
2. 去 [vercel.com](https://vercel.com) 用 GitHub 登录
3. 点 "Import Project" → 选这个仓库
4. 在 Settings > Environment Variables 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
5. 点 Deploy，完成

### 部署到 Netlify

```bash
npm run build
# 把 dist 文件夹拖到 https://app.netlify.com/drop
```

## 技术栈

- React 18
- Vite 6
- Supabase（云端存储）/ localStorage（本地回退）
- 纯 CSS（无依赖）
