// Shared helpers for the visit-counter functions.
// Files prefixed with "_" inside /api are not deployed as endpoints by Vercel.

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const VISIT_TZ = process.env.VISIT_TZ || "America/Argentina/Buenos_Aires";

async function supabase(path, { headers, ...options } = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
        ...options,
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            ...headers
        }
    });
    if (!res.ok) {
        throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    }
    return res;
}

// YYYY-MM-DD in the configured timezone.
function todayISO() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: VISIT_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

module.exports = { supabase, todayISO };
