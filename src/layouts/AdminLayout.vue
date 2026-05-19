<template>
  <div class="admin-netflix flex min-h-screen transition-colors duration-300 dark">
    <!-- Sidebar (Desktop) -->
    <aside class="w-64 bg-black/70 text-white flex-col hidden md:flex border-r border-white/10 backdrop-blur">
      <div class="p-6 text-2xl font-black tracking-widest text-amber-500 uppercase border-b border-white/10 drop-shadow-md flex items-center gap-2">
        <span class="text-3xl">👑</span> Guild Master
      </div>
      <nav class="flex-1 px-4 py-6 space-y-4">
        <div class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('utama')"
          >
            Realm
            <span class="text-xs">{{ openSections.utama ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.utama" class="space-y-2">
        <router-link to="/admin/dashboard" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Dashboard
        </router-link>
        <router-link v-if="isAdmin || isGuru" to="/admin/students" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Heroes (Siswa)
        </router-link>
        <router-link v-if="isAdmin || isGuru" to="/admin/student-dashboard" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"></path><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
          Dashboard Siswa
        </router-link>
          </div>
        </div>
        <div class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('konten')"
          >
            Quests & Lore
            <span class="text-xs">{{ openSections.konten ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.konten" class="space-y-2">
        <router-link v-if="isAdmin" to="/admin/activity" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
          Aktivitas
        </router-link>
        <router-link to="/admin/materials" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Regions (Materi)
        </router-link>
        <router-link to="/admin/quizzes" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path></svg>
           Boss Battles (Kuis)
        </router-link>
        <router-link v-if="isAdmin" to="/admin/question-bank" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 6h8"></path><path d="M8 10h8"></path></svg>
          Lore Bank (Soal)
        </router-link>
        <router-link v-if="isAdmin" to="/admin/material-analytics" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
          Analitik Materi
        </router-link>
          </div>
        </div>
        <div class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('komunikasi')"
          >
            Tavern (Komunikasi)
            <span class="text-xs">{{ openSections.komunikasi ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.komunikasi" class="space-y-2">
        <router-link to="/admin/announcements" class="nav-item">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
           Town Crier (Info)
        </router-link>
        <router-link v-if="isAdmin" to="/admin/discuss" class="nav-item">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
           Guild Chat (Diskusi)
        </router-link>
          </div>
        </div>
        <div class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('kelas')"
          >
            Adventures
            <span class="text-xs">{{ openSections.kelas ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.kelas" class="space-y-2">
        <router-link to="/admin/assignments" class="nav-item">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
           Bounties (Tugas)
        </router-link>
          </div>
        </div>
        <div v-if="isGuru" class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('akun')"
          >
            Akun
            <span class="text-xs">{{ openSections.akun ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.akun" class="space-y-2">
        <router-link to="/admin/settings" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 20.91 11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Ubah Password
        </router-link>
          </div>
        </div>
        <div v-if="isAdmin" class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('laporan')"
          >
            Laporan
            <span class="text-xs">{{ openSections.laporan ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.laporan" class="space-y-2">
        <router-link v-if="isAdmin" to="/admin/reflections" class="nav-item">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
           Jurnal Siswa
        </router-link>
        <router-link v-if="isAdmin" to="/admin/grading" class="nav-item">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
           Penilaian
        </router-link>
          </div>
        </div>
        <div v-if="isAdmin" class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:text-white"
            @click="toggleSection('sistem')"
          >
            Sistem
            <span class="text-xs">{{ openSections.sistem ? '–' : '+' }}</span>
          </button>
          <div v-show="openSections.sistem" class="space-y-2">
        <router-link v-if="isAdmin" to="/admin/teachers" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path></svg>
          Guru
        </router-link>
        <router-link v-if="isAdmin" to="/admin/settings" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 20.91 11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Pengaturan
        </router-link>
        <router-link v-if="isAdmin" to="/admin/roles" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path><path d="M4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1"></path></svg>
          Role & Permissions
        </router-link>
        <router-link v-if="isAdmin" to="/admin/audit-log" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M7 12h8"></path><path d="M7 8h10"></path><path d="M7 16h5"></path></svg>
          Audit Log
        </router-link>
          </div>
        </div>
      </nav>
      <div v-if="isGuru" class="px-4 pt-4 text-xs text-slate-400">
        <div class="border border-slate-700 rounded-lg p-3 bg-slate-900/40">
          <div class="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Info Pengembang</div>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-slate-700">
              <img :src="resolveStorageUrl('/uploads/ferilee.jpg')" alt="Developer" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="text-sm text-slate-200 font-semibold">Feri Dwi Hermawan</div>
              <div class="text-[11px] text-slate-400">Pengajar & Pengembang Mathflix</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a
              href="https://t.me/ferilee"
              target="_blank"
              rel="noopener"
              class="flex-1 text-center text-[11px] font-semibold py-1.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition"
            >
              Telegram
            </a>
            <a
              href="https://wa.me/6285174244128"
              target="_blank"
              rel="noopener"
              class="flex-1 text-center text-[11px] font-semibold py-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-400 transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div class="p-4 border-t border-white/10 text-sm text-slate-400">
        V 1.0.0
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pb-20 md:pb-0">
      <header class="bg-black/60 border-b border-white/10 shadow-lg shadow-black/30 sm:px-6 px-4 py-4 flex items-center justify-between backdrop-blur transition-colors duration-300">
        <div class="flex items-center gap-3">
          <!-- Mobile Dashboard Link -->
          <router-link to="/admin/dashboard" class="md:hidden text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </router-link>
          <h1 class="text-xl font-semibold text-white admin-title">
            {{ routeName }}
          </h1>
        </div>
        <div class="flex items-center gap-4">
             <div class="text-sm text-slate-300">
               {{ staffRoleLabel }}{{ staffName ? `: ${staffName}` : '' }}
             </div>
             <button
               type="button"
               class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-black hover:bg-red-400"
               @click="handleLogout"
               title="Keluar"
               aria-label="Keluar"
             >
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                 <polyline points="16 17 21 12 16 7"></polyline>
                 <line x1="21" y1="12" x2="9" y2="12"></line>
               </svg>
             </button>
        </div>
      </header>
      <div class="p-6">
        <router-view></router-view>
      </div>
    </main>

    <transition name="fade">
      <div v-if="showMenu" class="md:hidden fixed inset-0 z-[80] flex items-end">
        <div class="absolute inset-0 bg-black/70" @click="showMenu = false"></div>
        <div class="relative w-full rounded-t-3xl bg-slate-950 text-white border-t border-white/10 max-h-[80vh] overflow-y-auto">
          <div class="p-4">
            <div class="w-14 h-1.5 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold">Menu</h3>
                <p class="text-xs text-slate-400">Akses semua fitur dengan cepat.</p>
              </div>
              <button class="text-slate-400 hover:text-white" @click="showMenu = false">✕</button>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-6">
              <router-link to="/admin/announcements" class="bg-red-600/90 text-white px-4 py-3 rounded-xl text-sm font-semibold" @click="showMenu = false">
                Kirim Pengumuman
              </router-link>
              <router-link to="/admin/students" class="bg-indigo-600/90 text-white px-4 py-3 rounded-xl text-sm font-semibold" @click="showMenu = false">
                Tambah Siswa
              </router-link>
            </div>

            <div class="space-y-3">
              <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Utama</div>
              <div class="grid grid-cols-2 gap-3">
                <router-link to="/admin/dashboard" class="mobile-link" @click="showMenu = false">Dashboard</router-link>
                <router-link to="/admin/students" class="mobile-link" @click="showMenu = false">Siswa</router-link>
                <router-link to="/admin/student-dashboard" class="mobile-link" @click="showMenu = false">Dashboard Siswa</router-link>
              </div>

              <div class="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">Konten</div>
              <div class="grid grid-cols-2 gap-3">
                <router-link to="/admin/materials" class="mobile-link" @click="showMenu = false">Materi</router-link>
                <router-link to="/admin/quizzes" class="mobile-link" @click="showMenu = false">Kuis</router-link>
                <router-link v-if="isAdmin" to="/admin/question-bank" class="mobile-link" @click="showMenu = false">Bank Soal</router-link>
                <router-link v-if="isAdmin" to="/admin/material-analytics" class="mobile-link" @click="showMenu = false">Analitik</router-link>
              </div>

              <div class="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">Komunikasi</div>
              <div class="grid grid-cols-2 gap-3">
                <router-link to="/admin/announcements" class="mobile-link" @click="showMenu = false">Pengumuman</router-link>
                <router-link v-if="isAdmin" to="/admin/discuss" class="mobile-link" @click="showMenu = false">Diskusi</router-link>
              </div>

              <div class="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">Kelas</div>
              <div class="grid grid-cols-2 gap-3">
                <router-link to="/admin/assignments" class="mobile-link" @click="showMenu = false">Tugas</router-link>
              </div>

              <template v-if="isGuru">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">Akun</div>
                <div class="grid grid-cols-2 gap-3">
                  <router-link to="/admin/settings" class="mobile-link" @click="showMenu = false">Ubah Password</router-link>
                </div>
              </template>

              <template v-if="isAdmin">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">Laporan</div>
                <div class="grid grid-cols-2 gap-3">
                  <router-link to="/admin/reflections" class="mobile-link" @click="showMenu = false">Jurnal</router-link>
                  <router-link to="/admin/grading" class="mobile-link" @click="showMenu = false">Nilai</router-link>
                </div>

                <div class="text-xs uppercase tracking-[0.2em] text-slate-400 mt-4">Sistem</div>
                <div class="grid grid-cols-2 gap-3">
                  <router-link to="/admin/teachers" class="mobile-link" @click="showMenu = false">Guru</router-link>
                  <router-link to="/admin/settings" class="mobile-link" @click="showMenu = false">Pengaturan</router-link>
                  <router-link to="/admin/roles" class="mobile-link" @click="showMenu = false">Role</router-link>
                  <router-link to="/admin/audit-log" class="mobile-link" @click="showMenu = false">Audit Log</router-link>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Navigation (Mobile Only) -->
    <div class="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-700 flex justify-between p-2 z-50 text-xs shadow-lg">
      <router-link to="/admin/dashboard" class="flex flex-col items-center gap-1 text-slate-400 hover:text-white w-1/5" active-class="text-indigo-400 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Home</span>
      </router-link>
      <router-link to="/admin/students" class="flex flex-col items-center gap-1 text-slate-400 hover:text-white w-1/5" active-class="text-indigo-400 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>Siswa</span>
      </router-link>
      <button type="button" class="flex flex-col items-center gap-1 text-slate-400 hover:text-white w-1/5" @click="showMenu = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Menu</span>
      </button>
      <router-link to="/admin/announcements" class="flex flex-col items-center gap-1 text-slate-400 hover:text-white w-1/5" active-class="text-indigo-400 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span>Info</span>
      </router-link>
      <router-link to="/admin/assignments" class="flex flex-col items-center gap-1 text-slate-400 hover:text-white w-1/5" active-class="text-indigo-400 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        <span>Tugas</span>
      </router-link>
    </div>

    <!-- Developer Widget (Modal) -->
    <DeveloperWidget :is-open="showDevInfo" @close="showDevInfo = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { clearStaffUser, getStaffDisplayName, getStaffUser, setAuthToken } from '../utils/auth';
import DeveloperWidget from '../components/DeveloperWidget.vue';
import { resolveStorageUrl } from '../utils/storage';

const route = useRoute();
const routeName = computed(() => route.meta.title || 'Dashboard');
const showMenu = ref(false);
const showDevInfo = ref(false);
const staffUser = ref(getStaffUser());
const staffName = computed(() => getStaffDisplayName(staffUser.value));
const isAdmin = computed(() => staffUser.value?.role === 'admin');
const isGuru = computed(() => staffUser.value?.role === 'guru');
const staffRoleLabel = computed(() => {
  if (staffUser.value?.role === 'admin') return 'Admin';
  if (staffUser.value?.role === 'guru') return 'Guru';
  return 'Pengguna';
});

const handleLogout = () => {
  clearStaffUser();
  setAuthToken(null);
  localStorage.removeItem('student');
  window.location.href = '/login';
};

const OPEN_SECTIONS_KEY = 'admin_sidebar_sections';
const openSections = ref({
  utama: true,
  konten: true,
  komunikasi: true,
  kelas: true,
  laporan: true,
  sistem: true,
  akun: true,
});

const toggleSection = (key: keyof typeof openSections.value) => {
  openSections.value[key] = !openSections.value[key];
  localStorage.setItem(OPEN_SECTIONS_KEY, JSON.stringify(openSections.value));
};

onMounted(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('admin_theme', 'dark');
    const saved = localStorage.getItem(OPEN_SECTIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        openSections.value = { ...openSections.value, ...parsed };
      } catch {
        // ignore invalid storage
      }
    }
});
</script>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 px-4 py-2 rounded transition-colors duration-200 text-slate-300 hover:bg-white/10 hover:text-white;
}
.nav-item.router-link-active {
  @apply bg-red-600 text-white shadow-[0_0_20px_rgba(229,9,20,0.35)];
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.mobile-link {
  @apply bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 hover:border-red-500/60 hover:text-white transition;
}
</style>
