const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const nextBossEl = document.getElementById('nextBoss');
const dialogue = document.getElementById('dialogue');
const bossTextEl = document.getElementById('bossText');
const questionEl = document.getElementById('question');
const optBtns = [
    document.getElementById('opt1'),
    document.getElementById('opt2'),
    document.getElementById('opt3'),
    document.getElementById('opt4')
];

let gameState = 'menu'; // menu | playing | paused | paused_for_boss | over | win
let score = 0;
let lives = 3;
let keys = {};
let lastShootTime = 0;
let shootInterval = 140;
let bossIndex = 0;
const MILESTONES = [300, 500, 700, 900, 1100];
let nextMilestone = 300;
let quizTriggeredThisFrame = false;

// Ammo system
let ammo = 50;
let maxAmmo = 50;
let isReloading = false;
let reloadStartTime = 0;
const RELOAD_DURATION = 1500; // 1.5 seconds

// Bullet pattern: 1 = single, 2 = dual parallel, 3 = triple spread
let bulletPattern = 1;

// Revive system (phase 5 reward)
let hasRevive = false;
let reviveUsed = false;

const player = { x: 380, y: 480, width: 60, height: 70, speed: 5.5 };

// Preload sprite images
const playerImg = new Image();
playerImg.src = 'ChatGPT Image 17_00_31 8 thg 3, 2026.png';
const bossImg = new Image();
bossImg.src = 'ChatGPT Image 17_13_41 8 thg 3, 2026_wipe_bg.png';
const obstacleImg = new Image();
obstacleImg.src = 'ChatGPT Image 17_23_01 8 thg 3, 2026_wipe_bg.png';
const bossBulletImg = new Image();
bossBulletImg.src = 'ChatGPT Image 20_04_55 8 thg 3, 2026_wipe_bg.png';
const supplyCrateImg = new Image();
supplyCrateImg.src = 'ChatGPT Image 20_13_38 8 thg 3, 2026_wipe_bg.png';

let bullets = [];
let bossBullets = [];
let enemies = [];
let stars = [];
let boss = null;
let supplyCrates = [];
let supplyCrateSpawnedThisPhase = false;

const bossQuestions = [
    { dialogue: "Boss kiến thức đầu tiên! Trả lời đúng để đuổi nó đi.", question: "2 + 2 bằng mấy?", options: ["3", "4", "5", "6"], correct: 1 },
    { dialogue: "Boss thứ hai xuất hiện! Hãy trả lời chính xác.", question: "Thủ đô Việt Nam là?", options: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Huế"], correct: 1 },
    { dialogue: "Boss thứ ba! Đừng để sai nhé.", question: "Hành tinh lớn nhất hệ Mặt Trời?", options: ["Trái Đất", "Sao Hỏa", "Sao Mộc", "Sao Kim"], correct: 2 },
    { dialogue: "Boss thứ tư! Câu hỏi cuối trước khi nó biến đổi.", question: "Nước có công thức hóa học là?", options: ["CO₂", "H₂SO₄", "H₂O", "NaCl"], correct: 2 },
    { dialogue: "Boss đã BIẾN ĐỔI! Từ giờ bắn trực tiếp – cẩn thận đạn của ta!", question: "(không dùng)", options: [], correct: -1 }
];

for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 1.1,
        size: Math.random() * 2.2 + 0.6
    });
}

