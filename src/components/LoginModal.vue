<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center md:p-6 bg-black/90 backdrop-blur-md">
      <div
        class="w-full h-full md:h-[600px] md:max-h-[90vh] md:max-w-5xl bg-gray-900 md:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden relative flex flex-col md:flex-row"
        @click.stop
      >
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 z-50 text-gray-400 hover:text-white transition bg-black/30 md:bg-gray-800/50 rounded-full p-2 hover:bg-black/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Banner / Image (Top on Mobile, Left on Desktop) -->
        <div class="relative w-full flex-1 md:w-1/2 md:flex-none bg-black overflow-hidden border-b md:border-b-0 md:border-r border-gray-800 flex items-center justify-center">
          <!-- Gradient Overlays for smooth blending -->
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-900 z-10"></div>
          
          <img src="/login-illustration.png" alt="Mathflix Hero" class="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen transform md:scale-105 hover:scale-110 transition duration-1000 ease-out" />
        </div>

        <!-- Content (Bottom on Mobile, Right on Desktop) -->
        <div class="w-full flex-none pb-10 pt-8 px-8 md:w-1/2 md:flex md:flex-col md:justify-center md:px-14 bg-gray-900 relative z-20">
          <div class="text-center mb-8 md:mb-12">
            <h1 class="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 tracking-tighter mb-2 italic drop-shadow-2xl">MATHFLIX</h1>
            <p class="text-gray-400 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Satu Pintu Akses Belajar</p>
          </div>

          <div class="space-y-6">
            <div class="text-center text-sm md:text-base text-gray-300 font-medium px-4">
              Masuk dengan akun Google Anda untuk melanjutkan ke platform pembelajaran.
            </div>

            <button
              type="button"
              @click="handleGoogleLogin"
              class="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 md:py-5 rounded-2xl hover:bg-gray-100 transition transform hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.15)] border border-gray-200"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              MASUK DENGAN GOOGLE
            </button>

            <button
              type="button"
              @click="handleDemoLogin"
              class="w-full flex items-center justify-center gap-3 bg-gray-800 text-gray-300 font-bold py-3 md:py-4 rounded-2xl hover:bg-gray-700 hover:text-white transition transform hover:scale-[1.02] active:scale-95 border border-gray-700 mt-4"
            >
              <span class="text-xl">🎮</span>
              COBA VERSI DEMO
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'logged-in']);

const handleGoogleLogin = () => {
  // Redirect ke backend OAuth endpoint
  // Gunakan /api secara default di produksi agar mengikuti domain saat ini
  const apiUrl = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');
  window.location.href = `${apiUrl}/auth/google`;
};

import { enableDemo } from '../utils/demo';

const handleDemoLogin = () => {
  enableDemo();
  emit('close');
  // Refresh page to ensure everything loads in demo mode
  window.location.href = '/';
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .w-full,
.modal-leave-active .w-full {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .w-full,
.modal-leave-to .w-full {
  transform: scale(0.95) translateY(10px);
}
</style>
