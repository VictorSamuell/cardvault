const API_URL = "https://cardvault-backend-plgs.onrender.com/api"

export async function buscarCartas(name: string) {

    const response = await fetch(`${API_URL}/cartas?name=${encodeURIComponent(name)}`)

    if(!response.ok){
        throw new Error("Erro ao buscar cartas")
    }

    return response.json()
}

