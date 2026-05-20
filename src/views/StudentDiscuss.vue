<template>
  <div class="px-4 md:px-12 py-8 max-w-4xl mx-auto min-h-screen text-white">
     <h1 class="text-4xl md:text-5xl font-extrabold text-[#ffed4a] mb-10 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" style="-webkit-text-stroke: 1px #b45309;">
        💬 Diskusi Kelas
     </h1>

     <!-- Create Post -->
     <div class="bg-gray-800 p-6 rounded-xl shadow-lg mb-6 border border-gray-700">
        <FloatingTextarea
            v-model="newPostContent"
            label="Apa yang ingin kamu diskusikan hari ini?"
            id="post-content"
            class="mb-2"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div>
                <label class="text-xs text-gray-400">Kategori</label>
                <select v-model="newPostCategory" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm">
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            <div class="md:col-span-2">
                <FloatingInput
                    v-model="newPostTags"
                    label="Tag (pisahkan dengan koma)"
                    id="post-tags"
                    class="!mb-0"
                />
            </div>
        </div>

        <div class="flex justify-end items-center mt-4">
             <button
                @click="createPost"
                :disabled="!isValidPost"
                class="bg-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
             >
                Posting
             </button>
        </div>
     </div>

     <!-- Filters -->
     <div class="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                <label class="text-xs text-gray-400">Filter Kategori</label>
                <select v-model="filterCategory" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm">
                    <option value="Semua">Semua</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            <div>
                <label class="text-xs text-gray-400">Filter Tag</label>
                <input v-model="filterTag" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="contoh: aljabar">
            </div>
            <div class="flex items-end">
                <button @click="resetFilters" class="w-full bg-gray-700 hover:bg-gray-600 text-sm px-3 py-2 rounded">Reset Filter</button>
            </div>
        </div>
     </div>

     <!-- Feed -->
     <div class="space-y-6">
        <div v-if="loading" class="text-center py-8">Memuat diskusi...</div>

        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
           <!-- Post Header -->
           <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg">
                      {{ post.author_name.charAt(0) }}
                  </div>
                  <div>
                      <div class="font-bold flex items-center gap-2">
                          {{ post.author_name }}
                          <span v-if="post.author_role !== 'student'" class="bg-blue-600 text-[10px] px-2 py-0.5 rounded uppercase">Guru</span>
                          <span class="bg-gray-700 text-[10px] px-2 py-0.5 rounded uppercase">{{ post.category || 'Umum' }}</span>
                          <span v-if="post.solved_comment_id" class="bg-emerald-600 text-[10px] px-2 py-0.5 rounded uppercase">Solved</span>
                          <span v-if="post.has_unread" class="bg-yellow-500 text-[10px] px-2 py-0.5 rounded uppercase text-black">Baru</span>
                      </div>
                      <div class="text-xs text-gray-400">{{ new Date(post.created_at).toLocaleString() }}</div>
                  </div>
              </div>
              <div v-if="post.is_locked" class="text-yellow-500 text-xs flex items-center gap-1 border border-yellow-500 px-2 py-1 rounded">
                 🔒 Terkunci
              </div>
           </div>

           <!-- Post Content -->
           <p class="text-gray-200 mb-3 whitespace-pre-line text-lg leading-relaxed">
              <span v-for="(part, idx) in splitMentions(post.content)" :key="idx" :class="part.isMention ? 'text-yellow-300 font-semibold' : ''">
                  {{ part.text }}
              </span>
           </p>

           <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-4">
              <span v-for="tag in post.tags" :key="tag" class="text-xs bg-gray-700 px-2 py-1 rounded">#{{ tag }}</span>
           </div>

           <div class="flex items-center justify-between text-sm text-gray-400 mb-4">
              <button @click="toggleLike(post)" class="flex items-center gap-2 hover:text-white">
                 <span>{{ post.liked_by_me ? '👍' : '🤍' }}</span>
                 <span>{{ post.likes_count || 0 }}</span>
              </button>
              <button
                @click="toggleComments(post)"
                class="hover:text-white flex items-center gap-2"
              >
                <span>{{ post.showComments ? '▼ Sembunyikan' : '▶ Lihat' }} {{ post.comments.length }} Komentar</span>
              </button>
           </div>

           <!-- Comments Section -->
           <div class="border-t border-gray-700 pt-4">
               <div v-if="post.showComments" class="space-y-4 mb-4 transition-all">
                   <div v-for="comment in post.comments" :key="comment.id" class="flex gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                            {{ comment.author_name.charAt(0) }}
                        </div>
                        <div class="bg-gray-700 rounded-lg p-3 flex-1" :class="comment.id === post.solved_comment_id ? 'border border-emerald-500' : ''">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-sm">
                                    {{ comment.author_name }}
                                    <span v-if="comment.author_role !== 'student'" class="text-blue-400 ml-1 text-xs">(Guru)</span>
                                    <span v-if="comment.id === post.solved_comment_id" class="text-emerald-400 ml-2 text-[10px] uppercase">Jawaban Terbaik</span>
                                </span>
                                <span class="text-[10px] text-gray-400">{{ new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                            </div>
                            <p class="text-sm text-gray-300">
                              <span v-for="(part, idx) in splitMentions(comment.content)" :key="idx" :class="part.isMention ? 'text-yellow-300 font-semibold' : ''">
                                  {{ part.text }}
                              </span>
                            </p>
                        </div>
                   </div>
               </div>

               <!-- Comment Input -->
               <div v-if="!post.is_locked" class="flex gap-2 items-center mt-4">
                   <div class="flex-1">
                       <FloatingInput
                           v-model="post.newComment"
                           label="Tulis komentar..."
                           :id="`comment-${post.id}`"
                           class="!mb-0"
                           @keyup.enter="createComment(post)"
                           @focus="post.showComments = true"
                       />
                   </div>
                   <button
                     @click="createComment(post)"
                     class="bg-gray-700 p-2 rounded-full hover:bg-gray-600 mb-1"
                   >
                     🚀
                   </button>
               </div>
               <div v-else class="text-center text-xs text-gray-500 py-2">
                   Komentar dinonaktifkan untuk postingan ini.
               </div>
           </div>
        </div>

        <div v-if="!loading && posts.length === 0" class="text-center text-gray-500 py-12">
            Belum ada diskusi. Jadilah yang pertama memposting!
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import FloatingInput from '../components/FloatingInput.vue';
import FloatingTextarea from '../components/FloatingTextarea.vue';
import api from '../api';
import { useDialog } from '../utils/dialog';

const posts = ref<any[]>([]);
const newPostContent = ref('');
const newPostCategory = ref('Umum');
const newPostTags = ref('');
const filterCategory = ref('Semua');
const filterTag = ref('');
const loading = ref(true);
const student = ref<any>(null);
const dialog = useDialog();

const timer = ref<any>(null);

const showEmbedInput = ref(false);
const newEmbedCode = ref('');

const categories = ['Umum', 'Materi', 'Tugas', 'Kuis'];

// Computeds
const isValidPost = computed(() => {
    return newPostContent.value.trim() !== '';
});

const filteredPosts = computed(() => {
    const tagFilter = filterTag.value.trim().toLowerCase();
    return posts.value.filter((post) => {
        const category = post.category || 'Umum';
        if (filterCategory.value !== 'Semua' && category !== filterCategory.value) return false;
        if (!tagFilter) return true;
        return (post.tags || []).some((tag: string) => tag.toLowerCase().includes(tagFilter));
    });
});

const splitMentions = (text: string) => {
    const content = text || '';
    const regex = /(@[A-Za-z0-9_.-]+)/g;
    const parts: Array<{ text: string; isMention: boolean }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ text: content.slice(lastIndex, match.index), isMention: false });
        }
        parts.push({ text: match[0], isMention: true });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
        parts.push({ text: content.slice(lastIndex), isMention: false });
    }
    return parts.length ? parts : [{ text: content, isMention: false }];
};

