<template>
  <div class="landing">
    <!-- Fondo animado -->
    <div class="background-glow"></div>

    <!-- CONTENEDOR GENERAL -->
    <div class="layout">
      <!-- SECCIÓN 1: LOGIN / REGISTRO -->
      <section class="snap-section">
        <div class="content-wrapper">
          <h1 class="title">Apex Vision</h1>
          <p class="subtitle">Lo que no se ve, no se entrega.</p>

          <p class="description">
            Plataforma inteligente de logística diseñada para optimizar rutas, 
            validar entregas con IA y conectar despachadores y conductores 
            en tiempo real.
          </p>

          <div  class="d-flex align-items-center buttons" style="width: 100%;">
            <button class=" btn-register">Registrarse</button>
            <button class="btn-login">Iniciar Sesión</button>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 2: BENEFICIOS -->
      <section class="snap-section">
        <div class="benefits-card">
          <h2 class="text-white benefits-title">Beneficios de Apex Vision</h2>

          <ul class="text-white benefits-list">
            <li>
              🚀 <strong>Rutas 90% más rápidas</strong> gracias a algoritmos matemáticos optimizados.
            </li>
            <li>
              🧠 <strong>Validación por IA</strong> para evitar entregas falsas o incompletas.
            </li>
            <li>
              🔄 <strong>Sincronización en tiempo real</strong> entre despacho y conductores.
            </li>
            <li>
              📦 <strong>Control total de la última milla</strong> con auditoría visual.
            </li>
            <li>
              🗺️ <strong>Integración GPS</strong> fluida con navegación guiada.
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
};
</script>

<style scoped>
/* ----------- PALETA DE COLORES ----------- */
:root {
  --black-matte: #0f0f0f;
  --dark-card: #1a1a1a;
  --gold: #d4af37;
  --gold-web: #f1c40f;
  --text-main: #f5f5f5;
  --text-secondary: #a0a0a0;
}

/* ----------- CONTENEDOR PRINCIPAL ----------- */
.landing {
  height: 100vh;
  width: 100%;
  background: var(--black-matte);
  position: relative;
  overflow-x: hidden;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ----------- ANIMACIÓN DE FONDO ----------- */
.background-glow {
  position: absolute;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(212,175,55,0.18), transparent 70%);
  filter: blur(60px);
  animation: moveGlow 12s ease-in-out infinite alternate;
}

@keyframes moveGlow {
  0% { transform: translate(-150px, -150px); }
  100% { transform: translate(150px, 150px); }
}

/* ----------- LAYOUT GENERAL PC ----------- */
.layout {
  display: flex;
  gap: 35px;
  z-index: 3;
  padding: 20px;

  /* centrado en pc */
  height: 100%;
  justify-content: center;
  align-items: center;
}

/* ------------------------------------------ */
/* ----------- SECCIONES EN MÓVIL ----------- */
/* ------------------------------------------ */
@media (max-width: 900px) {
  .landing {
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .layout {
    flex-direction: column;
    gap: 0;
    padding: 0;
    height: auto;
  }

  .snap-section {
    scroll-snap-align: start;

    /* Ajuste: centrado en eje Y sin cortar contenido */
    display: flex;
    justify-content: center;   /* ← centrado vertical */
    align-items: center;

    /* Ajuste clave: más compacto pero sin cortar */
    min-height: calc(100vh - 40px);

    padding: 20px 18px;
  }

  .content-wrapper,
  .benefits-card {
    width: 100% !important;
    margin: 0 auto;
  }

  .content-wrapper {
    padding: 40px 22px !important;
  }
}


/* ----------- CARD PRINCIPAL ----------- */
.content-wrapper {
  background: var(--dark-card);
  padding: 60px 40px;
  border-radius: 25px;
  text-align: center;
  width: 480px;
  box-shadow: 0 0 25px rgba(0,0,0,0.5);
  animation: fadeIn 1s ease forwards;
}

/* ----------- CARD BENEFICIOS ----------- */
.benefits-card {
  background: #141414;
  border: 1px solid rgba(212,175,55,0.25);
  padding: 45px 35px;
  width: 420px;
  border-radius: 22px;
  color: var(--text-main);
  box-shadow: 0 0 18px rgba(212,175,55,0.12);
  animation: fadeInRight 1.1s ease forwards;
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ----------- TIPOGRAFÍA Y BOTONES ----------- */
.title {
  font-size: 3rem;
  color: var(--text-main);
  font-weight: 900;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--gold);
  font-weight: 600;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: 0.25s ease;
}

.btn-register {
  border-radius: 5px;
  background: #0f0f0f;
  border: 2px solid var(--gold);
  width: 40%;
  padding: 3px;
  color: #fff8f8ff;
}
.btn-register:hover {
  background: var(--gold-web);
  transform: translateY(-3px);
  color: #0f0f0f;

}

.btn-login {
  background: #0f0f0f;
  border-radius: 5px;
  border: 2px solid var(--gold);
  width: 40%;
  padding: 3px;
  color: #f5f3f3ff;
}
.btn-login:hover {
  background: var(--gold);
  color: #0f0f0f;
  transform: translateY(-3px);
}
</style>
