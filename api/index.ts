import { Hono } from 'hono';
import { cors } from 'hono/cors';
import crypto from 'node:crypto';
import Database from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const app = new Hono();

app.use('*', cors());

const dbPath = process.env.API_DB_PATH || './data/api.sqlite';
mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath, { create: true });

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nisn TEXT,
  full_name TEXT NOT NULL,
  major TEXT,
  grade_level INTEGER,
  school TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  class_name TEXT,
  hp INTEGER DEFAULT 100,
  xp INTEGER DEFAULT 0,
  ap INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  photo_profile TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  major_target TEXT,
  target_grade INTEGER,
  target_class TEXT,
  target_school TEXT,
  teacher_name TEXT,
  image_url TEXT,
  is_featured INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  material_id TEXT,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 75,
  style TEXT DEFAULT 'millionaire',
  image_url TEXT,
  use_bank INTEGER DEFAULT 0,
  question_count INTEGER,
  difficulty_mix TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options TEXT,
  correct_answer TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  target_grade INTEGER,
  target_major TEXT,
  target_students TEXT,
  rubric TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  submission_url TEXT,
  submission_note TEXT,
  submitted_at TEXT,
  grade INTEGER,
  feedback TEXT,
  rubric_scores TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignment_id, student_id)
);
`);

type StudentRow = {
  id: string;
  nisn: string | null;
  full_name: string;
  major: string | null;
  grade_level: number | null;
  school: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  class_name: string | null;
  hp: number;
  xp: number;
  ap: number;
  level: number;
  status: string;
  photo_profile: string | null;
  created_at: string;
};

const toIntOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.trunc(num) : null;
};

const upsertStudent = (input: any) => {
  const id = String(input?.id || '').trim();
  const fullName = String(input?.full_name || input?.fullName || '').trim();
  if (!id || !fullName) return false;
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO students (
      id, nisn, full_name, major, grade_level, school,
      teacher_id, teacher_name, class_name, hp, xp, ap, level, status, photo_profile, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      nisn=excluded.nisn,
      full_name=excluded.full_name,
      major=excluded.major,
      grade_level=excluded.grade_level,
      school=excluded.school,
      teacher_id=excluded.teacher_id,
      teacher_name=excluded.teacher_name,
      class_name=excluded.class_name,
      hp=excluded.hp,
      xp=excluded.xp,
      ap=excluded.ap,
      level=excluded.level,
      status=excluded.status,
      photo_profile=COALESCE(excluded.photo_profile, students.photo_profile),
      created_at=COALESCE(students.created_at, excluded.created_at)
  `);

  stmt.run(
    id,
    input?.nisn || null,
    fullName,
    input?.major || null,
    toIntOrNull(input?.grade_level ?? input?.gradeLevel),
    input?.school || null,
    input?.teacher_id || input?.teacherId || null,
    input?.teacher_name || input?.teacherName || null,
    input?.class_name || input?.className || null,
    toIntOrNull(input?.hp) ?? 100,
    toIntOrNull(input?.xp) ?? 0,
    toIntOrNull(input?.ap) ?? 0,
    toIntOrNull(input?.level) ?? 1,
    String(input?.status || 'active'),
    input?.photo_profile || input?.photoProfile || null,
    input?.created_at || input?.createdAt || now,
  );
  return true;
};

const nowIso = () => new Date().toISOString();
const parseJsonSafe = (value: any, fallback: any) => {
  if (!value) return fallback;
  if (Array.isArray(value) || typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
};

const normalizeStudent = (row: any): StudentRow => ({
  id: row.id,
  nisn: row.nisn ?? null,
  full_name: row.full_name,
  major: row.major ?? null,
  grade_level: row.grade_level ?? null,
  school: row.school ?? null,
  teacher_id: row.teacher_id ?? null,
  teacher_name: row.teacher_name ?? null,
  class_name: row.class_name ?? null,
  hp: Number(row.hp ?? 100),
  xp: Number(row.xp ?? 0),
  ap: Number(row.ap ?? 0),
  level: Number(row.level ?? 1),
  status: row.status || 'active',
  photo_profile: row.photo_profile ?? null,
  created_at: row.created_at || new Date().toISOString(),
});

type DiscussionComment = {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: string;
  created_at: string;
};

type DiscussionPost = {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: string;
  category: string;
  tags: string[];
  created_at: string;
  likes_count: number;
  liked_by: string[];
  read_by: string[];
  solved_comment_id: string | null;
  is_locked: boolean;
  comments: DiscussionComment[];
};

const discussions: DiscussionPost[] = [];

const asTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
};

