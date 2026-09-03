import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cors from "cors";
import request from "supertest";
import { createCorsOptions } from "../src/config/corsConfig.js";

const newOrigin = "https://anistream.fajarrafsan.my.id";

function createApp(origins = "") {
    const app = express();
    app.use(cors(createCorsOptions(origins)));
    app.get("/api/anime/home", (req, res) => res.json({ success: true }));
    return app;
}

test("default origins support the new domain, localhost, and the existing frontend", async () => {
    for (const origin of [newOrigin, "http://localhost:5173", "https://anistreasm-fe-nine.vercel.app"]) {
        const res = await request(createApp()).get("/api/anime/home").set("Origin", origin);
        assert.equal(res.status, 200);
        assert.equal(res.headers["access-control-allow-origin"], origin);
        assert.equal(res.headers["access-control-allow-credentials"], "true");
        assert.match(res.headers.vary, /Origin/);
    }
});

test("configured root URLs tolerate whitespace and trailing slashes", async () => {
    const app = createApp(` , ${newOrigin}/ , http://localhost:5173/ , `);
    const res = await request(app).get("/api/anime/home").set("Origin", newOrigin);
    assert.equal(res.headers["access-control-allow-origin"], newOrigin);
    assert.equal(res.headers["access-control-allow-credentials"], "true");
});

test("credentialed preflight responds before reaching API routes", async () => {
    const res = await request(createApp(`${newOrigin}/`))
        .options("/api/anime/home")
        .set("Origin", newOrigin)
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "content-type,authorization");
    assert.equal(res.status, 204);
    assert.equal(res.headers["access-control-allow-origin"], newOrigin);
    assert.equal(res.headers["access-control-allow-credentials"], "true");
    assert.match(res.headers["access-control-allow-methods"], /POST/);
    assert.equal(res.headers["access-control-allow-headers"], "content-type,authorization");
});

test("unlisted and lookalike origins receive no CORS permission", async () => {
    for (const origin of ["https://untrusted.example", `${newOrigin}.attacker.example`, "https://anistream-fe-preview.vercel.app.attacker.example", "null"]) {
        const res = await request(createApp()).get("/api/anime/home").set("Origin", origin);
        assert.equal(res.status, 200);
        assert.equal(res.headers["access-control-allow-origin"], undefined);
        assert.equal(res.headers["access-control-allow-credentials"], undefined);
    }
});

test("explicit CORS_ORIGIN replaces defaults and existing preview support remains", async () => {
    const app = createApp("https://custom.example");
    const denied = await request(app).get("/api/anime/home").set("Origin", newOrigin);
    assert.equal(denied.headers["access-control-allow-origin"], undefined);
    for (const origin of ["https://custom.example", "https://anistream-fe-preview.vercel.app"]) {
        const res = await request(app).get("/api/anime/home").set("Origin", origin);
        assert.equal(res.headers["access-control-allow-origin"], origin);
    }
});

test("requests without an Origin header still work", async () => {
    const res = await request(createApp()).get("/api/anime/home");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { success: true });
});
