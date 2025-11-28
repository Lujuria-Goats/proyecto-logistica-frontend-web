<template>
  <div class="login-container">

    <!-- BOTÓN VOLVER -->
    <button class="btn-back" @click="$router.push('/')">
      ⬅ Volver
    </button>

    <div class="card">
      <h2 class="title">Iniciar Sesión</h2>
      <p class="subtitle">Accede a Apex Vision y continúa tu operación.</p>

      <!-- INPUTS -->
      <div class="form-group">
        <label>Correo Electrónico</label>
        <input
          v-model="email"
          type="email"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <input
          v-model="password"
          type="password"
          placeholder="********"
        />
      </div>

      <!-- BOTÓN LOGIN -->
      <button class="btn-login" @click="$router.push('/admin')">
        Ingresar
      </button>

    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    loginUser() {
      console.log({
        email: this.email,
        password: this.password,
      });

      // Aquí harías tu fetch/axios al backend
    },
  },
};
</script>

<style scoped>
:root {
  --gold: #d4af37;
  --gold-dark: #b8952f;
  --text-dark: #222;
  --light-gray: #e8e8e8;
}

/* CENTRADO GENERAL */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  position: relative;
}

/* BOTÓN VOLVER */
.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  color: rgb(0, 0, 0);
  border-radius: 10px;
  border: none;
  background: #ffffff;
  box-shadow: 0px 0px 3px #D4AF37;
  padding: 8px 12px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-back:hover {
  color: #000;
}

/* CARD */
.card {
  background: #fff;
  width: 420px;
  padding: 40px 35px;
  border-radius: 20px;
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
}

/* TITULOS */
.title {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 5px;
}

.subtitle {
  font-size: 0.95rem;
  color: #777;
  margin-bottom: 32px;
}

/* INPUTS */
.form-group {
  text-align: left;
  margin-bottom: 20px;
}

label {
  font-size: 0.9rem;
  color: #555;
}

input {
  width: 100%;
  margin-top: 6px;
  padding: 12px;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: var(--light-gray);
  transition: 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--gold);
  background: #f0efe9;
}

/* BOTÓN LOGIN */
.btn-login {
  width: 100%;
  background: #D4AF37;
  color: #000;
  padding: 12px;
  margin-top: 8px;
  border-radius: 12px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
}

.btn-login:hover {
  background: var(--gold-dark);
  transform: translateY(-2px);
}
</style>
