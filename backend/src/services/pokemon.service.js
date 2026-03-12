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

        const cartasValidas = cartas.filter(carta => carta.image);

        console.log(`Sucesso! ${cartasValidas.length} cartas encontradas.`);

        return cartasValidas;

    } catch (error) {
        console.error("Erro no Service:", error);
        throw error;
    }
}