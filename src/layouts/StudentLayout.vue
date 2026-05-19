<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans">
    <!-- Navbar -->
    <nav class="fixed top-0 z-50 w-full flex flex-col bg-gradient-to-b from-black/90 to-black/40 backdrop-blur-sm transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" :class="{ 'bg-black': isScrolled }">
      <!-- Top Row: Logo & Profile -->
      <div class="px-4 md:px-12 py-4 flex items-center justify-between w-full relative z-20">
        <div class="flex items-center gap-8">
          <router-link to="/" class="text-2xl font-bold text-red-600 tracking-wider leading-none">MATHFLIX</router-link>
          
          <ul class="hidden md:flex gap-6 text-sm text-gray-300 ml-4">
            <li>
              <router-link
                to="/"
                class="transition"
                :class="isMenuDisabled('/') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
              >Home</router-link>
            </li>
            <li>
              <router-link
                to="/leaderboard"
                class="transition"
                :class="isMenuDisabled('/leaderboard') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
              >Leaderboard</router-link>
            </li>
            <li>
              <router-link
                to="/shop"
                class="transition font-black text-orange-400"
                :class="isMenuDisabled('/shop') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]'"
              >🛒 Merchant</router-link>
            </li>
            <li>
                <router-link
                  to="/announcements"
                  class="transition relative"
                  :class="isMenuDisabled('/announcements') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
                >
                    Pengumuman
                    <span v-if="hasNotification" class="absolute -top-1 -right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                </router-link>
            </li>
            <li>
                <router-link
                  to="/assignments"
                  class="transition relative"
                  :class="isMenuDisabled('/assignments') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
                >
                    Tugas Saya
                    <span v-if="hasAssignmentNotification" class="absolute -top-1 -right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                </router-link>
            </li>
            <li>
              <router-link
                to="/reflections"
                class="transition"
                :class="isMenuDisabled('/reflections') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
              >Jurnal</router-link>
            </li>
            <li>
              <router-link
                to="/s-badges"
                class="transition"
                :class="isMenuDisabled('/s-badges') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
              >Pencapaian</router-link>
            </li>
            <li>
              <router-link
                to="/my-list"
                class="transition"
                :class="isMenuDisabled('/my-list') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
              >Daftar Saya</router-link>
            </li>
            <li>
                <router-link
                  to="/discuss"
                  class="transition relative"
                  :class="isMenuDisabled('/discuss') ? 'text-gray-500 cursor-not-allowed' : 'hover:text-white'"
                >
                    Diskusi
                    <span v-if="hasDiscussNotification" class="absolute -top-1 -right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                </router-link>
            </li>
          </ul>
        </div>
        <div class="flex items-center gap-4 text-sm font-medium relative">
           <!-- My List Button (Floating Bookmark) -->
           <router-link
             v-if="student"
             to="/my-list"
             class="w-10 h-10 flex items-center justify-center bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-full hover:bg-red-600 hover:border-red-500 shadow-lg transition-all duration-300 relative group"
           >
             <span class="text-xl filter drop-shadow-sm group-hover:scale-110 transition-transform">🔖</span>
             <!-- Tooltip -->
             <span class="absolute -bottom-8 opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-black/90 px-2 py-1 rounded text-white whitespace-nowrap transition-opacity pointer-events-none z-50">Daftar Saya</span>
           </router-link>

           <!-- Profile Dropdown Trigger -->
           <div
             v-if="student"
             class="flex items-center gap-3 cursor-pointer"
             @click="openProfileModal"
           >
               <span class="hidden sm:block">{{ student.full_name }}</span>
               <div v-if="student.photo_profile" class="w-8 h-8 rounded bg-gray-700 overflow-hidden">
                   <img :src="resolveStorageUrl(student.photo_profile)" alt="Profile" class="w-full h-full object-cover">
               </div>
               <div v-else class="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold">
                   {{ initials }}
               </div>
           </div>

           <!-- Login Button if no user -->
           <button
             v-else
             @click="showLoginModal = true"
             class="bg-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-700 transition transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
           >
             Masuk
           </button>


        </div>
      </div>

      <!-- Separator -->
      <div class="w-full h-[1px] bg-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.9)] relative z-20"></div>

      <!-- Bottom Row: Game Badges -->
      <div class="w-full px-4 md:px-12 py-3 flex justify-center md:justify-start gap-8 relative z-10 bg-black/30">
        <!-- Game Style Ranking Button -->
        <router-link to="/leaderboard" class="relative cursor-pointer transform transition hover:scale-105 active:scale-95 block w-36">
          <div class="h-9 w-full bg-gradient-to-b from-[#7a8cff] to-[#3f4ebd] rounded-xl border-t-2 border-white/30 border-b-2 border-black/40 shadow-lg flex items-center justify-center relative overflow-hidden">
            <div class="absolute top-0 left-[5%] w-[90%] h-[35%] bg-white/25 rounded-full blur-[0.5px]"></div>
            <span class="text-white font-black text-[12px] uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10 ml-4 text-shadow-sm">Rank 12</span>
          </div>
          <div class="absolute -left-4 -top-2 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)] z-20">
            <span class="text-[42px]">🏆</span>
          </div>
        </router-link>

        <!-- Game Style Achievement Button -->
        <router-link to="/s-badges" class="relative cursor-pointer transform transition hover:scale-105 active:scale-95 block w-36">
          <div class="h-9 w-full bg-gradient-to-b from-[#ff6b9e] to-[#b51d58] rounded-xl border-t-2 border-white/30 border-b-2 border-black/40 shadow-lg flex items-center justify-center relative overflow-hidden">
            <div class="absolute top-0 left-[5%] w-[90%] h-[35%] bg-white/25 rounded-full blur-[0.5px]"></div>
            <span class="text-white font-black text-[12px] uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10 mr-4 text-shadow-sm">VIP</span>
          </div>
          <div class="absolute -right-4 -top-2 filter drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)] z-20">
            <span class="text-[42px]">💎</span>
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="pt-[130px] pb-20 md:pb-0">
      <transition name="fade">
        <div
          v-if="toastMessage"
          class="fixed top-20 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg z-[120]"
        >
          {{ toastMessage }}
        </div>
      </transition>
      <div
        v-if="accessStatus === 'grace'"
        class="mx-4 md:mx-12 mb-4 bg-amber-900/40 border border-amber-700 text-amber-200 px-4 py-3 rounded text-sm"
      >
        Akses siswa masih dalam masa tenggang.
        <span v-if="accessGraceUntil">Berlaku hingga {{ accessGraceUntil }}.</span>
      </div>
      <div
        v-if="accessStatus === 'blocked'"
        class="mx-4 md:mx-12 mb-4 bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded text-sm"
      >
        Akses sementara ditunda karena kuota berbayar belum dilunasi. Hubungi guru untuk mengaktifkan kembali.
      </div>
      <router-view v-if="accessStatus !== 'blocked' && !isGraceRestricted" />
      <div v-else-if="accessStatus === 'blocked'" class="mx-4 md:mx-12 mt-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
          <div class="text-lg font-bold mb-2">Akses Ditunda</div>
          <p class="text-sm text-gray-300 mb-4">
            Akses Mathflix untuk siswa ini menunggu pembayaran guru. Silakan hubungi guru untuk melanjutkan.
          </p>
          <router-link to="/login" class="text-red-400 hover:text-red-300 text-sm font-semibold">Kembali ke Login</router-link>
        </div>
      </div>
      <div v-else-if="isGraceRestricted" class="mx-4 md:mx-12 mt-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
          <div class="text-lg font-bold mb-2">Akses Terbatas</div>
          <p class="text-sm text-gray-300 mb-4">
            Selama masa tenggang, hanya Pengumuman, Leaderboard, dan Diskusi yang bisa diakses.
          </p>
          <div class="flex flex-wrap justify-center gap-3 text-sm">
            <router-link to="/announcements" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Pengumuman</router-link>
            <router-link to="/leaderboard" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Leaderboard</router-link>
            <router-link to="/discuss" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Diskusi</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB Dihapus karena fungsinya sudah dipindahkan -->

    <!-- Bottom Navigation (Mobile Only) - Game Style -->
    <div class="md:hidden fixed bottom-0 w-full bg-[#1E88E5] border-t-[4px] border-[#FFA000] grid grid-cols-6 z-[100] shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
      
      <!-- Home -->
      <router-link to="/" custom v-slot="{ isExactActive, navigate }">
        <div @click="navigate" class="relative flex flex-col items-center cursor-pointer transition-all duration-300 border-r border-black/20" :class="[isExactActive ? 'bg-[#42A5F5] -mt-4 h-[80px] rounded-t-xl border-t-[3px] border-[#FFCA28] shadow-[0_-5px_10px_rgba(0,0,0,0.2)] z-10 justify-end pb-1.5' : 'h-16 justify-center hover:bg-blue-500/50']">
          <span class="filter drop-shadow-md transition-all duration-300 z-10" :class="[isExactActive ? 'text-[38px] -translate-y-1' : 'text-[28px] translate-y-1 opacity-80']">🏰</span>
          <span v-if="isExactActive" class="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md leading-none text-shadow-sm mt-1">Home</span>
        </div>
      </router-link>

      <!-- Tugas -->
      <router-link to="/assignments" custom v-slot="{ isActive, navigate }">
        <div @click="navigate" class="relative flex flex-col items-center cursor-pointer transition-all duration-300 border-r border-black/20" :class="[isActive ? 'bg-[#42A5F5] -mt-4 h-[80px] rounded-t-xl border-t-[3px] border-[#FFCA28] shadow-[0_-5px_10px_rgba(0,0,0,0.2)] z-10 justify-end pb-1.5' : 'h-16 justify-center hover:bg-blue-500/50']">
          <div class="relative filter drop-shadow-md transition-all duration-300 z-10" :class="[isActive ? 'text-[38px] -translate-y-1' : 'text-[28px] translate-y-1 opacity-80']">
            ⚔️
            <span v-if="hasAssignmentNotification" class="absolute -top-1 -right-2 w-5 h-5 bg-gradient-to-b from-red-500 to-red-700 rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-black shadow-md">!</span>
          </div>
          <span v-if="isActive" class="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md leading-none text-shadow-sm mt-1">Tugas</span>
        </div>
      </router-link>

      <!-- Jurnal -->
      <router-link to="/reflections" custom v-slot="{ isActive, navigate }">
        <div @click="navigate" class="relative flex flex-col items-center cursor-pointer transition-all duration-300 border-r border-black/20" :class="[isActive ? 'bg-[#42A5F5] -mt-4 h-[80px] rounded-t-xl border-t-[3px] border-[#FFCA28] shadow-[0_-5px_10px_rgba(0,0,0,0.2)] z-10 justify-end pb-1.5' : 'h-16 justify-center hover:bg-blue-500/50']">
          <span class="filter drop-shadow-md transition-all duration-300 z-10" :class="[isActive ? 'text-[38px] -translate-y-1' : 'text-[28px] translate-y-1 opacity-80']">📖</span>
          <span v-if="isActive" class="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md leading-none text-shadow-sm mt-1">Jurnal</span>
        </div>
      </router-link>

      <!-- Merchant / Shop -->
      <router-link to="/shop" custom v-slot="{ isActive, navigate }">
        <div @click="navigate" class="relative flex flex-col items-center cursor-pointer transition-all duration-300 border-r border-black/20" :class="[isActive ? 'bg-[#42A5F5] -mt-4 h-[80px] rounded-t-xl border-t-[3px] border-[#FFCA28] shadow-[0_-5px_10px_rgba(0,0,0,0.2)] z-10 justify-end pb-1.5' : 'h-16 justify-center hover:bg-blue-500/50']">
          <span class="filter drop-shadow-md transition-all duration-300 z-10" :class="[isActive ? 'text-[38px] -translate-y-1' : 'text-[28px] translate-y-1 opacity-80']">🛒</span>
          <span v-if="isActive" class="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md leading-none text-shadow-sm mt-1">Merchant</span>
        </div>
      </router-link>

      <!-- Info -->
      <router-link to="/announcements" custom v-slot="{ isActive, navigate }">
        <div @click="navigate" class="relative flex flex-col items-center cursor-pointer transition-all duration-300 border-r border-black/20" :class="[isActive ? 'bg-[#42A5F5] -mt-4 h-[80px] rounded-t-xl border-t-[3px] border-[#FFCA28] shadow-[0_-5px_10px_rgba(0,0,0,0.2)] z-10 justify-end pb-1.5' : 'h-16 justify-center hover:bg-blue-500/50']">
          <div class="relative filter drop-shadow-md transition-all duration-300 z-10" :class="[isActive ? 'text-[38px] -translate-y-1' : 'text-[28px] translate-y-1 opacity-80']">
            📢
            <span v-if="hasNotification" class="absolute -top-1 -right-2 w-5 h-5 bg-gradient-to-b from-green-400 to-green-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-black shadow-md">1</span>
          </div>
          <span v-if="isActive" class="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md leading-none text-shadow-sm mt-1">Info</span>
        </div>
      </router-link>

      <!-- Diskusi -->
      <router-link to="/discuss" custom v-slot="{ isActive, navigate }">
        <div @click="navigate" class="relative flex flex-col items-center cursor-pointer transition-all duration-300" :class="[isActive ? 'bg-[#42A5F5] -mt-4 h-[80px] rounded-t-xl border-t-[3px] border-[#FFCA28] shadow-[0_-5px_10px_rgba(0,0,0,0.2)] z-10 justify-end pb-1.5' : 'h-16 justify-center hover:bg-blue-500/50']">
          <div class="relative filter drop-shadow-md transition-all duration-300 z-10" :class="[isActive ? 'text-[38px] -translate-y-1' : 'text-[28px] translate-y-1 opacity-80']">
            🛡️
            <span v-if="hasDiscussNotification" class="absolute -top-1 -right-2 w-5 h-5 bg-gradient-to-b from-red-500 to-red-700 rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-black shadow-md">!</span>
          </div>
          <span v-if="isActive" class="text-white font-black text-[10px] uppercase tracking-wider drop-shadow-md leading-none text-shadow-sm mt-1">Diskusi</span>
        </div>
      </router-link>

    </div>

     <!-- Foto Profil Modal -->
     <transition name="fade">
       <div v-if="showPhotoModal" class="fixed inset-0 z-[130] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closePhotoModal"></div>
         <div class="relative w-full max-w-md rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10">
           <div class="p-6 border-b border-white/10 flex items-center justify-between">
             <div>
               <h3 class="text-lg font-bold">Ubah Foto Profil</h3>
               <p class="text-xs text-gray-400">Unggah foto profil untuk akun siswa.</p>
             </div>
             <button class="text-slate-400 hover:text-white" @click="closePhotoModal">✕</button>
           </div>
           <div class="p-6 space-y-4">
             <div class="flex items-center gap-4">
               <div class="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                 <img v-if="photoPreview" :src="photoPreview" alt="Preview" class="w-full h-full object-cover">
                 <span v-else class="text-xs text-slate-500">Preview</span>
               </div>
               <div class="flex-1">
                 <input type="file" accept="image/*" @change="handlePhotoSelected" class="block w-full text-sm text-slate-300">
                 <p class="text-[11px] text-slate-500 mt-1">Maks 5MB (JPG/PNG/WEBP/GIF).</p>
               </div>
             </div>
             <div v-if="photoPreview" class="space-y-3">
               <div class="flex flex-wrap gap-2 text-xs">
                 <button
                   type="button"
                   class="px-3 py-1 rounded-full border"
                   :class="photoRatio === '1:1' ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'border-white/10 text-slate-300'"
                   @click="setPhotoRatio('1:1')"
                 >
                   1:1
                 </button>
                 <button
                   type="button"
                   class="px-3 py-1 rounded-full border"
                   :class="photoRatio === '4:3' ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'border-white/10 text-slate-300'"
                   @click="setPhotoRatio('4:3')"
                 >
                   4:3
                 </button>
               </div>
               <div>
                 <label class="text-[11px] text-slate-400">Zoom</label>
                 <input
                   type="range"
                   min="1"
                   max="3"
                   step="0.05"
                   v-model.number="photoZoom"
                   @input="refreshCropPreview"
                   class="w-full"
                 >
               </div>
               <p class="text-[10px] text-slate-500">Hasil akan otomatis dipotong sesuai rasio dan dikompres.</p>
             </div>
             <div v-if="photoError" class="text-xs text-rose-400">{{ photoError }}</div>
           </div>
           <div class="p-6 border-t border-white/10 flex items-center justify-end gap-3">
             <button class="px-4 py-2 rounded-full text-sm font-semibold bg-slate-800 hover:bg-slate-700" @click="closePhotoModal">Batal</button>
             <button
               class="px-5 py-2 rounded-full text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-black disabled:opacity-60"
               :disabled="photoUploading || !photoFile"
               @click="uploadPhoto"
             >
               {{ photoUploading ? 'Mengunggah...' : 'Simpan Foto' }}
             </button>
           </div>
         </div>
       </div>
     </transition>

     <!-- Login Modal -->
     <LoginModal :is-open="showLoginModal" @close="showLoginModal = false" @logged-in="handleLoggedIn" />

     <!-- Developer Widget (Modal) -->
     <DeveloperWidget :is-open="showDevInfo" @close="showDevInfo = false" />

     <!-- Profiling Modal (Wajib isi) -->
     <ProfilingModal :is-open="showProfilingModal" :student-data="student" @saved="handleProfileSaved" />

     <!-- Profile Modal -->
     <transition name="fade">
       <div
         v-if="showProfileModal && student"
         class="fixed inset-0 z-[130] flex items-center justify-center px-4"
       >
         <div class="absolute inset-0 bg-black/70" @click="showProfileModal = false"></div>
         <div class="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden">
           <div class="p-5 border-b border-white/10 flex items-start justify-between">
             <div>
               <div class="text-xs text-gray-400 uppercase tracking-widest font-semibold">Informasi User</div>
               <div class="text-lg font-bold text-white mt-1">{{ student.full_name }}</div>
             </div>
             <button class="text-gray-400 hover:text-white" @click="showProfileModal = false">✕</button>
           </div>
           <div class="p-5 space-y-4">
             <div class="flex items-center gap-4">
               <div v-if="student.photo_profile" class="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                 <img :src="resolveStorageUrl(student.photo_profile)" alt="Foto Profil" class="w-full h-full object-cover">
               </div>
               <div v-else class="w-16 h-16 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-2xl">
                 {{ initials }}
               </div>
               <div class="text-sm text-gray-300 space-y-1">
                 <div><span class="text-gray-500">Kelas:</span> {{ student.class_name || student.class || '-' }}</div>
                 <div><span class="text-gray-500">Jurusan:</span> {{ student.major || '-' }}</div>
                 <div><span class="text-gray-500">NISN:</span> {{ student.nisn || '-' }}</div>
               </div>
             </div>

             <div class="grid grid-cols-1 gap-2">
               <router-link
                 to="/profile"
                 class="text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-emerald-400 font-semibold"
                 @click="showProfileModal = false"
               >
                 Profil Saya
               </router-link>
               <button
                 v-if="student && !demoMode"
                 class="text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 font-semibold"
                 @click="showProfileModal = false; openPhotoModal()"
               >
                 Ubah Foto Profil
               </button>
               <button
                 v-if="demoMode"
                 class="text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-yellow-400 font-semibold"
                 @click="showProfileModal = false; resetDemoSession()"
               >
                 Reset Demo
               </button>
               <button
                 class="text-left px-4 py-3 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 font-semibold"
                 @click="showProfileModal = false; logout()"
               >
                 Keluar
               </button>
             </div>
           </div>
         </div>
       </div>
     </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DeveloperWidget from '../components/DeveloperWidget.vue';
