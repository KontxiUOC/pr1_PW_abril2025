// 1. Creación de la clase Film
// Representa una película
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
  set title(value) { this._title = value; }
  set overview(value) { this._overview = value; }
  set popularity(value) { this._popularity = value; }
  set poster_path(value) { this._poster_path = value; }
  set release_date(value) { this._release_date = value; }
  set vote_average(value) { this._vote_average = value; }
  set vote_count(value) { this._vote_count = value; }
  set genre_ids(value) { this._genre_ids = value; }
}

// 2. Creación de la clase clase FilmList
// Gestiona una lista de películas
class FilmList {
  constructor() {
    this.films = [];
  }

  // 3.  Función flecha
  // Métodos con funciones flecha
  addFilm = (film) => {
    this.films.push(film);
  };

  removeFilm = (filmId) => {
    this.films = this.films.filter(film => film.id !== filmId);
  };

  showList = () => {
    return this.films.map(film => `${film.title} (${film.release_date})`).join("\n");
  };

  // 3.  Función flecha 
  // Función flecha: agregar múltiples películas
  addMultipleFilms = (...films) => {
    films.forEach(film => this.addFilm(film));
  };

  // Función flecha: filtrar por fechas
  getFilmsByDateRange = (startDate, endDate) => {
    return this.films.filter(film => {
      const date = new Date(film.release_date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  };

  // Función flecha: ordenar por popularidad
  sortFilmsByPopularity = () => {
    this.films.sort((a, b) => b.popularity - a.popularity);
  };

  // Función para renderizar cada tarjeta
  renderFilmCard = (film) => `
    <div class="film-card">
      <img src="https://image.tmdb.org/t/p/w500${film.poster_path}" alt="${film.title}">
      <h3>${film.title}</h3>
      <p><strong>Fecha de estreno:</strong> ${film.release_date}</p>
      <p><strong>Popularidad:</strong> ${film.popularity}</p>
      <p><strong>Promedio de votos:</strong> ${film.vote_average}</p>
      <p>${film.overview}</p>
    </div>
  `;

  renderAllFilms = () => {
    const container = document.getElementById("app");
    container.innerHTML = this.films.map(this.renderFilmCard).join("");
  };
}

// 4. Función recursiva
// Para buscar una película por ID
const findFilmById = (films, id) => {
  if (films.length === 0) return null;
  if (films[0].id === id) return films[0];
  return findFilmById(films.slice(1), id);
};

// 5. Uso de reduce
// Encontrar género más común
const getMostCommonGenre = (films) => {
  const genreCount = films.reduce((acc, film) => {
    film.genre_ids.forEach(id => {
      acc[id] = (acc[id] || 0) + 1;
    });
    return acc;
  }, {});

  return Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b);
};

// 6. Uso de map y filter
// Títulos con votos mínimos
const getPopularFilmTitles = (films, minVotes) => {
  return films
    .filter(film => film.vote_average >= minVotes)
    .map(film => film.title);
};

// Función para obtener películas de la API
const fetchFilmsFromAPI = () => {
  const apiKey = "9e67fcce7052687c786fd8ab4b921faa";
  const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es-ES&sort_by=popularity.desc`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
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

      filmList.renderAllFilms();
      displayResults(filmList);
    })
    .catch(error => console.error("Error al cargar películas:", error));
};

// Mostrar resultados en consola
const displayResults = (filmList) => {
  const filmId = filmList.films[0]?.id;
  const filmEncontrado = findFilmById(filmList.films, filmId);
  console.log("Película encontrada por ID:", filmEncontrado?.title);

  const genreMasComun = getMostCommonGenre(filmList.films);
  console.log("Género más común (ID):", genreMasComun);

  const populares = getPopularFilmTitles(filmList.films, 7);
  console.log("Películas con voto >= 7:", populares);
};

// Iniciar todo al cargar la página
document.addEventListener("DOMContentLoaded", fetchFilmsFromAPI);
