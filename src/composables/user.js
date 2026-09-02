import { ref } from 'vue';
import { fetchComToken } from '@/utils/api.js';

export function usePerfil() {
  const nomeCompleto = ref('');
  const nomeUsuario = ref('');
  const emailUsuario = ref('');
  const telefoneUsuario = ref('');
  const cargoUsuario = ref('');
  const diasNoSistema = ref(0);

  const erroPerfil = ref('');
  const sucessoPerfil = ref('');
  const salvandoPerfil = ref(false);

  // Variável para guardar a "fotografia" original e poder cancelar
  const dadosOriginais = ref({});

  // 2. FUNÇÃO: BUSCAR USUÁRIO
  const buscarUsuario = async () => {
    try {
      // Usa o nosso entregador (api.js). Só precisamos passar a rota e o método!
      const response = await fetchComToken('/funcionarios/me/', { method: 'GET' });

      if (!response.ok) throw new Error('Falha ao buscar dados do usuário');

      const funcionario = await response.json();

      // Preenche as variáveis com os dados do banco
      nomeCompleto.value = funcionario.nome_completo;
      nomeUsuario.value = funcionario.username;
      cargoUsuario.value = funcionario.cargo_display || funcionario.cargo;
      emailUsuario.value = funcionario.email;
      telefoneUsuario.value = funcionario.telefone;

      // Calcula os dias no sistema (que implementamos antes)
      if (funcionario.data_entrada) {
        const diffTempo = Math.abs(new Date() - new Date(funcionario.data_entrada));
        diasNoSistema.value = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
      }

      // Tira a fotografia original para o botão Cancelar
      dadosOriginais.value = {
        nomeCompleto: funcionario.nome_completo,
        nomeUsuario: funcionario.username,
        emailUsuario: funcionario.email,
        telefoneUsuario: funcionario.telefone
      };

    } catch (error) {
      console.error(error);
      erroPerfil.value = 'Erro ao carregar dados do usuário.';
    }
  };

  // 3. FUNÇÃO: CANCELAR EDIÇÃO
  const cancelarEdicao = () => {
    nomeCompleto.value = dadosOriginais.value.nomeCompleto || '';
    nomeUsuario.value = dadosOriginais.value.nomeUsuario || '';
    emailUsuario.value = dadosOriginais.value.emailUsuario || '';
    telefoneUsuario.value = dadosOriginais.value.telefoneUsuario || '';
    erroPerfil.value = '';
    sucessoPerfil.value = '';
  };

  // 4. FUNÇÃO: ALTERAR SENHA (que já fizemos antes)
  const alterarSenha = async (senhaAtual, novaSenha, confirmarSenha) => {
    // ... (mesmo código que te passei na resposta anterior) ...
  };

  // 5. DEVOLVE TUDO PARA O VUE USAR
  return {
    nomeCompleto,
    nomeUsuario,
    emailUsuario,
    telefoneUsuario,
    cargoUsuario,
    diasNoSistema,
    erroPerfil,
    sucessoPerfil,
    salvandoPerfil,
    buscarUsuario,
    cancelarEdicao,
    alterarSenha
  };
}