const serializeDiscussion = (post: DiscussionPost, userId?: string | null) => ({
  ...post,
  liked_by_me: !!userId && post.liked_by.includes(userId),
  has_unread: !!userId && post.author_id !== userId && !post.read_by.includes(userId),
});

app.get('/', (c) => {
  return c.text('Mathflix New API Running!');
});

// ---- MATERIALS ----
app.get('/materials', (c) => {
  const rows = db.query('SELECT * FROM materials ORDER BY datetime(created_at) DESC').all() as any[];
  return c.json(rows.map((row) => ({ ...row, is_featured: !!row.is_featured })));
});

app.get('/materials/:id', (c) => {
  const row = db.query('SELECT * FROM materials WHERE id = ?').get(c.req.param('id')) as any;
  if (!row) return c.json({ error: 'material not found' }, 404);
  return c.json({ ...row, is_featured: !!row.is_featured });
});

app.post('/materials', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  db.query(`
    INSERT INTO materials (
      id, title, description, content, major_target, target_grade, target_class, target_school,
      teacher_name, image_url, is_featured, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body?.title || 'Untitled',
    body?.description || '',
    body?.content || '',
    body?.major_target || 'Semua',
    toIntOrNull(body?.target_grade),
    body?.target_class || null,
    body?.target_school || null,
    body?.teacher_name || null,
    body?.image_url || null,
    body?.is_featured ? 1 : 0,
    body?.created_by || null,
    createdAt,
    createdAt,
  );
  const row = db.query('SELECT * FROM materials WHERE id = ?').get(id) as any;
  return c.json({ ...row, is_featured: !!row.is_featured });
});

app.put('/materials/:id', async (c) => {
  const id = c.req.param('id');
  const existing = db.query('SELECT * FROM materials WHERE id = ?').get(id) as any;
  if (!existing) return c.json({ error: 'material not found' }, 404);
  const body = await c.req.json();
  db.query(`
    UPDATE materials SET
      title=?, description=?, content=?, major_target=?, target_grade=?, target_class=?, target_school=?,
      teacher_name=?, image_url=?, is_featured=?, created_by=?, updated_at=?
    WHERE id=?
  `).run(
    body?.title ?? existing.title,
    body?.description ?? existing.description,
    body?.content ?? existing.content,
    body?.major_target ?? existing.major_target,
    toIntOrNull(body?.target_grade ?? existing.target_grade),
    body?.target_class ?? existing.target_class,
    body?.target_school ?? existing.target_school,
    body?.teacher_name ?? existing.teacher_name,
    body?.image_url ?? existing.image_url,
    body?.is_featured !== undefined ? (body.is_featured ? 1 : 0) : existing.is_featured,
    body?.created_by ?? existing.created_by,
    nowIso(),
    id,
  );
  const row = db.query('SELECT * FROM materials WHERE id = ?').get(id) as any;
  return c.json({ ...row, is_featured: !!row.is_featured });
});

app.delete('/materials/:id', (c) => {
  const id = c.req.param('id');
  db.query('DELETE FROM materials WHERE id = ?').run(id);
  return c.json({ status: 'ok' });
});

// ---- QUIZZES + QUESTIONS ----
app.get('/quizzes', (c) => {
  const rows = db.query('SELECT * FROM quizzes ORDER BY datetime(created_at) DESC').all() as any[];
  return c.json(rows.map((row) => ({
    ...row,
    use_bank: !!row.use_bank,
    difficulty_mix: parseJsonSafe(row.difficulty_mix, null),
  })));
});

app.get('/quizzes/:id', (c) => {
  const id = c.req.param('id');
  const quiz = db.query('SELECT * FROM quizzes WHERE id = ?').get(id) as any;
  if (!quiz) return c.json({ error: 'quiz not found' }, 404);
  const questions = db.query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY created_at ASC').all(id) as any[];
  const mappedQuestions = questions.map((q) => ({
    ...q,
    options: parseJsonSafe(q.options, []),
  }));
  return c.json({
    ...quiz,
    use_bank: !!quiz.use_bank,
    difficulty_mix: parseJsonSafe(quiz.difficulty_mix, null),
    questions: mappedQuestions,
  });
});

app.post('/quizzes', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  db.query(`
    INSERT INTO quizzes (
      id, material_id, title, passing_score, style, image_url, use_bank, question_count, difficulty_mix,
      created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body?.material_id || null,
    body?.title || 'Untitled Quiz',
    toIntOrNull(body?.passing_score) ?? 75,
    body?.style || 'millionaire',
    body?.image_url || null,
    body?.use_bank ? 1 : 0,
    toIntOrNull(body?.question_count),
    body?.difficulty_mix ? JSON.stringify(body.difficulty_mix) : null,
    body?.created_by || null,
    createdAt,
    createdAt,
  );
  const row = db.query('SELECT * FROM quizzes WHERE id = ?').get(id) as any;
  return c.json({ ...row, use_bank: !!row.use_bank, difficulty_mix: parseJsonSafe(row.difficulty_mix, null) });
});