import LoginModal from '../components/LoginModal.vue';
import ProfilingModal from '../components/ProfilingModal.vue';
import api from '../api';
import billingApi from '../api/billing';
import { isDemoMode, enableDemo, resetDemo, getDemoStudent } from '../utils/demo';
import { setAuthToken } from '../utils/auth';
import { resolveStorageUrl } from '../utils/storage';
import { useDialog } from '../utils/dialog';

const router = useRouter();
const route = useRoute();
const isScrolled = ref(false);
const student = ref<any>(null);
const showMenu = ref(false);
const showProfileModal = ref(false);
const showDevInfo = ref(false);
const showLoginModal = ref(false);
const showPhotoModal = ref(false);
const showProfilingModal = ref(false);
const photoFile = ref<File | null>(null);
const photoPreview = ref<string>('');
const photoImage = ref<HTMLImageElement | null>(null);
const photoBlob = ref<Blob | null>(null);
const photoRatio = ref<'1:1' | '4:3'>('1:1');
const photoZoom = ref(1);
const photoUploading = ref(false);
const photoError = ref('');
const hasNotification = ref(false);
const hasAssignmentNotification = ref(false);
const hasDiscussNotification = ref(false);
const accessStatus = ref<'ok' | 'grace' | 'blocked'>('ok');
const accessGraceUntil = ref<string | null>(null);
let pollingInterval: any = null;
const ACCESS_POLL_INTERVAL = 2000;
const demoMode = ref(isDemoMode());
const STUDENT_UPDATED_EVENT = 'student-updated';
const dialog = useDialog();

