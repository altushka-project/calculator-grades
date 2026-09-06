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
    let newWeight = Math.min(Math.max(current + delta, 1), 5);
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

    // ===== ОФИЦИАЛЬНАЯ ФОРМУЛА =====
    // Средневзвешенный балл = (сумма произведений оценок на вес) / (сумма весов)
    const totalWeight = grades.reduce((s, g) => s + g.weight,