app.put('/quizzes/:id', async (c) => {
  const id = c.req.param('id');
  const existing = db.query('SELECT * FROM quizzes WHERE id = ?').get(id) as any;
  if (!existing) return c.json({ error: 'quiz not found' }, 404);
  const body = await c.req.json();
  db.query(`
    UPDATE quizzes SET
      material_id=?, title=?, passing_score=?, style=?, image_url=?, use_bank=?, question_count=?, difficulty_mix=?, updated_at=?
    WHERE id=?
  `).run(
    body?.material_id ?? existing.material_id,
    body?.title ?? existing.title,
    toIntOrNull(body?.passing_score ?? existing.passing_score) ?? 75,
    body?.style ?? existing.style,
    body?.image_url ?? existing.image_url,
    body?.use_bank !== undefined ? (body.use_bank ? 1 : 0) : existing.use_bank,
    toIntOrNull(body?.question_count ?? existing.question_count),
    body?.difficulty_mix ? JSON.stringify(body.difficulty_mix) : existing.difficulty_mix,
    nowIso(),
    id,
  );
  const row = db.query('SELECT * FROM quizzes WHERE id = ?').get(id) as any;
  return c.json({ ...row, use_bank: !!row.use_bank, difficulty_mix: parseJsonSafe(row.difficulty_mix, null) });
});

app.delete('/quizzes/:id', (c) => {
  const id = c.req.param('id');
  db.query('DELETE FROM questions WHERE quiz_id = ?').run(id);
  db.query('DELETE FROM quizzes WHERE id = ?').run(id);
  return c.json({ status: 'ok' });
});

app.get('/quizzes/:id/questions', (c) => {
  const id = c.req.param('id');
  const rows = db.query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY created_at ASC').all(id) as any[];
  return c.json(rows.map((q) => ({ ...q, options: parseJsonSafe(q.options, []) })));
});

