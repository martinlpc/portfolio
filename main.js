document.getElementById("year").textContent = new Date().getFullYear();

// ---------------------------------------------------------------
// Spectrum trace: a spectrum-analyzer sweep with a 10×5 graticule,
// a noisy floor, a handful of carriers and a marker on the peak.
// Seeded, so it renders the same every visit.
// ---------------------------------------------------------------
function drawSpectrum(svg) {
    const W = 1000;
    const H = 140;
    const FLOOR = H - 18;
    const CARRIERS = [ // [center x, height, width]
        [95, 22, 9], [180, 46, 4], [300, 30, 14], [430, 88, 5],
        [520, 18, 3], [610, 54, 7], [760, 36, 4], [880, 64, 9]
    ];

    let seed = 20100901;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const points = [];
    let peak = { x: 0, y: H };
    for (let x = 0; x <= W; x += 2) {
        let y = FLOOR - rand() * 9;
        for (const [cx, h, w] of CARRIERS) {
            y -= h * Math.exp(-((x - cx) ** 2) / (2 * w * w));
        }
        points.push(`${x},${y.toFixed(1)}`);
        if (y < peak.y) peak = { x, y };
    }

    let grid = "";
    for (let i = 0; i <= 10; i++) grid += `M${i * 100} 0V${H}`;
    for (let j = 0; j <= 5; j++) grid += `M0 ${j * 28}H${W}`;

    const { x, y } = peak;
    svg.innerHTML = `
        <path class="grid" d="${grid}"/>
        <polyline class="line" points="${points.join(" ")}"/>
        <path class="marker" d="M${x - 6} ${y - 14}h12l-6 9z"/>`;
}

const spectrum = document.getElementById("spectrum");
if (spectrum) drawSpectrum(spectrum);

// ---------------------------------------------------------------
// Console easter egg
// ---------------------------------------------------------------
const MONO = "font-family:'IBM Plex Mono',monospace;";
console.log(
    "%c" + String.raw`
█   █   █████       /
██ ██   █   █      /
█ █ █   █   █     /
█   █   █████    /
█   █   █       /
█   █   █      /
`,
    `${MONO}color:#ff7a4d;font-size:11px;line-height:1.2;`
);
console.log("%cHi, I'm Martin Pacheco.", `${MONO}font-size:20px;font-weight:500;`);
console.log(
    "%cOpen to work — if you found this, say hi: martinlpacheco@gmail.com",
    `${MONO}color:#80838a;font-size:12px;`
);

// ---------------------------------------------------------------
// Internal visit counter (one count per visitor per day, see /api)
// ---------------------------------------------------------------
(function trackVisit() {
    const COOKIE = "mp_visitor";
    const existing = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
    let visitorId = existing?.[1];

    if (!visitorId) {
        if (!crypto.randomUUID) return;
        visitorId = crypto.randomUUID();
        document.cookie = `${COOKIE}=${visitorId}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }

    fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
        keepalive: true
    }).catch(() => {});
})();
