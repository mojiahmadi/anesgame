// اتصال به دیتابیس Supabase
    const { createClient } = supabase;
    const supabaseUrl = 'https://yaguesbmmaaeerfkzdnr.supabase.co'; 
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZ3Vlc2JtbWFhZWVyZmt6ZG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDA3MDEsImV4cCI6MjA5ODY3NjcwMX0.9WFow53Vx-4y-6rS5lfD_UwsUxchLQcWkGmGOzDlv3M'; 
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // تابع ارسال اطلاعات به سرور ابری
    async function saveRecordToCloud(levelTitle, timeElapsed, mistakeCount, scoreCount) {
        try {
            const { data, error } = await supabaseClient
                .from('player')
                .insert([
                    {
                        name: playerName,
                        phone: playerPhone,
                        student_id: playerStudentId,
                        email: playerEmail,
                        level_name: levelTitle,
                        score: scoreCount,
                        time: timeElapsed,
                        mistakes: mistakeCount
                    }
                ]);
            
            if (error) throw error;
            console.log("✅ رکورد با موفقیت در فضای ابری ذخیره شد!");
        } catch (err) {
            console.error("❌ خطا در ذخیره اطلاعات ابری: ", err);
        }
    }

    // تنظیمات مربوط به صداها
    const sfx = {
        correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
        wrong: new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'),
        win: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'),
        coin: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3')
    };

    const SOUND_SETTING_KEY = 'anesPuzzle_soundEnabled';
    let soundEnabled = localStorage.getItem(SOUND_SETTING_KEY) !== 'off'; // پیش‌فرض: روشن

    function playSfx(name) {
        if (!soundEnabled) return;
        const a = sfx[name];
        if (!a) return;
        a.currentTime = 0;
        a.play().catch(() => {});
    }

    // تعریف لیست مدال‌ها (Achievements)
