let movies = []; // Stores dynamic movie data from API

const movieGrid = document.getElementById('movieGrid'); // DOM selectors
const sortMenu = document.getElementById('sortMenu');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchKeywordText = document.getElementById('searchKeyword');

async function loadMovieCatalog() { // Fetches movies and detailed data from OMDb API
  const myApiKey = "b4d6e9f6"; 
  const searchKeyword = searchInput.value.trim();
  
  if (!searchKeyword) return;

  if (searchKeywordText) {
    searchKeywordText.textContent = searchKeyword;
  }

  const url = "https://omdbapi.com/?apikey=b4d6e9f6&s=" + encodeURIComponent(searchKeyword) + "&type=movie";

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("OMDb Response Data:", data);

    if (data.Response === "True" && data.Search) {
        const detailedPromises = data.Search.map(async (item) => {
        const detailsUrl = "https://www.omdbapi.com/?apikey=" + myApiKey + "&i=" + item.imdbID;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        return {
          title: item.Title,
          year: parseInt(item.Year) || 0,
          duration: detailsData.Runtime !== "N/A" ? detailsData.Runtime : "Length N/A",
          genre: detailsData.Genre !== "N/A" ? detailsData.Genre : "Genre N/A",
          rating: detailsData.imdbRating !== "N/A" ? "★ " + detailsData.imdbRating : "★ No Rating",
          image: item.Poster !== "N/A" ? item.Poster : "https://placeholder.com"
        };
      });

      movies = await Promise.all(detailedPromises);

      sortAndRender();
    } else {
      movieGrid.innerHTML = `<p style="color: #666; grid-column: 1/-1; text-align: center; padding: 40px;">No movies found for "${searchKeyword}". Try another term!</p>`;
    }
  } catch (error) {
    console.error("Network error executing fetch request:", error);
    movieGrid.innerHTML = `<p style="color: red; grid-column: 1/-1; text-align: center; padding: 40px;">Error communicating with data servers.</p>`;
  }
}

function renderMovies(movieList) { // Generates and inserts movie card HTML into the grid
  movieGrid.innerHTML = ''; 
  
  movieList.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <div class="image-container">
        <img src="${movie.image}" alt="${movie.title}">
      </div>
      <div class="movie-info">
        <h2 class="movie-title">${movie.title}</h2>
        <div class="spec-line">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Released: ${movie.year}</span>
        </div>
        <div class="spec-line">
          <i class="fa-solid fa-clock"></i>
          <span>Length: ${movie.duration}</span>
        </div>
        <div class="spec-line">
          <i class="fa-solid fa-tags"></i>
          <span>Genre: ${movie.genre}</span>
        </div>
        <div class="movie-price" style="color: #e5a93b;">${movie.rating}</div>
      </div>
    `;
    movieGrid.appendChild(card);
  });
}

function sortAndRender() { // Sorts movie array based on dropdown value and updates UI
  const criteria = sortMenu.value;
  let sortedMovies = [...movies];

  if (criteria === 'az') {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
  } else if (criteria === 'za') {
    sortedMovies.sort((a, b) => b.title.localeCompare(a.title));
  } else if (criteria === 'newest') {
    sortedMovies.sort((a, b) => b.year - a.year);
  } else if (criteria === 'oldest') {
    sortedMovies.sort((a, b) => a.year - b.year);
  }

  const topSixMovies = sortedMovies.slice(0, 6);

  renderMovies(topSixMovies);
}

sortMenu.addEventListener('change', sortAndRender); // Event listeners for sorting and searching

if (searchBtn) {
  searchBtn.addEventListener('click', loadMovieCatalog);
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadMovieCatalog();
    }
  });
}
