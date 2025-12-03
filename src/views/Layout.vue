<template>
    <div class="layout-container">

        <!-- 🎇 FONDO ANIMADO PREMIUM -->
        <div class="animated-bg"></div>
        <div class="gold-glow"></div>

        <!-- 🌟 BOTÓN HAMBURGUESA (solo móvil) -->
        <button class="hamburger" @click="toggleSidebar">
            ☰
        </button>

        <!-- 🔘 OVERLAY -->
        <div v-if="sidebarOpen" class="overlay" @click="toggleSidebar"></div>

        <!-- 📌 MENÚ LATERAL -->
        <aside :class="['sidebar', sidebarOpen ? 'open' : '']">
            <section class="d-grid gap-5">
                <!-- LOGO -->
                <div class="logo-area">
                    <img src="../assets/logo.png" alt="Apex Vision" class="logo" />
                    <!-- <h2 class="brand">Apex Vision</h2> -->
                </div>

                <!-- Divider -->
                <div class="sidebar-divider"></div>

                <!-- MENU COMPACTO -->
                <nav class="menu">
                    <router-link to="/admin/dashboard" class="menu-item" active-class="active">📊
                        Dashboard</router-link>
                    <router-link to="/admin/drivers" class="menu-item" active-class="active">🚚
                        Transportadores</router-link>
                    <router-link to="/admin/assignRoutes" class="menu-item" active-class="active">🗺️ Asignar
                        rutas</router-link>
                    <router-link to="/admin/settings" class="menu-item" active-class="active">
                        🔔 Notificaciones</router-link>
                    <router-link to="/admin/settings" class="menu-item" active-class="active">⚙️
                        Configuración</router-link>
                </nav>
            </section>

            <!-- 👤 USER BOX -->
            <div class="user-box">
                <img :src="avatarUrl" class="avatar" />
                <div class="user-info">
                    <p class="name">{{ fullName }}</p>
                    <p class="role">{{ userRoleTranslated }}</p>
                    
                    <!-- BOTÓN DE CERRAR SESIÓN MEJORADO -->
                    <button class="logout-btn" @click="logout">
                        <span class="icon">⏻</span> Cerrar sesión
                    </button>
                </div>
            </div>

        </aside>

        <!-- 📄 CONTENIDO -->
        <main class="content">
            <router-view />
        </main>

    </div>
</template>

<script>
export default {
    name: "Layout",

    data() {
        return {
            fullName: "Cargando...",
            userRoleTranslated: "",
            avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`,
            sidebarOpen: false
        };
    },

    created() {
        this.loadUserFromToken();
    },

    methods: {
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },

        loadUserFromToken() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Decodificar JWT
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);

                    // Nombre (Email)
                    this.fullName = payload.email || "Usuario";

                    // Traducir Rol
                    const rawRole = payload.role || "";
                    if (rawRole === "Admin") {
                        this.userRoleTranslated = "Despachador";
                    } else if (rawRole === "Driver") {
                        this.userRoleTranslated = "Conductor";
                    } else {
                        this.userRoleTranslated = rawRole || "Usuario";
                    }

                } catch (error) {
                    console.error("Error leyendo token:", error);
                    this.fullName = "Invitado";
                }
            } else {
                this.fullName = "Invitado";
            }
        },

        logout() {
            localStorage.clear();
            this.$router.push("/login");
        }
    }
};
</script>

<style scoped>
/* ========================= */
/* ESTILOS GENERALES */
/* ========================= */
.hamburger {
    display: none;
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    color: #D4AF37;
    border: 1px solid rgba(212, 175, 55, 0.45);
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 22px;
    cursor: pointer;
    backdrop-filter: blur(4px);
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    z-index: 900;
}

.animated-bg {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 20% 20%, #0a0a0a, #000);
    animation: bgPulse 12s ease-in-out infinite alternate;
    z-index: -2;
}

@keyframes bgPulse {
    0% { transform: scale(1); filter: brightness(1); }
    100% { transform: scale(1.15); filter: brightness(1.35); }
}

.gold-glow {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.12), transparent 60%);
    animation: glowMove 14s ease-in-out infinite alternate;
    z-index: -1;
}

@keyframes glowMove {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.2); opacity: 1; }
}

.layout-container {
    display: flex;
    height: 100vh;
    color: #fff;
    font-family: 'Inter', sans-serif;
}

.sidebar {
    width: 260px;
    padding: 15px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    backdrop-filter: blur(12px);
    background: rgba(8, 8, 8, 0.85);
    border-right: 1px solid rgba(212, 175, 55, 0.18);
    position: relative;
    z-index: 950;
    transition: transform 0.35s ease;
}

.sidebar.open {
    transform: translateX(0);
}

@media (max-width: 900px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
    }

    .hamburger {
        display: block;
    }
}

.logo-area {
    text-align: center;
    margin-bottom: 4px !important;
    padding-bottom: 0;
}

.logo {
    border-radius: 20px;
    width: 190px;
    filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.1));
}

.brand {
    font-size: 18px;
    margin-top: 2px;
    color: #D4AF37;
    font-weight: 800;
    letter-spacing: 1px;
}

.sidebar-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent);
    margin: 6px 0;
}

.menu {
    margin-top: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.menu-item {
    padding: 11px 14px;
    border-radius: 10px;
    color: #bbb;
    background: rgba(255, 255, 255, 0.04);
    text-decoration: none;
    transition: 0.25s ease;
    border: 1px solid transparent;
}

.menu-item:hover {
    background: rgba(212, 175, 55, 0.1);
    color: #fff;
    border-color: rgba(212, 175, 55, 0.35);
}

.active {
    background: rgba(212, 175, 55, 0.18);
    border-color: #D4AF37;
    color: #D4AF37;
    font-weight: 600;
}

/* ========================= */
/* 👤 USER BOX */
/* ========================= */
.user-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 14px;
    border: 1px solid rgba(212, 175, 55, 0.25);
}

.avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgba(212, 175, 55, 0.4);
    flex-shrink: 0;
}

.user-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
}

.name {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 140px;
    color: #f0f0f0;
}

.role {
    font-size: 11px;
    color: #D4AF37;
    margin: 2px 0 6px 0;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ========================= */
/* 🔴 BOTÓN LOGOUT MEJORADO */
/* ========================= */
.logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #bbb;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: fit-content;
}

.logout-btn .icon {
    font-size: 10px;
    margin-top: 1px;
}

.logout-btn:hover {
    background: rgba(212, 55, 55, 0.15); /* Rojo suave de fondo */
    border-color: rgba(212, 55, 55, 0.4); /* Borde rojo */
    color: #ff8888; /* Texto rojo claro */
    transform: translateX(2px);
}

.content {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
}

@media (max-width: 900px) {
    .content {
        padding-top: 70px;
    }
}
</style>