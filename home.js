// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// GSAP Setup
gsap.registerPlugin(ScrollTrigger);
const tl = gsap.timeline();

// Initially hide body overflow
document.body.style.overflow = "hidden";

// Text Splitting Functions
function splitText(element) {
    const text = element.textContent.trim();
    element.innerHTML = "";
    element.setAttribute("data-text", text);
    text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        span.style.transformOrigin = "center bottom";
        element.appendChild(span);
    });
}

function splitLines(element) {
    const lines = element.textContent.trim().split(/\s+/).reduce((acc, word) => {
        const lastLine = acc[acc.length - 1];
        if (lastLine && lastLine.length + word.length < 30) {
            acc[acc.length - 1] += ` ${word}`;
        } else {
            acc.push(word);
        }
        return acc;
    }, []);
    element.innerHTML = "";
    lines.forEach((line) => {
        const div = document.createElement("div");
        div.className = "line";
        div.textContent = line;
        element.appendChild(div);
    });
}

document.querySelectorAll(".split-text").forEach(splitText);
document.querySelectorAll(".distort-text").forEach(splitLines);

// Preloader Animation
let counterValue = 0;
const counterElement = document.querySelector(".counter");
const heroSection = document.querySelector(".hero-section");

function updateCounter() {
    if (counterValue < 100) {
        counterValue += Math.floor(Math.random() * 40) + 5;
        counterValue = Math.min(counterValue, 100);
        counterElement.textContent = `${counterValue}%`;
        splitText(counterElement);
        gsap.fromTo(
            counterElement.querySelectorAll("span"),
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.05, ease: "elastic.out(1, 0.5)" }
        );
        setTimeout(updateCounter, Math.random() * 100 + 50);
    } else {
        tl.to(".shading", {
            clipPath: "circle(150% at 50% 100%)",
            duration: 1.5,
            ease: "power4.inOut",
            onComplete: () => {
                gsap.to(".preloader", {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        document.querySelector(".preloader").style.display = "none";
                        document.body.style.overflow = "auto";
                        heroSection.style.visibility = "visible";
                        animateElements();
                    },
                });
            },
        });
    }
}

// Navbar Animation
const hamburger = document.querySelector(".hamburger");
const menuOverlay = document.querySelector(".menu-overlay");
const menuClose = document.querySelector(".menu-close");

hamburger.addEventListener("click", () => {
    if (!menuOverlay.classList.contains("active")) {
        menuOverlay.classList.add("active");
        const menuTl = gsap.timeline();
        menuTl.fromTo(
            menuOverlay,
            { x: "100%" },
            { x: "0%", duration: 0.8, ease: "power4.inOut" }
        );
        document.querySelectorAll(".menu-line").forEach((line, index) => {
            menuTl.fromTo(
                line,
                { width: 0 },
                { width: "100%", duration: 0.5, ease: "power2.out", stagger:0.1},
                `-=${0.5 - index * 0.1}`
            );
        });
        document.querySelectorAll(".nav-menu a").forEach((link) => {
            const spans = link.querySelectorAll("span");
            menuTl.fromTo(
                spans,
                { y: "100%", opacity: 0, scale: 0.8 },
                { y: "0%", opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" },
                "-=0.4"
            );
        });
        hamburger.classList.add("active");
    }
});

menuClose.addEventListener("click", () => {
    hamburger.classList.remove("active");
    const closeTl = gsap.timeline({
        onComplete: () => menuOverlay.classList.remove("active"),
    });
    document.querySelectorAll(".nav-menu a").forEach((link) => {
        const spans = link.querySelectorAll("span");
        closeTl.to(spans, {
            y: "-100%",
            opacity: 0,
            duration: 0.3,
            stagger: 0.02,
            ease: "power2.in",
        }, 0);
    });
    document.querySelectorAll(".menu-line").forEach((line) => {
        closeTl.to(line, { width: 0, duration: 0.3, ease: "power2.in" }, 0.1);
    });
    closeTl.to(menuOverlay, { x: "100%", duration: 0.8, ease: "power4.inOut" }, 0.2);
});

// Hero Animation
function animateElements() {
    tl.clear()
        .from(".hero-bg", {
            scale: 0.5,
            opacity: 0,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
        })
        .from(".hero-section .intro span", {
            y: 50,
            opacity: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
        }, "-=1.2")
        .from(".hero-section h1 span", {
            y: 50,
            opacity: 0,
            stagger: 0.08,
            duration: 1.2,
            ease: "elastic.out(1, 0.5)",
        }, "-=0.8")
        .from(".hero-section .subtitle .line", {
            opacity: 0,
            skewX: 40,
            x: -70,
            stagger: 0.2,
            duration: 1.2,
            ease: "bounce.out",
        }, "-=0.6")
        .to(".tracker-path", {
            strokeDasharray: "1000 1000",
            duration: 3,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
        }, "-=0.5")
        .from(".constellation circle", {
            opacity: 0,
            scale: 0,
            stagger: 0.2,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
        }, "-=2.5");
}

// Scroll Animations for Sections
gsap.utils.toArray(".section").forEach((section) => {
    const headerTl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
        },
    });
    headerTl.from(section.querySelectorAll(".split-text span"), {
        y: 50,
        opacity: 0,
        rotation: 10,
        stagger: 0.05,
        duration: 1,
        ease: "bounce.out",
    });

    // Animate distort-text lines within each section
    const distortTextLines = section.querySelectorAll(".distort-text .line");
    headerTl.from(distortTextLines, {
        opacity: 0,
        skewX: 40,
        x: -70,
        stagger: 0.1,
        duration: 1.2,
        ease: "bounce.out",
    });
});


