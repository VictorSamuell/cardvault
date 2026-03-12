type Props = {
    name: string
    image: string
}

export default function PokemonCard ({ name , image }: Props){

    return(
        <div className="card">

            <img src={image} alt={name}/>

            <h3> {name} </h3>

        </div>

    )

}