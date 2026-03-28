// ==========================================
// Aqua Flow — Hydration Tracker v5.0
// ==========================================

class AquaFlow {
    constructor() {
        this.currentPage = 'home';
        this.userData = this.loadUserData();
        this.swReg = null;
        this.deferredInstall = null;
        this.reminderTimers = [];
        this.comboCount = 0;
        this.comboTimer = null;
        this.audioCtx = null;

        this.levels = [
            { name: 'Thirsty Noob',  icon: '💧', minXP: 0,    maxXP: 49 },
            { name: 'Water Warrior', icon: '⚔️',  minXP: 50,   maxXP: 149 },
            { name: 'Hydro Hero',    icon: '🌊',  minXP: 150,  maxXP: 349 },
            { name: 'Aqua Legend',   icon: '🏆',  minXP: 350,  maxXP: 699 },
            { name: 'Aqua God',      icon: '🌌',  minXP: 700,  maxXP: Infinity }
        ];

        this.achDefs = [
            { id: 'first_glass', icon: '💧', title: 'First Drop', desc: 'Drink your first glass', xp: 10, check: d => d.total >= 1 },
            { id: 'daily_goal',  icon: '🎯', title: 'Daily Champion', desc: 'Hit your daily goal', xp: 50, check: d => d.today >= d.goal },
            { id: 'streak_3',    icon: '🔥', title: 'On Fire', desc: '3-day streak', xp: 75, check: d => d.streak >= 3 },
            { id: 'streak_7',    icon: '📅', title: 'Week Warrior', desc: '7-day streak', xp: 150, check: d => d.streak >= 7 },
            { id: 'streak_30',   icon: '👑', title: 'Monthly Legend', desc: '30-day streak', xp: 750, check: d => d.streak >= 30 },
            { id: 'ten_today',   icon: '💪', title: 'Overachiever', desc: '10+ glasses in one day', xp: 60, check: d => d.today >= 10 },
            { id: 'early_bird',  icon: '🌅', title: 'Early Bird', desc: 'Log a glass before 8 AM', xp: 30, check: (d,m) => m && m.h < 8 },
            { id: 'night_owl',   icon: '🦉', title: 'Night Owl', desc: 'Log a glass after 9 PM', xp: 30, check: (d,m) => m && m.h >= 21 },
            { id: 'notifications', icon: '🔔', title: 'Smart User', desc: 'Enable notifications', xp: 20, check: d => d.notifs },
            { id: 'combo_5',     icon: '⚡', title: 'Combo Master', desc: 'Log 5 drinks in 1 hr', xp: 80, check: (d,m) => m && m.combo >= 5 }
        ];

        this.facts = [
            "Your brain is 73% water 🧠", "Hydration boosts metabolic rate by 30% 🔥", 
            "Muscles are 75% water — drink to perform! 💪", "Water flushes toxins naturally 🌿",
            "Headaches are often dehydration signs 💊", "Warm water aids digestion ☕", 
            "Hydrated skin looks more radiant ✨", "Cartilage is 80% water 🦴"
        ];

        this.healthTips = [
            { icon: '🧠', cat: 'COGNITIVE', text: "Your brain is 73% water. Even minor dehydration can shrink brain tissue, leading to fatigue, mood swings, and impaired short-term memory. Keep sipping to stay sharp!" },
            { icon: '🔥', cat: 'METABOLISM', text: "Drinking 500ml of water can temporarily increase your metabolic rate by up to 30%. This 'water-induced thermogenesis' helps your body burn calories more efficiently throughout the day." },
            { icon: '🧪', cat: 'DETOX', text: "Water is the primary engine for your kidneys. It helps filter waste products from your blood and flushes them through your system, preventing the buildup of toxins and maintaining 0-calorie purity." },
            { icon: '💪', cat: 'RECOVERY', text: "Proper hydration prevents muscle cramping and fatigue by maintaining electrolyte balance. It also lubricates the protein structures in your muscles, aiding faster repair after intense physical activity." },
            { icon: '🍽️', cat: 'APPETITE', text: "Drinking a glass of water 30 minutes before a meal can naturally reduce hunger and prevent overeating. Your brain often confuses thirst signals with hunger cues—try drinking first!" },
            { icon: '🍊', cat: 'IMMUNITY', text: "Hydration supports the production of lymph, a fluid that carries white blood cells and other immune system cells throughout the body. Stay hydrated to give your immune defense a natural boost." },
            { icon: '✨', cat: 'SKIN GLOW', text: "Water provides the essential moisture your skin needs to maintain elasticity and resilience. It helps flush out impurities that cause breakouts, leaving you with a healthy, natural, and radiant glow." },
            { icon: '⚖️', cat: 'VITALITY', text: "Water regulates your core temperature through sweating and respiration. It also maintains blood volume, ensuring your heart doesn't have to work overtime to deliver oxygen to your cells." },
            { icon: '🧘', cat: 'MOOD', text: "Research shows that consistent hydration is linked to lower levels of anxiety and tension. Dehydration can trigger a stress response in the body, so sip water to stay calm and collected." },
            { icon: '🦴', cat: 'JOINTS', text: "Cartilage is roughly 80% water. Proper hydration ensures your joints remain well-lubricated and cushioned, reducing the risk of friction-related pain and long-term wear and tear." }
        ];

        this.waterTips = [
            { h: [5, 10], icon: '☀️', temp: 'Warm', tip: 'Warm water in the morning boosts metabolism' },
            { h: [10, 16], icon: '💧', temp: 'Cold', tip: 'Cold water energizes your afternoon' },
            { h: [16, 21], icon: '🌄', temp: 'Room', tip: 'Room temp water is gentle for evening' },
            { h: [21, 5], icon: '🌙', temp: 'Warm', tip: 'Warm water before bed relaxes muscles' }
        ];

        this.toneDefs = {
            aqua: [{ f: 523, t: 0, d: 0.1 }, { f: 659, t: 0.1, d: 0.1 }],
            crystal: [{ f: 880, t: 0, d: 0.05 }, { f: 1760, t: 0.05, d: 0.1 }],
            wave: [{ f: 220, t: 0, d: 0.3, type: 'triangle' }, { f: 440, t: 0.1, d: 0.4, type: 'sine' }],
            zen: [{ f: 330, t: 0, d: 0.5, type: 'sine' }],
            morning: [{ f: 523, t: 0, d: 0.1 }, { f: 587, t: 0.1, d: 0.1 }, { f: 659, t: 0.2, d: 0.2 }]
        };

        this.init();
    }