const openPhotoModal = () => {
  showMenu.value = false;
  showProfileModal.value = false;
  photoError.value = '';
  photoFile.value = null;
  photoImage.value = null;
  photoBlob.value = null;
  photoRatio.value = '1:1';
  photoZoom.value = 1;
  if (photoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(photoPreview.value);
  }
  photoPreview.value = student.value?.photo_profile
    ? resolveStorageUrl(student.value.photo_profile)
    : '';
  showPhotoModal.value = true;
};

const closePhotoModal = () => {
  showPhotoModal.value = false;
  photoError.value = '';
  photoFile.value = null;
  photoImage.value = null;
  photoBlob.value = null;
  if (photoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(photoPreview.value);
  }
  photoPreview.value = '';
};

const setPhotoRatio = (ratio: '1:1' | '4:3') => {
  photoRatio.value = ratio;
  refreshCropPreview();
};

const refreshCropPreview = async () => {
  if (!photoImage.value) return;
  const ratio = photoRatio.value === '4:3' ? 4 / 3 : 1;
  const outputWidth = ratio === 1 ? 512 : 640;
  const outputHeight = ratio === 1 ? 512 : 480;
  const img = photoImage.value;

  const imageRatio = img.width / img.height;
  let baseCropWidth = img.width;
  let baseCropHeight = img.height;
  if (imageRatio > ratio) {
    baseCropHeight = img.height;
    baseCropWidth = img.height * ratio;
  } else {
    baseCropWidth = img.width;
    baseCropHeight = img.width / ratio;
  }
  const zoom = Math.max(1, Math.min(3, photoZoom.value || 1));
  const cropWidth = baseCropWidth / zoom;
  const cropHeight = baseCropHeight / zoom;
  const cropX = (img.width - cropWidth) / 2;
  const cropY = (img.height - cropHeight) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
  photoPreview.value = canvas.toDataURL('image/jpeg', 0.85);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.8)
  );
  photoBlob.value = blob;
};

const handlePhotoSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files.item(0);
  if (!file) return;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    photoError.value = 'Format file harus JPG/PNG/WEBP/GIF.';
    return;
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    photoError.value = 'Ukuran file maksimal 5MB.';
    return;
  }
  photoFile.value = file;
  photoError.value = '';
  if (photoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(photoPreview.value);
  }
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    photoImage.value = img;
    refreshCropPreview();
  };
  img.src = objectUrl;
};

const uploadPhoto = async () => {
  if (!student.value?.id || !photoFile.value) return;
  photoUploading.value = true;
  photoError.value = '';
  try {
    let fileToUpload: File = photoFile.value;
    if (photoBlob.value) {
      fileToUpload = new File([photoBlob.value], `profile-${student.value.id}.jpg`, {
        type: 'image/jpeg',
      });
    }
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const photoUrl = data?.url;
    if (!photoUrl) throw new Error('URL upload tidak ditemukan.');
    const { data: updated } = await api.put(`/students/${student.value.id}`, {
      photo_profile: photoUrl,
    });
    const nextStudent = updated?.data || updated || {};
    student.value = { ...student.value, ...nextStudent, photo_profile: photoUrl };
    localStorage.setItem('student', JSON.stringify(student.value));
    closePhotoModal();
  } catch (e: any) {
    photoError.value = e?.response?.data?.error || e?.message || 'Gagal mengunggah foto.';
  } finally {
    photoUploading.value = false;
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const loadStudent = () => {
    const saved = localStorage.getItem('student');
    if (saved) {
        student.value = JSON.parse(saved);
    } else if (demoMode.value) {
        enableDemo();
        student.value = getDemoStudent();
    }
};

const handleStudentUpdated = () => {
    loadStudent();
};

const formatAccessDate = (dateInput?: string | null) => {
    if (!dateInput) return null;
    try {
        return new Date(dateInput).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return null;
    }
};

const resolveAccessStatus = (payload?: any) => {
    const statusRaw = payload?.status || payload?.access_status || payload?.billing_status;
    if (statusRaw === 'blocked') return 'blocked';
    if (statusRaw === 'grace') return 'grace';
    return 'ok';
};

const checkAccessStatus = async () => {
    if (demoMode.value || !student.value?.id) return;
    try {
        const { data } = await billingApi.get('/billing/access', { params: { student_id: student.value.id } });
        const statusPayload = data?.data || data;
        accessStatus.value = resolveAccessStatus(statusPayload);
        accessGraceUntil.value = formatAccessDate(statusPayload?.grace_until);
    } catch (e) {
        const fallbackStatus = resolveAccessStatus(student.value);
        accessStatus.value = fallbackStatus;
        accessGraceUntil.value = formatAccessDate(student.value?.grace_until);
    }
};

const checkNotifications = async () => {
    if (demoMode.value || !student.value?.id) return;
    try {
        const { data } = await api.get('/announcements', { params: { student_id: student.value.id } });
        const announcements = Array.isArray(data) ? data : data?.data || [];
        hasNotification.value = announcements.some((item: any) => !item.has_read);
    } catch (e) {
        // ignore
    }
};

const markAllAnnouncementsRead = async () => {
    if (demoMode.value || !student.value?.id) return;
    try {
        const { data } = await api.get('/announcements', { params: { student_id: student.value.id } });
        const announcements = Array.isArray(data) ? data : data?.data || [];
        const unread = announcements.filter((item: any) => !item.has_read);
        await Promise.all(
            unread.map((item: any) => api.post(`/announcements/${item.id}/read`, { student_id: student.value.id }))
        );
        hasNotification.value = false;
    } catch (e) {
        // ignore
    }
};

const checkDiscussNotifications = async (): Promise<void> => {
    if (demoMode.value || !student.value?.id) return;
    try {
        const { data } = await api.get('/discussions', { params: { user_id: student.value.id } });
        const discussions = Array.isArray(data) ? data : data?.data || [];
        hasDiscussNotification.value = discussions.some((d: any) => d.has_unread);
    } catch (e) {
        // ignore
    }
};

const handleProfileSaved = async (profileData: any) => {
    if(!student.value) return;
    try {
        const payload = {
            id: student.value.id, // Email
            nisn: profileData.nisn,
            full_name: student.value.full_name,
            school: profileData.school,
            grade_level: profileData.grade_level,
            class_name: profileData.class_name,
            major: profileData.major,
            hp: 100, // starting hp
            ap: 0,
            xp: 0,
            level: 1,
            status: 'active'
        };

        // Sync to backend via billing endpoint which acts as local DB
        await api.post('/billing/students/sync', payload);

        // Update local storage
        const updatedStudent = { ...student.value, ...payload };
        localStorage.setItem('student', JSON.stringify(updatedStudent));
        student.value = updatedStudent;
        
        // Hide modal and dispatch event
        showProfilingModal.value = false;
        window.dispatchEvent(new Event(STUDENT_UPDATED_EVENT));
        
        await dialog.alert('Profil pahlawan berhasil disimpan!', 'Profil');
    } catch(e) {
        console.error("Gagal menyimpan profil:", e);
        await dialog.alert('Terjadi kesalahan saat menyimpan profil', 'Profil', 'danger');
    }
};

const markAllDiscussionsRead = async () => {
    if (demoMode.value || !student.value?.id) return;
    try {
        const { data } = await api.get('/discussions', { params: { user_id: student.value.id } });
        const discussions = Array.isArray(data) ? data : data?.data || [];
        const unread = discussions.filter((d: any) => d.has_unread);
        await Promise.all(unread.map((d: any) => api.post(`/discussions/${d.id}/read`, { user_id: student.value.id })));
        hasDiscussNotification.value = false;
    } catch (e) {
        // ignore
    }
};

const getAssignmentTimestamp = (assignment: any) => {
    return assignment?.created_at || assignment?.updated_at || assignment?.due_date || null;
};

const checkAssignmentNotifications = async (): Promise<string | null> => {
    if (demoMode.value) return null;
    if (!student.value) return null;
    try {
        const { data } = await api.get('/assignments/my-assignments', {
            headers: { 'X-Student-ID': student.value.id }
        });
        const assignments = Array.isArray(data) ? data : data?.data || [];
        const latestTimestamp = assignments
            .map(getAssignmentTimestamp)
            .filter(Boolean)
            .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0];
        if (!latestTimestamp) {
            hasAssignmentNotification.value = false;
            return null;
        }
        const lastReadKey = `lastReadAssignment_${student.value.id || student.value.nisn}`;
        const lastRead = localStorage.getItem(lastReadKey);
        if (!lastRead || new Date(latestTimestamp) > new Date(lastRead)) {
            hasAssignmentNotification.value = true;
        } else {
            hasAssignmentNotification.value = false;
        }
        return latestTimestamp;
    } catch (e) {
        // ignore
        return null;
    }
};

const markAssignmentsRead = (latestTimestamp?: string | null) => {
    if (!student.value) return;
    const lastReadKey = `lastReadAssignment_${student.value.id || student.value.nisn}`;
    if (latestTimestamp) {
        localStorage.setItem(lastReadKey, latestTimestamp);
    } else {
        localStorage.setItem(lastReadKey, new Date().toISOString());
    }
    hasAssignmentNotification.value = false;
};

const logout = () => {
    if (demoMode.value) {
        resetDemo();
        demoMode.value = false;
    }
    setAuthToken(null);
    localStorage.removeItem('student');
    router.push('/login');
};

const openProfileModal = () => {
  showMenu.value = false;
  showProfileModal.value = true;
};

const resetDemoSession = () => {
    resetDemo();
    demoMode.value = false;
    setAuthToken(null);
    student.value = null;
    showMenu.value = false;
    router.push('/login');
};

const handleLoggedIn = (payload?: any) => {
    if (payload?.role === 'admin' || payload?.role === 'guru') return;
    student.value = payload || null;
    showMenu.value = false;
    if (!demoMode.value) {
        checkNotifications();
        checkAssignmentNotifications();
        checkDiscussNotifications();
        checkAccessStatus();
    }
};

const initials = computed(() => {
    return student.value?.full_name ? student.value.full_name.charAt(0).toUpperCase() : 'S';
});

const graceAllowedPrefixes = ['/announcements', '/leaderboard', '/discuss'];
const isGraceRestricted = computed(() => {
    if (accessStatus.value !== 'grace') return false;
    return !graceAllowedPrefixes.some((prefix) => route.path.startsWith(prefix));
});

const toastMessage = ref('');
let toastTimeout: number | undefined;

const showToast = (message: string) => {
    toastMessage.value = message;
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(() => {
        toastMessage.value = '';
    }, 2000);
};

const isMenuDisabled = (path: string) => {
    if (accessStatus.value !== 'grace') return false;
    return !graceAllowedPrefixes.some((prefix) => path.startsWith(prefix));
};

onMounted(() => {
    document.documentElement.classList.add('dark');
    window.addEventListener('scroll', handleScroll);
    window.addEventListener(STUDENT_UPDATED_EVENT, handleStudentUpdated);
    loadStudent();
    if (!demoMode.value && student.value && student.value.role === 'student') {
        if (!student.value.school || !student.value.grade_level || !student.value.class_name) {
            showProfilingModal.value = true;
        }
    }
    if (!demoMode.value) {
        checkNotifications();
        checkAssignmentNotifications();
        checkDiscussNotifications();
        checkAccessStatus();
        pollingInterval = setInterval(() => {
            checkNotifications();
            checkAssignmentNotifications();
            checkDiscussNotifications();
            checkAccessStatus();
        }, ACCESS_POLL_INTERVAL);
    }
});

watch(() => route.path, (path) => {
    if (accessStatus.value === 'grace' && !graceAllowedPrefixes.some((prefix) => path.startsWith(prefix))) {
        showToast('Akses terbatas');
        router.push('/announcements');
        return;
    }
    if (path.startsWith('/assignments')) {
        checkAssignmentNotifications().then((latestTimestamp) => {
            if (latestTimestamp) {
                markAssignmentsRead(latestTimestamp);
            }
        });
    }
    if (path.startsWith('/announcements')) {
        markAllAnnouncementsRead();
    }
    if (path.startsWith('/discuss')) {
        markAllDiscussionsRead();
    }
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener(STUDENT_UPDATED_EVENT, handleStudentUpdated);
    if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<style scoped>
/* Custom scrollbar hide if needed */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
