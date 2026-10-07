(() => {
  "use strict";

  const { exercises, days } = window.WORKOUT_DATA;
  const dayTabs = document.getElementById("dayTabs");
  const exerciseList = document.getElementById("exerciseList");
  const workoutHeader = document.querySelector(".workout-header");
  const restDay = document.getElementById("restDay");
  const dialog = document.getElementById("exerciseDialog");
  const dialogContent = document.getElementById("dialogContent");
  const timer = document.getElementById("timer");
  const timerValue = document.getElementById("timerValue");
  const todayIndex = (new Date().getDay() + 6) % 7;
  let selectedDay = todayIndex;
  let timerRemaining = 0;
  let timerHandle = null;
  let installPrompt = null;

  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - todayIndex);
  const weekKey = monday.toLocaleDateString("sv-SE");
  const storageKey = `dumbbell-ppl:${weekKey}`;

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  }

  let progress = loadProgress();

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  function renderTabs() {
    dayTabs.innerHTML = days.map((day, index) => `
      <button class="day-tab${index === selectedDay ? " active" : ""}${index === todayIndex ? " today" : ""}"
        type="button" role="tab" aria-selected="${index === selectedDay}" data-day="${index}">
        <span>${day.short}</span><strong>${day.type === "Rest Day" ? "Rest" : day.type}</strong>
      </button>`).join("");
  }

  function imageForCard(exercise) {
    return exercise.images.peak || exercise.images.main || exercise.images.start;
  }

  function setKey(dayIndex, exerciseId, setIndex) {
    return `${dayIndex}:${exerciseId}:${setIndex}`;
  }

  function renderWorkout() {
    const day = days[selectedDay];
    renderTabs();
    document.getElementById("workoutKicker").textContent = `Hari ${selectedDay + 1} · ${day.label}`;
    document.getElementById("workoutTitle").textContent = day.type;
    document.getElementById("workoutDescription").textContent = day.focus;

    const isRest = day.exercises.length === 0;
    workoutHeader.hidden = isRest;
    exerciseList.hidden = isRest;
    restDay.hidden = !isRest;

    if (isRest) return;

    exerciseList.innerHTML = day.exercises.map((id, index) => {
      const exercise = exercises[id];
      const setButtons = Array.from({ length: exercise.sets }, (_, setIndex) => {
        const done = Boolean(progress[setKey(selectedDay, id, setIndex)]);
        return `<button class="set-button${done ? " done" : ""}" type="button" data-exercise="${id}" data-set="${setIndex}" aria-label="Set ${setIndex + 1}${done ? " selesai" : ""}" aria-pressed="${done}">${done ? "✓" : setIndex + 1}</button>`;
      }).join("");

      return `<article class="exercise-card">
        <button class="exercise-image" type="button" data-detail="${id}" aria-label="Lihat panduan ${exercise.name}">
          <img src="${imageForCard(exercise)}" alt="Contoh gerakan ${exercise.name}" width="512" height="512" loading="lazy">
          <span class="pose-badge">Lihat gerakan</span>
        </button>
        <div class="exercise-info">
          <span class="exercise-number">GERAKAN ${String(index + 1).padStart(2, "0")}</span>
          <h3>${exercise.name}</h3>
          <p>${exercise.target}</p>
          <div class="exercise-meta">
            <span>${exercise.sets} set</span><span>${exercise.reps}</span>
            <button class="detail-button" type="button" data-detail="${id}">Panduan teknik</button>
          </div>
        </div>
        <div class="set-column">
          <span class="set-label">Tandai setiap set</span>
          <div class="set-buttons">${setButtons}</div>
          <button class="rest-button" type="button" data-rest="${exercise.rest}">Timer istirahat · ${exercise.rest} dtk</button>
        </div>
      </article>`;
    }).join("");

    updateProgress();
  }

  function updateProgress() {
    const ids = days[selectedDay].exercises;
    const total = ids.reduce((sum, id) => sum + exercises[id].sets, 0);
    const done = ids.reduce((sum, id) => sum + Array.from({ length: exercises[id].sets }, (_, index) => Boolean(progress[setKey(selectedDay, id, index)]))
      .filter(Boolean).length, 0);
    const percent = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("progressValue").textContent = `${percent}%`;
    document.getElementById("progressRing").style.setProperty("--progress", `${percent}%`);
  }

  function showDetails(id) {
    const exercise = exercises[id];
    const figures = exercise.images.main
      ? `<figure><img src="${exercise.images.main}" alt="Posisi ${exercise.name}"><figcaption>Posisi</figcaption></figure>`
      : `<figure><img src="${exercise.images.start}" alt="Posisi awal ${exercise.name}"><figcaption>Awal</figcaption></figure>
         <figure><img src="${exercise.images.peak}" alt="Posisi akhir ${exercise.name}"><figcaption>Akhir</figcaption></figure>`;
    dialogContent.innerHTML = `
      <div class="dialog-visuals${exercise.images.main ? " single" : ""}">${figures}</div>
      <div class="dialog-body">
        <p class="eyebrow">Panduan gerakan</p>
        <h2>${exercise.name}</h2>
        <p class="dialog-subtitle">${exercise.target} · ${exercise.sets} set · ${exercise.reps}</p>
        <div class="dialog-columns">
          <div><h3>Langkah</h3><ol>${exercise.instructions.map(item => `<li>${item}</li>`).join("")}</ol></div>
          <div><h3>Catatan teknik</h3><ul>${exercise.tips.map(item => `<li>${item}</li>`).join("")}</ul></div>
        </div>
      </div>`;
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeDialog() {
    dialog.close();
    document.body.style.overflow = "";
  }

  function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainder = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function stopTimer() {
    clearInterval(timerHandle);
    timerHandle = null;
    timer.hidden = true;
  }

  function startTimer(seconds) {
    clearInterval(timerHandle);
    timerRemaining = seconds;
    timerValue.textContent = formatTimer(timerRemaining);
    timer.hidden = false;
    timerHandle = setInterval(() => {
      timerRemaining -= 1;
      timerValue.textContent = formatTimer(Math.max(timerRemaining, 0));
      if (timerRemaining <= 0) {
        clearInterval(timerHandle);
        timerHandle = null;
        timerValue.textContent = "Selesai";
        if ("vibrate" in navigator) navigator.vibrate([120, 80, 120]);
      }
    }, 1000);
  }

  dayTabs.addEventListener("click", event => {
    const button = event.target.closest("[data-day]");
    if (!button) return;
    selectedDay = Number(button.dataset.day);
    renderWorkout();
  });

  exerciseList.addEventListener("click", event => {
    const detail = event.target.closest("[data-detail]");
    if (detail) return showDetails(detail.dataset.detail);

    const setButton = event.target.closest(".set-button");
    if (setButton) {
      const key = setKey(selectedDay, setButton.dataset.exercise, Number(setButton.dataset.set));
      progress[key] = !progress[key];
      if (!progress[key]) delete progress[key];
      saveProgress();
      renderWorkout();
      return;
    }

    const restButton = event.target.closest("[data-rest]");
    if (restButton) startTimer(Number(restButton.dataset.rest));
  });

  document.getElementById("dialogClose").addEventListener("click", closeDialog);
  dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener("close", () => { document.body.style.overflow = ""; });
  document.getElementById("timerStop").addEventListener("click", stopTimer);
  document.getElementById("timerAdd").addEventListener("click", () => {
    if (!timerHandle) startTimer(timerRemaining + 15);
    else {
      timerRemaining += 15;
      timerValue.textContent = formatTimer(timerRemaining);
    }
  });

  document.getElementById("jumpToday").addEventListener("click", () => {
    selectedDay = todayIndex;
    renderWorkout();
    document.getElementById("workout").scrollIntoView({ behavior: "smooth" });
  });

  const today = days[todayIndex];
  document.getElementById("todayName").textContent = today.type;
  document.getElementById("todayMeta").textContent = today.exercises.length ? `${today.exercises.length} gerakan · ${today.focus}` : today.focus;
  if (!today.exercises.length) document.getElementById("jumpToday").firstChild.textContent = "Lihat jadwal ";

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    document.getElementById("installButton").hidden = false;
  });

  document.getElementById("installButton").addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    document.getElementById("installButton").hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
  }

  renderWorkout();
})();
