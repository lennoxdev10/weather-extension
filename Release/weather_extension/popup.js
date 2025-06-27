const API_KEY = "f583f3da448c450c91a84004252205"; // später ersetzen
const weatherDisplay = document.getElementById("weatherDisplay");
const searchBtn = document.getElementById("searchBtn");
const locationInput = document.getElementById("locationInput");
const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
const favoritesList = document.getElementById("favoritesList");

window.addEventListener("DOMContentLoaded", () => {
  fetchWeather("auto:ip");
  loadFavorites();
});

searchBtn.addEventListener("click", () => {
  const location = locationInput.value;
  if (location) fetchWeather(location);
});

saveFavoriteBtn.addEventListener("click", () => {
  const location = locationInput.value;
  if (!location) return;
  chrome.storage.sync.get(["favorites"], (result) => {
    const favorites = result.favorites || [];
    if (!favorites.includes(location)) {
      favorites.push(location);
      chrome.storage.sync.set({ favorites });
      loadFavorites();
    }
  });
});

function loadFavorites() {
  chrome.storage.sync.get(["favorites"], (result) => {
    const favorites = result.favorites || [];
    favoritesList.innerHTML = "";
    favorites.forEach(location => {
      const li = document.createElement("li");
      
      const weatherBtn = document.createElement("button");
      weatherBtn.textContent = location;
      weatherBtn.onclick = () => fetchWeather(location);
      
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "🗑";
      removeBtn.style.marginLeft = "10px";
      removeBtn.style.background = "transparent";
      removeBtn.style.color = "red";
      removeBtn.style.cursor = "pointer";
      removeBtn.onclick = () => removeFavorite(location);

      li.appendChild(weatherBtn);
      li.appendChild(removeBtn);
      favoritesList.appendChild(li);
    });
  });
}

function removeFavorite(locationToRemove) {
  chrome.storage.sync.get(["favorites"], (result) => {
    let favorites = result.favorites || [];
    favorites = favorites.filter(loc => loc !== locationToRemove);
    chrome.storage.sync.set({ favorites });
    loadFavorites();
  });
}

function fetchWeather(location) {
  fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&lang=de`)
    .then(res => res.json())
    .then(data => {
      const { location, current } = data;
      weatherDisplay.innerHTML = `
        <h3>${location.name}, ${location.country}</h3>
        <p>${current.temp_c}°C, ${current.condition.text}</p>
        <img src="${current.condition.icon}" alt="Icon">
        <p>Letztes Update: ${current.last_updated}</p>
      `;
    })
    .catch(err => {
      weatherDisplay.innerHTML = "<p>Fehler beim Abrufen der Wetterdaten.</p>";
      console.error(err);
    });
}