app.post('/quizzes/:id/questions', async (c) => {
  const quizId = c.req.param('id');
  const quiz = db.query('SELECT id FROM quizzes WHERE id = ?').get(quizId) as any;
  if (!quiz) return c.json({ error: 'quiz not found' }, 404);
  const body = await c.req.json();
  const questionId = crypto.randomUUID();
  db.query(`
    INSERT INTO questions (id, quiz_id, question_text, question_type, options, correct_answer, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    questionId,
    quizId,
    body?.question_text || '',
    body?.question_type || 'multiple_choice',
    body?.options ? JSON.stringify(body.options) : JSON.stringify([]),
    body?.correct_answer ?? '',
    nowIso(),
  );
  const row = db.query('SELECT * FROM questions WHERE id = ?').get(questionId) as any;
  return c.json({ ...row, options: parseJsonSafe(row.options, []) });
});

app.delete('/questions/:id', (c) => {
  db.query('DELETE FROM questions WHERE id = ?').run(c.req.param('id'));
  return c.json({ status: 'ok' });
});

// ---- ASSIGNMENTS ----
app.get('/assignments', (c) => {
  const rows = db.query('SELECT * FROM assignments ORDER BY datetime(created_at) DESC').all() as any[];
  return c.json(rows.map((row) => ({
    ...row,
    target_students: parseJsonSafe(row.target_students, []),
    rubric: parseJsonSafe(row.rubric, []),
  })));
});

app.get('/assignments/my-assignments', (c) => {
  const studentId = c.req.header('X-Student-ID') || '';
  if (!studentId) return c.json([]);
  const student = db.query('SELECT * FROM students WHERE id = ?').get(studentId) as any;
  if (!student) return c.json([]);
  const rows = db.query('SELECT * FROM assignments ORDER BY datetime(created_at) DESC').all() as any[];
  const filtered = rows.filter((row) => {
    const selected = parseJsonSafe(row.target_students, []) as string[];
    const isDirect = selected.includes(studentId);
    const gradeMatch = row.target_grade === null || row.target_grade === undefined || Number(row.target_grade) === Number(student.grade_level);
    const majorMatch = !row.target_major || row.target_major === 'NONE' ? false : row.target_major === student.major;
    const classModeMatch = gradeMatch && (row.target_major == null || row.target_major === student.major);
    if (row.target_grade === -1 || row.target_major === 'NONE') return isDirect;
    return isDirect || classModeMatch || majorMatch;
  });
  return c.json(filtered.map((row) => ({
    ...row,
    target_students: parseJsonSafe(row.target_students, []),
    rubric: parseJsonSafe(row.rubric, []),
  })));
});

app.get('/assignments/:id', (c) => {
  const row = db.query('SELECT * FROM assignments WHERE id = ?').get(c.req.param('id')) as any;
  if (!row) return c.json({ error: 'assignment not found' }, 404);
  return c.json({
    ...row,
    target_students: parseJsonSafe(row.target_students, []),
    rubric: parseJsonSafe(row.rubric, []),
  });
});

app.post('/assignments', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  db.query(`
    INSERT INTO assignments (
      id, title, description, due_date, target_grade, target_major, target_students, rubric, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body?.title || 'Untitled Assignment',
    body?.description || '',
    body?.due_date || createdAt,
    toIntOrNull(body?.target_grade),
    body?.target_major || null,
    JSON.stringify(Array.isArray(body?.target_students) ? body.target_students : []),
    JSON.stringify(Array.isArray(body?.rubric) ? body.rubric : []),
    body?.created_by || null,
    createdAt,
    createdAt,
  );
  const row = db.query('SELECT * FROM assignments WHERE id = ?').get(id) as any;
  return c.json({
    ...row,
    target_students: parseJsonSafe(row.target_students, []),
    rubric: parseJsonSafe(row.rubric, []),
  });
});

app.delete('/assignments/:id', (c) => {
  const id = c.req.param('id');
  db.query('DELETE FROM assignment_submissions WHERE assignment_id = ?').run(id);
  db.query('DELETE FROM assignments WHERE id = ?').run(id);
  return c.json({ status: 'ok' });
});

app.get('/assignments/:id/status', (c) => {
  const assignmentId = c.req.param('id');
  const studentId = c.req.header('X-Student-ID') || '';
  if (!studentId) return c.json(null);
  const row = db.query(`
    SELECT * FROM assignment_submissions
    WHERE assignment_id = ? AND student_id = ?
  `).get(assignmentId, studentId) as any;
  if (!row) return c.json(null);
  return c.json({
    ...row,
    rubric_scores: parseJsonSafe(row.rubric_scores, []),
  });
});

app.post('/assignments/:id/submit', async (c) => {
  const assignmentId = c.req.param('id');
  const studentId = c.req.header('X-Student-ID') || '';
  if (!studentId) return c.json({ error: 'X-Student-ID required' }, 400);
  const body = await c.req.json();
  const existing = db.query(`
    SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?
  `).get(assignmentId, studentId) as any;
  const now = nowIso();
  if (existing) {
    db.query(`
      UPDATE assignment_submissions
      SET submission_url=?, submission_note=?, submitted_at=?, updated_at=?
      WHERE assignment_id=? AND student_id=?
    `).run(body?.url || '', body?.note || '', now, now, assignmentId, studentId);
  } else {
    db.query(`
      INSERT INTO assignment_submissions (
        id, assignment_id, student_id, submission_url, submission_note, submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), assignmentId, studentId, body?.url || '', body?.note || '', now, now, now);
  }
  const row = db.query(`
    SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?
  `).get(assignmentId, studentId) as any;
  return c.json({ ...row, rubric_scores: parseJsonSafe(row.rubric_scores, []) });
});

app.get('/assignments/:id/submissions', (c) => {
  const assignmentId = c.req.param('id');
  const assignment = db.query('SELECT * FROM assignments WHERE id = ?').get(assignmentId) as any;
  if (!assignment) return c.json([]);
  const selectedStudents = parseJsonSafe(assignment.target_students, []) as string[];
  const allStudents = db.query('SELECT * FROM students ORDER BY full_name ASC').all() as any[];
  const targets = allStudents.filter((s) => {
    if (assignment.target_grade === -1 || assignment.target_major === 'NONE') return selectedStudents.includes(s.id);
    const gradeOk = assignment.target_grade == null || Number(assignment.target_grade) === Number(s.grade_level);
    const majorOk = assignment.target_major == null || assignment.target_major === s.major;
    return selectedStudents.includes(s.id) || (gradeOk && majorOk);
  });
  const submissions = db.query('SELECT * FROM assignment_submissions WHERE assignment_id = ?').all(assignmentId) as any[];

  const payload = targets.map((student) => {
    const submission = submissions.find((sub) => sub.student_id === student.id);
    return {
      student,
      status: submission ? 'submitted' : 'missing',
      submission: submission ? { ...submission, rubric_scores: parseJsonSafe(submission.rubric_scores, []) } : null,
    };
  });
  return c.json(payload);
});

app.post('/assignments/:id/grade', async (c) => {
  const assignmentId = c.req.param('id');
  const body = await c.req.json();
  const studentId = String(body?.student_id || '');
  if (!studentId) return c.json({ error: 'student_id required' }, 400);
  const existing = db.query(`
    SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?
  `).get(assignmentId, studentId) as any;
  const now = nowIso();
  if (existing) {
    db.query(`
      UPDATE assignment_submissions
      SET grade=?, feedback=?, rubric_scores=?, updated_at=?
      WHERE assignment_id=? AND student_id=?
    `).run(
      toIntOrNull(body?.grade),
      body?.feedback || '',
      JSON.stringify(Array.isArray(body?.rubric_scores) ? body.rubric_scores : []),
      now,
      assignmentId,
      studentId,
    );
  } else {
    db.query(`
      INSERT INTO assignment_submissions (
        id, assignment_id, student_id, grade, feedback, rubric_scores, submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      assignmentId,
      studentId,
      toIntOrNull(body?.grade),
      body?.feedback || '',
      JSON.stringify(Array.isArray(body?.rubric_scores) ? body.rubric_scores : []),
      now,
      now,
      now,
    );
  }
  const row = db.query(`
    SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?
  `).get(assignmentId, studentId) as any;
  return c.json({ ...row, rubric_scores: parseJsonSafe(row.rubric_scores, []) });
});

app.get('/students', (c) => {
  const teacherId = c.req.query('teacher_id') || '';
  const teacherName = (c.req.query('teacher_name') || '').toLowerCase();
  const search = (c.req.query('search') || '').toLowerCase();
  const major = (c.req.query('major') || '').toLowerCase();
  const school = (c.req.query('school') || '').toLowerCase();
  const grade = c.req.query('grade') || '';
  const page = Math.max(1, Number(c.req.query('page') || 1));
  const limit = Math.max(1, Number(c.req.query('limit') || 10));

  const rows = db.query('SELECT * FROM students ORDER BY datetime(created_at) DESC').all() as any[];
  let filtered = rows.map(normalizeStudent);

  if (teacherId) filtered = filtered.filter((r) => (r.teacher_id || '') === teacherId);
  if (teacherName) filtered = filtered.filter((r) => (r.teacher_name || '').toLowerCase().includes(teacherName));
  if (search) {
    filtered = filtered.filter((r) =>
      (r.full_name || '').toLowerCase().includes(search) ||
      (r.nisn || '').toLowerCase().includes(search) ||
      (r.id || '').toLowerCase().includes(search)
    );
  }
  if (major) filtered = filtered.filter((r) => (r.major || '').toLowerCase().includes(major));
  if (school) filtered = filtered.filter((r) => (r.school || '').toLowerCase().includes(school));
  if (grade) filtered = filtered.filter((r) => Number(r.grade_level) === Number(grade));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);
  return c.json({ data, total, page, limit, totalPages });
});

app.get('/students/:id', (c) => {
  const id = c.req.param('id');
  const row = db.query('SELECT * FROM students WHERE id = ?').get(id) as any;
  if (!row) return c.json({ error: 'student not found' }, 404);
  return c.json(normalizeStudent(row));
});

app.post('/students', async (c) => {
  const body = await c.req.json();
  const ok = upsertStudent(body);
  if (!ok) return c.json({ error: 'id and full_name required' }, 400);
  const row = db.query('SELECT * FROM students WHERE id = ?').get(String(body.id)) as any;
  return c.json(row ? normalizeStudent(row) : body);
});

app.put('/students/:id', async (c) => {
  const id = c.req.param('id');
  const existing = db.query('SELECT * FROM students WHERE id = ?').get(id) as any;
  if (!existing) return c.json({ error: 'student not found' }, 404);
  const body = await c.req.json();
  const merged = { ...normalizeStudent(existing), ...body, id };
  const ok = upsertStudent(merged);
  if (!ok) return c.json({ error: 'failed to update student' }, 400);
  const row = db.query('SELECT * FROM students WHERE id = ?').get(id) as any;
  return c.json(normalizeStudent(row));
});

app.delete('/students/:id', (c) => {
  const id = c.req.param('id');
  db.query('DELETE FROM students WHERE id = ?').run(id);
  return c.json({ status: 'ok', deleted: id });
});

app.post('/students/bulk', async (c) => {
  const body = await c.req.json();
  const rows = Array.isArray(body) ? body : [];
  let upserted = 0;
  for (const row of rows) {
    if (upsertStudent(row)) upserted += 1;
  }
  return c.json({ status: 'ok', upserted });
});

app.post('/students/bulk-delete', async (c) => {
  const body = await c.req.json();
  const ids = Array.isArray(body?.ids) ? body.ids.map((id: unknown) => String(id)) : [];
  for (const id of ids) {
    db.query('DELETE FROM students WHERE id = ?').run(id);
  }
  return c.json({ status: 'ok', deleted: ids.length });
});

app.get('/students/:id/recommendations', (c) => {
  const id = c.req.param('id');
  const student = db.query('SELECT * FROM students WHERE id = ?').get(id) as any;
  if (!student) return c.json({ recommendations: [] });
  const materials = [] as any[];
  return c.json({ recommendations: materials });
});

app.post('/billing/students/sync', async (c) => {
  const payload = await c.req.json();
  const rows = Array.isArray(payload) ? payload : [payload];
  let upserted = 0;
  for (const row of rows) {
    if (upsertStudent(row)) upserted += 1;
  }
  return c.json({ status: 'ok', upserted });
});

app.put('/billing/students/:studentId/gamification', async (c) => {
  const studentId = c.req.param('studentId');
  const row = db.query('SELECT * FROM students WHERE id = ?').get(studentId) as any;
  if (!row) return c.json({ error: 'student not found' }, 404);
  const body = await c.req.json();
  const nextHp = body?.hp !== undefined ? Math.max(0, Math.min(100, Number(body.hp))) : Number(row.hp ?? 100);
  const nextAp = body?.ap !== undefined ? Math.max(0, Number(body.ap)) : Number(row.ap ?? 0);
  const nextStatus = nextHp < 60 ? 'debuff' : 'active';
  db.query('UPDATE students SET hp = ?, ap = ?, status = ? WHERE id = ?').run(nextHp, nextAp, nextStatus, studentId);
  const updated = db.query('SELECT * FROM students WHERE id = ?').get(studentId) as any;
  return c.json(normalizeStudent(updated));
});

app.get('/discussions', (c) => {
  const userId = c.req.query('user_id');
  const payload = discussions.map((post) => serializeDiscussion(post, userId));
  return c.json(payload);
});

app.post('/discussions', async (c) => {
  const body = await c.req.json();
  const content = String(body?.content || '').trim();
  if (!content) {
    return c.json({ error: 'content required' }, 400);
  }

  const post: DiscussionPost = {
    id: crypto.randomUUID(),
    content,
    author_id: String(body?.author_id || 'unknown'),
    author_name: String(body?.author_name || 'Anonymous'),
    author_role: String(body?.author_role || 'student'),
    category: String(body?.category || 'Umum'),
    tags: asTags(body?.tags),
    created_at: new Date().toISOString(),
    likes_count: 0,
    liked_by: [],
    read_by: [],
    solved_comment_id: null,
    is_locked: false,
    comments: [],
  };
  discussions.unshift(post);
  return c.json(post);
});

app.post('/discussions/:id/like', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = String(body?.user_id || '').trim();
  if (!userId) return c.json({ error: 'user_id required' }, 400);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);

  const hasLiked = post.liked_by.includes(userId);
  if (hasLiked) {
    post.liked_by = post.liked_by.filter((id) => id !== userId);
    post.likes_count = Math.max(0, post.likes_count - 1);
  } else {
    post.liked_by.push(userId);
    post.likes_count += 1;
  }

  return c.json({ liked: !hasLiked, likes_count: post.likes_count });
});

