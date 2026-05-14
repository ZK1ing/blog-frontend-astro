<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminGetComments, adminUpdateCommentStatus, adminDeleteComment } from '../../lib/api'
import type { AdminCommentVO, CommentStatus } from '../../lib/types'

const comments = ref<AdminCommentVO[]>([])
const total = ref(0)
const pageNum = ref(1)
const statusFilter = ref<CommentStatus | ''>('PENDING')
const loading = ref(false)

async function fetch() {
  loading.value = true
  try {
    const res = await adminGetComments({ pageNum: pageNum.value, pageSize: 10, status: statusFilter.value || undefined })
    comments.value = res.data.records
    total.value = res.data.total
  } finally { loading.value = false }
}

onMounted(fetch)

async function handleStatus(id: number, status: CommentStatus) {
  try { await adminUpdateCommentStatus(id, { status }); fetch() } catch {}
}

async function handleDelete(id: number) {
  if (!confirm('确认删除此评论？')) return
  try { await adminDeleteComment(id); fetch() } catch {}
}

const statusLabel: Record<string, string> = { PENDING: '待审核', APPROVED: '已通过', SPAM: '垃圾' }
const statusTagClass: Record<string, string> = { PENDING: 'bg-amber-50 text-amber-600', APPROVED: 'bg-emerald-50 text-emerald-600', SPAM: 'bg-gray-100 text-[#aeaeb2]' }

const filterTabs = [
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'SPAM', label: '垃圾' },
]
</script>

<template>
  <div class="animate-fade-in-up max-w-4xl">
    <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-8">评论管理</h2>

    <div class="flex items-center gap-1 mb-6">
      <button
        v-for="tab in filterTabs" :key="tab.value"
        @click="statusFilter = tab.value as any; pageNum = 1; fetch()"
        :class="['text-[12px] px-3 py-1.5 rounded-md transition-colors font-medium', statusFilter === tab.value ? 'bg-gray-200 text-[#1d1d1f]' : 'text-[#aeaeb2] hover:text-[#6e6e73] hover:bg-gray-100']"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-if="loading" class="text-center py-16 text-[#aeaeb2]">加载中...</div>
      <div v-else-if="comments.length === 0" class="text-center py-16 text-[#aeaeb2]">暂无评论</div>

      <div v-for="c in comments" :key="c.id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-[14px] font-medium text-[#1d1d1f]">{{ c.author }}</span>
            <span class="text-[12px] text-[#aeaeb2]">{{ c.email }}</span>
            <span class="text-[11px] text-[#aeaeb2]">{{ new Date(c.createTime).toLocaleDateString('zh-CN') }}</span>
          </div>
          <span :class="['tag', statusTagClass[c.status]]">{{ statusLabel[c.status] }}</span>
        </div>

        <p class="text-[14px] text-[#6e6e73] mb-3 leading-relaxed">{{ c.content }}</p>
        <div class="text-[11px] text-[#aeaeb2] mb-4">文章：{{ c.articleTitle || `#${c.articleId}` }} · IP: {{ c.ip || '—' }}</div>

        <div class="flex gap-2">
          <button v-if="c.status === 'PENDING'" @click="handleStatus(c.id, 'APPROVED')" class="text-[11px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-md transition-colors">通过</button>
          <button v-if="c.status === 'PENDING'" @click="handleStatus(c.id, 'SPAM')" class="text-[11px] bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1 rounded-md transition-colors">垃圾</button>
          <button @click="handleDelete(c.id)" class="text-[11px] text-[#aeaeb2] hover:text-red-500 px-3 py-1 rounded-md transition-colors">删除</button>
        </div>

        <div v-if="c.children?.length" class="mt-4 ml-8 space-y-2 border-l-2 border-gray-100 pl-5">
          <div v-for="ch in c.children" :key="ch.id" class="text-[13px]">
            <span class="text-[#6e6e73] font-medium">{{ ch.author }}</span>
            <span class="text-[#aeaeb2] ml-2">{{ ch.content }}</span>
            <span class="text-[#aeaeb2] ml-2 text-[11px]">{{ new Date(ch.createTime).toLocaleDateString('zh-CN') }}</span>
          </div>
        </div>
      </div>
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
