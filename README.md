# Blog Frontend — Astro

基于 **Astro 5 SSR** + **Vue 3** 的博客前端，设计风格对齐 [AstroPaper](https://github.com/satnaing/astro-paper)（4,610⭐）。数据层对接现有 Spring Boot REST API。

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Astro 5 | SSR 模式，`@astrojs/node` 适配器 |
| 交互 | Vue 3 | 管理端 SPA 交互组件，`client:load` 客户端渲染 |
| 样式 | Tailwind CSS v4 | `@tailwindcss/vite` 插件，无需 PostCSS |
| HTTP | `fetch()` | SSR → 绝对 URL，客户端 → 相对路径走 Vite proxy |
| 认证 | Cookie JWT | `access_token` + `refresh_token` 双端可读 |
| 渲染 | marked + highlight.js | 文章 Markdown → HTML |

## 目录结构

```
src/
├── styles/global.css              # Tailwind + AstroPaper 设计令牌 (190 行)
├── lib/
│   ├── api.ts                     # fetch() 封装 + 25 个 API 函数
│   ├── auth.ts                    # Cookie JWT 管理 + authState
│   └── types.ts                   # R<T>, Page, ArticleStatus, 所有 VO/DTO
├── layouts/
│   ├── BaseLayout.astro           # HTML shell, OG meta, favicon
│   ├── PublicLayout.astro         # Header + slot + Footer
│   └── AdminLayout.astro          # 侧边栏 + 顶栏 + slot
├── components/
│   ├── Header.astro               # 导航 + 主题切换
│   ├── Footer.astro               # 版权
│   ├── ArticleCard.astro          # 文章卡片
│   ├── TagPill.astro              # 标签胶囊
│   ├── Pagination.astro           # 分页（可复用组件）
│   ├── SearchForm.astro           # 搜索输入（可复用组件）
│   ├── CommentSection.vue         # 评论列表 + 发表
│   └── admin/
│       ├── Dashboard.vue          # 仪表盘
│       ├── ArticleList.vue        # 文章列表 + 筛选 + 分页
│       ├── ArticleEdit.vue        # 新建/编辑文章
│       ├── CategoryManager.vue    # 分类 CRUD
│       ├── TagManager.vue         # 标签 CRUD
│       ├── CommentList.vue        # 评论审核
│       └── FileUpload.vue         # 文件上传
└── pages/
    ├── index.astro                # 首页 SSR — 文章列表
    ├── articles/[id].astro        # 文章详情 SSR — Markdown 渲染
    ├── categories/[id].astro      # 分类列表 SSR
    ├── tags/
    │   ├── index.astro            # 标签云 SSR
    │   └── [id].astro             # 标签下文章 SSR
    ├── search.astro               # 搜索 SSR
    ├── login.astro                # 登录页
    └── admin/
        ├── index.astro            # 仪表盘壳 → Dashboard.vue
        ├── articles.astro         # 文章列表壳 → ArticleList.vue
        ├── articles/
        │   ├── new.astro          # 新建文章 → ArticleEdit.vue
        │   └── [id].astro         # 编辑文章 → ArticleEdit.vue
        ├── categories.astro       # 分类管理 → CategoryManager.vue
        ├── tags.astro             # 标签管理 → TagManager.vue
        ├── comments.astro         # 评论审核 → CommentList.vue
        ├── files.astro            # 文件上传 → FileUpload.vue
        └── settings.astro         # 设置页
```

## 架构

### SSR 数据流

```
Browser 请求 / 或 /articles/123
  → Astro Server (Node.js SSR)
    → fetch('http://localhost:8080/api/public/...')  ← 绝对 URL
    → Spring Boot 返回 JSON
    → .astro 模板渲染 HTML
    → 浏览器收到完整 HTML（SEO 友好）
```

### API 层双模 fetch

`src/lib/api.ts` 中的 `request()` 函数根据运行环境自动选择 URL 构造方式：

```typescript
const isSSR = typeof window === 'undefined'
const fullPath = isSSR
  ? `http://localhost:8080${url.pathname}${url.search}`  // SSR: 绝对 URL
  : `${url.pathname}${url.search}`                        // 浏览器: 相对路径 + Vite proxy
```

### 认证流程

```
登录 → POST /api/public/auth/login → 后端返回 JWT
  → auth.ts 写入 document.cookie (access_token + refresh_token)
  → 客户端 fetch 从 cookie 读取附加 Authorization: Bearer <token>
  → 刷新: POST /api/public/auth/refresh → 更新 cookie
  → 登出: POST /api/public/auth/logout → 清除 cookie
```

## 路由表

### 公共页面

| 路由 | 文件 | 渲染 | 数据 |
|---|---|---|---|
| `/` | `index.astro` | SSR | getArticles + getCategories + getTags |
| `/articles/:id` | `articles/[id].astro` | SSR | getArticleDetail + marked 渲染 |
| `/categories/:id` | `categories/[id].astro` | SSR | getArticles({categoryId}) |
| `/tags` | `tags/index.astro` | SSR | getTags |
| `/tags/:id` | `tags/[id].astro` | SSR | getArticles({tagId}) + getTags |
| `/search?q=&page=` | `search.astro` | SSR | getArticles({keyword}) |
| `/login` | `login.astro` | 客户端 | login() → redirect |

### 管理端

| 路由 | 文件 | Vue 组件 |
|---|---|---|
| `/admin` | `admin/index.astro` | Dashboard.vue |
| `/admin/articles` | `admin/articles.astro` | ArticleList.vue |
| `/admin/articles/new` | `admin/articles/new.astro` | ArticleEdit.vue |
| `/admin/articles/:id` | `admin/articles/[id].astro` | ArticleEdit.vue |
| `/admin/categories` | `admin/categories.astro` | CategoryManager.vue |
| `/admin/tags` | `admin/tags.astro` | TagManager.vue |
| `/admin/comments` | `admin/comments.astro` | CommentList.vue |
| `/admin/files` | `admin/files.astro` | FileUpload.vue |
| `/admin/settings` | `admin/settings.astro` | — |

## API 端点映射

### 认证 (`/api/public/auth`)

| 函数 | 方法 | 路径 |
|---|---|---|
| `loginApi` | POST | `/public/auth/login` |
| `logoutApi` | POST | `/public/auth/logout` |
| `refreshApi` | POST | `/public/auth/refresh` |

### 文章 (`/api`)

| 函数 | 方法 | 路径 | 权限 |
|---|---|---|---|
| `getArticles` | GET | `/public/articles` | 公开 |
| `getArticleDetail` | GET | `/public/articles/:id` | 公开 |
| `getHotArticles` | GET | `/public/articles/hot` | 公开 |
| `adminGetArticles` | GET | `/admin/articles/page` | 管理员 |
| `adminGetArticle` | GET | `/admin/articles/:id` | 管理员 |
| `createArticle` | POST | `/admin/articles` | 管理员 |
| `updateArticle` | PUT | `/admin/articles/:id` | 管理员 |
| `deleteArticle` | DELETE | `/admin/articles/:id` | 管理员 |

### 分类 (`/api`)

| 函数 | 方法 | 路径 | 权限 |
|---|---|---|---|
| `getCategories` | GET | `/public/categories` | 公开 |
| `adminCreateCategory` | POST | `/admin/categories` | 管理员 |
| `adminUpdateCategory` | PUT | `/admin/categories/:id` | 管理员 |
| `adminDeleteCategory` | DELETE | `/admin/categories/:id` | 管理员 |

### 标签 (`/api`)

| 函数 | 方法 | 路径 | 权限 |
|---|---|---|---|
| `getTags` | GET | `/public/tags` | 公开 |
| `adminCreateTag` | POST | `/admin/tags` | 管理员 |
| `adminUpdateTag` | PUT | `/admin/tags/:id` | 管理员 |
| `adminDeleteTag` | DELETE | `/admin/tags/:id` | 管理员 |

### 评论 (`/api`)

| 函数 | 方法 | 路径 | 权限 |
|---|---|---|---|
| `getComments` | GET | `/public/comments` | 公开 |
| `createComment` | POST | `/public/comments` | 公开 |
| `adminGetComments` | GET | `/admin/comments` | 管理员 |
| `adminUpdateCommentStatus` | PUT | `/admin/comments/:id/status` | 管理员 |
| `adminDeleteComment` | DELETE | `/admin/comments/:id` | 管理员 |

### 文件 (`/api`)

| 函数 | 方法 | 路径 | 权限 |
|---|---|---|---|
| `uploadFile` | POST | `/admin/files/upload?type=` | 管理员 |

## 设计令牌

基于 AstroPaper 配色体系，通过 CSS 变量实现亮/暗双模式：

| 变量 | 亮色模式 | 暗色模式 | 用途 |
|---|---|---|---|
| `--color-text` | `29 29 31` | `245 245 247` | 主文字 |
| `--color-text-secondary` | `110 110 115` | `174 174 178` | 次要文字 |
| `--color-text-tertiary` | `174 174 178` | `110 110 115` | 辅助文字 |
| `--color-bg` | `255 255 255` | `24 24 27` | 页面背景 |
| `--color-bg-secondary` | `245 245 247` | `42 42 46` | 次级背景 |
| `--color-border` | `229 229 231` | `63 63 70` | 边框 (hairline) |
| `--color-accent` | `0 102 204` | `0 102 204` | 主色 |
| `--color-card` | `255 255 255` | `42 42 46` | 卡片背景 |

切换方式：`<html class="dark">` 切换，状态持久化到 `localStorage.theme`。

## 本地开发

```bash
# 1. 启动后端（另一个终端）
cd blog-server
mvn spring-boot:run -pl blog-api

# 2. 安装依赖
cd blog-frontend-astro
npm install

# 3. 启动开发服务器
npm run dev
# → http://localhost:4321

# 4. 构建生产版本
npm run build
# → dist/ 目录
```

## 生产部署

```bash
npm run build
node dist/server/entry.mjs
# 单进程运行在 :4321
```

Vite proxy 仅 dev 模式生效。生产环境需在 Node 前面放 Nginx 反向代理 `/api` → `localhost:8080`：

```nginx
location /api/ {
    proxy_pass http://localhost:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 注意事项

1. **SSR fetch**：`api.ts` 自动检测 `window` 是否存在来决定用绝对 URL 还是相对 URL。SSR 场景直连 `localhost:8080`，不经过 Vite proxy。
2. **管理端认证**：管理端 Vue 组件通过 `client:load` 在浏览器侧运行，从 `document.cookie` 读 JWT。SSR 阶段不做认证校验（壳页面不处理前端数据）。
3. **主题切换**：`Header.astro` 中的 script 在页面加载时从 `localStorage` 恢复主题，避免闪烁。
4. **代理**：国内访问 GitHub 需配置 HTTP 代理（`git config --global http.proxy`）。
