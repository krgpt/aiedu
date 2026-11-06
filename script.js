/* =========================================================
   AI EDU NEXUS — script.js
   ========================================================= */
(function () {
  "use strict";

  const html = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#f5f7fc" : "#070a12");
    if (themeToggle) {
      const isLight = theme === "light";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.setAttribute("aria-label", isLight ? "어두운 테마로 전환" : "밝은 테마로 전환");
    }
  }

  let storedTheme = null;
  try { storedTheme = localStorage.getItem("aen-theme"); } catch (e) { /* ignore */ }
  applyTheme(storedTheme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("aen-theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");

  function closeMenu() {
    document.body.classList.remove("nav-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "메뉴 열기");
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      const isOpen = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      menuBtn.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
    });
  }

  if (mainNav) {
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("click", function (e) {
    if (!document.body.classList.contains("nav-open")) return;
    if (!e.target.closest(".site-header")) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------- Header / scroll progress ---------- */
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el) {
    const d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d);
  });

  if ("IntersectionObserver" in window && !prefersReduced) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) { el.textContent = String(target); return; }
    const duration = 1300;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if ("IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) {
        el.textContent = "0";
        countObserver.observe(el);
      });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Active nav link ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[href^='#']"));
  const sectionIds = ["about", "curriculum", "knowledge", "outcomes", "guide"];
  const sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Curriculum accordion ---------- */
  const sessionList = document.getElementById("sessionList");
  const toggleAllBtn = document.getElementById("toggleAll");

  function syncToggleAll() {
    if (!sessionList || !toggleAllBtn) return;
    const sessions = Array.prototype.slice.call(sessionList.querySelectorAll(".session"));
    const allOpen = sessions.length > 0 && sessions.every(function (s) { return s.open; });
    toggleAllBtn.textContent = allOpen ? "전체 접기" : "전체 펼치기";
    toggleAllBtn.setAttribute("aria-expanded", String(allOpen));
  }

  if (toggleAllBtn && sessionList) {
    toggleAllBtn.addEventListener("click", function () {
      const sessions = Array.prototype.slice.call(sessionList.querySelectorAll(".session"));
      const allOpen = sessions.every(function (s) { return s.open; });
      sessions.forEach(function (s) { s.open = !allOpen; });
      syncToggleAll();
    });

    sessionList.addEventListener("toggle", syncToggleAll, true);
    syncToggleAll();
  }

  /* ---------- Knowledge tabs ---------- */
  const tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  const panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));

  function activateTab(tab) {
    const id = tab.getAttribute("data-tab");
    tabs.forEach(function (t) {
      const active = t === tab;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (panel) {
      const active = panel.id === "panel-" + id;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      let nextIndex = null;
      if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") nextIndex = 0;
      if (e.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex !== null) {
        e.preventDefault();
        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex]);
      }
    });
  });

  /* ---------- Glossary ---------- */
  const GLOSSARY = [
    { name: "생성형 AI", en: "Generative AI", cat: "basic", def: "학습한 패턴을 바탕으로 텍스트·이미지·음성·코드 등 새로운 콘텐츠를 만들어내는 AI." },
    { name: "LLM", en: "Large Language Model", cat: "basic", def: "방대한 텍스트를 학습해 언어를 이해하고 생성하는 대형 모델. ChatGPT 같은 서비스의 두뇌에 해당." },
    { name: "프롬프트", en: "Prompt", cat: "basic", def: "AI에게 주는 지시·질문 입력. 어떻게 쓰느냐에 따라 결과 품질이 크게 달라집니다." },
    { name: "토큰", en: "Token", cat: "basic", def: "AI가 텍스트를 처리하는 최소 단위. 요금과 최대 입력 길이가 토큰 단위로 측정됩니다." },
    { name: "컨텍스트", en: "Context", cat: "basic", def: "답변 시 참고하는 지시·대화 기록·자료 등 입력 정보 전체를 뜻합니다." },
    { name: "컨텍스트 윈도우", en: "Context Window", cat: "basic", def: "모델이 한 번의 작업에서 참고할 수 있는 입력 토큰 수의 최대 범위." },
    { name: "프롬프트 엔지니어링", en: "Prompt Engineering", cat: "basic", def: "원하는 답변을 얻도록 프롬프트를 설계하고 최적화하는 기술." },
    { name: "할루시네이션", en: "Hallucination", cat: "basic", def: "AI가 사실이 아닌 내용을 그럴듯하게 사실처럼 생성하는 현상. RAG 등으로 완화합니다." },
    { name: "멀티모달", en: "Multimodal", cat: "basic", def: "텍스트뿐 아니라 이미지·음성·영상 등 여러 형태의 데이터를 함께 다루는 능력." },
    { name: "시스템 프롬프트", en: "System Prompt", cat: "basic", def: "모델의 성격·규칙·말투를 정하는 상위 지침. 사용자 프롬프트보다 우선 적용됩니다." },
    { name: "AI 에이전트", en: "Agent", cat: "advanced", def: "LLM으로 계획을 세우고 도구를 호출하며 목표 달성까지 스스로 반복하는 프로그램." },
    { name: "RAG", en: "Retrieval-Augmented Generation", cat: "advanced", def: "외부 문서를 검색해 그 내용을 근거로 답하게 하는 구조. 최신성과 정확도를 높입니다." },
    { name: "임베딩", en: "Embedding", cat: "advanced", def: "텍스트를 컴퓨터가 비교 가능한 숫자 벡터로 바꾼 것. 검색과 유사도 판단의 기초입니다." },
    { name: "API", en: "Application Programming Interface", cat: "advanced", def: "소프트웨어끼리 데이터를 주고받고 기능을 호출할 수 있게 정해둔 규칙." },
    { name: "파인튜닝", en: "Fine-tuning", cat: "advanced", def: "사전 학습된 모델을 특정 분야나 용도에 맞게 추가 학습시키는 것." },
    { name: "제로샷 / 퓨샷", en: "Zero-shot / Few-shot", cat: "advanced", def: "예시 없이, 또는 몇 개의 예시만 주고 과제를 시키는 프롬프팅 기법." },
    { name: "컨텍스트 엔지니어링", en: "Context Engineering", cat: "advanced", def: "프롬프트 문구를 넘어, 모델이 보게 될 정보 전체를 설계하는 기법." },
    { name: "도구 호출", en: "Tool Calling", cat: "advanced", def: "모델이 외부 도구나 API를 선택해 실행하도록 연결하는 기능. Agent의 행동 기반입니다." },
    { name: "MCP", en: "Model Context Protocol", cat: "deep", def: "AI가 외부 도구·데이터에 통일된 방식으로 연결하는 개방형 표준. 도구마다 개별 연동을 만들 필요를 줄입니다." },
    { name: "A2A", en: "Agent-to-Agent", cat: "deep", def: "에이전트들끼리 작업을 넘기고 협업하는 방식 또는 관련 프로토콜." },
    { name: "바이브 코딩", en: "Vibe Coding", cat: "deep", def: "자연어로 원하는 것을 설명하면 AI가 코드를 생성·수정하는 개발 방식." },
    { name: "사고연쇄", en: "Chain-of-Thought", cat: "deep", def: "단계별로 생각 과정을 드러내며 문제를 풀도록 유도하는 프롬프팅 기법." },
    { name: "프롬프트 인젝션", en: "Prompt Injection", cat: "deep", def: "조작된 입력으로 모델이 원래 지시나 정책을 무시하고 공격자 의도대로 동작하게 만드는 공격." },
    { name: "AGI", en: "Artificial General Intelligence", cat: "deep", def: "다양한 분야에서 인간 수준 또는 그 이상의 지적 능력을 갖춘 AI 개념." },
    { name: "트랜스포머", en: "Transformer", cat: "deep", def: "현대 LLM의 기반이 되는 신경망 구조. GPT의 'T'가 Transformer입니다." }
  ];

  const CAT_LABEL = { basic: "기초", advanced: "활용", deep: "심화" };
  const grid = document.getElementById("glossaryGrid");
  const countEl = document.getElementById("glossaryCount");
  const emptyEl = document.getElementById("glossaryEmpty");
  const searchInput = document.getElementById("glossarySearch");
  const filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  let activeFilter = "all";

  function renderGlossary() {
    if (!grid) return;
    const rawQuery = (searchInput ? searchInput.value : "").trim();
    const q = rawQuery.toLowerCase();
    const filtered = GLOSSARY.filter(function (item) {
      const catOk = activeFilter === "all" || item.cat === activeFilter;
      const haystack = (item.name + " " + item.en + " " + item.def).toLowerCase();
      const queryOk = !q || haystack.indexOf(q) !== -1;
      return catOk && queryOk;
    });

    grid.innerHTML = filtered.map(function (item) {
      return '<article class="term-card">' +
        '<div class="term-head">' +
          '<div><h3>' + item.name + '</h3><span class="term-en">' + item.en + '</span></div>' +
          '<span class="term-level ' + item.cat + '">' + CAT_LABEL[item.cat] + '</span>' +
        '</div>' +
        '<p>' + item.def + '</p>' +
      '</article>';
    }).join("");

    if (countEl) {
      countEl.textContent = "SHOWING " + filtered.length + " / " + GLOSSARY.length + " TERMS" + (rawQuery ? " · “" + rawQuery + "”" : "");
    }
    if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.getAttribute("data-filter") || "all";
      filterBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      renderGlossary();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", renderGlossary);
  }

  renderGlossary();

  /* ---------- Copy to clipboard ---------- */
  const toast = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("카카오톡 ID “" + text + "”가 복사되었습니다.");
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("카카오톡 ID “" + text + "”가 복사되었습니다.");
    } catch (e) {
      showToast("복사에 실패했습니다. ID: " + text);
    }
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy"));
    });
  });

  /* ---------- Footer year ---------- */
  // Kept static (2026) to match the published course edition.
})();
