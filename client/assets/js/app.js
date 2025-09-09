// Global var
let limit = 10;       
let offset = 0;       
let currentPage = 1; 

// DOM
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const currentPageEl = document.getElementById('current-page');

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const detailContainer = document.getElementById('detail-content');

// Petición para listado de pokemons
async function fetchPokemonList() {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const pokemons = data.results;

        // Petición para obtener las img
        const pokemonDetails= await Promise.all(
            pokemons.map(pokemon => fetchPokemonImgs(pokemon.url))
        );

        // Pintar listado
        displayPokemonList(pokemonDetails);

        // Manejar paginación
        prevButton.disabled = offset === 0;
        nextButton.disabled = !data.next; 
        currentPageEl.textContent = currentPage;

    } catch (error) {
        console.error("Hubo un problema al obtener la lista de Pokémon:", error);
        const listContainer = document.getElementById('pokemon-list');
        listContainer.innerHTML = `<p class="error">No se pudo cargar la lista de Pokémon.</p>`;
    }
}

// Petición para img de cada pokemon
async function fetchPokemonImgs(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error cargando la imagen del Pokémon en ${url}`);
        return await res.json();
    } catch (error) {
        console.error("Hubo un problema al obtener las imágenes del Pokémon:", error);
        const itemContainer = document.querySelector('pokemon-item');
        itemContainer.innerHTML = `<p class="error">No se pudo cargar la imagen del Pokémon.</p>`;
    }
}

// Pintar el listado
function displayPokemonList(pokemonList) {
    const listContainer = document.getElementById('pokemon-list');
    listContainer.innerHTML = ""; 

    if (!pokemonList || pokemonList.length === 0) {
        listContainer.innerHTML = `<p class="error">No hay ningún Pokémon para mostrar.</p>`;
        return;
    }

    pokemonList.forEach(pokemon => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-item");

        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
            <h3>${pokemon.name}</h3>
        `;

        // Poner evento en cada card para que se muestre el detalle
        pokemonCard.addEventListener("click", () => {
            displayPokemonDetail(pokemon);
        });

        listContainer.appendChild(pokemonCard);
    });
}

// Función para buscar pokemon
async function fetchPokemonDetail(nameOrId) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
        if (!res.ok) throw new Error(`Error cargando el Pokémon ${nameOrId}: ${res.status}`);
        const details = await res.json();
        return details;
    } catch (error) {
        console.error("Error en fetchPokemonDetail:", error);
        return null; 
    }
}

// Pintar detalle de pokemon
function displayPokemonDetail(pokemon) {
    detailContainer.innerHTML = ""; 

    if (!pokemon) {
        detailContainer.innerHTML = `
            <p class="error">
                No se encontró ningún Pokémon con ese nombre o ID. 
                Revisa si lo escribiste correctamente e inténtalo de nuevo.
            </p>`;
        return;
    }

    // Sacar tipos y habilidades (máx. 3 habilidades)
    const types = pokemon.types.map(t => t.type.name).join(', ');
    const abilities = pokemon.abilities.slice(0, 3).map(a => a.ability.name).join(', ');

    detailContainer.innerHTML = `
        <div class="pokemon-item-detail">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
            <h3>${pokemon.name}</h3>
            <p><strong>Tipos:</strong> ${types}</p>
            <p><strong>Habilidades:</strong> ${abilities}</p>
        </div>
    `;
}

// INIT
function init() {
    fetchPokemonList();
    events()
}

// Events
function events() {
    // Escuchar el evento submit del formulario
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
    
        const inputText = searchInput.value.toLowerCase().trim(); 
    
        if (!inputText) {
            detailContainer.innerHTML = `<p class="error">Introduce un nombre o ID de Pokémon.</p>`;
            return;
        }
    
        // Petición para obtener los datos del pokemon según el texto que haya buscado el usuario
        const pokemon = await fetchPokemonDetail(inputText);
        
        // Pintar detalle de pokemon
        displayPokemonDetail(pokemon);
    
        // Limpiar texto del input de búsqueda
        searchInput.value = "";
    });
    
    // Eventos paginación
    prevButton.addEventListener('click', () => {
        if (offset > 0) {
            offset -= limit;
            currentPage--;
            fetchPokemonList();
        }
    });
    
    nextButton.addEventListener('click', () => {
        offset += limit;
        currentPage++;
        fetchPokemonList();
    });
}

window.addEventListener("DOMContentLoaded", init);