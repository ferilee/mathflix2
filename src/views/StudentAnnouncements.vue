<template>
  <div class="px-4 md:px-12 py-8 max-w-4xl mx-auto min-h-screen text-white">
     <h1 class="text-4xl md:text-5xl font-extrabold text-[#ffed4a] mb-10 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" style="-webkit-text-stroke: 1px #b45309;">
        📢 Papan Pengumuman
     </h1>

     <div class="space-y-6">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="bg-gray-800 rounded-lg p-6 shadow-lg"
          :class="item.is_pinned ? 'border-l-4 border-yellow-400' : 'border-l-4 border-red-600'"
        >
           <div class="flex justify-between items-start mb-2">
              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                  {{ item.title }}
                  <span v-if="item.priority && item.priority !== 'normal'" class="text-[10px] uppercase px-2 py-0.5 rounded" :class="priorityClass(item.priority)">
                    {{ item.priority === 'important' ? 'Penting' : 'Deadline' }}
                  </span>
                  <span v-if="item.has_read" class="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-300">Dibaca</span>
                </h2>
                <div class="text-xs text-gray-400">{{ new Date(item.created_at).toLocaleDateString() }}</div>
              </div>
           </div>
           <p class="text-gray-300 whitespace-pre-line">{{ item.content }}</p>

           <div v-if="item.attachments && item.attachments.length" class="mt-4 space-y-3">
              <div v-for="(att, idx) in item.attachments" :key="idx" class="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
                 <div v-if="att.type === 'image'" class="space-y-2">
                    <img :src="resolveStorageUrl(att.url)" :alt="att.name || 'Lampiran'" class="w-full max-h-60 object-cover rounded">
                    <div class="text-xs text-gray-400">{{ att.name }}</div>
                 </div>
                 <div v-else class="flex items-center justify-between">
                    <div class="text-sm text-gray-200 flex items-center gap-2">
                       <span v-if="att.type === 'pdf'">📄</span>
                       <span v-else-if="att.type === 'link'">🔗</span>
                       <span v-else>📎</span>
                       <span>{{ att.name || att.url }}</span>
                    </div>
                    <a :href="att.type === 'link' ? att.url : resolveStorageUrl(att.url)" target="_blank" class="text-xs text-blue-300 hover:text-blue-200">Buka</a>
                 </div>
              </div>
           </div>
        </div>

        <div v-if="announcements.length === 0" class="text-center text-gray-500 py-12">
            Belum ada pengumuman terbaru.
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { resolveStorageUrl } from '../utils/storage';

const announcements = ref<any[]>([]);

onMounted(async () => {
    try {
        const studentRaw = localStorage.getItem('student');
        let studentId = null;
        if (studentRaw) {
            try {
                studentId = JSON.parse(studentRaw).id;
            } catch (e) {
                studentId = null;
            }
        }
        const { data } = await api.get('/announcements', {
            params: studentId ? { student_id: studentId } : undefined
        });
        announcements.value = data;

        if (studentId) {
            await Promise.all(
                data.map((item: any) => api.post(`/announcements/${item.id}/read`, { student_id: studentId }))
            );
        }
    } catch (e) {
        console.error(e);
    }
});

const priorityClass = (priority: string) => {
    if (priority === 'important') return 'bg-red-600 text-white';
    if (priority === 'deadline') return 'bg-yellow-400 text-black';
    return 'bg-gray-700 text-gray-200';
};
</script>
