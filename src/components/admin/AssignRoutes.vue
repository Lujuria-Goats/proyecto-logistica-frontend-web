<template>
  <div class="assign-page">
    <h1 class="page-title">Asignar Rutas</h1>
    <p class="subtitle">Gestiona las rutas de tus transportadores</p>

    <!-- LISTA DE TRANSPORTADORES -->
    <div class="drivers-grid">
      <div
        v-for="driver in drivers"
        :key="driver.id"
        class="driver-card"
      >
        <div class="driver-header">
          <h3>{{ driver.name }}</h3>
          <p class="driver-id">ID: {{ driver.id }}</p>
        </div>

        <div class="driver-buttons">
          <button class="btn-assign" @click="openModal(driver)">Asignar Ruta</button>
        </div>
      </div>
    </div>

    <!-- TELEPORT: monta el modal directo en <body> para evitar conflictos z-index/position -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true">
          <div class="modal-container" @click.stop>
            <div class="modal-card" ref="modalCard" tabindex="-1">

              <header class="modal-header">
                <h2 class="modal-title">Asignar ruta</h2>
                <button class="modal-close-x" @click="closeModal" aria-label="Cerrar modal">✕</button>
              </header>

              <div class="modal-body">

                <!-- FOTO + NOMBRE -->
                <div class="driver-info">
                  <div class="driver-photo" aria-hidden="true"></div>

                  <div class="driver-data">
                    <p class="driver-label">Transportador:</p>
                    <h3 class="driver-name">{{ selectedDriver ? selectedDriver.name : '' }}</h3>
                  </div>
                </div>

                <!-- MAPA -->
                <div class="map-section">
                  <div class="map-placeholder">
                    <p>Mapa aquí</p>
                  </div>
                </div>

                <!-- ASIGNAR NUEVA RUTA -->
                <div class="route-input-section">
                  <input
                    type="text"
                    v-model="newRoute"
                    placeholder="Escribe la ruta..."
                    class="input-field"
                    @keyup.enter="addRoute"
                  />
                  <button class="btn-assign-small" @click="addRoute">Asignar</button>
                </div>

                <!-- LISTA DE RUTAS -->
                <div class="routes-list">
                  <p class="routes-title">Rutas asignadas</p>

                  <div v-if="exampleRoutes.length === 0" class="no-routes">
                    <small>No hay rutas asignadas</small>
                  </div>

                  <div
                    v-for="(route, index) in exampleRoutes"
                    :key="index"
                    class="route-item"
                  >
                    <span class="route-text">{{ route }}</span>
                    <button class="btn-remove" @click="removeRoute(index)">Eliminar</button>
                  </div>
                </div>
              </div>

              <footer class="modal-footer">
                <button class="btn-close" @click="closeModal">Cerrar</button>
              </footer>

            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
export default {
  name: "AsignarRutas",
  data() {
    return {
      showModal: false,
      selectedDriver: null,
      newRoute: "",
      drivers: [
        { id: 1, name: "Luis Salazar" },
        { id: 2, name: "Carolina Pérez" },
        { id: 3, name: "Andrés Delgado" },
      ],
      exampleRoutes: [
        "Ruta 1 - Zona Norte",
        "Ruta 2 - Centro",
        "Ruta 3 - Av. Industrial",
      ],
    };
  },
  methods: {
    openModal(driver) {
      console.log("openModal -> driver:", driver);
      this.selectedDriver = driver;
      this.showModal = true;

      // foco accesible: esperar a render
      this.$nextTick(() => {
        try {
          const el = this.$refs.modalCard;
          if (el && el.focus) el.focus();
        } catch (e) {
          // no fatal
        }
      });
    },
    closeModal() {
      console.log("closeModal");
      this.showModal = false;
      // limpiar después de la animación
      setTimeout(() => {
        this.selectedDriver = null;
        this.newRoute = "";
      }, 200);
    },
    addRoute() {
      if (!this.newRoute || !this.newRoute.trim()) return;
      this.exampleRoutes.push(this.newRoute.trim());
      this.newRoute = "";
    },
    removeRoute(index) {
      this.exampleRoutes.splice(index, 1);
    },
  },
};
</script>

