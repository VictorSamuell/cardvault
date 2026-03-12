type Props = {
    name: string
    image: string
    onAdd?: () => void
}

export default function PokemonCard ({ name , image , onAdd }: Props){

    return(
        <div className="card">

            <img src={image} alt={name}/>

            <h3> {name} </h3>

            {onAdd && (
                <button className="addButton" onClick={() => {
                    console.log("clicou")
                    onAdd?.()
                    }}>
                    Adicionar Carta à coleção
                </button>
            )}


        </div>

    )

}