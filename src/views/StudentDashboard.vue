<template>
  <div class="bg-black min-h-screen">
    <div
      v-if="isAdminPreview"
      class="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 px-4 md:px-16 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between"
    >
      <div class="text-xs md:text-sm text-slate-300 font-semibold">
        Mode Preview Siswa (Admin/Guru)
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedPreviewStudentId"
          class="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 min-w-[220px]"
          @change="handlePreviewStudentChange"
        >
          <option value="">Pilih siswa...</option>
          <option v-for="s in previewStudents" :key="s.id" :value="s.id">
            {{ s.full_name }} ({{ s.grade_level || '-' }} {{ s.major || '-' }})
          </option>
        </select>
      </div>
    </div>

    <!-- Hero Section (Main Quest) -->
    <div class="relative h-[85vh] w-full" data-tour="hero">
      <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop');">
        <!-- Cinematic gradient overlays -->
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center h-full px-4 md:px-16 max-w-3xl space-y-4">
        <!-- Netflix Style "Original" badge translated to RPG -->
        <div class="flex items-center gap-2 mb-2">
            <span class="text-3xl filter drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">🔥</span>
            <span class="text-yellow-400 font-black tracking-[0.2em] uppercase text-sm drop-shadow-md">Main Quest</span>
        </div>
        
        <h1 class="text-5xl md:text-8xl font-black text-white leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);">
          {{ featuredMaterial?.title || 'Unknown Dungeon' }}
        </h1>
        
        <!-- RPG Stats for the quest -->
        <div class="flex items-center gap-4 text-sm font-bold mt-2">
           <span class="text-green-400 drop-shadow-md">98% Match</span>
           <span class="border border-white/40 text-white/80 px-2 py-0.5 rounded-md backdrop-blur-sm">{{ featuredMaterial?.major_target || 'Umum' }}</span>
           <span class="text-white/80 border border-white/40 px-2 py-0.5 rounded-md">Lvl. {{ student?.level || 1 }}+</span>
        </div>

        <p class="text-lg text-gray-300 line-clamp-3 mt-4 drop-shadow-md font-medium max-w-xl">
            {{ featuredMaterial?.description || stripHtml(featuredMaterial?.content || '') }}
        </p>

        <div class="flex gap-4 pt-6" v-if="featuredMaterial">
          <button @click="openMaterial(featuredMaterial.id)" class="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-black hover:bg-gray-200 transition transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span class="text-xl">⚔️</span> <span>Continue Quest</span>
          </button>
          <button @click="addToMyList(featuredMaterial)" class="flex items-center gap-3 bg-gray-600/70 text-white px-8 py-3 rounded-lg font-black hover:bg-gray-600 transition backdrop-blur-md border border-white/20 transform hover:scale-105">
            <span class="text-xl">📜</span> <span>Add to Log</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Rows -->
    <div class="-mt-40 relative z-20 space-y-16 px-4 md:px-16 pb-20">

      <!-- Recommendations -> Active Missions -->
      <section v-if="recommendations.length > 0" data-tour="recommendations">
         <div class="flex items-center justify-between mb-2">
            <h3 class="text-2xl font-black text-white hover:text-yellow-400 cursor-pointer transition drop-shadow-md tracking-wide">Active Missions</h3>
         </div>
         <div class="flex gap-4 overflow-x-auto overflow-y-visible py-4 scrollbar-hide scroll-smooth">
             <div
               v-for="rec in recommendations"
               :key="rec.material_id"
               class="flex-none w-72 bg-gray-900 rounded-md overflow-hidden ring-1 ring-white/10 hover:ring-2 hover:ring-emerald-500 hover:scale-105 transition-all duration-300 cursor-pointer relative group/card shadow-2xl"
               @click="openMaterial(rec.material_id)"
             >
                <!-- Card Image -->
                <div
                   class="aspect-video w-full relative"
                   :style="`background-image: url('${rec.image_url ? resolveStorageUrl(rec.image_url) : '/material-placeholder.png'}'); background-size: cover; background-position: center;`"
                >
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <!-- Top Badge -->
                  <div class="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-black text-[10px] font-black px-2 py-1 rounded shadow-lg tracking-widest uppercase">
                    Suggested
                  </div>
                </div>
                <!-- Card Content (Bottom) -->
                <div class="p-3 bg-[#141414] border-t border-white/5 relative">
                   <h4 class="text-sm font-bold text-white truncate mb-2">{{ rec.title }}</h4>
                   <!-- Progress Bar (RPG style) -->
                   <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                      <div class="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[45%]"></div>
                   </div>
                   <div class="flex justify-between items-center mt-1">
                      <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{{ rec.reason || 'In Progress' }}</span>
                      <span class="text-[10px] text-gray-500 font-bold">45% Cleared</span>
                   </div>
                </div>
             </div>
         </div>
      </section>

      <!-- Quizzes -> Top 10 Hardest Quests (Netflix Top 10 Style) -->
      <section data-tour="quizzes">
         <div class="flex items-center justify-between mb-2">
            <h3 class="text-2xl font-black text-white hover:text-red-500 cursor-pointer transition drop-shadow-md tracking-wide">Top 10 Deadliest Quests</h3>
         </div>
         <div class="flex gap-10 overflow-x-auto overflow-y-visible py-4 pl-8 scrollbar-hide scroll-smooth">
             <div
               v-for="(quiz, index) in quizzes.slice(0, 10)"
               :key="quiz.id"
               class="flex-none w-40 relative cursor-pointer group/card hover:scale-110 transition-transform duration-300"
               @click="openQuiz(quiz.id)"
             >
                <!-- Giant Number Behind -->
                <div class="absolute -left-10 -bottom-4 text-[140px] font-black text-black leading-none pointer-events-none select-none z-0" style="-webkit-text-stroke: 4px #4b5563;">
                   {{ index + 1 }}
                </div>
                <!-- Tall Card (Netflix Style Poster) -->
                <div class="aspect-[2/3] bg-gray-900 rounded-md overflow-hidden ring-1 ring-white/10 relative z-10 shadow-2xl group-hover/card:ring-red-600">
                   <div class="h-full w-full bg-cover bg-center relative" :style="`background-image: url('${quiz.image_url ? resolveStorageUrl(quiz.image_url) : '/quiz-placeholder.png'}');`">
                      <div class="absolute inset-0 bg-gradient-to-t from-red-900/90 via-black/40 to-transparent flex flex-col justify-end p-3 text-center">
                         <span class="text-4xl mb-2 drop-shadow-lg">☠️</span>
                         <h4 class="text-sm font-black text-white drop-shadow-md leading-tight">{{ quiz.title }}</h4>
                         <p class="text-[10px] text-red-300 font-bold mt-1 uppercase tracking-widest">Min. Score: {{ quiz.passing_score }}</p>
                      </div>
                   </div>
                </div>
             </div>
         </div>
      </section>

      <!-- Materials Row -> Unexplored Regions -->
      <section data-tour="materials">
        <h3 class="text-2xl font-black text-white mb-2 hover:text-blue-400 cursor-pointer transition drop-shadow-md tracking-wide">Unexplored Regions</h3>
        <div class="flex gap-4 overflow-x-auto overflow-y-visible py-4 scrollbar-hide scroll-smooth">
            <div
              v-for="material in materials"
              :key="material.id"
              class="flex-none w-64 aspect-video bg-gray-900 rounded-md overflow-hidden ring-1 ring-white/10 hover:ring-2 hover:ring-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer relative group/card shadow-2xl"
              @click="openMaterial(material.id)"
            >
              <div
                 class="h-full w-full flex items-center justify-center relative"
                 :style="`background-image: url('${material.image_url ? resolveStorageUrl(material.image_url) : '/material-placeholder.png'}'); background-size: cover; background-position: center;`"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end p-4 group-hover/card:via-black/20 transition-all duration-300">
                   <h4 class="text-sm font-bold text-white drop-shadow-lg leading-tight">{{ material.title }}</h4>
                </div>
                <!-- Magic Card Badge -->
                <div class="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.8)] border border-blue-300">
                  <span class="text-[10px] text-white font-black italic">M</span>
                </div>
              </div>

              <!-- Hover Info (Netflix style drop down panel inside card) -->
              <div class="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 backdrop-blur-sm">
                 <div class="transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                    <p class="text-[10px] text-green-400 font-black mb-1 tracking-widest uppercase">New Quest</p>
                    <div class="flex items-center gap-2 mb-3">
                      <span class="px-1.5 py-0.5 border border-gray-400 text-[9px] text-gray-300 rounded uppercase tracking-widest font-bold">{{ material.major_target || 'Umum' }}</span>
                    </div>
                    <div class="flex gap-2">
                      <button class="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.5)] text-sm">▶</button>
                      <button @click.stop="addToMyList(material)" class="w-8 h-8 rounded-full border-2 border-gray-400 text-white flex items-center justify-center hover:border-white hover:bg-gray-700/50 transition shadow-lg text-sm">+</button>
                    </div>
                 </div>
              </div>
            </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../api';

