// === ХРАНИЛИЩЕ ===
let grades = [];
let scale = 5; // 5 или 10

// === ДОБАВЛЕНИЕ ОЦЕНКИ ===
function addGrade(value = '', weight = 1) {
    const list = document.getElementById('gradesList');
    const item = document.createElement('div');
    item.className = 'grade-item';

    const maxVal = scale === 5 ? 5 : 10;

    item.innerHTML = `
        <input type="number" min="1" max="${maxVal}" value="${value || ''}" placeholder="5" onchange="updateGrades()">
        <input type="number" class="weight-input" min="1" max="10" value="${weight}" placeholder="вес" onchange="updateGrades()">
        <button class="delete-btn" onclick="removeGrade(this)">✕</button>
    `;

    list.appendChild(item);
    updateGrades();
}

// === УДАЛЕНИЕ ОЦЕНКИ ===
function removeGrade(btn) {
    btn.closest('.grade-item').remove();
    updateGrades();
}

// === ОБНОВЛЕНИЕ ДАННЫХ ===
function updateGrades() {
    const items = document.querySelectorAll('.grade-item');
    grades = [];

    items.forEach(item => {
        const inputs = item.querySelectorAll('input[type="number"]');
        const val = parseFloat(inputs[0].value);
        const weight = parseFloat(inputs[1].value) || 1;
        if (!isNaN(val) && val > 0) {
            grades.push({ value: val, weight: weight });
        }
    });

    updateStats();
    calculateForecast();
}

// === СТАТИСТИКА ===
function updateStats() {
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);

    let avg = 0;
    if (totalWeight > 0) {
        avg = weightedSum / totalWeight;
    }

    document.getElementById('currentAverage').textContent = avg.toFixed(1);
    document.getElementById('gradeCount').textContent = grades.length + ' оценок';

    // Обновляем "Профессиональная" и другие навыки (просто для красоты)
    const fills = document.querySelectorAll('.spec-fill');
    const base = Math.min(avg / (scale === 5 ? 5 : 10) * 100, 100);
    if (fills.length >= 5) {
        fills[0].style.width = Math.min(base * 1.0, 100) + '%';
        fills[1].style.width = Math.min(base * 0.85, 100) + '%';
        fills[2].style.width = Math.min(base * 1.1, 100) + '%';
        fills[3].style.width = Math.min(base * 0.7, 100) + '%';
        fills[4].style.width = Math.min(base * 0.9, 100) + '%';
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

    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);
    const maxVal = scale === 5 ? 5 : 10;

    // Ищем сколько нужно максимальных оценок
    let needed = 0;
    let found = false;

    for (let i = 0; i <= 100; i++) {
        const newTotalWeight = totalWeight + i;
        const newWeightedSum = weightedSum + i * maxVal;
        const newAvg = newWeightedSum / newTotalWeight;

        if (newAvg >= goal - 0.01) {
            needed = i;
            found = true;
            break;
        }
    }

    if (!found || needed > 50) {
        document.getElementById('neededGrades').textContent = 'очень много 😅';
    } else if (needed === 0) {
        document.getElementById('neededGrades').textContent = '0 (уже достигла!) 🎉';
    } else {
        document.getElementById('neededGrades').textContent = needed;
    }
}

// === СМЕНА ШКАЛЫ ===
function setScale(newScale) {
    scale = parseInt(newScale);

    // Обновляем кнопки
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(newScale + '-балльная')) {
            btn.classList.add('active');
        }
    });

    // Обновляем max у всех инпутов
    const maxVal = scale === 5 ? 5 : 10;
  document.querySelectorAll('.grade-item input[type="number"]:first-child').forEach(input => {
        input.max = maxVal;
        if (parseFloat(input.value) > maxVal) {
            input.value = maxVal;
        }
    });

    updateGrades();
}

// === ИНИЦИАЛИЗАЦИЯ ===
// Добавляем примеры оценок
addGrade(4, 1);
addGrade(5, 2);
addGrade(3, 1);
addGrade(4, 1);
addGrade(5, 3);
