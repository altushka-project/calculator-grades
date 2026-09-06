// === ХРАНИЛИЩЕ ===
let grades = [];
let scale = 5; // 5 или 10
let currentMode = 'average'; // 'average' или 'weighted'

// === ДОБАВЛЕНИЕ ОЦЕНКИ ===
function addGrade(value = 5, weight = 1) {
    const list = document.getElementById('gradesList');
    const item = document.createElement('div');
    item.className = 'grade-item';

    const maxVal = scale;

    item.innerHTML = `
        <div class="grade-value" id="gradeDisplay_${Date.now()}">${value}</div>
        <div class="grade-controls">
            <button onclick="changeGrade(this, -1)">−</button>
            <button onclick="changeGrade(this, 1)">+</button>
        </div>
        <div class="weight-control" id="weightControl_${Date.now()}">
            <span>Вес:</span>
            <button onclick="changeWeight(this, -1)">−</button>
            <span class="weight-value">${weight}</span>
            <button onclick="changeWeight(this, 1)">+</button>
        </div>
        <button class="delete-btn" onclick="removeGrade(this)">✕</button>
    `;

    item.dataset.value = value;
    item.dataset.weight = weight;

    list.appendChild(item);
    
    // Применяем текущий режим (скрываем вес, если нужно)
    applyMode();
    updateGrades();
}

// === ИЗМЕНЕНИЕ ОЦЕНКИ ===
function changeGrade(btn, delta) {
    const item = btn.closest('.grade-item');
    const display = item.querySelector('.grade-value');
    let current = parseInt(item.dataset.value) || 5;
    let newVal = Math.min(Math.max(current + delta, 1), scale);
    item.dataset.value = newVal;
    display.textContent = newVal;
    updateGrades();
}

// === ИЗМЕНЕНИЕ ВЕСА ===
function changeWeight(btn, delta) {
    const item = btn.closest('.grade-item');
    const display = item.querySelector('.weight-value');
    let current = parseInt(item.dataset.weight) || 1;
    let newWeight = Math.min(Math.max(current + delta, 1), 10);
    item.dataset.weight = newWeight;
    display.textContent = newWeight;
    updateGrades();
}

// === УДАЛЕНИЕ ОЦЕНКИ ===
function removeGrade(btn) {
    btn.closest('.grade-item').remove();
    updateGrades();
}

// === ПЕРЕКЛЮЧЕНИЕ РЕЖИМА ===
function setMode(mode) {
    currentMode = mode;
    
    // Обновляем кнопки
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'average') {
        document.getElementById('modeAvg').classList.add('active');
        document.getElementById('modeDescription').textContent = 'Считает сумму всех оценок, деленную на их количество (без весов).';
        document.getElementById('formulaText').innerHTML = `
            <p>Складываем все оценки и делим на их количество.</p>
            <div class="formula">(оценка + оценка) ÷ количество</div>
        `;
        document.getElementById('weightLegend').style.display = 'none';
    } else {
        document.getElementById('modeWeight').classList.add('active');
        document.getElementById('modeDescription').textContent = 'Учитывает важность каждой оценки (вес). Чем выше вес, тем сильнее влияние.';
        document.getElementById('formulaText').innerHTML = `
            <p>Умножаем каждую оценку на её вес, складываем и делим на сумму весов.</p>
            <div class="formula">(оценка × вес) + ... ÷ сумма весов</div>
        `;
        document.getElementById('weightLegend').style.display = 'block';
    }
    
    applyMode();
    updateGrades();
}

// === ПРИМЕНЕНИЕ РЕЖИМА (показываем/скрываем вес) ===
function applyMode() {
    const weightControls = document.querySelectorAll('.weight-control');
    if (currentMode === 'average') {
        weightControls.forEach(el => el.style.display = 'none');
    } else {
        weightControls.forEach(el => el.style.display = 'flex');
    }
}

// === ОБНОВЛЕНИЕ ДАННЫХ ===
function updateGrades() {
    const items = document.querySelectorAll('.grade-item');
    grades = [];

    items.forEach(item => {
        const val = parseInt(item.dataset.value);
        const weight = parseInt(item.dataset.weight) || 1;
        if (!isNaN(val) && val > 0) {
            grades.push({ value: val, weight: weight });
        }
    });

    updateStats();
    calculateForecast();
}

// === СТАТИСТИКА ===
function updateStats() {
    let avg = 0;
    
    if (currentMode === 'average') {
        // Обычный средний балл
        const sum = grades.reduce((s, g) => s + g.value, 0);
        if (grades.length > 0) {
            avg = sum / grades.length;
        }
    } else {
        // Взвешенный средний
        const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
        const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0);
        if (totalWeight > 0) {
            avg = weightedSum / totalWeight;
        }
    }

    document.getElementById('currentAverage').textContent = avg.toFixed(1);
    document.getElementById('gradeCount').textContent = grades.length + ' оценок';

    // Обновляем шкалы навыков
    const fills = document.querySelectorAll('.spec-fill');
    const base = Math.min(avg / scale * 100, 100);
    if (fills.length >= 3) {
        fills[0].style.width = Math.min(base * 1.0, 100) + '%';
        fills[1].style.width = Math.min(base * 0.85 + 10, 100) + '%';
        fills[2].style.width = Math.min(base * 0.7 + 15, 100) + '%';
    }
}

// === ПРОГНОЗ ===
function calculateForecast() {
    const goal = parseInt(document.getElementById('goalSelect').value);
    document.getElementById('goalDisplay').textContent = goal;

    if (grades.length === 0) {
        document.getElementById('neededGrades').textContent = '—';
        return;
    }

    const maxVal = scale;
    let needed = 0;
    let found = false;

    for (let i = 0; i <= 100; i++) {
        let newAvg;
        
        if (currentMode === 'average') {
            const sum = grades.reduce((s, g) => s + g.value, 0);
            const count = grades.length + i;
            newAvg = (sum + i * maxVal) / count;
        } else {
            const totalWeight