app.post('/discussions/:id/read', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = String(body?.user_id || '').trim();
  if (!userId) return c.json({ error: 'user_id required' }, 400);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  if (!post.read_by.includes(userId)) {
    post.read_by.push(userId);
  }
  return c.json({ status: 'ok' });
});

app.post('/discussions/:id/comments', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const content = String(body?.content || '').trim();
  if (!content) return c.json({ error: 'content required' }, 400);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  if (post.is_locked) return c.json({ error: 'discussion is locked' }, 400);

  const comment: DiscussionComment = {
    id: crypto.randomUUID(),
    content,
    author_id: String(body?.author_id || 'unknown'),
    author_name: String(body?.author_name || 'Anonymous'),
    author_role: String(body?.author_role || 'student'),
    created_at: new Date().toISOString(),
  };

  post.comments.push(comment);
  return c.json(comment);
});

app.patch('/discussions/:id/solved', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const solvedCommentId = body?.solved_comment_id ? String(body.solved_comment_id) : null;

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  if (solvedCommentId && !post.comments.some((comment) => comment.id === solvedCommentId)) {
    return c.json({ error: 'comment not found' }, 404);
  }
  post.solved_comment_id = solvedCommentId;
  return c.json({ status: 'ok', solved_comment_id: solvedCommentId });
});

