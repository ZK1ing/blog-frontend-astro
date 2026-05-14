import type {
  R, Page,
  LoginDTO, LoginVO,
  ArticleListVO, ArticleDetailVO, ArticleDTO, ArticleQuery,
  CategoryVO, CategoryDTO,
  TagVO, TagDTO,
  CommentVO, AdminCommentVO, CommentDTO, CommentStatusDTO, CommentQuery,
  FileVO,
} from './types'

const BASE = '/api'

// 服务端从 Astro cookie 读 token，客户端从 document.cookie 读
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return m ? m[1] : null
}

async function request<T>(
  method: string,
  path: string,
  options?: { body?: unknown; params?: Record<string, unknown>; formData?: FormData },
): Promise<R<T>> {
  const url = new URL(BASE + path, 'http://localhost')
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    })
  }

  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let body: FormData | string | undefined
  if (options?.formData) {
    body = options.formData
  } else if (options?.body) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  const isSSR = typeof window === 'undefined'
  const fullPath = isSSR
    ? `http://localhost:8080${url.pathname}${url.search}`
    : `${url.pathname}${url.search}`
  const res = await fetch(fullPath, { method, headers, body })
  const json: R<T> = await res.json()

  if (!res.ok) {
    const msg = json.message || `请求失败 (${res.status})`
    throw new Error(msg)
  }
  if (json.code !== 200) {
    throw new Error(json.message || '业务错误')
  }

  return json
}

// ── Auth ──
export function loginApi(data: LoginDTO) {
  return request<LoginVO>('POST', '/public/auth/login', { body: data })
}
export function logoutApi() {
  return request<void>('POST', '/public/auth/logout')
}
export function refreshApi(refreshToken: string) {
  return request<LoginVO>('POST', '/public/auth/refresh', { body: { refreshToken } })
}

// ── Article ──
export function getArticles(params: ArticleQuery) {
  return request<Page<ArticleListVO>>('GET', '/public/articles', { params: params as Record<string, unknown> })
}
export function getArticleDetail(id: number) {
  return request<ArticleDetailVO>('GET', `/public/articles/${id}`)
}
export function getHotArticles() {
  return request<ArticleListVO[]>('GET', '/public/articles/hot')
}
export function adminGetArticles(params: ArticleQuery) {
  return request<Page<ArticleListVO>>('GET', '/admin/articles/page', { params: params as Record<string, unknown> })
}
export function adminGetArticle(id: number) {
  return request<ArticleDetailVO>('GET', `/admin/articles/${id}`)
}
export function createArticle(data: ArticleDTO) {
  return request<ArticleDetailVO>('POST', '/admin/articles', { body: data })
}
export function updateArticle(id: number, data: ArticleDTO) {
  return request<ArticleDetailVO>('PUT', `/admin/articles/${id}`, { body: data })
}
export function deleteArticle(id: number) {
  return request<void>('DELETE', `/admin/articles/${id}`)
}

// ── Category ──
export function getCategories() {
  return request<CategoryVO[]>('GET', '/public/categories')
}
export function adminCreateCategory(data: CategoryDTO) {
  return request<CategoryVO>('POST', '/admin/categories', { body: data })
}
export function adminUpdateCategory(id: number, data: CategoryDTO) {
  return request<CategoryVO>('PUT', `/admin/categories/${id}`, { body: data })
}
export function adminDeleteCategory(id: number) {
  return request<void>('DELETE', `/admin/categories/${id}`)
}

// ── Tag ──
export function getTags() {
  return request<TagVO[]>('GET', '/public/tags')
}
export function adminCreateTag(data: TagDTO) {
  return request<TagVO>('POST', '/admin/tags', { body: data })
}
export function adminUpdateTag(id: number, data: TagDTO) {
  return request<TagVO>('PUT', `/admin/tags/${id}`, { body: data })
}
export function adminDeleteTag(id: number) {
  return request<void>('DELETE', `/admin/tags/${id}`)
}

// ── Comment ──
export function getComments(params: CommentQuery) {
  return request<Page<CommentVO>>('GET', '/public/comments', { params: params as Record<string, unknown> })
}
export function createComment(data: CommentDTO) {
  return request<CommentVO>('POST', '/public/comments', { body: data })
}
export function adminGetComments(params: CommentQuery) {
  return request<Page<AdminCommentVO>>('GET', '/admin/comments', { params: params as Record<string, unknown> })
}
export function adminUpdateCommentStatus(id: number, data: CommentStatusDTO) {
  return request<void>('PUT', `/admin/comments/${id}/status`, { body: data })
}
export function adminDeleteComment(id: number) {
  return request<void>('DELETE', `/admin/comments/${id}`)
}

// ── File ──
export function uploadFile(file: File, type: 'IMAGE' | 'FILE' = 'IMAGE') {
  const fd = new FormData()
  fd.append('file', file)
  return request<FileVO>('POST', `/admin/files/upload?type=${type}`, { formData: fd })
}
