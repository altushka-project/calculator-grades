// ============================================================
// ===== 1. ВЗВЕШЕННЫЙ КАЛЬКУЛЯТОР =====
// ============================================================

let grades = [];
let scale = 5;

function addGrade(value = 5, weight = 1) {
    const list = document.getElementById('gradesList');
    const item = document.createElement('div');
    item.className = 'grade-item';
    const id = Date.now() + Math.random();

    item.dataset.value = value;
    item.dataset.weight = weight;

    item.innerHTML = `
        <div class="grade-value" id="gv_${id}">${value}</div>
        <div class="grade-controls">
            <button onclick="changeGrade(this, -1)">−</button>
            <button onclick="changeGrade(this, 1)">+</button>
        </div>
        <div class="weight-control">
            <span>Вес:</span>
            <button onclick="changeWeight(this, -1)">−</button>
            <span class="weight-value" id="wv_${id}">${weight}</span>
            <button onclick="changeWeight(this, 1)">+</button>
        </div>
        <button class="delete-btn" onclick="removeGrade(this)">✕</button>
    `;

    list.appendChild(item);
    updateWeightedStats();
    calculateForecast();
}

function changeGrade(btn, delta) {
    const item = btn.closest('.grade-item');
    let current = parseInt(item.dataset.value) || 5;
    let newVal = Math.min(Math.max(current + delta, 1), scale);
    item.dataset.value = newVal;
    item.querySelector('.grade-value').textContent = newVal;
    updateWeightedStats();
    calculateForecast();
}

function changeWeight(btn, delta) {
    const item = btn.closest('.grade-item');
    let current = parseInt(item.dataset.weight) || 1;
    let newWeight = Math.min(Math.max(current + delta, 1), 10);
    item.dataset.weight = newWeight;
    item.querySelector('.weight-value').textContent = newWeight;
    updateWeightedStats();
    calculateForecast();
}

function removeGrade(btn) {
    btn.closest('.grade-item').remove();
    updateWeightedStats();
    calculateForecast();
}

function updateWeightedStats() {
    const items = document.querySelectorAll('.grade-item');
    grades = [];
    items.forEach(item => {
        const val = parseInt(item.dataset.value);
        const weight = parseInt(item.dataset.weight) || 1;
        if (!isNaN(val) && val > 0) grades.push({ value: val, weight });
    });

    const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
    const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0);
    let avg = totalWeight > 0 ? weightedSum / totalWeight : 0;

    document.getElementById('weightedAverage').textContent = avg.toFixed(1);
    document.getElementById('gradeCount').textContent = grades.length + ' оценок';

    const fills = document.querySelectorAll('.spec-fill');
    const base = Math.min(avg / scale * 100, 100);
    if (fills.length >= 3) {
        fills[0].style.width = Math.min(base * 1.0, 100) + '%';
        fills[1].style.width = Math.min(base * 0.85 + 10, 100) + '%';
        fills[2].style.width = Math.min(base * 0.7 + 15, 100) + '%';
    }
}

function calculateForecast() {
    const goal = parseInt(document.getElementById('goalSelect').value);
    document.getElementById('goalDisplay').textContent = goal;
    if (grades.length === 0) {
        document.getElementById('neededGrades').textContent = '—';
        return;
    }

    const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
    const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0);
    const maxVal = scale;

    let needed = 0, found = false;
    for (let i = 0; i <= 100; i++) {
        const newTotal = totalWeight + i;
        const newSum = weightedSum + i * maxVal;
        if (newSum / newTotal >= goal - 0.01) {
            needed = i;
            found = true;
            break;
        }
    }

    if (!found || needed > 50) {
        document.getElementById('neededGrades').textContent = 'очень много 😅';
    } else if (needed === 0) {
        document.getElementById('neededGrades').textContent = '0 (уже есть!) 🎉';
    } else {
        document.getElementById('neededGrades').textContent = needed;
    }
}

function setScale(newScale) {
    scale = parseInt(newScale);
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(newScale + '-балльная'));
    });
    document.querySelectorAll('.grade-item .grade-value').forEach(el => {
        let val = parseInt(el.textContent);
        if (val > scale) {
            el.textContent = scale;
            el.closest('.grade-item').dataset.value = scale;
        }
    });
    updateWeightedStats();
    calculateForecast();
}

// ============================================================
// ===== 2. ПРОСТОЙ КАЛЬКУЛЯТОР =====
// ============================================================

function calcSimple() {
    const input = document.getElementById('simpleInput').value;
    const arr = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x) && x >= 1 && x <= 10);
    if (arr.length === 0) {
        document.getElementById('simpleAverage').textContent = '—';
        document.getElementById('simpleCount').textContent = '0';
        return;
    }
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = sum / arr.length;
    document.getElementById('simpleAverage').textContent = avg.toFixed(2);
    document.getElementById('simpleCount').textContent = arr.length;
}

function clearSimple() {
    document.getElementById('simpleInput').value = '';
    document.getElementById('simpleAverage').textContent = '—';
    document.getElementById('simpleCount').textContent = '0';
}

// ============================================================
// ===== ЗАГРУЗКА ПРИМЕРОВ =====
// ============================================================

addGrade(4, 1);
addGrade(5, 2);
addGrade(3, 1);
addGrade(4, 1);
addGrade(5, 3);
