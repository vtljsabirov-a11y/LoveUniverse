
const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", { alpha: false });

const hint = document.getElementById("hint");
const intro = document.getElementById("intro");
const message = document.getElementById("message");
const backButton = document.getElementById("backButton");

// Состояние сцены
let width, height, centerX, centerY;

let stars = [];
let words = [];
let particles = [];

let angle = 0;
let animationState = "idle";

let absorptionStart = 0;
let lastFrame = 0;

const loveWords = [
    "Люблю",
    "Love",
    "Amour",
    "Amore",
    "Te amo",
    "Te quiero",
    "Je t'aime",
    "Ich liebe dich",
    "Ti amo",
    "愛してる",
    "사랑해",
    "Seni seviyorum",
    "Ik hou van jou",
    "Eu te amo",
    "Mahal kita",
    "أحبك",
    "Kocham cię",
    "Обичам те",
    "Σ' αγαπώ",
    "Любовь"
];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ----------------------------------
// РАЗМЕРЫ ЭКРАНА
// ----------------------------------

function resizeCanvas() {
    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        1.5
    );

    width = window.innerWidth;
    height = window.innerHeight;

    centerX = width / 2;
    centerY = height / 2;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createStars();
    createWords();
    createParticles();
}

// ----------------------------------
// ЗВЁЗДЫ
// ----------------------------------

function createStars() {
    stars = [];

    const count = Math.min(
        160,
        Math.floor(width * height / 4500)
    );

    for (let i = 0; i < count; i++) {
        stars.push({
            x: random(0, width),
            y: random(0, height),
            radius: random(0.5, 1.4),
            opacity: random(0.25, 0.8),
            phase: random(0, Math.PI * 2)
        });
    }
}

function drawStars(time) {
    for (const star of stars) {
        const opacity = star.opacity *
            (0.7 + 0.3 * Math.sin(time + star.phase));

        ctx.globalAlpha = opacity;
        ctx.fillStyle = "#dedcff";

        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

// ----------------------------------
// СЛОВА «ЛЮБЛЮ»
// ----------------------------------

function createWords() {
    words = [];

    const maxRadius = Math.min(width, height) * 0.34;

    for (let i = 0; i < 140; i++) {
        words.push({
            angle: random(0, Math.PI * 2),

            radius: random(
                maxRadius * 0.68,
                maxRadius
            ),

            speed: random(0.0004, 0.0012) *
                (Math.random() < 0.5 ? -1 : 1),

            text: loveWords[
                Math.floor(Math.random() * loveWords.length)
            ],

            size: random(10, 13),
            opacity: random(0.4, 0.85)
        });
    }
}

function drawLoveWords(progress) {
    for (const word of words) {
        const acceleration =
            animationState === "absorbing"
                ? 1 + progress * 18
                : 1;

        word.angle += word.speed * acceleration;

        const shrinking = progress * progress;

        const currentRadius =
            word.radius * (1 - shrinking * 0.96);

        const x = centerX +
            Math.cos(word.angle + angle) *
            currentRadius * 1.3;

        const y = centerY +
            Math.sin(word.angle + angle) *
            currentRadius * 0.55;

        const depth = 0.55 +
            0.45 * Math.sin(word.angle);

        const opacity =
            word.opacity * depth * (1 - progress);

        ctx.save();

        ctx.translate(x, y);
        ctx.rotate(Math.sin(word.angle) * 0.08);

        ctx.globalAlpha = opacity;
        ctx.font = `${word.size}px Georgia`;

        ctx.fillStyle = depth > 0.7
            ? "#dfd1ff"
            : "#91a5ff";

        ctx.fillText(
            word.text,
            -ctx.measureText(word.text).width / 2,
            0
        );

        ctx.restore();
    }

    ctx.globalAlpha = 1;
}

// ----------------------------------
// КОСМИЧЕСКАЯ ПЫЛЬ
// ----------------------------------

function createParticles() {
    particles = [];

    const maxRadius = Math.min(width, height) * 0.38;

    for (let i = 0; i < 60; i++) {
        particles.push({
            angle: random(0, Math.PI * 2),
            radius: random(maxRadius * 0.75, maxRadius),
            speed: random(0.0002, 0.0006),
            size: random(0.5, 1.3)
        });
    }
}

function drawParticles() {
    for (const particle of particles) {
        particle.angle += particle.speed;

        const x = centerX +
            Math.cos(particle.angle + angle * 0.15) *
            particle.radius;

        const y = centerY +
            Math.sin(particle.angle + angle * 0.15) *
            particle.radius * 0.45;

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#c6bbff";

        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

// ----------------------------------
// СВЕЧЕНИЕ
// ----------------------------------

function drawGlow() {
    const radius = Math.min(width, height) * 0.27;

    const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
    );

    gradient.addColorStop(
        0,
        "rgba(105, 75, 255, 0.12)"
    );

    gradient.addColorStop(
        0.5,
        "rgba(70, 90, 255, 0.06)"
    );

    gradient.addColorStop(
        1,
        "rgba(0, 0, 0, 0)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
    );
}

// ----------------------------------
// ЗАДНЯЯ ЧАСТЬ КОЛЬЦА
// ----------------------------------

function drawBackDisk() {
    const r = Math.min(width, height) * 0.13;

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(-0.12);

    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        r * 2.1,
        r * 0.72,
        0,
        Math.PI,
        Math.PI * 2
    );

    ctx.strokeStyle = "rgba(100, 110, 255, 0.4)";
    ctx.lineWidth = 18;
    ctx.shadowColor = "#7865ff";
    ctx.shadowBlur = 30;
    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        r * 1.85,
        r * 0.61,
        0,
        Math.PI,
        Math.PI * 2
    );

    ctx.strokeStyle = "rgba(190, 155, 255, 0.8)";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 22;
    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        r * 1.55,
        r * 0.48,
        0,
        Math.PI,
        Math.PI * 2
    );

    ctx.strokeStyle = "rgba(220, 205, 255, 0.9)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#c3aaff";
    ctx.shadowBlur = 18;
    ctx.stroke();

    ctx.restore();
}

