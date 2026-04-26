const API_URL = "https://api.pokemontcg.io/v2";

function extrairPreco(card) {
    const prices = card?.tcgplayer?.prices;
    if (!prices) return 0;
    const ordem = ["holofoil", "normal", "reverseHolofoil", "1stEditionHolofoil"];
    for (const tipo of ordem) {
        const preco = prices[tipo]?.market ?? prices[tipo]?.mid ?? prices[tipo]?.low;
        if (preco && preco > 0) return preco;
    }
    return 0;
}

function extrairTodosPrecos(card) {
    const prices = card?.tcgplayer?.prices ?? {};
    const resultado = {};
    for (const [tipo, dados] of Object.entries(prices)) {
        resultado[tipo] = {
            low: dados.low ?? null,
            mid: dados.mid ?? null,
            high: dados.high ?? null,
            market: dados.market ?? null,
        };
    }
    return resultado;
}

function formatarCarta(card) {
    return {
        id: card.id,
        name: card.name,
        image: card.images?.large ?? card.images?.small ?? null,
        set: card.set?.name ?? null,
        number: card.number ?? null,
        rarity: card.rarity ?? null,
        price: extrairPreco(card),
        prices: extrairTodosPrecos(card),
        tcgplayerUrl: card.tcgplayer?.url ?? null,
        updatedAt: card.tcgplayer?.updatedAt ?? null,
    };
}

function montarQuery(name) {
    const temEspaco = name.includes(" ")
    if (temEspaco) {
        // Nome com espaço: aspas + wildcard no final
        // "M Mewtwo" → name:"M Mewtwo*"
        return `name:"${name}*"`
    } else {
        // Nome simples: wildcard livre
        // "pikachu" → name:pikachu*
        return `name:${name}*`
    }
}

export async function procurarCartas(name) {
    try {
        const query = montarQuery(name)

        const response = await fetch(
            `${API_URL}/cards?q=${encodeURIComponent(query)}&pageSize=70&orderBy=-tcgplayer.prices.holofoil.market`,
            {
                headers: {
                    // "X-Api-Key": process.env.POKEMONTCG_API_KEY ?? ""
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Erro na API: Status ${response.status}`);
        }

        const data = await response.json();
        const cards = data.data ?? [];

        const cartas = cards
            .filter(card => card.images?.large || card.images?.small)
            .map(formatarCarta);

        console.log(`Sucesso! ${cartas.length} cartas encontradas para "${name}".`);
        return cartas;

    } catch (error) {
        console.error("Erro no Service:", error);
        throw error;
    }
}

export async function buscarCartaPorId(id) {
    const response = await fetch(`${API_URL}/cards/${encodeURIComponent(id)}`);

    if (!response.ok) {
        throw new Error(`Carta não encontrada: ${response.status}`);
    }

    const data = await response.json();
    return formatarCarta(data.data);
}