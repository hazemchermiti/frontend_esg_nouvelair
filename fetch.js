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

// Anomalies API helpers
async function getAnomalies(status = 'NEW') {
    try {
        const res = await fetch(`${API_BASE_URL}/api/anomalies/?status=${encodeURIComponent(status)}`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('getAnomalies error:', error);
        throw error;
    }
}

// Trigger detection for a KPI (POST /api/anomalies/detect/{kpi_code}?year=...)
async function detectAnomalies(kpiCode, year = null) {
    try {
        const normalizedKpi = String(kpiCode || '').trim().toUpperCase();
        if (!normalizedKpi) {
            throw new Error('Code KPI manquant');
        }

        const baseUrl = new URL(`${API_BASE_URL}/api/anomalies/detect/${encodeURIComponent(normalizedKpi)}`);
        if (year !== null && year !== undefined && String(year).trim() !== '') {
            const parsedYear = Number.parseInt(String(year), 10);
            if (Number.isNaN(parsedYear)) {
                throw new Error('Année invalide');
            }
            baseUrl.searchParams.set('year', String(parsedYear));
        }

        // Keep request "simple" (no JSON body/headers) to reduce CORS preflight issues.
        let res = await fetch(baseUrl.toString(), { method: 'POST', mode: 'cors', headers: { 'Accept': 'application/json' } });

        // Some deployments differ on trailing slash behavior; retry once if route mismatch.
        if (res.status === 404 || res.status === 405) {
            const altUrl = new URL(`${API_BASE_URL}/api/anomalies/detect/${encodeURIComponent(normalizedKpi)}/`);
            if (baseUrl.search) {
                altUrl.search = baseUrl.search;
            }
            res = await fetch(altUrl.toString(), { method: 'POST', mode: 'cors', headers: { 'Accept': 'application/json' } });

        }

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            const detail = Array.isArray(err?.detail)
                ? err.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
                : err?.detail;
            throw new Error(detail || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('detectAnomalies error:', error);
        throw error;
    }
}

// Resolve an anomaly (PATCH /api/anomalies/{anomaly_id}/resolve)
async function resolveAnomaly(anomalyId) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/anomalies/${encodeURIComponent(anomalyId)}/resolve`, {
            method: 'PATCH',
            mode: 'cors',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'RESOLU' })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('resolveAnomaly error:', error);
        throw error;
    }
}

// Expose to global scope for pages that include fetch.js
window.getAnomalies = getAnomalies;
window.detectAnomalies = detectAnomalies;
window.resolveAnomaly = resolveAnomaly;

// Recommandation IA pour une anomalie
async function generateRecommendation(anomalyId) {
    if (!anomalyId) throw new Error('anomalyId requis');
    const url = `${API_BASE_URL}/api/anomalies/${encodeURIComponent(anomalyId)}/recommendation`;
    try {
        const res = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (e) {
        console.error('generateRecommendation error:', e);
        throw e;
    }
}
window.generateRecommendation = generateRecommendation;