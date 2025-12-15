<template>
  <div class="logs-page container py-5 text-white">

    <!-- TÍTULO -->
    <h2 class="fw-bold mb-4 fade-in">Notificaciones</h2>

    <!-- PANEL -->
    <div class="logs-panel">

      <!-- HEADER -->
      <div class="logs-header">
        <h4 class="m-0">Actividad reciente</h4>

        <select class="filter-select">
          <option value="all">Todas</option>
          <option value="entrega">Entregas</option>
          <option value="recogida">Recogidas</option>
        </select>
      </div>

      <!-- LISTA -->
      <div class="logs-list mt-3">
        <div
          class="log-item"
          v-for="log in logs"
          :key="log.id"
          :class="log.type"
        >
          <div class="log-icon">
            <span v-if="log.type === 'entrega'">📦</span>
            <span v-if="log.type === 'recogida'">🚚</span>
          </div>

          <div class="log-content">
            <h5>{{ log.title }}</h5>
            <p class="log-message">{{ log.message }}</p>
            <span class="log-time">{{ log.time }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";

// Datos de prueba con tu formato real
const logs = ref([
  {
    id: 1,
    type: "entrega",
    title: "Entrega completada",
    message: "Juan Pérez entregó pedido en Calle 20 #14-23.",
    time: "Hace 5 minutos"
  },
  {
    id: 2,
    type: "recogida",
    title: "Paquete recogido",
    message: "Camilo Morales recogió paquete en Avenida Caracas #45.",
    time: "Hace 18 minutos"
  },
  {
    id: 3,
    type: "entrega",
    title: "Entrega completada",
    message: "Laura Gómez entregó pedido en Carrera 7 #52-10.",
    time: "Hace 1 hora"
  },
  {
    id: 4,
    type: "entrega",
    title: "Entrega completada",
    message: "Andrés Díaz entregó pedido en Calle 9 Sur #32-15.",
    time: "Hoy 9:10 AM"
  }
]);
</script>

<style scoped>
.logs-page {
  animation: fadeIn 0.4s ease;
}

/* PANEL */
.logs-panel {
  background: #0f1118;
  border: 1px solid #1c1f2a;
  border-radius: 14px;
  padding: 28px;
}

/* HEADER */
.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-select {
  background: #161922;
  border: 1px solid #2b3040;
  color: white;
  padding: 7px 12px;
  border-radius: 6px;
  outline: none;
}

/* ITEM */
.log-item {
  background: #14161f;
  border: 1px solid #232735;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  gap: 15px;
  margin-bottom: 14px;
  transition: transform 0.2s ease, background 0.25s ease;
}

.log-item:hover {
  transform: translateX(4px);
  background: #171924;
}

/* ICONO */
.log-icon {
  font-size: 30px;
  width: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CONTENIDO */
.log-content h5 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.log-message {
  margin: 4px 0;
  color: #b5b8c2;
  font-size: 15px;
}

.log-time {
  display: block;
  font-size: 12px;
  color: #888c96;
}

/* COLORES POR TIPO */
.log-item.entrega {
  border-left: 4px solid #2ecc71; /* Verde entregas */
}

.log-item.recogida {
  border-left: 4px solid #3498db; /* Azul recogidas */
}

/* ANIMACIÓN */
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}
</style>
