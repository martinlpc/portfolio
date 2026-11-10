const { supabase, todayISO } = require("./_supabase");

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const visitorId = req.body?.visitorId;
    if (typeof visitorId !== "string" || !visitorId || visitorId.length > 100) {
        return res.status(400).json({ error: "visitorId must be a non-empty string" });
    }

    const date = todayISO();

    try {
        const existing = await supabase(
            `/visit_events?select=id&date=eq.${date}&visitor_id=eq.${encodeURIComponent(visitorId)}&limit=1`
        );
        if ((await existing.json()).length > 0) {
            return res.status(200).json({ counted: false });
        }

        await supabase("/visit_events", {
            method: "POST",
            headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
            body: JSON.stringify({ date, visitor_id: visitorId })
        });

        return res.status(200).json({ counted: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Could not record visit" });
    }
};
