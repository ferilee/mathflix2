import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import Database from "bun:sqlite";

const testDbPath = "/tmp/mathflix-billing.test.db";
process.env.DB_URL = testDbPath;
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback";
process.env.FRONTEND_URL = "http://localhost:9111";

const sqlite = new Database(testDbPath, { create: true });
sqlite.exec(`
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS student_billing (
  student_id TEXT PRIMARY KEY,
  paid_until TEXT,
  grace_until TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS billing_payments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  student_count INTEGER NOT NULL,
  student_ids TEXT,
  paid_until TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS teacher_exemptions (
  teacher_id TEXT PRIMARY KEY,
  teacher_name TEXT,
  reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS teacher_policies (
  teacher_id TEXT PRIMARY KEY,
  teacher_name TEXT,
  grace_days INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  ap_cost INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS student_inventory (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  is_used INTEGER DEFAULT 0,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
  used_at TEXT
);
`);

let app: any;
let db: any;
let schema: any;

beforeAll(async () => {
  const indexMod = await import("./index");
  const dbMod = await import("./db");
  const schemaMod = await import("./schema");
  app = indexMod.app;
  db = dbMod.db;
  schema = schemaMod;
});

beforeEach(async () => {
  await db.delete(schema.studentInventory);
  await db.delete(schema.billingPayments);
  await db.delete(schema.studentBilling);
  await db.delete(schema.shopItems);
  await db.delete(schema.teacherExemptions);
  await db.delete(schema.teacherPolicies);
  await db.delete(schema.appSettings);
  await db.delete(schema.students);

  const now = new Date().toISOString();
  await db.insert(schema.students).values([
    {
      id: "s1",
      fullName: "Alice",
      teacherId: "t1",
      teacherName: "Teacher One",
      major: "TKJ",
      gradeLevel: 10,
      school: "SMK A",
      className: "X-A",
      hp: 100,
      xp: 120,
      ap: 200,
      level: 3,
      status: "active",
      createdAt: now,
    },
    {
      id: "s2",
      fullName: "Bob",
      teacherId: "t1",
      teacherName: "Teacher One",
      major: "RPL",
      gradeLevel: 10,
      school: "SMK A",
      className: "X-A",
      hp: 50,
      xp: 80,
      ap: 10,
      level: 2,
      status: "active",
      createdAt: now,
    },
  ]);
  await db.insert(schema.shopItems).values({
    id: "i1",
    name: "Healing Potion",
    description: "Restore HP",
    icon: "🧪",
    apCost: 50,
    stock: -1,
    createdAt: now,
  });
});

afterAll(() => {
  sqlite.close();
});

