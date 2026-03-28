// ==========================================
// Aqua Flow — Service Worker v4.0
// ==========================================

const CACHE = 'aquaflow-v4';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json'];

// ── Install ──
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// ── Activate ──
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// ── Fetch (network-first, fallback to cache, then SPA fallback) ──
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    
    // SPA / Client-side routing: if navigating to a clean URL, serve index.html
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    e.respondWith(
        fetch(e.request).then(res => {
            if (res.ok) {
                const c = res.clone();
                caches.open(CACHE).then(ch => ch.put(e.request, c));
            }
            return res;
        }).catch(() => caches.match(e.request))
    );
});

// ── Background reminder timers ──
let bgReminderTimer = null;

// ── Message from main app ──
self.addEventListener('message', e => {
    const { type, data } = e.data || {};
    if (type === 'SCHEDULE_REMINDER') {
        clearTimeout(bgReminderTimer);
        bgReminderTimer = setTimeout(() => {
            sendSmartReminder(data);
        }, data.delayMs || 90 * 60 * 1000);
    }
});

// ── Notification click ──
self.addEventListener('notificationclick', e => {
    e.notification.close();
    const { action } = e;
    const notifData = e.notification.data || {};

    if (action === 'drink') {
        // Log water directly via message to tab, or open with action
        e.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
                const existing = clients.find(c => c.visibilityState === 'visible' || c.url.includes(self.location.origin));
                if (existing) {
                    existing.focus();
                    existing.postMessage({ type: 'DRINK_WATER' });
                } else {
                    self.clients.openWindow(`/?action=drink`);
                }
            })
        );
    } else if (action === 'snooze') {
        // Snooze 30 minutes
        clearTimeout(bgReminderTimer);
        bgReminderTimer = setTimeout(() => {
            sendSmartReminder(notifData.userData || {});
        }, 15 * 60 * 1000);
    } else {
        // Default click — open app
        e.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clients => {
                const existing = clients.find(c => c.url.includes(self.location.origin));
                if (existing) { existing.focus(); }
                else { self.clients.openWindow('/tracker'); }
            })
        );
    }
});

// ── Push event (from VAPID push, if implemented) ──
self.addEventListener('push', e => {
    let payload = { title: '💧 Aqua Flow', body: 'Time to hydrate! Drink a glass of water now.' };
    try { payload = e.data?.json() || payload; } catch (_) {}
    e.waitUntil(showReminderNotif(payload.title, payload.body, {}));
});

// ── Periodic background sync ──
self.addEventListener('periodicsync', e => {
    if (e.tag === 'aquaflow-check') {
        e.waitUntil(sendSmartReminder({}));
    }
});

// ── Smart reminder builder ──
function buildMessage(data = {}) {
    const h = new Date().getHours();
    const name = data.name || 'friend';
    const glasses = data.glasses || 0;
    const goal = data.goal || 8;
    const streak = data.streak || 0;
    const rem = Math.max(0, goal - glasses);

    // Early morning warm water
    if (h >= 5 && h < 8 && glasses === 0) return {
        title: `☀️ Good morning, ${name}!`,
        body: `Kick off with a warm glass of water — boosts metabolism & digestion! ${streak > 0 ? `🔥 ${streak}-day streak — keep it alive!` : 'Start your hydration streak today!'}`
    };
    // Not yet started
    if (glasses === 0) return {
        title: `💧 Hydration Check, ${name}!`,
        body: `You haven't logged any water yet today! ${streak > 0 ? `Your ${streak}-day streak is at risk! 🔥` : 'Start now and build your streak!'}`
    };
    // Goal reached
    if (glasses >= goal) return {
        title: `🏆 You crushed it, ${name}!`,
        body: `${goal} glasses done for today! ${streak > 0 ? `🔥 ${streak}-day streak is strong!` : 'What a great day!'}`
    };
    // Evening streak reminder
    if (h >= 19 && rem > 0 && streak >= 3) return {
        title: `🔥 Streak Alert! ${streak} Days!`,
        body: `${name}, ${rem} glass${rem > 1 ? 'es' : ''} left to protect your streak! Don't let it break tonight. 🌙`
    };
    // Late evening
    if (h >= 21 && rem > 0) return {
        title: `🌙 One last push, ${name}!`,
        body: `${rem} glass${rem > 1 ? 'es' : ''} left for today — finish strong! Room temp water is best before sleep. 😴`
    };
    // Water temp tips
    const tips = [
        { t: [5, 9],  msg: '☀️ Warm water in the morning aids digestion.' },
        { t: [9, 13], msg: '💧 Cold water now boosts morning energy!' },
        { t: [13,17], msg: '🧊 Cold water after lunch keeps energy up.' },
        { t: [17,20], msg: '🌅 Warm water in the evening relaxes muscles.' },
        { t: [20,24], msg: '🌙 Room temp water is gentle before sleep.' },
    ];
    const tipObj = tips.find(t => h >= t.t[0] && h < t.t[1]) || tips[1];

    // Health tips rotation
    const healthMessages = [
        `${rem} glass${rem > 1 ? 'es' : ''} left for today. ${tipObj.msg}`,
        `Dehydration causes fatigue & headaches. Drink now! Your body needs it. 🔬`,
        `Your brain is 75% water — keep it sharp! ${rem} left today. 🧠`,
        `${rem} more glass${rem > 1 ? 'es' : ''} = goal complete! ${tipObj.msg}`,
        `Water helps flush toxins & transport nutrients. ${rem} left! 🌿`,
    ];

    return {
        title: `💧 Reminder, ${name}! (${glasses}/${goal} today)`,
        body: healthMessages[Math.floor(Math.random() * healthMessages.length)]
    };
}

async function sendSmartReminder(data) {
    const msg = buildMessage(data);
    return showReminderNotif(msg.title, msg.body, data);
}

async function showReminderNotif(title, body, userData) {
    const icon = "/icons/icon-512.png";
    const badge = "/icons/icon-192.png";
    return self.registration.showNotification(title, {
        body,
        icon,
        badge,
        tag: 'aquaflow-reminder',
        renotify: true,              // always show, even if same tag exists
        requireInteraction: true,    // keep on lockscreen until user acts
        silent: false,               // trigger device sound + vibration
        vibrate: [300, 100, 300, 100, 600],  // long-short-long pattern
        timestamp: Date.now(),
        data: { url: '/?action=drink', userData },
        actions: [
            { action: 'drink',  title: '💧 Log a Sip' },
            { action: 'snooze', title: '⏰ Snooze 15m' }
        ]
    });
}