<template>
  <div class="weather-widget">
    <div v-if="carregando" class="loading">Buscando clima...</div>

    <div v-else class="weather-content">
      <div class="weather-icon">
        <span class="material-symbols-outlined">{{ iconeClima }}</span>
      </div>
      <div class="weather-info">
        <h2>{{ temperatura }}°C</h2>
        <p>{{ condicaoAtual }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const temperatura = ref(null);
const codigoClima = ref(null);
const carregando = ref(true);

const interpretarClima = (codigo) => {
  if (codigo === 0) return { texto: 'Céu Limpo', icone: 'sunny' };
  if (codigo >= 1 && codigo <= 3) return { texto: 'Parcialmente Nublado', icone: 'partly_cloudy_day' };
  if (codigo >= 45 && codigo <= 48) return { texto: 'Neblina', icone: 'foggy' };
  if (codigo >= 51 && codigo <= 67) return { texto: 'Chuva Leve/Moderada', icone: 'rainy' };
  if (codigo >= 80 && codigo <= 99) return { texto: 'Tempestade', icone: 'thunderstorm' };
  return { texto: 'Indefinido', icone: 'cloud' };
};

const condicaoAtual = computed(() => interpretarClima(codigoClima.value).texto);
const iconeClima = computed(() => interpretarClima(codigoClima.value).icone);

const buscarClima = async (lat, lon) => {
  const CACHE_KEY = 'greenTech_clima_dados';
  const TIME_KEY = 'greenTech_clima_hora';
  const TEMPO_EXPIRACAO_MS = 60 * 60 * 1000; // 1 hora

  try {
    const dadosSalvos = localStorage.getItem(CACHE_KEY);
    const horaSalva = localStorage.getItem(TIME_KEY);
    const horaAtual = new Date().getTime();

    if (dadosSalvos && horaSalva && (horaAtual - parseInt(horaSalva) < TEMPO_EXPIRACAO_MS)) {
      const dados = JSON.parse(dadosSalvos);
      temperatura.value = Math.round(dados.current_weather.temperature);
      codigoClima.value = dados.current_weather.weathercode;
      carregando.value = false;
      return;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America/Sao_Paulo`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    temperatura.value = Math.round(dados.current_weather.temperature);
    codigoClima.value = dados.current_weather.weathercode;

    // Salva os novos dados e a hora atual no cache para as próximas navegações
    localStorage.setItem(CACHE_KEY, JSON.stringify(dados));
    localStorage.setItem(TIME_KEY, horaAtual.toString());

  } catch (erro) {
    console.error("Erro ao buscar o clima da Open-Meteo:", erro);
  } finally {
    carregando.value = false;
  }
};

onMounted(() => {
  // Verifica se o navegador suporta geolocalização
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const lat = posicao.coords.latitude;
        const lon = posicao.coords.longitude;
        buscarClima(lat, lon);
      },
      () => {
        console.warn("Permissão de localização negada. Usando localização padrão.");
        buscarClima(-22.433, -47.715);
      }
    );
  } else {
    buscarClima(-22.433, -47.715);
  }
});

</script>

<style scoped>
.weather-widget {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.weather-content {
  display: flex;
  align-items: center;
  gap: 15px;
}
.weather-icon span {
  font-size: 2.5rem;
  color: #0288d1;
}
.weather-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-dark);
}
.weather-info p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}
</style>
