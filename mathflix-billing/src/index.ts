import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db";
import {
  students,
  studentBilling,
  billingPayments,
  teacherExemptions,
  teacherPolicies,
  appSettings,
  shopItems,
  studentInventory,
} from "./schema";
import { asc, eq, inArray } from "drizzle-orm";
import crypto from "node:crypto";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

const FREE_CLASS_QUOTA = Number(process.env.FREE_CLASS_QUOTA || 1);
const STUDENTS_PER_CLASS = Number(process.env.STUDENTS_PER_CLASS || 30);
const PRICE_PER_CLASS = Number(process.env.PRICE_PER_CLASS || 49000);
const GRACE_DAYS = Number(process.env.GRACE_DAYS || 7);
const BILLING_PERIOD_DAYS = Number(process.env.BILLING_PERIOD_DAYS || 30);

const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIso = (value?: Date | null) => (value ? value.toISOString() : null);

const withDays = (start: Date, days: number) => {
  const copy = new Date(start.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
};

const normalizeName = (name?: string | null) => {
  return (name || "").trim().toLowerCase();
};

const getStudentsForTeacher = async (teacherId?: string | null) => {
  if (!teacherId) {
    return db.select().from(students).orderBy(asc(students.createdAt));
  }
  return db
    .select()
    .from(students)
    .where(eq(students.teacherId, teacherId))
    .orderBy(asc(students.createdAt));
};

const fetchTeacherExemptions = async () => {
  return db.select().from(teacherExemptions);
};

const fetchTeacherPolicies = async () => {
  return db.select().from(teacherPolicies);
};

const normalizeStudentPayload = (input: any) => {
  const createdAt = input?.created_at || input?.createdAt || null;
  return {
    id: String(input?.id || ""),
    nisn: input?.nisn || null,
    fullName: input?.full_name || input?.fullName || "",
    major: input?.major || null,
    gradeLevel: input?.grade_level || input?.gradeLevel || null,
    school: input?.school || null,
    teacherId: input?.teacher_id || input?.teacherId || null,
    teacherName:
      (input?.teacher_name || input?.teacherName || null)?.trim() || null,
    className: input?.class_name || input?.className || null,
    hp: input?.hp ?? 100,
    xp: input?.xp ?? 0,
    ap: input?.ap ?? 0,
    level: input?.level ?? 1,
    status: input?.status ?? "active",
    createdAt: createdAt || new Date().toISOString(),
  };
};

const getBillingMap = async (studentIds: string[]) => {
  if (studentIds.length === 0) return new Map<string, any>();
  const rows = await db
    .select()
    .from(studentBilling)
    .where(inArray(studentBilling.studentId, studentIds));
  return new Map(rows.map((row) => [row.studentId, row]));
};

const resolveStudentStatus = (params: {
  index: number;
  student: any;
  billing?: any | null;
  now: Date;
  graceDays: number;
}) => {
  const { index, student, billing, now, graceDays } = params;

  const freeStudentQuota = FREE_CLASS_QUOTA * STUDENTS_PER_CLASS;
  if (index < freeStudentQuota) {
    return {
      status: "free",
      graceUntil: null,
      paidUntil: null,
    };
  }

  const paidUntil = toDate(billing?.paidUntil || null);
  if (paidUntil && paidUntil >= now) {
    return {
      status: "paid",
      graceUntil: null,
      paidUntil,
    };
  }

  const graceUntilStored = toDate(billing?.graceUntil || null);
  if (graceUntilStored && graceUntilStored >= now) {
    return {
      status: "grace",
      graceUntil: graceUntilStored,
      paidUntil: paidUntil || null,
    };
  }

  const createdAt = toDate(student.createdAt) || now;
  const graceUntilDefault = withDays(createdAt, graceDays);
  if (graceUntilDefault >= now) {
    return {
      status: "grace",
      graceUntil: graceUntilDefault,
      paidUntil: paidUntil || null,
    };
  }

  return {
    status: "blocked",
    graceUntil: graceUntilStored || graceUntilDefault || null,
    paidUntil: paidUntil || null,
  };
};

const buildStatusList = async (teacherId?: string | null) => {
  const now = new Date();
  const [exemptions, policies, studentRows] = await Promise.all([
    fetchTeacherExemptions(),
    fetchTeacherPolicies(),
    getStudentsForTeacher(teacherId),
  ]);
  const matchingExemptions = exemptions.filter((row) => {
    if (teacherId && row.teacherId === teacherId) return true;
    const rowName = normalizeName(row.teacherName);
    return (
      rowName &&
      studentRows.some((s) => normalizeName(s.teacherName) === rowName)
    );
  });
  const exemptionCutoff =
    matchingExemptions
      .map((row) => toDate(row.createdAt))
      .filter((value): value is Date => !!value)
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;
  const studentName = normalizeName(studentRows[0]?.teacherName);
  const policyById =
    !!teacherId && policies.find((row) => row.teacherId === teacherId);
  const policyByName =
    !!studentName &&
    policies.find((row) => normalizeName(row.teacherName) === studentName);
  const graceDays =
    policyById?.graceDays ?? policyByName?.graceDays ?? GRACE_DAYS;
  const ids = studentRows.map((row) => row.id);
  const billingMap = await getBillingMap(ids);

  const statuses = studentRows.map((student, index) => {
    const studentCreatedAt = toDate(student.createdAt || null);
    const exempt =
      !!exemptionCutoff &&
      !!studentCreatedAt &&
      studentCreatedAt.getTime() <= exemptionCutoff.getTime();
    if (exempt) {
      return {
        student_id: student.id,
        status: "free",
        grace_until: null,
        paid_until: null,
      };
    }
    const billing = billingMap.get(student.id);
    const resolved = resolveStudentStatus({
      index,
      student,
      billing,
      now,
      graceDays,
    });
    return {
      student_id: student.id,
      status: resolved.status,
      grace_until: toIso(resolved.graceUntil),
      paid_until: toIso(resolved.paidUntil),
    };
  });

  return { statuses, total: studentRows.length, graceDays };
};

app.get("/", (c) => {
  return c.json({ status: "ok", service: "mathflix-billing" });
});

app.get("/billing/summary", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const { statuses, total, graceDays } = await buildStatusList(teacherId);
  const exempt = total > 0 && statuses.every((item) => item.status === "free");

  const paidStudents = statuses.filter((item) => item.status === "paid").length;
  const graceStudents = statuses.filter(
    (item) => item.status === "grace",
  ).length;
  const blockedStudents = statuses.filter(
    (item) => item.status === "blocked",
  ).length;

  const dueCount = graceStudents + blockedStudents;
  const dueClassCount = Math.ceil(dueCount / STUDENTS_PER_CLASS);

  return c.json({
    total_students: total,
    free_quota: exempt ? total : FREE_CLASS_QUOTA * STUDENTS_PER_CLASS,
    free_classes: exempt
      ? Math.ceil(total / STUDENTS_PER_CLASS)
      : FREE_CLASS_QUOTA,
    paid_students: paidStudents,
    price_per_class: PRICE_PER_CLASS,
    students_per_class: STUDENTS_PER_CLASS,
    amount_due: exempt ? 0 : dueClassCount * PRICE_PER_CLASS,
    grace_days: graceDays,
    overdue_students: exempt ? 0 : blockedStudents,
    grace_students: exempt ? 0 : graceStudents,
    is_exempt: exempt,
  });
});

