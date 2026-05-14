<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getComments, createComment } from '../lib/api'
import type { CommentVO, CommentDTO } from '../lib/types'

const props = defineProps<{ articleId: number }>()

const comments = ref<CommentVO[]>([])
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)

const form = ref<CommentDTO>({ articleId: props.articleId, author: '', email: '', content: '' })
const replyTo = ref<{ id: number; author: string } | null>(null)
const showForm = ref(false)

async function fetch() {
  loading.value = true
  try {
    const res = await getComments({ articleId: props.articleId, pageSize: 100 })
    comments.value = res.data.records
    total.value = res.data.total
  } finally { loading.value = false }
}

onMounted(fetch)

async function handleSubmit() {
  if (!form.value.author.trim() || !form.value.content.trim()) return
  submitting.value = true
  try {
    const dto: CommentDTO = {
      articleId: props.articleId,
      author: form.value.author.trim(),
      email: form.value.email.trim() || undefined,
      content: form.value.content.trim(),
      parentId: replyTo.value?.id,
    }
    if (replyTo.value) {
      dto.replyToId = replyTo.value.id
    }
    await createComment(dto)
    form.value = { articleId: props.articleId, author: '', email: '', content: '' }
    replyTo.value = null
    showForm.value = false
    fetch()
  } catch {} finally {
    submitting.value = false
  }
}

function startReply(c: CommentVO) {
  replyTo.value = { id: c.id, author: c.author }
  showForm.value = true
}
</script>

<template>
  <div class="border-t border-gray-100 pt-10 mt-10">
    <h3 class="text-[21px] font-semibold text-[#1d1d1f] mb-6">评论 ({{ total }})</h3>

    <!-- Comment form -->
    <div v-if="!showForm" class="mb-8">
      <button @click="showForm = true" class="btn-primary" style="font-size:14px;padding:7px 16px;">写评论</button>
    </div>
    <div v-else class="card p-5 mb-8">
      <div v-if="replyTo" class="text-[13px] text-[#6e6e73] mb-3">
        回复 <span class="text-[#0066cc] font-semibold">{{ replyTo.author }}</span>
        <button @click="replyTo = null" class="text-[#aeaeb2] ml-2 hover:text-[#6e6e73]">取消</button>
      </div>
      <div class="space-y-3">
        <div class="flex gap-3">
          <input v-model="form.author" placeholder="昵称 *" class="input-field flex-1" />
          <input v-model="form.email" placeholder="邮箱 (可选)" type="email" class="input-field flex-1" />
        </div>
        <textarea v-model="form.content" placeholder="写下你的想法..." class="input-field min-h-[100px] resize-y" />
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button @click="showForm = false" class="btn-secondary" style="font-size:14px;padding:7px 16px;">取消</button>
        <button @click="handleSubmit" :disabled="submitting" class="btn-primary" style="font-size:14px;padding:7px 16px;">
          {{ submitting ? '发送中...' : '发表评论' }}
        </button>
      </div>
    </div>

    <!-- Comments list -->
    <div v-if="loading" class="text-center py-8 text-[#aeaeb2]">加载中...</div>
    <div v-else-if="comments.length === 0" class="text-center py-8 text-[#aeaeb2] text-[14px]">暂无评论，来写第一条吧</div>

    <div v-else class="space-y-5">
      <div v-for="c in comments" :key="c.id" class="border-b border-gray-100 pb-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[14px] font-medium text-[#1d1d1f]">{{ c.author }}</span>
          <span class="text-[12px] text-[#aeaeb2]">{{ new Date(c.createTime).toLocaleDateString('zh-CN') }}</span>
        </div>
        <p class="text-[15px] text-[#1d1d1f] leading-relaxed mb-2">{{ c.content }}</p>
        <button @click="startReply(c)" class="text-[12px] text-[#aeaeb2] hover:text-[#0066cc] transition-colors">回复</button>

        <!-- Children -->
        <div v-if="c.children?.length" class="mt-4 ml-8 space-y-3 border-l-2 border-gray-100 pl-5">
          <div v-for="ch in c.children" :key="ch.id">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[13px] font-medium text-[#6e6e73]">{{ ch.author }}</span>
              <span class="text-[11px] text-[#aeaeb2]">{{ new Date(ch.createTime).toLocaleDateString('zh-CN') }}</span>
            </div>
            <p class="text-[14px] text-[#6e6e73] leading-relaxed">{{ ch.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
