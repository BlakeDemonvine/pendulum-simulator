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
    const initialOmegaDeg = parseFloat(document.getElementById('initialOmegaInput').value);

    if (isNaN(length) || length <= 0) {
        alert('Please enter a valid length (greater than 0)');
        return;
    }
    if (isNaN(timeStep) || timeStep <= 0) {
        alert('Please enter a valid time step (greater than 0)');
        return;
    }
    if (isNaN(angle) || angle < -90 || angle > 90) {
        alert('Please enter a valid initial angle (range: -90° to 90°)');
        return;
    }
    if (isNaN(initialOmegaDeg)) {
        alert('Please enter a valid initial angular velocity');
        return;
    }

    const g = 9.80665;
    const period = 2 * Math.PI * Math.sqrt(length / g);
    const totalTime = 10 * period;
    const numSteps = Math.floor(totalTime / timeStep);

    let angleRadians = angle * Math.PI / 180;
    let omegaRadiansPerSec = initialOmegaDeg * Math.PI / 180;

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

        const { newAngle, newOmega } = rk4(angleRadians, omegaRadiansPerSec, timeStep);

        displacementHistory.push(newAngle * 180 / Math.PI);
        timeHistory.push(step * timeStep);
        phaseSpace.push({
            x: newAngle * 180 / Math.PI,
            y: newOmega * 180 / Math.PI,
        });

        angleRadians = newAngle;
        omegaRadiansPerSec = newOmega;
    }

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
                label: 'Angle (°)',
                data: displacementHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.1,
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Time (sec)' },
                },
                y: {
                    title: { display: true, text: 'Angle (°)' },
                },
            },
        },
    });

    const phaseCtx = document.getElementById('phaseChart').getContext('2d');
    phaseChart = new Chart(phaseCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Phase Diagram',
                data: phaseSpace,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Angle (°)' },
                },
                y: {
                    title: { display: true, text: 'Angular Velocity (°/sec)' },
                },
            },
        },
    });
}
