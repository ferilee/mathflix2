<template>
  <div class="px-4 md:px-12 py-8 min-h-screen text-white">
      <h1 class="text-4xl md:text-5xl font-extrabold text-[#ffed4a] mb-2 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" style="-webkit-text-stroke: 1px #b45309;">
         🏅 Pencapaian Saya
      </h1>
      <p class="text-gray-400 mb-8">Koleksi lencana dan prestasi belajarmu (Gamification).</p>

      <div v-if="loading" class="text-center text-gray-500">Memuat lencana...</div>
      
      <div v-else-if="badges.length === 0" class="text-center bg-gray-800 p-12 rounded-xl border border-gray-700">
          <div class="text-6xl mb-4">🛡️</div>
          <h3 class="text-xl font-bold mb-2">Belum ada Lencana</h3>
          <p class="text-gray-400">Selesaikan kuis dan jurnal untuk mulai mengoleksi!</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div v-for="badge in badges" :key="badge.id" class="bg-gradient-to-br from-indigo-900 to-gray-900 p-6 rounded-xl border border-indigo-500/50 flex flex-col items-center text-center relative overflow-hidden group hover:scale-105 transition shadow-lg shadow-indigo-500/20">
              <!-- Glow Effect -->
              <div class="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></div>
              
              <div class="text-6xl mb-4 relative z-10 drop-shadow-md">{{ badge.icon }}</div>
              <h3 class="font-bold text-lg mb-1 relative z-10">{{ badge.name }}</h3>
              <p class="text-xs text-indigo-300 mb-3 relative z-10">{{ badge.description }}</p>
              
              <div class="mt-auto text-[10px] text-gray-500 uppercase tracking-widest relative z-10">
                  {{ new Date(badge.earned_at).toLocaleDateString() }}
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';

const badges = ref<any[]>([]);
const loading = ref(true);

const loadBadges = async () => {
    const studentData = localStorage.getItem('student');
    if (!studentData) return;
    const student = JSON.parse(studentData);

    try {
        const { data } = await api.get('/badges/my-badges', {
            headers: { 'X-Student-ID': student.id }
        });
        badges.value = data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(loadBadges);
</script>