app.get("/billing/students", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const { statuses } = await buildStatusList(teacherId);
  return c.json(statuses);
});

app.get("/students", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const teacherName = c.req.query("teacher_name");
  const search = c.req.query("search")?.toLowerCase();
  const major = c.req.query("major")?.toLowerCase();
  const school = c.req.query("school")?.toLowerCase();
  const grade = c.req.query("grade");
  const page = Number(c.req.query("page") || 1);
  const limit = Number(c.req.query("limit") || 10);
  
  let baseQuery = db.select().from(students);
  let rows = await baseQuery;

  // Manual filtering (for simplicity)
  if (teacherId) rows = rows.filter(r => r.teacherId === teacherId);
  if (teacherName) rows = rows.filter(r => r.teacherName?.toLowerCase().includes(teacherName.toLowerCase()));
  if (search) rows = rows.filter(r => r.fullName?.toLowerCase().includes(search) || r.nisn?.includes(search) || r.id?.toLowerCase().includes(search));
  if (major) rows = rows.filter(r => r.major?.toLowerCase().includes(major));
  if (school) rows = rows.filter(r => r.school?.toLowerCase().includes(school));
  if (grade) rows = rows.filter(r => r.gradeLevel === Number(grade));

  const total = rows.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedRows = rows.slice(offset, offset + limit);

  // Map to snake_case for frontend compatibility
  const mappedData = paginatedRows.map(r => ({
    id: r.id,
    nisn: r.nisn,
    full_name: r.fullName,
    major: r.major,
    grade_level: r.gradeLevel,
    class_name: r.className,
    school: r.school,
    teacher_id: r.teacherId,
    teacher_name: r.teacherName,
    hp: r.hp,
    xp: r.xp,
    ap: r.ap,
    level: r.level,
    status: r.status,
    created_at: r.createdAt
  }));

  return c.json({
    data: mappedData,
    total,
    page,
    limit,
    totalPages
  });
});

