type Props = {
    name: string
    image: string
    price?: number // Coloquei como opcional caso a API não retorne preço
    onAdd?: () => void
    onRemove?: () => void
}

export default function PokemonCard({ name, image, onAdd, onRemove, price }: Props) {
    return (
        <div className="card">
            {/* A imagem fica de fora para colar nas bordas */}
            <img src={image} alt={name} />

            {/* Envolvemos o resto na div card-content para dar o espaçamento interno */}
            <div className="card-content">
                <h3>{name}</h3>

                {price !== undefined && (
                    <p className="price">
                        ${price.toFixed(2)}
                    </p>
                )}

                {onAdd && (
                    <button className="addButton" onClick={() => {
                        console.log("clicou em adicionar")
                        onAdd?.()
                    }}>
                        Adicionar
                    </button>
                )}

                {onRemove && (
                    <button className="removeButton" onClick={() => {
                        console.log("clicou em remover")
                        onRemove?.()
                    }}>
                        Remover da Coleção
                    </button>
                )}
            </div>
        </div>
    )
}