    init() {
        this.setupRouting();
        this.registerSW();
        this.setupPWA();
        this.setupEvents();
        this.updateAll();
        this.startClock();
        
        if (this.userData.name) {
            this.showWelcomeBack();
            this.initTipCarousel();
        } else {
            this.initOnboardingInteractivity();
        }

        // Action from URL
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'drink' || location.pathname.includes('action=drink')) {
            setTimeout(() => { this.drinkWater(); this.goto('tracker'); }, 1000);
        }
    }

    // ==========================================
    // DATA
    // ==========================================
    loadUserData() {
        const saved = localStorage.getItem('aquaflowData');
        const def = {
            name: '', today: 0, todayML: 0, total: 0, goal: 8, streak: 0, bestStreak: 0, xp: 0,
            achievements: [], notifs: false, soundEnabled: true, selectedTone: 'aqua',
            intervalMins: 90, lastDate: new Date().toDateString(), history: [], recentSips: [],
            selectedMl: 250, sleepMode: false, sleepStart: '22:00', sleepEnd: '07:00',
            events: []
        };
        const data = saved ? JSON.parse(saved) : def;
        if (!data.events) data.events = [];
        if (data.lastDate !== new Date().toDateString()) {
            if (data.today < (data.goal || 8)) data.streak = 0;
            data.history.push({ date: data.lastDate, count: data.today, ml: data.todayML || 0 });
            if (data.history.length > 30) data.history.shift();
            data.today = 0; data.todayML = 0; data.recentSips = []; data.lastDate = new Date().toDateString();
            this.logEvent('Day Reset', `Started new day on ${data.lastDate}`);
        }
        return { ...def, ...data };
    }

    save() { localStorage.setItem('aquaflowData', JSON.stringify(this.userData)); }

    calculateSmartGoal() {
        const w = parseInt(this.userData.userWeight), act = this.userData.userActivity;
        if (!w || w < 30) { this.toast('⚠️ Calculator', 'Enter weight in settings!', 'info'); return; }
        let liters = w * 0.033;
        if (act === 'moderate') liters *= 1.2;
        if (act === 'active') liters *= 1.4;
        const recommended = Math.round(liters / 0.25);
        this.userData.goal = recommended; this.save(); this.updateAll();
        document.getElementById('recommendedGoal').textContent = recommended;
        document.getElementById('calcResult').classList.remove('hidden');
        this.toast('🎯 New Goal Set', `${recommended} glasses calculated!`, 'success');
    }

    // ==========================================
    // LOGIC
    // ==========================================
    drinkWater() {
        if (this.checkQuietHours()) { this.toast('😴 Sleep Mode', 'Reminders are paused during sleep.', 'info'); }
        const ml = this.userData.selectedMl || 250;
        this.userData.todayML += ml;
        this.userData.today = Math.round(this.userData.todayML / 250);
        this.userData.total++;
        this.userData.lastDate = new Date().toDateString();
        localStorage.setItem('lastDrinkTime', Date.now());

        // Add to recent sips
        this.userData.recentSips.unshift({ ml, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        if (this.userData.recentSips.length > 5) this.userData.recentSips.pop();

        clearTimeout(this.comboTimer);
        this.comboCount++;
        this.comboTimer = setTimeout(() => { this.comboCount = 0; this.hideCombo(); }, 3600000); // 1hr combo

        const comboMult = Math.min(this.comboCount, 5);
        const xp = Math.round((ml / 50) * comboMult);
        
        const g = this.getAdjustedGoal();
        const reached = this.userData.today >= g && (this.userData.today - (ml/250) < g);

        if (reached) {
            this.userData.streak++;
            if (this.userData.streak > this.userData.bestStreak) this.userData.bestStreak = this.userData.streak;
            this.awardXP(100, 'Daily Goal Hit! 🏆');
            this.playTone('goal');
            this.triggerConfetti();
        } else {
            this.awardXP(xp, `Drank ${ml}ml`);
            this.playTone('drink');
        }

        this.save();
        this.checkAchievements({ h: new Date().getHours(), combo: this.comboCount });
        this.updateAll();
        this.animateDrink();
        this.scheduleNextReminder();
        if (this.comboCount > 1) this.showCombo(this.comboCount);
    }

    awardXP(amt, reason) {
        const pLvl = this.getLevel().name;
        this.userData.xp += amt;
        this.save();
        this.updateXPBar();
        if (this.getLevel().name !== pLvl) { this.showLevelUp(this.getLevel()); this.playTone('levelup'); }
    }

    getLevel() {
        const xp = this.userData.xp || 0;
        return this.levels.find(l => xp >= l.minXP && xp < l.maxXP) || this.levels[4];
    }

    getAdjustedGoal() {
        let g = parseInt(this.userData.goal) || 8;
        if (this.userData.heatwave) g = Math.ceil(g * 1.2);
        return g;
    }

    checkAchievements(meta = {}) {
        const d = { ...this.userData, ...meta };
        this.achDefs.forEach(ach => {
            if (!this.userData.achievements.includes(ach.id) && ach.check(d, meta)) {
                this.userData.achievements.push(ach.id);
                this.logEvent('Achievement Unlocked', ach.title);
                this.save();
                this.awardXP(ach.xp, `Achievement: ${ach.title}`);
                this.toast('⭐ Achievement!', ach.title, 'success');
                this.playTone('achievement');
            }
        });
    }

    logEvent(action, detail) {
        if (!this.userData.events) this.userData.events = [];
        this.userData.events.unshift({
            time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action, detail
        });
        if (this.userData.events.length > 50) this.userData.events.pop();
    }

    showCombo(count) {
        let el = document.getElementById('comboBadge');
        if (!el) return;
        el.textContent = `${count}x Combo! 🔥`;
        el.classList.remove('hidden');
        el.classList.add('pulse-anim');
    }

    hideCombo() {
        let el = document.getElementById('comboBadge');
        if (el) el.classList.add('hidden');
    }

    checkQuietHours() {
        if (!this.userData.sleepMode) return false;
        const now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
        const start = this.userData.sleepStart.split(':').map(Number), startM = start[0]*60 + start[1];
        const end = this.userData.sleepEnd.split(':').map(Number), endM = end[0]*60 + end[1];
        return startM > endM ? (nowM >= startM || nowM < endM) : (nowM >= startM && nowM < endM);
    }

    // ==========================================
    // UI UPDATES
    // ==========================================
    updateAll() {
        this.updateHomeStats();
        this.updateTrackerPage();
        this.updateStatsPage();
        this.updateAchievements();
        this.updateNotifStatus();
        this.updateRecentSips();
    }

    updateRecentSips() {
        const list = document.getElementById('recentSipsList');
        if (!list) return;
        if (this.userData.recentSips.length === 0) {
            list.innerHTML = '<div class="empty-activity">No sips logged today yet.</div>';
            return;
        }
        list.innerHTML = this.userData.recentSips.map(s => `
            <div class="activity-item">
                <div class="activity-icon">💧</div>
                <div class="activity-details">
                    <span class="activity-ml">${s.ml}ml</span>
                    <span class="activity-time">${s.time}</span>
                </div>
            </div>
        `).join('');
    }

    updateHomeStats() {
        const p = this.userData.today, g = this.getAdjustedGoal();
        const pct = Math.min((p/g)*100, 100);
        const set = (id,v) => { let el=document.getElementById(id); if(el) el.textContent=v; };
        set('homeTodayGlasses', p); set('homeTodayGoal', `/${g}`);
        set('homeStreak', this.userData.streak); set('homeXP', this.userData.xp);
        set('homeProgressPct', `${Math.round(pct)}%`);
        let f = document.getElementById('homeProgressFill'); if(f) f.style.width=`${pct}%`;
        
        // Mini Level Progress
        const lvl = this.getLevel();
        const nLvl = this.levels[this.levels.indexOf(lvl)+1];
        const lPct = nLvl ? ((this.userData.xp - lvl.minXP) / (nLvl.minXP - lvl.minXP)) * 100 : 100;
        set('lvlMiniName', `${lvl.icon} ${lvl.name}`);
        set('lvlMiniXP', `${this.userData.xp} XP`);
        let mf = document.getElementById('lvlMiniFill'); if(mf) mf.style.width=`${lPct}%`;

        // Update greeting based on time
        this.updateTimeContext();
    }

    updateTimeContext() {
        const h = new Date().getHours();
        const msg = document.getElementById('timeOfDayMsg');
        const textWrap = document.querySelector('.greeting-text');
        if (!msg || !textWrap) return;
        
        textWrap.classList.remove('morning-color', 'afternoon-color', 'night-color');
        if (h >= 0 && h < 12) { 
            textWrap.classList.add('morning-color'); msg.textContent = 'Good Morning'; 
        } else if (h >= 12 && h < 16) { 
            textWrap.classList.add('afternoon-color'); msg.textContent = 'Good Afternoon'; 
        } else { 
            textWrap.classList.add('night-color'); msg.textContent = 'Good Evening'; 
        }
    }

    startClock() {
        const update = () => {
            const now = new Date();
            const timeEl = document.getElementById('wbDigitalClock');
            const dayEl = document.getElementById('wbDayBadge');
            if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            if (dayEl) dayEl.textContent = now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
        };
        update();
        setInterval(update, 1000);
    }

    updateTrackerPage() {
        const p = this.userData.today, g = this.getAdjustedGoal(), pct = Math.min((p/g)*100, 100);
        const set = (id,v) => { let el=document.getElementById(id); if(el) el.textContent=v; };
        set('currentGlasses', p); set('dailyGoal', g); set('progressText', `${Math.round(pct)}%`);
        set('currentStreak', this.userData.streak); set('trackerXP', this.userData.xp);
        
        const lvl = this.getLevel();
        set('currentLevel', lvl.name.split(' ')[1] || lvl.name);

        let f=document.getElementById('progressFill'), wf=document.getElementById('waterFill');
        if(f) f.style.width=`${pct}%`; if(wf) wf.style.height=`${pct}%`;
        let lbl=document.getElementById('glassLabel');
        if(lbl) lbl.textContent = p>=g?'Goal reached! 🏆':(p>g/2?'Looking good! 🔥':'Keep drinking! 💧');
        this.updateXPBar();
    }

    updateXPBar() {
        const lvl = this.getLevel(), xp = this.userData.xp;
        const nLvl = this.levels[this.levels.indexOf(lvl)+1];
        const pct = nLvl ? ((xp - lvl.minXP) / (nLvl.minXP - lvl.minXP)) * 100 : 100;
        const set = (id,v) => { let el=document.getElementById(id); if(el) el.textContent=v; };
        set('xpLevelName', `${lvl.icon} ${lvl.name}`); set('xpAmount', `${xp} XP`);
        let f=document.getElementById('xpFill'); if(f) f.style.width=`${pct}%`;
        set('xpNext', nLvl ? `${nLvl.minXP - xp} XP to level up` : 'Max level achieved! 🌌');
    }



    updateStatsPage() {
        const p = this.userData.today, g = this.getAdjustedGoal(), pct = Math.min((p/g)*100, 100);
        const set = (id,v) => { let el=document.getElementById(id); if(el) el.textContent=v; };
        set('totalGlassesCount', this.userData.total); set('bestStreak', this.userData.bestStreak); set('totalXPCount', this.userData.xp); set('todayPercent', `${Math.round(pct)}%`);
        let c=document.getElementById('todayCircle'); if(c) c.style.strokeDashoffset = 314 - (314 * pct/100);
        let h=document.getElementById('weeklyHeatmap'); if(!h) return;
        h.innerHTML = (this.userData.history || []).slice(-7).map(d => `<div class="wb-col"><div class="wb-bar ${d.count>=8?'wb-full':'wb-partial'}" style="height:${Math.min(d.count*10,100)}%"></div></div>`).join('');
    }

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    async requestNotifPerm() {
        if (!('Notification' in window)) return;
        const res = await Notification.requestPermission();
        this.userData.notifs = (res === 'granted');
        this.save(); this.updateNotifStatus();
        if(res === 'granted') this.toast('🔔 Enabled!', 'You will get sips reminders.', 'success');
    }

    updateNotifStatus() {
        let el = document.getElementById('notifStatus'); if(!el) return;
        let perm = Notification.permission;
        el.textContent = perm === 'granted' ? 'Active' : (perm === 'denied' ? 'Blocked' : 'Tap to Enable');
        el.className = `notif-status notif-${perm === 'granted'?'ok':(perm==='denied'?'denied':'default')}`;
    }

    scheduleNextReminder() {
        if(!this.userData.notifs) return;
        this.reminderTimers.forEach(clearTimeout);
        // Local timer for when app is active
        const delay = (this.userData.intervalMins || 90) * 60000;
        this.reminderTimers.push(setTimeout(() => {
            if(!this.checkQuietHours()) this.sendSysNotif('💧 Sip Check!', 'Getting a bit thirsty? Stay hydrated! 🌊');
            this.scheduleNextReminder();
        }, delay));

        // Background / SW Scheduling
        if (this.swReg) {
            this.swReg.active?.postMessage({
                type: 'SCHEDULE_REMINDER',
                data: { ...this.userData, glasses: this.userData.today, delayMs: delay }
            });
        }
    }

    sendSysNotif(title, body) {
        if(!this.userData.notifs || Notification.permission !== 'granted') return;
        if(this.swReg) this.swReg.showNotification(title, { body, icon: '/icons/icon-192.png', vibrate: [200, 100, 200], actions: [{action:'drink', title:'Log Sip'}] });
        this.playTone('reminder');
    }

    // ==========================================
    // HELPERS & EVENTS
    // ==========================================
    setupEvents() {
        document.querySelectorAll('[data-page]').forEach(el => el.onclick = () => this.goto(el.dataset.page));
        let goBtn = document.getElementById('startJourney'); if(goBtn) goBtn.onclick = () => this.startJourney();
        let drkBtn = document.getElementById('drinkBtn'); if(drkBtn) drkBtn.onclick = () => this.drinkWater();
        
        let wgtIn = document.getElementById('userWeight'); if(wgtIn) { wgtIn.value = this.userData.userWeight || ''; wgtIn.oninput = e => { this.userData.userWeight = e.target.value; this.save(); }; }
        let actSlc = document.getElementById('userActivity'); if(actSlc) { actSlc.value = this.userData.userActivity || 'moderate'; actSlc.onchange = e => { this.userData.userActivity = e.target.value; this.save(); }; }
        let calcBtn = document.getElementById('calcGoalBtn'); if(calcBtn) calcBtn.onclick = () => this.calculateSmartGoal();

        let hwTgl = document.getElementById('heatwaveToggle'); if(hwTgl) { hwTgl.checked = !!this.userData.heatwave; hwTgl.onchange = e => { this.userData.heatwave = e.target.checked; this.save(); this.updateAll(); }; }

        document.querySelectorAll('.size-btn').forEach(btn => btn.onclick = () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
            this.userData.selectedMl = parseInt(btn.dataset.ml); this.save();
        });

        let ntBtn = document.getElementById('notificationsToggle'); if(ntBtn) ntBtn.onclick = () => this.requestNotifPerm();
        let testBtn = document.getElementById('testNotificationBtn'); if(testBtn) testBtn.onclick = () => this.sendSysNotif('💧 Test Drink Reminder!', 'Aqua Flow is working! Stay hydrated. 🌊');
        let soundTgl = document.getElementById('soundToggle'); if(soundTgl) { soundTgl.checked = this.userData.soundEnabled; soundTgl.onchange = e => { this.userData.soundEnabled = e.target.checked; this.save(); }; }
        let toneSlc = document.getElementById('toneSelect'); if(toneSlc) { toneSlc.value = this.userData.selectedTone || 'aqua'; toneSlc.onchange = e => { this.userData.selectedTone = e.target.value; this.save(); this.playTone('drink'); }; }
        let testSnd = document.getElementById('testSoundBtn'); if(testSnd) testSnd.onclick = () => this.playTone('reminder');

        // Modal buttons
        let nEnb = document.getElementById('notif-enable-btn'); if(nEnb) nEnb.onclick = () => { this.requestNotifPerm(); this.closeNotifModal(); };
        let nLat = document.getElementById('notif-later-btn'); if(nLat) nLat.onclick = () => this.closeNotifModal();
        
        // History & Settings
        let vhBtn = document.getElementById('viewHistoryBtn'); if(vhBtn) vhBtn.onclick = () => this.showHistory();
        let chBtn = document.getElementById('closeHistoryBtn'); if(chBtn) chBtn.onclick = () => document.getElementById('history-modal').classList.add('hidden');
        
        let resBtn = document.getElementById('resetDataBtn'); if(resBtn) resBtn.onclick = () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
            }
        };
        
        // Urgency
        document.querySelectorAll('.history-tab').forEach(t => t.onclick = () => {
            document.querySelectorAll('.history-tab').forEach(x => x.classList.remove('active'));
            t.classList.add('active'); this.updateHistoryBody(t.dataset.tab);
        });

        let instBtn = document.getElementById('installActionBtn'); if(instBtn) instBtn.onclick = () => this.installPWA();
        let closeInst = document.getElementById('closeInstallBanner'); if(closeInst) closeInst.onclick = () => {
            document.getElementById('installBanner').classList.add('hidden');
            localStorage.setItem('pwaPrompted', 'true');
        };
    }



    // ==========================================
    // HISTORY
    // ==========================================
    showHistory() {
        const m = document.getElementById('history-modal');
        if (m) { m.classList.remove('hidden'); this.updateHistoryBody('recent'); }
    }

    updateHistoryBody(tab) {
        const body = document.getElementById('historyBody');
        const thead = document.getElementById('historyThead');
        if (!body || !thead) return;

        if (tab === 'recent') {
            thead.innerHTML = '<tr><th>Time</th><th>Action</th><th>Amount</th></tr>';
            if (!this.userData.recentSips || this.userData.recentSips.length === 0) { body.innerHTML = '<tr><td colspan="3" class="empty-history">No sips recorded today.</td></tr>'; return; }
            body.innerHTML = this.userData.recentSips.map(s => `<tr><td>${s.time}</td><td><span class="history-chip">💧 Sip</span></td><td><strong>${s.ml}ml</strong></td></tr>`).join('');
        } else if (tab === 'weekly') {
            thead.innerHTML = '<tr><th>Date</th><th>Glasses</th><th>Status</th></tr>';
            if (!this.userData.history || this.userData.history.length === 0) { body.innerHTML = '<tr><td colspan="3" class="empty-history">No past records found.</td></tr>'; return; }
            body.innerHTML = this.userData.history.map(h => `<tr><td>${h.date}</td><td><strong>${h.count}</strong></td><td><span class="history-chip ${h.count >= this.userData.goal ? 'success' : ''}">${h.count >= this.userData.goal ? 'Done' : 'Missed'}</span></td></tr>`).join('');
        } else if (tab === 'events') {
            thead.innerHTML = '<tr><th>Date/Time</th><th>Event</th><th>Description</th></tr>';
            if (!this.userData.events || this.userData.events.length === 0) { body.innerHTML = '<tr><td colspan="3" class="empty-history">No events recorded.</td></tr>'; return; }
            body.innerHTML = this.userData.events.map(e => `<tr><td>${e.time}</td><td><span class="history-chip neutral">${e.action}</span></td><td>${e.detail}</td></tr>`).join('');
        }
    }

    // ==========================================
    // ONBOARDING
    // ==========================================
    initOnboardingInteractivity() {
        const input = document.getElementById('userName');
        const bar = document.getElementById('onboardingBar');
        const liquid = document.getElementById('onboardingLiquid');
        if (!input) return;
        input.oninput = () => {
            const pct = Math.min((input.value.length / 10) * 100, 100);
            if (bar) bar.style.width = `${pct}%`;
            if (liquid) liquid.style.height = `${pct/2}%`;
        };
    }

    maybeShowNotifModal() {
        if (Notification.permission === 'default' && !this.userData.notifs) {
            let m = document.getElementById('notif-modal'); if(m) { m.classList.remove('hidden'); setTimeout(()=>m.classList.add('visible'), 50); }
        }
    }

    closeNotifModal() { let m = document.getElementById('notif-modal'); if(m) { m.classList.remove('visible'); setTimeout(()=>m.classList.add('hidden'), 350); } }

    setupRouting() {
        const map = { '/': 'home', '/home': 'home', '/tracker': 'tracker', '/stats': 'stats', '/settings': 'about', '/about': 'about' };
        const page = map[location.pathname] || 'home';
        this.currentPage = page;
        this._switchPage(page);
        window.addEventListener('popstate', e => { if (e.state?.page) this._switchPage(e.state.page); });
    }

    goto(page) {
        const urlMap = { home: '/', tracker: '/tracker', stats: '/stats', about: '/settings' };
        history.pushState({ page }, '', urlMap[page] || '/');
        this._switchPage(page);
    }

    getAudioCtx() {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return this.audioCtx;
    }

    playTone(type = 'drink') {
        if (!this.userData.soundEnabled) return;
        try {
            const ctx = this.getAudioCtx();
            const toneKey = (type === 'reminder') ? (this.userData.selectedTone || 'aqua') : 'aqua';
            const extra = {
                achievement: [{ f: 440, t: 0, d: 0.1 }, { f: 880, t: 0.2, d: 0.2 }],
                levelup: [{ f: 523, t: 0, d: 0.2 }, { f: 1047, t: 0.2, d: 0.3 }],
                goal: [{ f: 523, t: 0, d: 0.1 }, { f: 784, t: 0.2, d: 0.3 }]
            };
            const seq = extra[type] || this.toneDefs[toneKey] || this.toneDefs.aqua;
            const now = ctx.currentTime;
            seq.forEach(({ f, t, d, type: oscType }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = oscType || 'sine';
                osc.frequency.value = f;
                gain.gain.setValueAtTime(0.1, now + t);
                gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now + t); osc.stop(now + t + d);
            });
        } catch (_) {}
    }

    _switchPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `${page}-page`));
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.page === page);
            b.setAttribute('aria-selected', b.dataset.page === page ? 'true' : 'false');
        });
        this.currentPage = page;
        this.updateAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    startJourney() {
        let name = document.getElementById('userName').value.trim();
        if(!name) return; this.userData.name = name; this.save();
        this.showWelcomeBack(); this.goto('tracker');
    }

    showWelcomeBack() {
        let ws=document.getElementById('welcome-section'), wbs=document.getElementById('welcome-back-section');
        if(ws) ws.classList.add('hidden'); if(wbs) wbs.classList.remove('hidden');
        let n=document.getElementById('userNameDisplay'); if(n) n.textContent = this.userData.name;
    }

    async registerSW() { if('serviceWorker' in navigator) this.swReg = await navigator.serviceWorker.register('/sw.js'); }
    setupPWA() { 
        window.addEventListener('beforeinstallprompt', e => { 
            e.preventDefault(); 
            this.deferredInstall = e; 
            // Show install banner if they haven't seen it recently
            if (!localStorage.getItem('pwaPrompted') && this.userData.name) {
                this.showInstallBanner();
            }
        }); 
    }

    showInstallBanner() {
        let b = document.getElementById('installBanner');
        if (b) { b.classList.remove('hidden'); setTimeout(()=>b.classList.add('visible'), 50); }
    }

    async installPWA() {
        if (!this.deferredInstall) return;
        this.deferredInstall.prompt();
        const { outcome } = await this.deferredInstall.userChoice;
        if (outcome === 'accepted') {
            this.awardXP(100, 'Installed Aqua Flow 📱');
            localStorage.setItem('pwaPrompted', 'true');
            let b = document.getElementById('installBanner');
            if (b) b.classList.add('hidden');
        }
        this.deferredInstall = null;
    }

    toast(title, msg, type) {
        let p=document.getElementById('toast-popup'); if(!p) return;
        document.getElementById('toastTitle').textContent=title; document.getElementById('toastMsg').textContent=msg;
        p.className = `toast-popup toast-${type}`; p.classList.remove('hidden');
        setTimeout(() => p.classList.add('hidden'), 4000);
    }

    animateDrink() { 
        let b = document.getElementById('drinkBtn'); if (b) { b.classList.add('drinking'); setTimeout(() => b.classList.remove('drinking'), 600); } 
        this.showRandomFact();
    }

    showRandomFact() {
        const el = document.getElementById('funFact'); if(!el) return;
        el.textContent = this.facts[Math.floor(Math.random()*this.facts.length)];
    }

    updateAchievements() {
        const grid = document.getElementById('achievementsGrid'); if(!grid) return;
        grid.innerHTML = this.achDefs.map(ach => {
            const earned = this.userData.achievements.includes(ach.id);
            return `<div class="ach-card ${earned?'earned':'locked'}"><div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-title">${ach.title}</div><div class="ach-desc">${ach.desc}</div></div></div>`;
        }).join('');
    }

    showLevelUp(lvl) {
        let o = document.getElementById('level-up-overlay'); if(!o) return;
        document.getElementById('levelUpEmoji').textContent = lvl.icon;
        document.getElementById('levelUpName').textContent = lvl.name;
        o.classList.remove('hidden'); setTimeout(()=>o.classList.add('visible'), 50);
        this.triggerConfetti();
    }

    triggerConfetti() {
        let c = document.createElement('div'); c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999;';
        for(let i=0; i<30; i++) {
            let p=document.createElement('div'); p.textContent=['💧','✨','⭐','🌊','💎'][Math.floor(Math.random()*5)];
            p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:-50px;font-size:${15+Math.random()*20}px;animation:cFall ${2+Math.random()*2}s linear forwards;`;
            c.appendChild(p);
        }
        document.body.appendChild(c); setTimeout(()=>c.remove(), 5000);
    }

    initTipCarousel() {
        const update = () => {
            const t = this.healthTips[Math.floor(Math.random() * this.healthTips.length)];
            const ic = document.getElementById('tipIcon'), tx = document.getElementById('tipText'), vi = document.getElementById('tipVisual'), tl = document.getElementById('tipLabel');
            if (ic) ic.textContent = t.icon; if (tx) tx.textContent = t.text;
            if (tl) tl.textContent = t.cat;
            if (vi) {
                const colors = ['#00ffff', '#ff00ff', '#00ffaa', '#ffaa00', '#0088ff'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                vi.style.background = `radial-gradient(circle at 70% 30%, ${color}33, transparent), linear-gradient(135deg, ${color}11, transparent)`;
                vi.innerHTML = `<span class="visual-symbol" style="color:${color}aa">${t.icon}</span>`;
            }
        };

        // Handle manual next button
        let nx = document.getElementById('tipNextBtn');
        if (nx) nx.onclick = () => {
            clearInterval(this.tipInterval);
            update();
            this.tipInterval = setInterval(update, 8000);
        };
        // Setup automatic interval
        if (this.tipInterval) clearInterval(this.tipInterval);
        this.tipInterval = setInterval(update, 8000);
    }
}

document.addEventListener('DOMContentLoaded', () => window.aquaFlow = new AquaFlow());
