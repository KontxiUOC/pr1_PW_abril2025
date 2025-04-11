console.log("app.js cargado correctamente");

// Variables para gestionar las películas y las listas
let currentPage = 1;
const itemsPerPage = 6;
let allFilms = []; // Almacena todas las películas de la API
let filteredFilms = []; // Almacena las películas después de aplicar filtros
let watchedFilms = []; // Almacena las películas vistas
let favoriteFilms = []; // Almacena las películas favoritas
let allGenres = []; // Almacena los géneros disponibles

// Clase Film que representa una película
class Film {
  constructor(id, title, overview, popularity, poster_path, release_date, vote_average, vote_count, genre_ids) {
    this._id = id;
    this._title = title;
    this._overview = overview;
    this._popularity = popularity;
    this._poster_path = poster_path;
    this._release_date = release_date;
    this._vote_average = vote_average;
    this._vote_count = vote_count;
    this._genre_ids = genre_ids;
  }

  // Getters
  get id() { return this._id; }
  get title() { return this._title; }
  get overview() { return this._overview; }
  get popularity() { return this._popularity; }
  get poster_path() { return this._poster_path; }
  get release_date() { return this._release_date; }
  get vote_average() { return this._vote_average; }
  get vote_count() { return this._vote_count; }
  get genre_ids() { return this._genre_ids; }

  // Setters
  set title(newTitle) { this._title = newTitle; }
  set overview(newOverview) { this._overview = newOverview; }
  set popularity(newPopularity) { this._popularity = newPopularity; }
  set poster_path(newPosterPath) { this._poster_path = newPosterPath; }
  set release_date(newReleaseDate) { this._release_date = newReleaseDate; }
  set vote_average(newVoteAverage) { this._vote_average = newVoteAverage; }
  set vote_count(newVoteCount) { this._vote_count = newVoteCount; }
  set genre_ids(newGenreIds) { this._genre_ids = newGenreIds; }
}

// Clase FilmList para manejar un conjunto de películas
class FilmList {
  constructor() {
    this.films = [];
  }

  // Agregar una película
  addFilm = (film) => {
    this.films.push(film);
  };

  // Eliminar una película por ID
  removeFilm = (filmId) => {
    this.films = this.films.filter(film => film.id !== filmId);
  };

  // Mostrar todas las películas en la lista
  showList = () => {
    return this.films.map(film => {
      return `${film.title} (Estreno: ${film.release_date})`;
    }).join("\n");
  };

  // Ordenar por título
  sortByTitle = () => {
    this.films.sort((a, b) => a.title.localeCompare(b.title));
  };
}

// Renderiza UNA tarjeta de película
const renderFilmCard = (film, listType) => {
  return `
    <div class="film-card">
      <img src="https://image.tmdb.org/t/p/w300${film.poster_path}" alt="${film.title}">
      <h2>${film.title}</h2>
      <p><strong>Fecha de estreno:</strong> ${film.release_date}</p>
      <p><strong>Popularidad:</strong> ${film.popularity}</p>
      <p><strong>Votos:</strong> ${film.vote_average} (${film.vote_count})</p>
      <p><strong>Resumen:</strong> ${film.overview}</p>
      <button onclick="addToList('${film.id}', '${listType}')">Añadir a la lista</button>
      <button onclick="removeFromList('${film.id}', '${listType}')">Eliminar de la lista</button>
    </div>
  `;
}

// Función para renderizar las películas de una lista
const renderFilmList = (films, listType) => {
  const container = document.getElementById(`${listType}-list`);
  if (container) {
    container.innerHTML = films.map(film => renderFilmCard(film, listType)).join("");
  }
};

