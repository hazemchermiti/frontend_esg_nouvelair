const SIDEBAR_HTML = `
<aside class="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-logo">✈</div>
        <h2>Nouvelair</h2>
    </div>

    <nav class="sidebar-nav">
        <ul>
            <li>
                <a href="#" class="nav-item" data-page="dashboard">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">Dashboard</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-item" data-page="environnement">
                    <span class="nav-icon">🌱</span>
                    <span class="nav-text">Environnement</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-item" data-page="social">
                    <span class="nav-icon">👥</span>
                    <span class="nav-text">Social</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-item" data-page="gouvernance">
                    <span class="nav-icon">⚖️</span>
                    <span class="nav-text">Gouvernance</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-item" data-page="anomalies">
                    <span class="nav-icon">⚠️</span>
                    <span class="nav-text">Anomalies</span>
                </a>
            </li>
            <li>
                <a href="#" class="nav-item" data-page="recommandations">
                    <span class="nav-icon">💡</span>
                    <span class="nav-text">Recommandations</span>
                </a>
            </li>
            <!-- Rapports link removed -->
            <li>
                <a href="#" class="nav-item" data-page="parametres">
                    <span class="nav-icon">⚙️</span>
                    <span class="nav-text">Paramètres</span>
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <button class="logout-btn" id="sidebarLogoutBtn">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">Déconnexion</span>
        </button>
    </div>
</aside>
`;

const SIDEBAR_CSS = `
/* Sidebar styles for Nouvelair */
:root{
    --nav-bg:#0f2740; /* very dark navy */
    --nav-accent:#2ecc71; /* green */
    --nav-text:#e6eef6; /* light text */
    --nav-muted:#9fb2c8;
}

.app-container{
    display:flex;
    min-height:100vh;
}

.sidebar{
    width:260px;
    background:var(--nav-bg);
    color:var(--nav-text);
    padding:20px 16px;
    display:flex;
    flex-direction:column;
    gap:12px;
    box-shadow: 2px 0 12px rgba(0,0,0,0.12);
}

.sidebar-header{
    display:flex;
    align-items:center;
    gap:12px;
    padding-bottom:8px;
}

.sidebar-logo{
    width:44px;
    height:44px;
    background:var(--nav-accent);
    color:white;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:20px;
}

.sidebar-header h2{
    font-size:16px;
    color:var(--nav-text);
    margin:0;
}

.sidebar-nav ul{
    list-style:none;
    padding:0;
    margin:0;
    display:flex;
    flex-direction:column;
    gap:6px;
}

.nav-item{
    display:flex;
    align-items:center;
    gap:12px;
    padding:10px 12px;
    color:var(--nav-text);
    text-decoration:none;
    border-radius:10px;
    font-weight:500;
}

.nav-item:hover{
    background: rgba(255,255,255,0.03);
}

.nav-item.active{
    background: rgba(46,204,113,0.12);
    box-shadow: inset 0 0 0 1px rgba(46,204,113,0.08);
}

.nav-icon{font-size:18px}
.nav-text{font-size:14px}

.sidebar-footer{
    margin-top:auto;
}

.logout-btn{
    width:100%;
    padding:10px 12px;
    background:transparent;
    border:1px solid rgba(255,255,255,0.06);
    color:var(--nav-text);
    border-radius:8px;
    cursor:pointer;
    display:flex;
    align-items:center;
    gap:8px;
}

.logout-btn:hover{
    background: rgba(255,255,255,0.03);
}

/* Main content area */
.main-content{
    flex:1;
    padding: 24px 32px;
}

body{
    opacity:1;
    transition: opacity .2s ease;
}

body.page-leave{
    opacity:.15;
}

/* Small screens */
@media (max-width:900px){
    .sidebar{width:72px;padding:12px}
    .nav-text{display:none}
    .sidebar-header h2{display:none}
}
`;

const PAGE_ROUTES = {
    dashboard: 'dashboard.html',
    environnement: 'environnement.html',
    social: 'social.html',
    gouvernance: 'gouvernance.html',
    anomalies: 'anomalies.html',
    recommandations: 'recommandations.html',
    parametres: 'parametres.html',
};

function navigateWithTransition(targetPage) {
    if (!targetPage) return;

    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (current === targetPage) return;

    document.body.classList.add('page-leave');
    window.setTimeout(() => {
        window.location.href = targetPage;
    }, 180);
}

function initSidebar() {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
        // User not logged in, don't show sidebar
        return;
    }

    // Check if we're on the login page
    const currentPage = window.location.pathname;
    if (currentPage.includes('login.html') || currentPage === '/login') {
        return;
    }

    // Inject sidebar if not already present
    if (!document.querySelector('.sidebar')) {
        // Inject CSS into head if not present
        if (!document.getElementById('sidebar-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'sidebar-styles';
            styleEl.textContent = SIDEBAR_CSS;
            document.head.appendChild(styleEl);
        }
        const body = document.body;
        
        // Create app container if it doesn't exist
        let appContainer = document.getElementById('app-container');
        if (!appContainer) {
            appContainer = document.createElement('div');
            appContainer.id = 'app-container';
            appContainer.className = 'app-container';
            
            // Move all body content into app-container
            while (body.firstChild && body.firstChild.nodeType !== 8) {
                appContainer.appendChild(body.firstChild);
            }
            
            body.insertBefore(appContainer, body.firstChild);
        }

        // Inject sidebar HTML
        const sidebarContainer = document.createElement('div');
        sidebarContainer.innerHTML = SIDEBAR_HTML;
        appContainer.insertBefore(sidebarContainer.firstElementChild, appContainer.firstChild);

        // Setup event listeners
        setupSidebarEvents();
        
        // Set active state for current page
        setActiveNavItem();
    }
}

function setupSidebarEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            const targetPage = PAGE_ROUTES[page];
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');

            navigateWithTransition(targetPage);
        });
    });

    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', async () => {
            if (typeof window.logoutUser === 'function') {
                try {
                    await window.logoutUser();
                } catch (error) {
                    console.warn('Logout request failed:', error);
                }
            }
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

function setActiveNavItem() {
    const currentPage = window.location.pathname;
    let activePage = 'dashboard'; // default

    if (currentPage.includes('parametres')) {
        activePage = 'parametres';
    } else if (currentPage.includes('recommandations')) {
        activePage = 'recommandations';
    } else if (currentPage.includes('anomalies')) {
        activePage = 'anomalies';
    } else if (currentPage.includes('gouvernance')) {
        activePage = 'gouvernance';
    } else if (currentPage.includes('social')) {
        activePage = 'social';
    } else if (currentPage.includes('environnement')) {
        activePage = 'environnement';
    }

    const activeItem = document.querySelector(`.nav-item[data-page="${activePage}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}