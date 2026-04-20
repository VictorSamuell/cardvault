import PokemonCard from "../components/PokemonCard"
import useCollection from "../hooks/useCollection"

export default function CollectionPage(){

const { collection , removeCard } = useCollection()
const total = collection.reduce(
    (sum, carta) => sum + (carta.price || 0),
    0
)
const cartasOrdenadas = [...collection].sort(
  (a, b) => (b.price || 0) - (a.price || 0)
)
const top1 = cartasOrdenadas.slice(0,1)

return(

    <div>
        <h1> Minha Coleção </h1>

        <h2>
            Valor total: ${total.toFixed(2)}
        </h2>

        

        <div className="grid">
        
                <div className="grid">
    {cartasOrdenadas.map((carta) => (
        <PokemonCard
            key={carta.id}
            id={carta.id}
            name={carta.name}
            image={carta.image}
            price={carta.price}
            prices={carta.prices}
            set={carta.set}
            number={carta.number}
            rarity={carta.rarity}
            tcgplayerUrl={carta.tcgplayerUrl}
            updatedAt={carta.updatedAt}
            onRemove={() => removeCard(carta.id)}
            inCollection={true} 
        />
    ))}
</div>
        
        </div>

        


    </div>


)

}
