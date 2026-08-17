/* ═══════════════════════════════════════════════
   KRONOS — Modern Clock Application
   Core JavaScript Logic
   ═══════════════════════════════════════════════ */

// ── State ──
const state = {
    timeFormat: 24,
    showAnalog: false,
    showSeconds: true,
    showMilliseconds: true,
    clockScale: 1,
    sidebarMode: 'full',
    currentTheme: 'midnight-obsidian',
    currentFont: 'inter',
    // Stopwatch
    swRunning: false,
    swStartTime: 0,
    swElapsed: 0,
    swInterval: null,
    swLaps: [],
    // Timer
    timerRunning: false,
    timerTotalSeconds: 0,
    timerRemaining: 0,
    timerInterval: null,
    // Focus
    focusRunning: false,
    focusDuration: 25,
    focusBreak: 5,
    focusRemaining: 25 * 60,
    focusTotal: 25 * 60,
    focusInterval: null,
    focusSessions: 0,
    focusTotalMinutes: 0,
    focusStreak: 0,
    focusIsBreak: false,
};

// ── Themes ──
const themes = [
    { id: 'midnight-obsidian', name: 'Gece Obsidyeni', color1: '#6366f1', color2: '#a78bfa' },
    { id: 'cyber-neon', name: 'Siber Neon', color1: '#00ffaa', color2: '#00d4ff' },
    { id: 'crimson-night', name: 'Kızıl Gece', color1: '#ef4444', color2: '#fb923c' },
    { id: 'aurora', name: 'Aurora', color1: '#8b5cf6', color2: '#06b6d4' },
    { id: 'golden-hour', name: 'Altın Saat', color1: '#f59e0b', color2: '#d97706' },
    { id: 'arctic-storm', name: 'Kutup Fırtınası', color1: '#38bdf8', color2: '#818cf8' },
    { id: 'rose-quartz', name: 'Gül Kuvarsı', color1: '#ec4899', color2: '#a78bfa' },
    { id: 'forest-shadow', name: 'Orman Gölgesi', color1: '#22c55e', color2: '#a3e635' },
    { id: 'sunset-blaze', name: 'Gün Batımı', color1: '#f97316', color2: '#ef4444' },
    { id: 'lavender-mist', name: 'Lavanta Sisi', color1: '#c084fc', color2: '#f0abfc' },
    { id: 'forest-nature', name: '🌲 Orman', color1: '#2d5a27', color2: '#1a3a18' },
    { id: 'desert-nature', name: '🏜️ Çöl', color1: '#c2956b', color2: '#8b6914' },
    { id: 'snowy-nature', name: '❄️ Karlı', color1: '#b8d4e8', color2: '#7a9bb5' },
];

// ── Fonts ──
const fonts = [
    { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", display: "'Inter'" },
    { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", display: "'Outfit'" },
    { id: 'orbitron', name: 'Orbitron', family: "'Orbitron', sans-serif", display: "'Orbitron'" },
    { id: 'roboto-mono', name: 'Roboto Mono', family: "'Roboto Mono', monospace", display: "'Roboto Mono'" },
    { id: 'jetbrains-mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", display: "'JetBrains Mono'" },
    { id: 'space-mono', name: 'Space Mono', family: "'Space Mono', monospace", display: "'Space Mono'" },
    { id: 'fira-code', name: 'Fira Code', family: "'Fira Code', monospace", display: "'Fira Code'" },
    { id: 'source-code-pro', name: 'Source Code Pro', family: "'Source Code Pro', monospace", display: "'Source Code Pro'" },
];

// ═══════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initNavigation();
    loadStopwatch();
    renderThemes();
    renderFonts();
    startClock();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    }
    
    generateClockMarkers();
    initFullscreenClickHandlers();
});

