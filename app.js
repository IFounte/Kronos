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
    showGreeting: true,
    showDate: true,
    blinkColon: true,
    clockScale: 1,
    sidebarMode: 'full',
    currentTheme: 'custom',
    customBg: '#0a0a0f',
    customAccent: '#6366f1',
    customDigitColor: '#ffffff',
    customGradientEnd: '#38bdf8',
    gradientEnabled: true,
    gradientPercent: 50,
    gradientAngle: 135,
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
    { id: 'custom', name: '🎨 Özel Renkler', color1: '#6366f1', color2: '#a78bfa' },
    { id: 'forest-nature', name: '🌲 Orman', color1: '#2d5a27', color2: '#1a3a18' },
    { id: 'desert-nature', name: '🏜️ Çöl', color1: '#c2956b', color2: '#8b6914' },
    { id: 'snowy-nature', name: '❄️ Karlı', color1: '#b8d4e8', color2: '#7a9bb5' },
    { id: 'beach-nature', name: '🏖️ Plaj', color1: '#38bdf8', color2: '#f59e0b' },
    { id: 'night-nature', name: '🌌 Gece', color1: '#a78bfa', color2: '#38bdf8' },
    { id: 'rain-nature', name: '🌧️ Yağmur', color1: '#0284c7', color2: '#64748b' },
];

// ── Fonts ──
const fonts = [
    { id: 'inter', name: 'Inter (Modern & Sade)', family: "'Inter', sans-serif" },
    { id: 'outfit', name: 'Outfit (Şık & Yuvarlak)', family: "'Outfit', sans-serif" },
    { id: 'orbitron', name: 'Orbitron (Fütüristik Dijital)', family: "'Orbitron', sans-serif" },
    { id: 'syne', name: 'Syne (Avangart & Kalın)', family: "'Syne', sans-serif" },
    { id: 'bebas-neue', name: 'Bebas Neue (Uzun & Güçlü)', family: "'Bebas Neue', sans-serif" },
    { id: 'righteous', name: 'Righteous (Retro Synthwave)', family: "'Righteous', cursive" },
    { id: 'cinzel', name: 'Cinzel (Klasik & Asil)', family: "'Cinzel', serif" },
    { id: 'comfortaa', name: 'Comfortaa (Yumuşak & Minimal)', family: "'Comfortaa', cursive" },
    { id: 'montserrat', name: 'Montserrat (Geometrik Netlik)', family: "'Montserrat', sans-serif" },
    { id: 'playfair', name: 'Playfair Display (Zarif & Lüks)', family: "'Playfair Display', serif" },
    { id: 'plus-jakarta', name: 'Plus Jakarta Sans (Temiz UI)', family: "'Plus Jakarta Sans', sans-serif" },
    { id: 'silkscreen', name: 'Silkscreen (8-Bit Piksel Arcade)', family: "'Silkscreen', cursive" },
    { id: 'share-tech-mono', name: 'Share Tech Mono (Terminal Konsol)', family: "'Share Tech Mono', monospace" },
    { id: 'roboto-mono', name: 'Roboto Mono (Düzenli Monospace)', family: "'Roboto Mono', monospace" },
    { id: 'jetbrains-mono', name: 'JetBrains Mono (Kod & Hassasiyet)', family: "'JetBrains Mono', monospace" },
    { id: 'space-mono', name: 'Space Mono (Teknik & Geniş)', family: "'Space Mono', monospace" },
    { id: 'fira-code', name: 'Fira Code (Modern Monospace)', family: "'Fira Code', monospace" },
    { id: 'source-code-pro', name: 'Source Code Pro (Profesyonel)', family: "'Source Code Pro', monospace" },
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
        if (s.customBg) state.customBg = s.customBg;
        if (s.customAccent) state.customAccent = s.customAccent;
        if (s.customDigitColor) state.customDigitColor = s.customDigitColor;
        if (s.customGradientEnd) state.customGradientEnd = s.customGradientEnd;
        if (s.theme) {
            applyThemeColors(s.theme, state.customBg, state.customAccent, state.customDigitColor, state.customGradientEnd, false);
        } else {
            applyThemeColors('custom', state.customBg, state.customAccent, state.customDigitColor, state.customGradientEnd, false);
        }
        if (s.gradientEnabled !== undefined) toggleGradient(s.gradientEnabled, false);
        if (s.gradientPercent !== undefined) setGradientPercent(s.gradientPercent, false);
        else setGradientPercent(50, false);
        if (s.gradientAngle !== undefined) setGradientAngle(s.gradientAngle, false);
        else setGradientAngle(135, false);
        if (s.font) setFont(s.font, false);
        if (s.timeFormat) setTimeFormat(s.timeFormat, false);
        if (s.showAnalog !== undefined) toggleAnalog(s.showAnalog, false);
        if (s.showSeconds !== undefined) toggleSeconds(s.showSeconds, false);
        if (s.showMilliseconds !== undefined) toggleMilliseconds(s.showMilliseconds, false);
        if (s.showGreeting !== undefined) toggleGreeting(s.showGreeting, false);
        if (s.showDate !== undefined) toggleDate(s.showDate, false);
        if (s.blinkColon !== undefined) toggleBlinkColon(s.blinkColon, false);
        if (s.clockScale !== undefined) setClockSize(s.clockScale, false);
        if (s.sidebarMode) setSidebarMode(s.sidebarMode, false);
        if (s.focusSessions) state.focusSessions = s.focusSessions;
        if (s.focusTotalMinutes) state.focusTotalMinutes = s.focusTotalMinutes;
        if (s.focusStreak) state.focusStreak = s.focusStreak;
    } else {
        setTheme('custom', false);
    }
    updateFocusStats();
}

