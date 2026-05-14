<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTags, adminCreateTag, adminUpdateTag, adminDeleteTag } from '../../lib/api'
import type { TagVO, TagDTO } from '../../lib/types'

const tags = ref<TagVO[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editItem = ref<TagVO | null>(null)
const form = ref<TagDTO>({ name: '', slug: '' })

async function fetch() {
  loading.value = true
  try { const res = await getTags(); tags.value = res.data } finally { loading.value = false }
}

onMounted(fetch)

function openCreate() {
  editItem.value = null
  form.value = { name: '', slug: '' }
  showDialog.value = true
}

function openEdit(t: TagVO) {
  editItem.value = t
  form.value = { name: t.name, slug: t.slug }
  showDialog.value = true
}

async function handleSave() {
  try {
    if (editItem.value) await adminUpdateTag(editItem.value.id, form.value)
    else await adminCreateTag(form.value)
    showDialog.value = false
    fetch()
  } catch {}
}

async function handleDelete(id: number) {
  if (!confirm('确认删除此标签？')) return
  try { await adminDeleteTag(id); fetch() } catch {}
}
</script>

<template>
  <div class="animate-fade-in-up max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-1">标签管理</h2>
        <p class="text-[13px] text-[#aeaeb2]">共 {{ tags.length }} 个标签</p>
      </div>
      <button @click="openCreate" class="btn-primary" style="font-size:14px;padding:7px 16px;">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        新增标签
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-[#aeaeb2]">加载中...</div>

    <div v-else class="flex flex-wrap gap-2">
      <div v-for="t in tags" :key="t.id" class="card px-4 py-3 flex items-center gap-3 group">
        <span class="text-[14px] text-[#1d1d1f] font-medium">#{{ t.name }}</span>
        <span class="text-[11px] text-[#aeaeb2]">{{ t.articleCount }} 篇</span>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button @click="openEdit(t)" class="text-[11px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">编辑</button>
          <button @click="handleDelete(t.id)" class="text-[11px] text-[#aeaeb2] hover:text-red-500 transition-colors">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="showDialog = false">
      <div class="card p-6 w-full max-w-[400px] mx-4 bg-white">
        <h3 class="text-[17px] font-semibold text-[#1d1d1f] mb-5">{{ editItem ? '编辑标签' : '新增标签' }}</h3>
        <div class="space-y-3">
          <input v-model="form.name" placeholder="名称" class="input-field" />
          <input v-model="form.slug" placeholder="Slug" class="input-field" />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showDialog = false" class="btn-secondary" style="font-size:14px;padding:7px 16px;">取消</button>
          <button @click="handleSave" class="btn-primary" style="font-size:14px;padding:7px 16px;">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
