
<template>
  <div class="px-4 md:px-12 py-8 min-h-screen text-white">
      <h1 class="text-4xl md:text-5xl font-extrabold text-[#ffed4a] mb-10 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" style="-webkit-text-stroke: 1px #b45309;">
         📝 Tugas Saya
      </h1>

      <div v-if="loading" class="text-center">Memuat tugas...</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="task in assignments" :key="task.id" class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-600 transition relative overflow-hidden group">
              <div class="absolute top-0 right-0 bg-red-600 text-xs px-2 py-1 rounded-bl" v-if="isOverdue(task.due_date)">Overdue</div>

              <h3 class="font-bold text-xl mb-2">{{ task.title }}</h3>
              <p class="text-gray-400 text-sm mb-4 line-clamp-3">{{ task.description }}</p>

              <div class="mt-auto border-t border-gray-700 pt-4 flex justify-between items-center text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                      📅 Due: {{ new Date(task.due_date).toLocaleDateString() }}
                  </span>
                  <button @click="$router.push(`/assignments/${task.id}`)" class="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 font-bold transition">Detail & Kumpulkan</button>
              </div>
          </div>

          <div v-if="assignments.length === 0" class="col-span-full text-center text-gray-500 py-12">
              Tidak ada tugas aktif saat ini.
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../api';
import { isDemoMode, getDemoAssignments } from '../utils/demo';

const assignments = ref<any[]>([]);
const loading = ref(true);
let pollingInterval: any = null;
const demoMode = isDemoMode();

const loadassignments = async (isPolling = false) => {
    if (demoMode) {
        assignments.value = getDemoAssignments();
        loading.value = false;
        return;
    }
    const studentData = localStorage.getItem('student');
    if (!studentData) {
        if (!isPolling) console.warn('No student data in localStorage');
        return;
    }
    const student = JSON.parse(studentData);

    try {
        const { data } = await api.get('/assignments/my-assignments', {
            headers: { 'X-Student-ID': student.id }
        });
        // Simple diff check could be added here to avoid UI flicker, but Vue handles reactivity well.
        assignments.value = data;
    } catch (e) {
        if (!isPolling) console.error(e);
    } finally {
        loading.value = false;
    }
};

const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date();
};

onMounted(() => {
    loadassignments();
    // Poll every 5 seconds for live updates
    if (!demoMode) {
        pollingInterval = setInterval(() => loadassignments(true), 5000);
    }
});

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
});
</script>
