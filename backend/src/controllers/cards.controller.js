import { procurarCartas , buscarCartaPorId } from "../services/pokemon.service.js"

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

export async function getCartaPorId(req, res) {

    const { id } = req.params

    try {
        const carta = await buscarCartaPorId(id)
        res.json(carta);

    } catch(error){

        console.error("Erro Real msm dificil", error)

        res.status(500).json({
            error: "FALHA NA BUSCA QUERIDAO"
        })

    }

}