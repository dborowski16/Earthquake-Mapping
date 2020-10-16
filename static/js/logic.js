// Store API query variables
var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";  

// function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5;
}

// function to return the color based on magnitude
function markerColor(magnitude) {
  if (magnitude > 4) {
    return 'red'
  } else if (magnitude > 3) {
    return 'orange'
  } else if (magnitude > 2) {
    return 'yellow'
  } else {
    return 'green'
  }
}

// function for opacity based on magnitude
function markerOpacity(magnitude) {
  if (magnitude > 6) {
    return .99
  } else if (magnitude > 5) {
    return .80
  } else if (magnitude > 4) {
    return .70
  } else if (magnitude > 3) {
    return .60
  } else if (magnitude > 2) {
    return .50
  } else if (magnitude > 1) {
    return .40
  } else {
    return .30
  }
}

// Grab the data with d3
d3.json(baseURL, function(response) {

    var earthquakes = L.geoJSON(response.features, {
        onEachFeature : addPopup,
        pointToLayer : addMarker
    });

createMap(earthquakes);
});

function addMarker(features, latlng) {
    var options = {
        stroke: false,
        fillOpacity: markerOpacity(features.properties.mag),
        color: markerColor(features.properties.mag),
        fillColor: markerColor(features.properties.mag),
        radius: markerSize(features.properties.mag)
    }
    return L.circleMarker(latlng, options);
}

function addPopup(features, layer) {
    return layer.bindPopup(`<h3> ${features.properties.place} </h3> <hr> <h4>Magnitude: ${features.properties.mag} </h4> <p> ${Date(features.properties.time)} </p>`);
}

function createMap(earthquakes) {
    var satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
      });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });

    var faultline = new L.LayerGroup();

    var faultlineURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

    d3.json(faultlineURL, function(data) {

      L.geoJSON(data, {
        style: function() {
          return {color: "orange", fillOpacity: 0}
        }
      }).addTo(faultline)
    })

    var baseMaps = {
        "Satelite Map": satelitemap,
        "Dark Map": darkmap
    }

    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Faultlines": faultline
    };

    var myMap = L.map("map", {
        center: [0, 0],
        zoom: 2, 
        layers: [satelitemap, earthquakes, faultline]
    });

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {

    var div = L.DomUtil.create("div", "info legend");

    div.innerHTML = "<h3>Magnitude Legend</h3><table><tr><th>>= 4</th><td>Red</td></tr><tr><th>>= 3</th><td>Orange</td></tr><tr><th>>= 2</th><td>Yellow</td></tr><tr><th>< 2</th><td>Green</td></tr></table>";
    
    return div;
    };

    legend.addTo(myMap);

    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

};
