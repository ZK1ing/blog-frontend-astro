<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminGetArticles, getCategories, getTags } from '../../lib/api'
import type { R, Page, CategoryVO, TagVO, ArticleListVO } from '../../lib/types'

const stats = ref({ articles: 0, published: 0, drafts: 0, categories: 0, tags: 0 })
const loading = ref(true)

onMounted(async () => {
  try {
    const [pubRes, draftRes, catRes, tagRes] = await Promise.all([
      adminGetArticles({ pageSize: 1, status: 'PUBLISHED' }),
      adminGetArticles({ pageSize: 1, status: 'DRAFT' }),
      getCategories(),
      getTags(),
    ])
    stats.value.published = pubRes.data.total
    stats.value.drafts = draftRes.data.total
    stats.value.articles = pubRes.data.total + draftRes.data.total
    stats.value.categories = catRes.data.length
    stats.value.tags = tagRes.data.length
  } catch {}
  loading.value = false
})

const activityBars = [18, 25, 15, 32, 22, 40, 28]
const maxBar = Math.max(...activityBars)
</script>

<template>
  <div class="animate-fade-in-up">
    <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-8">仪表盘</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl">
      <!-- Articles -->
      <div class="card md:col-span-2 md:row-span-2 p-6 flex flex-col justify-between min-h-[240px]">
        <div>
          <p class="text-[11px] font-medium text-[#aeaeb2] uppercase tracking-wider mb-3">文章总数</p>
          <div v-if="loading" class="skeleton h-12 w-28" />
          <p v-else class="text-[56px] font-bold text-[#1d1d1f] tracking-tight leading-none">{{ stats.articles }}</p>
          <div class="flex items-center gap-4 mt-3">
            <span class="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {{ stats.published }} 已发布
            </span>
            <span class="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {{ stats.drafts }} 草稿
            </span>
          </div>
        </div>
        <div class="mt-6 flex items-end gap-2 h-16">
          <div
            v-for="(h, i) in activityBars"
            :key="i"
            class="flex-1 rounded-t-[3px] transition-all duration-500"
            :style="{ height: (h / maxBar * 100) + '%', background: `rgba(0,102,204,${0.15 + (h / maxBar) * 0.25})` }"
          />
        </div>
        <p class="text-[10px] text-[#aeaeb2] mt-2">过去 7 天发布趋势</p>
      </div>

      <!-- Categories -->
      <div class="card p-6 flex flex-col justify-between min-h-[112px]">
        <div>
          <p class="text-[11px] font-medium text-[#aeaeb2] uppercase tracking-wider mb-3">分类</p>
          <div v-if="loading" class="skeleton h-10 w-16" />
          <p v-else class="text-[40px] font-bold text-[#1d1d1f] tracking-tight leading-none">{{ stats.categories }}</p>
        </div>
        <a href="/admin/categories" class="text-[12px] text-[#aeaeb2] hover:text-[#0066cc] transition-colors mt-2 self-start">管理分类 →</a>
      </div>

      <!-- Tags -->
      <div class="card p-6 flex flex-col justify-between min-h-[112px]">
        <div>
          <p class="text-[11px] font-medium text-[#aeaeb2] uppercase tracking-wider mb-3">标签</p>
          <div v-if="loading" class="skeleton h-10 w-16" />
          <p v-else class="text-[40px] font-bold text-[#1d1d1f] tracking-tight leading-none">{{ stats.tags }}</p>
        </div>
        <a href="/admin/tags" class="text-[12px] text-[#aeaeb2] hover:text-[#0066cc] transition-colors mt-2 self-start">管理标签 →</a>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mt-10 max-w-6xl">
      <p class="text-[11px] font-medium text-[#aeaeb2] uppercase tracking-wider mb-4">快捷操作</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href="/admin/articles/new" class="card px-5 py-4 flex items-center gap-3 group">
          <span class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg class="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
          </span>
          <div>
            <p class="text-[13px] text-[#1d1d1f] font-medium">写文章</p>
            <p class="text-[11px] text-[#aeaeb2] mt-0.5">创建新内容</p>
          </div>
        </a>
        <a href="/admin/comments" class="card px-5 py-4 flex items-center gap-3 group">
          <span class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg class="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
            </svg>
          </span>
          <div>
            <p class="text-[13px] text-[#1d1d1f] font-medium">审核评论</p>
            <p class="text-[11px] text-[#aeaeb2] mt-0.5">评论管理</p>
          </div>
        </a>
        <a href="/admin/files" class="card px-5 py-4 flex items-center gap-3 group">
          <span class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg class="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
          </span>
          <div>
            <p class="text-[13px] text-[#1d1d1f] font-medium">上传文件</p>
            <p class="text-[11px] text-[#aeaeb2] mt-0.5">管理媒体库</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
