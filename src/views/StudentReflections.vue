<template>
  <div class="px-4 md:px-12 py-8 min-h-screen text-white pb-24">
      <!-- Badge Achievement Modal -->
      <div v-if="showBadgeModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
              <div class="confetti-layer">
                  <span
                    v-for="piece in confettiPieces"
                    :key="piece.id"
                    class="confetti-piece"
                    :style="{
                      left: piece.left,
                      width: piece.size,
                      height: piece.size,
                      backgroundColor: piece.color,
                      animationDelay: piece.delay,
                      animationDuration: piece.duration,
                      '--rotate-angle': piece.rotate
                    }"
                  ></span>
              </div>
          </div>
          <div class="relative w-full max-w-md bg-[#141414] border border-yellow-500/60 rounded-2xl p-6 text-center shadow-2xl">
              <div class="text-5xl mb-3">{{ activeBadge?.icon || '🏅' }}</div>
              <h3 class="text-2xl font-bold text-yellow-400 mb-2">Pencapaian Baru!</h3>
              <div class="text-lg font-semibold text-white mb-2">
                {{ activeBadge?.name || 'Badge Baru' }}
              </div>
              <p class="text-sm text-gray-300 mb-6">
                {{ activeBadge?.description || 'Terus tingkatkan pencapaianmu.' }}
              </p>
              <button
                type="button"
                class="bg-yellow-500 text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-400 transition"
                @click="closeBadgeModal"
              >
                Lanjut
              </button>
          </div>
      </div>

      <h1 class="text-4xl md:text-5xl font-extrabold text-[#ffed4a] mb-2 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" style="-webkit-text-stroke: 1px #b45309;">
         📖 Jurnal Refleksi
      </h1>
      <p class="text-gray-400 mb-8">Refleksikan apa yang telah kamu pelajari hari ini (Tahap Transform)</p>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form Section -->
          <div class="lg:col-span-1">
              <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 sticky top-4">
                  <h2 class="font-bold text-xl mb-4">Tulis Jurnal Baru</h2>

                  <div class="mb-4">
                      <label class="block text-gray-400 text-sm mb-2">Topik (Opsional)</label>
                      <input v-model="form.topic" placeholder="Misal: Fungsi Linear" class="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded focus:outline-none focus:border-indigo-500">
                  </div>

                  <div class="mb-4">
                      <label class="block text-gray-400 text-sm mb-2">Bagaimana perasaanmu?</label>
                      <div class="flex gap-2">
                          <button @click="form.mood = 'happy'" :class="['text-2xl p-2 rounded transition', form.mood === 'happy' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600']">😄</button>
                          <button @click="form.mood = 'neutral'" :class="['text-2xl p-2 rounded transition', form.mood === 'neutral' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600']">😐</button>
                          <button @click="form.mood = 'confused'" :class="['text-2xl p-2 rounded transition', form.mood === 'confused' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600']">😕</button>
                          <button @click="form.mood = 'frustrated'" :class="['text-2xl p-2 rounded transition', form.mood === 'frustrated' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600']">😫</button>
                      </div>
                  </div>

                  <div class="mb-4">
                      <label class="block text-gray-400 text-sm mb-2">Apa yang kamu pelajari? Apa yang sulit?</label>
                      <textarea v-model="form.content" rows="4" class="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded focus:outline-none focus:border-indigo-500" placeholder="Ceritakan progres belajarmu..."></textarea>
                  </div>

                  <button @click="submitReflection" :disabled="loadingSubmit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition disabled:opacity-50">
                      {{ loadingSubmit ? 'Menyimpan...' : 'Simpan Jurnal' }}
                  </button>
              </div>
          </div>

          <!-- Timeline Section -->
          <div class="lg:col-span-2 space-y-6">
              <h2 class="font-bold text-xl">Riwayat Refleksi</h2>
              <div v-if="loading" class="text-center text-gray-400">Memuat riwayat...</div>
              <div v-else-if="reflections.length === 0" class="text-center text-gray-500 bg-gray-800 p-8 rounded-xl border border-gray-700">
                  Belum ada catatan jurnal. Mulailah menulis hari ini!
              </div>

              <div v-for="ref in reflections" :key="ref.id" class="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
                  <!-- Mood Badge -->
                  <div class="absolute top-4 right-4 text-2xl">
                    {{ getMoodEmoji(ref.mood) }}
                  </div>

                  <div class="mb-2">
                       <span class="text-xs text-indigo-400 font-bold uppercase tracking-wider">{{ ref.topic || 'General' }}</span>
                       <span class="text-xs text-gray-500 ml-2">• {{ new Date(ref.created_at).toLocaleString() }}</span>
                  </div>

                  <p class="text-gray-300 whitespace-pre-line leading-relaxed">{{ ref.content }}</p>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import api from '../api';
import { isDemoMode, getDemoReflections, saveDemoReflections } from '../utils/demo';
import { useDialog } from '../utils/dialog';

