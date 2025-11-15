// utils/avatarGenerator.js

export function generatePokemonIdFromSeed(seed) {
  // Converte a seed (string ou number) para um número inteiro
  let hash = 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
  } else if (typeof seed === 'number') {
    hash = seed;
  } else {
    // Caso a seed seja de outro tipo, podemos usar um fallback
    hash = new Date().getTime(); // ou um valor default
  }

  // Garante que o hash é positivo
  hash = Math.abs(hash);

  // Mapeia o hash para o range de IDs de Pokémon (1 a 1025)
  // O +1 garante que nunca é 0 e o % 1025 garante que está no range
  const pokemonId = (hash % 1025) + 1;
  return pokemonId;
}