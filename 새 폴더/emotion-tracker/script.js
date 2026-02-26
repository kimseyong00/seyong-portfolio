// 🌙 포트폴리오 메인에서 전달된 theme 파라미터만 인식
const params = new URLSearchParams(window.location.search);
const theme = params.get("theme");

document.body.classList.remove("dark"); // 항상 초기화

if (theme === "dark") {
  document.body.classList.add("dark");
}


  // ==== 엘리먼트 ====
  const $ = (s) => document.querySelector(s);
  const buttons      = document.querySelectorAll(".mood-btn");
  const inputSection = $("#inputSection");
  const reasonInput  = $("#reasonInput");
  const saveBtn      = $("#saveMood");
  const moodLog      = $("#moodLog");
  const deleteRecent = $("#deleteRecent");
  const deleteAll    = $("#deleteAll");
  const undoDelete   = $("#undoDelete");
  const rangeSelect  = $("#rangeSelect");        // 있을 수도/없을 수도 있음
  const summary      = document.getElementById("summary"); // 있으면 요약 카드 갱신

  // ==== 상태 ====
  let selectedMood  = "";
  let moodHistory   = JSON.parse(localStorage.getItem("moodHistory") || "[]");
  let deletedBackup = [];

  // ==== 차트 (있을 때만 생성) ====
  const ctx1 = document.getElementById("moodChart")?.getContext("2d");
  const ctx2 = document.getElementById("timelineChart")?.getContext("2d");

  const moodChart = ctx1 ? new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["😊 행복", "😐 보통", "😔 우울", "😡 화남"],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ["#FFD166", "#73C2FB", "#A29BFE", "#FF6B6B"],
        borderColor: "#fff",
        borderWidth: 2
      }]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: "#111" } } } }
  }) : null;

  const timelineChart = ctx2 ? new Chart(ctx2, {
    type: "line",
    data: { labels: [], datasets: [{
      label: "감정 변화",
      data: [],
      borderColor: "#00aaff",
      backgroundColor: "rgba(0,170,255,0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7
    }]},
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#111", autoSkip: true, maxRotation: 45, minRotation: 45 } },
        y: {
          min: 0, max: 4,
          ticks: { stepSize: 1, color: "#111", callback: v => ["","😡","😔","😐","😊"][v] }
        }
      },
      plugins: { legend: { display: false } }
    }
  }) : null;

  // ==== 유틸 ====
  const saveStore = () =>
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));

  const toYMD = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getRange = (type) => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let start = new Date(end);
    if (type === "week") {
      const offset = end.getDay() === 0 ? 6 : end.getDay() - 1;
      start.setDate(end.getDate() - offset);
    } else if (type === "month") {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else {
      return { start: null, end: null };
    }
    return { start, end };
  };

  const getFiltered = () => {
    if (!rangeSelect) return moodHistory;
    const t = rangeSelect.value || "all";
    const { start, end } = getRange(t);
    if (!start || !end) return moodHistory;
    const s = toYMD(start), e = toYMD(end);
    return moodHistory.filter(x => x.date >= s && x.date <= e);
  };

  // ==== 렌더 ====
  function renderLogs() {
    if (!moodLog) return;
    const data = getFiltered();
    moodLog.innerHTML = "";
    data.forEach(entry => {
      const div = document.createElement("div");
      div.className = "log-item";
      div.innerHTML = `
        <span class="emoji">${entry.mood}</span>
        <div class="log-text">
          <p class="reason">${entry.reason}</p>
          <p class="date">${entry.time}</p>
        </div>`;
      moodLog.prepend(div);
    });
  }

  function updateCharts() {
    const data = getFiltered();
    if (moodChart) {
      const counts = { "😊":0, "😐":0, "😔":0, "😡":0 };
      data.forEach(e => counts[e.mood]++);
      moodChart.data.datasets[0].data = Object.values(counts);
      moodChart.update();
    }
    if (timelineChart) {
      timelineChart.data.labels = data.map(e => e.date);
      timelineChart.data.datasets[0].data = data.map(e => ({ "😡":1, "😔":2, "😐":3, "😊":4 }[e.mood]));
      timelineChart.update();
    }
  }

  function updateSummary() {
    if (!summary) return; // 요약 카드가 없는 구조면 무시
    if (!moodHistory.length) {
      summary.innerHTML = `<p>오늘의 감정이 아직 기록되지 않았어요 🙂</p>`;
      summary.style.background = "linear-gradient(135deg, #73c2fb, #a29bfe)";
      return;
    }
    const latest = moodHistory[moodHistory.length - 1];
    const msg = {
      "😊": "오늘은 😊 행복한 날이에요!",
      "😐": "오늘은 😐 평온한 하루였어요.",
      "😔": "오늘은 😔 조금 우울한 하루였어요.",
      "😡": "오늘은 😡 화가 난 하루였어요."
    };
    summary.innerHTML = `<p class="main-msg">${msg[latest.mood]} <span class="date">(${latest.date})</span></p>`;
    const gradient = {
      "😊": "linear-gradient(135deg, #FFD166, #FFB347)",
      "😐": "linear-gradient(135deg, #73C2FB, #A2D2FF)",
      "😔": "linear-gradient(135deg, #A29BFE, #B983FF)",
      "😡": "linear-gradient(135deg, #FF6B6B, #FF8C69)"
    };
    summary.style.background = gradient[latest.mood];
    summary.style.color = "#fff";
    summary.style.borderRadius = "14px";
    summary.style.padding = "1.2rem 1.4rem";
  }

  function renderAll() {
    renderLogs();
    updateCharts();
    updateSummary();
    saveStore();
  }

  // ==== 이벤트 ====
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMood = btn.dataset.mood;
      if (inputSection) inputSection.style.display = "block";
      reasonInput?.focus();
    });
  });

  saveBtn?.addEventListener("click", () => {
    const reason = reasonInput.value.trim();
    if (!selectedMood) return alert("감정을 선택하세요!");
    if (!reason) return alert("감정의 이유를 입력해주세요!");
    const now = new Date();
    moodHistory.push({
      mood: selectedMood,
      reason,
      time: now.toLocaleString(),
      date: now.toISOString().split("T")[0]
    });
    reasonInput.value = "";
    if (inputSection) inputSection.style.display = "none";
    renderAll();
  });

  deleteRecent?.addEventListener("click", () => {
    if (moodHistory.length === 0) return alert("삭제할 기록이 없습니다.");
    if (!confirm("가장 최근 기록을 삭제할까요?")) return;
    const removed = moodHistory.pop();
    deletedBackup = [removed];
    renderAll();
    if (undoDelete) {
      undoDelete.style.display = "inline-block";
      setTimeout(() => (undoDelete.style.display = "none"), 5000);
    }
  });

  deleteAll?.addEventListener("click", () => {
    if (moodHistory.length === 0) return alert("삭제할 기록이 없습니다.");
    if (!confirm("정말 전체 삭제할까요?")) return;
    deletedBackup = [...moodHistory];
    moodHistory = [];
    renderAll();
    if (undoDelete) {
      undoDelete.style.display = "inline-block";
      setTimeout(() => (undoDelete.style.display = "none"), 5000);
    }
  });

  undoDelete?.addEventListener("click", () => {
    if (!deletedBackup.length) return;
    moodHistory = moodHistory.concat(deletedBackup);
    deletedBackup = [];
    renderAll();
    if (undoDelete) undoDelete.style.display = "none";
    alert("삭제된 기록을 복원했습니다!");
  });

  rangeSelect?.addEventListener("change", renderAll);

  // 다크모드 시 차트 글자색 동기화
  const observer = new MutationObserver(() => {
    const color = document.body.classList.contains("dark") ? "#fff" : "#111";
    if (moodChart) {
      moodChart.options.plugins.legend.labels.color = color;
      moodChart.update();
    }
    if (timelineChart) {
      timelineChart.options.scales.x.ticks.color = color;
      timelineChart.options.scales.y.ticks.color = color;
      timelineChart.update();
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // 첫 렌더
  renderAll();
