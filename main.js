// =============================================
// Smooth Scroll (con offset para navbar fijo)
// =============================================
const SCROLL_OFFSET = 90 // debe coincidir con scroll-padding-top en CSS

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
            const top = this.getAttribute('href') === '#about'
                ? 0
                : target.offsetTop - SCROLL_OFFSET
            window.scrollTo({ top, behavior: 'smooth' })
        }
    })
})

// =============================================
// Footer: año dinámico
// =============================================
document.getElementById('current-year').textContent = new Date().getFullYear()

// =============================================
// Scroll Animations (IntersectionObserver)
// =============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target) // se anima una sola vez
        }
    })
}, observerOptions)

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))