// Project Card Animations
gsap.utils.toArray(".project-card").forEach((card) => {
    const distortTextLines = card.querySelectorAll(".distort-text .line");
    gsap.from(card, {
        y: 80,
        opacity: 0,
        scale: 0.9,
        rotation: 5,
        duration: 1,
        ease: "bounce.out",
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse",
        },
    });
    gsap.from(distortTextLines, {
        opacity: 0,
        skewX: 40,
        x: -70,
        stagger: 0.1,
        duration: 1.2,
        ease: "bounce.out",
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse",
        },
    });
});

// Animated Icons
function animateIcons(selector) {
    gsap.utils.toArray(selector).forEach((icon) => {
        gsap.from(icon, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
                trigger: icon,
                start: "top 80%",
            },
        });
        icon.addEventListener("mouseenter", () => {
            gsap.to(icon, { scale: 1.2, rotation: 360, duration: 0.5, ease: "power2.out" });
        });
        icon.addEventListener("mouseleave", () => {
            gsap.to(icon, { scale: 1, rotation: 0, duration: 0.5, ease: "power2.in" });
        });
    });
}
animateIcons(".animated-icon");

// Skill Counters
gsap.utils.toArray(".skill-item").forEach((item) => {
    const counter = item.querySelector(".skill-counter");
    const target = parseInt(counter.getAttribute("data-progress")) || 0;
    ScrollTrigger.create({
        trigger: item,
        start: "top 80%",
        onEnter: () => {
            gsap.to(counter, {
                innerText: target,
                duration: 4,
                ease: "power4.out",
                snap: { innerText: 1 },
                onUpdate: () => {
                    counter.textContent = `${Math.round(counter.innerText)}%`;
                },
                onComplete: () => {
                    gsap.to(counter, {
                        scale: 1.2,
                        duration: 0.5,
                        ease: "bounce.out",
                        yoyo: true,
                        repeat: 1,
                    });
                },
            });
        },
    });
});


// Contact Form Animation
gsap.from(".contact-form .form-group", {
    y: 30,
    opacity: 0,
    stagger: 0.2,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
        trigger: "#contact",
        start: "top 80%",
        toggleActions: "play none none reverse",
    },
});
gsap.from(".contact-form .submit-button", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
        trigger: "#contact",
        start: "top 80%",
        toggleActions: "play none none reverse",
    },
}, "-=0.4");

// Footer Animation
gsap.from(".footer", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".footer",
        start: "top bottom",
        toggleActions: "play none none reverse",
    },
});


// Testimonials Parallax Auto-Slide with Swipe
const testimonialsSection = document.querySelector(".testimonials-section");
const testimonialsTrack = document.querySelector(".testimonials-track");
const testimonialsItems = gsap.utils.toArray(".testimonial-item");

// Calculate total width of original track
const trackWidth = testimonialsItems.reduce((acc, item) => acc + item.offsetWidth + 32, 0); // 32px for margin-right

// Clone the track for seamless looping
const cloneTrack = testimonialsTrack.cloneNode(true);
testimonialsTrack.parentNode.appendChild(cloneTrack);

// Set initial positions
gsap.set(testimonialsTrack, { x: 0 });
gsap.set(cloneTrack, { x: trackWidth });

