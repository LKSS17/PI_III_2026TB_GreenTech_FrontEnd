export const carregarUsuarioLogado = async () => {
  const token = localStorage.getItem('access_token');

  if (!token) return { is_gerente: false, is_admin: false };

  try {
    const res = await fetch('http://127.0.0.1:8000/api/funcionarios/me/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const dadosUsuario = await res.json();
      return {
        is_gerente: dadosUsuario.is_gerente,
        is_admin: dadosUsuario.is_admin
      };
    }
  } catch (err) {
    console.error("Erro ao verificar permissões:", err);
  }

  return { is_gerente: false, is_admin: false };
};
