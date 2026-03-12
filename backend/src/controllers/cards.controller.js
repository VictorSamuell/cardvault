import { procurarCartas } from "../services/pokemon.service.js"

export async function getCartas(req, res) {

    const { name } = req.query

    if(!name) {
        return res.status(400).json({
            error: "É necessário NAME QUERY"
        })
    }

    try {

        const cartas = await procurarCartas(name)
        res.json(cartas)


    }catch(error){

        console.error("ERRO REAL:", error)

        res.status(500).json({
            error: "Falha no Fetch: cartas"
        })
    }

}