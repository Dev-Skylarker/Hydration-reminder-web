class HydrationTracker {
    constructor() {
        this.currentPage = 'home';
        this.userData = this.loadUserData();
        this.notificationPermission = 'default';
        this.reminderInterval = null;
        
        // Fun facts about hydration
        this.funFacts = [
            "75% of your brain is water. Stay sharp 🧠💧",
            "Your mood improves with every sip 💙",
            "Hydrate before you dehydrate!",
            "Water helps your skin glow ✨",
            "Proper hydration boosts your energy levels ⚡",
            "Your muscles are 75% water 💪",
            "Drinking water helps flush out toxins 🌿",
            "Water regulates your body temperature 🌡️",
            "Every cell in your body needs water to function",
            "Dehydration can cause headaches and fatigue",
            "Water helps transport nutrients throughout your body",
            "Drinking water can improve your concentration 🎯"
        ];

        // Achievement definitions
        this.achievements = [
            { id: 'first_glass', title: 'First Drop', desc: 'Drink your first glass', icon: '💧', unlocked: false },
            { id: 'daily_goal', title: 'Daily Champion', desc: 'Complete daily goal', icon: '🏆', unlocked: false },
            { id: 'three_day_streak', title: 'Commitment', desc: '3-day streak', icon: '🔥', unlocked: false },
            { id: 'week_streak', title: 'Dedicated', desc: '7-day streak', icon: '📅', unlocked: false },
            { id: 'hundred_glasses', title: 'Century Club', desc: '100 total glasses', icon: '💯', unlocked: false },
            { id: 'hydro_hero', title: 'Hydro Hero', desc: 'Reach Hydro Hero level', icon: '🌊', unlocked: false }
        ];

        this.levels = [
            { name: 'Thirsty Noob', min: 0, max: 49, icon: '💧' },
            { name: 'Water Warrior', min: 50, max: 149, icon: '⚔️' },
            { name: 'Hydro Hero', min: 150, max: 299, icon: '🌊' },
            { name: 'Aqua Legend', min: 300, max: 499, icon: '🏆' },
            { name: 'Aqua God', min: 500, max: Infinity, icon: '🌌' }
        ];

        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.updateDisplay();
        this.startReminderSystem();
        this.showRandomFact();
        
        // Check if user is returning
        if (this.userData.userName) {
            this.showWelcomeBackSection();
        }

        // Prompt for notifications if not set
        setTimeout(() => {
            this.checkNotificationPrompt();
        }, 3000);
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('SW registration successful');
            } catch (error) {
                console.log('SW registration failed: ', error);
            }
        }
    }

    loadUserData() {
        const defaultData = {
            userName: '',
            glassesDrankToday: 0,
            lastDrinkDate: null,
            hydrationStreak: 0,
            bestStreak: 0,
            totalGlassesDrank: 0,
            dailyGoal: 8,
            notificationsEnabled: false,
            achievements: []
        };

        try {
            const saved = localStorage.getItem('hydrationData');
            const data = saved ? JSON.parse(saved) : defaultData;
            
            // Reset daily progress if it's a new day
            this.checkAndResetDaily(data);
            
            return { ...defaultData, ...data };
        } catch (error) {
            console.error('Error loading user data:', error);
            return defaultData;
        }
    }

    saveUserData() {
        try {
            localStorage.setItem('hydrationData', JSON.stringify(this.userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    checkAndResetDaily(data) {
        const today = new Date().toDateString();
        const lastDate = data.lastDrinkDate;
        
        if (lastDate && lastDate !== today) {
            // New day detected - check if we need to update streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toDateString();
            
            if (lastDate === yesterdayString) {
                // Last drink was yesterday
                if (data.glassesDrankToday >= data.dailyGoal) {
                    // Met goal yesterday, maintain streak
                    console.log('Goal met yesterday, maintaining streak');
                } else {
                    // Didn't meet goal yesterday, reset streak
                    data.hydrationStreak = 0;
                    console.log('Goal not met yesterday, streak reset');
                }
            } else {
                // Gap in days, reset streak
                data.hydrationStreak = 0;
                console.log('Gap in days detected, streak reset');
            }
            
            // Always reset daily progress for new day
            data.glassesDrankToday = 0;
            
            // Store yesterday's data in history
            this.storeHistoricalData(data, lastDate);
        }
        
        // Update last drink date to today
        data.lastDrinkDate = today;
    }

    storeHistoricalData(data, date) {
        try {
            const historyKey = 'hydrationHistory';
            let history = JSON.parse(localStorage.getItem(historyKey)) || {};
            
            // Store the day's data
            history[date] = {
                glasses: data.glassesDrankToday,
                goal: data.dailyGoal,
                goalMet: data.glassesDrankToday >= data.dailyGoal,
                streak: data.hydrationStreak
            };
            
            // Keep only last 30 days to manage storage
            const dates = Object.keys(history).sort();
            if (dates.length > 30) {
                const toDelete = dates.slice(0, dates.length - 30);
                toDelete.forEach(date => delete history[date]);
            }
            
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (error) {
            console.error('Error storing historical data:', error);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Home page actions
        const startJourneyBtn = document.getElementById('startJourney');
        const userNameInput = document.getElementById('userName');
        
        if (startJourneyBtn) {
            startJourneyBtn.addEventListener('click', () => this.startJourney());
        }
        
        if (userNameInput) {
            userNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.startJourney();
            });
        }

        // Tracker page actions
        const drinkBtn = document.getElementById('drinkBtn');
        if (drinkBtn) {
            drinkBtn.addEventListener('click', () => this.drinkWater());
        }

        // Settings
        const dailyGoalInput = document.getElementById('dailyGoalInput');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const resetDataBtn = document.getElementById('resetDataBtn');

        if (dailyGoalInput) {
            dailyGoalInput.addEventListener('change', (e) => {
                this.userData.dailyGoal = parseInt(e.target.value);
                this.saveUserData();
                this.updateDisplay();
            });
        }

        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.userData.notificationsEnabled = e.target.checked;
                this.saveUserData();
                if (e.target.checked) {
                    this.requestNotificationPermission();
                }
            });
        }

        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => this.resetAllData());
        }

        // Test notification button
        const testNotificationBtn = document.getElementById('testNotificationBtn');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => this.testNotification());
        }

        // Notification popup close
        const closeNotificationBtn = document.querySelector('.close-notification');
        if (closeNotificationBtn) {
            closeNotificationBtn.addEventListener('click', () => {
                document.getElementById('notification-popup').classList.add('hidden');
            });
        }
    }

    navigateToPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-page="${page}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update display for the current page
        this.updateDisplay();
    }

    startJourney() {
        const nameInput = document.getElementById('userName');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showNotification('Please enter your name!', 'error');
            return;
        }

        this.userData.userName = name;
        this.userData.lastDrinkDate = new Date().toDateString();
        this.saveUserData();
        
        this.showWelcomeBackSection();
        this.showNotification(`Welcome to AquaFlow, ${name}! 🌊`, 'success');
        
        // Auto-navigate to tracker after a moment
        setTimeout(() => {
            this.navigateToPage('tracker');
        }, 2000);
    }

    showWelcomeBackSection() {
        const welcomeSection = document.getElementById('welcome-section');
        const welcomeBackSection = document.getElementById('welcome-back-section');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const hydrationStatus = document.getElementById('hydrationStatus');

        if (welcomeSection) welcomeSection.classList.add('hidden');
        if (welcomeBackSection) welcomeBackSection.classList.remove('hidden');
        if (userNameDisplay) userNameDisplay.textContent = this.userData.userName;
        
        if (hydrationStatus) {
            const progress = this.userData.glassesDrankToday;
            const goal = this.userData.dailyGoal;
            
            if (progress === 0) {
                hydrationStatus.textContent = "You haven't hydrated yet. Drink now! 💧";
            } else if (progress < goal) {
                hydrationStatus.textContent = `${progress}/${goal} glasses down. Keep going! 🚀`;
            } else {
                hydrationStatus.textContent = "You're fully hydrated! 🥳💧";
            }
        }
    }

    drinkWater() {
        const today = new Date().toDateString();
        const currentTime = new Date().getTime();
        
        // Update drink count
        this.userData.glassesDrankToday++;
        this.userData.totalGlassesDrank++;
        this.userData.lastDrinkDate = today;
        
        // Track last drink time for smart reminders
        localStorage.setItem('lastDrinkTime', currentTime.toString());

        // Check if daily goal is reached for the first time today
        const goalJustReached = this.userData.glassesDrankToday === this.userData.dailyGoal;
        if (goalJustReached) {
            this.userData.hydrationStreak++;
            if (this.userData.hydrationStreak > this.userData.bestStreak) {
                this.userData.bestStreak = this.userData.hydrationStreak;
            }
        }

        this.saveUserData();
        this.updateDisplay();
        this.checkAchievements();
        this.animateWaterFill();
        this.showRandomFact();

        // Celebration messages
        if (goalJustReached) {
            this.showNotification("Daily goal achieved! You're a hydration champion!", 'success');
            this.triggerCelebration();
        } else if (this.userData.glassesDrankToday === 1) {
            this.showNotification("Great start! First glass of the day", 'success');
        } else {
            const remaining = this.userData.dailyGoal - this.userData.glassesDrankToday;
            if (remaining > 0) {
                this.showNotification(`Awesome! ${remaining} more glasses to go!`, 'success');
            } else {
                this.showNotification("Excellent! You're exceeding your daily goal!", 'success');
            }
        }

        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }

    animateWaterFill() {
        const waterFill = document.getElementById('waterFill');
        if (!waterFill) return;

        const progress = this.userData.glassesDrankToday;
        const goal = this.userData.dailyGoal;
        const percentage = Math.min((progress / goal) * 100, 100);
        
        waterFill.style.height = `${percentage}%`;

        // Add animation effect
        waterFill.classList.add('filling');
        setTimeout(() => {
            waterFill.classList.remove('filling');
        }, 800);
    }

    updateDisplay() {
        this.updateTrackerDisplay();
        this.updateStatsDisplay();
        this.updateSettingsDisplay();
    }

    updateTrackerDisplay() {
        const currentGlasses = document.getElementById('currentGlasses');
        const dailyGoal = document.getElementById('dailyGoal');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const currentStreak = document.getElementById('currentStreak');
        const currentLevel = document.getElementById('currentLevel');

        if (currentGlasses) currentGlasses.textContent = this.userData.glassesDrankToday;
        if (dailyGoal) dailyGoal.textContent = this.userData.dailyGoal;

        const progress = this.userData.glassesDrankToday;
        const goal = this.userData.dailyGoal;
        const percentage = Math.min((progress / goal) * 100, 100);

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;

        if (currentStreak) currentStreak.textContent = this.userData.hydrationStreak;

        const level = this.getCurrentLevel();
        if (currentLevel) currentLevel.textContent = level.name;

        // Update water glass fill
        this.animateWaterFill();
    }

    updateStatsDisplay() {
        const totalGlassesCount = document.getElementById('totalGlassesCount');
        const bestStreak = document.getElementById('bestStreak');
        const levelName = document.getElementById('levelName');
        const levelFill = document.getElementById('levelFill');
        const levelProgress = document.getElementById('levelProgress');
        const todayCircle = document.getElementById('todayCircle');
        const todayPercent = document.getElementById('todayPercent');

        if (totalGlassesCount) totalGlassesCount.textContent = this.userData.totalGlassesDrank;
        if (bestStreak) bestStreak.textContent = this.userData.bestStreak;

        const level = this.getCurrentLevel();
        if (levelName) levelName.textContent = level.name;

        // Level progress
        const levelProgressValue = this.userData.totalGlassesDrank - level.min;
        const levelMaxProgress = level.max === Infinity ? level.min + 500 : level.max - level.min;
        const levelPercentage = Math.min((levelProgressValue / levelMaxProgress) * 100, 100);

        if (levelFill) levelFill.style.width = `${levelPercentage}%`;
        if (levelProgress) {
            const nextMilestone = level.max === Infinity ? level.min + 500 : level.max;
            levelProgress.textContent = `${this.userData.totalGlassesDrank}/${nextMilestone}`;
        }

        // Today's circular progress
        const todayProgress = this.userData.glassesDrankToday;
        const todayGoal = this.userData.dailyGoal;
        const todayPercentage = Math.min((todayProgress / todayGoal) * 100, 100);

        if (todayCircle) {
            const circumference = 314; // 2 * π * 50
            const strokeDashoffset = circumference - (circumference * todayPercentage) / 100;
            todayCircle.style.strokeDashoffset = strokeDashoffset;
        }

        if (todayPercent) todayPercent.textContent = `${Math.round(todayPercentage)}%`;

        // Update achievements
        this.updateAchievementsDisplay();
    }

    updateSettingsDisplay() {
        const dailyGoalInput = document.getElementById('dailyGoalInput');
        const notificationsToggle = document.getElementById('notificationsToggle');

        if (dailyGoalInput) dailyGoalInput.value = this.userData.dailyGoal;
        if (notificationsToggle) notificationsToggle.checked = this.userData.notificationsEnabled;
    }

    updateAchievementsDisplay() {
        const achievementsGrid = document.getElementById('achievementsGrid');
        if (!achievementsGrid) return;

        achievementsGrid.innerHTML = '';

        this.achievements.forEach(achievement => {
            const isUnlocked = this.userData.achievements.includes(achievement.id);
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;
            
            achievementsGrid.appendChild(achievementElement);
        });
    }

    getCurrentLevel() {
        const total = this.userData.totalGlassesDrank;
        return this.levels.find(level => total >= level.min && total < level.max) || this.levels[0];
    }

    checkAchievements() {
        const newAchievements = [];

        // First glass
        if (this.userData.totalGlassesDrank >= 1 && !this.userData.achievements.includes('first_glass')) {
            newAchievements.push('first_glass');
        }

        // Daily goal
        if (this.userData.glassesDrankToday >= this.userData.dailyGoal && !this.userData.achievements.includes('daily_goal')) {
            newAchievements.push('daily_goal');
        }

        // Streaks
        if (this.userData.hydrationStreak >= 3 && !this.userData.achievements.includes('three_day_streak')) {
            newAchievements.push('three_day_streak');
        }

        if (this.userData.hydrationStreak >= 7 && !this.userData.achievements.includes('week_streak')) {
            newAchievements.push('week_streak');
        }

        // Total glasses
        if (this.userData.totalGlassesDrank >= 100 && !this.userData.achievements.includes('hundred_glasses')) {
            newAchievements.push('hundred_glasses');
        }

        // Level achievements
        const currentLevel = this.getCurrentLevel();
        if (currentLevel.name === 'Hydro Hero' && !this.userData.achievements.includes('hydro_hero')) {
            newAchievements.push('hydro_hero');
        }

        // Add new achievements and show notifications
        newAchievements.forEach(achievementId => {
            this.userData.achievements.push(achievementId);
            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement) {
                this.showNotification(`🏆 Achievement Unlocked: ${achievement.title}!`, 'achievement');
                this.triggerCelebration();
            }
        });

        if (newAchievements.length > 0) {
            this.saveUserData();
        }
    }

    showRandomFact() {
        const factElement = document.getElementById('funFact');
        if (!factElement) return;

        const randomFact = this.funFacts[Math.floor(Math.random() * this.funFacts.length)];
        factElement.textContent = randomFact;

        // Animate fact change
        factElement.style.opacity = '0';
        setTimeout(() => {
            factElement.style.opacity = '1';
        }, 200);
    }

    showNotification(message, type = 'info') {
        const popup = document.getElementById('notification-popup');
        const messageElement = document.getElementById('notification-message');

        if (!popup || !messageElement) return;

        messageElement.textContent = message;
        popup.classList.remove('hidden');

        // Auto-hide after 4 seconds
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 4000);
    }

    triggerCelebration() {
        // Add celebration animation class to body
        document.body.classList.add('celebrating');
        
        // Create floating celebration elements
        this.createConfetti();
        
        // Remove celebration class after animation
        setTimeout(() => {
            document.body.classList.remove('celebrating');
        }, 2000);

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    createConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';

        const colors = ['#00ffff', '#ff00ff', '#8b00ff', '#ffffff'];
        const emojis = ['💧', '🌊', '⭐', '✨', '🎉'];

        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = Math.random() > 0.5 ? emojis[Math.floor(Math.random() * emojis.length)] : '●';
            confetti.style.position = 'absolute';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.fontSize = Math.random() * 20 + 10 + 'px';
            confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
        }

        document.body.appendChild(confettiContainer);

        // Remove confetti after animation
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 4000);
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            try {
                // Check if permission is already granted
                if (Notification.permission === 'granted') {
                    this.notificationPermission = 'granted';
                    this.userData.notificationsEnabled = true;
                    this.saveUserData();
                    return;
                }
                
                // Request permission with user-friendly prompt
                const permission = await Notification.requestPermission();
                this.notificationPermission = permission;
                
                if (permission === 'granted') {
                    this.userData.notificationsEnabled = true;
                    this.saveUserData();
                    
                    // Send a welcome notification
                    setTimeout(() => {
                        this.sendNotification(
                            'AquaFlow Notifications Enabled!', 
                            'You\'ll now receive helpful hydration reminders throughout the day.'
                        );
                    }, 1000);
                } else if (permission === 'denied') {
                    this.userData.notificationsEnabled = false;
                    this.saveUserData();
                    this.showNotification('Notifications blocked. You can enable them in browser settings for hydration reminders.', 'info');
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        } else {
            this.showNotification('Your browser doesn\'t support notifications.', 'info');
        }
    }

    sendNotification(title, body) {
        if (this.notificationPermission === 'granted' && this.userData.notificationsEnabled) {
            try {
                const notification = new Notification(title, {
                    body: body,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2300ffff"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="white">💧</text></svg>',
                    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💧</text></svg>',
                    tag: 'hydration-reminder',
                    requireInteraction: false,
                    silent: false,
                    timestamp: Date.now(),
                    data: {
                        url: window.location.origin,
                        action: 'hydrate'
                    }
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };

                // Auto-close after 8 seconds for better mobile experience
                setTimeout(() => {
                    if (notification) {
                        notification.close();
                    }
                }, 8000);

                // Enhanced vibration pattern for mobile
                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }
    }

    startReminderSystem() {
        // Clear existing interval
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }

        // Set up reminder every 1.5 hours for more frequent reminders
        this.reminderInterval = setInterval(() => {
            this.checkAndSendReminder();
        }, 5400000); // 1.5 hours

        // Also check every 30 minutes for more responsive reminders
        this.frequentReminderInterval = setInterval(() => {
            this.checkAndSendFrequentReminder();
        }, 1800000); // 30 minutes

        // Send initial reminder after 30 minutes if no water drunk
        setTimeout(() => {
            this.checkAndSendInitialReminder();
        }, 1800000);
    }

    checkAndSendReminder() {
        const now = new Date();
        const hours = now.getHours();
        
        // Only send reminders during waking hours (7 AM - 10 PM)
        if (hours >= 7 && hours <= 22 && this.userData.notificationsEnabled) {
            const progress = this.userData.glassesDrankToday;
            const goal = this.userData.dailyGoal;
            
            if (progress < goal) {
                const remaining = goal - progress;
                const userName = this.userData.userName || 'Friend';
                
                if (progress === 0) {
                    this.sendNotification(
                        `Hey ${userName}! 💧`,
                        "Time for your first glass of water today! Sip some water and slay the day 💧🔥"
                    );
                } else {
                    const messages = [
                        `You need ${remaining} more glasses to reach your goal. Keep it up! 🌊`,
                        `Hydration check! ${remaining} glasses to go, you've got this! 💪`,
                        `Time for some H2O magic! ${remaining} more glasses needed 💧`,
                        `Your body is calling for water! ${remaining} glasses remaining 🚰`
                    ];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    
                    this.sendNotification(
                        `Hydration Reminder 💧`,
                        randomMessage
                    );
                }
            }
        }
    }

    checkAndSendFrequentReminder() {
        const now = new Date();
        const hours = now.getHours();
        const lastDrinkTime = localStorage.getItem('lastDrinkTime');
        const currentTime = now.getTime();
        
        // Send reminder if it's been more than 2 hours since last drink
        if (hours >= 8 && hours <= 21 && this.userData.notificationsEnabled) {
            if (lastDrinkTime) {
                const timeSinceLastDrink = currentTime - parseInt(lastDrinkTime);
                const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
                
                if (timeSinceLastDrink > twoHours && this.userData.glassesDrankToday < this.userData.dailyGoal) {
                    const userName = this.userData.userName || 'Friend';
                    this.sendNotification(
                        `${userName}, time to hydrate! 💧`,
                        "It's been a while since your last glass. Your body needs water! 🌊"
                    );
                }
            }
        }
    }

    checkAndSendInitialReminder() {
        if (this.userData.glassesDrankToday === 0 && this.userData.notificationsEnabled) {
            const now = new Date();
            const hours = now.getHours();
            
            if (hours >= 8 && hours <= 21) {
                const userName = this.userData.userName || 'Friend';
                this.sendNotification(
                    `Good morning ${userName}! ☀️`,
                    "Start your day right with a refreshing glass of water! 💧"
                );
            }
        }
    }

    testNotification() {
        if (this.notificationPermission !== 'granted') {
            this.requestNotificationPermission().then(() => {
                if (this.notificationPermission === 'granted') {
                    this.sendTestNotification();
                }
            });
        } else {
            this.sendTestNotification();
        }
    }

    checkNotificationPrompt() {
        if (this.userData.userName && !this.userData.notificationsEnabled && 
            Notification.permission === 'default') {
            this.showNotification(
                'Enable notifications to get helpful hydration reminders throughout the day!', 
                'info'
            );
        }
    }

    sendTestNotification() {
        const userName = this.userData.userName || 'Friend';
        this.sendNotification(
            `Hey ${userName}! 💧`,
            "This is a test notification! Your hydration reminders are working perfectly."
        );
        this.showNotification('Test notification sent! Check your device notifications.', 'success');
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all your data? This action cannot be undone.')) {
            localStorage.removeItem('hydrationData');
            localStorage.removeItem('lastDrinkTime');
            localStorage.removeItem('hydrationHistory');
            location.reload();
        }
    }

    // Add method to get historical data for potential future features
    getHistoricalData() {
        try {
            return JSON.parse(localStorage.getItem('hydrationHistory')) || {};
        } catch (error) {
            console.error('Error loading historical data:', error);
            return {};
        }
    }
}

// CSS for confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .celebrating .neon-btn {
        animation: celebrateButton 0.6s ease-in-out 3;
    }
    
    @keyframes celebrateButton {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(confettiStyle);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HydrationTracker();
});

// Service Worker registration for better performance
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swData = `
            const CACHE_NAME = 'aquaflow-v1';
            const urlsToCache = [
                '/',
                '/style.css',
                '/script.js'
            ];

            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(cache => cache.addAll(urlsToCache))
                );
            });

            self.addEventListener('fetch', event => {
                event.respondWith(
                    caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        }
                    )
                );
            });
        `;
        
        const blob = new Blob([swData], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
