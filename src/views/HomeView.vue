<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');

const router = useRouter();

const fazerLogin = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);

      router.push('/dashboard');
      alert('Login bem-sucedido!');

    } else {
      alert('Usuário ou senha inválidos');
    }

  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
  }
};
</script>

<template>
  <div class="home-wrapper">

    <div class="login-container">
      <form class="login-form" @submit.prevent="fazerLogin">

        <h2>GreenTech</h2>
        <p>Conectando inovação e sustentabilidade</p>

        <div class="input-group">
          <label for="username">Nome de Usuário</label>
          <input type="text" v-model="username" placeholder="Digite seu usuário" required>
        </div>

        <div class="input-group">
          <label for="password">Senha</label>
          <input type="password" v-model="password" placeholder="Digite sua senha" required>
        </div>

        <button type="submit" class="btn-login">Entrar</button>

        <a href="/recuperar_senha/recuperar.html" class="forgot-password">Esqueceu a senha?</a>
      </form>
    </div>

  </div>
</template>

<style>
:root {
  --bg-body: #f4f1ea;
  --primary: #3a5a40;
  --primary-dark: #344e41;
  --accent: #bc6c25;
  --text-main: #283618;
  --white: #ffffff;
  --gray-light: #dad7cd;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>

<style scoped>
.home-wrapper {
  background-image: url('@/assets/img/Greentech_fundo.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 100vh;
  padding: 80px;
  width: 100%;
}

.login-container {
  background-color: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  border-top: 6px solid var(--accent);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease-in-out;
}

.login-container:hover {
  background-color: rgba(255, 255, 255, 0.97);
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.login-form h2 {
  color: var(--primary);
  text-align: center;
  margin-bottom: 8px;
  font-size: 1.8rem;
}

.login-form p {
  color: #444;
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-main);
  font-weight: 600;
}

.input-group input {
  width: 100%;
  padding: 14px;
  border: 2px solid var(--gray-light);
  border-radius: 10px;
  outline: none;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.input-group input:focus {
  border-color: var(--primary);
  background-color: var(--white);
}

.btn-login {
  width: 100%;
  padding: 14px;
  background-color: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login:hover {
  background-color: var(--primary-dark);
}

.forgot-password {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

/* --- RESPONSIVIDADE --- */
@media (max-width: 768px) {
  .home-wrapper {
    justify-content: center;
    padding: 20px;
  }

  .login-container {
    max-width: 100%;
    padding: 30px 20px;
  }
}

@media (max-width: 480px){
  .home-wrapper {
    align-items: flex-start;
    padding-top: 20px;
  }

  .login-container {
    width: 90%;
    padding: 20px;
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .login-form h2 {
    font-size: 1.5rem;
  }

  .btn-login {
    padding: 12px;
    font-size: 1rem;
  }
}
</style>