// Auto-slide animation
const autoSlide = gsap.to([testimonialsTrack, cloneTrack], {
    x: `-=${trackWidth}`,
    duration: 40,
    ease: "none",
    repeat: -1,
    modifiers: {
        x: (x) => `${parseFloat(x) % trackWidth}px` // Seamless loop
    }
});

// Parallax effect on scroll (slower)
ScrollTrigger.create({
    trigger: ".testimonials-section",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
        const progress = self.progress;
        const parallaxOffset = progress * 100; // Subtle parallax shift
        gsap.to([testimonialsTrack, cloneTrack], {
            x: `-=${trackWidth + parallaxOffset}`,
            duration: 1.5, // Slower parallax (was 0.5)
            ease: "power2.out",
            overwrite: "auto",
            modifiers: {
                x: (x) => `${parseFloat(x) % trackWidth}px` // Keep looping intact
            }
        });
    }
});

// Swipe functionality with Draggable
Draggable.create(testimonialsTrack, {
    type: "x",
    bounds: { minX: -trackWidth, maxX: 0 }, // Limit dragging within track width
    inertia: true, // Smooth momentum after release
    onDragStart: () => {
        autoSlide.pause(); // Pause auto-slide during drag
    },
    onDrag: function() {
        // Sync clone track position
        const xPos = this.x;
        gsap.set(cloneTrack, { x: xPos + trackWidth });
    },
    onDragEnd: function() {
        // Resume auto-slide after drag
        autoSlide.resume();
        // Ensure seamless looping
        if (this.x <= -trackWidth) {
            gsap.set(testimonialsTrack, { x: 0 });
            gsap.set(cloneTrack, { x: trackWidth });
        }
    }
});

// Sync clone track with initial drag setup
Draggable.create(cloneTrack, {
    type: "x",
    bounds: { minX: 0, maxX: trackWidth },
    inertia: true,
    onDragStart: () => {
        autoSlide.pause();
    },
    onDrag: function() {
        const xPos = this.x;
        gsap.set(testimonialsTrack, { x: xPos - trackWidth });
    },
    onDragEnd: function() {
        autoSlide.resume();
        if (this.x >= trackWidth) {
            gsap.set(cloneTrack, { x: trackWidth });
            gsap.set(testimonialsTrack, { x: 0 });
        }
    }
});

// Custom Cursor & Trail
let trailX = -10, trailY = -10;
const trailElements = Array.from({ length: 5 }, () => {
    const el = document.createElement("div");
    el.className = "trail";
    el.style.position = "fixed";
    el.style.width = "10px";
    el.style.height = "10px";
    el.style.background = "#33ff00";
    el.style.borderRadius = "50%";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9998";
    document.body.appendChild(el);
    return el;
});

document.addEventListener("mousemove", (e) => {
    gsap.to("#cursor", {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.1,
    });
    trailElements.forEach((el, index) => {
        gsap.to(el, {
            x: trailX,
            y: trailY,
            duration: 0.8 + index * 0.1,
            ease: "elastic.out(1, 0.5)",
            onUpdate: () => {
                trailX = e.clientX - 5;
                trailY = e.clientY - 5;
            },
        });
    });
});

// Hover Effects for Interactive Elements
document.querySelectorAll(".skill-item, .hamburger, .nav-menu a, .custom-button, .submit-button, .social-links a").forEach((el) => {
    el.addEventListener("mouseenter", () => {
        gsap.to("#cursor", {
            scale: 2,
            backgroundColor: "#33ff00",
            borderColor: "#33ff00",
            duration: 0.2,
        });
        trailElements.forEach((trail) => {
            gsap.to(trail, { scale: 1.5, backgroundColor: "#33ff00", duration: 0.3 });
        });
    });
    el.addEventListener("mouseleave", () => {
        gsap.to("#cursor", {
            scale: 1,
            backgroundColor: "transparent",
            borderColor: "#33ff00",
            duration: 0.2,
        });
        trailElements.forEach((trail) => {
            gsap.to(trail, { scale: 1, backgroundColor: "#33ff00", duration: 0.3 });
        });
    });
});

// Video Tilt and Toggle
VanillaTilt.init(document.querySelector(".video-container"), {
    max: 15,
    speed: 400,
});

const video = document.getElementById("myVideo");
const toggleButton = document.getElementById("toggleButton");
toggleButton.addEventListener("click", () => {
    if (video.paused) {
        video.play();
        toggleButton.textContent = "Pause";
    } else {
        video.pause();
        toggleButton.textContent = "Play";
    }
});

// Start Preloader Animation
updateCounter();