document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// Menu & UI
const menuEl = document.getElementById('menu');
const introOverlay = document.getElementById('introOverlay');
const introCloseBtn = document.getElementById('introClose');
const pauseUI = document.getElementById('pauseUI');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const menuBtn = document.getElementById('menuBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const creditsOverlay = document.getElementById('creditsOverlay');
const uiEl = document.getElementById('ui');
const loseUI = document.getElementById('loseUI');
const winUI = document.getElementById('winUI');
const backToMenuLoseBtn = document.getElementById('backToMenuLose');
const backToMenuWinBtn = document.getElementById('backToMenuWin');
const bgMusic = document.getElementById('bgMusic');
const musicVolumeSlider = document.getElementById('musicVolume');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const laserSound = document.getElementById('laserSound');
const confirmMenuOverlay = document.getElementById('confirmMenuOverlay');
const confirmMenuYes = document.getElementById('confirmMenuYes');
const confirmMenuNo = document.getElementById('confirmMenuNo');
let prevStateForMenuConfirm = null;

// Nhạc nền menu - tự động play + loop (chỉ ở intro/menu)
bgMusic.volume = 0.5;
bgMusic.loop = true;
// Đồng bộ slider với volume
if (musicVolumeSlider) {
    musicVolumeSlider.value = String(bgMusic.volume * 100);
    musicVolumeSlider.addEventListener('input', (e) => {
        const v = Number(e.target.value) || 0;
        bgMusic.volume = Math.max(0, Math.min(1, v / 100));
    });
}
// Thử autoplay (có thể bị chặn)
bgMusic.play().catch(() => { });

// Intro overlay -> vào menu
if (introCloseBtn) {
    introCloseBtn.onclick = () => {
        if (introOverlay) introOverlay.style.display = 'none';
        menuEl.style.display = 'flex';
        // Gọi play trong tương tác người dùng để chắc chắn có tiếng
        bgMusic.play().catch(() => { });
    };
}

document.getElementById('startBtn').onclick = () => {
    menuEl.style.display = 'none';
    bgMusic.pause();
    bgMusic.currentTime = 0;
    pauseUI.style.display = 'flex';
    pauseBtn.style.display = 'flex';
    resumeBtn.style.display = 'none';
    uiEl.style.display = 'block';
    gameState = 'playing';
};
document.getElementById('settingsBtn').onclick = () => { menuEl.style.display = 'none'; settingsOverlay.style.display = 'flex'; };
document.getElementById('creditsBtn').onclick = () => { menuEl.style.display = 'none'; creditsOverlay.style.display = 'flex'; };
document.getElementById('settingsClose').onclick = () => { settingsOverlay.style.display = 'none'; menuEl.style.display = 'flex'; };
document.getElementById('creditsClose').onclick = () => { creditsOverlay.style.display = 'none'; menuEl.style.display = 'flex'; };

pauseBtn.onclick = () => {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'flex';
    }
};
resumeBtn.onclick = () => {
    gameState = 'playing';
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
};

if (menuBtn && confirmMenuOverlay && confirmMenuYes && confirmMenuNo) {
    menuBtn.onclick = () => {
        // Mở UI xác nhận, tạm dừng nếu đang chơi
        prevStateForMenuConfirm = gameState;
        if (gameState === 'playing') {
            gameState = 'paused';
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'flex';
        }
        confirmMenuOverlay.style.display = 'flex';
    };

    confirmMenuYes.onclick = () => {
        confirmMenuOverlay.style.display = 'none';
        backToMenu();
    };

    confirmMenuNo.onclick = () => {
        confirmMenuOverlay.style.display = 'none';
        // Khôi phục trạng thái trước đó
        if (prevStateForMenuConfirm === 'playing') {
            gameState = 'playing';
            resumeBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
        } else if (prevStateForMenuConfirm === 'paused') {
            gameState = 'paused';
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'flex';
        }
        prevStateForMenuConfirm = null;
    };
}

document.getElementById('retryBtn').onclick = resetAndPlay;
document.getElementById('playAgainBtn').onclick = resetAndPlay;

if (backToMenuLoseBtn) backToMenuLoseBtn.onclick = backToMenu;
if (backToMenuWinBtn) backToMenuWinBtn.onclick = backToMenu;

function backToMenu() {
    // Ẩn UI kết thúc & khu vực chơi, hiện lại menu + nhạc
    loseUI.style.display = 'none';
    winUI.style.display = 'none';
    pauseUI.style.display = 'none';
    uiEl.style.display = 'none';
    // Reset sound flags
    winSound._played = false;
    loseSound._played = false;
    winSound.pause(); winSound.currentTime = 0;
    loseSound.pause(); loseSound.currentTime = 0;

    // Reset trạng thái game
    score = 0;
    lives = 3;
    bossIndex = 0;
    nextMilestone = 300;
    bullets = [];
    bossBullets = [];
    enemies = [];
    boss = null;
    supplyCrates = [];
    supplyCrateSpawnedThisPhase = false;
    ammo = 50;
    maxAmmo = 50;
    isReloading = false;
    reloadStartTime = 0;
    bulletPattern = 1;
    hasRevive = false;
    reviveUsed = false;
    player.x = 380;
    player.y = 480;
    scoreEl.textContent = 0;
    livesEl.textContent = 3;
    nextBossEl.textContent = 300;

    // Quay lại menu + nhạc nền
    menuEl.style.display = 'flex';
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => { });
    gameState = 'menu';
}

