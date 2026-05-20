<template>
    <div
        class="bg-white dark:bg-slate-800 p-6 rounded shadow transition-colors"
    >
        <div
            v-show="false"
            class="mb-6 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center bg-white dark:bg-slate-800 p-4 rounded shadow border dark:border-gray-700"
        >
            <div>
                <h2 class="text-lg font-bold text-gray-800 dark:text-white">
                    Tambah Siswa
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Input manual atau Import CSV (ID, Nama Siswa, Grade, Kelas,
                    Jurusan, Sekolah)
                </p>
            </div>
            <div
                class="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center w-full lg:w-auto"
            >
                <!-- CSV Import trigger -->
                <label
                    class="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold flex items-center justify-center gap-2 shadow transition w-full sm:w-auto"
                >
                    <span>📂 Import CSV</span>
                    <input
                        type="file"
                        @change="handleFileUpload"
                        accept=".csv"
                        class="hidden"
                    />
                </label>
                <a
                    href="https://docs.google.com/spreadsheets/d/1ra9EupqIgHOiRMfRL-OtsmrDrx2hwmcyryBvV1kWn1c/edit?usp=sharing"
                    target="_blank"
                    rel="noopener"
                    class="text-sm text-indigo-600 dark:text-indigo-300 font-semibold hover:underline w-full sm:w-auto text-center sm:text-left"
                >
                    Unduh Template CSV
                </a>
                <button
                    @click="showForm = !showForm"
                    class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-bold shadow transition w-full sm:w-auto"
                >
                    {{ showForm ? "Batal" : "Manual Input" }}
                </button>
            </div>
        </div>

        <!-- Create/Edit Form -->
        <div
            v-if="showForm"
            class="mb-8 bg-gray-50 dark:bg-slate-700 p-6 rounded border dark:border-gray-600 shadow-inner"
        >
            <h3 class="font-bold mb-6 text-gray-800 dark:text-white">
                {{ isEditing ? "Edit Siswa" : "Tambah Siswa Baru" }}
            </h3>
            <form
                @submit.prevent="saveStudent"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <FloatingInput
                    v-model="form.nisn"
                    label="ID (NISN)"
                    id="s_nisn"
                    required
                />
                <FloatingInput
                    v-model="form.full_name"
                    label="Nama Siswa"
                    id="s_name"
                    required
                />
                <FloatingInput
                    v-model="form.grade_level"
                    type="number"
                    min="1"
                    max="12"
                    step="1"
                    label="Grade (1-12)"
                    id="s_grade"
                    required
                />
                <FloatingInput
                    v-model="form.class_name"
                    label="Kelas (A/B/1/2)"
                    id="s_class"
                    required
                />
                <FloatingInput
                    v-model="form.major"
                    label="Jurusan/Departemen"
                    id="s_major"
                    required
                />
                <FloatingInput
                    v-model="form.school"
                    label="Sekolah"
                    id="s_school"
                    required
                />

                <div class="md:col-span-2 flex justify-end gap-3">
                    <button
                        v-if="isEditing"
                        type="button"
                        class="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 font-bold shadow"
                        @click="cancelEdit"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-bold shadow"
                    >
                        {{ isEditing ? "Simpan Perubahan" : "Simpan Data" }}
                    </button>
                </div>
            </form>
        </div>

        <div
            v-if="isGuru"
            class="mb-6 bg-indigo-50 dark:bg-slate-700/60 p-4 rounded border border-indigo-100 dark:border-slate-600"
        >
            <div
                class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
                <div>
                    <h3
                        class="text-sm font-bold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide"
                    >
                        Skema Akses Guru
                    </h3>
                    <p class="text-sm text-indigo-700 dark:text-indigo-300">
                        Gratis 1 kelas (grade - jurusan - kelas). Kelas
                        berikutnya {{ formatRupiah(CLASS_PRICE) }} / kelas.
                    </p>
                </div>
                <div class="flex flex-wrap gap-3 text-xs">
                    <div
                        class="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-indigo-100 dark:border-slate-600"
                    >
                        <div class="text-gray-500 dark:text-gray-400">
                            Total siswa
                        </div>
                        <div class="font-bold text-gray-800 dark:text-white">
                            {{ displayStudentTotal }}
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-indigo-100 dark:border-slate-600"
                    >
                        <div class="text-gray-500 dark:text-gray-400">
                            Total kelas
                        </div>
                        <div class="font-bold text-gray-800 dark:text-white">
                            {{ totalClassCount }}
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-indigo-100 dark:border-slate-600"
                    >
                        <div class="text-gray-500 dark:text-gray-400">
                            Sisa kuota gratis (kelas)
                        </div>
                        <div
                            class="font-bold text-emerald-600 dark:text-emerald-300"
                        >
                            {{ remainingFreeClasses }}
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-indigo-100 dark:border-slate-600"
                    >
                        <div class="text-gray-500 dark:text-gray-400">
                            Kelas berbayar
                        </div>
                        <div
                            class="font-bold text-amber-600 dark:text-amber-300"
                        >
                            {{ paidClassCount }}
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-indigo-100 dark:border-slate-600"
                    >
                        <div class="text-gray-500 dark:text-gray-400">
                            Tagihan saat ini
                        </div>
                        <div class="font-bold text-gray-800 dark:text-white">
                            {{ formatRupiah(billingAmount) }}
                        </div>
                    </div>
                    <button
                        v-if="billingAmount > 0"
                        :disabled="billingLoading"
                        @click="openPayModal"
                        class="bg-amber-500 text-black px-4 py-2 rounded font-bold shadow hover:bg-amber-400 disabled:opacity-60"
                    >
                        {{ billingLoading ? "Memuat..." : "Bayar Sekarang" }}
                    </button>
                </div>
            </div>
        </div>

        <div
            v-if="isGuru && (overdueCount > 0 || graceCount > 0)"
            class="mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200"
        >
            <span v-if="overdueCount > 0" class="font-semibold"
                >Ada {{ overdueCount }} siswa tertunda akses.</span
            >
            <span v-if="graceCount > 0" class="ml-2"
                >Masa tenggang aktif untuk {{ graceCount }} siswa.</span
            >
        </div>

        <div
            v-show="false"
            class="mb-6 bg-white dark:bg-slate-800 p-6 rounded shadow border border-slate-200 dark:border-slate-700"
        >
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">
                        Manajemen Cohort / Kelas
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Buat cohort dan atur anggota siswa untuk penargetan
                        pengumuman.
                    </p>
                </div>
                <button
                    @click="loadCohorts"
                    class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Muat Ulang
                </button>
            </div>

            <form
                @submit.prevent="createCohort"
                class="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div>
                    <label
                        class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2"
                        >Nama Cohort</label
                    >
                    <input
                        v-model="cohortForm.name"
                        type="text"
                        class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        placeholder="TKJ A"
                        required
                    />
                </div>
                <div class="md:col-span-2">
                    <label
                        class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2"
                        >Deskripsi</label
                    >
                    <input
                        v-model="cohortForm.description"
                        type="text"
                        class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        placeholder="Contoh: Kelas 10 TKJ A"
                    />
                </div>
                <div
                    class="md:col-span-3 flex items-center justify-between gap-4"
                >
                    <div v-if="cohortError" class="text-xs text-red-500">
                        {{ cohortError }}
                    </div>
                    <div
                        v-else-if="cohortSuccess"
                        class="text-xs text-emerald-600"
                    >
                        {{ cohortSuccess }}
                    </div>
                    <button
                        type="submit"
                        class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                    >
                        Simpan Cohort
                    </button>
                </div>
            </form>

            <div
                v-if="cohorts.length === 0"
                class="text-xs text-gray-500 dark:text-gray-400 mt-6"
            >
                Belum ada cohort dibuat.
            </div>
            <div
                v-else
                class="mt-6 divide-y divide-gray-200 dark:divide-gray-700"
            >
                <div
                    v-for="cohort in cohorts"
                    :key="cohort.id"
                    class="py-4 flex items-center justify-between gap-4"
                >
                    <div>
                        <div
                            class="text-sm font-semibold text-gray-800 dark:text-white"
                        >
                            {{ cohort.name }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            {{ cohort.description || "Tanpa deskripsi" }}
                        </div>
                        <div class="text-[10px] text-gray-400 mt-1">
                            {{ cohort.members?.length || 0 }} siswa
                        </div>
                    </div>
                    <div class="flex items-center gap-3 text-xs">
                        <button
                            type="button"
                            class="px-3 py-2 rounded bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
                            @click="openCohortManage(cohort)"
                        >
                            Kelola Siswa
                        </button>
                        <button
                            type="button"
                            class="px-3 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 font-semibold"
                            @click="toggleCohortExpand(cohort.id)"
                        >
                            {{
                                expandedCohortId === cohort.id
                                    ? "Tutup"
                                    : "Lihat Anggota"
                            }}
                        </button>
                        <button
                            type="button"
                            class="px-3 py-2 rounded bg-red-500 text-black hover:bg-red-400 font-semibold"
                            @click="removeCohort(cohort)"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
                <div v-for="cohort in cohorts" :key="`${cohort.id}-members`">
                    <div v-if="expandedCohortId === cohort.id" class="pb-4">
                        <div
                            v-if="!cohort.members?.length"
                            class="text-xs text-gray-500 dark:text-gray-400"
                        >
                            Belum ada siswa dalam cohort ini.
                        </div>
                        <div
                            v-else
                            class="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                            <div
                                v-for="member in cohort.members"
                                :key="member.student_id"
                                class="bg-gray-50 dark:bg-slate-700 p-3 rounded text-xs text-gray-700 dark:text-gray-200"
                            >
                                {{
                                    member.student?.full_name ||
                                    member.student_id
                                }}
                                <span class="text-[10px] text-gray-400 ml-2">
                                    {{ member.student?.grade_level }}
                                    {{ member.student?.major }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div class="md:col-span-2">
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Cari Nama Siswa atau ID..."
                    class="w-full border p-2 rounded bg-gray-50 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div v-if="isAdmin">
                <input
                    v-model="filterTeacherName"
                    type="text"
                    list="teacher-options"
                    placeholder="Cari Nama Guru..."
                    class="w-full border p-2 rounded bg-gray-50 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                />
                <datalist id="teacher-options">
                    <option
                        v-for="name in teacherNameOptions"
                        :key="name"
                        :value="name"
                    />
                </datalist>
            </div>
            <div>
                <input
                    v-model="filterMajor"
                    type="text"
                    placeholder="Filter jurusan..."
                    class="w-full border p-2 rounded bg-gray-50 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div>
                <input
                    v-model="filterSchool"
                    type="text"
                    placeholder="Sekolah..."
                    class="w-full border p-2 rounded bg-gray-50 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div>
                <select
                    v-model="filterGrade"
                    class="w-full border p-2 rounded bg-gray-50 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">Semua Kelas</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                </select>
            </div>
            <div class="flex items-end">
                <button
                    v-if="
                        isAdmin &&
                        (searchQuery ||
                            filterMajor ||
                            filterGrade ||
                            filterTeacherName)
                    "
                    @click="handleBulkDelete"
                    class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow transition flex items-center justify-center gap-2"
                >
                    <span>🗑️ Hapus Sesuai Filter</span>
                </button>
            </div>
        </div>

        <div
            v-if="isAdmin && filterTeacherName"
            class="mb-4 text-xs text-gray-500 dark:text-gray-400"
        >
            Menampilkan siswa untuk guru "{{ filterTeacherName }}" ({{
                totalStudents
            }}
            siswa)
        </div>

        <div
            v-if="showCohortManage"
            class="fixed inset-0 z-[140] flex items-center justify-center"
        >
            <div
                class="absolute inset-0 bg-black/80 backdrop-blur-sm"
                @click="closeCohortManage"
            ></div>
            <div
                class="relative w-[92%] max-w-3xl rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10"
            >
                <div
                    class="p-6 border-b border-white/10 flex items-center justify-between"
                >
                    <div>
                        <h3 class="text-lg font-bold">Kelola Siswa</h3>
                        <p class="text-xs text-gray-400">
                            {{ activeCohort?.name || "" }}
                        </p>
                    </div>
                    <button
                        class="text-slate-400 hover:text-white"
                        @click="closeCohortManage"
                    >
                        ✕
                    </button>
                </div>
                <div class="p-6 space-y-4">
                    <input
                        v-model="cohortStudentSearch"
                        type="text"
                        class="w-full border border-white/10 rounded-lg px-4 py-2 bg-black/40 text-white"
                        placeholder="Cari nama siswa..."
                    />
                    <div class="max-h-[50vh] overflow-y-auto space-y-2">
                        <label
                            v-for="student in filteredCohortStudents"
                            :key="student.id"
                            class="flex items-center gap-3 text-xs bg-slate-800/60 border border-white/5 rounded px-3 py-2"
                        >
                            <input
                                v-model="selectedCohortStudentIds"
                                type="checkbox"
                                :value="student.id"
                                class="h-4 w-4"
                            />
                            <span class="flex-1">
                                {{ student.full_name }} •
                                {{ student.grade_level }} {{ student.major }}
                            </span>
                        </label>
                        <div
                            v-if="filteredCohortStudents.length === 0"
                            class="text-xs text-gray-400"
                        >
                            Tidak ada siswa ditemukan.
                        </div>
                    </div>
                </div>
                <div
                    class="p-6 border-t border-white/10 flex items-center justify-end gap-3"
                >
                    <button
                        class="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
                        @click="closeCohortManage"
                    >
                        Batal
                    </button>
                    <button
                        class="px-4 py-2 rounded bg-emerald-500 text-black hover:bg-emerald-400 text-sm font-semibold"
                        :disabled="cohortManageLoading"
                        @click="saveCohortMembers"
                    >
                        {{
                            cohortManageLoading
                                ? "Menyimpan..."
                                : "Simpan Anggota"
                        }}
                    </button>
                </div>
            </div>
        </div>

        <!-- List Table -->
        <div class="overflow-x-auto">
            <table
                class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-white"
            >
                <thead class="bg-gray-50 dark:bg-slate-700">
                    <tr>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            ID
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            Nama Siswa
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            Tingkat (Grade)
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            Jurusan (Department)
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            Class
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-bold text-red-500 uppercase tracking-wider"
                        >
                            HP (Hadir)
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-bold text-amber-500 uppercase tracking-wider"
                        >
                            AP (Aktif)
                        </th>
                        <th
                            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody
                    class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                    <tr
                        v-for="student in students"
                        :key="student.id"
                        class="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <td
                            class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 font-mono text-center"
                        >
                            {{ student.nisn }}
                        </td>
                        <td
                            class="px-6 py-4 whitespace-nowrap font-medium text-left"
                        >
                            {{ student.full_name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            {{ student.grade_level }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span
                                class="px-2 py-0.5 rounded text-xs font-bold"
                                :class="getMajorBadgeClass(student.major)"
                            >
                                {{ student.major }}
                            </span>
                        </td>
                        <td
                            class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-center"
                        >
                            {{ student.class_name || "—" }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <div class="flex items-center justify-center gap-2">
                                <button
                                    @click="updateGamification(student, 'hp', -10)"
                                    class="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-bold"
                                >-</button>
                                <span class="font-bold w-8" :class="student.hp < 60 ? 'text-red-500 animate-pulse' : 'text-emerald-500'">
                                    {{ student.hp }}
                                </span>
                                <button
                                    @click="updateGamification(student, 'hp', 10)"
                                    class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 font-bold"
                                >+</button>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <div class="flex items-center justify-center gap-2">
                                <button
                                    @click="updateGamification(student, 'ap', -50)"
                                    class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 font-bold"
                                >-</button>
                                <span class="font-bold text-amber-500 w-10">
                                    {{ student.ap }}
                                </span>
                                <button
                                    @click="updateGamification(student, 'ap', 50)"
                                    class="w-6 h-6 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 font-bold"
                                >+</button>
                            </div>
                        </td>
                        <td
                            class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
                        >
                            <div class="flex items-center justify-center gap-3">
                                <button
                                    @click="viewStudent(student)"
                                    class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                                    title="View"
                                    aria-label="View"
                                >
                                    <svg
                                        class="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M12 5C7 5 3 9.5 2 12c1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                        />
                                    </svg>
                                </button>
                                <button
                                    v-if="isAdmin"
                                    @click="editStudent(student)"
                                    class="text-amber-600 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                                    title="Edit"
                                    aria-label="Edit"
                                >
                                    <svg
                                        class="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="m16.86 3.1 4.04 4.04-12 12H4.86V15.1l12-12Zm4.45-1.03c.39-.39 1.02-.39 1.41 0l1.45 1.45c.39.39.39 1.02 0 1.41l-1.11 1.11-4.04-4.04 1.29-1.93Z"
                                        />
                                    </svg>
                                </button>
                                <button
                                    v-if="isAdmin"
                                    @click="deleteStudent(student.id)"
                                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Hapus"
                                    aria-label="Hapus"
                                >
                                    <svg
                                        class="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M6 7h12l-1 14H7L6 7Zm3-3h6l1 2H8l1-2Z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="students.length === 0">
                        <td
                            :colspan="6"
                            class="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                            Belum ada data (Cek filter anda).
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Controls -->
        <div
            v-if="totalPages > 1"
            class="mt-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50 dark:bg-slate-700 p-4 rounded border dark:border-gray-600"
        >
            <div class="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {{ students.length }} dari {{ totalStudents }} siswa
            </div>
            <div class="flex flex-col gap-2 w-full md:w-auto">
                <div class="flex gap-1 overflow-x-auto max-w-full">
                    <button
                        v-for="p in totalPages"
                        :key="p"
                        @click="currentPage = p"
                        class="px-3 py-1 border rounded transition"
                        :class="
                            currentPage === p
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-white dark:border-gray-600'
                        "
                    >
                        {{ p }}
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        @click="currentPage--"
                        :disabled="currentPage === 1"
                        class="px-3 py-1 bg-white dark:bg-slate-800 border rounded hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:border-gray-600"
                    >
                        Sebelumnya
                    </button>
                    <button
                        @click="currentPage++"
                        :disabled="currentPage === totalPages"
                        class="px-3 py-1 bg-white dark:bg-slate-800 border rounded hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:border-gray-600"
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>

        <BillingPayModal
            v-if="isGuru"
            :is-open="showPayModal"
            :students="billingStudents"
            :selected-ids="selectedPayIds"
            :price-per-class="pricePerClass"
            :selected-class-count="selectedClassCount"
            :is-loading="billingLoading"
            @update:selected-ids="updateSelectedPayIds"
            @close="closePayModal"
            @confirm="confirmPayBilling"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import FloatingInput from "../../components/FloatingInput.vue";
import BillingPayModal from "../../components/BillingPayModal.vue";
import api from "../../api";
import {
    fetchBillingSummary,
    fetchBillingStatuses,
    syncBillingStudents,
    fetchTeacherExemptions,
    fetchBillingSettings,
} from "../../utils/billing";
import { getStaffActorId, getStaffUser } from "../../utils/auth";
import { getTeacherAccounts } from "../../utils/teachers";
import { useDialog } from "../../utils/dialog";

interface Student {
    id: string;
    nisn: string;
    full_name: string;
    major: string;
    class_name?: string;
    grade_level: number;
    school?: string;
    created_at?: string;
    teacher_name?: string;
    teacherId?: string;
    teacherName?: string;
    teacher_id?: string;
    hp: number;
    ap: number;
    status: string;
}

const students = ref<Student[]>([]);
const allStudentsForBilling = ref<Student[]>([]);
const showPayModal = ref(false);
const selectedPayIds = ref<string[]>([]);
const route = useRoute();
const dialog = useDialog();
const activityByStudentId = ref<Record<string, any>>({});
const showForm = ref(false);
const editingStudentId = ref<string | null>(null);
const form = ref({
    nisn: "",
    full_name: "",
    school: "",
    major: "",
    class_name: "",
    grade_level: "",
});

// Filters & Pagination
const searchQuery = ref("");
const filterMajor = ref("");
const filterSchool = ref("");
const filterGrade = ref("");
const filterTeacherName = ref("");
const currentPage = ref(1);
const totalStudents = ref(0);
const totalPages = ref(0);
const itemsPerPage = ref(10);
const FREE_CLASS_QUOTA = 1;
const CLASS_PRICE = 49000;
const GRACE_DAYS = 7;
const billingSummary = ref<any>(null);
const billingStatusByStudentId = ref<Record<string, any>>({});
const billingLoading = ref(false);
const totalStudentsAll = ref(0);
const staffUser = getStaffUser();
const teacherId =
    staffUser?.nip || staffUser?.full_name || getStaffActorId(staffUser);
const teacherName = staffUser?.full_name || staffUser?.nip || "";
const isAdmin = staffUser?.role === "admin";
const isGuru = staffUser?.role === "guru";
const isEditing = computed(() => editingStudentId.value !== null);
const cohorts = ref<any[]>([]);
const cohortForm = ref({ name: "", description: "" });
const cohortError = ref("");
const cohortSuccess = ref("");
const expandedCohortId = ref<string | null>(null);
const showCohortManage = ref(false);
const activeCohort = ref<any>(null);
const selectedCohortStudentIds = ref<string[]>([]);
const cohortStudentSearch = ref("");
const cohortManageLoading = ref(false);
const cohortStudents = ref<any[]>([]);
const teacherNameByNip = ref<Record<string, string>>({});
const exemptTeacherIds = ref<Set<string>>(new Set());
const exemptTeacherNames = ref<Set<string>>(new Set());
const adminAccessByStudentId = ref<
    Record<string, { label: string; helper: string; badgeClass: string }>
>({});
let adminRefreshInterval: number | undefined;
let guruRefreshInterval: number | undefined;

const normalizeClassToken = (value: any) => {
    const text = String(value ?? "").trim();
    return text ? text.toUpperCase() : "-";
};

const getClassKey = (student: any) => {
    const grade = normalizeClassToken(student?.grade_level ?? student?.grade);
    const major = normalizeClassToken(student?.major);
    const className = normalizeClassToken(
        student?.class_name ?? student?.class,
    );
    return `${grade}|${major}|${className}`;
};

const getStudentCreatedTime = (student: any) => {
    const createdAt = student?.created_at;
    if (!createdAt) return 0;
    const time = new Date(createdAt).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const getClassKeySet = (list: any[]) => {
    const keys = new Set<string>();
    list.forEach((student) => {
        keys.add(getClassKey(student));
    });
    return keys;
};

const getFreeClassKeys = (list: any[]) => {
    if (FREE_CLASS_QUOTA <= 0) return new Set<string>();
    const sorted = [...list].sort(
        (a, b) => getStudentCreatedTime(a) - getStudentCreatedTime(b),
    );
    const keys = new Set<string>();
    for (const student of sorted) {
        const key = getClassKey(student);
        if (!keys.has(key)) {
            keys.add(key);
        }
        if (keys.size >= FREE_CLASS_QUOTA) break;
    }
    return keys;
};

const totalStudentsForBilling = computed(() => {
    if (isGuru) {
        return Number(totalStudents.value ?? 0);
    }
    return Number(
        billingSummary.value?.total_students ?? totalStudentsAll.value ?? 0,
    );
});

const displayStudentTotal = computed(() => {
    return isGuru ? totalStudents.value : totalStudentsForBilling.value;
});

const billingSourceStudents = computed(() => {
    return allStudentsForBilling.value.length > 0
        ? allStudentsForBilling.value
        : students.value;
});

const totalClassCount = computed(
    () => getClassKeySet(billingSourceStudents.value).size,
);

const paidClassCount = computed(() => {
    const totalClasses = getClassKeySet(billingSourceStudents.value).size;
    return Math.max(0, totalClasses - FREE_CLASS_QUOTA);
});

const remainingFreeClasses = computed(() => {
    const totalClasses = getClassKeySet(billingSourceStudents.value).size;
    return Math.max(0, FREE_CLASS_QUOTA - totalClasses);
});

const freeClassKeysForGuru = computed(() =>
    getFreeClassKeys(billingSourceStudents.value),
);

const classKeyByStudentId = computed(() => {
    const map = new Map<string, string>();
    billingSourceStudents.value.forEach((student) => {
        map.set(student.id, getClassKey(student));
    });
    return map;
});

const getClassCountByIds = (ids: string[]) => {
    const keys = new Set<string>();
    ids.forEach((id) => {
        const key = classKeyByStudentId.value.get(id);
        if (key) keys.add(key);
    });
    return keys.size;
};

const selectedClassCount = computed(() =>
    getClassCountByIds(selectedPayIds.value),
);

const filteredCohortStudents = computed(() => {
    const keyword = cohortStudentSearch.value.trim().toLowerCase();
    if (!keyword) return cohortStudents.value;
    return cohortStudents.value.filter((s: any) =>
        String(s.full_name || "")
            .toLowerCase()
            .includes(keyword),
    );
});

const pricePerClass = computed(() => {
    return Number(billingSummary.value?.price_per_class ?? CLASS_PRICE);
});

const billingAmount = computed(() => {
    if (!isGuru && billingSummary.value?.amount_due != null) {
        return Number(billingSummary.value.amount_due);
    }
    return paidClassCount.value * pricePerClass.value;
});

const overdueCount = computed(() => {
    if (billingSummary.value?.overdue_students != null) {
        return Number(billingSummary.value.overdue_students);
    }
    return Object.values(billingStatusByStudentId.value).filter(
        (item: any) => item?.status === "blocked",
    ).length;
});

const graceCount = computed(() => {
    if (billingSummary.value?.grace_students != null) {
        return Number(billingSummary.value.grace_students);
    }
    return Object.values(billingStatusByStudentId.value).filter(
        (item: any) => item?.status === "grace",
    ).length;
});

const fetchStudents = async () => {
    try {
        const baseParams = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            search: searchQuery.value,
            major: filterMajor.value,
            school: filterSchool.value,
            grade: filterGrade.value,
            teacher_id: isGuru ? teacherId : undefined,
            teacher_name: isAdmin ? filterTeacherName.value : undefined,
            profiled_only: isAdmin ? 1 : undefined,
        };
        let data = (await api.get("/students", { params: baseParams })).data;

        // Backward-compat: some legacy rows only have teacher_name set.
        if (isGuru && (data?.total ?? 0) === 0 && teacherName) {
            const fallbackParams = {
                ...baseParams,
                teacher_id: undefined,
                teacher_name: teacherName,
            };
            data = (await api.get("/students", { params: fallbackParams }))
                .data;
        }

        const rows = data.data || [];
        students.value = rows.map((row: any) => normalizeStudentRow(row));
        totalStudents.value = data.total;
        totalPages.value = data.totalPages;
        await fetchLatestActivity();
    } catch (e) {
        console.error("Gagal mengambil data siswa", e);
    }
};

const loadCohorts = async () => {
    try {
        const params = isGuru ? { created_by: teacherId } : undefined;
        const { data } = await api.get("/cohorts", { params });
        cohorts.value = Array.isArray(data) ? data : data?.data || [];
    } catch (e) {
        cohorts.value = [];
    }
};

const loadCohortStudents = async () => {
    try {
        const params: Record<string, any> = { page: 1, limit: 5000 };
        if (isGuru) {
            params.teacher_id = staffUser?.nip ? teacherId : undefined;
            params.teacher_name =
                !staffUser?.nip && teacherName ? teacherName : undefined;
        }
        let data = (await api.get("/students", { params })).data;
        let rows = data?.data || [];
        if (isGuru && rows.length === 0 && teacherName) {
            data = (
                await api.get("/students", {
                    params: { page: 1, limit: 5000, teacher_name: teacherName },
                })
            ).data;
            rows = data?.data || [];
        }
        cohortStudents.value = rows.map((row: any) => normalizeStudentRow(row));
    } catch (e) {
        cohortStudents.value = [];
    }
};

const createCohort = async () => {
    cohortError.value = "";
    cohortSuccess.value = "";
    try {
        await api.post("/cohorts", {
            name: cohortForm.value.name,
            description: cohortForm.value.description,
            created_by: isGuru ? teacherId : getStaffActorId(staffUser),
        });
        cohortForm.value = { name: "", description: "" };
        cohortSuccess.value = "Cohort berhasil dibuat.";
        await loadCohorts();
    } catch (e: any) {
        cohortError.value =
            e?.response?.data?.error || e?.message || "Gagal membuat cohort.";
    }
};

const toggleCohortExpand = (id: string) => {
    expandedCohortId.value = expandedCohortId.value === id ? null : id;
};

const openCohortManage = (cohort: any) => {
    activeCohort.value = cohort;
    selectedCohortStudentIds.value = (cohort.members || []).map(
        (m: any) => m.student_id,
    );
    showCohortManage.value = true;
};

const closeCohortManage = () => {
    showCohortManage.value = false;
    activeCohort.value = null;
};

const saveCohortMembers = async () => {
    if (!activeCohort.value) return;
    cohortManageLoading.value = true;
    try {
        await api.post(`/cohorts/${activeCohort.value.id}/members`, {
            student_ids: selectedCohortStudentIds.value,
        });
        await loadCohorts();
        await dialog.alert(
            "Anggota cohort berhasil disimpan.",
            "Sukses",
            "success",
        );
        closeCohortManage();
    } catch (e: any) {
        await dialog.alert(
            e?.response?.data?.error ||
                e?.message ||
                "Gagal menyimpan anggota.",
            "Gagal",
            "danger",
        );
    } finally {
        cohortManageLoading.value = false;
    }
};

const removeCohort = async (cohort: any) => {
    const ok = await dialog.confirm(
        `Hapus cohort ${cohort.name}?`,
        "Hapus Cohort",
        "Hapus",
        "Batal",
        "warning",
    );
    if (!ok) return;
    await api.delete(`/cohorts/${cohort.id}`);
    await loadCohorts();
};

const fetchTeachers = async () => {
    if (!isAdmin) return;
    try {
        const rows = await getTeacherAccounts();
        teacherNameByNip.value = rows.reduce(
            (acc: Record<string, string>, item: any) => {
                if (item?.nip) acc[item.nip] = item.full_name || item.nip;
                return acc;
            },
            {},
        );
        await fetchTeacherExemptionsForAdmin();
    } catch (e) {
        teacherNameByNip.value = {};
    }
};

const teacherNameOptions = computed(() => {
    return Array.from(new Set(Object.values(teacherNameByNip.value))).sort();
});

const fetchTeacherExemptionsForAdmin = async () => {
    if (!isAdmin) return;
    try {
        const rows = await fetchTeacherExemptions();
        exemptTeacherIds.value = new Set(
            rows
                .map((row: any) => row.teacherId || row.teacher_id)
                .filter(Boolean),
        );
        const isNonEmptyString = (value: unknown): value is string =>
            typeof value === "string" && value.trim().length > 0;
        const explicitNames = rows
            .map((row: any) => row.teacherName || row.teacher_name)
            .filter(isNonEmptyString)
            .map((name) => name.toLowerCase());
        const derivedNames = rows
            .map(
                (row: any) =>
                    teacherNameByNip.value[row.teacherId || row.teacher_id],
            )
            .filter(isNonEmptyString)
            .map((name) => name.toLowerCase());
        exemptTeacherNames.value = new Set([...explicitNames, ...derivedNames]);
        buildAdminAccessMap();
    } catch (e) {
        exemptTeacherIds.value = new Set();
        exemptTeacherNames.value = new Set();
    }
};

const resolveTeacherDisplay = (student: any) => {
    if (student.teacher_name) return student.teacher_name;
    if (student.teacherName) return student.teacherName;
    if (student.teacher?.full_name) return student.teacher.full_name;
    if (student.teacher?.name) return student.teacher.name;
    if (student.teacher?.nip && teacherNameByNip.value[student.teacher.nip]) {
        return teacherNameByNip.value[student.teacher.nip];
    }
    if (student.teacher_id && teacherNameByNip.value[student.teacher_id]) {
        return teacherNameByNip.value[student.teacher_id];
    }
    if (student.teacherId && teacherNameByNip.value[student.teacherId]) {
        return teacherNameByNip.value[student.teacherId];
    }
    return (
        student.teacher_name ||
        student.teacherName ||
        student.teacher_id ||
        student.teacherId ||
        "—"
    );
};

const fetchLatestActivity = async () => {
    if (students.value.length === 0) {
        activityByStudentId.value = {};
        return;
    }
    try {
        const ids = students.value.map((s) => s.id).join(",");
        const { data } = await api.get("/activity/latest", {
            params: { student_ids: ids },
        });
        const map: Record<string, any> = {};
        (Array.isArray(data) ? data : []).forEach((row: any) => {
            if (row?.student_id) map[row.student_id] = row;
        });
        activityByStudentId.value = map;
    } catch (e) {
        console.error("Gagal mengambil aktivitas siswa", e);
    }
};

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateInput?: string | null) => {
    if (!dateInput) return "";
    try {
        return new Date(dateInput).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
        });
    } catch {
        return "";
    }
};

const formatDateTime = (dateInput?: string | null) => {
    if (!dateInput) return "";
    try {
        return new Date(dateInput).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
};

const MAJOR_BADGE_CLASSES = [
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
    "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
    "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
];

const getMajorBadgeClass = (major?: string | null) => {
    const value = (major || "").trim().toLowerCase();
    if (!value)
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
    }
    return MAJOR_BADGE_CLASSES[hash % MAJOR_BADGE_CLASSES.length];
};

const normalizeStudentRow = (row: any) => ({
    ...row,
    class_name: row?.class_name || row?.className || row?.class || "",
    created_at: row?.created_at || row?.createdAt || null,
});

const getGraceUntil = (student: any) => {
    const createdAt = student?.created_at;
    if (!createdAt) return null;
    const graceDate = new Date(createdAt);
    graceDate.setDate(graceDate.getDate() + GRACE_DAYS);
    return graceDate.toISOString();
};

const isGraceActive = (graceUntil?: string | null) => {
    if (!graceUntil) return false;
    return new Date(graceUntil).getTime() >= new Date().getTime();
};

const buildAdminAccessMap = () => {
    if (!isAdmin) return;
    const map: Record<
        string,
        { label: string; helper: string; badgeClass: string }
    > = {};
    const grouped = new Map<string, Student[]>();
    allStudentsForBilling.value.forEach((student) => {
        const teacherKey =
            student.teacher_id ||
            student.teacher_name ||
            student.teacherId ||
            student.teacherName ||
            "unknown";
        const list = grouped.get(teacherKey) || [];
        list.push(student);
        grouped.set(teacherKey, list);
    });

    grouped.forEach((list, teacherKey) => {
        const sorted = [...list].sort(
            (a, b) => getStudentCreatedTime(a) - getStudentCreatedTime(b),
        );
        const teacherName = (
            sorted[0]?.teacher_name ||
            sorted[0]?.teacherName ||
            ""
        ).toLowerCase();
        const isExempt =
            (teacherKey && exemptTeacherIds.value.has(teacherKey)) ||
            (teacherName && exemptTeacherNames.value.has(teacherName));
        const freeClassKeys = getFreeClassKeys(sorted);

        sorted.forEach((student) => {
            if (isExempt || freeClassKeys.has(getClassKey(student))) {
                map[student.id] = {
                    label: "Gratis",
                    helper: isExempt ? "Bebas bayar" : "",
                    badgeClass:
                        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
                };
                return;
            }
            const graceUntil = getGraceUntil(student);
            if (isGraceActive(graceUntil)) {
                map[student.id] = {
                    label: "Masa Tenggang",
                    helper: graceUntil
                        ? `Hingga ${formatDate(graceUntil)}`
                        : "",
                    badgeClass:
                        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                };
                return;
            }
            map[student.id] = {
                label: "Akses Tertunda",
                helper: "Menunggu pembayaran",
                badgeClass:
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            };
        });
    });

    adminAccessByStudentId.value = map;
};

const getStudentAccessInfo = (
    student: any,
    _index: number,
    _globalIndexOverride?: number,
) => {
    if (isAdmin) {
        return (
            adminAccessByStudentId.value[student.id] || {
                label: "—",
                helper: "",
                badgeClass:
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
            }
        );
    }
    const status = billingStatusByStudentId.value[student.id];
    if (status?.status === "paid") {
        return {
            label: "Berbayar",
            helper: status.paid_until
                ? `Aktif hingga ${formatDate(status.paid_until)}`
                : "",
            badgeClass:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
    }
    if (status?.status === "free") {
        return {
            label: "Gratis",
            helper: "",
            badgeClass:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        };
    }
    if (status?.status === "grace") {
        return {
            label: "Masa Tenggang",
            helper: status.grace_until
                ? `Hingga ${formatDate(status.grace_until)}`
                : "",
            badgeClass:
                "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        };
    }
    if (status?.status === "blocked") {
        return {
            label: "Akses Tertunda",
            helper: "Menunggu pembayaran",
            badgeClass:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
    }

    if (freeClassKeysForGuru.value.has(getClassKey(student))) {
        return {
            label: "Gratis",
            helper: "",
            badgeClass:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        };
    }

    const graceUntil = getGraceUntil(student);
    if (isGraceActive(graceUntil)) {
        return {
            label: "Masa Tenggang",
            helper: graceUntil ? `Hingga ${formatDate(graceUntil)}` : "",
            badgeClass:
                "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        };
    }

    return {
        label: "Akses Tertunda",
        helper: "Menunggu pembayaran",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
};

const fetchTotalStudentsAll = async () => {
    try {
        const { data } = await api.get("/students", {
            params: {
                page: 1,
                limit: 1,
                teacher_id: isGuru ? teacherId : undefined,
                profiled_only: isAdmin ? 1 : undefined,
            },
        });
        totalStudentsAll.value = Number(
            data?.total ?? data?.totalStudents ?? 0,
        );
    } catch (e) {
        totalStudentsAll.value = totalStudents.value;
    }
};

const fetchAllStudentsForBilling = async () => {
    try {
        const { data } = await api.get("/students", {
            params: {
                page: 1,
                limit: 5000,
                teacher_id: isGuru ? teacherId : undefined,
                profiled_only: isAdmin ? 1 : undefined,
            },
        });
        const rows = data?.data || data || [];
        allStudentsForBilling.value = rows.map((row: any) =>
            normalizeStudentRow(row),
        );
        if (isAdmin) {
            buildAdminAccessMap();
        }
    } catch (e) {
        allStudentsForBilling.value = [];
    }
};

const billingStudents = computed(() => {
    const sorted = [...allStudentsForBilling.value].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
    });
    return sorted.map((student, index) => ({
        ...student,
        access: getStudentAccessInfo(student, index, index),
    }));
});

const openPayModal = async () => {
    if (!isGuru) return;
    showPayModal.value = true;
    await refreshBilling();
    if (allStudentsForBilling.value.length === 0) {
        await fetchAllStudentsForBilling();
    }
    const unpaidIds = billingStudents.value
        .filter(
            (student) =>
                student.access.label !== "Gratis" &&
                student.access.label !== "Berbayar",
        )
        .map((student) => student.id);
    selectedPayIds.value = unpaidIds;
};

const updateSelectedPayIds = (ids: string[]) => {
    selectedPayIds.value = ids;
};

const closePayModal = () => {
    showPayModal.value = false;
};

const refreshBilling = async () => {
    if (!isGuru) return;
    billingLoading.value = true;
    try {
        const [summary, statuses] = await Promise.all([
            fetchBillingSummary(teacherId),
            fetchBillingStatuses(teacherId),
        ]);
        if (summary) billingSummary.value = summary;
        if (Array.isArray(statuses)) {
            billingStatusByStudentId.value = statuses.reduce(
                (acc: Record<string, any>, item: any) => {
                    if (item?.student_id) acc[item.student_id] = item;
                    return acc;
                },
                {},
            );
        }
        if (!summary) await fetchTotalStudentsAll();
    } finally {
        billingLoading.value = false;
    }
};

const confirmPayBilling = async () => {
    if (selectedPayIds.value.length === 0) return;
    const classCount = Math.max(0, selectedClassCount.value);
    const amount = classCount * pricePerClass.value;
    try {
        const ok = await dialog.confirm(
            `Bayar tagihan ${formatRupiah(amount)} sekarang?`,
            "Konfirmasi Pembayaran",
        );
        if (!ok) return;
        billingLoading.value = true;
        const settings = await fetchBillingSettings();
        const paymentUrl = settings?.payment_url;
        if (!paymentUrl) {
            await dialog.alert("URL pembayaran belum diatur admin.");
            return;
        }
        window.open(paymentUrl, "_blank", "noopener");
        showPayModal.value = false;
    } catch (e: any) {
        await dialog.alert(
            `Gagal memproses pembayaran: ${e.response?.data?.error || e.message || e}`,
        );
    } finally {
        billingLoading.value = false;
    }
};

// Reset to page 1 on filter change
watch(
    [searchQuery, filterMajor, filterSchool, filterGrade, filterTeacherName],
    () => {
        currentPage.value = 1;
        fetchStudents();
    },
);

watch(currentPage, fetchStudents);

const saveStudent = async () => {
    try {
        const payload = {
            ...form.value,
            teacher_id: staffUser?.role === "guru" ? teacherId : undefined,
            teacher_name: staffUser?.role === "guru" ? teacherName : undefined,
        };
        let savedStudent: any = null;
        if (editingStudentId.value) {
            const { data } = await api.put(
                `/students/${editingStudentId.value}`,
                payload,
            );
            savedStudent = data?.data || data;
        } else {
            const { data } = await api.post("/students", payload);
            savedStudent = data?.data || data;
        }
        if (savedStudent?.id && !editingStudentId.value) {
            try {
                await syncBillingStudents({
                    id: savedStudent.id,
                    nisn: savedStudent.nisn,
                    full_name: savedStudent.full_name || savedStudent.fullName,
                    teacher_id: payload.teacher_id,
                    teacher_name: payload.teacher_name,
                    created_at:
                        savedStudent.created_at || savedStudent.createdAt,
                });
            } catch (e) {
                console.warn("Billing sync gagal, lanjutkan tanpa blokir.", e);
            }
        }
        await fetchStudents();
        showForm.value = false;
        editingStudentId.value = null;
        form.value = {
            nisn: "",
            full_name: "",
            school: "",
            major: "",
            class_name: "",
            grade_level: "",
        };
    } catch (e: any) {
        console.error("Gagal menyimpan siswa", e);
        const msg =
            e.response?.data?.message ||
            e.response?.data?.error ||
            e.message ||
            "Gagal menyimpan siswa";
        await dialog.alert(`Error: ${msg}`);
    }
};

const editStudent = (student: Student) => {
    editingStudentId.value = student.id;
    form.value = {
        nisn: student.nisn || "",
        full_name: student.full_name || "",
        school: student.school || "",
        major: student.major || "",
        class_name: student.class_name || "",
        grade_level:
            student.grade_level != null ? String(student.grade_level) : "",
    };
    showForm.value = true;
};

const updateGamification = async (student: Student, type: 'hp' | 'ap', amount: number) => {
    try {
        const newValue = student[type] + amount;
        const payload = type === 'hp' ? { hp: newValue } : { ap: newValue };
        
        // Optimistic update
        student[type] = newValue;
        if (type === 'hp') {
            student.status = newValue < 60 ? 'debuff' : 'active';
        }

        const res = await api.put(`/billing/students/${student.id}/gamification`, payload);
        
        // Sync with server res
        if (res.data) {
            student.hp = res.data.hp;
            student.ap = res.data.ap;
            student.status = res.data.status;
        }
    } catch (e: any) {
        console.error("Gagal mengupdate status hero", e);
        // revert logic would go here if needed
        fetchStudents(); // Refresh data as fallback
    }
};

const cancelEdit = () => {
    editingStudentId.value = null;
    form.value = {
        nisn: "",
        full_name: "",
        school: "",
        major: "",
        class_name: "",
        grade_level: "",
    };
    showForm.value = false;
};

const viewStudent = async (student: Student) => {
    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    const items = [
        { icon: "🆔", label: "ID (NISN)", value: student.nisn || "-" },
        { icon: "👤", label: "Nama Siswa", value: student.full_name || "-" },
        {
            icon: "🎓",
            label: "Tingkat (Grade)",
            value: student.grade_level ?? "-",
        },
        { icon: "🏷️", label: "Class", value: student.class_name || "-" },
        {
            icon: "🧭",
            label: "Jurusan (Department)",
            value: student.major || "-",
        },
        { icon: "🏫", label: "Sekolah", value: student.school || "-" },
        {
            icon: "👨‍🏫",
            label: "Guru",
            value: resolveTeacherDisplay(student) || "-",
        },
        {
            icon: "🕒",
            label: "Waktu Dibuat",
            value: formatDateTime(student.created_at) || "-",
        },
    ];
    const rowsHtml = items
        .map((item) => {
            const safeValue = escapeHtml(String(item.value));
            const safeLabel = escapeHtml(item.label);
            return `<span class="text-base">${item.icon}</span><span>${safeLabel}</span><span class="text-slate-400">:</span><span class="font-medium text-white/90">${safeValue}</span>`;
        })
        .join("");
    const detailsHtml = `<div class="grid grid-cols-[18px_auto_8px_1fr] gap-x-2 gap-y-1 text-sm">${rowsHtml}</div>`;
    await dialog.alert(detailsHtml, "Detail Siswa", "info", "html");
};

const deleteStudent = async (id: string) => {
    if (!isAdmin) {
        await dialog.alert(
            "Hanya admin yang dapat menghapus siswa.",
            "Akses Ditolak",
            "warning",
        );
        return;
    }
    const ok = await dialog.confirm(
        "Yakin ingin menghapus siswa ini?",
        "Hapus Siswa",
    );
    if (!ok) return;
    try {
        await api.delete(`/students/${id}`);
        await fetchStudents();
    } catch (e) {
        await dialog.alert("Gagal menghapus siswa");
    }
};

const handleBulkDelete = async () => {
    if (!isAdmin) {
        await dialog.alert(
            "Hanya admin yang dapat menghapus siswa.",
            "Akses Ditolak",
            "warning",
        );
        return;
    }
    const filterText = [
        searchQuery.value ? `Nama/ID: "${searchQuery.value}"` : "",
        filterSchool.value ? `Sekolah: ${filterSchool.value}` : "",
        filterGrade.value ? `Kelas: ${filterGrade.value}` : "",
        filterMajor.value ? `Jurusan: ${filterMajor.value}` : "",
    ]
        .filter(Boolean)
        .join(", ");

    const ok = await dialog.confirm(
        `PERINGATAN: Yakin ingin menghapus SEMUA siswa yang sesuai dengan filter berikut?\n\n${filterText}\n\nTindakan ini tidak dapat dibatalkan.`,
        "Hapus Massal Siswa",
        "Ya, Hapus",
        "Batal",
    );
    if (!ok) {
        return;
    }

    try {
        const { data } = await api.post("/students/bulk-delete", {
            full_name: searchQuery.value,
            grade_level: filterGrade.value,
            major: filterMajor.value,
            school: filterSchool.value,
        });
        await dialog.alert(data.message);
        await fetchStudents();
    } catch (e: any) {
        const msg =
            e.response?.data?.error || "Gagal menghapus data secara massal";
        await dialog.alert(`Gagal: ${msg}`);
    }
};

const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        if (!e.target) return;
        const text = e.target.result as string;
        await processCSV(text);
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = "";
};

const processCSV = async (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length === 0) return;

    // Detect delimiter: check if first line has more ; or ,
    const firstLine = lines[0] || "";
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semiCount > commaCount ? ";" : ",";

    const studentsToImport = [];

    // Header Detection: Skip if first line contains any of these keywords
    let startIndex = 0;
    const headerKeywords = [
        "id",
        "nama",
        "nisn",
        "kelas",
        "jurusan",
        "grade",
        "major",
        "sekolah",
        "school",
        "class",
    ];
    if (headerKeywords.some((key) => firstLine.toLowerCase().includes(key))) {
        startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const cols = line.split(delimiter);
        if (cols.length >= 4) {
            const rawNisn = cols[0]?.trim() || "";
            const nisn = rawNisn.replace(/^\uFEFF/, "");
            const name = cols[1]?.trim() || "";
            const grade = cols[2]?.trim();
            const gradeNumber = Number(grade);
            // Basic validation: grade must be numeric
            if (!isNaN(gradeNumber) && grade !== "") {
                const hasClassColumn = cols.length >= 6;
                const className = hasClassColumn ? cols[3]?.trim() || "-" : "-";
                const majorCol = hasClassColumn ? cols[4] : cols[3];
                const schoolCol = hasClassColumn ? cols[5] : cols[4];
                studentsToImport.push({
                    nisn,
                    name,
                    full_name: name,
                    grade: gradeNumber,
                    grade_level: gradeNumber,
                    class_name: className,
                    class: className,
                    major: majorCol?.trim() || "",
                    school: schoolCol?.trim() || "",
                    teacher_id:
                        staffUser?.role === "guru" ? teacherId : undefined,
                    teacher_name:
                        staffUser?.role === "guru" ? teacherName : undefined,
                });
            }
        }
    }

    if (studentsToImport.length > 0) {
        try {
            const { data } = await api.post("/students/bulk", studentsToImport);
            const createdRows = data?.data || data?.students || [];
            if (Array.isArray(createdRows) && createdRows.length > 0) {
                try {
                    await syncBillingStudents(
                        createdRows.map((row: any) => ({
                            id: row.id,
                            nisn: row.nisn,
                            full_name: row.full_name || row.fullName,
                            teacher_id: row.teacher_id || teacherId,
                            teacher_name: row.teacher_name || teacherName,
                            created_at: row.created_at || row.createdAt,
                        })),
                    );
                } catch (e) {
                    console.warn(
                        "Billing sync gagal saat import, lanjutkan.",
                        e,
                    );
                }
            }
            await dialog.alert(data.message);
            fetchStudents();
        } catch (e: any) {
            const rawError =
                e.response?.data?.error ||
                e.response?.data?.message ||
                e.message ||
                "Gagal import CSV.";
            const errorMsg =
                typeof rawError === "string"
                    ? rawError
                    : JSON.stringify(rawError);
            await dialog.alert(
                `${errorMsg}\nPastikan format: ID, Nama Siswa, Grade, Kelas, Jurusan, Sekolah`,
            );
            console.error(e);
        }
    } else {
        await dialog.alert(
            "Tidak ada data valid ditemukan di CSV. Pastikan kolom Grade berisi angka.",
        );
    }
};

onMounted(fetchStudents);
onMounted(refreshBilling);
onMounted(fetchAllStudentsForBilling);
onMounted(fetchTeachers);
onMounted(fetchTeacherExemptionsForAdmin);
onMounted(loadCohorts);
onMounted(loadCohortStudents);
onMounted(() => {
    if (isAdmin) {
        adminRefreshInterval = window.setInterval(() => {
            fetchTeacherExemptionsForAdmin();
            fetchAllStudentsForBilling();
        }, 10000);
    }
    if (isGuru) {
        guruRefreshInterval = window.setInterval(() => {
            refreshBilling();
            fetchStudents();
        }, 8000);
    }
});

onUnmounted(() => {
    if (adminRefreshInterval) {
        clearInterval(adminRefreshInterval);
    }
    if (guruRefreshInterval) {
        clearInterval(guruRefreshInterval);
    }
});
onMounted(() => {
    if (route.query.pay === "1") {
        openPayModal();
    }
});
</script>
