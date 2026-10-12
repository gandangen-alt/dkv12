/* =========================================================
   Portofolio Metiw Cihoey - script.js
   Ubah data kontak di objek CONFIG di bawah ini.
   ========================================================= */

const CONFIG = {
  email: "email@contoh.com",              // ganti dengan email Anda
  whatsapp: "6281234567890",              // format internasional tanpa + atau 0 di depan (62...)
  whatsappText: "Halo Metiw, saya melihat portofolio Anda.",
  instagram: "username_instagram",        // username tanpa @
  // Opsional: isi dengan URL layanan formulir (misalnya Formspree) agar pesan terkirim dari halaman.
  // Contoh: "https://formspree.io/f/xxxxxxx". Biarkan kosong untuk memakai mailto.
  formEndpoint: ""
};

document.addEventListener("DOMContentLoaded", () => {
  initContactLinks();
  initNavbar();
  initReveal();
  initSkillMeters();
  initActiveNav();
  initPortfolioFilter();
  initLightbox();
  initContactForm();
  initToTop();
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ---------- Tautan kontak dari CONFIG ---------- */
function initContactLinks() {
  const links = {
    email: "mailto:" + CONFIG.email,
    whatsapp: "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(CONFIG.whatsappText),
    instagram: "https://instagram.com/" + CONFIG.instagram
  };
  document.querySelectorAll("[data-contact]").forEach(el => {
    el.href = links[el.dataset.contact];
  });
  const text = {
    email: CONFIG.email,
    whatsapp: "+" + CONFIG.whatsapp,
    instagram: "@" + CONFIG.instagram
  };
  document.querySelectorAll("[data-contact-text]").forEach(el => {
    el.textContent = text[el.dataset.contactText];
  });
}

/* ---------- Navbar: menu mobile + bayangan saat digulir ---------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const setMenu = open => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };

  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });

  const onScroll = () => navbar.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Animasi muncul saat masuk viewport ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(i => observer.observe(i));
}

/* ---------- Indikator keahlian (nilai dari data-level) ---------- */
function initSkillMeters() {
  const bars = document.querySelectorAll(".meter span");
  const fill = bar => { bar.style.width = bar.dataset.level + "%"; };
  if (!("IntersectionObserver" in window)) { bars.forEach(fill); return; }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => { if (entry.isIntersecting) { fill(entry.target); obs.unobserve(entry.target); } });
  }, { threshold: 0.5 });
  bars.forEach(b => observer.observe(b));
}

/* ---------- Menu aktif sesuai bagian halaman ---------- */
function initActiveNav() {
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);

  const update = () => {
    const marker = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= marker) current = s; });
    // Jika sudah di dasar halaman, aktifkan bagian terakhir
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1];
    links.forEach(l => {
      const active = l.getAttribute("href") === "#" + current.id;
      l.classList.toggle("is-active", active);
      if (active) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ---------- Filter portofolio ---------- */
function initPortfolioFilter() {
  const buttons = document.querySelectorAll(".filter");
  const works = document.querySelectorAll(".work");
  const empty = document.getElementById("galleryEmpty");

  buttons.forEach(btn => btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    buttons.forEach(b => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    let shown = 0;
    works.forEach(w => {
      const match = filter === "all" || w.dataset.category === filter;
      w.hidden = !match;
      if (match) { shown++; w.classList.add("is-visible"); }
    });
    empty.hidden = shown > 0;
  }));
}

/* ---------- Lightbox ---------- */
function initLightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  const title = document.getElementById("lbTitle");
  const desc = document.getElementById("lbDesc");
  const closeBtn = document.getElementById("lbClose");
  const prevBtn = document.getElementById("lbPrev");
  const nextBtn = document.getElementById("lbNext");
  let triggers = [];
  let index = 0;
  let lastFocus = null;

  const visibleTriggers = () =>
    [...document.querySelectorAll(".work:not([hidden]) .work__open")];

  const show = i => {
    index = (i + triggers.length) % triggers.length;
    const t = triggers[index];
    img.src = t.dataset.full;
    img.alt = t.querySelector("img").alt;
    title.textContent = t.dataset.title;
    desc.textContent = t.dataset.desc;
  };

  const open = trigger => {
    triggers = visibleTriggers();
    lastFocus = trigger;
    show(triggers.indexOf(trigger));
    box.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const close = () => {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll(".work__open").forEach(t => t.addEventListener("click", () => open(t)));
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () => show(index + 1));
  box.addEventListener("click", e => { if (e.target === box) close(); });

  document.addEventListener("keydown", e => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") {
      // Jaga fokus tetap di dalam lightbox
      const f = [closeBtn, prevBtn, nextBtn];
      const pos = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(pos + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}

/* ---------- Formulir kontak ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const fields = {
    nama: v => v.trim().length < 2 ? "Isi nama minimal 2 karakter." : "",
    email: v => !v.trim() ? "Isi alamat email." : (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Format email belum benar. Contoh: nama@email.com" : ""),
    subjek: v => v.trim().length < 3 ? "Isi subjek minimal 3 karakter." : "",
    pesan: v => v.trim().length < 10 ? "Isi pesan minimal 10 karakter." : ""
  };

  const check = name => {
    const input = form.elements[name];
    const message = fields[name](input.value);
    const wrap = input.closest(".field");
    wrap.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));
    document.getElementById("err-" + name).textContent = message;
    return !message;
  };

  Object.keys(fields).forEach(name => {
    form.elements[name].addEventListener("blur", () => check(name));
    form.elements[name].addEventListener("input", () => {
      if (form.elements[name].closest(".field").classList.contains("has-error")) check(name);
    });
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.className = "form__status";
    status.textContent = "";

    const results = Object.keys(fields).map(check);
    if (results.includes(false)) {
      const firstBad = Object.keys(fields).find(n => form.elements[n].closest(".field").classList.contains("has-error"));
      form.elements[firstBad].focus();
      status.classList.add("is-error");
      status.textContent = "Periksa kembali kolom yang bertanda merah.";
      return;
    }

    const data = {
      nama: form.elements.nama.value.trim(),
      email: form.elements.email.value.trim(),
      subjek: form.elements.subjek.value.trim(),
      pesan: form.elements.pesan.value.trim()
    };

    if (CONFIG.formEndpoint) {
      // Mode layanan formulir pihak ketiga
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Status " + res.status);
        form.reset();
        status.classList.add("is-ok");
        status.textContent = "Pesan terkirim. Terima kasih!";
      } catch (err) {
        status.classList.add("is-error");
        status.textContent = "Pesan belum terkirim. Coba lagi, atau hubungi lewat email atau WhatsApp.";
      }
      return;
    }

    // Mode mailto: membuka aplikasi email, pesan baru terkirim setelah Anda menekan kirim di sana
    const body = "Nama: " + data.nama + "\nEmail: " + data.email + "\n\n" + data.pesan;
    window.location.href = "mailto:" + CONFIG.email +
      "?subject=" + encodeURIComponent(data.subjek) +
      "&body=" + encodeURIComponent(body);
    status.classList.add("is-ok");
    status.textContent = "Aplikasi email dibuka dengan pesan Anda. Tekan kirim di sana untuk menyelesaikan.";
  });
}

/* ---------- Tombol kembali ke atas ---------- */
function initToTop() {
  const btn = document.getElementById("toTop");
  const toggle = () => { btn.hidden = window.scrollY < 600; };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
