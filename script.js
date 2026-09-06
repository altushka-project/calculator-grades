// ============================================================
// ===== 1. ВЗВЕШЕННЫЙ КАЛЬКУЛЯТОР (Официальная формула) =====
// ============================================================

let grades = [];
let scale = 5;

// Добавление оценки
function addGrade(value = 5, weight = 1) {
    const list = document.getElementById('gradesList');
    if (!list) return;
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

// Изменение оценки
function changeGrade(btn, delta) {
    const item = btn.closest('.grade-item');
    if (!item) return;
    let current = parseInt(item.dataset.value) || 5;
    let newVal = Math.min(Math.max(current + delta, 1), scale);
    item.dataset.value = newVal;
    const display = item.querySelector('.grade-value');
    if (display) display.textContent = newVal;
    updateWeightedStats();
    calculateForecast();
}

// Изменение веса
function changeWeight(btn, delta) {
    const item = btn.closest('.grade-item');
    if (!item) return;
    let current = parseInt(item.dataset.weight) || 1;
    let newWeight = Math.min(Math.max(current + delta, 1), 5);
    item.dataset.weight = newWeight;
    const display = item.querySelector('.weight-value');
    if (display) display.textContent = newWeight;
    updateWeightedStats();
    calculateForecast();
}

// Удаление оценки
function removeGrade(btn) {
    const item = btn.closest('.grade-item');
    if (item) item.remove();
    updateWeightedStats();
    calculateForecast();
}

// Обновление статистики (официальная формула)
function updateWeightedStats() {
    const items = document.querySelectorAll('.grade-item');
    grades = [];
    items.forEach(item => {
        const val = parseInt(item.dataset.value);
        const weight = parseInt(item.dataset.weight) || 1;
        if (!isNaN(val) && val > 0) grades.push({ value: val, weight });
    });

    // Средневзвешенный балл = (сумма произведений оценок на вес) / (сумма весов)
    const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
    const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0);
    let avg = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Отображаем средний балл
    const avgDisplay = document.getElementById('weightedAverage');
    if (avgDisplay) avgDisplay.textContent = avg.toFixed(1);

    // Определяем четвертную оценку по шкале
    let quarterGrade = '—';
    if (avg >= 4.6) quarterGrade = '5';
    else if (avg >= 3.6) quarterGrade = '4';
    else if (avg >= 2.6) quarterGrade = '3';
    else if (avg > 0) quarterGrade = '2';
    
    const qDisplay = document.getElementById('quarterGrade');
    if (qDisplay) qDisplay.textContent = quarterGrade;

    // Количество оценок
    const countDisplay = document.getElementById('gradeCount');
    if (countDisplay) countDisplay.textContent = grades.length + ' оценок';

    // Обновляем шкалы навыков
    const fills = document.querySelectorAll('.spec-fill');
    const base = Math.min(avg / scale * 100, 100);
    if (fills.length >= 3) {
        fills[0].style.width = Math.min(base * 1.0, 100) + '%';
        fills[1].style.width = Math.min(base * 0.85 + 10, 100) + '%';
        fills[2].style.width = Math.min(base * 0.7 + 15, 100) + '%';
    }
}

// Прогноз (сколько нужно получить максимальных оценок)
function calculateForecast() {
    const goalSelect = document.getElementById('goalSelect');
    const goalDisplay = document.getElementById('goalDisplay');
    const neededDisplay = document.getElementById('neededGrades');
    
    if (!goalSelect || !goalDisplay || !neededDisplay) return;
    
    const goal = parseInt(goalSelect.value);
    goalDisplay.textContent = goal;
    
    if (grades.length === 0) {
        neededDisplay.textContent = '—';
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
        neededDisplay.textContent = 'очень много 😅';
    } else if (needed === 0) {
        neededDisplay.textContent = '0 (уже есть!) 🎉';
    } else {
        neededDisplay.textContent = needed;
    }
}

// Переключение шкалы (5/10 баллов)
function setScale(newScale) {
    scale = parseInt(newScale);
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(newScale + '-балльная'));
    });
    document.querySelectorAll('.grade-item .grade-value').forEach(el => {
        let val = parseInt(el.textContent);
        if (val > scale) {
            el.textContent = scale;
            const item = el.closest('.grade-item');
            if (item) item.dataset.value = scale;
        }
    });
    updateWeightedStats();
    calculateForecast();
}

// ============================================================
// ===== 2. ПРОСТОЙ КАЛЬКУЛЯТОР (без весов) =====
// ============================================================

function calcSimple() {
    const input = document.getElementById('simpleInput');
    const avgDisplay = document.getElementById('simpleAverage');
    const countDisplay = document.getElementById('simpleCount');
    
    if (!input || !avgDisplay || !countDisplay) return;
    
    const raw = input.value;
    const arr = raw.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x) && x >= 1 && x <= 10);
    
    if (arr.length === 0) {
        avgDisplay.textContent = '—';
        countDisplay.textContent = '0';
        return;
    }
    
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = sum / arr.length;
    avgDisplay.textContent = avg.toFixed(2);
    countDisplay.textContent = arr.length;
}

function clearSimple() {
    const input = document.getElementById('simpleInput');
    const avgDisplay = document.getElementById('simpleAverage');
    const countDisplay = document.getElementById('simpleCount');
    
    if (input) input.value = '';
    if (avgDisplay) avgDisplay.textContent = '—';
    if (countDisplay) countDisplay.textContent = '0';
}

// ============================================================
// ===== ЗАГРУЗКА ПРИМЕРОВ ПРИ СТАРТЕ =====
// ============================================================

// Ждём, пока загрузится DOM, потом добавляем примеры
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли уже оценки
    const existing = document.querySelectorAll('.grade-item');
    if (existing.length === 0) {
        addGrade(4, 1);
        addGrade(5, 2);
        addGrade(3, 1);
        addGrade(4, 1);
        addGrade(5, 3);
    }
});