function loadSettings() {
    const saved = localStorage.getItem('kronos-settings');
    if (saved) {
        const s = JSON.parse(saved);
        if (s.theme) setTheme(s.theme, false);
        if (s.font) setFont(s.font, false);
        if (s.timeFormat) setTimeFormat(s.timeFormat, false);
        if (s.showAnalog !== undefined) toggleAnalog(s.showAnalog, false);
        if (s.showSeconds !== undefined) toggleSeconds(s.showSeconds, false);
        if (s.showMilliseconds !== undefined) toggleMilliseconds(s.showMilliseconds, false);
        if (s.clockScale !== undefined) setClockSize(s.clockScale, false);
        if (s.sidebarMode) setSidebarMode(s.sidebarMode, false);
        if (s.focusSessions) state.focusSessions = s.focusSessions;
        if (s.focusTotalMinutes) state.focusTotalMinutes = s.focusTotalMinutes;
        if (s.focusStreak) state.focusStreak = s.focusStreak;
    }
    updateFocusStats();
}

function saveSettings() {
    localStorage.setItem('kronos-settings', JSON.stringify({
        theme: state.currentTheme,
        font: state.currentFont,
        timeFormat: state.timeFormat,
        showAnalog: state.showAnalog,
        showSeconds: state.showSeconds,
        showMilliseconds: state.showMilliseconds,
        clockScale: state.clockScale,
        sidebarMode: state.sidebarMode,
        focusSessions: state.focusSessions,
        focusTotalMinutes: state.focusTotalMinutes,
        focusStreak: state.focusStreak,
    }));
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function initNavigation() {
    document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            // Update nav
            document.querySelectorAll('.nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Update tabs
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const target = document.getElementById(`tab-${tab}`);
            if (target) {
                target.classList.add('active');
                // Re-trigger animation
                target.style.animation = 'none';
                target.offsetHeight; // reflow
                target.style.animation = '';
            }
        });
    });
}

// ═══════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    let displayHours = hours;
    let suffix = '';
    
    if (state.timeFormat === 12) {
        suffix = hours >= 12 ? ' PM' : ' AM';
        displayHours = hours % 12 || 12;
    }
    
    document.getElementById('clockHours').textContent = String(displayHours).padStart(2, '0');
    document.getElementById('clockMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('clockSeconds').textContent = String(seconds).padStart(2, '0') + suffix;

    // Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('tr-TR', options);

    // Greeting
    let greeting;
    if (hours < 6) greeting = '🌙 İyi Geceler';
    else if (hours < 12) greeting = '☀️ Günaydın';
    else if (hours < 18) greeting = '🌤️ İyi Öğleden Sonralar';
    else if (hours < 22) greeting = '🌆 İyi Akşamlar';
    else greeting = '🌙 İyi Geceler';
    document.getElementById('clockGreeting').textContent = greeting;

    // Analog clock
    if (state.showAnalog) {
        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;
        const secondDeg = seconds * 6;
        
        document.getElementById('hourHand').style.transform = `rotate(${hourDeg}deg)`;
        document.getElementById('minuteHand').style.transform = `rotate(${minuteDeg}deg)`;
        document.getElementById('secondHand').style.transform = `rotate(${secondDeg}deg)`;
    }
}

