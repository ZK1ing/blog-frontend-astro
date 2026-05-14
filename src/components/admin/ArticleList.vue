<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminGetArticles, deleteArticle } from '../../lib/api'
import type { ArticleListVO, ArticleStatus } from '../../lib/types'

const articles = ref<ArticleListVO[]>([])
const total = ref(0)
const pageNum = ref(1)
const statusFilter = ref<ArticleStatus | ''>('')
const loading = ref(false)

async function fetch() {
  loading.value = true
  try {
    const res = await adminGetArticles({ pageNum: pageNum.value, pageSize: 10, status: statusFilter.value || undefined })
    articles.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

onMounted(fetch)

async function handleDelete(id: number) {
  if (!confirm('确认删除？')) return
  try { await deleteArticle(id); fetch() } catch {}
}

const statusLabel: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', RECYCLED: '回收站' }
const statusTagClass: Record<string, string> = { DRAFT: 'bg-amber-50 text-amber-600', PUBLISHED: 'bg-emerald-50 text-emerald-600', RECYCLED: 'bg-gray-100 text-[#aeaeb2]' }

const filterTabs = [
  { value: '', label: '全部' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'RECYCLED', label: '回收站' },
]
</script>

<template>
  <div class="animate-fade-in-up max-w-6xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-1">文章管理</h2>
        <p class="text-[13px] text-[#aeaeb2]">共 {{ total }} 篇</p>
      </div>
      <a href="/admin/articles/new" class="btn-primary" style="font-size:14px;padding:7px 16px;">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        写文章
      </a>
    </div>

    <div class="flex items-center gap-1 mb-6">
      <button
        v-for="tab in filterTabs" :key="tab.value"
        @click="statusFilter = tab.value as any; pageNum = 1; fetch()"
        :class="['text-[12px] px-3 py-1.5 rounded-md transition-colors font-medium', statusFilter === tab.value ? 'bg-gray-200 text-[#1d1d1f]' : 'text-[#aeaeb2] hover:text-[#6e6e73] hover:bg-gray-100']"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-[13px]">
        <thead>
          <tr class="border-b border-gray-100 text-[#aeaeb2] text-[11px] uppercase tracking-wider">
            <th class="text-left px-5 py-3 font-medium">标题</th>
            <th class="text-left px-5 py-3 font-medium hidden md:table-cell">分类</th>
            <th class="text-left px-5 py-3 font-medium hidden md:table-cell">状态</th>
            <th class="text-left px-5 py-3 font-medium hidden lg:table-cell">日期</th>
            <th class="text-right px-5 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center py-16 text-[#aeaeb2]">加载中...</td></tr>
          <tr v-else-if="articles.length === 0"><td colspan="5" class="text-center py-16 text-[#aeaeb2]">暂无文章</td></tr>
          <tr v-for="a in articles" :key="a.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td class="px-5 py-3.5"><span class="text-[#1d1d1f] truncate max-w-xs block">{{ a.title }}</span></td>
            <td class="px-5 py-3.5 text-[#aeaeb2] hidden md:table-cell">{{ a.categoryName || '—' }}</td>
            <td class="px-5 py-3.5 hidden md:table-cell">
              <span :class="['tag', statusTagClass[a.status as string] || 'bg-gray-100 text-[#aeaeb2]']">{{ statusLabel[a.status as string] || a.status }}</span>
            </td>
            <td class="px-5 py-3.5 text-[#aeaeb2] hidden lg:table-cell">{{ new Date(a.createTime).toLocaleDateString('zh-CN') }}</td>
            <td class="px-5 py-3.5 text-right">
              <div class="flex gap-3 justify-end">
                <a :href="`/admin/articles/${a.id}`" class="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">编辑</a>
                <button @click="handleDelete(a.id)" class="text-[#aeaeb2] hover:text-red-500 transition-colors">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-center mt-6 gap-1">
      <button
        v-for="p in Math.ceil(total / 10)" :key="p"
        @click="pageNum = p; fetch()"
        :class="['w-8 h-8 rounded-md text-[12px] font-medium transition-colors', pageNum === p ? 'bg-gray-200 text-[#1d1d1f]' : 'text-[#aeaeb2] hover:text-[#6e6e73] hover:bg-gray-100']"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>
