import { useEffect, useState } from 'react'
import useCollection, { type Carta } from '../hooks/useCollection'

const API = import.meta.env.VITE_API_URL || 'https://cardvault-backend-plgs.onrender.com/api'
type SetInfo = { id: string; name: string; total: number }

export default function SetProgress() {
  const { collection, addCard, updateCard, saving } = useCollection()
  const [sets, setSets] = useState<SetInfo[]>([])
  const [selected, setSelected] = useState('')
  const [cards, setCards] = useState<Carta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [filter, setFilter] = useState('missing')
  useEffect(() => {
    const controller = new AbortController()
    const endpoint = selected ? `/sets/${encodeURIComponent(selected)}/cards` : '/sets'
    fetch(API + endpoint, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error()
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error()
        if (controller.signal.aborted) return
        if (selected) setCards(data)
        else setSets(data)
      })
      .catch(() => { if (!controller.signal.aborted) setError('Não conseguimos carregar este catálogo. Tente novamente.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [selected, retry])
  const owned = new Set(collection.filter(c => c.status !== 'wishlist').map(c => c.id))
  const wishes = new Set(collection.filter(c => c.status === 'wishlist').map(c => c.id))
  const unique = [...new Map(cards.map(c => [c.id, c])).values()]
  const count = unique.filter(c => owned.has(c.id)).length
  const visible = unique.filter(c => filter === 'all' || (filter === 'owned' ? owned.has(c.id) : !owned.has(c.id)))
  const info = sets.find(s => s.id === selected)
  return <section className="vault-set-progress">
    <h2>Complete seu próximo set</h2>
    <p>Cada carta diferente conta uma vez. Repetidas e desejos não aumentam o progresso.</p>
    <label>Escolha um set<select value={selected} onChange={e => { setSelected(e.target.value); setCards([]); setLoading(true); setError(''); setFilter('missing') }}>
      <option value="">Selecione…</option>
      {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select></label>
    {loading && <p role="status">Carregando catálogo…</p>}
    {error && <div role="alert"><p>{error}</p><button className="vault-secondary" onClick={() => { setLoading(true); setError(''); setRetry(n => n + 1) }}>Tentar novamente</button></div>}
    {!selected && !loading && !error && <p>Escolha uma expansão para ver o que você já tem e o que falta.</p>}
    {selected && !loading && !error && <>
      <h3>{info?.name}: {count} de {unique.length} cartas do catálogo</h3>
      <progress max={unique.length || 1} value={count} aria-label="Progresso do set" />
      <p>{unique.length ? Math.round(count / unique.length * 100) : 0}% completo · {unique.length - count} faltantes</p>
      {info && info.total !== unique.length && <p role="status">O catálogo retornou {unique.length} cartas de um total informado de {info.total}. O progresso considera apenas as cartas disponíveis.</p>}
      <div className="vault-list-tabs">{[['missing','Faltantes'],['owned','Já tenho'],['all','Todas']].map(([value,label]) => <button className="vault-secondary" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {visible.length === 0 && <p>{unique.length === 0 ? 'Nenhuma carta disponível neste catálogo.' : filter === 'missing' ? 'Set completo! Você tem todas as cartas deste catálogo.' : 'Nenhuma carta nesta seleção.'}</p>}
      <div className="vault-checklist">{visible.map(card => <article key={card.id}>
        {card.image && <img loading="lazy" src={card.image} alt={card.name} />}
        <div><strong>{card.name}</strong><p>#{card.number || '—'}</p>
          {owned.has(card.id) ? <span>✓ Na coleção</span> : <>
            <button className="vault-secondary" disabled={saving || wishes.has(card.id)} onClick={() => void addCard({ ...card, status: 'wishlist' })}>{wishes.has(card.id) ? '✓ Nos desejos' : 'Desejar'}</button>
            <button className="vault-primary" disabled={saving} onClick={() => wishes.has(card.id) ? void updateCard(card.id, { status: 'owned' }) : void addCard({ ...card, status: 'owned' })}>Já tenho</button>
          </>}
        </div>
      </article>)}</div>
    </>}
  </section>
}

