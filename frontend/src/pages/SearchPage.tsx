import { useState } from "react"
import { buscarCartas } from "../services/cards.service"
//jsx element component
import PokemonCard from "../components/PokemonCard"

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

      <div className="grid">

        {cartas.map((carta) => (
            <PokemonCard
                key={carta.id}
                name={carta.name}
                image={carta.image}
            />
        ))}

</div>

    </div>
  )
}