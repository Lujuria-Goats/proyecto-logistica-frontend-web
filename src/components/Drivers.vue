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
          <h3>{{ driver.name }}</h3>
          <p class="driver-id">ID: {{ driver.id }}</p>
        </div>

        <div class="driver-buttons">
          <button class="btn-edit" @click="infoDriver(driver)">Información</button>
          <button class="btn-delete" @click="deleteDriver(driver.id)">Eliminar</button>
        </div>
      </div>
    </div>

   

  </div>
</template>

<script>
export default {
  name: "DriversPage",

  data() {
    return {
      showModal: false,
      isEditing: false,

      drivers: [
        { id: 1, name: "Luis Salazar" },
        { id: 2, name: "Carolina Pérez" },
        

      ],

      form: {
        id: null,
        name: "",
      },
    };
  },

  methods: {
    openModal() {
      this.isEditing = false;
      this.form = { id: null, name: "" };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    editDriver(driver) {
      this.isEditing = true;
      this.form = { ...driver };
      this.showModal = true;
    },

    saveDriver() {
      if (!this.form.name.trim()) return;

      if (this.isEditing) {
        const index = this.drivers.findIndex((x) => x.id === this.form.id);
        this.drivers[index].name = this.form.name;
      } else {
        this.drivers.push({
          id: Date.now(),
          name: this.form.name,
        });
      }

      this.closeModal();
    },

    deleteDriver(id) {
      this.drivers = this.drivers.filter((d) => d.id !== id);
    },
  },
};
</script>

<style scoped>
/* === ESTILO GENERAL === */
.drivers-page {
  padding: 40px;
  min-height: 100vh;
  color: #f4e6c0;
}

/* Títulos */
.page-title {
  font-size: 2.3rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.subtitle {
  color: #d7c79c;
  margin-bottom: 30px;
}

/* Botón agregar */
.actions-top {
  margin-bottom: 25px;
}

.btn-add {
  padding: 10px 22px;
  background: transparent;
  border: 1px solid #c8a34c;
  color: #f1d795;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-add:hover {
  background: rgba(200, 163, 76, 0.2);
  transform: translateY(-2px);
}

/* Grid de tarjetas */
.drivers-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.driver-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(200, 163, 76, 0.25);
  padding: 20px;
  border-radius: 16px;
  transition: 0.3s;
}

.driver-card:hover {
  border-color: rgba(200, 163, 76, 0.45);
  transform: translateY(-4px);
}

/* Info del conductor */
.driver-header h3 {
  color: #f9e7b8;
  margin-bottom: 5px;
}

.driver-id {
  font-size: 0.85rem;
  color: #c4b380;
}

/* Botones */
.driver-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-edit {
  background: #b99645;
  color: #1a1a1a;
}

.btn-edit:hover {
  background: #d1ac53;
}

.btn-delete {
  background: #8b2b2b;
  color: #f5d3d3;
}

.btn-delete:hover {
  background: #a73c3c;
}

/* === MODAL === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #1a1408;
  border: 1px solid #c8a34c;
  padding: 25px;
  width: 90%;
  max-width: 420px;
  border-radius: 14px;
}

.input-field {
  width: 100%;
  padding: 12px;
  margin: 18px 0;
  background: #12100a;
  border: 1px solid #b08f43;
  border-radius: 8px;
  color: #f8e6c2;
}

.modal-buttons {
  display: flex;
  gap: 10px;
}

.btn-save {
  flex: 1;
  padding: 10px;
  background: #d1ac53;
  border: none;
  color: #1a1a1a;
  border-radius: 8px;
  font-weight: bold;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: #555;
  border: none;
  color: white;
  border-radius: 8px;
  font-weight: bold;
}

.btn-cancel:hover {
  background: #777;
}
</style>