function saveSettings() {
    localStorage.setItem('kronos-settings', JSON.stringify({
        theme: state.currentTheme,
        customBg: state.customBg,
        customAccent: state.customAccent,
        customDigitColor: state.customDigitColor,
        customGradientEnd: state.customGradientEnd,
        gradientEnabled: state.gradientEnabled,
        gradientPercent: state.gradientPercent,
        gradientAngle: state.gradientAngle,
        font: state.currentFont,
        timeFormat: state.timeFormat,
        showAnalog: state.showAnalog,
        showSeconds: state.showSeconds,
        showMilliseconds: state.showMilliseconds,
        showGreeting: state.showGreeting,
        showDate: state.showDate,
        blinkColon: state.blinkColon,
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
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    
    const swHoursEl = document.getElementById('swHours');
    const swHourSepEl = document.getElementById('swHourSep');
    
    if (hours > 0) {
        if (swHoursEl) {
            swHoursEl.style.display = '';
            swHoursEl.textContent = String(hours).padStart(2, '0');
        }
        if (swHourSepEl) {
            swHourSepEl.style.display = '';
        }
    } else {
        if (swHoursEl) {
            swHoursEl.style.display = 'none';
        }
        if (swHourSepEl) {
            swHourSepEl.style.display = 'none';
        }
    }
    
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
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    
    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    }
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
    document.querySelector('.focus-container')?.classList.add('running');
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
    document.querySelector('.focus-container')?.classList.remove('running');
    clearInterval(state.focusInterval);
    
    document.getElementById('focusPlayIcon').style.display = 'block';
    document.getElementById('focusPauseIcon').style.display = 'none';
    document.getElementById('focusStatus').textContent = 'Duraklatıldı';
}

function focusReset() {
    state.focusRunning = false;
    document.querySelector('.focus-container')?.classList.remove('running');
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
    document.querySelector('.focus-container')?.classList.remove('running');
    
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

function resetFocusStats() {
    if (confirm('Toplam odaklanma süresi ve tamamlanan bölüm istatistikleri sıfırlansın mı?')) {
        state.focusSessions = 0;
        state.focusTotalMinutes = 0;
        state.focusStreak = 0;
        updateFocusStats();
        saveSettings();
    }
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
        closeFontDropdown();
    } else {
        renderThemes();
        renderFonts();
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

function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustColorBrightness(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getLuminance(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function applyThemeColors(themeId, bgColor, accentColor, digitColor, gradientColor, save = true) {
    if (themeId) state.currentTheme = themeId;
    if (bgColor) state.customBg = bgColor;
    if (accentColor) state.customAccent = accentColor;
    if (digitColor) state.customDigitColor = digitColor;
    if (gradientColor) state.customGradientEnd = gradientColor;

    const currentTheme = state.currentTheme || 'custom';
    const activeBg = state.customBg || '#0a0a0f';
    const activeAccent = state.customAccent || '#6366f1';

    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);

    // Calculate background luminance for contrast
    const bgLuminance = getLuminance(activeBg);
    const isLightBg = bgLuminance > 0.55;

    // Apply Background & Surface Colors across ALL themes (Custom & Wallpaper Nature Themes)
    if (currentTheme === 'custom') {
        root.style.setProperty('--bg-primary', activeBg);
        root.style.setProperty('--bg-secondary', adjustColorBrightness(activeBg, isLightBg ? -5 : 5));
        root.style.setProperty('--bg-tertiary', adjustColorBrightness(activeBg, isLightBg ? -10 : 10));
        root.style.setProperty('--bg-card', hexToRgba(adjustColorBrightness(activeBg, isLightBg ? -6 : 8), isLightBg ? 0.85 : 0.7));
        root.style.setProperty('--bg-card-hover', hexToRgba(adjustColorBrightness(activeBg, isLightBg ? -12 : 14), isLightBg ? 0.95 : 0.8));
        root.style.setProperty('--bg-sidebar', adjustColorBrightness(activeBg, isLightBg ? -5 : 5));
        root.style.setProperty('--bg-settings', adjustColorBrightness(activeBg, isLightBg ? -5 : 5));
        root.style.removeProperty('--bg-overlay');
    } else {
        // Wallpaper Themes: Sidebar, Settings Panel, Cards & Overlay actively derive from customBg
        root.style.removeProperty('--bg-primary');
        root.style.setProperty('--bg-secondary', hexToRgba(activeBg, isLightBg ? 0.88 : 0.82));
        root.style.setProperty('--bg-tertiary', hexToRgba(adjustColorBrightness(activeBg, isLightBg ? -8 : 8), isLightBg ? 0.92 : 0.86));
        root.style.setProperty('--bg-card', hexToRgba(adjustColorBrightness(activeBg, isLightBg ? -6 : 8), isLightBg ? 0.75 : 0.65));
        root.style.setProperty('--bg-card-hover', hexToRgba(adjustColorBrightness(activeBg, isLightBg ? -12 : 14), isLightBg ? 0.88 : 0.78));
        root.style.setProperty('--bg-sidebar', hexToRgba(activeBg, isLightBg ? 0.82 : 0.76));
        root.style.setProperty('--bg-settings', hexToRgba(activeBg, isLightBg ? 0.92 : 0.88));
        root.style.setProperty('--bg-overlay', hexToRgba(activeBg, isLightBg ? 0.35 : 0.42));
    }

    // Automatic Text, SVG Icon & Button Contrast Logic (Dark on Light, White on Dark)
    const isAccentLight = getLuminance(activeAccent) > 0.55;
    const btnTextColor = (isLightBg || isAccentLight) ? '#0f172a' : '#ffffff';

    if (isLightBg) {
        root.style.setProperty('--text-primary', '#0f172a');
        root.style.setProperty('--text-secondary', 'rgba(15, 23, 42, 0.75)');
        root.style.setProperty('--text-tertiary', 'rgba(15, 23, 42, 0.45)');
        root.style.setProperty('--btn-primary-text', btnTextColor);
        root.style.setProperty('--ring-bg', 'rgba(15, 23, 42, 0.15)');
    } else {
        root.style.setProperty('--text-primary', '#e8e8f0');
        root.style.setProperty('--text-secondary', 'rgba(232, 232, 240, 0.65)');
        root.style.setProperty('--text-tertiary', 'rgba(232, 232, 240, 0.35)');
        root.style.setProperty('--btn-primary-text', btnTextColor);
        root.style.setProperty('--ring-bg', 'rgba(255, 255, 255, 0.12)');
    }

    // Dynamic Accent, Digit & Gradient Colors across ALL themes
    const activeDigit = state.customDigitColor || (isLightBg ? '#0f172a' : '#ffffff');
    const activeGradient = state.customGradientEnd || activeAccent;

    root.style.setProperty('--accent', activeAccent);
    root.style.setProperty('--digit-color', activeDigit);
    root.style.setProperty('--gradient-end', activeGradient);
    root.style.setProperty('--accent-hover', isLightBg ? adjustColorBrightness(activeAccent, -15) : adjustColorBrightness(activeAccent, 15));
    root.style.setProperty('--accent-glow', hexToRgba(activeAccent, 0.3));
    root.style.setProperty('--accent-soft', hexToRgba(activeAccent, 0.12));
    root.style.setProperty('--glow-1', hexToRgba(activeAccent, 0.24));
    root.style.setProperty('--glow-2', hexToRgba(adjustColorBrightness(activeAccent, 20), 0.18));
    root.style.setProperty('--border', hexToRgba(activeAccent, isLightBg ? 0.25 : 0.18));
    root.style.setProperty('--border-hover', hexToRgba(activeAccent, isLightBg ? 0.45 : 0.35));

    // Update color input values in settings panel
    const bgInput = document.getElementById('customBgInput');
    const accentInput = document.getElementById('customAccentInput');
    const digitInput = document.getElementById('customDigitInput');
    const gradientInput = document.getElementById('customGradientInput');
    if (bgInput) bgInput.value = activeBg;
    if (accentInput) accentInput.value = activeAccent;
    if (digitInput) digitInput.value = activeDigit;
    if (gradientInput) gradientInput.value = activeGradient;

    // Update active theme card state
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.themeId === currentTheme);
    });

    // Handle Rain Theme logic
    if (currentTheme === 'rain-nature') {
        initRainAnimation();
    } else {
        if (lightningTimeout) clearTimeout(lightningTimeout);
        const rainOverlay = document.getElementById('rainOverlay');
        if (rainOverlay) rainOverlay.innerHTML = '';
        const lightningContainer = document.getElementById('lightningContainer');
        if (lightningContainer) lightningContainer.classList.remove('flash-active');
    }

    if (save) saveSettings();
}

const defaultThemeAccents = {
    'custom': { bg: '#0a0a0f', accent: '#6366f1', digit: '#ffffff', gradient: '#a855f7' },
    'forest-nature': { bg: '#061209', accent: '#a3e635', digit: '#e6f0e6', gradient: '#a3e635' },
    'desert-nature': { bg: '#140c06', accent: '#f59e0b', digit: '#fef3c7', gradient: '#f59e0b' },
    'snowy-nature': { bg: '#0b131e', accent: '#7dd3fc', digit: '#ffffff', gradient: '#38bdf8' },
    'beach-nature': { bg: '#061219', accent: '#38bdf8', digit: '#e0f2fe', gradient: '#38bdf8' },
    'night-nature': { bg: '#080714', accent: '#a78bfa', digit: '#ede9fe', gradient: '#38bdf8' },
    'rain-nature': { bg: '#090e16', accent: '#38bdf8', digit: '#e2e8f0', gradient: '#38bdf8' },
};

function applyCustomTheme(bgColor, accentColor, digitColor, gradientColor, save = true) {
    applyThemeColors('custom', bgColor, accentColor, digitColor, gradientColor, save);
}

function setTheme(themeId, save = true) {
    const defaults = defaultThemeAccents[themeId] || defaultThemeAccents['custom'];
    state.customBg = defaults.bg || '#0a0a0f';
    if (defaults.accent) state.customAccent = defaults.accent;
    state.customDigitColor = defaults.digit || '#ffffff';
    state.customGradientEnd = defaults.gradient || '#38bdf8';
    applyThemeColors(themeId, state.customBg, state.customAccent, state.customDigitColor, state.customGradientEnd, save);
}

function updateCustomColorsFromInput() {
    const bgVal = document.getElementById('customBgInput')?.value || state.customBg;
    const accentVal = document.getElementById('customAccentInput')?.value || state.customAccent;
    const digitVal = document.getElementById('customDigitInput')?.value || state.customDigitColor;
    const gradientVal = document.getElementById('customGradientInput')?.value || state.customGradientEnd;
    applyThemeColors(state.currentTheme, bgVal, accentVal, digitVal, gradientVal, true);
}

function setPresetCustomColors(bgHex, accentHex, digitHex = '#ffffff', gradientHex = '#38bdf8') {
    applyThemeColors(state.currentTheme, bgHex, accentHex, digitHex, gradientHex, true);
}

function resetThemeColorsToDefault() {
    const currentTheme = state.currentTheme || 'custom';
    const defaults = defaultThemeAccents[currentTheme] || defaultThemeAccents['custom'];
    
    state.customBg = defaults.bg || '#0a0a0f';
    state.customAccent = defaults.accent;
    state.customDigitColor = defaults.digit || '#ffffff';
    state.customGradientEnd = defaults.gradient || '#38bdf8';
    
    applyThemeColors(currentTheme, state.customBg, state.customAccent, state.customDigitColor, state.customGradientEnd, true);
}

function toggleGradient(enable, save = true) {
    state.gradientEnabled = enable;
    document.body.classList.toggle('no-gradient', !enable);
    const onBtn = document.getElementById('gradientOn');
    const offBtn = document.getElementById('gradientOff');
    if (onBtn) onBtn.classList.toggle('active', enable);
    if (offBtn) offBtn.classList.toggle('active', !enable);
    
    const gradientPicker = document.getElementById('gradientPickerItem');
    if (gradientPicker) {
        gradientPicker.style.opacity = enable ? '1' : '0.35';
        gradientPicker.style.pointerEvents = enable ? 'auto' : 'none';
    }

    const controlsWrapper = document.getElementById('gradientControlsWrapper');
    if (controlsWrapper) {
        controlsWrapper.style.opacity = enable ? '1' : '0.35';
        controlsWrapper.style.pointerEvents = enable ? 'auto' : 'none';
    }

    if (save) saveSettings();
}

function setGradientPercent(percent, save = true) {
    const val = Math.min(90, Math.max(10, parseInt(percent, 10) || 50));
    state.gradientPercent = val;
    document.documentElement.style.setProperty('--gradient-percent', `${val}%`);
    
    const slider = document.getElementById('gradientSlider');
    const badge = document.getElementById('gradientPercentBadge');
    const subBadge = document.getElementById('gradientPercentSubBadge');
    if (slider && parseInt(slider.value, 10) !== val) {
        slider.value = val;
    }
    if (badge) {
        badge.textContent = `%${val}`;
    }
    if (subBadge) {
        subBadge.textContent = `%${val}`;
    }
    if (save) saveSettings();
}

function setGradientAngle(angle, save = true) {
    const val = (parseInt(angle, 10) % 360 + 360) % 360;
    state.gradientAngle = val;
    document.documentElement.style.setProperty('--gradient-angle', `${val}deg`);
    
    const slider = document.getElementById('gradientAngleSlider');
    const badge = document.getElementById('gradientAngleBadge');
    const indicator = document.getElementById('angleDialIndicator');
    
    if (slider && parseInt(slider.value, 10) !== val) {
        slider.value = val;
    }
    if (badge) {
        badge.textContent = `${val}°`;
    }
    if (indicator) {
        indicator.style.transform = `rotate(${val}deg)`;
    }
    
    // Update active preset button
    document.querySelectorAll('.angle-preset-btn').forEach(btn => {
        const btnAngle = parseInt(btn.textContent, 10);
        btn.classList.toggle('active', btnAngle === val);
    });
    
    if (save) saveSettings();
}

// ── Rotatable Dial Event Handlers ──
let isDraggingAngle = false;

function startAngleDrag(e) {
    e.preventDefault();
    isDraggingAngle = true;
    const dial = document.getElementById('angleDial');
    if (dial) dial.classList.add('dragging');
    updateAngleFromEvent(e);
    
    window.addEventListener('mousemove', onAngleDragMove);
    window.addEventListener('mouseup', stopAngleDrag);
    window.addEventListener('touchmove', onAngleDragMove, { passive: false });
    window.addEventListener('touchend', stopAngleDrag);
}

function onAngleDragMove(e) {
    if (!isDraggingAngle) return;
    if (e.preventDefault) e.preventDefault();
    updateAngleFromEvent(e);
}

function stopAngleDrag() {
    if (!isDraggingAngle) return;
    isDraggingAngle = false;
    const dial = document.getElementById('angleDial');
    if (dial) dial.classList.remove('dragging');
    window.removeEventListener('mousemove', onAngleDragMove);
    window.removeEventListener('mouseup', stopAngleDrag);
    window.removeEventListener('touchmove', onAngleDragMove);
    window.removeEventListener('touchend', stopAngleDrag);
}

function updateAngleFromEvent(e) {
    const dial = document.getElementById('angleDial');
    if (!dial) return;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let deg = Math.round((Math.atan2(deltaY, deltaX) * (180 / Math.PI)) + 90);
    if (deg < 0) deg += 360;
    if (deg >= 360) deg -= 360;
    
    setGradientAngle(deg, true);
}

// ── Rain Animation & Lightning ──
let lightningTimeout = null;

function initRainAnimation() {
    const rainOverlay = document.getElementById('rainOverlay');
    if (!rainOverlay) return;
    rainOverlay.innerHTML = '';
    
    // 1. Rain streaks strictly falling inside the glass window pane container
    for (let i = 0; i < 35; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 98}%`;
        drop.style.width = `${1 + Math.random() * 1.5}px`;
        drop.style.height = `${25 + Math.random() * 45}px`;
        drop.style.animationDuration = `${0.9 + Math.random() * 1.4}s`;
        drop.style.animationDelay = `${Math.random() * 2.5}s`;
        drop.style.opacity = `${0.3 + Math.random() * 0.4}`;
        rainOverlay.appendChild(drop);
    }
    
    // 2. Slow sliding glass droplets on the window pane
    for (let i = 0; i < 18; i++) {
        const droplet = document.createElement('div');
        droplet.className = 'glass-droplet';
        droplet.style.left = `${Math.random() * 96}%`;
        droplet.style.top = `${Math.random() * 70}%`;
        const size = 3 + Math.random() * 4;
        droplet.style.width = `${size}px`;
        droplet.style.height = `${size * (1.2 + Math.random() * 0.5)}px`;
        droplet.style.animationDuration = `${6 + Math.random() * 7}s`;
        droplet.style.animationDelay = `${Math.random() * 5}s`;
        rainOverlay.appendChild(droplet);
    }
    
    scheduleLightning();
}

function scheduleLightning() {
    if (lightningTimeout) clearTimeout(lightningTimeout);
    if (state.currentTheme !== 'rain-nature') return;
    
    // Trigger lightning bolt every 25 to 40 seconds
    const delay = 25000 + Math.random() * 15000;
    lightningTimeout = setTimeout(() => {
        if (state.currentTheme === 'rain-nature') {
            triggerLightning();
            scheduleLightning();
        }
    }, delay);
}

function triggerLightning() {
    const container = document.getElementById('lightningContainer');
    const path = document.getElementById('lightningPath');
    if (!container || !path) return;
    
    // Generate realistic branched lightning bolt in upper sky outside window (X: 520..840, Y: 0..240)
    const startX = 520 + Math.floor(Math.random() * 320);
    let currentX = startX;
    let currentY = 0;
    let d = `M ${currentX},${currentY}`;
    
    for (let i = 0; i < 5; i++) {
        currentY += 35 + Math.floor(Math.random() * 35);
        currentX += (Math.random() - 0.5) * 70;
        d += ` L ${Math.round(currentX)},${Math.round(currentY)}`;
        
        if (i === 2 && Math.random() > 0.4) {
            const branchX = currentX + (Math.random() > 0.5 ? 45 : -45);
            const branchY = currentY + 35;
            d += ` M ${Math.round(currentX)},${Math.round(currentY)} L ${Math.round(branchX)},${Math.round(branchY)} M ${Math.round(currentX)},${Math.round(currentY)}`;
        }
    }
    
    path.setAttribute('d', d);
    container.classList.remove('flash-active');
    void container.offsetWidth; // trigger reflow
    container.classList.add('flash-active');
}

function toggleFontDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('fontDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function closeFontDropdown() {
    const dropdown = document.getElementById('fontDropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

// Close font dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('fontDropdown');
    if (dropdown && dropdown.classList.contains('open') && !dropdown.contains(e.target)) {
        closeFontDropdown();
    }
});

function renderFonts() {
    const menu = document.getElementById('fontDropdownMenu');
    if (!menu) return;
    
    menu.innerHTML = fonts.map(font => `
        <div class="custom-dropdown-item ${state.currentFont === font.id ? 'active' : ''}" 
             onclick="selectFont('${font.id}')" data-font-id="${font.id}">
            <div class="dropdown-item-left">
                <span class="item-font-sample" style="font-family: ${font.family};">12:04</span>
                <span class="item-font-name" style="font-family: ${font.family};">${font.name}</span>
            </div>
            <svg class="item-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
    `).join('');
    
    updateFontDropdownDisplay(state.currentFont);
}

function updateFontDropdownDisplay(fontId) {
    const font = fonts.find(f => f.id === fontId) || fonts[0];
    const previewEl = document.getElementById('dropdownFontPreview');
    const textEl = document.getElementById('dropdownFontText');
    if (previewEl) {
        previewEl.style.fontFamily = font.family;
    }
    if (textEl) {
        textEl.textContent = font.name;
        textEl.style.fontFamily = font.family;
    }
    
    document.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.fontId === fontId);
    });
}

function selectFont(fontId) {
    setFont(fontId, true);
    closeFontDropdown();
}

function setFont(fontId, save = true) {
    state.currentFont = fontId;
    const font = fonts.find(f => f.id === fontId);
    if (font) {
        document.documentElement.style.setProperty('--font-display', font.family);
    }
    
    updateFontDropdownDisplay(fontId);
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

function toggleGreeting(show, save = true) {
    state.showGreeting = show;
    const greetingEl = document.getElementById('clockGreeting');
    if (greetingEl) {
        greetingEl.style.display = show ? '' : 'none';
    }
    const onBtn = document.getElementById('greetingOn');
    const offBtn = document.getElementById('greetingOff');
    if (onBtn) onBtn.classList.toggle('active', show);
    if (offBtn) offBtn.classList.toggle('active', !show);
    if (save) saveSettings();
}

function toggleDate(show, save = true) {
    state.showDate = show;
    const dateEl = document.getElementById('dateDisplay') || document.getElementById('clockDate');
    if (dateEl) {
        dateEl.style.display = show ? '' : 'none';
    }
    const onBtn = document.getElementById('dateOn');
    const offBtn = document.getElementById('dateOff');
    if (onBtn) onBtn.classList.toggle('active', show);
    if (offBtn) offBtn.classList.toggle('active', !show);
    if (save) saveSettings();
}

function toggleBlinkColon(blink, save = true) {
    state.blinkColon = blink;
    document.body.classList.toggle('no-blink-colon', !blink);
    const onBtn = document.getElementById('blinkOn');
    const offBtn = document.getElementById('blinkOff');
    if (onBtn) onBtn.classList.toggle('active', blink);
    if (offBtn) offBtn.classList.toggle('active', !blink);
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
    // Click on stopwatch display to toggle pause/play (works in normal and fullscreen modes)
    const swDisplay = document.querySelector('.stopwatch-display');
    if (swDisplay) {
        swDisplay.addEventListener('click', () => {
            swToggle();
        });
    }

    // Click on timer ring display to toggle pause/play (works in normal and fullscreen modes)
    const timerRingDisplay = document.querySelector('.timer-ring-display');
    if (timerRingDisplay) {
        timerRingDisplay.addEventListener('click', () => {
            if (state.timerRunning || state.timerRemaining > 0) {
                timerToggle();
            }
        });
    }

    // Click on focus timer container to toggle pause/play (works in normal and fullscreen modes)
    const focusRingContainer = document.querySelector('.focus-timer-container');
    if (focusRingContainer) {
        focusRingContainer.addEventListener('click', () => {
            focusToggle();
        });
    }
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