app.patch('/discussions/:id/lock', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const isLocked = Boolean(body?.is_locked);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  post.is_locked = isLocked;
  return c.json({ status: 'ok', is_locked: isLocked });
});

app.delete('/discussions/:id', (c) => {
  const id = c.req.param('id');
  const index = discussions.findIndex((item) => item.id === id);
  if (index === -1) return c.json({ error: 'discussion not found' }, 404);
  discussions.splice(index, 1);
  return c.json({ status: 'ok' });
});

app.delete('/discussions/comments/:id', (c) => {
  const id = c.req.param('id');
  for (const post of discussions) {
    const commentIndex = post.comments.findIndex((comment) => comment.id === id);
    if (commentIndex !== -1) {
      post.comments.splice(commentIndex, 1);
      if (post.solved_comment_id === id) post.solved_comment_id = null;
      return c.json({ status: 'ok' });
    }
  }
  return c.json({ error: 'comment not found' }, 404);
});

// Google OAuth Auth Routes
app.get('/auth/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!clientId) {
    return c.text('Error: GOOGLE_CLIENT_ID is not configured in environment.', 500);
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
  return c.redirect(url);
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9111';

  if (!code) return c.text('No code provided', 400);

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return c.text('Error from Google: ' + tokenData.error_description, 400);
    }

    // 2. Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const email = userData.email as string;

    // 3. Determine Role based on email
    let role = 'student';
    if (email === 'the.real.ferilee@gmail.com') {
      role = 'admin';
    } else if (
      email.endsWith('@guru.smk.belajar.id') ||
      email.endsWith('@guru.sma.belajar.id') ||
      email.endsWith('@guru.smp.belajar.id') ||
      email.endsWith('@guru.sd.belajar.id')
    ) {
      role = 'guru';
    }

    // 4. Construct payload and send to frontend
    // TODO: Create a real JWT token and save user to database here
    const mathflixToken = "temporary_dummy_token";
    const userDataString = JSON.stringify({
      id: email, // use email as temporary ID
      email: email,
      role: role,
      full_name: userData.name,
      photo_profile: userData.picture
    });

    return c.redirect(`${frontendUrl}/oauth/callback?token=${mathflixToken}&user=${encodeURIComponent(userDataString)}`);
  } catch (error) {
    console.error('OAuth Error:', error);
    return c.text('Internal Server Error during OAuth process', 500);
  }
});

// Mock Routes untuk mengatasi 404 pada Frontend
app.get('/billing/access', (c) => c.json({ access: true, status: 'active' }));
app.get('/materials', (c) => c.json([]));
app.get('/quizzes', (c) => c.json([]));

// Catch-all route untuk menangkap semua GET request lainnya (announcements, discussions, dll)
app.all('*', (c) => {
  return c.json([]);
});

export default {
  port: Number(process.env.PORT || 3000),
  fetch: app.fetch,
};
