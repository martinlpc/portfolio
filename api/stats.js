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

async function fetchAllDates() {
    const dates = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const res = await supabase(
            `/visit_events?select=date&order=id&limit=${PAGE_SIZE}&offset=${offset}`
        );
        const rows = await res.json();
        for (const row of rows) dates.push(row.date);
        if (rows.length < PAGE_SIZE) return dates;
    }
}

module.exports = async function handler(req, res) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : req.query.token;

    if (!isAuthorized(token)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const dates = await fetchAllDates();

        const counts = new Map();
        for (const date of dates) counts.set(date, (counts.get(date) || 0) + 1);

        const perDay = [...counts]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        return res.status(200).json({
            today: counts.get(todayISO()) || 0,
            total: dates.length,
            perDay
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Could not load stats" });
    }
};
