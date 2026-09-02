/**
 * src/assets/JS/verificarPermissao.js
 */
import { apiClient } from '@/services/api'

export async function verificarPermissao() {
  try {
    const data = await apiClient('/funcionarios/me/')
    return {
      isAdmin: !!(data.is_admin || data.is_staff || data.is_superuser),
      isGerente: !!(data.is_gerente || data.cargo === 'Gerente' || data.is_superuser),
      usuario: data
    }
  } catch (error) {
    console.warn('Verificação de permissão falhou via endpoint:', error.message)
    return {
      isAdmin: false,
      isGerente: false,
      usuario: null
    }
  }
}

export default verificarPermissao