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