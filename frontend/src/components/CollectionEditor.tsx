import { useState } from 'react'
import useCollection, { type Carta } from '../hooks/useCollection'

export default function CollectionEditor({ card, onClose }: { card: Carta; onClose: () => void }) {
  const { updateCard, saving } = useCollection()
  const [quantity, setQuantity] = useState(card.quantity ?? 1)
  const [condition, setCondition] = useState(card.condition ?? 'Não informado')
  const [language, setLanguage] = useState(card.language ?? 'Não informado')
  const [price, setPrice] = useState(card.purchasePrice == null ? '' : String(card.purchasePrice))
  const [status, setStatus] = useState(card.status ?? 'owned')
  const [notes, setNotes] = useState(card.notes ?? '')
  const [failed, setFailed] = useState(false)
  return <form className="vault-editor" onSubmit={async e => {
    e.preventDefault()
    const saved = await updateCard(card.id, { quantity, condition, language, purchasePrice: price === '' ? null : Number(price), status, notes })
    if (saved) onClose(); else setFailed(true)
  }}>
    <h2>Editar {card.name}</h2>
    <div className="vault-toolbar">
      <label>Lista<select value={status} onChange={e=>setStatus(e.target.value as 'owned'|'wishlist')}><option value="owned">Tenho na coleção</option><option value="wishlist">Lista de desejos</option></select></label>
      <label>Quantidade<input type="number" min="1" max="9999" step="1" required value={quantity} onChange={e=>setQuantity(Number(e.target.value))} /></label>
      <label>Condição<select value={condition} onChange={e=>setCondition(e.target.value)}>{['Não informado','Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played','Damaged'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Idioma<select value={language} onChange={e=>setLanguage(e.target.value)}>{['Não informado','Português','Inglês','Japonês','Outro'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Valor pago por unidade (R$)<input type="number" min="0" max="100000000" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Opcional" /></label>
      <label>Anotações<input maxLength={500} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Variante, origem ou observação" /></label>
    </div>
    {failed && <p role="alert">Não foi possível salvar. Confira o aviso acima e tente novamente.</p>}
    <button className="vault-primary" disabled={saving}>Salvar alterações</button>{' '}
    <button className="vault-secondary" type="button" disabled={saving} onClick={onClose}>Cancelar</button>
  </form>
}