function resetAndPlay() {
    loseUI.style.display = 'none';
    winUI.style.display = 'none';
    // Reset sound flags
    winSound._played = false;
    loseSound._played = false;
    winSound.pause(); winSound.currentTime = 0;
    loseSound.pause(); loseSound.currentTime = 0;
    score = 0;
    lives = 3;
    bossIndex = 0;
    nextMilestone = 300;
    bullets = [];
    bossBullets = [];
    enemies = [];
    boss = null;
    supplyCrates = [];
    supplyCrateSpawnedThisPhase = false;
    ammo = 50;
    maxAmmo = 50;
    isReloading = false;
    reloadStartTime = 0;
    bulletPattern = 1;
    hasRevive = false;
    reviveUsed = false;
    player.x = 380;
    player.y = 480;
    scoreEl.textContent = 0;
    livesEl.textContent = 3;
    nextBossEl.textContent = 300;
    pauseUI.style.display = 'flex';
    pauseBtn.style.display = 'flex';
    resumeBtn.style.display = 'none';
    gameState = 'playing';
}

function collide(r1, r2) {
    return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
}

function spawnSpecialBoss() {
    boss = {
        x: Math.random() * (canvas.width - 160) + 80,
        y: -160,
        width: 160,
        height: 160,
        health: 300,
        maxHealth: 300,
        speedY: 0.9,
        speedX: (Math.random() > 0.5 ? 1.4 : -1.4),
        isSpecial: true
    };
    nextMilestone += 200;
}

// Phase reward descriptions
const PHASE_REWARDS = [
    'Phần thưởng: Nâng đạn lên 100 viên!',
    'Phần thưởng: Bắn 2 tia song song!',
    'Phần thưởng: Nâng đạn lên 150 viên!',
    'Phần thưởng: Bắn 3 tia tỏa ra!'
];

function applyPhaseReward(phaseIndex) {
    switch (phaseIndex) {
        case 0: // Phase 1: ammo cap → 100
            maxAmmo = 100;
            ammo = maxAmmo;
            isReloading = false;
            break;
        case 1: // Phase 2: dual parallel bullets
            bulletPattern = 2;
            break;
        case 2: // Phase 3: ammo cap → 150
            maxAmmo = 150;
            ammo = maxAmmo;
            isReloading = false;
            break;
        case 3: // Phase 4: triple spread bullets
            bulletPattern = 3;
            break;
    }
}

function defeatQuizBoss(isCorrect) {
    let rewardText = '';
    if (isCorrect) {
        rewardText = '\n' + (PHASE_REWARDS[bossIndex] || '');
    }
    bossTextEl.textContent = isCorrect
        ? "Chính xác! Boss đã bị đuổi đi!" + rewardText
        : "Sai rồi! Mất 2 mạng!";
    if (!isCorrect) {
        lives -= 2;
        if (lives <= 0) {
            if (hasRevive && !reviveUsed) {
                reviveUsed = true;
                lives = 1;
            } else {
                gameState = 'over';
            }
        }
    } else {
        applyPhaseReward(bossIndex);
    }
    livesEl.textContent = lives;

    setTimeout(() => {
        dialogue.style.display = 'none';
        if (gameState !== 'over') {
            pauseUI.style.display = 'flex';
            pauseBtn.style.display = 'flex';
            resumeBtn.style.display = 'none';
            gameState = 'playing';
        }
        quizTriggeredThisFrame = false;
        optBtns.forEach(btn => {
            btn.onclick = null;
            btn.style.background = '';
            btn.style.pointerEvents = '';
        });
        if (isCorrect) {
            bossIndex++;
            nextMilestone = MILESTONES[bossIndex] ?? (nextMilestone + 200);
            nextBossEl.textContent = nextMilestone;
        } else {
            nextMilestone = score + 50;
            nextBossEl.textContent = nextMilestone;
        }
        // Spawn 1 supply crate per quiz phase
        if (!supplyCrateSpawnedThisPhase) {
            supplyCrateSpawnedThisPhase = true;
            supplyCrates.push({
                x: Math.random() * (canvas.width - 50),
                y: -60,
                width: 50,
                height: 65,
                speed: 1.2
            });
            // Reset flag after spawn so next phase can spawn again
            setTimeout(() => { supplyCrateSpawnedThisPhase = false; }, 100);
        }
    }, 1600);
}