<style scoped>
/* ====== General ====== */
.assign-page {
  padding: 24px;
  min-height: 100vh;
  color: #f5e9c6;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Titles */
.page-title {
  font-size: 2rem;
  margin: 0 0 6px 0;
  color: #f5e7c0;
}
.subtitle {
  color: #c8b68a;
  margin-bottom: 18px;
}

/* Drivers grid */
.drivers-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.driver-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,175,55,0.12);
  padding: 16px;
  border-radius: 12px;
  transition: transform .18s ease, box-shadow .18s ease;
}
.driver-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}
.driver-header h3 { margin: 0; color: #f7e7b5; font-size: 1.05rem; }
.driver-id { margin: 6px 0 0 0; font-size: .86rem; color: #b9a56d; }
.driver-buttons { margin-top: 12px; }
.btn-assign {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(180deg,#d4af37,#b78f2b);
  border: none;
  color: #080808;
  font-weight: 700;
  cursor: pointer;
}
.btn-assign:hover { filter: brightness(1.05); transform: translateY(-2px); }

/* ===== TELEPORTED MODAL STYLES ===== */

/* overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,4,4,0.66);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000; /* muy alto para evitar conflictos */
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  padding: 20px;
}

/* centrar el modal en su contenedor */
.modal-container {
  width: 100%;
  max-width: 940px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* tarjeta modal */
.modal-card {
  width: 100%;
  background: linear-gradient(180deg,#171311,#1b1410);
  border: 1px solid rgba(212,175,55,0.14);
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.7);
  padding: 18px;
  color: #efe7bf;
  max-height: 90vh;
  overflow: auto;
  outline: none; /* focus handling via JS */
}

/* header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-title { margin: 0; font-size: 1.25rem; color: #f3e7be; }
.modal-close-x {
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
}
.modal-close-x:hover { background: rgba(212,175,55,0.06); }

/* body */
.modal-body { margin-top: 14px; }

/* driver info */
.driver-info {
  display: flex;
  gap: 12px;
  align-items: center;
}
.driver-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(180deg,#0e0c06,#14100a);
  border: 2px solid rgba(212,175,55,0.18);
}
.driver-label { margin: 0; font-size: .8rem; color: #c9b992; }
.driver-name { margin: 4px 0 0 0; font-size: 1.05rem; color: #f6e8bd; }

/* map */
.map-section { margin-top: 14px; }
.map-placeholder {
  height: 170px;
  border-radius: 10px;
  background: linear-gradient(180deg,#0f0d07,#12100a);
  border: 1px dashed rgba(212,175,55,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbb98b;
}

/* route input */
.route-input-section {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.input-field {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  background: #11100d;
  border: 1px solid rgba(212,175,55,0.09);
  color: #efe8c7;
}
.btn-assign-small {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  background: linear-gradient(180deg,#d4af37,#b78f2b);
  color: #080808;
  cursor: pointer;
}

/* routes list */
.routes-list { margin-top: 14px; max-height: 220px; overflow: auto; padding-right: 6px; }
.routes-title { margin: 0 0 8px 0; color: #e6d8aa; font-weight: 700; }
.route-item {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
  padding:8px;
  border-radius:8px;
  margin-top:8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,175,55,0.06);
}
.btn-remove {
  border: 1px solid #8b2b2b;
  background: transparent;
  padding: 6px 10px;
  color: #f5d3d3;
  border-radius: 6px;
  cursor:pointer;
}

/* footer */
.modal-footer {
  margin-top: 14px;
  display:flex;
  justify-content:flex-end;
}
.btn-close {
  padding: 8px 14px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.06);
  color: #efe8c7;
  cursor: pointer;
width: 50px;
  display: flex;          /* <-- centra contenido */
  align-items: center;    /* <-- centra vertical */
  justify-content: center;/* <-- centra horizontal */
}
/* small screens */
@media (max-width: 640px) {
  .drivers-grid { grid-template-columns: 1fr; }
  .modal-container { padding: 0 8px; }
  .map-placeholder { height: 140px; }
}

/* fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
