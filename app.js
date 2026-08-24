(function () {
  "use strict";

  var DICE = [20, 12, 10, 8, 6, 4, 2];
  var selectedDie = 20;
  var selectedCount = 1;

  var dieRow = document.getElementById("dieRow");
  var countSlider = document.getElementById("countSlider");
  var countValue = document.getElementById("countValue");
  var rollBtn = document.getElementById("rollBtn");
  var resultScroll = document.getElementById("resultScroll");

  var openDrawerBtn = document.getElementById("openDrawer");
  var closeDrawerBtn = document.getElementById("closeDrawer");
  var drawer = document.getElementById("drawer");
  var drawerBackdrop = document.getElementById("drawerBackdrop");
  var charList = document.getElementById("charList");

  var screens = {
    dice: document.getElementById("screen-dice"),
    sheet: document.getElementById("screen-sheet")
  };
  var sheetBack = document.getElementById("sheetBack");
  var sheetBody = document.getElementById("sheetBody");

  /* ---------------- Кубы ---------------- */

  function buildDieRow() {
    dieRow.innerHTML = "";
    DICE.forEach(function (d) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "die-btn" + (d === selectedDie ? " selected" : "");
      btn.textContent = "к" + d;
      btn.setAttribute("aria-label", "Куб к" + d);
      btn.addEventListener("click", function () {
        selectedDie = d;
        buildDieRow();
        clampSliderToDie();
      });
      dieRow.appendChild(btn);
    });
  }

  function clampSliderToDie() {
    updateSliderFill();
  }

  function updateSliderFill() {
    var min = parseInt(countSlider.min, 10);
    var max = parseInt(countSlider.max, 10);
    var val = parseInt(countSlider.value, 10);
    var pct = ((val - min) / (max - min)) * 100;
    countSlider.style.setProperty("--fill", pct + "%");
    countValue.textContent = val;
    selectedCount = val;
  }

  countSlider.addEventListener("input", updateSliderFill);

  function rollDie(sides) {
    return 1 + Math.floor(Math.random() * sides);
  }

  function doRoll() {
    var rolls = [];
    for (var i = 0; i < selectedCount; i++) {
      rolls.push(rollDie(selectedDie));
    }
    var total = rolls.reduce(function (a, b) { return a + b; }, 0);

    resultScroll.innerHTML = "";

    var totalEl = document.createElement("div");
    totalEl.className = "result-total";
    totalEl.textContent = total;
    resultScroll.appendChild(totalEl);

    var labelEl = document.createElement("div");
    labelEl.className = "result-label";
    labelEl.textContent = selectedCount + " × к" + selectedDie;
    resultScroll.appendChild(labelEl);

    var breakdown = document.createElement("div");
    breakdown.className = "result-breakdown";
    rolls.forEach(function (r) {
      var pip = document.createElement("span");
      pip.className = "pip";
      if (r === selectedDie) pip.className += " crit-high";
      if (r === 1) pip.className += " crit-low";
      pip.textContent = r;
      breakdown.appendChild(pip);
    });
    resultScroll.appendChild(breakdown);

    if (navigator.vibrate) navigator.vibrate(12);
  }

  rollBtn.addEventListener("click", doRoll);

  /* ---------------- Персонажи ---------------- */

  var CHARACTERS = window.CHARACTERS || [];

  function buildCharList() {
    charList.innerHTML = "";
    CHARACTERS.forEach(function (c) {
      var card = document.createElement("div");
      card.className = "char-card";
      card.addEventListener("click", function () {
        openSheet(c);
        closeDrawer();
      });

      var med = document.createElement("div");
      med.className = "medallion";
      var img = document.createElement("img");
      img.src = c.token;
      img.alt = c.name;
      med.appendChild(img);

      var nameWrap = document.createElement("div");
      var nameEl = document.createElement("span");
      nameEl.className = "char-card-name";
      nameEl.textContent = c.name;
      nameWrap.appendChild(nameEl);

      if (c.summary && c.summary["Класс"]) {
        var sub = document.createElement("span");
        sub.className = "char-card-sub";
        sub.textContent = c.summary["Класс"];
        nameWrap.appendChild(sub);
      }

      card.appendChild(med);
      card.appendChild(nameWrap);
      charList.appendChild(card);
    });
  }

  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function openSheet(c) {
    sheetBody.innerHTML = "";

    var hero = el("div", "sheet-hero");
    var med = el("div", "sheet-medallion");
    var img = document.createElement("img");
    img.src = c.token;
    img.alt = c.name;
    med.appendChild(img);
    hero.appendChild(med);
    hero.appendChild(el("h2", "sheet-name", c.name));
    if (c.summary && c.summary["Класс"]) {
      hero.appendChild(el("p", "sheet-tagline", c.summary["Класс"] + " · " + (c.summary["Раса"] || "")));
    }
    sheetBody.appendChild(hero);

    var secSummary = el("div", "sheet-section");
    secSummary.appendChild(el("h3", null, "Сводка"));
    var grid = el("div", "kv-grid");
    Object.keys(c.summary || {}).forEach(function (k) {
      var kv = el("div", "kv");
      kv.appendChild(el("span", "k", k));
      kv.appendChild(el("span", "v", c.summary[k]));
      grid.appendChild(kv);
    });
    secSummary.appendChild(grid);
    if (c.backstory) {
      var bp = el("p", null, c.backstory);
      bp.style.marginTop = "14px";
      secSummary.appendChild(bp);
    }
    sheetBody.appendChild(secSummary);

    if (c.appearance) {
      var secApp = el("div", "sheet-section");
      secApp.appendChild(el("h3", null, "Внешний вид"));
      secApp.appendChild(el("p", null, c.appearance));
      sheetBody.appendChild(secApp);
    }

    if (c.stats) {
      var secStats = el("div", "sheet-section");
      secStats.appendChild(el("h3", null, "Характеристики"));
      var sgrid = el("div", "kv-grid");
      Object.keys(c.stats).forEach(function (k) {
        var kv = el("div", "kv");
        kv.appendChild(el("span", "k", k));
        kv.appendChild(el("span", "v", c.stats[k]));
        sgrid.appendChild(kv);
      });
      secStats.appendChild(sgrid);
      sheetBody.appendChild(secStats);
    }

    if (c.actions && c.actions.length) {
      var secAct = el("div", "sheet-section");
      secAct.appendChild(el("h3", null, "Действия"));
      c.actions.forEach(function (a) {
        var item = el("div", "action-item");
        item.appendChild(el("span", "a-name", a.name));
        item.appendChild(el("span", "a-text", a.text));
        secAct.appendChild(item);
      });
      sheetBody.appendChild(secAct);
    }

    if (c.knows && c.knows.length) {
      var secKnow = el("div", "sheet-section");
      secKnow.appendChild(el("h3", null, "Что персонаж может рассказать"));
      var ul = el("ul", "lore-list");
      c.knows.forEach(function (k) { ul.appendChild(el("li", null, k)); });
      secKnow.appendChild(ul);
      sheetBody.appendChild(secKnow);
    }

    if (c.quotes && c.quotes.length) {
      var secQuotes = el("div", "sheet-section");
      secQuotes.appendChild(el("h3", null, "Крылатые фразы"));
      var qul = el("ul", "quote-list");
      c.quotes.forEach(function (q) { qul.appendChild(el("li", null, "«" + q + "»")); });
      secQuotes.appendChild(qul);
      sheetBody.appendChild(secQuotes);
    }

    showScreen("sheet");
  }

  sheetBack.addEventListener("click", function () { showScreen("dice"); });

  /* ---------------- Навигация экранов ---------------- */

  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle("active", k === name);
    });
  }

  function openDrawer() {
    drawer.classList.add("open");
    drawerBackdrop.classList.add("open");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
  }

  openDrawerBtn.addEventListener("click", openDrawer);
  closeDrawerBtn.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  /* ---------------- Инициализация ---------------- */

  buildDieRow();
  updateSliderFill();
  buildCharList();
  showScreen("dice");

  /* ---------------- Service worker + обновления ---------------- */

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        reg.addEventListener("updatefound", function () {
          var newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", function () {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateToast(reg);
            }
          });
        });
      }).catch(function () { });
    });

    var refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  function showUpdateToast(reg) {
    var toast = document.getElementById("updateToast");
    toast.classList.add("show");
    document.getElementById("updateReload").addEventListener("click", function () {
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
    });
  }
})();
