"use strict";

//INSERT YOUR GITHUB ACCESS TOKEN HERE
const token = "";

const searchInput = document.querySelector('.searchInput');
const searchForm = document.querySelector('.searchForm');
const resultsDisplay = document.querySelector('.resultsDisplay');
const favoritesDisplay = document.querySelector('.favoritesDisplay');
let searchResults = [];
let favorites = [];

function addToFavorites(link) {
  favorites.push(searchResults[link.id]);
  //remove link
  saveFavorites();
  listFavorites();
  checkAlreadyFaved();
}

function removeFromFavorites(link) {
  favorites.splice(link.id, 1);
  saveFavorites();
  listFavorites();
  checkAlreadyFaved();
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

//don't need to have argument
function listFavorites() {
  let innerHTML = "";

  favorites.forEach((favorite, index) => {
    innerHTML +=
     `<tr>
        <td><a href="${favorite.url}" class="repoLink" target="_blank" rel="noopener noreferrer">${favorite.name}/${favorite.owner}</a></td>
        <td class="primeLang">${favorite.primeLang}</td>
        <td class="lastTag">${favorite.lastTag}</td>
        <td><a href="#" class= "remove" id="${index}">Remove</a></td>
      </tr>`
  })

  favoritesDisplay.innerHTML = innerHTML;

  document.querySelectorAll('.remove').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      removeFromFavorites(link);
    })
  })
}

function checkAlreadyFaved() {
  const favoritesUrls = favorites.map((favorite) => {return favorite.url});
  searchResults.forEach((repo, index) => {
    document.querySelector(`.resultsDisplay [id = "${index}"]`).style.display = (favoritesUrls.indexOf(repo.url) > -1 ? "none" : "inline");
  })
}

function listResults(repos) {
  let innerHTML = "";

  repos.forEach((repo, index) => {
    innerHTML +=
     `<tr>
        <td><a href="${repo.url}" class="repoLink" target="_blank" rel="noopener noreferrer">${repo.name}/${repo.owner}</a></td>
        <td class="primeLang">${repo.primeLang}</td>
        <td class="lastTag">${repo.lastTag}</td>
        <td><a href="#" class= "add" id="${index}">Add</a></td>
      </tr>`
  })

  resultsDisplay.innerHTML = innerHTML;

  //add link only if not already in favorites list
  checkAlreadyFaved();

  document.querySelectorAll('.add').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      addToFavorites(link);
    })
  })
}

searchInput.addEventListener("keyup", (e) => {
  if(!searchInput.value.length) {
    resultsDisplay.innerHTML = "";
  }
})

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //TODO: use Axios
  $.ajax({
    url: 'https://api.github.com/graphql',
    headers: {
      "Authorization": `bearer ${token}`,
    },
    method:'POST',
    data: JSON.stringify({
     query :
      `query {
        search(query: ${searchInput.value}, type: REPOSITORY, first: 10) {
          edges {
            node {
              ... on Repository{
                name
                owner {
                  login
                }
                releases(last: 1) {
                  nodes {
                    tag {
                      name
                    }
                  }
                }
                url
                primaryLanguage {
                  name
                }
              }
            }
          }
        }
      }`
    }),
    dataType:'JSON'
  }).then((results) => {
    searchResults = [];

    results.data.search.edges.forEach((result) => {
      searchResults.push(
        {name: result.node.name,
         owner: result.node.owner.login,
         primeLang: (result.node.primaryLanguage ? result.node.primaryLanguage.name : "-"),
         lastTag: (result.node.releases.nodes[0] ? result.node.releases.nodes[0].tag.name : "-"),
         url: result.node.url
        }
      )
    })

    listResults(searchResults);

  })
})

document.body.onload = () => {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  listFavorites();
}
