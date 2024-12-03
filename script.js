let chart = null;
let phaseChart = null;

function resizeCanvas() {
    const canvas = document.getElementById('pendulumChart');
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;

    const phaseCanvas = document.getElementById('phaseChart');
    phaseCanvas.width = window.innerWidth * 0.9;
    phaseCanvas.height = window.innerHeight * 0.7;
}

function calculatePendulum() {
    const length = parseFloat(document.getElementById('lengthInput').value);
    const timeStep = parseFloat(document.getElementById('timeStepInput').value);
    const angle = parseFloat(document.getElementById('angleInput').value);
    const initialOmega = parseFloat(document.getElementById('initialOmegaInput').value);

    if (isNaN(length) || length <= 0) {
        alert('請輸入有效的擺長 (大於 0)');
        return;
    }
    if (isNaN(timeStep) || timeStep <= 0) {
        alert('請輸入有效的步長 (大於 0)');
        return;
    }
    if (isNaN(angle) || angle < -90 || angle > 90) {
        alert('請輸入有效的初始擺角 (範圍：-90° 到 90°)');
        return;
    }
    if (isNaN(initialOmega)) {
        alert('請輸入有效的初始角速度');
        return;
    }

    // 將初始角度轉為弧度
    let angleRadians = angle * (Math.PI / 180);
    let omega = initialOmega; // 初始角速度
    const g = 9.80665; // 重力加速度 (m/s^2)

    const period = 2 * Math.PI * Math.sqrt(length / g);
    const totalTime = 10 * period; // 模擬 10 個完整周期
    const numSteps = Math.floor(totalTime / timeStep);

    let displacementHistory = [];
    let timeHistory = [];
    let phaseSpace = [];

    for (let step = 0; step < numSteps; step++) {
        const rk4 = (angle, omega, dt) => {
            const k1a = omega;
            const k1w = -(g / length) * Math.sin(angle);

            const k2a = omega + 0.5 * dt * k1w;
            const k2w = -(g / length) * Math.sin(angle + 0.5 * dt * k1a);

            const k3a = omega + 0.5 * dt * k2w;
            const k3w = -(g / length) * Math.sin(angle + 0.5 * dt * k2a);

            const k4a = omega + dt * k3w;
            const k4w = -(g / length) * Math.sin(angle + dt * k3a);

            const newAngle = angle + (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
            const newOmega = omega + (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);

            return { newAngle, newOmega };
        };

        const { newAngle, newOmega } = rk4(angleRadians, omega, timeStep);

        displacementHistory.push(newAngle * (180 / Math.PI)); // 轉換回角度
        timeHistory.push(step * timeStep);
        phaseSpace.push({
            x: newAngle * (180 / Math.PI), // 角度
            y: newOmega, // 角速度
        });

        angleRadians = newAngle;
        omega = newOmega;
    }

    // 繪製圖表
    document.getElementById('result').textContent = '';
    resizeCanvas();

    if (chart) chart.destroy();
    if (phaseChart) phaseChart.destroy();

    const ctx = document.getElementById('pendulumChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeHistory,
            datasets: [{
                label: '擺角度 (°)',
                data: displacementHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.1,
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: '時間 (秒)' } },
                y: { title: { display: true, text: '角度 (°)' } },
            },
        },
    });

    const phaseCtx = document.getElementById('phaseChart').getContext('2d');
    phaseChart = new Chart(phaseCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '相圖',
                data: phaseSpace,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: '角度 (°)' } },
                y: { title: { display: true, text: '角速度 (rad/s)' } },
            },
        },
    });
}
