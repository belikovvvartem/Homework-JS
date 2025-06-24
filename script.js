const taskData = {
  "2025-05-23": "https://codepen.io/pqendosf-the-decoder/embed/GgJRGER?default-tab=html%2Cresult",
  "2025-05-24": "https://codepen.io/pqendosf-the-decoder/embed/KwpKeyq?default-tab=js%2Cresult",
  "2025-05-26": "https://codepen.io/pqendosf-the-decoder/embed/vEOLBBe?default-tab=js%2Cresult",
  "2025-05-27": "https://codepen.io/pqendosf-the-decoder/embed/YPXwKZe?default-tab=js%2Cresult",
  "2025-06-01": "https://codepen.io/pqendosf-the-decoder/embed/gbpWJKJ?default-tab=js%2Cresult",
  "2025-06-02": "https://codepen.io/pqendosf-the-decoder/embed/wBadbbK?default-tab=js%2Cresult",
  "2025-06-03": "https://codepen.io/pqendosf-the-decoder/embed/RNPVzPX?default-tab=js%2Cresult",
  "2025-06-04": "https://codepen.io/pqendosf-the-decoder/embed/emNWwEK?default-tab=js%2Cresult",
  "2025-06-05": "https://codepen.io/pqendosf-the-decoder/embed/NPqjZzv?default-tab=js%2Cresult",
  "2025-06-12": "https://codepen.io/pqendosf-the-decoder/embed/QwbzGja?default-tab=js%2Cresult",
  "2025-06-12": "https://codepen.io/pqendosf-the-decoder/embed/WbvLoMy?default-tab=js%2Cresult"
};

const monthSelect = document.getElementById("monthSelect");
const calendar = document.getElementById("calendar");
const taskDisplay = document.getElementById("taskDisplay");
const filterBtn = document.getElementById("filterBtn");

let current = new Date();
let filterActive = false;

for (let i = 0; i < 12; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = new Date(2025, i).toLocaleString("uk-UA", {
    month: "long"
  });
  if (i === current.getMonth()) option.selected = true;
  monthSelect.appendChild(option);
}

function renderCalendar(month) {
  calendar.innerHTML = "";
  taskDisplay.innerHTML = "";

  const year = current.getFullYear();
  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const checkedTasks = JSON.parse(localStorage.getItem("checkedTasks") || "{}");

  for (let i = 1; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    cell.textContent = day;
    cell.classList.add("day");

    if (taskData[dateKey]) {
      cell.classList.add(checkedTasks[dateKey] ? "checked" : "task");
    }

    if (filterActive && !taskData[dateKey]) continue;

    if (today.getDate() === day && today.getMonth() === month) {
      cell.classList.add("active");
    }

    cell.addEventListener("click", () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
      cell.classList.add("active");
      showTask(dateKey);
    });

    calendar.appendChild(cell);
  }
}

function showTask(dateKey) {
  taskDisplay.innerHTML = "";

  const checked = JSON.parse(localStorage.getItem("checkedTasks") || "{}");
  const isChecked = checked[dateKey];

  if (taskData[dateKey]) {
    const iframe = document.createElement("iframe");
    iframe.src = taskData[dateKey];
    iframe.width = "100%";
    iframe.height = "300";
    iframe.allowFullscreen = true;
    taskDisplay.appendChild(iframe);

    if (!isChecked) {
      const btn = document.createElement("button");
      btn.textContent = "Позначити як перевірено";
      btn.addEventListener("click", () => {
        checked[dateKey] = true;
        localStorage.setItem("checkedTasks", JSON.stringify(checked));
        renderCalendar(parseInt(monthSelect.value));
        showTask(dateKey);
      });
      taskDisplay.appendChild(btn);
    }
  } else {
    const p = document.createElement("p");
    p.textContent = "На дану дату не задано домашнє завдання.";
    p.classList.add("no-task");
    taskDisplay.appendChild(p);
  }
}

monthSelect.addEventListener("change", () => {
  renderCalendar(parseInt(monthSelect.value));
});

filterBtn.addEventListener("click", () => {
  filterActive = !filterActive;
  filterBtn.textContent = filterActive
    ? "Показати всі дати"
    : "Виконані";
  renderCalendar(parseInt(monthSelect.value));
});

renderCalendar(current.getMonth());

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');

let mouseMoved = false;

const pointer = {
  x: .5 * window.innerWidth,
  y: .5 * window.innerHeight,
}
const params = {
  pointsNumber: 50,
  widthFactor: .30,
  mouseThreshold: .6,
  spring: .4,
  friction: .5
};

const trail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
  trail[i] = {
    x: pointer.x,
    y: pointer.y,
    dx: 0,
    dy: 0,
  }
}

window.addEventListener("click", e => {
  updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("mousemove", e => {
  mouseMoved = true;
  updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", e => {
  mouseMoved = true;
  updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(eX, eY) {
  pointer.x = eX;
  pointer.y = eY;
}

setupCanvas();
update(0);
window.addEventListener("resize", setupCanvas);


function update(t) {

  if (!mouseMoved) {
    pointer.x = (.5 + .3 * Math.cos(.002 * t) * (Math.sin(.005 * t))) * window.innerWidth;
    pointer.y = (.5 + .2 * (Math.cos(.005 * t)) + .1 * Math.cos(.01 * t)) * window.innerHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  trail.forEach((p, pIdx) => {
    const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
    const spring = pIdx === 0 ? .4 * params.spring : params.spring;
    p.dx += (prev.x - p.x) * spring;
    p.dy += (prev.y - p.y) * spring;
    p.dx *= params.friction;
    p.dy *= params.friction;
    p.x += p.dx;
    p.y += p.dy;
  });

  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);

  for (let i = 1; i < trail.length - 1; i++) {
    const xc = .5 * (trail[i].x + trail[i + 1].x);
    const yc = .5 * (trail[i].y + trail[i + 1].y);
    ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
    ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
    ctx.stroke();
    ctx.strokeStyle = "lime";
  }
  ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
  ctx.stroke();

  window.requestAnimationFrame(update);
}

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