function update() {
    if (gameState !== 'playing') return;

    if (keys['ArrowLeft'] || keys['KeyA']) player.x = Math.max(0, player.x - player.speed);
    if (keys['ArrowRight'] || keys['KeyD']) player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    if (keys['ArrowUp'] || keys['KeyW']) player.y = Math.max(0, player.y - player.speed);
    if (keys['ArrowDown'] || keys['KeyS']) player.y = Math.min(canvas.height - player.height, player.y + player.speed);

    // Handle reload
    if (isReloading) {
        if (Date.now() - reloadStartTime >= RELOAD_DURATION) {
            isReloading = false;
            ammo = maxAmmo;
        }
    }

    // Manual reload with R key when not full
    if (keys['KeyR'] && !isReloading && ammo < maxAmmo) {
        isReloading = true;
        reloadStartTime = Date.now();
    }

    if (keys['Space'] && Date.now() - lastShootTime > shootInterval && !isReloading && ammo > 0) {
        const cx = player.x + player.width / 2;
        const cy = player.y;
        if (bulletPattern === 1) {
            bullets.push({ x: cx - 3, y: cy, width: 6, height: 18, speed: 9 });
        } else if (bulletPattern === 2) {
            bullets.push({ x: cx - 12, y: cy, width: 6, height: 18, speed: 9 });
            bullets.push({ x: cx + 6, y: cy, width: 6, height: 18, speed: 9 });
        } else if (bulletPattern === 3) {
            bullets.push({ x: cx - 3, y: cy, width: 6, height: 18, speed: 9, vx: 0 });
            bullets.push({ x: cx - 12, y: cy, width: 6, height: 18, speed: 9, vx: -1.5 });
            bullets.push({ x: cx + 6, y: cy, width: 6, height: 18, speed: 9, vx: 1.5 });
        }
        ammo--;
        lastShootTime = Date.now();
        // Laser sound effect
        laserSound.currentTime = 0;
        laserSound.play().catch(() => { });

        // Auto-reload when empty
        if (ammo <= 0 && !isReloading) {
            isReloading = true;
            reloadStartTime = Date.now();
        }
    }
    bullets = bullets.filter(b => { b.y -= b.speed; if (b.vx) b.x += b.vx; return b.y > -30 && b.x > -20 && b.x < canvas.width + 20; });

    if (Math.random() < 0.018 + score / 45000) {
        enemies.push({ x: Math.random() * (canvas.width - 50), y: -50, width: 40, height: 40, speed: 1.8 + score / 18000 });
    }
    enemies.forEach(e => e.y += e.speed);
    enemies = enemies.filter(e => e.y < canvas.height + 60);

    if (score >= nextMilestone && dialogue.style.display !== 'block') {
        if (bossIndex < 4) {
            quizTriggeredThisFrame = true;
            const q = bossQuestions[bossIndex];
            bossTextEl.textContent = q.dialogue;
            questionEl.textContent = q.question;
            optBtns.forEach((btn, idx) => {
                btn.textContent = String.fromCharCode(65 + idx) + '. ' + q.options[idx];
                btn.onclick = () => {
                    optBtns.forEach(b => { b.onclick = null; b.style.pointerEvents = 'none'; });
                    const correct = idx === q.correct;
                    btn.style.background = correct ? '#4CAF50' : '#f44336';
                    defeatQuizBoss(correct);
                };
            });
            dialogue.style.display = 'block';
            pauseUI.style.display = 'none';
            gameState = 'paused_for_boss';
        } else if (!boss) {
            spawnSpecialBoss();
            bossIndex++;
            nextBossEl.textContent = nextMilestone;
        }
    }

    if (boss) {
        boss.y += boss.speedY;
        if (boss.y > 100) { boss.y = 100; boss.speedY = 0; }
        boss.x += boss.speedX * 0.7;
        if (boss.x < 10 || boss.x > canvas.width - boss.width - 10) boss.speedX = -boss.speedX;
        if (Math.random() < 0.009) {
            bossBullets.push({ x: boss.x + boss.width / 2 - 4, y: boss.y + boss.height, width: 8, height: 20, speed: 4.2 });
        }
    }
    bossBullets = bossBullets.filter(bb => { bb.y += bb.speed; return bb.y < canvas.height + 30; });

    stars.forEach(s => { s.y += s.speed; if (s.y > canvas.height) s.y -= canvas.height + 50; });

    // Update supply crates
    supplyCrates.forEach(c => c.y += c.speed);
    supplyCrates = supplyCrates.filter(c => c.y < canvas.height + 80);

    // Player picks up supply crate → heal +1 HP
    supplyCrates = supplyCrates.filter(c => {
        if (collide(player, c)) {
            lives = Math.min(lives + 1, 5); // Max 5 lives
            livesEl.textContent = lives;
            return false;
        }
        return true;
    });

    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (collide(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 12;
                break;
            }
        }
    }

    if (boss) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (collide(bullets[i], boss)) {
                bullets.splice(i, 1);
                boss.health--;
                score += 80;
                if (boss.health <= 0) {
                    score += 1200;
                    boss = null;
                    // Phase 5 reward: grant revive
                    hasRevive = true;
                    bossIndex++;
                    nextMilestone += 200;
                    nextBossEl.textContent = nextMilestone;
                    gameState = 'win';
                }
                break;
            }
        }
    }

    bossBullets.forEach((bb, idx) => {
        if (collide(player, bb)) {
            lives--;
            bossBullets.splice(idx, 1);
            if (lives <= 0) {
                if (hasRevive && !reviveUsed) {
                    reviveUsed = true;
                    lives = 1;
                } else {
                    gameState = 'over';
                }
            }
        }
    });

    enemies = enemies.filter(e => {
        if (collide(player, e)) {
            lives--;
            if (lives <= 0) {
                if (hasRevive && !reviveUsed) {
                    reviveUsed = true;
                    lives = 1;
                } else {
                    gameState = 'over';
                }
            }
            return false;
        }
        return true;
    });

    if (boss && collide(player, boss)) {
        lives--;
        boss.health -= 2;
        if (boss.health <= 0) {
            score += 1200;
            boss = null;
            hasRevive = true;
            bossIndex++;
            nextMilestone += 200;
            nextBossEl.textContent = nextMilestone;
            if (lives > 0) gameState = 'win';
        }
        if (lives <= 0) {
            if (hasRevive && !reviveUsed) {
                reviveUsed = true;
                lives = 1;
            } else {
                gameState = 'over';
            }
        }
    }

    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.75;
    stars.forEach(s => ctx.fillRect(s.x, s.y, s.size, s.size));
    ctx.globalAlpha = 1;

    // Draw player sprite
    if (playerImg.complete && playerImg.naturalWidth > 0) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
        // Fallback: simple triangle
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = '#ffff44';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Draw boss bullets with missile sprite
    if (bossBulletImg.complete && bossBulletImg.naturalWidth > 0) {
        bossBullets.forEach(bb => {
            ctx.drawImage(bossBulletImg, bb.x - 6, bb.y - 4, bb.width + 12, bb.height + 8);
        });
    } else {
        ctx.fillStyle = '#ff0044';
        bossBullets.forEach(bb => ctx.fillRect(bb.x, bb.y, bb.width, bb.height));
    }

    // Draw enemies with bomb sprite
    enemies.forEach(e => {
        if (obstacleImg.complete && obstacleImg.naturalWidth > 0) {
            ctx.drawImage(obstacleImg, e.x - 4, e.y - 4, e.width + 8, e.height + 8);
        } else {
            ctx.fillStyle = '#ff3300';
            ctx.beginPath();
            ctx.arc(e.x + e.width / 2, e.y + e.height / 2, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(e.x + 6, e.y + 14, 28, 8);
        }
    });

    // Draw supply crates
    supplyCrates.forEach(c => {
        if (supplyCrateImg.complete && supplyCrateImg.naturalWidth > 0) {
            ctx.drawImage(supplyCrateImg, c.x, c.y, c.width, c.height);
        } else {
            ctx.fillStyle = '#44cc44';
            ctx.fillRect(c.x, c.y, c.width, c.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', c.x + c.width / 2, c.y + c.height / 2 + 7);
        }
    });

    if (boss) {
        // Draw boss sprite (rotated 180° so it faces downward)
        if (bossImg.complete && bossImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(bossImg, -boss.width / 2, -boss.height / 2, boss.width, boss.height);
            ctx.restore();
        } else {
            // Fallback: circle
            ctx.fillStyle = '#cc00ff';
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        // Health bar
        ctx.fillStyle = '#660000';
        ctx.fillRect(boss.x, boss.y - 30, boss.width, 16);
        ctx.fillStyle = '#00ff44';
        ctx.fillRect(boss.x, boss.y - 30, (boss.health / boss.maxHealth) * boss.width, 16);
        // Boss label
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', boss.x + boss.width / 2, boss.y + boss.height + 28);
    }

    // Draw ammo HUD in bottom-left corner
    if (gameState === 'playing' || gameState === 'paused') {
        const hudX = 12;
        const hudY = canvas.height - 60;

        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect(hudX, hudY, 160, 50, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (isReloading) {
            // Reload progress bar
            const elapsed = Date.now() - reloadStartTime;
            const progress = Math.min(elapsed / RELOAD_DURATION, 1);

            ctx.fillStyle = '#ff6600';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('ĐANG NẠP ĐẠN...', hudX + 10, hudY + 18);

            // Progress bar background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(hudX + 10, hudY + 26, 140, 10);
            // Progress bar fill
            ctx.fillStyle = '#ff8800';
            ctx.fillRect(hudX + 10, hudY + 26, 140 * progress, 10);
        } else {
            // Ammo icon and count
            ctx.fillStyle = ammo > 10 ? '#00ff88' : '#ff4444';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('🔫 ĐẠN', hudX + 10, hudY + 18);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(ammo + ' / ' + maxAmmo, hudX + 75, hudY + 19);

            // Ammo bar
            const barW = 140;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(hudX + 10, hudY + 28, barW, 8);
            const ratio = ammo / maxAmmo;
            ctx.fillStyle = ratio > 0.3 ? '#00ff88' : '#ff4444';
            ctx.fillRect(hudX + 10, hudY + 28, barW * ratio, 8);
        }

        // Show bullet pattern indicator
        if (bulletPattern > 1) {
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(bulletPattern === 2 ? '◆ 2 TIA' : '◆ 3 TIA', hudX + 10, hudY + 48);
        }

        // Show revive indicator
        if (hasRevive && !reviveUsed) {
            ctx.fillStyle = '#44ffaa';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('♥ HỒI SINH', hudX + 85, hudY + 48);
        }
    }
}

function gameLoop() {
    quizTriggeredThisFrame = false;
    if (gameState === 'playing') update();
    draw();
    if (gameState === 'over') {
        pauseUI.style.display = 'none';
        document.getElementById('loseScore').textContent = score;
        loseUI.style.display = 'flex';
        // Game over sound effect (chỉ phát 1 lần)
        if (!loseSound._played) {
            loseSound.currentTime = 0;
            loseSound.play().catch(() => { });
            loseSound._played = true;
        }
    }
    if (gameState === 'win') {
        pauseUI.style.display = 'none';
        document.getElementById('winScore').textContent = score;
        winUI.style.display = 'flex';
        // Win sound effect (chỉ phát 1 lần)
        if (!winSound._played) {
            winSound.currentTime = 0;
            winSound.play().catch(() => { });
            winSound._played = true;
        }
    }
    requestAnimationFrame(gameLoop);
}

nextBossEl.textContent = nextMilestone;
gameLoop();
