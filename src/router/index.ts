import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import AdminLayout from "../layouts/AdminLayout.vue";
import Dashboard from "../views/Dashboard.vue";
import {
  clearStaffUser,
  getAuthStrategy,
  getAuthToken,
  getStaffUser,
} from "../utils/auth";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/oauth/callback",
    component: () => import("../views/OAuthCallback.vue"),
  },
  {
    path: "/",
    component: () => import("../layouts/StudentLayout.vue"),
    children: [
      { path: "", component: () => import("../views/StudentDashboard.vue") },
      { path: "quiz/:id", component: () => import("../views/StudentQuiz.vue") },
      {
        path: "leaderboard",
        component: () => import("../views/Leaderboard.vue"),
      },
      {
        path: "shop",
        component: () => import("../views/Shop.vue"),
      },
      { path: "my-list", component: () => import("../views/MyList.vue") },
      {
        path: "material/:id",
        component: () => import("../views/StudentMaterialDetail.vue"),
      },
      {
        path: "announcements",
        component: () => import("../views/StudentAnnouncements.vue"),
      },
      {
        path: "discuss",
        component: () => import("../views/StudentDiscuss.vue"),
      },
      {
        path: "assignments",
        component: () => import("../views/StudentAssignments.vue"),
      },
      {
        path: "assignments/:id",
        component: () => import("../views/StudentAssignmentDetail.vue"),
      },
      {
        path: "reflections",
        component: () => import("../views/StudentReflections.vue"),
      },
      {
        path: "s-badges",
        component: () => import("../views/StudentBadges.vue"),
      },
      {
        path: "profile",
        component: () => import("../views/StudentProfile.vue"),
      },
    ],
  },

  {
    path: "/admin",
    component: AdminLayout,
    redirect: "/admin/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: { title: "Dashboard", roles: ["admin", "guru"] },
      },
      {
        path: "students",
        name: "Students",
        component: () => import("../views/Students/StudentList.vue"),
        meta: { title: "Manajemen Siswa", roles: ["admin", "guru"] },
      },
      {
        path: "student-dashboard",
        name: "StudentDashboardPreview",
        component: () => import("../views/StudentDashboard.vue"),
        meta: { title: "Dashboard Siswa", roles: ["admin", "guru"] },
      },
      {
        path: "activity",
        name: "AdminActivity",
        component: () => import("../views/AdminActivity.vue"),
        meta: { title: "Aktivitas Siswa", roles: ["admin"] },
      },
      {
        path: "material-analytics",
        name: "MaterialAnalytics",
        component: () => import("../views/AdminMaterialAnalytics.vue"),
        meta: { title: "Analitik Materi", roles: ["admin"] },
      },
      {
        path: "question-bank",
        name: "QuestionBank",
        component: () => import("../views/QuestionBank.vue"),
        meta: { title: "Bank Soal", roles: ["admin"] },
      },
      {
        path: "materials",
        name: "Materials",
        component: () => import("../views/Materials/MaterialList.vue"),
        meta: { title: "Manajemen Materi", roles: ["admin", "guru"] },
      },
      {
        path: "materials/new",
        name: "CreateMaterial",
        component: () => import("../views/Materials/MaterialForm.vue"),
        meta: { title: "Tambah Materi", roles: ["admin", "guru"] },
      },
      {
        path: "materials/:id/edit",
        name: "EditMaterial",
        component: () => import("../views/Materials/MaterialForm.vue"),
        meta: { title: "Edit Materi", roles: ["admin", "guru"] },
      },
      {
        path: "quizzes",
        name: "Quizzes",
        component: () => import("../views/Quizzes/QuizList.vue"),
        meta: { title: "Manajemen Kuis", roles: ["admin", "guru"] },
      },
      {
        path: "quizzes/:id",
        name: "QuizDetail",
        component: () => import("../views/Quizzes/QuizDetail.vue"),
        meta: { title: "Detail Kuis", roles: ["admin", "guru"] },
      },
      {
        path: "quizzes/:quizId/questions/new",
        name: "AddQuestion",
        component: () => import("../views/Quizzes/QuestionForm.vue"),
        meta: { title: "Tambah Soal", roles: ["admin", "guru"] },
      },
      {
        path: "announcements",
        name: "AdminAnnouncements",
        component: () => import("../views/AdminAnnouncements.vue"),
        meta: { title: "Kelola Pengumuman", roles: ["admin", "guru"] },
      },
      {
        path: "discuss",
        name: "AdminDiscuss",
        component: () => import("../views/AdminDiscuss.vue"),
        meta: { title: "Moderasi Diskusi", roles: ["admin"] },
      },
      {
        path: "assignments",
        name: "AdminAssignments",
        component: () => import("../views/AdminAssignments.vue"),
        meta: { title: "Manajemen Tugas", roles: ["admin", "guru"] },
      },
      {
        path: "assignments/:id",
        name: "AdminAssignmentDetail",
        component: () => import("../views/AdminAssignmentDetail.vue"),
        meta: { title: "Detail Pengumpulan", roles: ["admin", "guru"] },
      },
      {
        path: "reflections",
        name: "AdminReflections",
        component: () => import("../views/AdminReflections.vue"),
        meta: { title: "Jurnal Siswa", roles: ["admin"] },
      },
      {
        path: "grading",
        name: "AdminGrading",
        component: () => import("../views/AdminGrading.vue"),
        meta: { title: "Rekap Penilaian", roles: ["admin"] },
      },
      {
        path: "roles",
        name: "AdminRoles",
        component: () => import("../views/AdminRoles.vue"),
        meta: { title: "Role & Permissions", roles: ["admin"] },
      },
      {
        path: "teachers",
        name: "AdminTeachers",
        component: () => import("../views/AdminTeachers.vue"),
        meta: { title: "Manajemen Guru", roles: ["admin"] },
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../views/AdminSettings.vue"),
        meta: { title: "Pengaturan", roles: ["admin", "guru"] },
      },
      {
        path: "audit-log",
        name: "AdminAuditLog",
        component: () => import("../views/AdminAuditLog.vue"),
        meta: { title: "Audit Log", roles: ["admin"] },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (!to.path.startsWith("/admin")) return true;
  const staffUser = getStaffUser();
  if (!staffUser) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  const authStrategy = getAuthStrategy();
  if (authStrategy === "token" && !getAuthToken()) {
    clearStaffUser();
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  const allowedRoles = to.meta.roles as string[] | undefined;
  if (allowedRoles && !allowedRoles.includes(staffUser.role)) {
    return { path: "/admin/dashboard" };
  }
  return true;
});

export default router;
