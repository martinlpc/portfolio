const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const VISIT_TZ = process.env.VISIT_TZ || "America/Argentina/Buenos_Aires";

function todayISO() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: VISIT_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

async function supabase(path, options = {}) {
    const res = await fetch(SUPABASE_URL + "/rest/v1" + path, {
        ...options,
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: "Bearer " + SUPABASE_KEY,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });
    if (!res.ok) {
        throw new Error("Supabase error " + res.status);
    }
    return res;
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const visitorId = req.body && req.body.visitorId;
    if (!visitorId || typeof visitorId !== "string") {
        return res.status(400).json({ error: "visitorId (string) is required" });
    }

    const date = todayISO();

    try {
        const existing = await supabase(
            `/visit_events?select=id&date=eq.${date}&visitor_id=eq.${encodeURIComponent(visitorId)}`
        );
        const rows = await existing.json();

        if (rows.length > 0) {
            return res.status(200).json({ counted: false });
        }

        await supabase("/visit_events", {
            method: "POST",
            headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
            body: JSON.stringify({ date, visitor_id: visitorId })
        });

        return res.status(200).json({ counted: true });
    } catch (err) {
        return res.status(500).json({ error: "Could not record visit" });
    }
}
