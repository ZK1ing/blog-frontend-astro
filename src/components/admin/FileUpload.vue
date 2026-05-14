<script setup lang="ts">
import { ref } from 'vue'
import { uploadFile } from '../../lib/api'
import type { FileVO } from '../../lib/types'

const files = ref<FileVO[]>([])
const uploading = ref(false)

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE'
    const res = await uploadFile(file, type)
    files.value.unshift(res.data)
  } catch {} finally {
    uploading.value = false
  }
}

async function copyUrl(url: string) {
  await navigator.clipboard.writeText(url)
}

function onDrop(e: DragEvent) {
  const dt = e.dataTransfer
  if (dt?.files.length) {
    const fakeE = { target: { files: dt.files } } as any
    handleUpload(fakeE)
  }
}
</script>

<template>
  <div class="animate-fade-in-up max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-1">文件管理</h2>
        <p class="text-[13px] text-[#aeaeb2]">支持 JPG/PNG/GIF/WebP/SVG/PDF/DOC/MD/ZIP</p>
      </div>
    </div>

    <div
      class="card p-10 mb-8 text-center cursor-pointer border-dashed hover:border-gray-200 transition-colors"
      @dragover.prevent @drop.prevent="onDrop"
    >
      <label class="cursor-pointer block">
        <input type="file" accept="image/*,.pdf,.doc,.docx,.md,.zip" @change="handleUpload" class="hidden" :disabled="uploading" />
        <div class="mb-3">
          <svg class="w-8 h-8 text-[#aeaeb2] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
        </div>
        <p class="text-[14px] text-[#6e6e73] mb-1">{{ uploading ? '上传中...' : '点击或拖拽文件上传' }}</p>
        <p class="text-[11px] text-[#aeaeb2]">图片最大 10MB，文件最大 20MB</p>
      </label>
    </div>

    <div v-if="files.length === 0" class="text-center py-16 text-[#aeaeb2] text-[13px]">暂无上传文件</div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div v-for="f in files" :key="f.url" class="card overflow-hidden group">
        <div class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            v-if="f.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)"
            :src="f.url"
            class="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
          <svg v-else class="w-8 h-8 text-[#aeaeb2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
        </div>
        <div class="p-2.5">
          <p class="text-[11px] text-[#6e6e73] truncate leading-tight">{{ f.originalName }}</p>
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-[10px] text-[#aeaeb2]">{{ (f.size / 1024).toFixed(0) }}KB</span>
            <button @click="copyUrl(f.url)" class="text-[10px] text-[#aeaeb2] hover:text-[#6e6e73] opacity-0 group-hover:opacity-100 transition-all">复制 URL</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
