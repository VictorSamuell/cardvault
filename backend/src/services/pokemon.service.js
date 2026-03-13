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

        // filtrar cartas com imagem e limitar resultados
        const cartasFiltradas = cartas
            .filter(carta => carta.image)
            .slice(0,50);

        // buscar preço de cada carta
        const cartasValidas = await Promise.all(
            cartasFiltradas.map(async (carta) => {

                const detalheResponse = await fetch(
                    `${API_URL}/${carta.id}`
                );

                const detalhe = await detalheResponse.json();

                return {
                    id: carta.id,
                    localId: carta.localId,
                    name: carta.name,
                    image: `${carta.image}/high.png`,
                    price:
                        detalhe.pricing?.cardmarket?.avg ??
                        detalhe.pricing?.tcgplayer?.normal?.marketPrice ??
                        0
                };

            })
        );

        console.log(`Sucesso! ${cartasValidas.length} cartas encontradas.`);

        return cartasValidas;

    } catch (error) {

        console.error("Erro no Service:", error);
        throw error;

    }
}



export async function buscarCartaPorId(id) {

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
        image: `${carta.image}/high.png`,
        price:
            carta.pricing?.cardmarket?.avg ??
            carta.pricing?.tcgplayer?.normal?.marketPrice ??
            0
    };

}