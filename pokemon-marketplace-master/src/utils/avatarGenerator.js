const easterEggMap = {
    'henry.blh': 260,
    'moraskiller': 257,
    'aguainsalubre': 319,
    'seupiorpesadelo': 94,
    'bertozzi': 151,
    'misty': 54,
    'brock': 95,
    'ash': 25,
};


export function generatePokemonIdFromSeed(seed) {

    const lowerSeed = String(seed).toLowerCase();
    const easterEggId = easterEggMap[lowerSeed];

    if (easterEggId) {
        return easterEggId;
    }

    let hash = 0;
    if (typeof seed === 'string') {
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
    } else if (typeof seed === 'number') {
        hash = seed;
    } else {
        hash = new Date().getTime();
    }

    hash = Math.abs(hash);
    const pokemonId = (hash % 1025) + 1;
    return pokemonId;
}