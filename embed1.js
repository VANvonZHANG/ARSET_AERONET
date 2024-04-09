var active_status = 1;

window.onload = function() {
  window.scrollTo(0,0);

function highlightActiveButton(selectedButtonId) {
   var buttons = document.getElementsByClassName('filter-button');
   for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
   }
   var selectedButton = document.getElementById(selectedButtonId);
   selectedButton.classList.add('active');
  }

  document.getElementById('all-button').addEventListener('click', function () {
    active_status = 1;
    filterMarkers();
    highlightActiveButton('all-button');
  });
  document.getElementById('active-button').addEventListener('click', function () {
    active_status = 4;
    filterMarkers();
    highlightActiveButton('active-button');
  });
  document.getElementById('inactive-button').addEventListener('click', function () {
    active_status = 3;
    filterMarkers();
    highlightActiveButton('inactive-button');
 });
  document.getElementById('limited-button').addEventListener('click', function () {
    active_status = 2;
    filterMarkers();
    highlightActiveButton('limited-button');
 });

  document.getElementById('all-button').classList.add('active');

function updateTableWithVisibleMarkers() {
    const visibleBounds = map.getBounds();
    const tableBody = document.getElementById('marker-table-body');
    tableBody.innerHTML = '';

    let row;
    let markersInRow = 0;

    circleMarkers.forEach(marker => {
      if (map.hasLayer(marker) && visibleBounds.contains(marker.getLatLng()) && ((active_status === 1) || (active_status === marker.options.status))) {
        const popupContent = marker.getPopup().getContent();
        const tooltipContent = marker.getTooltip().getContent();

        if (markersInRow % 3 === 0) {
          row = tableBody.insertRow();
        }

        const markerCell = row.insertCell();
        markerCell.innerHTML = popupContent + tooltipContent;
        markersInRow++;

        if (markersInRow % 3 === 0) {
          markersInRow = 0;
        }
      }
    });
  }

let removedMarkers = [];

function removeMarkersOutsideBounds() {
  const visibleBounds = map.getBounds();

  circleMarkers.forEach(marker => {
    if (!visibleBounds.contains(marker.getLatLng())) 
    {
      if (!removedMarkers.includes(marker)) 
      {
        marker.removeFrom(map);
        removedMarkers.push(marker);
      }
    } 
    else 
    {
      if (removedMarkers.includes(marker) && ((active_status === 1) || (active_status === marker.options.status))) 
      {
        marker.addTo(map);
        removedMarkers = removedMarkers.filter(m => m !== marker);
      }
    }
  });
  updateTableWithVisibleMarkers();
}

  function filterMarkers() {
    circleMarkers.forEach(marker => {
      if (active_status === 1 || marker.options.status === active_status) {
        marker.addTo(map);
      } else {
        marker.removeFrom(map);
      }
    });

    updateTableWithVisibleMarkers();
  }

function zoomToMarkerBySitename(sitename) {
    circleLayers.eachLayer(function (marker) {
        if (marker.options.sitename === sitename) {
            map.setView(marker.getLatLng(), 15);
        }
    });
}

function showError(message) {
    var errorMessageContainer = document.getElementById('error-message');
    errorMessageContainer.textContent = message;
    errorMessageContainer.style.display = 'block';
    setTimeout(function () {
        errorMessageContainer.style.display = 'none';
    }, 3000);
}

var searchButton = document.getElementById('search-button');
var searchBox = document.getElementById('search-box');
var suggestionsList = document.getElementById('suggestions-list');

searchBox.addEventListener('input', function () {
    var sitename = searchBox.value;
    suggestionsList.innerHTML = '';

    if (sitename.length >= 3) {
        var foundSuggestions = [];

        circleLayers.eachLayer(function (marker) {
            if ((marker.options.sitename.toLowerCase().includes(sitename.toLowerCase())) &&
               (active_status === 1 || marker.options.status === active_status)) 
            {
                foundSuggestions.push(marker.options.sitename);
            }
        });
        if (foundSuggestions.length > 0) {
            foundSuggestions.slice(0, 10).forEach(function (suggestion) {
                var suggestionItem = document.createElement('li');
                suggestionItem.textContent = suggestion;
                suggestionItem.addEventListener('click', function () {
                    searchBox.value = suggestion;
                    suggestionsList.innerHTML = '';
                    zoomToMarkerBySitename(suggestion);
                });
                suggestionsList.appendChild(suggestionItem);
            });
        }
    }
});

searchButton.addEventListener('click', function () {
    var sitename = searchBox.value;
    var found = false;

    circleLayers.eachLayer(function (marker) {
        if ((marker.options.sitename === sitename) && (active_status === 1 || marker.options.status === active_status))
        {
            map.setView(marker.getLatLng(), 18);
            found = true;
        }
    });

    if (!found) {
        showError("Site not found.");
    }
});

function resetMap() {
  active_status = 1;

  document.getElementById('all-button').classList.add('active');
  highlightActiveButton('all-button');

  map.setView([0, 0], 1);

  circleMarkers.forEach(function (marker) {
    marker.addTo(map);
  });

  updateTableWithVisibleMarkers();
}

document.getElementById('reset-button').addEventListener('click', resetMap);

var map = L.map('map').setView([0,0],1);
const layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="https://carto.com/">carto.com</a> contributors'}).addTo(map);

map.on('mousemove', function (e) {
  document.getElementById('cursor-coordinates').innerText = `Latitude: ${e.latlng.lat.toFixed(6)}, Longitude: ${e.latlng.lng.toFixed(6)}`;
});