app.delete("/students/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(students).where(eq(students.id, id));
  await db.delete(studentBilling).where(eq(studentBilling.studentId, id));
  await db.delete(studentInventory).where(eq(studentInventory.studentId, id));
  return c.json({ status: "ok", deleted: id });
});

app.get("/billing/leaderboard", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const studentRows = await getStudentsForTeacher(teacherId);
  
  // Create Leaderboard array
  const leaderboard = studentRows.map(s => ({
    id: s.id,
    student_name: s.fullName,
    full_name: s.fullName,
    grade_level: s.gradeLevel,
    class_name: s.className,
    major: s.major,
    hp: s.hp,
    xp: s.xp,
    ap: s.ap,
    level: s.level,
    status: s.status,
    total_score: s.xp, // Primary score is XP
  })).sort((a, b) => b.total_score - a.total_score);

  return c.json(leaderboard);
});

// ---- SHOP / MERCHANT ROUTES ----
app.get("/billing/shop/items", async (c) => {
  const items = await db.select().from(shopItems);
  return c.json(items);
});

app.post("/billing/shop/buy", async (c) => {
  const body = await c.req.json();
  const studentId = body?.student_id;
  const itemId = body?.item_id;

  if (!studentId || !itemId) {
    return c.json({ error: "student_id and item_id required" }, 400);
  }

  // Check student
  const studentRows = await db.select().from(students).where(eq(students.id, studentId));
  if (studentRows.length === 0) return c.json({ error: "Student not found" }, 404);
  const student = studentRows[0];

  // Check item
  const itemRows = await db.select().from(shopItems).where(eq(shopItems.id, itemId));
  if (itemRows.length === 0) return c.json({ error: "Item not found" }, 404);
  const item = itemRows[0];

  if ((student.ap || 0) < item.apCost) {
    return c.json({ error: "Not enough AP to buy this item." }, 400);
  }

  // Deduct AP
  await db.update(students)
    .set({ ap: (student.ap || 0) - item.apCost })
    .where(eq(students.id, studentId));

  // Add to inventory
  const inventoryId = crypto.randomUUID();
  await db.insert(studentInventory).values({
    id: inventoryId,
    studentId,
    itemId,
    isUsed: 0,
    purchasedAt: new Date().toISOString(),
  });

  return c.json({ status: "ok", message: "Item purchased successfully!", remaining_ap: (student.ap || 0) - item.apCost });
});

app.get("/billing/shop/inventory", async (c) => {
  const studentId = c.req.query("student_id");
  if (!studentId) return c.json({ error: "student_id required" }, 400);

  // Join inventory with items
  const inventory = await db.select({
    id: studentInventory.id,
    item_id: shopItems.id,
    name: shopItems.name,
    description: shopItems.description,
    icon: shopItems.icon,
    is_used: studentInventory.isUsed,
    purchased_at: studentInventory.purchasedAt,
    used_at: studentInventory.usedAt,
  })
  .from(studentInventory)
  .leftJoin(shopItems, eq(studentInventory.itemId, shopItems.id))
  .where(eq(studentInventory.studentId, studentId));

  return c.json(inventory);
});

