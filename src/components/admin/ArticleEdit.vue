<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminGetArticle, createArticle, updateArticle, getCategories, getTags, uploadFile } from '../../lib/api'
import type { ArticleDetailVO, ArticleDTO, CategoryVO, TagVO } from '../../lib/types'

const article = ref<ArticleDetailVO | null>(null)
const saving = ref(false)
const categories = ref<CategoryVO[]>([])
const tags = ref<TagVO[]>([])
const form = ref<ArticleDTO>({ title: '', contentMd: '', status: 'DRAFT', tagIds: [], categoryId: undefined })
const selectedTagIds = ref<number[]>([])
const isEditing = ref(false)

async function init() {
  const path = window.location.pathname
  const match = path.match(/\/admin\/articles\/(\d+)$/)
  isEditing.value = !!match

  const [catRes, tagRes] = await Promise.all([getCategories(), getTags()])
  categories.value = catRes.data
  tags.value = tagRes.data

  if (match) {
    const res = await adminGetArticle(Number(match[1]))
    article.value = res.data
    form.value = {
      title: res.data.title,
      contentMd: res.data.contentMd,
      coverImage: res.data.coverImage,
      categoryId: res.data.categoryId,
      status: res.data.status,
      allowComment: res.data.allowComment,
      isTop: res.data.isTop,
      tagIds: res.data.tags.map(t => t.id),
    }
    selectedTagIds.value = res.data.tags.map(t => t.id)
  }
}

onMounted(init)

function toggleTag(id: number) {
  const idx = selectedTagIds.value.indexOf(id)
  if (idx >= 0) selectedTagIds.value.splice(idx, 1)
  else selectedTagIds.value.push(id)
  form.value.tagIds = [...selectedTagIds.value]
}

async function handleSave(status?: string) {
  saving.value = true
  try {
    if (status) form.value.status = status as any
    if (isEditing.value && article.value) {
      await updateArticle(article.value.id, form.value)
    } else {
      await createArticle(form.value)
    }
    window.location.href = '/admin/articles'
  } catch {} finally {
    saving.value = false
  }
}

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const res = await uploadFile(file, 'IMAGE')
    form.value.coverImage = res.data.url
  } catch {}
}
</script>

<template>
  <div class="animate-fade-in-up max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
        {{ isEditing ? '编辑文章' : '新建文章' }}
      </h2>
      <div class="flex items-center gap-2">
        <a href="/admin/articles" class="btn-secondary" style="font-size:14px;padding:7px 16px;">取消</a>
        <button @click="handleSave('DRAFT')" :disabled="saving" class="btn-secondary" style="font-size:14px;padding:7px 16px;">
          {{ saving ? '保存中...' : '存草稿' }}
        </button>
        <button @click="handleSave('PUBLISHED')" :disabled="saving" class="btn-primary" style="font-size:14px;padding:7px 16px;">
          {{ saving ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>

    <div class="space-y-5">
      <input v-model="form.title" placeholder="文章标题" class="input-field text-[21px] font-semibold" />

      <div class="flex flex-wrap gap-2">
        <span
          v-for="t in tags" :key="t.id"
          @click="toggleTag(t.id)"
          :class="['cursor-pointer inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium border transition-colors', selectedTagIds.includes(t.id) ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'bg-white text-[#6e6e73] border-gray-200 hover:border-gray-300']"
        >
          {{ t.name }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <select v-model.number="form.categoryId" class="input-field w-auto">
          <option :value="undefined">无分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <label class="flex items-center gap-1.5 text-[13px] text-[#6e6e73] cursor-pointer">
          <input v-model.number="form.isTop" type="checkbox" :true-value="1" :false-value="0" class="accent-[#0066cc]" /> 置顶
        </label>
        <label class="flex items-center gap-1.5 text-[13px] text-[#6e6e73] cursor-pointer">
          <input v-model.number="form.allowComment" type="checkbox" :true-value="1" :false-value="0" class="accent-[#0066cc]" /> 允许评论
        </label>
      </div>

      <div v-if="form.coverImage" class="relative inline-block">
        <img :src="form.coverImage" class="h-32 rounded-lg" />
        <button @click="form.coverImage = ''" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white text-[12px] flex items-center justify-center">×</button>
      </div>
      <label class="text-[13px] text-[#0066cc] cursor-pointer hover:underline inline-block">
        上传封面图
        <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
      </label>

      <textarea
        v-model="form.contentMd"
        placeholder="Markdown 内容..."
        class="input-field min-h-[400px] font-mono text-[14px] leading-relaxed resize-y"
      />
    </div>
  </div>
</template>
