import { useState } from "react"
import { buscarCartas } from "../services/cards.service"
//jsx element component
import PokemonCard from "../components/PokemonCard"
import useCollection from "../hooks/useCollection"

export default function SearchPage() {


  const [name, setName] = useState("")
  const [cartas, setCartas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { addCard } = useCollection()

  async function handleSearch() {

    if (!name.trim()) return

    try {

      setLoading(true)

      const resultado = await buscarCartas(name)

      setCartas(resultado)

    } catch (error) {

      console.error("Erro ao buscar cartas", error)

    } finally {

      setLoading(false)

    }
  }



  return (
    <div>

    <div className="SearchForm">

      <h1>CardVault</h1>


    
    <input
        className="SearchInput"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Digite o nome de um Pokémon"
      />
    



      <button className="SearchButton" onClick={handleSearch}>
        Buscar
      </button>
    
    </div>

    {loading && <p>Buscando cartas...</p>}

      <div className="grid">

        {cartas.map((carta) => (
            <PokemonCard
                key={carta.id}
                name={carta.name}
                image={carta.image}
                price={carta.price}
                onAdd={() => addCard(carta)}
            />
        ))}

</div>

    </div>
  )
}