app.post("/billing/shop/use", async (c) => {
  const body = await c.req.json();
  const inventoryId = body?.inventory_id;
  const studentId = body?.student_id;

  if (!inventoryId || !studentId) {
    return c.json({ error: "inventory_id and student_id required" }, 400);
  }

  const invRows = await db.select().from(studentInventory).where(eq(studentInventory.id, inventoryId));
  if (invRows.length === 0) return c.json({ error: "Inventory item not found" }, 404);
  const inv = invRows[0];

  if (inv.studentId !== studentId) return c.json({ error: "Unauthorized" }, 403);
  if (inv.isUsed) return c.json({ error: "Item already used" }, 400);

  // If item is 'Potion of Revival', restore HP
  const itemRows = await db.select().from(shopItems).where(eq(shopItems.id, inv.itemId));
  if (itemRows.length > 0) {
    const item = itemRows[0];
    if (item.name.toLowerCase().includes("potion") || item.name.toLowerCase().includes("healing")) {
      await db.update(students).set({ hp: 100, status: 'active' }).where(eq(students.id, studentId));
    }
  }

  await db.update(studentInventory)
    .set({ isUsed: 1, usedAt: new Date().toISOString() })
    .where(eq(studentInventory.id, inventoryId));

  return c.json({ status: "ok", message: "Item used successfully!" });
});

app.put("/billing/students/:studentId/gamification", async (c) => {
  const studentId = c.req.param("studentId");
  const body = await c.req.json();
  const hp = body?.hp !== undefined ? Number(body.hp) : undefined;
  const ap = body?.ap !== undefined ? Number(body.ap) : undefined;

  const updateData: any = {};
  if (hp !== undefined) updateData.hp = Math.max(0, Math.min(100, hp)); // Cap HP at 100
  if (ap !== undefined) updateData.ap = Math.max(0, ap);

  if (hp !== undefined && updateData.hp < 60) {
    updateData.status = 'debuff';
  } else if (hp !== undefined && updateData.hp >= 60) {
    updateData.status = 'active';
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(students).set(updateData).where(eq(students.id, studentId));
  }

  const updatedRows = await db.select().from(students).where(eq(students.id, studentId));
  return c.json(updatedRows[0] || {});
});

app.get("/billing/access", async (c) => {
  const studentId = c.req.query("student_id");
  if (!studentId) {
    return c.json({ error: "student_id required" }, 400);
  }

  const studentRows = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId));
  const student = studentRows[0];
  if (!student) {
    return c.json({ error: "student not found" }, 404);
  }

  const { statuses } = await buildStatusList(student.teacherId || null);
  const match = statuses.find((item) => item.student_id === studentId);
  if (!match) {
    return c.json({ error: "status not found" }, 404);
  }

  return c.json({
    student_id: studentId,
    status: match.status,
    grace_until: match.grace_until,
    paid_until: match.paid_until,
  });
});

app.get("/billing/teachers/exemptions", async (c) => {
  const rows = await fetchTeacherExemptions();
  return c.json(rows);
});

app.get("/billing/teachers/policies", async (c) => {
  const rows = await fetchTeacherPolicies();
  return c.json(rows);
});

app.get("/billing/payments", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const limit = Number(c.req.query("limit") || 50);
  const baseQuery = db.select().from(billingPayments);
  const rows = teacherId
    ? await baseQuery
        .where(eq(billingPayments.teacherId, teacherId))
        .orderBy(billingPayments.createdAt)
        .limit(limit)
    : await baseQuery.orderBy(billingPayments.createdAt).limit(limit);
  return c.json(rows);
});

app.get("/billing/teachers/:teacherId/payments", async (c) => {
  const teacherId = c.req.param("teacherId");
  const limit = Number(c.req.query("limit") || 50);
  const rows = await db
    .select()
    .from(billingPayments)
    .where(eq(billingPayments.teacherId, teacherId))
    .orderBy(billingPayments.createdAt)
    .limit(limit);
  return c.json(rows);
});

app.post("/billing/teachers/:teacherId/exempt", async (c) => {
  const teacherId = c.req.param("teacherId");
  const body = await c.req.json();
  const reason = body?.reason || null;
  const teacherName = body?.teacher_name || body?.teacherName || null;
  if (!teacherId) return c.json({ error: "teacherId required" }, 400);
  await db
    .insert(teacherExemptions)
    .values({
      teacherId,
      teacherName,
      reason,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: teacherExemptions.teacherId,
      set: {
        teacherName,
        reason,
        createdAt: new Date().toISOString(),
      },
    });
  return c.json({ status: "ok" });
});

app.post("/billing/teachers/:teacherId/policy", async (c) => {
  const teacherId = c.req.param("teacherId");
  const body = await c.req.json();
  const graceDays = Number(body?.grace_days ?? body?.graceDays ?? GRACE_DAYS);
  const teacherName = body?.teacher_name || body?.teacherName || null;
  if (!teacherId || Number.isNaN(graceDays)) {
    return c.json({ error: "teacherId and grace_days required" }, 400);
  }
  await db
    .insert(teacherPolicies)
    .values({
      teacherId,
      teacherName,
      graceDays,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: teacherPolicies.teacherId,
      set: {
        teacherName,
        graceDays,
        createdAt: new Date().toISOString(),
      },
    });
  return c.json({ status: "ok" });
});