const reflections = ref<any[]>([]);
const loading = ref(true);
const loadingSubmit = ref(false);
const demoMode = isDemoMode();
const dialog = useDialog();
const showBadgeModal = ref(false);
const activeBadge = ref<any | null>(null);
const pendingBadges = ref<any[]>([]);
const confettiPieces = ref<Array<{ id: number; left: string; delay: string; duration: string; size: string; color: string; rotate: string }>>([]);

const form = reactive({
    content: '',
    mood: 'neutral',
    topic: ''
});

const getMoodEmoji = (mood: string) => {
    switch(mood) {
        case 'happy': return '😄';
        case 'neutral': return '😐';
        case 'confused': return '😕';
        case 'frustrated': return '😫';
        default: return '😐';
    }
};

const buildConfetti = () => {
    const colors = ['#facc15', '#f97316', '#22c55e', '#38bdf8', '#a855f7', '#ef4444'];
    confettiPieces.value = Array.from({ length: 36 }, (_, idx) => {
        const size = 6 + Math.floor(Math.random() * 6);
        const left = Math.floor(Math.random() * 100);
        const delay = Math.random() * 0.4;
        const duration = 1.8 + Math.random() * 1.2;
        const rotate = `${Math.floor(Math.random() * 360)}deg`;
        const color = colors[idx % colors.length] || '#facc15';
        return {
            id: idx,
            left: `${left}%`,
            delay: `${delay}s`,
            duration: `${duration}s`,
            size: `${size}px`,
            color,
            rotate
        };
    });
};

const playApplause = () => {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const burst = (time: number, gain: number) => {
            const bufferSize = ctx.sampleRate * 0.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(gain, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(time);
        };

        const now = ctx.currentTime;
        const pattern = [0, 0.08, 0.16, 0.32, 0.45, 0.6, 0.72];
        pattern.forEach((offset, i) => burst(now + offset, 0.3 - i * 0.03));
        setTimeout(() => ctx.close(), 1200);
    } catch (e) {
        console.error('Failed to play applause', e);
    }
};

const showNextBadge = () => {
    if (pendingBadges.value.length === 0) return;
    activeBadge.value = pendingBadges.value.shift() || null;
    buildConfetti();
    showBadgeModal.value = true;
    playApplause();
};

const closeBadgeModal = () => {
    showBadgeModal.value = false;
    activeBadge.value = null;
    if (pendingBadges.value.length > 0) {
        setTimeout(showNextBadge, 150);
    }
};

const enqueueBadges = (badges: any[]) => {
    if (!badges.length) return;
    pendingBadges.value = [...pendingBadges.value, ...badges];
    if (!showBadgeModal.value) {
        showNextBadge();
    }
};

const loadReflections = async () => {
    if (demoMode) {
        reflections.value = getDemoReflections();
        loading.value = false;
        return;
    }
    const studentData = localStorage.getItem('student');
    if (!studentData) return;
    const student = JSON.parse(studentData);

    loading.value = true;
    try {
        const { data } = await api.get('/reflections/my-reflections', {
            headers: { 'X-Student-ID': student.id }
        });
        reflections.value = data;
    } catch (e) {
        console.error("Failed to load reflections", e);
    } finally {
        loading.value = false;
    }
};

const submitReflection = async () => {
    if (!form.content.trim()) {
        await dialog.alert("Isi jurnal tidak boleh kosong!");
        return;
    }

    if (demoMode) {
        const newItem = {
            id: `demo-ref-${Date.now()}`,
            content: form.content,
            mood: form.mood,
            topic: form.topic,
            created_at: new Date().toISOString()
        };
        const next = [newItem, ...getDemoReflections()];
        saveDemoReflections(next);
        reflections.value = next;
        form.content = '';
        form.mood = 'neutral';
        form.topic = '';
        return;
    }

    const studentData = localStorage.getItem('student');
    if (!studentData) return;
    const student = JSON.parse(studentData);

    loadingSubmit.value = true;
    try {
        await api.post('/reflections', form, {
            headers: { 'X-Student-ID': student.id }
        });

        // Check for Badges
        const { data: badgeData } = await api.post('/badges/check', {}, {
            headers: { 'X-Student-ID': student.id }
        });

        if (badgeData.new_badges && badgeData.new_badges.length > 0) {
            enqueueBadges(badgeData.new_badges);
        }

        // Reset and Reload
        form.content = '';
        form.mood = 'neutral';
        form.topic = '';
        await loadReflections();
    } catch (e: any) {
        await dialog.alert("Gagal menyimpan jurnal: " + (e.response?.data?.error || e.message));
    } finally {
        loadingSubmit.value = false;
    }
};

onMounted(loadReflections);
</script>

<style scoped>
.confetti-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.confetti-piece {
    position: absolute;
    top: -12px;
    border-radius: 2px;
    opacity: 0.9;
    animation-name: confetti-fall;
    animation-timing-function: ease-out;
    animation-iteration-count: 1;
}

@keyframes confetti-fall {
    0% {
        transform: translateY(-10px) rotate(var(--rotate-angle));
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    100% {
        transform: translateY(110vh) rotate(calc(var(--rotate-angle) + 360deg));
        opacity: 0;
    }
}
</style>
