// =============================================
// Smooth Scroll
// =============================================
const SCROLL_OFFSET = 90;
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
                "14+ years",
                "Government Software",
                "Backend",
                "Full Stack"
            ]
        },
        {
            cmd: "stack",
            output: [
                "✓ Node.js",
                "✓ React",
                "✓ Python",
                "✓ PostgreSQL",
                "✓ Docker"
            ]
        },
        {
            cmd: "current_project",
            output: [
                "RNI Monitor",
                "Electron",
                "Leaflet",
                "GPS Integration"
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
        }
        terminal.scrollTop = terminal.scrollHeight;
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