const parseTags = (raw: string) => {
    return raw
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8);
};

const resetFilters = () => {
    filterCategory.value = 'Semua';
    filterTag.value = '';
};

// API Methods
const loadPosts = async () => {
    try {
        const params = student.value?.id ? { user_id: student.value.id } : undefined;
        const { data } = await api.get('/discussions', { params });

        // Merge strategy: Update posts but keep UI state
        posts.value = data.map((p: any) => {
            const existing = posts.value.find(ep => ep.id === p.id);
            return {
                ...p,
                newComment: existing ? existing.newComment : '',
                showComments: existing ? existing.showComments : false
            };
        });
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const createPost = async () => {
    if (!isValidPost.value) return;
    try {
        const payload: any = {
            content: newPostContent.value,
            author_id: student.value.id || 'unknown',
            author_name: student.value.full_name || 'Siswa',
            author_role: 'student',
            category: newPostCategory.value,
            tags: parseTags(newPostTags.value),
            embed_code: showEmbedInput.value ? newEmbedCode.value : undefined // Send valid embed code or undefined
        };

        const { data } = await api.post('/discussions', payload);

        // Optimistic
        posts.value.unshift({
            ...data,
            comments: [],
            newComment: '',
            showComments: true
        });

        // Reset
        newPostContent.value = '';
        newPostTags.value = '';
        newPostCategory.value = 'Umum';
        newEmbedCode.value = '';
        showEmbedInput.value = false;

    } catch (e) {
        await dialog.alert('Gagal membuat postingan');
    }
};

const toggleLike = async (post: any) => {
    try {
        const userId = student.value?.id;
        if (!userId) return;
        const { data } = await api.post(`/discussions/${post.id}/like`, { user_id: userId });
        const delta = data.liked ? 1 : -1;
        post.liked_by_me = data.liked;
        post.likes_count = Math.max(0, (post.likes_count || 0) + delta);
    } catch (e) {
        // ignore
    }
};

const markPostRead = async (post: any) => {
    try {
        const userId = student.value?.id;
        if (!userId) return;
        await api.post(`/discussions/${post.id}/read`, { user_id: userId });
        post.has_unread = false;
    } catch (e) {
        // ignore
    }
};

const toggleComments = async (post: any) => {
    post.showComments = !post.showComments;
    if (post.showComments) {
        await markPostRead(post);
    }
};

const createComment = async (post: any) => {
    if (!post.newComment.trim()) return;
    try {
        const { data } = await api.post(`/discussions/${post.id}/comments`, {
            content: post.newComment,
            author_id: student.value.id || 'unknown',
            author_name: student.value.full_name || 'Siswa',
            author_role: 'student'
        });

        if (!post.comments) post.comments = [];
        post.comments.push(data);
        post.newComment = '';
        post.showComments = true;
        await markPostRead(post);

    } catch (e: any) {
        if (e.response && e.response.status === 403) {
             await dialog.alert('Postingan ini terkunci.');
        } else {
             await dialog.alert('Gagal mengirim komentar');
        }
    }
};

onMounted(() => {
    const s = localStorage.getItem('student');
    if (s) student.value = JSON.parse(s);
    loadPosts();
    timer.value = setInterval(loadPosts, 5000);
});

onUnmounted(() => {
    if (timer.value) clearInterval(timer.value);
});
</script>
