import fs from 'fs';

// URL da API para buscar TODOS os Pokémon
const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=2000';

function getIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

async function generateMaps() {
    console.log('Buscando lista principal de Pokémon da PokeAPI...');
    try {
        // 1. Buscar a lista completa
        const listResponse = await fetch(API_URL);
        if (!listResponse.ok) {
            throw new Error(`Falha na API (Lista): ${listResponse.status}`);
        }
        const listData = await listResponse.json();
        const results = listData.results;
        const total = results.length;

        console.log(`Sucesso! ${total} Pokémon encontrados.`);
        console.log('Iniciando busca detalhada (nomes e base_xp). Isso pode levar alguns minutos...');

        const pokemonNameMap = {};
        const pokemonBaseXpMap = {};

        // 2. Loop para buscar detalhes de CADA pokémon
        let count = 0;
        for (const entry of results) {
            count++;
            const id = getIdFromUrl(entry.url);
            const name = entry.name;

            // Log de progresso
            if (count % 100 === 0) {
                console.log(`...Processando ${count} / ${total}`);
            }

            try {
                // Busca o detalhe (ex: .../pokemon/1/)
                const detailResponse = await fetch(entry.url);
                if (!detailResponse.ok) {
                    console.warn(`Falha ao buscar ID ${id} (${name}). Pulando.`);
                    continue; // Pula este se falhar
                }
                const detailData = await detailResponse.json();

                // 3. Salva os dados nos mapas
                pokemonNameMap[id] = name;
                pokemonBaseXpMap[id] = detailData.base_experience;

            } catch (e) {
                console.warn(`Erro de rede ao buscar ${name}: ${e.message}. Pulando.`);
            }
        }

        console.log('Busca de detalhes concluída. Salvando arquivos...');

        // --- 4. Salvar Arquivo de Nomes ---
        const nameFileContent = `// Gerado automaticamente. Não edite.\nexport const pokemonNameMap: Record<number, string> = ${JSON.stringify(pokemonNameMap, null, 2)};\n`;
        const namePath = './src/data/pokemonNameMap.ts';
        fs.writeFileSync(namePath, nameFileContent);
        console.log(`Arquivo de Nomes salvo em: ${namePath}`);

        // --- 5. Salvar Arquivo de Base XP ---
        const xpFileContent = `// Gerado automaticamente. Não edite.\nexport const pokemonBaseXpMap: Record<number, number> = ${JSON.stringify(pokemonBaseXpMap, null, 2)};\n`;
        const xpPath = './src/data/pokemonBaseXpMap.ts';
        fs.writeFileSync(xpPath, xpFileContent);
        console.log(`Arquivo de Base XP salvo em: ${xpPath}`);

        console.log('Tudo pronto!');

    } catch (error) {
        console.error('Erro fatal ao gerar os mapas:', error);
    }
}

// Executa a função
generateMaps();