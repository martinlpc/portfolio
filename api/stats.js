const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const STATS_TOKEN = process.env.STATS_TOKEN || "";
const VISIT_TZ = process.env.VISIT_TZ || "America/Argentina/Buenos_Aires";

async function supabase(path) {
    const res = await fetch(SUPABASE_URL + "/rest/v1" + path, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: "Bearer " + SUPABASE_KEY
        }
    });
    if (!res.ok) {
        throw new Error("Supabase error " + res.status);
    }
    return res;
}

module.exports = async function handler(req, res) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ")
        ? auth.slice(7)
        : req.query.token;

    if (!token || token !== STATS_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const response = await supabase("/visit_events?select=date");
        const rows = await response.json();

        const perDayMap = new Map();
        for (const row of rows) {
            perDayMap.set(row.date, (perDayMap.get(row.date) || 0) + 1);
        }

        const perDay = Array.from(perDayMap.entries())
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([date, count]) => ({ date, count }));

        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: VISIT_TZ,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());

        return res.status(200).json({
            today: perDayMap.get(today) || 0,
            total: rows.length,
            perDay
        });
    } catch (err) {
        return res.status(500).json({ error: "Could not load stats" });
    }
}