// Renderiza solo 6 películas por "sub-página"
const renderAllFilms = (films, page = 1) => {
  const container = document.getElementById("all-list");

  if (!container) {
    console.error("Contenedor no encontrado");
    return; // Salimos de la función si no encontramos el contenedor
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filmsToDisplay = films.slice(startIndex, endIndex);

  container.innerHTML = filmsToDisplay.map(film => renderFilmCard(film, 'all')).join("");  // Verifica si los datos se renderizan correctamente

  updatePagination(films.length);
}

// Añadir película a la lista
const addToList = (filmId, listType) => {
  console.log(`Intentando añadir película con ID: ${filmId} a la lista: ${listType}`);
  const film = allFilms.find(film => film.id == filmId);
  if (film) {
    console.log(`Película encontrada: ${film.title}`);

    if (listType === 'watched') {
      // Añadir película a la lista de vistas si no está ya en la lista
      if (!watchedFilms.some(watched => watched.id === film.id)) {
        watchedFilms.push(film);

        console.log(`${film.title} añadido a la lista de Vistas.`);
        alert(`${film.title} añadido a la lista de Vistas.`);
      }
    } else if (listType === 'favorite') {
      // Añadir película a la lista de favoritas si no está ya en la lista
      if (!favoriteFilms.some(favorite => favorite.id === film.id)) {
        favoriteFilms.push(film);
        alert(`${film.title} añadido a la lista de Favoritas.`);
      }
    }
  }
  renderFilmList(watchedFilms, 'watched');
  renderFilmList(favoriteFilms, 'favorite');
}

// Eliminar película de la lista
const removeFromList = (filmId, listType) => {
  if (listType === 'watched') {
    watchedFilms = watchedFilms.filter(film => film.id !== filmId); // Elimina de la lista de vistas
  } else if (listType === 'favorite') {
    favoriteFilms = favoriteFilms.filter(film => film.id !== filmId); // Elimina de la lista de favoritas
  }

  renderFilmList(watchedFilms, 'watched');
  renderFilmList(favoriteFilms, 'favorite');
}

// Actualiza el indicador y el estado de los botones
const updatePagination = (totalItems) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  document.getElementById("pageIndicator").textContent = `Página ${currentPage} de ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

// Carga las películas desde la API (solo 1 página real)
const fetchFilmsFromAPI = (page = 1) => {
  const apiKey = "9e67fcce7052687c786fd8ab4b921faa";
  const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es-ES&sort_by=popularity.desc&page=${page}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);  // Añadir esto para comprobar los datos recibidos
      const filmList = new FilmList();
      data.results.forEach(filmData => {
        const film = new Film(
          filmData.id,
          filmData.title,
          filmData.overview,
          filmData.popularity,
          filmData.poster_path,
          filmData.release_date,
          filmData.vote_average,
          filmData.vote_count,
          filmData.genre_ids
        );
        filmList.addFilm(film);
      });

      filmList.sortByTitle();
      allFilms = filmList.films;
      filteredFilms = allFilms; // Inicialmente no hay filtro
      renderAllFilms(filteredFilms, currentPage);  // Verifica si las películas se renderizan correctamente
    })
    .catch(error => console.error("Error al cargar las películas desde la API:", error));
}

// Obtiene los géneros desde la API de TMDb
const fetchGenres = () => {
  const apiKey = "9e67fcce7052687c786fd8ab4b921faa";
  const apiUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=es-ES`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      allGenres = data.genres;
      populateGenreDropdown();
    })
    .catch(error => console.error("Error al cargar los géneros desde la API:", error));
}

// Rellena el dropdown de géneros
const populateGenreDropdown = () => {
  const genreDropdown = document.getElementById("genreDropdown");
  allGenres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    genreDropdown.appendChild(option);
  });
}

// Filtra las películas por género
const filterByGenre = (genreId) => {
  if (genreId === "all") {
    filteredFilms = allFilms;
  } else {
    filteredFilms = allFilms.filter(film => film.genre_ids.includes(parseInt(genreId)));
  }
  currentPage = 1; // Resetear a la primera página cuando se filtra
  renderAllFilms(filteredFilms, currentPage);
}

// Botones de navegación
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderAllFilms(filteredFilms, currentPage);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderAllFilms(filteredFilms, currentPage);
  }
});

// Evento de cambio en el dropdown de géneros
document.getElementById("genreDropdown").addEventListener("change", (event) => {
  filterByGenre(event.target.value);
});

// Cargar las películas cuando se carga la página
fetchFilmsFromAPI(currentPage);
