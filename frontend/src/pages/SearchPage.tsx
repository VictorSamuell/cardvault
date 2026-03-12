import { useState } from "react"
import { buscarCartas } from "../services/cards.service"

export default function SearchPage() {

  const [name, setName] = useState("")
  const [cartas, setCartas] = useState<any[]>([])

  async function handleSearch() {

    const resultado = await buscarCartas(name)

    setCartas(resultado)
  }

  return (
    <div>

      <h1>CardVault</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Buscar Pokémon"
      />

      <button onClick={handleSearch}>
        Buscar
      </button>

      <div>

        {cartas.map((carta) => (
          <div key={carta.id}>
            <h3>{carta.name}</h3>
            <img src={carta.image} width="200"/>
          </div>
        ))}

      </div>

    </div>
  )
}