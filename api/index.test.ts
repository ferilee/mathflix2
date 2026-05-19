import { afterEach, describe, expect, mock, test } from "bun:test";
import { app } from "./index";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
  delete process.env.FRONTEND_URL;
});

describe("mathflix-api endpoints", () => {
  test("GET /", async () => {
    const res = await app.request("http://local/");
    expect(res.status).toBe(200);
  });

  test("GET /auth/google returns 500 when missing client id", async () => {
    const res = await app.request("http://local/auth/google");
    expect(res.status).toBe(500);
  });

  test("GET /auth/google redirects when configured", async () => {
    process.env.GOOGLE_CLIENT_ID = "cid";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";
    const res = await app.request("http://local/auth/google");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("client_id=cid");
  });

  test("GET /auth/google/callback validates missing code", async () => {
    const res = await app.request("http://local/auth/google/callback");
    expect(res.status).toBe(400);
  });

  test("GET /auth/google/callback success with mocked Google APIs", async () => {
    process.env.GOOGLE_CLIENT_ID = "cid";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";
    process.env.FRONTEND_URL = "http://localhost:9111";

    const fetchMock = mock(async (url: string) => {
      if (url.includes("oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
      }
      return new Response(
        JSON.stringify({ email: "user@guru.smk.belajar.id", name: "User", picture: "pic" }),
        { status: 200 },
      );
    });
    globalThis.fetch = fetchMock as any;

    const res = await app.request("http://local/auth/google/callback?code=abc");
    expect(res.status).toBe(302);
    const location = res.headers.get("location") || "";
    expect(location).toContain("/oauth/callback?token=temporary_dummy_token");
    const userJson = new URL(location).searchParams.get("user") || "{}";
    const user = JSON.parse(userJson);
    expect(user.role).toBe("guru");
  });

  test("GET /auth/google/callback returns 400 when Google token exchange fails", async () => {
    process.env.GOOGLE_CLIENT_ID = "cid";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";

    const fetchMock = mock(async () => {
      return new Response(
        JSON.stringify({ error: "invalid_grant", error_description: "Bad code" }),
        { status: 200 },
      );
    });
    globalThis.fetch = fetchMock as any;

    const res = await app.request("http://local/auth/google/callback?code=bad");
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Bad code");
  });

  test("GET /auth/google/callback sets admin role for admin email", async () => {
    process.env.GOOGLE_CLIENT_ID = "cid";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";
    process.env.FRONTEND_URL = "http://localhost:9111";

    const fetchMock = mock(async (url: string) => {
      if (url.includes("oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          email: "the.real.ferilee@gmail.com",
          name: "Ferilee",
          picture: "pic",
        }),
        { status: 200 },
      );
    });
    globalThis.fetch = fetchMock as any;

    const res = await app.request("http://local/auth/google/callback?code=admin");
    const location = res.headers.get("location") || "";
    expect(res.status).toBe(302);
    const userJson = new URL(location).searchParams.get("user") || "{}";
    const user = JSON.parse(userJson);
    expect(user.role).toBe("admin");
  });

  test("GET /auth/google/callback returns 500 on unexpected fetch error", async () => {
    process.env.GOOGLE_CLIENT_ID = "cid";
    process.env.GOOGLE_CLIENT_SECRET = "secret";

    const fetchMock = mock(async () => {
      throw new Error("network down");
    });
    globalThis.fetch = fetchMock as any;

    const res = await app.request("http://local/auth/google/callback?code=abc");
    expect(res.status).toBe(500);
  });

  test("mock and fallback routes", async () => {
    expect((await app.request("http://local/billing/access")).status).toBe(200);
    expect((await app.request("http://local/materials")).status).toBe(200);
    expect((await app.request("http://local/quizzes")).status).toBe(200);
    expect((await app.request("http://local/anything-else")).status).toBe(200);
  });

  test("discussion CRUD flow works", async () => {
    const create = await app.request("http://local/discussions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: "Halo diskusi",
        author_id: "s1",
        author_name: "Student",
        author_role: "student",
        category: "Umum",
        tags: ["test"],
      }),
    });
    expect(create.status).toBe(200);
    const createdPost = await create.json();
    expect(createdPost.id).toBeDefined();

    const list = await app.request("http://local/discussions?user_id=guru1");
    const listBody = await list.json();
    expect(list.status).toBe(200);
    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody[0].has_unread).toBe(true);

    const like = await app.request(`http://local/discussions/${createdPost.id}/like`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_id: "guru1" }),
    });
    expect(like.status).toBe(200);

    const comment = await app.request(`http://local/discussions/${createdPost.id}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: "Jawaban",
        author_id: "guru1",
        author_name: "Guru",
        author_role: "guru",
      }),
    });
    expect(comment.status).toBe(200);
    const commentBody = await comment.json();

    const solved = await app.request(`http://local/discussions/${createdPost.id}/solved`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ solved_comment_id: commentBody.id }),
    });
    expect(solved.status).toBe(200);

    const read = await app.request(`http://local/discussions/${createdPost.id}/read`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_id: "guru1" }),
    });
    expect(read.status).toBe(200);

    const lock = await app.request(`http://local/discussions/${createdPost.id}/lock`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_locked: true }),
    });
    expect(lock.status).toBe(200);

    const deleteComment = await app.request(`http://local/discussions/comments/${commentBody.id}`, {
      method: "DELETE",
    });
    expect(deleteComment.status).toBe(200);

    const del = await app.request(`http://local/discussions/${createdPost.id}`, {
      method: "DELETE",
    });
    expect(del.status).toBe(200);
  });

  test("profiling sync persists student data for admin monitor", async () => {
    const sync = await app.request("http://local/billing/students/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "student-1@example.com",
        nisn: "10001",
        full_name: "Siswa Satu",
        grade_level: 10,
        class_name: "A",
        major: "TKJ",
        school: "SMK 1",
        status: "active",
      }),
    });
    expect(sync.status).toBe(200);
    const syncBody = await sync.json();
    expect(syncBody.upserted).toBe(1);

    const list = await app.request("http://local/students?page=1&limit=10&search=siswa");
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.some((row: any) => row.id === "student-1@example.com")).toBe(true);

    const detail = await app.request("http://local/students/student-1@example.com");
    expect(detail.status).toBe(200);
    const detailBody = await detail.json();
    expect(detailBody.full_name).toBe("Siswa Satu");
  });

  test("materials CRUD persists in API database", async () => {
    const create = await app.request("http://local/materials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Materi A",
        description: "Desc",
        major_target: "TKJ",
        teacher_name: "Guru A",
        created_by: "guru-a",
      }),
    });
    expect(create.status).toBe(200);
    const created = await create.json();
    expect(created.id).toBeDefined();

    const detail = await app.request(`http://local/materials/${created.id}`);
    expect(detail.status).toBe(200);

    const update = await app.request(`http://local/materials/${created.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Materi A Updated" }),
    });
    const updated = await update.json();
    expect(updated.title).toBe("Materi A Updated");

    const del = await app.request(`http://local/materials/${created.id}`, { method: "DELETE" });
    expect(del.status).toBe(200);
  });

  test("quizzes CRUD and questions persist in API database", async () => {
    const material = await app.request("http://local/materials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Materi Q", created_by: "guru-a" }),
    });
    const materialRow = await material.json();

    const createQuiz = await app.request("http://local/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        material_id: materialRow.id,
        title: "Quiz A",
        passing_score: 80,
        created_by: "guru-a",
      }),
    });
    expect(createQuiz.status).toBe(200);
    const quiz = await createQuiz.json();

    const addQuestion = await app.request(`http://local/quizzes/${quiz.id}/questions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question_text: "2+2=?",
        question_type: "multiple_choice",
        options: ["3", "4"],
        correct_answer: "4",
      }),
    });
    expect(addQuestion.status).toBe(200);
    const question = await addQuestion.json();

    const detail = await app.request(`http://local/quizzes/${quiz.id}`);
    const detailBody = await detail.json();
    expect(detail.status).toBe(200);
    expect(Array.isArray(detailBody.questions)).toBe(true);
    expect(detailBody.questions.length).toBeGreaterThan(0);

    const update = await app.request(`http://local/quizzes/${quiz.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Quiz A Updated" }),
    });
    const updated = await update.json();
    expect(updated.title).toBe("Quiz A Updated");

    const deleteQuestion = await app.request(`http://local/questions/${question.id}`, { method: "DELETE" });
    expect(deleteQuestion.status).toBe(200);

    const del = await app.request(`http://local/quizzes/${quiz.id}`, { method: "DELETE" });
    expect(del.status).toBe(200);
  });

  test("assignments CRUD and submission/grade flow persists", async () => {
    await app.request("http://local/students", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "s-assignment",
        full_name: "Siswa Assignment",
        grade_level: 10,
        major: "TKJ",
      }),
    });

    const create = await app.request("http://local/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Tugas A",
        description: "Kerjakan",
        due_date: new Date().toISOString(),
        target_grade: 10,
        target_major: "TKJ",
        target_students: ["s-assignment"],
        created_by: "guru-a",
      }),
    });
    expect(create.status).toBe(200);
    const assignment = await create.json();

    const myAssignments = await app.request("http://local/assignments/my-assignments", {
      headers: { "X-Student-ID": "s-assignment" },
    });
    expect(myAssignments.status).toBe(200);

    const submit = await app.request(`http://local/assignments/${assignment.id}/submit`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Student-ID": "s-assignment",
      },
      body: JSON.stringify({ url: "https://example.com", note: "done" }),
    });
    expect(submit.status).toBe(200);

    const grade = await app.request(`http://local/assignments/${assignment.id}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        student_id: "s-assignment",
        grade: 95,
        feedback: "Bagus",
      }),
    });
    expect(grade.status).toBe(200);

    const submissions = await app.request(`http://local/assignments/${assignment.id}/submissions`);
    expect(submissions.status).toBe(200);
    const submissionsBody = await submissions.json();
    expect(Array.isArray(submissionsBody)).toBe(true);

    const del = await app.request(`http://local/assignments/${assignment.id}`, { method: "DELETE" });
    expect(del.status).toBe(200);
  });
});
