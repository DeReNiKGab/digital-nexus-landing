export const initUI = () => {
    // 1. Icons
    if ((window as any).lucide) {
        (window as any).lucide?.createIcons();
    }

    // 2. Animation Observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate");
                }
            });
        },
        { threshold: 0.1 },
    );

    document
        .querySelectorAll(".animate-on-scroll")
        .forEach((el) => observer.observe(el));

    // Mobile-only layer entrance animations
    if (window.innerWidth <= 640) {
        const layerObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );

        document
            .querySelectorAll(".mobile-layer-anim")
            .forEach((el) => layerObserver.observe(el));
    }

    // Mobile menu
    function initMobileMenu() {
        const toggle = document.getElementById("nav-toggle");
        const menu = document.getElementById("mobile-menu");
        if (!toggle || !menu) return;

        const svg = toggle.querySelector("svg");
        const openPath = "M4 8h16M4 16h16";
        const closePath = "M6 18L18 6M6 6l12 12";

        function setIcon(isOpen: boolean) {
            if (!svg) return;
            svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isOpen ? closePath : openPath}"></path>`;
        }

        function openMenu() {
            if (!toggle || !menu) return;
            toggle.setAttribute("aria-expanded", "true");
            menu.classList.remove("hidden");
            menu.setAttribute("aria-hidden", "false");
            document.body.classList.add("overflow-hidden");
            setIcon(true);
        }

        function closeMenu() {
            if (!toggle || !menu) return;
            toggle.setAttribute("aria-expanded", "false");
            menu.classList.add("hidden");
            menu.setAttribute("aria-hidden", "true");
            document.body.classList.remove("overflow-hidden");
            setIcon(false);
        }

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            if (isOpen) closeMenu();
            else openMenu();
        });

        // Close on link click
        menu.querySelectorAll("a").forEach((a) =>
            a.addEventListener("click", () => {
                closeMenu();
            }),
        );

        // Close on Escape
        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.key === "Escape") closeMenu();
        });

        // Click outside to close
        document.addEventListener("click", (ev: Event) => {
            const tgt = ev.target as Node | null;
            if (
                !menu.classList.contains("hidden") &&
                tgt &&
                !menu.contains(tgt) &&
                !toggle.contains(tgt)
            ) {
                closeMenu();
            }
        });

        // Ensure initial icon state
        setIcon(false);
    }
    initMobileMenu();

    // Mobile layers
    function initMobileLayers() {
        const items = Array.from(
            document.querySelectorAll(".mobile-layer-item"),
        );
        const detail = document.getElementById("mobile-layer-detail");
        const container = document.getElementById("mobile-layers");
        if (!items.length || !detail || !container) return;

        function setActive(idx: number) {
            items.forEach((it) => {
                const is = it.getAttribute("data-index") === String(idx);
                it.classList.toggle("active", is);
                it.setAttribute("aria-pressed", is ? "true" : "false");
            });
        }

        items.forEach((it) => {
            it.addEventListener("click", () => {
                const idx = it.getAttribute("data-index");
                if (idx) setActive(Number(idx));
            });
            it.addEventListener("keydown", (e) => {
                const ke = e as KeyboardEvent;
                if (ke.key === "Enter" || ke.key === " ") {
                    ke.preventDefault();
                    const idx = it.getAttribute("data-index");
                    if (idx) setActive(Number(idx));
                }
            });
        });

        // Entrance animation: staggered add of .enter class
        let animated = false;
        function animateEntrance() {
            if (animated) return;
            animated = true;
            items.forEach((it, i) => {
                setTimeout(() => it.classList.add("enter"), i * 90);
            });
        }

        // Observe container so we animate only when it appears on screen on mobile widths
        if (window.matchMedia("(max-width: 619px)").matches) {
            const io = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            animateEntrance();
                            obs.disconnect();
                        }
                    });
                },
                { threshold: 0.12 },
            );
            io.observe(container);
        } else {
            // Desktop/tablet: ensure items are visible without animation
            items.forEach((it) => it.classList.add("enter"));
        }

        // default: open first
        setActive(1);
    }
    initMobileLayers();

    // Stats Interaction
    const stats = document.querySelectorAll(".stat-item");
    const mainImage = document.getElementById(
        "main-image",
    ) as HTMLImageElement;

    if (stats.length > 0 && mainImage) {
        const images = {
            1: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/960d4d9c-2584-47bb-9b1c-418e0d46e730_800w.webp",
            2: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/df7a2dd9-504b-4462-9e25-8f9322d8a718_1600w.webp",
            3: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/37e53262-839c-4555-837c-45698b65611b_800w.webp",
        };

        stats.forEach((stat) => {
            stat.addEventListener("click", () => {
                const imgId = stat.getAttribute(
                    "data-img-id",
                ) as unknown as keyof typeof images;
                stats.forEach((s) => s.classList.remove("active"));
                stat.classList.add("active");
                mainImage.classList.add("fade-out");
                setTimeout(() => {
                    if (imgId in images) {
                        mainImage.src = images[imgId];
                    }
                    mainImage.onload = () => mainImage.classList.remove("fade-out");
                }, 500);
            });
        });
    }

    // Title Words Animation
    const words = document.querySelectorAll(".word");
    words.forEach((word) => {
        const text = word.getAttribute("data-text");
        if (text) {
            word.innerHTML = text
                .split("")
                .map((char) => {
                    const dir = Math.floor(Math.random() * 5);
                    const delay = Math.random() * 1.2;
                    return `<span class="letter inline-block opacity-0 dir-${dir}" 
              style="animation-delay: ${delay}s">${char}</span>`;
                })
                .join("");
        }
    });
};
