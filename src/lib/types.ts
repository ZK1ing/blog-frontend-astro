/** 统一响应体 */
export interface R<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

/** MyBatisPlus 分页 */
export interface Page<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface PaginationParams {
  pageNum?: number
  pageSize?: number
}

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'RECYCLED'
export type CommentStatus = 'PENDING' | 'APPROVED' | 'SPAM'

// ── Auth ──
export interface LoginDTO {
  username: string
  password: string
}

export interface LoginVO {
  accessToken: string
  refreshToken: string
  userId: number
  username: string
  nickname: string
  avatar: string
}

// ── Article ──
export interface TagBriefVO {
  id: number
  name: string
}

export interface ArticleMetaVO {
  id: number
  title: string
  slug: string
}

export interface ArticleListVO {
  id: number
  title: string
  slug: string
  summary: string
  coverImage: string
  categoryId: number
  categoryName: string
  isTop: number
  viewCount: number
  status: ArticleStatus
  tags: string[]
  createTime: string
  updateTime: string
}

export interface ArticleDetailVO {
  id: number
  title: string
  slug: string
  contentMd: string
  contentHtml: string
  summary: string
  coverImage: string
  categoryId: number
  categoryName: string
  status: ArticleStatus
  allowComment: number
  isTop: number
  viewCount: number
  tags: TagBriefVO[]
  prev: ArticleMetaVO | null
  next: ArticleMetaVO | null
  createTime: string
  updateTime: string
}

export interface ArticleDTO {
  title: string
  slug?: string
  contentMd: string
  coverImage?: string
  categoryId?: number
  status?: ArticleStatus
  allowComment?: number
  isTop?: number
  tagIds?: number[]
}

export interface ArticleQuery extends PaginationParams {
  keyword?: string
  categoryId?: number
  tagId?: number
  status?: ArticleStatus
  orderBy?: string
}

// ── Category ──
export interface CategoryVO {
  id: number
  name: string
  slug: string
  parentId: number | null
  sortOrder: number
  children: CategoryVO[]
  articleCount: number
  createTime: string
}

export interface CategoryDTO {
  name: string
  slug: string
  parentId?: number
  sortOrder?: number
}

// ── Tag ──
export interface TagVO {
  id: number
  name: string
  slug: string
  articleCount: number
  createTime: string
}

export interface TagDTO {
  name: string
  slug: string
}

// ── Comment ──
export interface CommentVO {
  id: number
  articleId: number
  parentId: number | null
  replyToId: number | null
  replyToAuthor: string
  author: string
  avatarUrl: string
  content: string
  children: CommentVO[]
  createTime: string
}

export interface AdminCommentVO {
  id: number
  articleId: number
  articleTitle: string
  parentId: number | null
  replyToId: number | null
  author: string
  email: string
  website: string
  content: string
  status: CommentStatus
  ip: string
  userAgent: string
  children: AdminCommentVO[]
  createTime: string
}

export interface CommentDTO {
  articleId: number
  parentId?: number
  replyToId?: number
  content: string
  author: string
  email?: string
  website?: string
}

export interface CommentStatusDTO {
  status: CommentStatus
}

export interface CommentQuery extends PaginationParams {
  articleId?: number
  status?: CommentStatus
}

// ── File ──
export interface FileVO {
  url: string
  originalName: string
  size: number
}
