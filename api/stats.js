const { timingSafeEqual } = require("crypto");
const { supabase, todayISO } = require("./_supabase");

const STATS_TOKEN = process.env.STATS_TOKEN || "";
const PAGE_SIZE = 1000; // Supabase caps each response at 1000 rows by default.

function isAuthorized(token) {
    if (!STATS_TOKEN || typeof token !== "string") return false;
    const a = Buffer.from(token);
    const b = Buffer.from(STATS_TOKEN);
    return a.length === b.length && timingSafeEqual(a, b);
}

async function fetchAllVisits() {
    const visits = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const res = await supabase(
            `/visit_events?select=date,country&order=id&limit=${PAGE_SIZE}&offset=${offset}`
        );
        const rows = await res.json();
        visits.push(...rows);
        if (rows.length < PAGE_SIZE) return visits;
    }
}

function countBy(items, key) {
    const counts = new Map();
    for (const item of items) {
        const k = item[key] ?? "unknown";
        counts.set(k, (counts.get(k) || 0) + 1);
    }
    return counts;
}

module.exports = async function handler(req, res) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : req.query.token;

    if (!isAuthorized(token)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const visits = await fetchAllVisits();
        const byDay = countBy(visits, "date");

        const perDay = [...byDay]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        const perCountry = [...countBy(visits, "country")]
            .sort(([, a], [, b]) => b - a)
            .map(([country, count]) => ({ country, count }));

        return res.status(200).json({
            today: byDay.get(todayISO()) || 0,
            total: visits.length,
            perDay,
            perCountry
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Could not load stats" });
    }
};
