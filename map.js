var iconFeature = new ol.Feature({
  geometry: new ol.geom.Point([1199307, 8379568]),
  name: 'Null Island',
  population: 4000,
  rainfall: 500
});

var iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'icon.png'
  }))
});

iconFeature.setStyle(iconStyle);

var vectorSource = new ol.source.Vector({
  features: [iconFeature]
});

var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});

var projection = ol.proj.get('EPSG:900913');

//http://www.statkart.no/Kart/Gratis-kartdata/Cache-tjenester/
var extent = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];

var matrixIds = new Array(21);
for (i = 0; i < 21; i = i + 1) {
    matrixIds[i] = "EPSG:900913:" + i;
}

//http://wms.geonorge.no/kr/koordsys_res.txt
var resolutions = [
		156543.033928041,
		78271.51696402048,
		39135.75848201023,
		19567.87924100512,
		9783.93962050256,
		4891.96981025128,
		2445.98490512564,
		1222.99245256282,
		611.49622628141,
		305.7481131407048,
		152.8740565703525,
		76.43702828517624,
		38.21851414258813,
		19.10925707129406,
		9.554628535647032,
		4.777314267823516,
		2.388657133911758,
		1.194328566955879,
		0.5971642834779395,
		0.29858214173896974,
		0.14929107086948487
];

var attribution = new ol.Attribution({
    'html': '<a href="http://kartverket.no">Kartverket</a>'
});

//http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?
//version=1.0.0&service=wmts&request=getcapabilities
var grunnkart = new ol.layer.Tile({
    extent: extent,
    source: new ol.source.WMTS({
        attributions: [attribution],
        url: 'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?',
        layer: 'norges_grunnkart',
        matrixSet: 'EPSG:900913',
        format: 'image/png',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(extent),
            resolutions: resolutions,
            matrixIds: matrixIds
        })
    })
});

var parkbilde = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: [attribution],
    url: 'http://mapwarper.net/maps/tile/9729/{z}/{x}/{y}.png'
  })
});

var map = new ol.Map({
  layers: [grunnkart, parkbilde, vectorLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [1199307, 8379568],
    zoom: 16
  })
});

var element = document.getElementById('popup');

var popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false
});
map.addOverlay(popup);

// display popup on click
map.on('click', function(evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });
  if (feature) {
    var geometry = feature.getGeometry();
    var coord = geometry.getCoordinates();
    popup.setPosition(coord);
    $(element).popover({
      'placement': 'top',
      'html': true,
      'content': feature.get('name')
    });
    $(element).popover('show');
  } else {
    $(element).popover('destroy');
  }
});

// change mouse cursor when over marker
map.on('pointermove', function(e) {
  if (e.dragging) {
    $(element).popover('destroy');
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});
