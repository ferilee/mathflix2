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
});