// ----------------------------------
// ЧЁРНАЯ ДЫРА
// ----------------------------------

function drawBlackHole(progress) {
    const radius = Math.min(width, height) * 0.13;

    if (progress > 0) {
        const flash = Math.max(
            0,
            1 - Math.abs(progress - 0.65) / 0.25
        );

        if (flash > 0) {
            const flashGradient = ctx.createRadialGradient(
                centerX,
                centerY,
                radius,
                centerX,
                centerY,
                radius * 2.8
            );

            flashGradient.addColorStop(
                0,
                `rgba(190, 165, 255, ${flash * 0.35})`
            );

            flashGradient.addColorStop(
                1,
                "rgba(100, 100, 255, 0)"
            );

            ctx.fillStyle = flashGradient;

            ctx.fillRect(
                centerX - radius * 3,
                centerY - radius * 3,
                radius * 6,
                radius * 6
            );
        }
    }

    const shadow = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.85,
        centerX,
        centerY,
        radius * 1.5
    );

    shadow.addColorStop(0, "#000000");
    shadow.addColorStop(0.55, "rgba(0, 0, 0, 0.98)");
    shadow.addColorStop(0.8, "rgba(15, 10, 35, 0.45)");
    shadow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = shadow;

    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        radius * 1.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#000000";

    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// ----------------------------------
// ПЕРЕДНЯЯ ЧАСТЬ КОЛЬЦА
// ----------------------------------

function drawFrontDisk() {
    const r = Math.min(width, height) * 0.13;

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(-0.12);

    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        r * 2.1,
        r * 0.72,
        0,
        0,
        Math.PI
    );

    ctx.strokeStyle = "rgba(110, 125, 255, 0.85)";
    ctx.lineWidth = 12;
    ctx.shadowColor = "#806aff";
    ctx.shadowBlur = 28;
    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        r * 1.85,
        r * 0.61,
        0,
        0,
        Math.PI
    );

    ctx.strokeStyle = "rgba(210, 185, 255, 0.95)";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#c5aaff";
    ctx.shadowBlur = 20;
    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        r * 1.35,
        r * 0.44,
        0,
        0,
        Math.PI
    );

    ctx.strokeStyle = "rgba(160, 180, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.stroke();

    ctx.restore();
}

// ----------------------------------
// НАЧАЛО ПОГЛОЩЕНИЯ
// ----------------------------------

function startAbsorption() {
    if (animationState !== "idle") return;

    animationState = "absorbing";
    absorptionStart = performance.now();

    hint.style.opacity = "0";
    intro.style.opacity = "0";
    intro.style.transform = "translateY(-20px)";
}

// ----------------------------------
// ГЛАВНАЯ АНИМАЦИЯ
// ----------------------------------

function animate(time) {
    if (time - lastFrame < 1000 / 60) {
        requestAnimationFrame(animate);
        return;
    }

    lastFrame = time;

    let progress = 0;

    if (animationState === "absorbing") {
        progress = Math.min(
            (time - absorptionStart) / 2600,
            1
        );

        if (progress >= 1) {
            animationState = "finished";
            message.classList.add("show");
        }
    }

    ctx.fillStyle = "#05050b";
    ctx.fillRect(0, 0, width, height);

    angle += animationState === "absorbing"
        ? 0.004 + progress * 0.025
        : 0.0015;

    drawStars(time * 0.001);
    drawGlow();
    drawParticles();

    drawBackDisk();
    drawLoveWords(progress);
    drawBlackHole(progress);
    drawFrontDisk();

    requestAnimationFrame(animate);
}

// ----------------------------------
// НАЖАТИЕ НА ЧЁРНУЮ ДЫРУ
// ----------------------------------

canvas.addEventListener("pointerdown", event => {
    if (animationState !== "idle") return;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const clickRadius = Math.min(width, height) * 0.17;

    if (distance < clickRadius) {
        startAbsorption();
    }
});

// ----------------------------------
// КНОПКА ВОЗВРАЩЕНИЯ
// ----------------------------------

backButton.addEventListener("click", () => {
    // Скрываем послание
    message.classList.remove("show");

    // Сбрасываем состояние анимации
    animationState = "idle";
    absorptionStart = 0;

    // Возвращаем слова на исходные позиции
    createWords();

    // Возвращаем начальный заголовок
    intro.style.opacity = "1";
    intro.style.transform = "translateY(0)";

    // Возвращаем подсказку
    hint.style.opacity = "1";
    hint.textContent = "КОСНИСЬ ЧЁРНОЙ ДЫРЫ";
});

// ----------------------------------
// ЗАПУСК
// ----------------------------------

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

requestAnimationFrame(animate);
