// =============================================
// Smooth Scroll
// =============================================
const SCROLL_OFFSET = 25;
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        const top =
            this.getAttribute("href") === "#about"
                ? 0
                : target.offsetTop - SCROLL_OFFSET;
        window.scrollTo({
            top,
            behavior: "smooth"
        });
    });
});

// =============================================
// Dynamic Year
// =============================================
const year = document.getElementById("current-year");
if (year)
    year.textContent = new Date().getFullYear();

// =============================================
// Fade In Observer
// =============================================
const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    },
    {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px"
    }
);
document
    .querySelectorAll(".fade-in")
    .forEach(el => observer.observe(el));
// =============================================
// Interactive Terminal
// =============================================
const terminal = document.getElementById("terminal-output");
if (terminal) {
    const commands = [
        {
            cmd: "whoami",
            output: [
                "Martin Pacheco",
                "Full Stack Software Engineer"
            ]
        },
        {
            cmd: "experience",
            output: [
                "10+ years",
                "HW & SW Integration",
                "Full Stack Web Apps"
            ]
        },
        {
            cmd: "stack",
            output: [
                "✓ Node.js",
                "✓ React",
                "✓ Python",
                "✓ PostgreSQL",
                "✓ Express",
                "✓ Electron",
                "✓ TypeScript",
            ]
        },
        {
            cmd: "current_project",
            output: [
                "RNI MONITOR",
                "- Electron",
                "- Leaflet",
                "- GPS Integration"
            ]
        },
        {
            cmd: "github",
            output: [
                "github.com/martinlpc"
            ]
        },
        {
            cmd: "contact",
            output: [
                "martinlpacheco@gmail.com"
            ]
        },
        {
            cmd: "status",
            output: [
                "Available for work"
            ]
        }
    ];
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    async function typeLine(text, cssClass = "") {
        const line = document.createElement("div");
        line.className = cssClass;
        terminal.appendChild(line);
        for (const char of text) {
            line.textContent += char;
            await sleep(28);
            terminal.scrollTop = terminal.scrollHeight;
        }
    }
    async function execute(command) {
        await typeLine("> " + command.cmd, "terminal-command");
        await sleep(250);
        for (const line of command.output) {
            await typeLine(line, "terminal-response");
            await sleep(70);
        }
        await sleep(1200);
        terminal.appendChild(document.createElement("br"));
        terminal.scrollTop = terminal.scrollHeight;
    }
    async function clearTerminal() {
        await typeLine("> clear", "terminal-command");
        await sleep(600);
        terminal.style.opacity = ".15";
        await sleep(180);
        terminal.innerHTML = "";
        terminal.style.opacity = "1";
    }
    async function startTerminal() {
        while (true) {
            for (const command of commands) {
                await execute(command);
            }
            await clearTerminal();
        }
    }
    startTerminal();
}

// =============================================
// Navbar Blur on Scroll
// =============================================
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle(
        "scrolled",
        window.scrollY > 20
    );
});

// =============================================
// Mobile Nav Toggle
// =============================================
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
    function closeNav() {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
    }
    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        navToggle.classList.toggle("active", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.addEventListener("click", e => {
        if (e.target.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeNav();
    });
}

// =============================================
// Easter Egg Console Message
// =============================================
const ASCII_LOGO = `
█   █   █████       /
██ ██   █   █      /
█ █ █   █   █     /
█   █   █████    /
█   █   █       /
█   █   █      /
`;

console.log(
    `%c${ASCII_LOGO}`,
    "color:#4ade80;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.2;"
);
console.log(
    "%cHi! I'm Martin Pacheco",
    "color:#4ade80;font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace;"
);
console.log(
    "%cFull Stack Software Engineer based in Argentina",
    "color:#9ca3af;font-size:17px;font-weight:500;font-family:'JetBrains Mono',monospace;"
);
console.log(
    "%cgithub.com/martinlpc  ·  linkedin.com/in/martinlpacheco  ·  martinlpacheco@gmail.com",
    "color:#6b7280;font-size:12px;font-family:'JetBrains Mono',monospace;"
);
console.log(
    "%cOpen to work — say hi if you found this easter egg 👋",
    "color:#9ca3af;font-size:12px;font-family:'JetBrains Mono',monospace;"
);

// =============================================
// Internal Visit Tracking
// =============================================
(function trackVisit() {
    const COOKIE_NAME = "mp_visitor";
    const match = document.cookie.match(/(?:^|;\s*)mp_visitor=([^;]+)/);
    let visitorId = match && match[1];

    if (!visitorId) {
        visitorId =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
        document.cookie =
            COOKIE_NAME + "=" + encodeURIComponent(visitorId) +
            "; Max-Age=31536000; Path=/; SameSite=Lax";
    }

    fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
        keepalive: true
    }).catch(() => {});
})();