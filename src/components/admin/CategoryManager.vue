<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../lib/api'
import type { CategoryVO, CategoryDTO } from '../../lib/types'

const categories = ref<CategoryVO[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editItem = ref<CategoryVO | null>(null)
const form = ref<CategoryDTO>({ name: '', slug: '', parentId: undefined, sortOrder: 0 })

async function fetch() {
  loading.value = true
  try {
    const res = await getCategories()
    categories.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetch)

function openCreate(parentId?: number) {
  editItem.value = null
  form.value = { name: '', slug: '', parentId, sortOrder: 0 }
  showDialog.value = true
}

function openEdit(c: CategoryVO) {
  editItem.value = c
  form.value = { name: c.name, slug: c.slug, parentId: c.parentId, sortOrder: c.sortOrder }
  showDialog.value = true
}

async function handleSave() {
  try {
    if (editItem.value) {
      await adminUpdateCategory(editItem.value.id, form.value)
    } else {
      await adminCreateCategory(form.value)
    }
    showDialog.value = false
    fetch()
  } catch {}
}

async function handleDelete(id: number) {
  if (!confirm('确认删除此分类？')) return
  try { await adminDeleteCategory(id); fetch() } catch {}
}
</script>

<template>
  <div class="animate-fade-in-up max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-1">分类管理</h2>
        <p class="text-[13px] text-[#aeaeb2]">管理内容分类结构</p>
      </div>
      <button @click="openCreate()" class="btn-primary" style="font-size:14px;padding:7px 16px;">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        新增分类
      </button>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-[13px]">
        <thead>
          <tr class="border-b border-gray-100 text-[#aeaeb2] text-[11px] uppercase tracking-wider">
            <th class="text-left px-5 py-3 font-medium">名称</th>
            <th class="text-left px-5 py-3 font-medium hidden sm:table-cell">Slug</th>
            <th class="text-left px-5 py-3 font-medium hidden md:table-cell">排序</th>
            <th class="text-right px-5 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="4" class="text-center py-16 text-[#aeaeb2]">加载中...</td></tr>
          <template v-for="c in categories" :key="c.id">
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-3.5">
                <span class="text-[#1d1d1f] font-medium">{{ c.name }}</span>
                <span class="text-[#aeaeb2] text-[11px] ml-1.5">({{ c.articleCount }})</span>
              </td>
              <td class="px-5 py-3.5 text-[#aeaeb2] hidden sm:table-cell">{{ c.slug }}</td>
              <td class="px-5 py-3.5 text-[#aeaeb2] hidden md:table-cell">{{ c.sortOrder }}</td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex gap-3 justify-end">
                  <button @click="openCreate(c.id)" class="text-[#aeaeb2] hover:text-[#6e6e73] transition-colors">添加子分类</button>
                  <button @click="openEdit(c)" class="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">编辑</button>
                  <button @click="handleDelete(c.id)" class="text-[#aeaeb2] hover:text-red-500 transition-colors">删除</button>
                </div>
              </td>
            </tr>
            <tr v-for="child in c.children" :key="child.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-3.5 pl-12">
                <span class="text-[#6e6e73]">└ {{ child.name }}</span>
                <span class="text-[#aeaeb2] text-[11px] ml-1.5">({{ child.articleCount }})</span>
              </td>
              <td class="px-5 py-3.5 text-[#aeaeb2] hidden sm:table-cell">{{ child.slug }}</td>
              <td class="px-5 py-3.5 text-[#aeaeb2] hidden md:table-cell">{{ child.sortOrder }}</td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex gap-3 justify-end">
                  <button @click="openEdit(child)" class="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">编辑</button>
                  <button @click="handleDelete(child.id)" class="text-[#aeaeb2] hover:text-red-500 transition-colors">删除</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Dialog -->
    <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="showDialog = false">
      <div class="card p-6 w-full max-w-[400px] mx-4 bg-white">
        <h3 class="text-[17px] font-semibold text-[#1d1d1f] mb-5">{{ editItem ? '编辑分类' : '新增分类' }}</h3>
        <div class="space-y-3">
          <input v-model="form.name" placeholder="名称" class="input-field" />
          <input v-model="form.slug" placeholder="Slug" class="input-field" />
          <input v-model.number="form.sortOrder" type="number" placeholder="排序" class="input-field" />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showDialog = false" class="btn-secondary" style="font-size:14px;padding:7px 16px;">取消</button>
          <button @click="handleSave" class="btn-primary" style="font-size:14px;padding:7px 16px;">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
