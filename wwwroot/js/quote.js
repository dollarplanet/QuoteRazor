/* Kutipan Gurun Sunyi — interaksi halaman */
(() => {
    "use strict";

    const dataEl = document.getElementById("quote-data");
    if (!dataEl) return;

    let quotes = [];
    try {
        quotes = JSON.parse(dataEl.textContent || "[]");
    } catch {
        quotes = [];
    }
    if (!quotes.length) return;

    const el = {
        wrapper: document.getElementById("quote-wrapper"),
        text: document.getElementById("quote-text"),
        author: document.getElementById("quote-author"),
        context: document.getElementById("quote-context"),
        counter: document.getElementById("quote-counter"),
        nextBtn: document.getElementById("next-quote-btn"),
        copyBtn: document.getElementById("copy-quote-btn"),
        copyIcon: document.getElementById("copy-icon"),
        copyText: document.getElementById("copy-text"),
        shareBtn: document.getElementById("share-btn"),
        favoriteBtn: document.getElementById("favorite-btn"),
        favoriteIcon: document.getElementById("favorite-icon"),
        ambientBtn: document.getElementById("ambient-toggle"),
        windIcon: document.getElementById("wind-icon"),
        windLabel: document.getElementById("wind-label"),
        toast: document.getElementById("toast"),
        toastMessage: document.getElementById("toast-message"),
        toastIcon: document.getElementById("toast-icon")
    };

    const pad = (n) => String(n).padStart(2, "0");
    const favorites = new Set();

    let index = 0;
    let swapping = false;
    let toastTimer = 0;

    function showToast(message, icon = "check_circle") {
        if (!el.toast) return;
        el.toastMessage.textContent = message;
        el.toastIcon.textContent = icon;
        el.toast.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => el.toast.classList.remove("is-visible"), 2500);
    }

    function syncFavorite() {
        const isFavorite = favorites.has(index);
        el.favoriteBtn.classList.toggle("is-favorite", isFavorite);
        el.favoriteBtn.setAttribute("aria-pressed", String(isFavorite));
        el.favoriteIcon.textContent = isFavorite ? "favorite" : "favorite_border";
    }

    function paint(i) {
        const item = quotes[i];
        if (!item) return;

        el.text.innerHTML = `&ldquo;${item.text}&rdquo;`;
        el.author.textContent = item.author;
        el.context.textContent = item.context;
        el.counter.textContent = `${pad(i + 1)} / ${pad(quotes.length)}`;
        el.counter.setAttribute("aria-label", `Kutipan ke-${i + 1} dari ${quotes.length}`);
        syncFavorite();
    }

    function render(i, immediate = false) {
        if (immediate) {
            paint(i);
            return;
        }
        swapping = true;
        el.wrapper.classList.add("is-switching");
        window.setTimeout(() => {
            paint(i);
            el.wrapper.classList.remove("is-switching");
            swapping = false;
        }, 200);
    }

    function nextQuote() {
        if (swapping) return;
        index = (index + 1) % quotes.length;
        render(index);

        el.nextBtn.classList.add("is-spinning");
        window.setTimeout(() => el.nextBtn.classList.remove("is-spinning"), 420);
    }

    function currentAsText() {
        const item = quotes[index];
        return `"${item.text}" — ${item.author} (${item.context})`;
    }

    async function copyText(value) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }

        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
    }

    el.nextBtn?.addEventListener("click", nextQuote);

    el.copyBtn?.addEventListener("click", async () => {
        try {
            await copyText(currentAsText());
            showToast("Kutipan disalin ke clipboard!", "content_copy");
            el.copyIcon.textContent = "check";
            el.copyText.textContent = "Tersalin";
            window.setTimeout(() => {
                el.copyIcon.textContent = "content_copy";
                el.copyText.textContent = "Salin Kutipan";
            }, 1800);
        } catch {
            showToast("Gagal menyalin kutipan", "error");
        }
    });

    el.shareBtn?.addEventListener("click", async () => {
        const item = quotes[index];
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Kutipan Gurun",
                    text: `"${item.text}" — ${item.author}`,
                    url: window.location.href
                });
                return;
            } catch {
                /* pengguna membatalkan — abaikan */
            }
        }

        try {
            await copyText(currentAsText());
            showToast("Tautan kutipan disalin", "share");
        } catch {
            showToast("Bagikan tidak tersedia", "error");
        }
    });

    el.favoriteBtn?.addEventListener("click", () => {
        if (favorites.has(index)) {
            favorites.delete(index);
            showToast("Dihapus dari favorit", "favorite_border");
        } else {
            favorites.add(index);
            showToast("Kutipan ditandai ke favorit!", "favorite");
        }
        syncFavorite();
    });

    /* ---------- Suara angin gurun (Web Audio API) ---------- */

    let audioCtx = null;
    let windSource = null;
    let windGain = null;
    let windPlaying = false;

    function buildWind() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;

        audioCtx = new AudioCtx();

        const seconds = 2;
        const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
        const out = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < buffer.length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }

        windSource = audioCtx.createBufferSource();
        windSource.buffer = buffer;
        windSource.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(380, audioCtx.currentTime);

        windGain = audioCtx.createGain();
        windGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

        windSource.connect(filter);
        filter.connect(windGain);
        windGain.connect(audioCtx.destination);
        windSource.start(0);

        return true;
    }

    el.ambientBtn?.addEventListener("click", () => {
        try {
            if (!windPlaying) {
                if (!audioCtx || audioCtx.state === "suspended") {
                    if (!audioCtx && !buildWind()) {
                        showToast("Peramban tidak mendukung audio", "air");
                        return;
                    }
                    audioCtx.resume?.();
                }

                windGain.gain.setTargetAtTime(0.18, audioCtx.currentTime, 0.5);
                windPlaying = true;

                el.windIcon.textContent = "volume_up";
                el.windLabel.textContent = "Suara Hidup";
                el.ambientBtn.classList.add("is-on");
                el.ambientBtn.setAttribute("aria-pressed", "true");
                el.ambientBtn.setAttribute("aria-label", "Matikan suara angin gurun");
                showToast("Deru angin gurun dimainkan", "air");
            } else {
                windGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.4);
                windPlaying = false;

                el.windIcon.textContent = "air";
                el.windLabel.textContent = "Angin Sunyi";
                el.ambientBtn.classList.remove("is-on");
                el.ambientBtn.setAttribute("aria-pressed", "false");
                el.ambientBtn.setAttribute("aria-label", "Aktifkan suara angin gurun");
                showToast("Keheningan kembali", "volume_off");
            }
        } catch {
            showToast("Audio angin tidak tersedia", "air");
        }
    });

    /* ---------- Pintasan papan ketik ---------- */

    document.addEventListener("keydown", (event) => {
        if (event.target instanceof HTMLElement &&
            /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) {
            return;
        }

        if (event.key === "ArrowRight" || event.key === "n") {
            event.preventDefault();
            nextQuote();
        }
    });

    /* ---------- Init ---------- */

    render(0, true);
})();
