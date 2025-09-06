const axios = require("axios")
const createAppError = require("../../../utils/errors")

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2"

const parseEvolutionChain = (chain) => {
  const evolutions = []
  let current = chain
  while (current) {
    evolutions.push(current.species.name.charAt(0).toUpperCase() + current.species.name.slice(1))
    current = current.evolves_to[0]
  }
  return evolutions.join(" → ")
}

const getPokemonDetails = async ({ pokemonNameOrId }) => {
  try {
    console.log(`[TOOL_CALL] Buscando dados para o Pokémon: ${pokemonNameOrId}`)
    const name = pokemonNameOrId.toLowerCase().trim()
    const pokemonResponse = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${name}`)
    const speciesResponse = await axios.get(pokemonResponse.data.species.url)
    const { data: pokemonData } = pokemonResponse
    const { data: speciesData } = speciesResponse
    const evolutionChainResponse = await axios.get(speciesData.evolution_chain.url)
    const evolutionChain = parseEvolutionChain(evolutionChainResponse.data.chain)
    const description = speciesData.flavor_text_entries.find(entry => entry.language.name === "pt")?.flavor_text || speciesData.flavor_text_entries.find(entry => entry.language.name === "en")?.flavor_text || "Nenhuma descrição disponível."
    const result = {
      status: 200,
      data: {
        id: pokemonData.id,
        name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1),
        sprite: pokemonData.sprites.front_default,
        types: pokemonData.types.map(t => t.type.name),
        description: description.replace(/\s+/g, " "),
        stats: pokemonData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        abilities: pokemonData.abilities.map(a => ({ name: a.ability.name, is_hidden: a.is_hidden })),
        evolutionChain: evolutionChain
      }
    }
    return result
  } catch (error) {
    console.error(`[POKEDEX_SERVICE] Erro ao buscar o Pokémon "${pokemonNameOrId}":`, error.message)
    if (error.response?.status === 404) throw createAppError(`Não foi possível encontrar o Pokémon "${pokemonNameOrId}". Verifique o nome ou número.`, 404, "POKEMON_NOT_FOUND")
    throw createAppError("Não foi possível conectar ao serviço da Pokédex (PokéAPI).", 503, "POKEDEX_API_ERROR")
  }
}

const pokedexTool = {
  type: "function",
  function: {
    name: "pokedexTool",
    description: "Use essa tool para buscar informações detalhadas sobre um Pokémon específico usando seu nome ou número da Pokédex.",
    parameters: {
      type: "object",
      properties: {
        pokemonNameOrId: {
          type: "string",
          description: "O nome ou o número da Pokédex do Pokémon a ser pesquisado. Exemplo: 'Pikachu' ou '25'."
        }
      },
      required: ["pokemonNameOrId"]
    }
  }
}

module.exports = { getPokemonDetails, pokedexTool }
