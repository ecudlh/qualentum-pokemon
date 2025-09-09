async function fetchPokemonList() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0');

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const pokemons = data.results;
        
        const listContainer = document.getElementById('pokemon-list');
        listContainer.innerHTML = "";

        const pokemonDetails = await Promise.all(
            pokemons.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                if (!res.ok) throw new Error(`Error cargando ${pokemon.name}`);
                return await res.json();
            })
        ); 

        pokemonDetails.forEach(details => {
            const pokemonCard = `
                <div class="pokemon-item">
                    <img src="${details.sprites.front_default}" alt="${details.name}" />
                    <h3>${details.name}</h3>
                </div>
            `;
            listContainer.innerHTML += pokemonCard;
        });

    } catch (error) {
        console.error("Hubo un problema al obtener la lista de Pokémon:", error);
        const listContainer = document.getElementById('pokemon-list');
        listContainer.innerHTML = `<p class="error">No se pudo cargar la lista de Pokémon.</p>`;
    }
}

fetchPokemonList();