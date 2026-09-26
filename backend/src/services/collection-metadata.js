export const conditions = ['Não informado', 'Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged']
export function validateMetadata(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Dados inválidos.')
  const result = {}
  for (const key of Object.keys(body)) {
    const value = body[key]
    if (key === 'quantity') {
      if (!Number.isInteger(value) || value < 1 || value > 9999) throw new Error('Quantidade deve ser um inteiro entre 1 e 9999.')
    } else if (key === 'purchasePrice') {
      if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000000)) throw new Error('Valor pago inválido.')
    } else if (key === 'condition') {
      if (!conditions.includes(value)) throw new Error('Condição inválida.')
    } else if (key === 'language') {
      if (!['Não informado', 'Português', 'Inglês', 'Japonês', 'Outro'].includes(value)) throw new Error('Idioma inválido.')
    } else if (key === 'status') {
      if (!['owned', 'wishlist'].includes(value)) throw new Error('Lista inválida.')
    } else if (key === 'notes') {
      if (typeof value !== 'string' || value.length > 500) throw new Error('Anotações devem ter até 500 caracteres.')
    } else throw new Error('Campo não permitido.')
    result[key] = value
  }
  if (!Object.keys(result).length) throw new Error('Informe ao menos um campo.')
  return result
}
