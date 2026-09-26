// Numbers printed on cards are not globally unique IDs.
export function montarQuery(input) {
  if (typeof input !== 'string' || !input.trim() || input.length > 120) throw new Error('Busca inválida')
  const text = input.trim()
  const numbered = /^(?:(.*?)\s+)?([a-z]*\d+[a-z]*)\s*\/\s*(\d+)$/i.exec(text)
  const escape = value => value.replace(/([+\-!(){}\[\]^"~*?:\\/|&])/g, '\\$1')
  if (/^\d+$/.test(text)) return `!number:"${text}"`
  if (numbered) {
    const [, name, number, total] = numbered
    return `${name ? `name:"${escape(name)}*" ` : ''}!number:"${number}" set.printedTotal:${Number(total)}`
  }
  return `name:"${escape(text)}*"`
}

