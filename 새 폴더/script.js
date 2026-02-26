/* 1: HERO 스테이지 스케일 */
(function () {
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;
  const hero = document.getElementById("hero");
  const stage = document.getElementById("hero-stage");
  if (!hero || !stage) return;

  function layoutStage() {
    const rect = hero.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;

    const scale = Math.max(vw / DESIGN_W, vh / DESIGN_H);

    const scaledW = DESIGN_W * scale;
    const scaledH = DESIGN_H * scale;

    const offsetX = (vw - scaledW) / 2;
    const offsetY = (vh - scaledH) / 2;

    stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

    if (stage.style.visibility !== "visible") {
      stage.style.visibility = "visible";
    }
  }

  window.addEventListener("resize", layoutStage);
  window.addEventListener("load", layoutStage);

  (document.fonts?.ready || Promise.resolve()).then(() => {
    requestAnimationFrame(() => {
      layoutStage();
      requestAnimationFrame(layoutStage);
    });
  });

  ["paper", "person"].forEach((id) => {
    const img = document.getElementById(id);
    if (img) img.addEventListener("load", layoutStage);
  });

  setTimeout(layoutStage, 350);
  setTimeout(layoutStage, 800);
})();

/* 2: ABOUT 포지셔닝 (언어별 약간씩 조정) */
(function () {
  const ABOUT_W = 1920;
  const ABOUT_H = 1080;

  const POS_BY_LANG = {
    ko: {
      left: { x: 710, y: 220, w: 660 },
      skill: { x: 1360, y: 650, w: 520 },
      tool: { x: 1360, y: 760, w: 520 },
    },
    ja: {
      left: { x: 710, y: 220, w: 660 },
      skill: { x: 1360, y: 650, w: 520 },
      tool: { x: 1360, y: 760, w: 520 },
    },
    // 영어는 단어가 길어서 전체 폭을 조금 줄여서 사진과 안 겹치게 조정
    en: {
      left: { x: 640, y: 220, w: 580 },
      skill: { x: 1360, y: 650, w: 520 },
      tool: { x: 1360, y: 760, w: 520 },
    },
  };

  function getPos() {
    const lang = document.documentElement.getAttribute("lang") || "ko";
    return POS_BY_LANG[lang] || POS_BY_LANG.ko;
  }

  const section = document.getElementById("about");
  const left = document.getElementById("aboutLeft");
  const skill = document.getElementById("aboutSkill");
  const tool = document.getElementById("aboutTool");
  if (!section || !left || !skill || !tool) return;

  function layoutAbout() {
    const rect = section.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;

    const scale = Math.max(vw / ABOUT_W, vh / ABOUT_H);
    const imgW = ABOUT_W * scale;
    const imgH = ABOUT_H * scale;
    const offsetX = (vw - imgW) / 2;
    const offsetY = (vh - imgH) / 2;

    const POS = getPos();

    const place = (el, p) => {
      el.style.left = `${offsetX + p.x * scale}px`;
      el.style.top = `${offsetY + p.y * scale}px`;
      if (p.w) el.style.width = `${p.w * scale}px`;
    };

    place(left, POS.left);
    place(skill, POS.skill);
    place(tool, POS.tool);
  }

  window.addEventListener("load", layoutAbout);
  window.addEventListener("resize", layoutAbout);

  // 언어 변경 시 재배치할 수 있게 전역에 노출
  window.__layoutAbout = layoutAbout;
})();