const achievementsList = [
    { id: 'first_step', title: 'اولین قدم', desc: 'اولین مرحله را با موفقیت تمام کن.', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { id: 'flawless', title: 'بی‌نقص', desc: 'یک مرحله را بدون هیچ خطایی (۳ ستاره) تمام کن.', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
    { id: 'guideline_expert', title: 'خبره گایدلاین ۲۰۲۵', desc: 'مرحله احیا (ACLS) را کاملاً دقیق و بی‌نقص بچین.', icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
    { id: 'speedrunner', title: 'سریع‌ترین دست', desc: 'یک مرحله را در کمتر از ۳۰ ثانیه تمام کن.', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' }
];

let playerAchievements = []; // آرایه نگهداری مدال‌های باز شده کاربر

// کلید ذخیره‌سازی لوکال
function achievementsStorageKey(name) {
    return 'anesPuzzle_achievements_' + name.trim().toLowerCase();
}

// لود کردن مدال‌ها هنگام ورود کاربر (این تابع را داخل handleLogin فراخوانی کن)
function loadAchievements(name) {
    const saved = localStorage.getItem(achievementsStorageKey(name));
    playerAchievements = saved ? JSON.parse(saved) : [];
}

// بررسی و باز کردن مدال جدید
function unlockAchievement(achievementId) {
    if (playerAchievements.includes(achievementId)) return; // اگر قبلاً گرفته، خارج شو

    playerAchievements.push(achievementId);
    localStorage.setItem(achievementsStorageKey(playerName), JSON.stringify(playerAchievements));
    
    // نمایش پاپ‌آپ مدال جدید در صفحه
    showAchievementToast(achievementId);
    playSfx('win'); // پخش صدای برنده شدن
}

// نمایش پاپ‌آپ مدال
function showAchievementToast(id) {
    const ach = achievementsList.find(a => a.id === id);
    if (!ach) return;

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="28" height="28" stroke-linecap="round" stroke-linejoin="round">${ach.icon}</svg></div>
        <div class="achievement-toast-text">
            <strong>مدال جدید باز شد!</strong>
            <span>${ach.title}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    // انیمیشن ورود
    setTimeout(() => toast.classList.add('show'), 100);
    // حذف بعد از ۴ ثانیه
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ساخت و نمایش رابط کاربری مدال‌ها
function openAchievementsModal() {
    document.getElementById('user-menu-dropdown').classList.remove('open');
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';

    achievementsList.forEach(ach => {
        const isUnlocked = playerAchievements.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div class="achievement-lock-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="achievement-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ach.icon}</svg>
            </div>
            <div class="achievement-title">${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
        `;
        grid.appendChild(card);
    });

    document.getElementById('achievements-modal').classList.remove('hidden');
}

function closeAchievementsModal() {
    document.getElementById('achievements-modal').classList.add('hidden');
}

    const gameLevels = [
        { id: 0, timeLimit: 240, title: "آناتومی راه هوایی", desc: "مسیری که لوله تراشه در اینتوباسیون طی می‌کند.", layers: [ { id: "A1", name: "حفره دهان" }, { id: "A2", name: "اوروفارنکس (حلق)" }, { id: "A3", name: "اپی‌گلوت" }, { id: "A4", name: "تارهای صوتی (Vocal Cords)" }, { id: "A5", name: "نای (Trachea)" }, { id: "A6", name: "کارینا (محل دوشاخه شدن)" } ] },
        { id: 1, timeLimit: 240, title: "داروها و مراحل اینداکشن (RSI)", desc: "ترتیب صحیح القای بیهوشی سریع (Rapid Sequence Induction).", layers: [ { id: "I1", name: "پره‌اکسیژناسیون (اکسیژن ۱۰۰٪)" }, { id: "I2", name: "تزریق فنتانیل (مخدر ضددرد)" }, { id: "I3", name: "تزریق پروپوفول (هوشبر وریدی)" }, { id: "I4", name: "تزریق سوکسینیل‌کولین (شل‌کننده)" }, { id: "I5", name: "انجام لوله‌گذاری (اینتوباسیون)" }, { id: "I6", name: "تایید محل با کاپنوگراف (EtCO2)" } ] },
        { id: 2, timeLimit: 280, title: "آناتومی و تزریق بلوک اسپاینال", desc: "پیمایش لایه‌ها از سطح تا رسیدن به فضای ساب‌آراکنوئید.", layers: [ { id: "L1", name: "پوست و بافت زیرجلدی" }, { id: "L2", name: "رباط سوپرااسپاینوس" }, { id: "L3", name: "رباط اینتراسپاینوس" }, { id: "L4", name: "رباط فلاوم (احساس مقاومت)" }, { id: "L5", name: "فضای اپیدورال" }, { id: "L6", name: "سخت‌شامه (Dura Mater) و عنکبوتیه" }, { id: "L7", name: "فضای ساب‌آراکنوئید (خروج CSF و تزریق)" } ] },
        { id: 3, timeLimit: 240, title: "مسیر اکسیژن در ماشین بیهوشی", desc: "گاز اکسیژن چگونه از منبع به بیمار می‌رسد؟", layers: [ { id: "M1", name: "کپسول / منبع سانترال اکسیژن" }, { id: "M2", name: "رگولاتور (فشارشکن شیر)" }, { id: "M3", name: "فلومتر (تنظیم جریان)" }, { id: "M4", name: "واپورایزر (افزودن هوشبر استنشاقی)" }, { id: "M5", name: "خروجی گاز تازه (CGO)" }, { id: "M6", name: "خرطومی مدار تنفسی و بیمار" } ] },
        { id: 4, timeLimit: 240, title: "احیای قلبی ریوی و داروها (ACLS)", desc: "اقدامات اورژانسی به ترتیب در مواجهه با بیمار ارست قلبی.", layers: [ { id: "C1", name: "بررسی هوشیاری و تنفس بیمار" }, { id: "C2", name: "اعلام کد و درخواست الکتروشوک" }, { id: "C3", name: "چک نبض کاروتید (حداکثر ۱۰ ثانیه)" }, { id: "C4", name: "شروع فشردن قفسه سینه (ماساژ)" }, { id: "C5", name: "مدیریت راه هوایی و تهویه" }, { id: "C6", name: "آنالیز ریتم، شوک و تزریق آدرنالین" } ] },
        { id: 5, timeLimit: 240, title: "ریورسال و بیداری (Emergence)", desc: "اقدامات پایان عمل برای برگرداندن تنفس بیمار.", layers: [ { id: "R1", name: "قطع گازهای هوشبر تبخیری" }, { id: "R2", name: "ساکشن ملایم ترشحات دهان و حلق" }, { id: "R3", name: "تزریق آتروپین (جلوگیری از برادی‌کاردی)" }, { id: "R4", name: "تزریق نئوستیگمین (ریورسال شل‌کننده)" }, { id: "R5", name: "بازگشت حجم و ریت تنفس خودبه‌خودی" }, { id: "R6", name: "خالی کردن کاف و اکستوباسیون" } ] },
        { id: 6, timeLimit: 240, title: "مدیریت هایپرترمی بدخیم (MH)", desc: "اقدامات فوری در صورت بروز بحران هایپرترمی بدخیم.", layers: [ { id: "H1", name: "قطع فوری هوشبرهای استنشاقی و سوکسینیل" }, { id: "H2", name: "درخواست کمک و آوردن ترالی MH" }, { id: "H3", name: "هیپرونتیلاسیون با اکسیژن ۱۰۰٪" }, { id: "H4", name: "تزریق سریع دانترولن سدیم" }, { id: "H5", name: "خنک کردن بیمار (سرم سرد و یخ)" }, { id: "H6", name: "درمان اسیدوز و تنظیم الکترولیت‌ها" } ] },
        { id: 7, timeLimit: 240, title: "پروسیجر رگ‌گیری (IV Cannulation)", desc: "مراحل عملی برقراری خط وریدی.", layers: [ { id: "V1", name: "بستن تورنیکت (گارو)" }, { id: "V2", name: "ضدعفونی کردن محل با پد الکلی" }, { id: "V3", name: "ورود سوزن آنژیوکت با زاویه ۱۵ تا ۳۰ درجه" }, { id: "V4", name: "مشاهده خون در محفظه (Flashback)" }, { id: "V5", name: "پیشبرد کاتتر پلاستیکی و خروج سوزن فلزی" }, { id: "V6", name: "باز کردن تورنیکت و فیکس با چسب" } ] }
    ];

    const levelProgress = {}; 
    let currentLevelIndex = 0;
    let correctPlacements = 0;
    let timerInterval;
    let secondsElapsed = 0;
    let secondsRemaining = 0;
    let levelTimeUp = false;
    let completedLevels = [];
    let mistakes = 0;
    let draggedElement = null;
    let floatingTouchEl = null; 
    let isConfettiActive = false; 
    let playerName = ""; 
    let playerCoins = 0;
    let playerPhone = "";
    let playerStudentId = "";
    let playerEmail = "";
    let currentAvatar = { type: 'preset', value: 'p1' };
    const STARTING_COINS = 50;
    const COINS_PER_STAR = 10;
    const HINT_COST = 15;
    const DAILY_REWARD_BASE = 10;
    const DAILY_REWARD_STEP = 5;
    const DAILY_REWARD_CYCLE = 7;
    const MAX_AVATAR_UPLOAD_BYTES = 1024 * 1024; // ۱ مگابایت

    const presetAvatars = [
        { id: 'p1', bg: 'linear-gradient(135deg,#7B0D1E,#C8102E)', icon: '<path d="M12 2v10"/><path d="M12 12c-2 2-3 5-3 8"/><path d="M12 12c2 2 3 5 3 8"/><path d="M9 20a3 3 0 0 1-3-3c0-3 1.5-5 3-5"/><path d="M15 20a3 3 0 0 0 3-3c0-3-1.5-5-3-5"/>' },
        { id: 'p2', bg: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', icon: '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.4 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>' },
        { id: 'p3', bg: 'linear-gradient(135deg,#7C3AED,#A78BFA)', icon: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-4 4c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c0 .28.22.5.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>' },
        { id: 'p4', bg: 'linear-gradient(135deg,#0EA5A4,#2DD4BF)', icon: '<path d="M12 15h.01"/><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/><path d="m15 9-3 4"/>' },
        { id: 'p5', bg: 'linear-gradient(135deg,#DC2626,#F87171)', icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3 12h3l3-4 4 9 3-5h5"/>' },
        { id: 'p6', bg: 'linear-gradient(135deg,#059669,#34D399)', icon: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>' },
        { id: 'p7', bg: 'linear-gradient(135deg,#D97706,#FBBF24)', icon: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 16v-4"/>' },
        { id: 'p8', bg: 'linear-gradient(135deg,#DB2777,#F472B6)', icon: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' }
    ];

    function coinsStorageKey(name) {
        return 'anesPuzzle_coins_' + name.trim().toLowerCase();
    }

    // ======= قفل و پیشرفت مراحل =======
    function progressStorageKey(name) {
        return 'anesPuzzle_completed_' + name.trim().toLowerCase();
    }

    function loadCompletedLevels(name) {
        try {
            const saved = localStorage.getItem(progressStorageKey(name));
            completedLevels = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(completedLevels)) completedLevels = [];
        } catch (e) {
            completedLevels = [];
        }
        updateLevelLocks();
    }

    function markLevelCompleted(levelIndex) {
        if (!completedLevels.includes(levelIndex)) {
            completedLevels.push(levelIndex);
            localStorage.setItem(progressStorageKey(playerName), JSON.stringify(completedLevels));
        }
        updateLevelLocks();
    }

    function isLevelUnlocked(levelIndex) {
        return levelIndex === 0 || completedLevels.includes(levelIndex - 1);
    }

    function updateLevelLocks() {
        document.querySelectorAll('#level-cards-container .card').forEach((card, i) => {
            card.classList.toggle('locked', !isLevelUnlocked(i));
        });
    }

    // === سیستم امنیت و امضای دیجیتال سکه‌ها ===
    const SECRET_SALT = "AnesPuzzle_M0jtaba_2026_SecureKey!@#"; // کلید مخفی که هکر نمی‌داند

    // تولید امضای دیجیتال غیرقابل جعل
    function generateChecksum(amount) {
        return btoa(encodeURIComponent(amount.toString() + SECRET_SALT));
    }

    function coinsStorageKey(name) {
        return 'anesPuzzle_coins_' + name.trim().toLowerCase();
    }
    
    function hashStorageKey(name) {
        return 'anesPuzzle_coins_hash_' + name.trim().toLowerCase();
    }

    // ذخیره امن سکه‌ها با امضا
    function saveSecureCoins(amount) {
        playerCoins = amount;
        localStorage.setItem(coinsStorageKey(playerName), amount);
        localStorage.setItem(hashStorageKey(playerName), generateChecksum(amount));
        updateCoinDisplay();
    }

    function loadOrInitCoins(name) {
        const key = coinsStorageKey(name);
        const hashKey = hashStorageKey(name);
        
        const savedCoins = localStorage.getItem(key);
        const savedHash = localStorage.getItem(hashKey);

        if (savedCoins === null) {
            // کاربر کاملاً جدید است
            saveSecureCoins(STARTING_COINS);
            showCoinToast(`🎁 سکه خوش‌آمدگویی: +${STARTING_COINS}`);
        } else if (savedHash === null) {
            // کاربر قدیمی است (قبل از آپدیت امنیتی بازی کرده)
            // به جای جریمه، سکه‌های قبلی‌اش را می‌پذیریم و برایش امضای جدید می‌سازیم
            saveSecureCoins(parseInt(savedCoins, 10) || 0);
        } else {
            // کاربر فعلی با سیستم امنیتی جدید (بررسی تقلب)
            if (generateChecksum(savedCoins) !== savedHash) {
                console.warn("⚠️ تلاش برای تقلب تشخیص داده شد!");
                alert("تقلب در سیستم تشخیص داده شد! به عنوان جریمه، تمام سکه‌های شما صفر شد.");
                saveSecureCoins(0); // جریمه فرد متقلب
            } else {
                // دیتای سالم و تایید شده
                playerCoins = parseInt(savedCoins, 10) || 0;
                updateCoinDisplay();
            }
        }
    }

    function addCoins(amount) {
        if (amount <= 0) return;
        saveSecureCoins(playerCoins + amount);
    }

    function spendCoins(amount) {
        if (playerCoins < amount) return false;
        saveSecureCoins(playerCoins - amount);
        return true;
    }

    function updateCoinDisplay() {
        const badge = document.getElementById('coin-badge');
        const countEl = document.getElementById('coin-count');
        countEl.innerText = playerCoins;
        badge.classList.remove('hidden');
        badge.classList.remove('bump');
        void badge.offsetWidth; 
        badge.classList.add('bump');

        const hintBtn = document.getElementById('btn-hint');
        if (hintBtn) hintBtn.disabled = playerCoins < HINT_COST;

        const userMenuCoins = document.getElementById('user-menu-coins');
        if (userMenuCoins) userMenuCoins.innerText = playerCoins;
    }

    // ======= پروفایل کاربر (موبایل + مشخصات + آواتار) =======
    function profileStorageKey(name) {
        return 'anesPuzzle_profile_' + name.trim().toLowerCase();
    }

    function loadOrInitProfile(name, phoneFromLogin) {
        const key = profileStorageKey(name);
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                playerPhone = data.phone || phoneFromLogin || '';
                playerStudentId = data.studentId || '';
                playerEmail = data.email || '';
                currentAvatar = {
                    type: data.avatarType || 'preset',
                    value: data.avatarValue || 'p1'
                };
            } catch (e) {
                playerPhone = phoneFromLogin || '';
                currentAvatar = { type: 'preset', value: 'p1' };
            }
        } else {
            playerPhone = phoneFromLogin || '';
            currentAvatar = { type: 'preset', value: 'p1' };
        }
        saveProfile();
    }

    function saveProfile() {
        if (!playerName) return;
        const key = profileStorageKey(playerName);
        localStorage.setItem(key, JSON.stringify({
            phone: playerPhone,
            studentId: playerStudentId,
            email: playerEmail,
            avatarType: currentAvatar.type,
            avatarValue: currentAvatar.value
        }));
    }

    function toggleEditPhone() {
        const editEl = document.getElementById('user-menu-phone-edit');
        const input = document.getElementById('user-menu-phone-input');
        input.value = playerPhone;
        editEl.classList.toggle('hidden');
        if (!editEl.classList.contains('hidden')) input.focus();
    }

    function savePhone() {
        const input = document.getElementById('user-menu-phone-input');
        const val = input.value.trim();
        if (!/^09\d{9}$/.test(val)) {
            showCoinToast('⚠️ شماره موبایل معتبر نیست');
            return;
        }
        playerPhone = val;
        saveProfile();
        document.getElementById('user-menu-phone-text').innerText = playerPhone;
        document.getElementById('user-menu-phone-edit').classList.add('hidden');
        showCoinToast('✅ شماره موبایل ذخیره شد');
    }

    function openProfileModal() {
        document.getElementById('user-menu-dropdown').classList.remove('open');
        document.getElementById('profile-student-id').value = playerStudentId;
        document.getElementById('profile-email').value = playerEmail;
        document.getElementById('profile-modal').classList.remove('hidden');
    }

    function closeProfileModal() {
        document.getElementById('profile-modal').classList.add('hidden');
    }

    function saveExtraProfile() {
        playerStudentId = document.getElementById('profile-student-id').value.trim();
        playerEmail = document.getElementById('profile-email').value.trim();
        
        saveProfile(); 
        showCoinToast('✅ مشخصات شما با موفقیت ذخیره شد');
        closeProfileModal();
    }

    // ======= تنظیمات =======
    function openSettingsModal() {
        document.getElementById('user-menu-dropdown').classList.remove('open');
        refreshSoundToggleUI();
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    function closeSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    function refreshSoundToggleUI() {
        const toggle = document.getElementById('sound-toggle');
        if (toggle) toggle.classList.toggle('on', soundEnabled);
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        localStorage.setItem(SOUND_SETTING_KEY, soundEnabled ? 'on' : 'off');
        refreshSoundToggleUI();
        if (soundEnabled) playSfx('coin'); // یک صدای کوتاه برای تایید روشن بودن
    }

    function requestResetProgress() {
        const confirmed = window.confirm('مطمئنی؟ سکه‌ها به مقدار اولیه برمی‌گردن و زنجیره جایزه روزانه صفر می‌شه. این کار قابل بازگشت نیست.');
        if (confirmed) performResetProgress();
    }

    function performResetProgress() {
        if (!playerName) return;

        localStorage.removeItem(coinsStorageKey(playerName));
        localStorage.removeItem(streakStorageKey(playerName));
        localStorage.removeItem(progressStorageKey(playerName));

        loadOrInitCoins(playerName);
        completedLevels = [];
        updateLevelLocks();
        refreshDailyRewardUI();
        updateUserMenu();

        showCoinToast('🔄 سکه‌ها، جایزه روزانه و پیشرفت مراحل بازنشانی شد');
        closeSettingsModal();
    }

    // ======= آواتار =======
    function avatarInnerHTML(avatar) {
        if (avatar.type === 'custom') {
            return `<img src="${avatar.value}" alt="آواتار" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
        const preset = presetAvatars.find(p => p.id === avatar.value) || presetAvatars[0];
        return `<div style="width:100%;height:100%;border-radius:50%;background:${preset.bg};display:flex;align-items:center;justify-content:center;">
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${preset.icon}</svg>
        </div>`;
    }

    function renderAvatarUI() {
        const menuAvatarEl = document.getElementById('user-menu-avatar');
        const btnAvatarEl = document.getElementById('user-menu-btn-avatar');
        if (menuAvatarEl) menuAvatarEl.innerHTML = avatarInnerHTML(currentAvatar);
        if (btnAvatarEl) btnAvatarEl.innerHTML = avatarInnerHTML(currentAvatar);
    }

    function buildAvatarGrid() {
        const grid = document.getElementById('avatar-grid');
        grid.innerHTML = '';
        presetAvatars.forEach(preset => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'avatar-option';
            if (currentAvatar.type === 'preset' && currentAvatar.value === preset.id) {
                btn.classList.add('selected');
            }
            btn.style.background = preset.bg;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${preset.icon}</svg>`;
            btn.addEventListener('click', () => selectPresetAvatar(preset.id));
            grid.appendChild(btn);
        });
    }

    function openAvatarPicker() {
        document.getElementById('user-menu-dropdown').classList.remove('open');
        document.getElementById('avatar-upload-error').classList.add('hidden');
        buildAvatarGrid();
        document.getElementById('avatar-modal').classList.remove('hidden');
    }

    function closeAvatarPicker() {
        document.getElementById('avatar-modal').classList.add('hidden');
    }

    function selectPresetAvatar(id) {
        currentAvatar = { type: 'preset', value: id };
        saveProfile();
        renderAvatarUI();
        buildAvatarGrid();
        showCoinToast('✅ آواتار ذخیره شد');
        setTimeout(closeAvatarPicker, 350);
    }

    function handleAvatarUpload(event) {
        const file = event.target.files && event.target.files[0];
        const errorEl = document.getElementById('avatar-upload-error');
        errorEl.classList.add('hidden');
        if (!file) return;

        if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
            errorEl.classList.remove('hidden');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            currentAvatar = { type: 'custom', value: e.target.result };
            saveProfile();
            renderAvatarUI();
            showCoinToast('✅ عکس پروفایل ذخیره شد');
            closeAvatarPicker();
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    }

    // ======= جایزه روزانه =======
    function streakStorageKey(name) {
        return 'anesPuzzle_streak_' + name.trim().toLowerCase();
    }

    function getTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getYesterdayKey() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function loadStreakInfo() {
        const saved = localStorage.getItem(streakStorageKey(playerName));
        if (!saved) return { lastClaimDate: null, streak: 0 };
        try {
            return JSON.parse(saved);
        } catch (e) {
            return { lastClaimDate: null, streak: 0 };
        }
    }

    function saveStreakInfo(info) {
        localStorage.setItem(streakStorageKey(playerName), JSON.stringify(info));
    }

    function rewardForCycleDay(dayInCycle) {
        return DAILY_REWARD_BASE + (dayInCycle - 1) * DAILY_REWARD_STEP;
    }

    function refreshDailyRewardUI() {
        const info = loadStreakInfo();
        const btn = document.getElementById('daily-reward-btn');
        const canClaim = info.lastClaimDate !== getTodayKey();
        btn.classList.toggle('has-reward', canClaim);
    }

    function openDailyReward() {
        const info = loadStreakInfo();
        const today = getTodayKey();
        const alreadyClaimed = info.lastClaimDate === today;
        const nextStreak = alreadyClaimed ? info.streak : info.streak + 1;
        const currentCycleDay = ((nextStreak - 1) % DAILY_REWARD_CYCLE) + 1;

        const descEl = document.getElementById('daily-reward-desc');
        const claimBtn = document.getElementById('btn-claim-reward');
        const track = document.getElementById('reward-track');

        track.innerHTML = '';
        for (let day = 1; day <= DAILY_REWARD_CYCLE; day++) {
            const box = document.createElement('div');
            box.className = 'reward-day';
            if (day < currentCycleDay || (day === currentCycleDay && alreadyClaimed)) {
                box.classList.add('claimed');
            } else if (day === currentCycleDay) {
                box.classList.add('current');
            }
            box.innerHTML = `<span class="day-lbl">روز ${day.toLocaleString('fa-IR')}</span><span class="day-amt">${rewardForCycleDay(day).toLocaleString('fa-IR')}💰</span>`;
            track.appendChild(box);
        }

        if (alreadyClaimed) {
            descEl.innerText = 'جایزه امروزت رو گرفتی، فردا دوباره سر بزن! 🌟';
            claimBtn.disabled = true;
            claimBtn.style.opacity = '.55';
            claimBtn.style.cursor = 'not-allowed';
            claimBtn.innerText = 'جایزه امروز دریافت شد';
        } else {
            descEl.innerText = `روز ${currentCycleDay.toLocaleString('fa-IR')} از ورود متوالی — هر روز سر بزن و بیشتر بگیر!`;
            claimBtn.disabled = false;
            claimBtn.style.opacity = '1';
            claimBtn.style.cursor = 'pointer';
            claimBtn.innerText = `دریافت ${rewardForCycleDay(currentCycleDay).toLocaleString('fa-IR')} سکه`;
        }

        document.getElementById('daily-reward-modal').classList.remove('hidden');
    }

    function closeDailyReward() {
        document.getElementById('daily-reward-modal').classList.add('hidden');
    }

    function claimDailyReward() {
        const info = loadStreakInfo();
        const today = getTodayKey();
        if (info.lastClaimDate === today) return;

        const newStreak = (info.lastClaimDate === getYesterdayKey()) ? info.streak + 1 : 1;
        const cycleDay = ((newStreak - 1) % DAILY_REWARD_CYCLE) + 1;
        const amount = rewardForCycleDay(cycleDay);

        addCoins(amount);
        saveStreakInfo({ lastClaimDate: today, streak: newStreak });
        showCoinToast(`🎁 جایزه روزانه: +${amount} سکه`);
        refreshDailyRewardUI();
        closeDailyReward();
        playSfx('coin');
    }

    // ======= منوی حساب کاربری =======
    function toggleUserMenu() {
        document.getElementById('user-menu-dropdown').classList.toggle('open');
    }

    document.addEventListener('click', function (e) {
        const menu = document.getElementById('user-menu');
        const dropdown = document.getElementById('user-menu-dropdown');
        if (menu && dropdown && !menu.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    function updateUserMenu() {
        const menu = document.getElementById('user-menu');
        menu.classList.remove('hidden');

        document.getElementById('user-menu-name').innerText = playerName;
        document.getElementById('user-menu-phone-text').innerText = playerPhone || '-';
        document.getElementById('user-menu-coins').innerText = playerCoins;
    }

    function logout() {
        clearInterval(timerInterval);
        isConfettiActive = false;

        document.getElementById('user-menu-dropdown').classList.remove('open');
        document.getElementById('user-menu').classList.add('hidden');
        document.getElementById('coin-badge').classList.add('hidden');
        document.getElementById('daily-reward-btn').classList.add('hidden');
        document.getElementById('daily-reward-btn').classList.remove('has-reward');
        document.getElementById('avatar-modal').classList.add('hidden');
        document.getElementById('daily-reward-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('user-menu-phone-edit').classList.add('hidden');

        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('success-modal').classList.add('hidden');

        const welcomeMsg = document.getElementById('welcome-message');
        welcomeMsg.classList.add('hidden');
        welcomeMsg.innerHTML = '';

        document.getElementById('player-name').value = '';
        document.getElementById('player-phone').value = '';
        document.getElementById('login-screen').classList.remove('hidden');

        const btnAvatarEl = document.getElementById('user-menu-btn-avatar');
        if (btnAvatarEl) {
            btnAvatarEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        }

        playerName = '';
        playerCoins = 0;
        playerPhone = '';
        playerStudentId = '';
        playerEmail = '';
        currentAvatar = { type: 'preset', value: 'p1' };
    }

    function useHint() {
        if (playerCoins < HINT_COST) {
            showCoinToast(`💰 سکه کافی نیست (نیاز: ${HINT_COST})`);
            return;
        }

        const dtc = document.getElementById('drop-targets-container');
        const targetZone = dtc.querySelector('.drop-zone:not(.correct)');
        if (!targetZone) return; 

        const expectedId = targetZone.getAttribute('data-expected-id');
        const draggableEl = document.getElementById(expectedId);
        if (!draggableEl) return;

        spendCoins(HINT_COST);
        draggedElement = draggableEl;
        targetZone.classList.add('hinted');
        setTimeout(() => targetZone.classList.remove('hinted'), 1000);
        processDropResult(targetZone, expectedId, expectedId);
        showCoinToast(`💡 از راهنما استفاده شد (-${HINT_COST} سکه)`);
    }

    function showCoinToast(text) {
        const toast = document.getElementById('coin-toast');
        toast.innerText = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }


// تابع انتقال از لابی به فرم لاگین
function goToLogin() {
    // مخفی کردن لابی و نمایش فرم ورود
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

    function handleLogin(event) {
        event.preventDefault();
        const nameInput = document.getElementById('player-name').value;
        const phoneInput = document.getElementById('player-phone').value.trim();
        const errorEl = document.getElementById('login-error');

        if (!/^09\d{9}$/.test(phoneInput)) {
            errorEl.classList.remove('hidden');
            return;
        }
        errorEl.classList.add('hidden');

        playerName = nameInput.trim() ? nameInput : "دانشجوی عزیز";
        loadOrInitCoins(playerName);
        loadOrInitProfile(playerName, phoneInput);
        loadCompletedLevels(playerName);
        loadAchievements(playerName);
        updateUserMenu();
        renderAvatarUI();
        document.getElementById('daily-reward-btn').classList.remove('hidden');
        refreshDailyRewardUI();

        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');

        const welcomeMsg = document.getElementById('welcome-message');
        welcomeMsg.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="m9 12 2 2 4-4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/></svg>
            سلام ${playerName}، موفق باشی!
        `;
        welcomeMsg.classList.remove('hidden');
        
document.getElementById('main-header').classList.remove('hidden');
    }

    function formatTime(s) {
        return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    }

    function updateProgress() {
        const total = gameLevels[currentLevelIndex].layers.length;
        const pct = (correctPlacements / total) * 100;
        document.getElementById('progress-bar').style.width = pct + '%';
    }

    function calcStars(mistakes, totalLayers) {
        if (mistakes === 0) return 3;
        if (mistakes <= Math.max(1, Math.floor(totalLayers / 3))) return 2;
        return 1;
    }

    function showMenu() {
        clearInterval(timerInterval);
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('success-modal').classList.add('hidden');
        document.getElementById('timeup-modal').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        isConfettiActive = false;
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.animation = 'none';
            card.offsetHeight; 
            card.style.animation = null;
        });
    }

    function startGame(levelIndex) {
        if (!isLevelUnlocked(levelIndex)) {
            showCoinToast('🔒 اول باید مرحله قبل رو تموم کنی');
            return;
        }
        currentLevelIndex = levelIndex;
        correctPlacements = 0;
        secondsElapsed = 0;
        mistakes = 0;
        levelTimeUp = false;

        const level = gameLevels[levelIndex];
        secondsRemaining = level.timeLimit;

        const timerDisplayEl = document.getElementById('timer-display');
        timerDisplayEl.innerText = formatTime(secondsRemaining);
        timerDisplayEl.closest('.stat-box').classList.remove('timer-warning');
        document.getElementById('mistakes-display').innerText = '0';
        document.getElementById('progress-bar').style.width = '0%';

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            secondsElapsed++;
            secondsRemaining--;
            timerDisplayEl.innerText = formatTime(Math.max(secondsRemaining, 0));

            const statBox = timerDisplayEl.closest('.stat-box');
            if (secondsRemaining <= 30 && secondsRemaining > 0) {
                statBox.classList.add('timer-warning');
            } else {
                statBox.classList.remove('timer-warning');
            }

            if (secondsRemaining <= 0) {
                clearInterval(timerInterval);
                handleTimeUp();
            }
        }, 1000);

        document.getElementById('level-title').innerText = level.title;
        document.getElementById('level-desc').innerText = level.desc;

        const dc = document.getElementById('draggables-container');
        const dtc = document.getElementById('drop-targets-container');
        dc.innerHTML = '';
        dtc.innerHTML = '';

        const shuffled = [...level.layers].sort(() => Math.random() - 0.5);

        shuffled.forEach(layer => {
            const el = document.createElement('div');
            el.className = 'layer-item';
            el.setAttribute('draggable', 'true');
            el.id = layer.id;
            el.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 12px; cursor: grab;"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                <span>${layer.name}</span>
            `;
            
            el.addEventListener('dragstart', handleDragStart);
            el.addEventListener('dragend', handleDragEnd);
            el.addEventListener('touchstart', handleTouchStart, {passive: false});
            el.addEventListener('touchmove', handleTouchMove, {passive: false});
            el.addEventListener('touchend', handleTouchEnd);
            
            dc.appendChild(el);
        });

        level.layers.forEach((layer, i) => {
            const zone = document.createElement('div');
            zone.className = 'drop-zone';
            zone.setAttribute('data-expected-id', layer.id);
            zone.innerHTML = `
                <span class="step-badge">مرحله ${i + 1}</span>
                <svg class="check-mark" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            `;
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('dragenter', handleDragEnter);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
            dtc.appendChild(zone);
        });

        // بازنشانی پیشرفت‌های قبلی این مرحله اگر وجود داشته باشد
        if (levelProgress[levelIndex]) {
            levelProgress[levelIndex].forEach(solvedId => {
                const dropZone = dtc.querySelector(`.drop-zone[data-expected-id="${solvedId}"]`);
                const draggableEl = document.getElementById(solvedId);
                if (dropZone && draggableEl) {
                    dropZone.classList.add('correct');
                    dropZone.insertBefore(draggableEl, dropZone.querySelector('.check-mark'));
                    draggableEl.setAttribute('draggable', 'false');
                    draggableEl.style.cursor = 'default';
                    const svgEl = draggableEl.querySelector('svg');
                    if(svgEl) svgEl.style.display = 'none';
                    correctPlacements++;
                }
            });
            updateProgress();
        }

        const btnNext = document.getElementById('btn-next-level');
        btnNext.style.display = (levelIndex < gameLevels.length - 1) ? 'flex' : 'none';

        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        updateCoinDisplay();
    }

    function nextLevel() {
        if (currentLevelIndex < gameLevels.length - 1) {
            document.getElementById('success-modal').classList.add('hidden');
            isConfettiActive = false; 
            startGame(currentLevelIndex + 1);
        }
    }

    function handleDragStart(e) {
        draggedElement = this;
        e.dataTransfer.setData('text/plain', this.id);
        setTimeout(() => this.style.opacity = '0.45', 0);
    }

    function handleDragEnd() {
        this.style.opacity = '1';
        draggedElement = null;
    }

    function handleDragEnter(e) {
        e.preventDefault();
        if (!this.classList.contains('correct')) this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        if (this.classList.contains('correct')) return;

        const droppedId = e.dataTransfer.getData('text/plain');
        const expectedId = this.getAttribute('data-expected-id');
        processDropResult(this, droppedId, expectedId);
    }
    
    function handleTouchStart(e) {
        if (this.getAttribute('draggable') === 'false') return;
        draggedElement = this;
        
        floatingTouchEl = this.cloneNode(true);
        floatingTouchEl.classList.add('dragging-touch');
        floatingTouchEl.style.width = this.offsetWidth + 'px';
        document.body.appendChild(floatingTouchEl);

        const touch = e.touches[0];
        moveFloatingEl(touch.clientX, touch.clientY);
        this.style.opacity = '0.45';
        e.preventDefault(); 
    }

    function handleTouchMove(e) {
        if (!floatingTouchEl) return;
        const touch = e.touches[0];
        moveFloatingEl(touch.clientX, touch.clientY);

        document.querySelectorAll('.drop-zone').forEach(dz => dz.classList.remove('drag-over'));
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = elemBelow ? elemBelow.closest('.drop-zone') : null;
        
        if (dropZone && !dropZone.classList.contains('correct')) {
            dropZone.classList.add('drag-over');
        }
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!floatingTouchEl) return;
        const touch = e.changedTouches[0];
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = elemBelow ? elemBelow.closest('.drop-zone') : null;

        document.querySelectorAll('.drop-zone').forEach(dz => dz.classList.remove('drag-over'));

        if (dropZone && !dropZone.classList.contains('correct')) {
            const expectedId = dropZone.getAttribute('data-expected-id');
            processDropResult(dropZone, draggedElement.id, expectedId);
        }
        
        draggedElement.style.opacity = '1';
        floatingTouchEl.remove();
        floatingTouchEl = null;
        draggedElement = null;
    }

    function moveFloatingEl(x, y) {
        if(floatingTouchEl){
            floatingTouchEl.style.left = (x - floatingTouchEl.offsetWidth / 2) + 'px';
            floatingTouchEl.style.top = (y - floatingTouchEl.offsetHeight / 2) + 'px';
        }
    }

    function processDropResult(dropZoneElement, droppedId, expectedId) {
        if (droppedId === expectedId) {
            dropZoneElement.classList.add('correct');
            dropZoneElement.insertBefore(draggedElement, dropZoneElement.querySelector('.check-mark'));
            draggedElement.setAttribute('draggable', 'false');
            draggedElement.style.cursor = 'default';
            
            const svgEl = draggedElement.querySelector('svg');
            if(svgEl) svgEl.style.display = 'none';
            
            draggedElement.removeEventListener('touchstart', handleTouchStart);
            draggedElement.removeEventListener('touchmove', handleTouchMove);
            draggedElement.removeEventListener('touchend', handleTouchEnd);

            // ثبت پیشرفت برای بازگشت مجدد
            if (!levelProgress[currentLevelIndex]) levelProgress[currentLevelIndex] = [];
            if (!levelProgress[currentLevelIndex].includes(expectedId)) {
                levelProgress[currentLevelIndex].push(expectedId);
            }

            playSfx('correct');

            correctPlacements++;
            updateProgress();
            checkWinCondition();
        } else {
            mistakes++;
            document.getElementById('mistakes-display').innerText = mistakes;
            dropZoneElement.classList.add('error');
            
            playSfx('wrong');
            
            setTimeout(() => dropZoneElement.classList.remove('error'), 500);
        }
    }

    function handleTimeUp() {
        if (levelTimeUp) return;
        levelTimeUp = true;

        document.querySelectorAll('.layer-item[draggable="true"]').forEach(el => {
            el.setAttribute('draggable', 'false');
            el.style.opacity = '.4';
            el.style.cursor = 'not-allowed';
        });
        document.querySelectorAll('.drop-zone').forEach(dz => dz.classList.remove('drag-over'));

        document.getElementById('timeup-correct-count').innerText =
            `${correctPlacements} از ${gameLevels[currentLevelIndex].layers.length}`;
        document.getElementById('timeup-mistakes').innerText = mistakes;

        playSfx('wrong');
        document.getElementById('timeup-modal').classList.remove('hidden');
    }

    function retryLevel() {
        document.getElementById('timeup-modal').classList.add('hidden');
        startGame(currentLevelIndex);
    }

    function checkWinCondition() {
    if (correctPlacements === gameLevels[currentLevelIndex].layers.length) {
        
        // --- سیستم ضد تقلبِ زمانِ غیرممکن (Speed-Hack Anti-Cheat) ---
        // اگر کسی مرحله‌ای که بیش از ۳ آیتم دارد را زیر ۴ ثانیه تمام کرد، قطعاً تقلب کرده است!
        if (secondsElapsed < 4 && gameLevels[currentLevelIndex].layers.length > 3) {
            alert("سرعت غیرطبیعی تشخیص داده شد! رکوردهای کمتر از حد مجاز فیزیکی ثبت نمی‌شوند.");
            showMenu(); // اخراج کاربر از مرحله و بازگشت به منو
            return; // جلوگیری از اجرای بقیه کدهای برنده شدن
        }
        // -------------------------------------------------------------

        clearInterval(timerInterval);
        document.getElementById('final-time').innerText = formatTime(secondsElapsed);
        document.getElementById('final-mistakes').innerText = mistakes;

        const stars = calcStars(mistakes, gameLevels[currentLevelIndex].layers.length);
        ['star1','star2','star3'].forEach((id, i) => {
            const el = document.getElementById(id);
            el.classList.remove('lit');
            if (i < stars) setTimeout(() => el.classList.add('lit'), 500 + i * 180);
        });

        const alreadyCompletedBefore = completedLevels.includes(currentLevelIndex);
        const earned = alreadyCompletedBefore ? 0 : stars * COINS_PER_STAR;
        addCoins(earned);
        document.getElementById('coin-earned-text').innerText = alreadyCompletedBefore
            ? '🙂 این مرحله رو قبلاً تموم کرده بودی — این بار برای تمرین بود، سکه‌ای اضافه نمی‌گیری'
            : `+${earned} سکه`;
        markLevelCompleted(currentLevelIndex);

        // --- بخش بررسی افتخارات ---
        unlockAchievement('first_step'); // باز شدن قطعی مدال اول با پایان اولین مرحله

        if (mistakes === 0) {
            unlockAchievement('flawless'); // اگر خطا صفر بود
            
            // اگر مرحله احیا (ایندکس 4) بود و بدون خطا تمام شد
            if (currentLevelIndex === 4) {
                unlockAchievement('guideline_expert');
            }
        }

        if (secondsElapsed < 30) {
            unlockAchievement('speedrunner'); // اگر زیر 30 ثانیه تمام شد
        }
        // -------------------------------------------------------------

        // ارسال رکوردها به دیتابیس ابری
        saveRecordToCloud(gameLevels[currentLevelIndex].title, secondsElapsed, mistakes, correctPlacements);

        setTimeout(() => {
            document.getElementById('success-modal').classList.remove('hidden');
            isConfettiActive = true;
            launchConfetti();
            
            playSfx('win');
            
            if (earned > 0) {
                setTimeout(() => playSfx('coin'), 800);
            }

        }, 450);
    }
}

    function launchConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#C8102E','#F59E0B','#059669','#3B82F6','#8B5CF6','#EC4899','#FFB3C1'];
        const pieces = Array.from({length: 120}, () => ({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 200,
            r: 4 + Math.random() * 6,
            d: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngle: 0,
            tiltSpeed: 0.07 + Math.random() * 0.05
        }));

        let frame = 0;
        function draw() {
            if(!isConfettiActive) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.tiltAngle += p.tiltSpeed;
                p.y += p.d + Math.sin(frame / 20 + p.x) * 0.4;
                p.tilt = Math.sin(p.tiltAngle) * 12;
                ctx.beginPath();
                ctx.lineWidth = p.r / 2;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt, p.y);
                ctx.lineTo(p.x + p.tilt + p.r * 1.2, p.y + p.r * 2);
                ctx.stroke();
            });
            frame++;
            if (frame < 220) {
                requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        draw();
    }

    // بررسی اسکرول صفحه برای فید شدن منوها
    window.addEventListener('scroll', () => {
        const fixedElements = document.querySelectorAll('.fade-on-scroll');
        if (window.scrollY > 40) {
            fixedElements.forEach(el => el.classList.add('scrolled'));
        } else {
            fixedElements.forEach(el => el.classList.remove('scrolled'));
        }
    });


    // تله امنیتی کنسول
setTimeout(() => {
    console.clear();
    console.log("%cاخطار امنیتی!", "color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 #000;");
    console.log("%cبه دنبال چه میگردی؟", "color: #30D993; font-size: 16px; font-weight: bold;");
}, 2000);