<template>
  <div class="landing">
    <!-- 🎆 FONDO ANIMADO DEL CODEPEN -->
    <canvas id="bgCanvas"></canvas>

    <!-- Glow opcional (tu fondo original) -->
    <div class="background-glow"></div>

    <!-- CONTENEDOR GENERAL -->
    <div class="layout">
      <!-- SECCIÓN 1: LOGIN / REGISTRO -->
      <section class="snap-section">
        <div class="content-wrapper">
          
          <!-- 🔥 LOGO 100% RESPONSIVE -->
          <div class="logo-box">
            <img src="../assets/logo.png" alt="Apex Vision Logo" class="logo-img" />
          </div>

          <h1 class="title text-white">Apex Vision</h1>
          <p class="subtitle text-white">Lo que no se ve, no se entrega.</p>

          <p class="description text-white">
            Plataforma inteligente de logística diseñada para optimizar rutas, 
            validar entregas con IA y conectar despachadores y conductores 
            en tiempo real.
          </p>

          <!-- 🔥 BOTONES MODERNOS -->
          <div class="d-flex align-items-center buttons" style="width: 100%;">
            <button class="btn-register" @click="$router.push('/register')">Registrarse</button>
            <button class="btn-login" @click="$router.push('/login')">Iniciar Sesión</button>
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

  mounted() {
    // === ANIMACIÓN DEL CODEPEN ===
    const canvas = document.getElementById("bgCanvas");
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 70;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  },
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

/* === CANVAS DEL FONDO ANIMADO === */
#bgCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #0a0a0a;
}

/* ----------- ANIMACIÓN DE GLOW TUYA ----------- */
.background-glow {
  position: absolute;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(212,175,55,0.18), transparent 70%);
  filter: blur(60px);
  animation: moveGlow 12s ease-in-out infinite alternate;
  z-index: 1;
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
  height: 100%;
  justify-content: center;
  align-items: center;
}

/* ----------- DISEÑO MÓVIL ----------- */
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
    display: flex;
    justify-content: center;
    align-items: center;
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

/* ----------- LOGO RESPONSIVE ----------- */
.logo-box {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.logo-img {
  border-radius: 10px;
  width: 150px;
  max-width: 60%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(212,175,55,0.3));
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
  to { opacity: 1; transform: translateX(0); }
}

/* ---------------- TIPOGRAFÍA ---------------- */
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

/* ---------------- BOTONES PREMIUM ---------------- */
.buttons {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}

.btn-register,
.btn-login {
  width: 70%;
  padding: 14px 0;
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  letter-spacing: 0.5px;

  background: rgba(0, 0, 0, 0.884);
  border: 2px solid var(--gold);
  color: white;

  box-shadow: 0 0 12px rgba(212,175,55,0.18),
              inset 0 0 12px rgba(212,175,55,0.08);

  backdrop-filter: blur(6px);
  transition: all 0.3s ease;
}

.btn-register:hover,
.btn-login:hover {
  background: rgba(230, 190, 59, 0.61);
  color: rgb(5, 5, 5);
  box-shadow: 0 0 22px rgba(212,175,55,0.35),
              inset 0 0 12px rgba(212,175,55,0.15);
  transform: translateY(-2px);
}

.btn-register:active,
.btn-login:active {
  transform: scale(0.97);
  box-shadow: 0 0 10px rgba(212,175,55,0.15);
}
</style>