/* 3: CAREER 스케일 */
(function () {
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;
  const section = document.getElementById("career");
  const stage = document.getElementById("career-stage");
  if (!section || !stage) return;

  function layoutCareer() {
    const rect = section.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;

    const scale = Math.max(vw / DESIGN_W, vh / DESIGN_H);
    const offsetX = (vw - DESIGN_W * scale) / 2;
    const offsetY = (vh - DESIGN_H * scale) / 2;

    stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  window.addEventListener("load", layoutCareer);
  window.addEventListener("resize", layoutCareer);
})();

/* 4: PROJECT 레이아웃 (리스트 섹션 스케일) */
(function () {
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;
  const PADDING_SCALE = 0.94;

  const section = document.getElementById("project");
  const stage = document.getElementById("project-stage");
  if (!section || !stage) return;

  function layout() {
    const rect = section.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;

    const scaleByW = vw / DESIGN_W;
    const scaleByH = vh / DESIGN_H;
    const s = Math.min(scaleByW, scaleByH) * PADDING_SCALE;

    const centeredX = (vw - DESIGN_W * s) / 2;
    const centeredY = (vh - DESIGN_H * s) / 2;
    const MIN_TOP = 80;
    const offsetX = Math.max(centeredX, 0);
    const offsetY = Math.max(centeredY, MIN_TOP);

    stage.style.transformOrigin = "0 0";
    stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${s})`;
  }

  window.addEventListener("load", layout);
  window.addEventListener("resize", layout);
})();

/* 5: 네비 높이 → CSS 변수 */
(function () {
  const nav = document.querySelector(".topnav");
  function applyNavH() {
    const h = nav ? Math.ceil(nav.getBoundingClientRect().height + 16) : 84;
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
  }
  window.addEventListener("load", applyNavH);
  window.addEventListener("resize", applyNavH);
})();

/* 6: 다국어 토글 (드롭다운: 한국어 / English / 日本語) */
(() => {
  const wrap = document.querySelector(".lang-toggle-wrap");
  const btn = document.getElementById("lang-toggle");
  const menu = document.getElementById("lang-menu");
  const currentLabel = document.getElementById("lang-current");
  if (!wrap || !btn || !menu || !currentLabel) return;

  let current = "ko";

  const baseTexts = {};

  const translations = {
    en: {
      // NAV
      "nav.profile": "Profile",
      "nav.about": "About",
      "nav.career": "Career",
      "nav.project": "Project",

      // HERO
      "hero.title":
        'I am a <span class="blue">front-end developer, Seyong Kim</span>.',
      "hero.subtitle":
        '<span class="blue">Thinking of the user</span>, I build <span class="blue">web experiences beyond simple actions</span>.',

      // ABOUT
      "about.title": "About Me",
      "about.nameLabel": "Name",
      "about.birthLabel": "Date of Birth",
      "about.genderLabel": "Gender",
      "about.eduLabel": "Education",
      "about.majorLabel": "Major",
      "about.expLabel": "Experience",
      "about.skillTitle": "SKILL",
      "about.toolTitle": "TOOL",
      "about.resumeBtn": "Download Resume",
      "about.contactPhone": "<b>Phone</b> : 010-4510-2196",
      "about.contactEmail": "<b>E-mail</b> : tpyd1226@naver.com",

      // About value
      "about.nameValue": "Seyong Kim",
      "about.birthValue": "2000.12.26 (Age 24)",
      "about.genderValue": "Male",
      "about.eduValue": "Osan University",
      "about.majorValue": "Computer Software",
      "about.expValue":
        "Leadership experience as club president / vice class representative",

      // CAREER
      "career.title": "Career",
      "career.term": "<b>Period :</b> Jun 2023 ~ Sep 2025",
      "career.mainTitle": "Main Tasks",
      "career.main1": "Internal ERP management and drafting approval documents",
      "career.main2": "Office supplies ordering and in/out management",
      "career.main3": "Supporting internal projects",
      "career.feTitle": "Related Tasks (Front-end)",
      "career.fe1": "Maintaining and managing internal website",
      "career.roleLabel": "Role",
      "career.cardRole": "Website maintenance",

      // PROJECT
      "project.title": "Project",
      "project.roleLabel": "Role",
      "project.card1.name": "GitHub",
      "project.card1.desc": "Website maintenance",
      "project.card2.name": "NKR Notice / Files Management",
      "project.card2.desc": "Improved notice/files management UI",
      "project.card3.name": "NKR Internal Request Form Redesign",
      "project.card3.desc": "Improved UX/UI for internal request form",
      "project.card4.name": "Portfolio",
      "project.card4.desc": "Personal portfolio site",
      "project.card5.name": "Coming Soon ~",
      "project.card5.desc": "Preparing additional projects",
      "project.viewDetail": "View details",
      "project.gotoSite": "Open site",

      // THANKS
      "thanks.title":
        'Thank you for <span class="blue">reading</span>.',
      "thanks.line1":
        'I am transitioning from a <span class="blue">different field</span> into <span class="blue">front-end development</span>.',
      "thanks.line2":
        'I aim to grow into a developer who <span class="blue">understands user experience</span>. Thank you for seeing my <span class="blue">direction and potential</span>.',

      // UI
      "ui.darkModeLabel": "Dark mode",
      "ui.single": "Single",
    },
    ja: {
      // NAV
      "nav.profile": "プロフィール",
      "nav.about": "自己紹介",
      "nav.career": "経歴",
      "nav.project": "プロジェクト",

      // HERO
      "hero.title":
        '<span class="blue">フロントエンド開発者 キム・セヨン</span>です。',
      "hero.subtitle":
        '<span class="blue">ユーザー</span>を<span class="blue">第一に考え</span>、単純な動作を超える<span class="blue">Webを作る開発者</span>です。',

      // ABOUT
      "about.title": "自己紹介",
      "about.nameLabel": "名前",
      "about.birthLabel": "生年月日",
      "about.genderLabel": "性別",
      "about.eduLabel": "学歴",
      "about.majorLabel": "専攻",
      "about.expLabel": "経験",
      "about.skillTitle": "スキル",
      "about.toolTitle": "ツール",
      "about.resumeBtn": "履歴書ダウンロード",
      "about.contactPhone": "<b>電話</b> : 010-4510-2196",
      "about.contactEmail": "<b>メール</b> : tpyd1226@naver.com",

      // About value
      "about.nameValue": "キム・セヨン",
      "about.birthValue": "2000.12.26（満24歳）",
      "about.genderValue": "男",
      "about.eduValue": "オサン大学校",
      "about.majorValue": "コンピュータソフトウェア学科",
      "about.expValue": "学会長 / 副クラス長などのリーダー経験",

      // CAREER
      "career.title": "経歴",
      "career.term": "<b>期間 :</b> 2023.06 ~ 2025.09",
      "career.mainTitle": "主な業務",
      "career.main1": "社内ERP管理および決裁書作成",
      "career.main2": "備品発注および入出庫管理",
      "career.main3": "社内プロジェクト支援業務",
      "career.feTitle": "関連業務（フロントエンド）",
      "career.fe1": "社内ホームページの運用・保守",
      "career.roleLabel": "役割",
      "career.cardRole": "ホームページ保守",

      // PROJECT
      "project.title": "プロジェクト",
      "project.roleLabel": "役割",
      "project.card1.name": "GitHub",
      "project.card1.desc": "ホームページ保守",
      "project.card2.name": "NKR お知らせ/資料 管理改善",
      "project.card2.desc": "お知らせ/資料管理画面のUI改善",
      "project.card3.name": "NKR 社内リクエストフォーム UI再設計",
      "project.card3.desc": "リクエストフォームのUX/UI改善",
      "project.card4.name": "Portfolio",
      "project.card4.desc": "個人ポートフォリオサイト制作",
      "project.card5.name": "Coming Soon ~",
      "project.card5.desc": "追加プロジェクト準備中",
      "project.viewDetail": "詳細を見る",
      "project.gotoSite": "サイトへ移動",

      // THANKS
      "thanks.title":
        'ご覧いただき<span class="blue">ありがとうございます。</span>',
      "thanks.line1":
        '<span class="blue">別の職種</span>から<span class="blue">フロントエンド</span>へ転向する過程で、',
      "thanks.line2":
        '<span class="blue">ユーザー体験</span>を<span class="blue">理解する開発者</span>として成長したいと考えています。私の<span class="blue">方向性と可能性</span>を見てくださり、<span class="blue">ありがとうございます。</span>',

      // UI
      "ui.darkModeLabel": "ダークモード",
      "ui.single": "シングル",
    },
  };

  function getLabel(lang) {
    if (lang === "ko") return "한국어";
    if (lang === "en") return "English";
    if (lang === "ja") return "日本語";
    return lang;
  }

  function applyLang(lang) {
    current = lang;
    document.documentElement.setAttribute("lang", lang);

    document.body.classList.remove("lang-ko", "lang-en", "lang-ja");
    document.body.classList.add(`lang-${lang}`);

    const nodes = document.querySelectorAll("[data-i18n]");

    nodes.forEach((el) => {
      const key = el.dataset.i18n;
      if (!key) return;

      // 처음 보는 key면 현재 내용을 기본 텍스트로 저장
      if (!baseTexts[key]) {
        baseTexts[key] = el.innerHTML;
      }

      if (lang === "ko") {
        el.innerHTML = baseTexts[key];
        return;
      }

      const dict = translations[lang] || {};
      if (dict[key]) {
        el.innerHTML = dict[key];
      } else {
        // 번역 없으면 기본(한국어)로
        el.innerHTML = baseTexts[key];
      }
    });

    currentLabel.textContent = getLabel(lang);

    // About 섹션 위치 재계산
    if (typeof window.__layoutAbout === "function") {
      window.__layoutAbout();
    }
  }

  function openMenu() {
    wrap.classList.add("is-open");
  }
  function closeMenu() {
    wrap.classList.remove("is-open");
  }
  function toggleMenu() {
    wrap.classList.toggle("is-open");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  menu.querySelectorAll("button[data-lang]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const lang = item.dataset.lang;
      if (!lang) return;
      applyLang(lang);
      closeMenu();
    });
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      closeMenu();
    }
  });

  // 다른 스크립트에서 다시 적용할 수 있게 전역에 노출
  window.__applyLang = applyLang;

  // 초기: 한국어
  applyLang("ko");
})();

/* 7: HERO 타이핑 */
(() => {
  const copy = document.getElementById("copy");
  if (!copy) return;

  const head = copy.querySelector("h1");
  const para = copy.querySelector("p");
  if (!head || !para) return;

  function getSegments(el) {
    const segs = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) segs.push({ text: n.textContent, className: "" });
      else if (n.nodeType === 1) {
        const cls = n.classList?.contains("blue") ? "blue" : "";
        segs.push({ text: n.textContent, className: cls });
      }
    });
    return segs;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const makeCaret = (small) => {
    const c = document.createElement("span");
    c.className = "caret" + (small ? " small" : "");
    return c;
  };

  async function typeSegmented(el, segs, speed, caretEl) {
    const frag = document.createDocumentFragment();
    const textNodes = segs.map((seg) => {
      const span = document.createElement("span");
      if (seg.className) span.className = seg.className;
      const tn = document.createTextNode("");
      span.appendChild(tn);
      frag.appendChild(span);
      return tn;
    });
    frag.appendChild(caretEl);
    el.replaceChildren();
    el.appendChild(frag);

    for (let i = 0; i < segs.length; i++) {
      const text = segs[i].text ?? "";
      const tn = textNodes[i];
      for (const ch of text) {
        tn.nodeValue += ch;
        await sleep(speed);
        if (/[.,!?…]/.test(ch)) await sleep(Math.round(speed * 3));
      }
    }
    caretEl.remove();
  }

  const hSegs = getSegments(head);
  const pSegs = getSegments(para);
  copy.classList.add("is-typing");
  head.replaceChildren();
  para.replaceChildren();

  (async () => {
    await sleep(120);
    await typeSegmented(head, hSegs, 75, makeCaret(false));
    await sleep(250);
    await typeSegmented(para, pSegs, 55, makeCaret(true));
    para.appendChild(makeCaret(true));
  })();
})();

/* 8: 풀페이지 슬라이드 + 해시 연동 (오버레이 열림 시 잠금) */
(() => {
  const panels = Array.from(document.querySelectorAll(".page"));
  if (!panels.length) return;

  const DURATION = 500;
  const EASE = "cubic-bezier(.22,.61,.36,1)";
  let index = 0;
  let locked = false;

  const idToIndex = {};
  panels.forEach((p, i) => {
    if (p.id) idToIndex[p.id] = i;
  });

  const isOverlayOpen = () => !!window.__projectViewerOpen;

  function setActiveNav(targetIndex = index) {
    const links = document.querySelectorAll("#main-nav a[data-target]");
    const currentId = panels[targetIndex]?.id;
    links.forEach((a) =>
      a.classList.toggle("active", a.dataset.target === currentId)
    );
  }

  function setActiveClass(targetIndex = index) {
    panels.forEach((p, i) =>
      p.classList.toggle("is-active", i === targetIndex)
    );
  }

  function applyBaseState(target) {
    panels.forEach((p, i) => {
      p.style.transition = "none";
      if (i < target) {
        p.style.transform = "translateY(0)";
        p.style.visibility = "visible";
        p.style.zIndex = 5;
      } else if (i === target) {
        p.style.transform = "translateY(0)";
        p.style.visibility = "visible";
        p.style.zIndex = 10;
      } else {
        p.style.transform = "translateY(100vh)";
        p.style.visibility = "hidden";
        p.style.zIndex = 0;
      }
    });

    index = target;
    setActiveNav(target);
    setActiveClass(target);

    const currentId = panels[target] && panels[target].id;
    if (currentId) {
      if (history.replaceState) history.replaceState(null, "", "#" + currentId);
      else window.location.hash = "#" + currentId;
    }

    void document.body.offsetHeight;
    panels.forEach((p) => {
      p.style.transition = `transform ${DURATION}ms ${EASE}`;
    });
  }

  function getInitialIndex() {
    return 0;
  }

  window.history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  applyBaseState(getInitialIndex());

  function go(target) {
    if (locked) return;
    if (target < 0 || target >= panels.length) return;
    if (target === index) return;

    const diff = target - index;

    if (Math.abs(diff) > 1) {
      applyBaseState(target);
      return;
    }

    setActiveNav(target);
    setActiveClass(target);
    locked = true;

    if (diff === 1) {
      const current = panels[index];
      const next = panels[index + 1];

      current.style.transition = "none";
      current.style.transform = "translateY(0)";
      current.style.visibility = "visible";
      current.style.zIndex = 10;

      next.style.transition = "none";
      next.style.transform = "translateY(100vh)";
      next.style.visibility = "visible";
      next.style.zIndex = 11;

      void document.body.offsetHeight;

      next.style.transition = `transform ${DURATION}ms ${EASE}`;
      next.style.transform = "translateY(0)";

      setTimeout(() => {
        applyBaseState(index + 1);
        locked = false;
      }, DURATION);
    } else if (diff === -1) {
      const current = panels[index];
      const prev = panels[index - 1];

      prev.style.transition = "none";
      prev.style.transform = "translateY(0)";
      prev.style.visibility = "visible";
      prev.style.zIndex = 5;

      void document.body.offsetHeight;

      current.style.transition = `transform ${DURATION}ms ${EASE}`;
      current.style.zIndex = 10;
      current.style.transform = "translateY(100vh)";

      setTimeout(() => {
        applyBaseState(index - 1);
        locked = false;
      }, DURATION);
    }
  }

  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // 휠
  window.addEventListener(
    "wheel",
    (e) => {
      const delta = e.deltaY || e.deltaX || 0;
      if (!delta) return;

      if (isOverlayOpen()) {
        const strip = window.__projectStripEl;
        if (!strip) return;

        e.preventDefault();
        e.stopPropagation();

        strip.scrollLeft += delta;
        return;
      }

      if (locked) return;
      if (Math.abs(delta) < 25) return;

      e.preventDefault();
      if (delta > 0) next();
      else prev();
    },
    { passive: false }
  );

  // 터치
  let touchStartY = null;
  window.addEventListener(
    "touchstart",
    (e) => {
      if (isOverlayOpen()) return;
      if (e.touches.length === 1) touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (e) => {
      if (touchStartY == null || locked || isOverlayOpen()) return;
      const diff = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diff) > 40) {
        if (diff < 0) next();
        else prev();
      }
      touchStartY = null;
    },
    { passive: true }
  );

  // 키보드
  window.addEventListener("keydown", (e) => {
    if (locked || isOverlayOpen()) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(panels.length - 1);
    }
  });

  // 아래 화살표 버튼
  document.querySelectorAll('.scroll-down[href^="#"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (locked) return;
      const id = btn.getAttribute("href").slice(1);
      const targetIndex = idToIndex[id];
      if (typeof targetIndex === "number") go(targetIndex);
      else next();
    });
  });

  // 상단 네비
  document.querySelectorAll("#main-nav a[data-target]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.dataset.target;
      if (!id) return;
      const targetIndex = idToIndex[id];
      if (typeof targetIndex !== "number") return;
      e.preventDefault();
      go(targetIndex);
    });
  });

  // 해시 직접 변경
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    const targetIndex = idToIndex[hash];
    if (typeof targetIndex === "number" && targetIndex !== index && !locked) {
      go(targetIndex);
    }
  });
})();

/* 9: Project 풀스크린 뷰어 */
(() => {
  const cards = Array.from(document.querySelectorAll("#project .proj-card"));
  if (!cards.length) return;

  const slides = cards.map((card, i) => {
    const thumb = card.querySelector(".proj-thumb");
    const name = card.querySelector(".proj-name")?.textContent.trim() || "";
    return {
      title: card.dataset.title || name || `Project ${i + 1}`,
      name,
      type:
        card.dataset.type ||
        card.querySelector(".pill-s")?.textContent.trim() ||
        "",
      desc:
        card.dataset.desc ||
        card.querySelector(".proj-desc")?.textContent.trim() ||
        "",
      role: card.dataset.role || "",
      tech: card.dataset.tech || "",
      img: thumb ? thumb.src : "",
      site: card.dataset.site || card.dataset.link || card.dataset.url || "",
    };
  });

  let overlay = document.querySelector(".proj-full-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "proj-full-overlay";
    overlay.innerHTML = `
      <div class="proj-full-inner">
        <!-- 라이트 모드 기본 팝업 배경 -->
        <img src="img/Project-팝업.png" alt="" class="proj-popup-bg" />

        <div class="proj-frame">
          <!-- 왼쪽 노트북 화면 -->
          <div class="proj-main-screen">
            <button class="proj-main-nav prev" aria-label="이전">‹</button>
            <img class="proj-main-image" src="" alt="Project 이미지" />
            <button class="proj-main-nav next" aria-label="다음">›</button>
          </div>

          <!-- 아래 썸네일 스트립 -->
          <div class="proj-strip"><div class="proj-strip-track"></div></div>

          <!-- 오른쪽 아이폰 영역 -->
          <div class="proj-side">
            <div class="proj-side-frame">
              <div class="proj-side-inner">
                <h3 class="proj-side-title"></h3>
                <p class="proj-side-type"></p>
                <p class="proj-side-desc"></p>
                <p class="proj-side-role"></p>
                <div class="proj-side-tech"></div>
              </div>

              <!-- 아이폰 하단 GitHub 버튼 (라이트 기본) -->
              <a class="proj-github-link" target="_blank" rel="noopener" aria-label="GitHub 열기">
                <img src="img/Project-깃허브.png" alt="GitHub" />
              </a>
            </div>
          </div>
        </div>

        <button class="proj-full-close" aria-label="닫기">×</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const mainImg = overlay.querySelector(".proj-main-image");
  const prevBtn = overlay.querySelector(".proj-main-nav.prev");
  const nextBtn = overlay.querySelector(".proj-main-nav.next");
  const strip = overlay.querySelector(".proj-strip");
  const stripTrack = overlay.querySelector(".proj-strip-track");
  const titleEl = overlay.querySelector(".proj-side-title");
  const typeEl = overlay.querySelector(".proj-side-type");
  const descEl = overlay.querySelector(".proj-side-desc");
  const roleEl = overlay.querySelector(".proj-side-role");
  const techWrap = overlay.querySelector(".proj-side-tech");
  const githubA = overlay.querySelector(".proj-github-link");
  const sideInner = overlay.querySelector(".proj-side-inner");
  const closeBtn = overlay.querySelector(".proj-full-close");

  let active = 0;

  const thumbs = slides.map((slide, idx) => {
    const btn = document.createElement("button");
    btn.className = "proj-strip-thumb";

    if (slide.img) {
      const img = document.createElement("img");
      img.src = slide.img;
      img.alt = slide.name || slide.title || `Project ${idx + 1}`;
      img.draggable = false;
      btn.appendChild(img);
    } else {
      btn.textContent = idx + 1;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setSlide(idx, false);
    });

    stripTrack.appendChild(btn);
    return btn;
  });

  window.__projectStripEl = strip;

  overlay.addEventListener(
    "wheel",
    (e) => {
      if (!overlay.classList.contains("is-open")) return;

      if (sideInner && sideInner.contains(e.target)) {
        const el = sideInner;
        const atTop = el.scrollTop <= 0;
        const atBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          return;
        }
      }

      const deltaY = e.deltaY;
      if (Math.abs(deltaY) < 20) return;

      e.preventDefault();
      e.stopPropagation();

      if (deltaY > 0) {
        setSlide(active + 1, false);
      } else {
        setSlide(active - 1, false);
      }
    },
    { passive: false }
  );

  function updateDetail(index) {
    const s = slides[index];
    if (!s) return;

    if (sideInner) sideInner.scrollTop = 0;

    titleEl.textContent = s.title || s.name || "Project";
    typeEl.textContent = s.type || "";
    descEl.textContent = s.desc || "";
    roleEl.textContent = s.role ? `역할: ${s.role}` : "";

    techWrap.innerHTML = "";
    if (s.tech) {
      s.tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => {
          const span = document.createElement("span");
          span.textContent = t;
          techWrap.appendChild(span);
        });
    }

    if (githubA) {
      if (s.site) {
        githubA.href = s.site;
        githubA.classList.remove("is-disabled");
        githubA.style.pointerEvents = "auto";
      } else {
        githubA.removeAttribute("href");
        githubA.classList.add("is-disabled");
        githubA.style.pointerEvents = "none";
      }
    }
  }

  function setSlide(index, alsoUpdateDetail = false) {
    if (!slides.length) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    active = index;

    const s = slides[index];
    if (!s) return;

    if (s.img) {
      mainImg.src = s.img;
      mainImg.style.display = "block";
    } else {
      mainImg.removeAttribute("src");
      mainImg.style.display = "none";
    }
    mainImg.alt = s.title || s.name || "Project 이미지";

    thumbs.forEach((th, i) => th.classList.toggle("is-active", i === index));

    const t = thumbs[index];
    if (t && strip) {
      const sRect = strip.getBoundingClientRect();
      const tRect = t.getBoundingClientRect();
      if (tRect.left < sRect.left || tRect.right > sRect.right) {
        const delta = tRect.left - sRect.left - sRect.width * 0.25;
        strip.scrollLeft += delta;
      }
    }

    if (alsoUpdateDetail) {
      updateDetail(index);
    }
  }

  function open(index) {
    window.__projectViewerOpen = true;
    document.body.classList.add("proj-view-open");
    overlay.classList.add("is-open");
    setSlide(index, true);
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("proj-view-open");
    window.__projectViewerOpen = false;
  }

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setSlide(active - 1, false);
  });
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setSlide(active + 1, false);
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  window.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSlide(active - 1, false);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSlide(active + 1, false);
    }
  });

  cards.forEach((card, index) => {
    const layer = document.createElement("div");
    layer.className = "proj-hover-layer";

    const detailBtn = document.createElement("button");
    detailBtn.type = "button";
    detailBtn.className = "proj-hover-btn proj-hover-detail";
    detailBtn.setAttribute("data-i18n", "project.viewDetail");
    detailBtn.textContent = "자세히 보기";

    const siteBtn = document.createElement("a");
    siteBtn.className = "proj-hover-btn proj-hover-site";
    siteBtn.setAttribute("data-i18n", "project.gotoSite");
    siteBtn.textContent = "사이트 바로가기";

    const url =
      card.dataset.site || card.dataset.link || card.dataset.url || "";
    if (url) {
      siteBtn.href = url;
      siteBtn.target = "_blank";
      siteBtn.rel = "noopener noreferrer";
    } else {
      siteBtn.classList.add("is-disabled");
    }

    layer.appendChild(detailBtn);
    layer.appendChild(siteBtn);
    card.appendChild(layer);

    detailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      open(index);
    });

    siteBtn.addEventListener("click", (e) => {
      if (!url) e.preventDefault();
      else e.stopPropagation();
    });
  });

  // 프로젝트 오버레이용 요소들을 만든 뒤 현재 언어 한 번 더 적용
  if (typeof window.__applyLang === "function") {
    const lang = document.documentElement.getAttribute("lang") || "ko";
    window.__applyLang(lang);
  }
})();

