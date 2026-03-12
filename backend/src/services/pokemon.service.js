const API_URL = "https://api.tcgdex.net/v2/pt/cards";

export async function procurarCartas(name) {
    try {
        const response = await fetch(
            `${API_URL}?name=${encodeURIComponent(name)}`
        );

        if (!response.ok) {
            throw new Error(`Erro na API: Status ${response.status}`);
        }
        const cartas = await response.json();

        const cartasValidas = cartas
            .filter(carta => carta.image)
            // limitar 30 cartas
            .slice(0,30)
            //pegar o que vai aparecer
            .map(carta => ({
                id:carta.id,
                localId:carta.localId,
                name:carta.name,
            // high.png para aparecer a imagem pode ser low.png
                image: `${carta.image}/high.png`

            }));




        console.log(`Sucesso! ${cartasValidas.length} cartas encontradas.`);

        return cartasValidas;

    } catch (error) {
        console.error("Erro no Service:", error);
        throw error;
    }
}


export async function buscarCartaPorId(id) {

    //http://localhost:3000/api/cartas/?name=charizard       exemplo 

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`
        );
        if (!response.ok) {
        throw new Error(`Carta não encontrada: ${response.status}`);
        }
        
        
        const carta = await response.json();

        return {
            id: carta.id,
            localId: carta.localId,
            name: carta.name,
            image: `${carta.image}/high.png`
        };

}