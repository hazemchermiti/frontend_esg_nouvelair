const API_BASE_URL = 'http://localhost:8000';

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        if (response.ok) {
            const data = await response.json();

            // Save user to localStorage
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return {
                success: true,
                data: data,
            };
        } else if (response.status === 404 || response.status === 422) {
            return {
                success: false,
                error: 'Email ou mot de passe incorrect',
            };
        } else {
            const data = await response.json();
            return {
                success: false,
                error: data.message || 'Une erreur est survenue',
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Erreur de connexion. Veuillez réessayer.',
        };
    }
}

async function registerUser(email, password, fullName, role, isActive) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                full_name: fullName,
                role: role.toUpperCase(),
                is_active: parseInt(isActive),
            }),
        });

        if (response.status === 201) {
            const data = await response.json();
            return {
                success: true,
                data: data,
            };
        } else {
            const data = await response.json();
            return {
                success: false,
                error: data.message || 'Une erreur est survenue',
            };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: 'Erreur d\'enregistrement. Veuillez réessayer.',
        };
    }
}

// Dans fetch.js
async function loadDashboardData(year = 2025) {
    try {
        const [globalRes, environRes, socialRes, gouvernRes, evolutionRes] = await Promise.all([
            fetch(`${API_BASE_URL}/pillars/score/global?year=${year}`),
            fetch(`${API_BASE_URL}/pillars/score/environnement?year=${year}`),
            fetch(`${API_BASE_URL}/pillars/score/social?year=${year}`),
            fetch(`${API_BASE_URL}/pillars/score/gouvernance?year=${year}`),
            fetch(`${API_BASE_URL}/pillars/score/evolution?year=${year}`)
        ]);

        const results = {
            global: globalRes.ok ? await globalRes.json() : null,
            environnement: environRes.ok ? await environRes.json() : null,
            social: socialRes.ok ? await socialRes.json() : null,
            gouvernance: gouvernRes.ok ? await gouvernRes.json() : null,
            evolution: evolutionRes.ok ? await evolutionRes.json() : null // INDISPENSABLE
        };

        return { success: true, data: results };
    } catch (error) {
        console.error('Loading error:', error);
        return { success: false, error: 'Erreur' };
    }
}    
let myChart = null; // Variable globale pour gérer la mise à jour

function renderEvolutionChart(evoData) {
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    
    if (myChart) { myChart.destroy(); }

    // On récupère les labels (Jan, Fév...) et les séries
    const labels = evoData.labels;
    const series = evoData.series;

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Global',
                    data: series.global, // On pioche dans series
                    borderColor: '#1e3a5f',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Environnement (E)',
                    data: series.E, // On pioche dans series
                    borderColor: '#2ecc71',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Social (S)',
                    data: series.S, // On pioche dans series
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Gouvernance (G)',
                    data: series.G, // On pioche dans series
                    borderColor: '#f97316',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100, // Scores sur 100
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#f3f4f6', borderDash: [5, 5] }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}