app.delete("/billing/teachers/:teacherId/policy", async (c) => {
  const teacherId = c.req.param("teacherId");
  if (!teacherId) return c.json({ error: "teacherId required" }, 400);
  await db
    .delete(teacherPolicies)
    .where(eq(teacherPolicies.teacherId, teacherId));
  return c.json({ status: "ok" });
});

app.post("/billing/teachers/:teacherId/confirm-payment", async (c) => {
  const teacherId = c.req.param("teacherId");
  if (!teacherId) return c.json({ error: "teacherId required" }, 400);
  const body = await c.req.json();
  const periodDays = Number(body?.period_days ?? BILLING_PERIOD_DAYS);
  if (Number.isNaN(periodDays) || periodDays <= 0) {
    return c.json({ error: "period_days must be > 0" }, 400);
  }

  const allStudents = await getStudentsForTeacher(teacherId);
  const ordered = allStudents.map((row) => row.id);
  const freeStudentQuota = FREE_CLASS_QUOTA * STUDENTS_PER_CLASS;
  const payableIds = ordered.slice(freeStudentQuota);
  const targetIds =
    Array.isArray(body?.student_ids) && body.student_ids.length > 0
      ? body.student_ids
      : payableIds;

  if (targetIds.length === 0) {
    return c.json({
      status: "ok",
      paid_students: 0,
      message: "no payable students found",
    });
  }

  const now = new Date();
  const paidUntil = withDays(now, periodDays);
  const classCount = Math.ceil(targetIds.length / STUDENTS_PER_CLASS);

  for (const id of targetIds) {
    await db
      .insert(studentBilling)
      .values({
        studentId: id,
        paidUntil: paidUntil.toISOString(),
        graceUntil: null,
        updatedAt: now.toISOString(),
      })
      .onConflictDoUpdate({
        target: studentBilling.studentId,
        set: {
          paidUntil: paidUntil.toISOString(),
          graceUntil: null,
          updatedAt: now.toISOString(),
        },
      });
  }

  await db.insert(billingPayments).values({
    id: crypto.randomUUID(),
    teacherId,
    amount: classCount * PRICE_PER_CLASS,
    studentCount: targetIds.length,
    studentIds: JSON.stringify(targetIds),
    paidUntil: paidUntil.toISOString(),
    createdAt: now.toISOString(),
  });

  return c.json({
    status: "ok",
    paid_students: targetIds.length,
    paid_until: paidUntil.toISOString(),
  });
});

app.delete("/billing/teachers/:teacherId/exempt", async (c) => {
  const teacherId = c.req.param("teacherId");
  if (!teacherId) return c.json({ error: "teacherId required" }, 400);
  await db
    .delete(teacherExemptions)
    .where(eq(teacherExemptions.teacherId, teacherId));
  return c.json({ status: "ok" });
});

app.get("/billing/settings", async (c) => {
  const rows = await db.select().from(appSettings);
  const map: Record<string, string> = {};
  rows.forEach((row) => {
    if (row.key) map[row.key] = row.value || "";
  });
  return c.json(map);
});

app.post("/billing/settings", async (c) => {
  const body = await c.req.json();
  const paymentUrl = body?.payment_url ?? body?.paymentUrl ?? "";
  await db
    .insert(appSettings)
    .values({
      key: "payment_url",
      value: paymentUrl,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value: paymentUrl,
        updatedAt: new Date().toISOString(),
      },
    });
  return c.json({ status: "ok", payment_url: paymentUrl });
});

app.post("/billing/students/sync", async (c) => {
  const payload = await c.req.json();
  const rows = Array.isArray(payload) ? payload : [payload];
  const now = new Date().toISOString();
  let upserted = 0;

  for (const row of rows) {
    const normalized = normalizeStudentPayload(row);
    if (!normalized.id || !normalized.fullName) continue;
    await db
      .insert(students)
      .values({
        ...normalized,
        createdAt: normalized.createdAt || now,
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          nisn: normalized.nisn,
          fullName: normalized.fullName,
          major: normalized.major,
          gradeLevel: normalized.gradeLevel,
          school: normalized.school,
          teacherId: normalized.teacherId,
          teacherName: normalized.teacherName,
          hp: normalized.hp,
          xp: normalized.xp,
          ap: normalized.ap,
          level: normalized.level,
          status: normalized.status,
          createdAt: normalized.createdAt || now,
        },
      });
    upserted += 1;
  }

  return c.json({ status: "ok", upserted });
});