describe("mathflix-billing endpoints", () => {
  test("GET /", async () => {
    const res = await app.request("http://local/");
    expect(res.status).toBe(200);
  });

  test("GET /billing/summary", async () => {
    const res = await app.request("http://local/billing/summary?teacher_id=t1");
    expect(res.status).toBe(200);
  });

  test("GET /billing/students", async () => {
    const res = await app.request("http://local/billing/students?teacher_id=t1");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /students", async () => {
    const res = await app.request("http://local/students?teacher_id=t1&search=ali&page=1&limit=10");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("DELETE /students/:id", async () => {
    await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s2", item_id: "i1" }),
    });
    const res = await app.request("http://local/students/s2", { method: "DELETE" });
    expect(res.status).toBe(200);
    const studentCheck = await app.request("http://local/students?teacher_id=t1");
    const studentBody = await studentCheck.json();
    expect(studentBody.data.some((row: any) => row.id === "s2")).toBe(false);
  });

  test("GET /billing/leaderboard", async () => {
    const res = await app.request("http://local/billing/leaderboard?teacher_id=t1");
    expect(res.status).toBe(200);
  });

  test("GET /billing/shop/items", async () => {
    const res = await app.request("http://local/billing/shop/items");
    expect(res.status).toBe(200);
  });

  test("POST /billing/shop/buy", async () => {
    const bad = await app.request("http://local/billing/shop/buy", { method: "POST", body: "{}" });
    expect(bad.status).toBe(400);
    const ok = await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", item_id: "i1" }),
    });
    expect(ok.status).toBe(200);

    const missingStudent = await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s404", item_id: "i1" }),
    });
    expect(missingStudent.status).toBe(404);

    const missingItem = await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", item_id: "i404" }),
    });
    expect(missingItem.status).toBe(404);

    const lowAp = await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s2", item_id: "i1" }),
    });
    expect(lowAp.status).toBe(400);
  });

  test("GET /billing/shop/inventory", async () => {
    const bad = await app.request("http://local/billing/shop/inventory");
    expect(bad.status).toBe(400);
    await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", item_id: "i1" }),
    });
    const ok = await app.request("http://local/billing/shop/inventory?student_id=s1");
    expect(ok.status).toBe(200);
  });

  test("POST /billing/shop/use", async () => {
    const badReq = await app.request("http://local/billing/shop/use", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(badReq.status).toBe(400);

    const notFound = await app.request("http://local/billing/shop/use", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", inventory_id: "missing" }),
    });
    expect(notFound.status).toBe(404);

    const buy = await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", item_id: "i1" }),
    });
    expect(buy.status).toBe(200);
    const inv = await app.request("http://local/billing/shop/inventory?student_id=s1");
    const invBody = await inv.json();
    const useRes = await app.request("http://local/billing/shop/use", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", inventory_id: invBody[0].id }),
    });
    expect(useRes.status).toBe(200);

    const alreadyUsed = await app.request("http://local/billing/shop/use", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", inventory_id: invBody[0].id }),
    });
    expect(alreadyUsed.status).toBe(400);

    const buyS1 = await app.request("http://local/billing/shop/buy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s1", item_id: "i1" }),
    });
    expect(buyS1.status).toBe(200);
    const invS1 = await app.request("http://local/billing/shop/inventory?student_id=s1");
    const invS1Body = await invS1.json();
    const unauthorizedUse = await app.request("http://local/billing/shop/use", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: "s2", inventory_id: invS1Body[1].id }),
    });
    expect(unauthorizedUse.status).toBe(403);
  });

  test("PUT /billing/students/:studentId/gamification", async () => {
    const res = await app.request("http://local/billing/students/s1/gamification", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hp: 40, ap: 25 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("debuff");

    const capRes = await app.request("http://local/billing/students/s1/gamification", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hp: 120, ap: -50 }),
    });
    const capBody = await capRes.json();
    expect(capBody.hp).toBe(100);
    expect(capBody.ap).toBe(0);
    expect(capBody.status).toBe("active");
  });

  test("GET /billing/access", async () => {
    const bad = await app.request("http://local/billing/access");
    expect(bad.status).toBe(400);
    const ok = await app.request("http://local/billing/access?student_id=s1");
    expect(ok.status).toBe(200);
    const missing = await app.request("http://local/billing/access?student_id=s404");
    expect(missing.status).toBe(404);
  });

  test("GET /billing/teachers/exemptions", async () => {
    const res = await app.request("http://local/billing/teachers/exemptions");
    expect(res.status).toBe(200);
  });

  test("GET /billing/teachers/policies", async () => {
    const res = await app.request("http://local/billing/teachers/policies");
    expect(res.status).toBe(200);
  });

  test("GET /billing/payments", async () => {
    const res = await app.request("http://local/billing/payments?teacher_id=t1");
    expect(res.status).toBe(200);
  });

  test("GET /billing/teachers/:teacherId/payments", async () => {
    const res = await app.request("http://local/billing/teachers/t1/payments");
    expect(res.status).toBe(200);
  });

  test("POST & DELETE teacher exemption", async () => {
    const add = await app.request("http://local/billing/teachers/t1/exempt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "promo", teacher_name: "Teacher One" }),
    });
    expect(add.status).toBe(200);
    const del = await app.request("http://local/billing/teachers/t1/exempt", { method: "DELETE" });
    expect(del.status).toBe(200);
  });

  test("POST & DELETE teacher policy", async () => {
    const add = await app.request("http://local/billing/teachers/t1/policy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grace_days: 5, teacher_name: "Teacher One" }),
    });
    expect(add.status).toBe(200);
    const del = await app.request("http://local/billing/teachers/t1/policy", { method: "DELETE" });
    expect(del.status).toBe(200);

    const bad = await app.request("http://local/billing/teachers/t1/policy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grace_days: "abc" }),
    });
    expect(bad.status).toBe(400);
  });

  test("POST /billing/teachers/:teacherId/confirm-payment", async () => {
    const res = await app.request("http://local/billing/teachers/t1/confirm-payment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ period_days: 30 }),
    });
    expect(res.status).toBe(200);

    const badPeriod = await app.request("http://local/billing/teachers/t1/confirm-payment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ period_days: 0 }),
    });
    expect(badPeriod.status).toBe(400);
  });

  test("GET & POST /billing/settings", async () => {
    const set = await app.request("http://local/billing/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payment_url: "https://example.com/pay" }),
    });
    expect(set.status).toBe(200);
    const get = await app.request("http://local/billing/settings");
    expect(get.status).toBe(200);
  });

  test("POST /billing/students/sync", async () => {
    const res = await app.request("http://local/billing/students/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "s3",
        full_name: "Charlie",
        teacher_id: "t2",
      }),
    });
    expect(res.status).toBe(200);

    const batch = await app.request("http://local/billing/students/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        { id: "s4", full_name: "Dina", teacher_id: "t2" },
        { id: "", full_name: "Invalid" },
      ]),
    });
    expect(batch.status).toBe(200);
    const batchBody = await batch.json();
    expect(batchBody.upserted).toBe(1);
  });

  test("POST /billing/pay", async () => {
    const res = await app.request("http://local/billing/pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teacher_id: "t1", student_ids: ["s1"] }),
    });
    expect(res.status).toBe(200);

    const missingTeacher = await app.request("http://local/billing/pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_ids: ["s1"] }),
    });
    expect(missingTeacher.status).toBe(400);

    const noPayable = await app.request("http://local/billing/pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teacher_id: "t404", student_ids: [] }),
    });
    expect(noPayable.status).toBe(400);
  });

  test("OAuth and fallback routes", async () => {
    const oauth = await app.request("http://local/auth/google");
    expect(oauth.status).toBe(302);
    const callbackBad = await app.request("http://local/auth/google/callback");
    expect(callbackBad.status).toBe(400);
    expect((await app.request("http://local/materials")).status).toBe(200);
    expect((await app.request("http://local/quizzes")).status).toBe(200);
    expect((await app.request("http://local/unknown")).status).toBe(200);
  });

  test("OAuth callback handles Google error response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string) => {
      if (url.includes("oauth2.googleapis.com/token")) {
        return new Response(
          JSON.stringify({ error: "invalid_grant", error_description: "Bad code" }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({}), { status: 200 });
    }) as any;

    const res = await app.request("http://local/auth/google/callback?code=bad");
    expect(res.status).toBe(400);

    globalThis.fetch = originalFetch;
  });
});