import { useRouter, useRoute } from 'vue-router';
import { resolveStorageUrl } from '../utils/storage';
import { isDemoMode, getDemoMaterials, getDemoQuizzes, getDemoStudent, getDemoRecommendations } from '../utils/demo';
import { useDialog } from '../utils/dialog';
import { getStaffUser } from '../utils/auth';

const router = useRouter();
const route = useRoute();
const materials = ref<any[]>([]);
const quizzes = ref<any[]>([]);
const featuredMaterial = ref<any>(null);
const student = ref<any>(null);
const recommendations = ref<any[]>([]);
const previewStudents = ref<any[]>([]);
const selectedPreviewStudentId = ref('');
const demoMode = isDemoMode();
const dialog = useDialog();
const staffUser = getStaffUser();
const isAdminPreview = computed(
  () =>
    route.path.startsWith('/admin/student-dashboard') &&
    (staffUser?.role === 'admin' || staffUser?.role === 'guru')
);



const stripHtml = (html: string) => {
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

const normalizeTarget = (value: any) => String(value ?? '').trim().toLowerCase();
const isAllTarget = (value: any) => {
    const normalized = normalizeTarget(value);
    return normalized === '' || normalized === 'semua' || normalized === 'all';
};

const isMaterialAllowed = (material: any) => {
    if (!student.value) return false;
    const targetGrade = material?.target_grade;
    const targetMajor = material?.major_target;
    const targetClass = material?.target_class;
    const targetSchool = material?.target_school;
    const matchesGrade =
        targetGrade === null ||
        targetGrade === undefined ||
        targetGrade === '' ||
        Number(targetGrade) === Number(student.value.grade_level);
    const matchesMajor =
        isAllTarget(targetMajor) || normalizeTarget(targetMajor) === normalizeTarget(student.value.major);
    const viewerClass = student.value.class_name || student.value.className || student.value.class;
    const matchesClass =
        isAllTarget(targetClass) || normalizeTarget(targetClass) === normalizeTarget(viewerClass);
    const matchesSchool =
        isAllTarget(targetSchool) || normalizeTarget(targetSchool) === normalizeTarget(student.value.school);
    return matchesGrade && matchesMajor && matchesClass && matchesSchool;
};

const openMaterial = (id: string) => {
    if (!student.value) {
        // Redirect to login with return path
        router.push(`/login?redirect=/material/${id}`);
    } else {
        router.push(`/material/${id}`);
    }
};

const openQuiz = (id: string) => {
    if (!student.value) {
         router.push(`/login?redirect=/quiz/${id}`);
    } else {
         router.push(`/quiz/${id}`);
    }
};

const loadPreviewStudents = async () => {
  if (!isAdminPreview.value) return;
  try {
    const { data } = await api.get('/students', { params: { page: 1, limit: 300 } });
    const rows = Array.isArray(data?.data) ? data.data : [];
    previewStudents.value = rows;
    if (!selectedPreviewStudentId.value && rows.length > 0) {
      selectedPreviewStudentId.value = rows[0].id;
      student.value = rows[0];
    }
  } catch (e) {
    console.error('Failed to load preview students', e);
  }
};

const handlePreviewStudentChange = () => {
  const selected = previewStudents.value.find((s: any) => s.id === selectedPreviewStudentId.value);
  student.value = selected || null;
  fetchData();
  fetchRecommendations();
};

const fetchData = async () => {
  try {
    if (demoMode) {
      student.value = getDemoStudent();
      materials.value = getDemoMaterials();
      quizzes.value = getDemoQuizzes();
      featuredMaterial.value = materials.value[0] || null;
      return;
    }
    const [matRes, quizRes] = await Promise.all([
      api.get('/materials'),
      api.get('/quizzes')
    ]);
    const allMaterials = Array.isArray(matRes.data) ? matRes.data : matRes.data?.data || [];
    materials.value = student.value ? allMaterials.filter(isMaterialAllowed) : allMaterials;
    quizzes.value = quizRes.data;

    // Find featured
    featuredMaterial.value = materials.value.find((m: any) => m.is_featured) || materials.value[0];
  } catch (e) {
    console.error("Failed to load dashboard data", e);
  }
};

const fetchRecommendations = async () => {
  if (demoMode) {
    recommendations.value = getDemoRecommendations();
    return;
  }
  if (!student.value?.id) return;
  try {
    const { data } = await api.get(`/students/${student.value.id}/recommendations`);
    recommendations.value = Array.isArray(data?.recommendations) ? data.recommendations : [];
  } catch (e) {
    console.error("Failed to load recommendations", e);
  }
};

const addToMyList = (material: any) => {
  const studentData = localStorage.getItem('student');
  if (!studentData) {
      dialog.confirm('Anda harus login untuk menyimpan materi. Login sekarang?', 'Login Diperlukan')
        .then((ok) => {
          if (ok) router.push('/login');
        });
      return;
  }

  const student = JSON.parse(studentData);
  const key = `myList_${student.id || student.nisn}`; // Use unique ID/NISN

  const saved = localStorage.getItem(key);
  let list = saved ? JSON.parse(saved) : [];
  const materialId = material.id || material.material_id;

  if (!materialId) {
    void dialog.alert('Materi tidak valid untuk disimpan.');
    return;
  }

  if (!list.find((m: any) => m.id === materialId)) {
    list.push({ ...material, id: materialId });
    localStorage.setItem(key, JSON.stringify(list));
    void dialog.alert('Berhasil ditambahkan ke Daftar Saya!');
  } else {
    void dialog.alert('Materi ini sudah ada di Daftar Saya.');
  }
};

const intervalId = ref<any>(null);

onMounted(() => {
    if (isAdminPreview.value) {
        loadPreviewStudents().then(() => {
            fetchData();
            fetchRecommendations();
        });
    } else {
        const saved = localStorage.getItem('student');
        if (saved) {
            student.value = JSON.parse(saved);
        }
        fetchData();
        fetchRecommendations();
    }
    // Poll every 5 seconds for live updates
    if (!demoMode) {
        intervalId.value = setInterval(fetchData, 5000);
    }
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
    if (intervalId.value) clearInterval(intervalId.value);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
