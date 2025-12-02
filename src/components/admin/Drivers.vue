<template>
  <div class="drivers-page">

    <!-- TÍTULO -->
    <h1 class="page-title">Conductores</h1>
    <p class="subtitle">Gestión de transportadores registrados en el sistema</p>

    <!-- BOTÓN AGREGAR -->
    <div class="actions-top">
      <button class="btn-add" @click="openModal">
        + Agregar Conductor
      </button>
    </div>

    <!-- LISTA DE CONDUCTORES -->
    <div class="drivers-grid">
      <div
        v-for="driver in drivers"
        :key="driver.id"
        class="driver-card"
      >
        <div class="driver-header">
          <div class="driver-photo"></div>

          <div>
            <h3 class="driver-name">{{ driver.name }}</h3>
            <p class="driver-id">ID: {{ driver.id }}</p>
          </div>
        </div>

        <div class="driver-info">
          <p><strong>Teléfono:</strong> {{ driver.phone }}</p>
        </div>

        <div class="driver-actions">
    
          <button class="btn-delete">Eliminar</button>
        </div>

      </div>
    </div>

    <!-- ===================== MODAL ===================== -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="showModal"
          class="modal-overlay"
          @click.self="closeModal"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal-container" @click.stop>
            <div class="modal-card" ref="modalCard" tabindex="-1">

              <header class="modal-header">
                <h2 class="modal-title">Agregar Conductor</h2>
                <button class="modal-close-x" @click="closeModal" aria-label="Cerrar modal">✕</button>
              </header>

              <div class="modal-body">

                <!-- BUSCADOR POR TELÉFONO -->
                <div class="form-group">
                  <label>Buscar por teléfono</label>
                  <input
                    type="text"
                    v-model="searchPhone"
                    @input="searchByPhone"
                    class="input-field"
                    placeholder="Escribe un número..."
                  />
                </div>

                <!-- RESULTADO DEL BUSCADOR -->
                <div
                  v-if="searchResult"
                  class="search-result"
                  @click="selectSearchedDriver"
                >
                  <div class="result-photo"></div>
                  <div>
                    <p class="result-name">{{ searchResult.name }}</p>
                    <p class="result-phone">📞 {{ searchResult.phone }}</p>
                  </div>
                </div>

                <!-- INFO DETALLE DEL CONDUCTOR SELECCIONADO -->
                <div v-if="selectedDriver" class="driver-detail-box">
                  <div class="detail-photo"></div>
                  <h3>{{ selectedDriver.name }}</h3>
                  <p class="detail-desc">{{ selectedDriver.description }}</p>
                </div>

                <!-- FORM ORIGINAL (SIN TOCAR) -->
                
              </div>

              <footer class="modal-footer">
                <button class="btn-save" @click="saveDriver">Guardar</button>
                <button class="btn-close" @click="closeModal">Cancelar</button>
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
  name: "DriversPage",
  data() {
    return {
      showModal: false,

      form: {
        name: "",
        phone: "",

        description: "",
      },

      searchPhone: "",
      searchResult: null,
      selectedDriver: null,

      drivers: [
        { id: 1, name: "Luis Salazar", phone: "3001234567",  description: "Transportador con 8 años de experiencia." },
        { id: 2, name: "Carolina Pérez", phone: "3109876543", description: "Confiable y puntual, 5 años en la empresa." },
        { id: 3, name: "Andrés Delgado", phone: "3125566778", description: "Rápido y eficiente con entregas cortas." },
      ],
    };
  },
  methods: {
    openModal() {
      this.showModal = true;

      this.$nextTick(() => {
        try {
          const el = this.$refs.modalCard;
          if (el && el.focus) el.focus();
        } catch (e) {}
      });
    },

    closeModal() {
      this.showModal = false;
      setTimeout(() => {
        this.form = { name: "", phone: "", description: "" };
        this.searchPhone = "";
        this.searchResult = null;
        this.selectedDriver = null;
      }, 200);
    },

    saveDriver() {
      if (!this.form.name.trim()) return;

      const newDriver = {
        id: this.drivers.length + 1,
        name: this.form.name.trim(),
        phone: this.form.phone.trim(),
        description: this.form.description.trim(),
      };

      this.drivers.push(newDriver);
      this.closeModal();
    },

    searchByPhone() {
      if (!this.searchPhone.trim()) {
        this.searchResult = null;
        return;
      }

      this.searchResult = this.drivers.find(d =>
        d.phone.includes(this.searchPhone.trim())
      ) || null;
    },

    selectSearchedDriver() {
      if (this.searchResult) {
        this.selectedDriver = this.searchResult;

        // Autollenar formulario
        this.form.name = this.searchResult.name;
        this.form.phone = this.searchResult.phone;
        this.form.description = this.searchResult.description;
      }
    },
  },
};
</script>