/* 10: THANKS 타이핑 */
(() => {
  const section = document.getElementById("thanks");
  const wrap = document.getElementById("thanks-copy");
  if (!section || !wrap) return;

  const title = wrap.querySelector("h2");
  const lines = Array.from(wrap.querySelectorAll("p"));
  if (!title || !lines.length) return;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const getSegments = (el) => {
    const segs = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        const t = n.textContent;
        if (t && t.trim() !== "") segs.push({ text: t, className: "" });
      } else if (n.nodeType === 1) {
        const cls = n.classList?.contains("blue") ? "blue" : "";
        const t = n.textContent;
        if (t && t.trim() !== "") segs.push({ text: t, className: cls });
      }
    });
    return segs;
  };

  const makeCaret = (small) => {
    const c = document.createElement("span");
    c.className = "caret" + (small ? " small" : "");
    return c;
  };

  async function typeSegmented(el, segs, speed, caret) {
    const frag = document.createDocumentFragment();
    const textNodes = segs.map((seg) => {
      const span = document.createElement("span");
      if (seg.className) span.className = seg.className;
      const tn = document.createTextNode("");
      span.appendChild(tn);
      frag.appendChild(span);
      return tn;
    });
    frag.appendChild(caret);

    el.replaceChildren();
    el.appendChild(frag);
    for (let i = 0; i < segs.length; i++) {
      const text = segs[i].text || "";
      const tn = textNodes[i];
      for (const ch of text) {
        tn.nodeValue += ch;
        await sleep(speed);
        if (/[.,!?…]/.test(ch)) await sleep(speed * 3);
      }
    }
    caret.remove();
  }

  const titleSegs = getSegments(title);
  const lineSegs = lines.map(getSegments);

  wrap.classList.add("is-typing");
  title.replaceChildren();
  lines.forEach((p) => p.replaceChildren());

  let played = false;
  async function play() {
    if (played) return;
    played = true;
    await sleep(200);
    await typeSegmented(title, titleSegs, 70, makeCaret(false));
    await sleep(200);
    for (let i = 0; i < lines.length; i++) {
      const caret = makeCaret(true);
      await typeSegmented(lines[i], lineSegs[i], 40, caret);
      await sleep(80);
    }
    const last = lines[lines.length - 1];
    if (last) last.appendChild(makeCaret(true));
  }

  function checkActive() {
    if (!played && section.classList.contains("is-active")) play();
  }

  window.addEventListener("load", checkActive);
  new MutationObserver(checkActive).observe(section, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();

/* 11: 라이트/다크 모드 토글 + 배경 / 아이콘 이미지 스위칭
   - 항상 라이트로 시작 (localStorage 사용 안 함) */
(() => {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const els = {
    hero: document.getElementById("paper"),
    about: document.getElementById("about-bg"),
    career: document.getElementById("career-bg"),
    project: document.getElementById("project-bg"),
    thanks: document.querySelector(".thanks-bg"),
    popupBg: document.querySelector(".proj-popup-bg"),
    popupGithub: document.querySelector(".proj-github-link img"),
  };

  const lightSrc = {
    hero: els.hero?.getAttribute("src") || "",
    about: els.about?.getAttribute("src") || "",
    career: els.career?.getAttribute("src") || "",
    project: els.project?.getAttribute("src") || "",
    thanks: els.thanks?.getAttribute("src") || "",
    popup: els.popupBg?.getAttribute("src") || "",
    popupGithub: els.popupGithub?.getAttribute("src") || "",
  };

  const darkSrc = {
    hero: "black img/1-PAGE.png",
    about: "black img/2-PAGE.png",
    career: "black img/3-PAGE.png",
    project: "black img/4-PAGE.png",
    thanks: "black img/5-PAGE.png",
    popup: "black img/Project 팝업.png",
    popupGithub: "black img/Project-깃허브.png",
  };

  const skillImgs = document.querySelectorAll("#aboutSkill .icon-row img");
  const toolImgs = document.querySelectorAll("#aboutTool .icon-row img");

  const skillLight = Array.from(
    skillImgs,
    (img) => img.getAttribute("src") || ""
  );
  const toolLight = Array.from(toolImgs, (img) => img.getAttribute("src") || "");

  const skillDark = [
    "black icon/1.png",
    "black icon/2.png",
    "black icon/3.png",
    "black icon/4.png",
  ];
  const toolDark = [
    "black icon/5.png",
    "black icon/6.png",
    "black icon/7.png",
    "black icon/8.png",
  ];

  function applyTheme(isDark) {
    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);
    btn.classList.toggle("is-on", isDark);

    const srcSet = isDark ? darkSrc : lightSrc;

    if (els.hero && srcSet.hero) els.hero.src = srcSet.hero;
    if (els.about && srcSet.about) els.about.src = srcSet.about;
    if (els.career && srcSet.career) els.career.src = srcSet.career;
    if (els.project && srcSet.project) els.project.src = srcSet.project;
    if (els.thanks && srcSet.thanks) els.thanks.src = srcSet.thanks;

    if (els.popupBg && srcSet.popup) els.popupBg.src = srcSet.popup;
    if (els.popupGithub && srcSet.popupGithub)
      els.popupGithub.src = srcSet.popupGithub;

    const sSet = isDark ? skillDark : skillLight;
    const tSet = isDark ? toolDark : toolLight;

    skillImgs.forEach((img, i) => {
      if (sSet[i]) img.src = sSet[i];
    });
    toolImgs.forEach((img, i) => {
      if (tSet[i]) img.src = tSet[i];
    });
  }

  let isDark = false;
  applyTheme(isDark);

  btn.addEventListener("click", () => {
    isDark = !isDark;
    applyTheme(isDark);
  });
})();