app.post("/billing/pay", async (c) => {
  const payload = await c.req.json();
  const teacherId = payload?.teacher_id as string | undefined;
  const amount = Number(payload?.amount || 0);
  const studentCount = Number(payload?.student_count || 0);
  const studentIds = Array.isArray(payload?.student_ids)
    ? payload.student_ids
    : null;

  if (!teacherId) {
    return c.json({ error: "teacher_id required" }, 400);
  }

  const allStudents = await getStudentsForTeacher(teacherId);
  const ordered = allStudents.map((row) => row.id);
  const freeStudentQuota = FREE_CLASS_QUOTA * STUDENTS_PER_CLASS;
  const defaultPayIds = ordered.slice(freeStudentQuota);
  const targetIds =
    studentIds && studentIds.length > 0 ? studentIds : defaultPayIds;

  if (targetIds.length === 0) {
    return c.json({ error: "no payable students found" }, 400);
  }

  const classCount = Math.ceil(targetIds.length / STUDENTS_PER_CLASS);
  const resolvedAmount =
    amount && amount > 0 ? amount : classCount * PRICE_PER_CLASS;

  const now = new Date();
  const paidUntil = withDays(now, BILLING_PERIOD_DAYS);

  for (const id of targetIds) {
    await db
      .insert(studentBilling)
      .values({
        studentId: id,
        paidUntil: paidUntil.toISOString(),
        graceUntil: null,
        updatedAt: now.toISOString(),
      })
      .onConflictDoUpdate({
        target: studentBilling.studentId,
        set: {
          paidUntil: paidUntil.toISOString(),
          graceUntil: null,
          updatedAt: now.toISOString(),
        },
      });
  }

  await db.insert(billingPayments).values({
    id: crypto.randomUUID(),
    teacherId,
    amount: resolvedAmount,
    studentCount: studentCount || targetIds.length,
    studentIds: JSON.stringify(targetIds),
    paidUntil: paidUntil.toISOString(),
    createdAt: now.toISOString(),
  });

  return c.json({
    status: "ok",
    paid_students: targetIds.length,
    paid_until: paidUntil.toISOString(),
  });
});

// ---- OAUTH ROUTES ----
app.get('/auth/google', (c) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
    if (!clientId) {
      console.error('[OAUTH] GOOGLE_CLIENT_ID is missing.');
      return c.text('Error: GOOGLE_CLIENT_ID is not configured.', 500);
    }
    console.log('[OAUTH] Initiating Google Auth with ClientID prefix:', `${clientId.slice(0, 10)}...`);

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    return c.redirect(url);
  } catch (err) {
    console.error('[OAUTH] Error in /auth/google:', err);
    return c.text('Internal Server Error: ' + (err instanceof Error ? err.message : String(err)), 500);
  }
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9111';

  if (!code) return c.text('No code provided', 400);

  try {
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

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const email = userData.email as string;

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

    const mathflixToken = "temporary_dummy_token";
    const userDataString = JSON.stringify({
      id: email,
      email: email,
      role: role,
      full_name: userData.name,
      photo_profile: userData.picture
    });

    return c.redirect(`${frontendUrl}/oauth/callback?token=${mathflixToken}&user=${encodeURIComponent(userDataString)}`);
  } catch (error) {
    console.error('[OAUTH] Fatal Error in /auth/google/callback:', error);
    return c.text('Internal Server Error during OAuth process: ' + (error instanceof Error ? error.message : String(error)), 500);
  }
});

// Mock Routes untuk mengatasi 404 pada Frontend
app.get('/billing/access', (c) => c.json({ access: true, status: 'active' }));
app.get('/materials', (c) => c.json([]));
app.get('/quizzes', (c) => c.json([]));

app.all('*', (c) => {
  return c.json([]);
});

if (import.meta.main) {
  const port = Number(process.env.PORT || 3000);
  console.log(`[mathflix-billing] listening on http://localhost:${port}`);
  Bun.serve({
    port,
    fetch: app.fetch,
  });
}

export default app;