<style scoped>
/* ============= PAGE ============= */
.drivers-page {
  padding: 24px;
  min-height: 100vh;
  color: #f5e9c6;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 6px;
}
.subtitle {
  color: #c8b68a;
  margin-bottom: 16px;
}

.actions-top {
  margin-bottom: 20px;
}
.btn-add {
  padding: 10px 16px;
  background: linear-gradient(180deg,#d4af37,#b78f2b);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* ============= DRIVERS GRID ============= */
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
  transition: 0.2s ease;
}
.driver-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}

.driver-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.driver-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(180deg,#0e0c06,#14100a);
  border: 2px solid rgba(212,175,55,0.18);
}
.driver-name { margin: 0; font-size: 1.05rem; color: #f7e7b5; }
.driver-id { margin: 6px 0 0 0; font-size: .85rem; color: #b9a56d; }

.driver-info { margin-top: 10px; font-size: .9rem; }

.driver-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.btn-edit { background: rgba(255,255,255,0.06); color: #f5e9c6; }
.btn-delete { background: rgba(255,50,50,0.2); color: #ffc3c3; }

/* ============= BUSCADOR RESULTADO ============= */
.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,175,55,0.1);
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 14px;
  transition: 0.2s ease;
}
.search-result:hover {
  background: rgba(255,255,255,0.1);
}
.result-photo {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(180deg,#0e0c06,#14100a);
  border: 2px solid rgba(212,175,55,0.2);
}
.result-name {
  font-size: 1rem;
  color: #f3e6c0;
}
.result-phone {
  color: #ccb98a;
  font-size: .85rem;
}

/* ============= DETALLE CONDUCTOR ============= */
.driver-detail-box {
  background: rgba(255,255,255,0.05);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(212,175,55,0.12);
  text-align: center;
}
.detail-photo {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(180deg,#0e0c06,#14100a);
  border: 2px solid rgba(212,175,55,0.18);
}
.detail-desc {
  margin-top: 10px;
  font-size: .9rem;
  color: #c9bd97;
}

/* ============= MODAL ORIGINAL ============= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,4,4,0.66);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.modal-card {
  width: 100%;
  background: linear-gradient(180deg,#171311,#1b1410);
  border: 1px solid rgba(212,175,55,0.14);
  border-radius: 14px;
  padding: 18px;
  color: #efe7bf;
  max-height: 90vh;
  overflow: auto;
  outline: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title { font-size: 1.25rem; }
.modal-close-x {
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 18px;
  cursor: pointer;
}

.modal-body { margin-top: 14px; }

.form-group {
  margin-bottom: 14px;
}
.form-group label {
  display: block;
  margin-bottom: 4px;
  color: #e6d8aa;
}
.input-field {
  width: 100%;
  padding: 10px;
  background: #11100d;
  border: 1px solid rgba(212,175,55,0.09);
  border-radius: 8px;
  color: #efe8c7;
}

.modal-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-save {
  padding: 8px 14px;
  background: linear-gradient(180deg,#d4af37,#b78f2b);
  border: none;
  border-radius: 8px;
  color: #080808;
  font-weight: 700;
  cursor: pointer;
}
.btn-close {
  padding: 8px 14px;
  min-width: 110px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.18);
  color: #efe8c7;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease;

  /* 🔥 Esto centra el texto perfectamente */
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-close:hover {
  background: rgba(255,255,255,0.12);
}
/* Fade animation */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

</style>
