<template>
  <div class="max-w-7xl mx-auto px-4 md:px-12 text-white min-h-[80vh]">
    <h1 class="text-4xl md:text-5xl font-extrabold text-[#ffed4a] mb-8 mt-4 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" style="-webkit-text-stroke: 1px #b45309;">
       📂 Daftar Saya
    </h1>

    <div v-if="myList.length === 0" class="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/50">
      <div class="text-6xl mb-4">📂</div>
      <h2 class="text-xl font-bold text-gray-300">Belum ada konten di daftar Anda</h2>
      <p class="text-gray-500 mt-2">Tandai materi atau kuis favorit Anda untuk melihatnya di sini.</p>
      <router-link to="/" class="mt-6 bg-red-600 px-6 py-2 rounded text-white font-bold hover:bg-red-700 transition">
        Cari Konten
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
       <div
         v-for="item in myList"
         :key="item.id"
         class="bg-gray-800 rounded-md overflow-hidden hover:scale-105 transition duration-300 cursor-pointer relative group"
         @click="$router.push(`/material/${item.id}`)"
       >
          <!-- Placeholder Image -->
          <div class="h-40 w-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
            <h4 class="text-lg font-bold text-center text-white">{{ item.title }}</h4>
          </div>

          <div class="p-4">
             <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-green-400">Saved</span>
                <button @click.stop="removeFromList(item.id)" class="text-gray-400 hover:text-red-500" title="Hapus dari daftar">
                   ✕
                </button>
             </div>
             <h3 class="font-bold text-gray-100 truncate">{{ item.title }}</h3>
             <p class="text-xs text-gray-400">{{ item.major_target || 'General' }}</p>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDialog } from '../utils/dialog';

const myList = ref<any[]>([]);
const router = useRouter();
const student = ref<any>(null);
const dialog = useDialog();

const getStorageKey = () => {
    const studentData = localStorage.getItem('student');
    if (!studentData) return null;
    const parsed = JSON.parse(studentData);
    return `myList_${parsed.id || parsed.nisn}`;
};

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

const loadList = () => {
    const key = getStorageKey();
    if (!key) {
        // Not logged in, maybe redirect or show empty
        return;
    }

    const saved = localStorage.getItem(key);
    if (saved) {
        const parsed = JSON.parse(saved);
        myList.value = student.value ? parsed.filter(isMaterialAllowed) : parsed;
    }
};

const removeFromList = (id: string) => {
    const key = getStorageKey();
    if (!key) return;

    myList.value = myList.value.filter(m => m.id !== id);
    localStorage.setItem(key, JSON.stringify(myList.value));
};

onMounted(async () => {
    const key = getStorageKey();
    if (!key) {
        await dialog.alert("Silakan login untuk melihat daftar saya.");
        router.push('/login');
    } else {
        const savedStudent = localStorage.getItem('student');
        if (savedStudent) {
            student.value = JSON.parse(savedStudent);
        }
        loadList();
    }
});
</script>