function generateClockMarkers() {
    const face = document.querySelector('.clock-markers');
    for (let i = 0; i < 12; i++) {
        const marker = document.createElement('div');
        const angle = i * 30;
        const isHour = true;
        marker.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${i % 3 === 0 ? '3px' : '1.5px'};
            height: ${i % 3 === 0 ? '14px' : '8px'};
            background: ${i % 3 === 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)'};
            border-radius: 2px;
            transform-origin: center 0;
            transform: translate(-50%, -50%) rotate(${angle}deg) translate(0, -96px);
        `;
        face.appendChild(marker);
    }
}

// ═══════════════════════════════════════
// STOPWATCH
// ═══════════════════════════════════════
function saveStopwatch() {
    localStorage.setItem('kronos-sw', JSON.stringify({
        running: state.swRunning,
        startTime: state.swStartTime,
        elapsed: state.swElapsed,
        laps: state.swLaps
    }));
}

function loadStopwatch() {
    const saved = localStorage.getItem('kronos-sw');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.swElapsed = data.elapsed || 0;
            state.swLaps = data.laps || [];
            
            if (data.running) {
                state.swElapsed = Date.now() - data.startTime;
                swStart();
            } else {
                updateSwDisplay();
                if (state.swLaps.length > 0) renderLaps();
                if (state.swElapsed > 0) {
                    document.getElementById('swResetBtn').disabled = false;
                    document.getElementById('swLapBtn').disabled = false;
                }
            }
        } catch(e) {}
    }
}

function swToggle() {
    if (state.swRunning) {
        swPause();
    } else {
        swStart();
    }
}

function swStart() {
    state.swRunning = true;
    state.swStartTime = Date.now() - state.swElapsed;
    
    state.swInterval = setInterval(() => {
        state.swElapsed = Date.now() - state.swStartTime;
        updateSwDisplay();
    }, 10);
    
    document.getElementById('swPlayIcon').style.display = 'none';
    document.getElementById('swPauseIcon').style.display = 'block';
    document.getElementById('swResetBtn').disabled = false;
    document.getElementById('swLapBtn').disabled = false;
    document.querySelector('.stopwatch-container').classList.add('running');
    saveStopwatch();
}

function swPause() {
    state.swRunning = false;
    clearInterval(state.swInterval);
    
    document.getElementById('swPlayIcon').style.display = 'block';
    document.getElementById('swPauseIcon').style.display = 'none';
    document.querySelector('.stopwatch-container').classList.remove('running');
    saveStopwatch();
}

function swReset() {
    state.swRunning = false;
    state.swElapsed = 0;
    state.swLaps = [];
    clearInterval(state.swInterval);
    
    updateSwDisplay();
    document.getElementById('lapsList').innerHTML = '';
    document.getElementById('swPlayIcon').style.display = 'block';
    document.getElementById('swPauseIcon').style.display = 'none';
    document.getElementById('swResetBtn').disabled = true;
    document.getElementById('swLapBtn').disabled = true;
    document.querySelector('.stopwatch-container').classList.remove('running');
    saveStopwatch();
}

function swLap() {
    if (!state.swRunning) return;
    
    const lapTime = state.swElapsed;
    const prevLapTime = state.swLaps.length > 0 ? state.swLaps[state.swLaps.length - 1].total : 0;
    const diff = lapTime - prevLapTime;
    
    state.swLaps.push({ total: lapTime, diff: diff });
    renderLaps();
    saveStopwatch();
}

function updateSwDisplay() {
    const totalMs = state.swElapsed;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    
    document.getElementById('swMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('swSeconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('swMs').textContent = String(ms).padStart(2, '0');
}

function renderLaps() {
    const list = document.getElementById('lapsList');
    const laps = [...state.swLaps].reverse();
    
    // Find best/worst
    let bestIdx = -1, worstIdx = -1;
    if (state.swLaps.length >= 3) {
        let minDiff = Infinity, maxDiff = -Infinity;
        state.swLaps.forEach((lap, i) => {
            if (lap.diff < minDiff) { minDiff = lap.diff; bestIdx = i; }
            if (lap.diff > maxDiff) { maxDiff = lap.diff; worstIdx = i; }
        });
    }
    
    list.innerHTML = laps.map((lap, displayIdx) => {
        const realIdx = state.swLaps.length - 1 - displayIdx;
        const lapNum = realIdx + 1;
        const timeStr = formatMs(lap.total);
        const diffStr = formatMs(lap.diff);
        let diffClass = '';
        if (realIdx === bestIdx) diffClass = 'lap-best';
        if (realIdx === worstIdx) diffClass = 'lap-worst';
        
        return `
            <div class="lap-item">
                <span class="lap-number">Tur ${lapNum}</span>
                <span class="lap-diff ${diffClass}">+${diffStr}</span>
                <span class="lap-time">${timeStr}</span>
            </div>
        `;
    }).join('');
}

function formatMs(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

// ═══════════════════════════════════════
// TIMER
// ═══════════════════════════════════════
function adjustTimer(field, delta) {
    const input = document.getElementById(`timer${field.charAt(0).toUpperCase() + field.slice(1)}`);
    let val = parseInt(input.value) || 0;
    val += delta;
    
    const max = field === 'hours' ? 23 : 59;
    if (val < 0) val = max;
    if (val > max) val = 0;
    
    input.value = val;
}

function setTimerPreset(minutes) {
    document.getElementById('timerHours').value = Math.floor(minutes / 60);
    document.getElementById('timerMinutes').value = minutes % 60;
    document.getElementById('timerSeconds').value = 0;
}

function timerToggle() {
    if (state.timerRunning) {
        timerPause();
    } else {
        timerStart();
    }
}

function timerStart() {
    if (!state.timerRunning && state.timerRemaining === 0) {
        // Starting fresh
        const h = parseInt(document.getElementById('timerHours').value) || 0;
        const m = parseInt(document.getElementById('timerMinutes').value) || 0;
        const s = parseInt(document.getElementById('timerSeconds').value) || 0;
        state.timerTotalSeconds = h * 3600 + m * 60 + s;
        state.timerRemaining = state.timerTotalSeconds;
        
        if (state.timerTotalSeconds === 0) return;
        
        // Show running view
        document.getElementById('timerSetup').style.display = 'none';
        document.getElementById('timerRunning').style.display = 'flex';
        document.getElementById('timerResetBtn').style.display = 'flex';
    }
    
    state.timerRunning = true;
    const startTime = performance.now();
    const startRemaining = state.timerRemaining;
    
    state.timerInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        state.timerRemaining = Math.max(0, startRemaining - elapsed);
        
        updateTimerDisplay();
        
        if (state.timerRemaining <= 0) {
            timerComplete();
        }
    }, 50);
    
    document.getElementById('timerPlayIcon').style.display = 'none';
    document.getElementById('timerPauseIcon').style.display = 'block';
    document.querySelector('.timer-container').classList.add('running');
}

function timerPause() {
    state.timerRunning = false;
    clearInterval(state.timerInterval);
    
    document.getElementById('timerPlayIcon').style.display = 'block';
    document.getElementById('timerPauseIcon').style.display = 'none';
    document.querySelector('.timer-container').classList.remove('running');
}

function timerReset() {
    state.timerRunning = false;
    state.timerRemaining = 0;
    clearInterval(state.timerInterval);
    
    document.getElementById('timerSetup').style.display = 'flex';
    document.getElementById('timerRunning').style.display = 'none';
    document.getElementById('timerResetBtn').style.display = 'none';
    document.getElementById('timerPlayIcon').style.display = 'block';
    document.getElementById('timerPauseIcon').style.display = 'none';
    document.querySelector('.timer-container').classList.remove('running');
    
    updateTimerDisplay();
}

function timerComplete() {
    timerPause();
    state.timerRemaining = 0;
    updateTimerDisplay();
    
    showModal('⏰ Süre Doldu!', 'Zamanlayıcı tamamlandı.');
    playAlarm();
}

function updateTimerDisplay() {
    const totalSeconds = state.showMilliseconds ? state.timerRemaining : Math.ceil(state.timerRemaining);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    
    let timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    if (state.showMilliseconds) {
        const ms = Math.floor((state.timerRemaining % 1) * 100);
        timeStr += `.${String(ms).padStart(2, '0')}`;
    }
    
    document.getElementById('timerDisplay').textContent = timeStr;
    document.querySelector('.timer-ring-container').classList.toggle('show-ms', state.showMilliseconds);
    
    // Update ring
    if (state.timerTotalSeconds > 0) {
        const progress = 1 - (state.timerRemaining / state.timerTotalSeconds);
        const circumference = 2 * Math.PI * 90;
        document.getElementById('timerRingProgress').style.strokeDashoffset = circumference * progress;
    }
}

// ═══════════════════════════════════════
// FOCUS MODE
// ═══════════════════════════════════════
function setFocusMode(btn, duration, breakTime) {
    if (state.focusRunning) return;
    
    document.querySelectorAll('.focus-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    state.focusDuration = duration;
    state.focusBreak = breakTime;
    state.focusRemaining = duration * 60;
    state.focusTotal = duration * 60;
    state.focusIsBreak = false;
    
    updateFocusDisplay();
    document.getElementById('focusStatus').textContent = 'Hazır';
}

function focusToggle() {
    if (state.focusRunning) {
        focusPause();
    } else {
        focusStart();
    }
}

function focusStart() {
    state.focusRunning = true;
    const startTime = performance.now();
    const startRemaining = state.focusRemaining;
    
    state.focusInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        state.focusRemaining = Math.max(0, startRemaining - elapsed);
        
        updateFocusDisplay();
        
        if (state.focusRemaining <= 0) {
            focusComplete();
        }
    }, 50);
    
    document.getElementById('focusPlayIcon').style.display = 'none';
    document.getElementById('focusPauseIcon').style.display = 'block';
    document.getElementById('focusResetBtn').disabled = false;
    document.getElementById('focusSkipBtn').disabled = false;
    document.getElementById('focusStatus').textContent = state.focusIsBreak ? 'Mola' : 'Odaklanıyor...';
}

function focusPause() {
    state.focusRunning = false;
    clearInterval(state.focusInterval);
    
    document.getElementById('focusPlayIcon').style.display = 'block';
    document.getElementById('focusPauseIcon').style.display = 'none';
    document.getElementById('focusStatus').textContent = 'Duraklatıldı';
}

function focusReset() {
    state.focusRunning = false;
    clearInterval(state.focusInterval);
    
    state.focusRemaining = state.focusDuration * 60;
    state.focusTotal = state.focusDuration * 60;
    state.focusIsBreak = false;
    
    updateFocusDisplay();
    document.getElementById('focusPlayIcon').style.display = 'block';
    document.getElementById('focusPauseIcon').style.display = 'none';
    document.getElementById('focusResetBtn').disabled = true;
    document.getElementById('focusSkipBtn').disabled = true;
    document.getElementById('focusStatus').textContent = 'Hazır';
}

function focusSkip() {
    focusComplete();
}

function focusComplete() {
    clearInterval(state.focusInterval);
    state.focusRunning = false;
    
    if (!state.focusIsBreak) {
        // Completed a focus session
        state.focusSessions++;
        state.focusTotalMinutes += state.focusDuration;
        state.focusStreak++;
        updateFocusStats();
        saveSettings();
        
        if (state.focusBreak > 0) {
            // Switch to break
            state.focusIsBreak = true;
            state.focusRemaining = state.focusBreak * 60;
            state.focusTotal = state.focusBreak * 60;
            showModal('🎉 Harika!', `Odaklanma tamamlandı! ${state.focusBreak} dakika mola zamanı.`);
        } else {
            showModal('🎉 Harika!', 'Odaklanma süresi tamamlandı!');
            focusReset();
            return;
        }
    } else {
        // Completed a break
        state.focusIsBreak = false;
        state.focusRemaining = state.focusDuration * 60;
        state.focusTotal = state.focusDuration * 60;
        showModal('☕ Mola Bitti!', 'Tekrar odaklanma zamanı!');
    }
    
    updateFocusDisplay();
    document.getElementById('focusPlayIcon').style.display = 'block';
    document.getElementById('focusPauseIcon').style.display = 'none';
    document.getElementById('focusStatus').textContent = state.focusIsBreak ? 'Mola — Hazır' : 'Hazır';
    
    playAlarm();
}

function updateFocusDisplay() {
    const total = Math.ceil(state.focusRemaining);
    const m = Math.floor(total / 60);
    const s = total % 60;
    
    document.getElementById('focusDisplay').textContent = 
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    // Update ring
    if (state.focusTotal > 0) {
        const progress = 1 - (state.focusRemaining / state.focusTotal);
        const circumference = 2 * Math.PI * 120;
        document.getElementById('focusRingProgress').style.strokeDashoffset = circumference * progress;
    }
}

function updateFocusStats() {
    document.getElementById('focusSessionCount').textContent = state.focusSessions;
    document.getElementById('focusTotalTime').textContent = 
        state.focusTotalMinutes >= 60 
            ? `${Math.floor(state.focusTotalMinutes / 60)} sa ${state.focusTotalMinutes % 60} dk`
            : `${state.focusTotalMinutes} dk`;
    document.getElementById('focusStreak').textContent = state.focusStreak;
}

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    const isOpen = panel.classList.contains('open');
    
    if (isOpen) {
        panel.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        panel.classList.add('open');
        overlay.classList.add('open');
    }
}

function renderThemes() {
    const grid = document.getElementById('themeGrid');
    grid.innerHTML = themes.map(theme => `
        <div class="theme-card ${state.currentTheme === theme.id ? 'active' : ''}" 
             onclick="setTheme('${theme.id}')" data-theme-id="${theme.id}">
            <div class="theme-swatch" style="background: linear-gradient(135deg, ${theme.color1}, ${theme.color2});"></div>
            <span class="theme-name">${theme.name}</span>
        </div>
    `).join('');
}

function setTheme(themeId, save = true) {
    state.currentTheme = themeId;
    
    if (themeId === 'midnight-obsidian') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeId);
    }
    
    // Update active state
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.themeId === themeId);
    });
    
    if (save) saveSettings();
}

function renderFonts() {
    const list = document.getElementById('fontList');
    list.innerHTML = fonts.map(font => `
        <div class="font-card ${state.currentFont === font.id ? 'active' : ''}" 
             onclick="setFont('${font.id}')" data-font-id="${font.id}">
            <span class="font-preview" style="font-family: ${font.display};">${font.name}</span>
            <span class="font-label">Aa</span>
        </div>
    `).join('');
}

function setFont(fontId, save = true) {
    state.currentFont = fontId;
    const font = fonts.find(f => f.id === fontId);
    if (font) {
        document.documentElement.style.setProperty('--font-display', font.family);
    }
    
    // Update active state
    document.querySelectorAll('.font-card').forEach(card => {
        card.classList.toggle('active', card.dataset.fontId === fontId);
    });
    
    if (save) saveSettings();
}

function setTimeFormat(format, save = true) {
    state.timeFormat = format;
    document.getElementById('format24').classList.toggle('active', format === 24);
    document.getElementById('format12').classList.toggle('active', format === 12);
    updateClock();
    if (save) saveSettings();
}

function toggleAnalog(show, save = true) {
    state.showAnalog = show;
    document.getElementById('analogClock').classList.toggle('visible', show);
    document.getElementById('analogOn').classList.toggle('active', show);
    document.getElementById('analogOff').classList.toggle('active', !show);
    if (save) saveSettings();
}

function toggleSeconds(show, save = true) {
    state.showSeconds = show;
    document.getElementById('clockSeconds').style.display = show ? '' : 'none';
    document.getElementById('secondsOn').classList.toggle('active', show);
    document.getElementById('secondsOff').classList.toggle('active', !show);
    if (save) saveSettings();
}

function toggleMilliseconds(show, save = true) {
    state.showMilliseconds = show;
    
    // Stopwatch
    document.getElementById('swMsSep').style.display = show ? '' : 'none';
    document.getElementById('swMs').style.display = show ? '' : 'none';
    
    // Timer display will automatically use state in updateTimerDisplay()
    if (!state.timerRunning) {
        updateTimerDisplay(); // Force update if paused
    }
    
    document.getElementById('msOn').classList.toggle('active', show);
    document.getElementById('msOff').classList.toggle('active', !show);
    if (save) saveSettings();
}

function adjustClockSize(delta) {
    let newScale = state.clockScale + delta;
    // Limit between 50% and 250%
    newScale = Math.max(0.5, Math.min(2.5, newScale));
    setClockSize(newScale);
}

function setClockSize(scale, save = true) {
    state.clockScale = scale;
    document.documentElement.style.setProperty('--clock-scale', scale);
    
    const display = document.getElementById('clockSizeDisplay');
    if (display) {
        display.textContent = Math.round(scale * 100) + '%';
    }
    
    if (save) saveSettings();
}

function setSidebarMode(mode, save = true) {
    state.sidebarMode = mode;
    const body = document.body;
    body.classList.remove('sidebar-full', 'sidebar-mini', 'sidebar-hidden');
    body.classList.add(`sidebar-${mode}`);
    
    document.getElementById('sidebarFull').classList.toggle('active', mode === 'full');
    document.getElementById('sidebarMini').classList.toggle('active', mode === 'mini');
    document.getElementById('sidebarHidden').classList.toggle('active', mode === 'hidden');
    
    // Show/hide the floating toggle button
    document.getElementById('sidebarToggleBtn').classList.toggle('visible', mode === 'hidden');
    
    if (save) saveSettings();
}

function cycleSidebar() {
    const modes = ['full', 'mini', 'hidden'];
    const currentIdx = modes.indexOf(state.sidebarMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    setSidebarMode(modes[nextIdx]);
}

// ═══════════════════════════════════════
// MODAL & AUDIO
// ═══════════════════════════════════════
function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('timerModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('timerModal').style.display = 'none';
    stopAlarm();
}

// ── Web Audio API Alarm ──
let alarmOscillator = null;
let alarmContext = null;

function playAlarm() {
    try {
        alarmContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const playBeep = (freq, startTime, duration) => {
            const osc = alarmContext.createOscillator();
            const gain = alarmContext.createGain();
            osc.connect(gain);
            gain.connect(alarmContext.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        
        const now = alarmContext.currentTime;
        // Pleasant alarm pattern
        for (let i = 0; i < 3; i++) {
            playBeep(880, now + i * 0.4, 0.15);
            playBeep(1100, now + i * 0.4 + 0.15, 0.15);
        }
        playBeep(1320, now + 1.2, 0.4);
    } catch (e) {
        // Silent fail
    }
}

function stopAlarm() {
    if (alarmContext) {
        alarmContext.close();
        alarmContext = null;
    }
}

// ═══════════════════════════════════════
// FULLSCREEN MODE
// ═══════════════════════════════════════
state.isFullscreen = false;

function initFullscreenClickHandlers() {
    // Click on stopwatch display to toggle pause/play in fullscreen
    const swDisplay = document.querySelector('.stopwatch-display');
    swDisplay.addEventListener('click', () => {
        if (state.isFullscreen) {
            swToggle();
        }
    });

    // Click on timer ring display to toggle pause/play in fullscreen
    const timerRingDisplay = document.querySelector('.timer-ring-display');
    timerRingDisplay.addEventListener('click', () => {
        if (state.isFullscreen && (state.timerRunning || state.timerRemaining > 0)) {
            timerToggle();
        }
    });
}

function toggleFullscreen(tab) {
    state.isFullscreen = !state.isFullscreen;
    
    if (state.isFullscreen) {
        document.body.classList.add('fullscreen-mode');
        
        // Try browser fullscreen API
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
        
        // Update all fullscreen buttons (only the active tab's is visible)
        document.querySelectorAll('.fullscreen-btn').forEach(btn => {
            btn.querySelector('.fs-expand').style.display = 'none';
            btn.querySelector('.fs-shrink').style.display = 'block';
        });
    } else {
        exitFullscreen();
    }
}

function exitFullscreen() {
    state.isFullscreen = false;
    document.body.classList.remove('fullscreen-mode');
    
    // Exit browser fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
    }
    
    // Reset button icons
    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.querySelector('.fs-expand').style.display = 'block';
        btn.querySelector('.fs-shrink').style.display = 'none';
    });
}

// Sync fullscreen state if user exits via browser (e.g. pressing browser's Esc)
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && state.isFullscreen) {
        state.isFullscreen = false;
        document.body.classList.remove('fullscreen-mode');
        document.querySelectorAll('.fullscreen-btn').forEach(btn => {
            btn.querySelector('.fs-expand').style.display = 'block';
            btn.querySelector('.fs-shrink').style.display = 'none';
        });
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement && state.isFullscreen) {
        state.isFullscreen = false;
        document.body.classList.remove('fullscreen-mode');
        document.querySelectorAll('.fullscreen-btn').forEach(btn => {
            btn.querySelector('.fs-expand').style.display = 'block';
            btn.querySelector('.fs-shrink').style.display = 'none';
        });
    }
});

// ── Keyboard Shortcuts ──
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case '1': document.getElementById('nav-clock').click(); break;
        case '2': document.getElementById('nav-stopwatch').click(); break;
        case '3': document.getElementById('nav-timer').click(); break;
        case '4': document.getElementById('nav-focus').click(); break;
        case 'p':
        case 'P':
            cycleSidebar();
            break;
        case 'f':
        case 'F':
            // Toggle fullscreen for the active tab
            const activeTabForFs = document.querySelector('.tab-content.active');
            if (activeTabForFs) {
                const tabName = activeTabForFs.id.replace('tab-', '');
                toggleFullscreen(tabName);
            }
            break;
        case ' ':
            e.preventDefault();
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab.id === 'tab-stopwatch') swToggle();
            else if (activeTab.id === 'tab-timer') timerToggle();
            else if (activeTab.id === 'tab-focus') focusToggle();
            break;
        case 'Escape':
            if (state.isFullscreen) {
                exitFullscreen();
            } else {
                const settingsPanel = document.getElementById('settingsPanel');
                if (settingsPanel.classList.contains('open')) toggleSettings();
                const modal = document.getElementById('timerModal');
                if (modal.style.display !== 'none') closeModal();
            }
            break;
    }
});
