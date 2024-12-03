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

async function calculatePendulum() {
    const length = parseFloat(document.getElementById('lengthInput').value);
    const timeStep = parseFloat(document.getElementById('timeStepInput').value);
    const angle = parseFloat(document.getElementById('angleInput').value);
    const initialOmegaDeg = parseFloat(document.getElementById('initialOmegaInput').value);

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
    if (isNaN(initialOmegaDeg)) {
        alert('請輸入有效的初始角速度');
        return;
    }

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ length, timeStep, angle, initialOmegaDeg }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('result').textContent = '';
            resizeCanvas();

            if (chart) chart.destroy();
            if (phaseChart) phaseChart.destroy();

            const ctx = document.getElementById('pendulumChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.timeHistory,
                    datasets: [{
                        label: '擺角度 (°)',
                        data: data.displacementHistory,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false,
                        tension: 0.1,
                    }],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: { display: true, text: '時間 (秒)' },
                        },
                        y: {
                            title: { display: true, text: '角度 (°)' },
                        },
                    },
                },
            });

            const phaseCtx = document.getElementById('phaseChart').getContext('2d');
            phaseChart = new Chart(phaseCtx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: '相圖',
                        data: data.phaseSpace, 
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    }],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: { display: true, text: '角度 (°)' },
                        },
                        y: {
                            title: { display: true, text: '角速度 (°/秒)' },
                        },
                    },
                },
            });
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error calculating pendulum:', error);
        alert('計算出現錯誤，請稍後再試。');
    }
}
