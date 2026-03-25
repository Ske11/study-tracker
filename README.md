# ⚡ LeetCode 复习追踪器

基于间隔重复算法的 LeetCode 刷题复习工具。

## 功能

- 📊 按算法模式分类管理题目（17 种模式）
- 🔔 间隔重复提醒（根据掌握度自动安排 1-14 天后复习）
- 📝 每道题记录解题笔记和核心思路
- 📈 可视化掌握度进度
- 🌓 自动适配深色/浅色主题

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

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
4. 点 Deploy，完成

### 部署到 Netlify

```bash
npm run build
# 把 dist 文件夹拖到 https://app.netlify.com/drop
```

## 技术栈

- React 18
- Vite 6
- localStorage 持久化
- 纯 CSS（无依赖）
# study-tracker
