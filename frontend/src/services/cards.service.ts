const API_URL = "http://localhost:3000/api"

export async function buscarCartas(name: string) {

    const response = await fetch(`${API_URL}/cartas?name=${name}`)

    if(!response.ok){
        throw new Error("Erro ao buscar cartas")
    }

    return response.json()
}

