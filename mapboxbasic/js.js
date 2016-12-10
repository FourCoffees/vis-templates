$(document).ready(function(){

			// // Initial responsivity check.
			// var responsivity = require("./responsivity");
			// responsivity.check();
			// responsivity.addHeadClasses();

			// Transform the short [lat,lng] format in our
			// data into the {x, y} expected by arc.js.
			function obj(ll) { return { y: ll[0], x: ll[1] }; }

			var years = ["1525 - 1550", "1550 - 1600","1600 - 1650","1650 - 1700","1700 - 1750","1750 - 1800","1800 - 1850","1850 - 1865"];
			var allYears = [];
			var circles = [];
			for(var i=0; i<8;i++){ 
			  allYears[i] = [];
			}

			var multiplierLines, multiplierRadius,cirlcePositions;
			L.mapbox.accessToken = 'KEY';
		
			// This is an advanced example that is compatible with
			// modern browsers and IE9+ - the trick it uses is animation
			// of SVG properties, which makes it relatively efficient for
			// the effect produced. That said, the same trick means that the
			// animation is non-geographical - lines interpolate in the same
			// amount of time regardless of trip length.

			// Show the whole world in this first view.
			map = L.mapbox.map('map',undefined,{zoomControl:false})
			    .setView([10.575316,-28.292716], 2);

			//Custom map background
			// var layer = L.mapbox.styleLayer('mapbox://styles/MY STLYE NAME').addTo(map);
			var layer = L.mapbox.tileLayer('https://api.mapbox.com/v3/mapbox.dark.json');


			// Disable drag and zoom handlers.
			map.dragging.disable();
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.scrollWheelZoom.disable();
			if (map.tap) map.tap.disable();

			map.fitBounds(L.latLngBounds(L.latLng([ 46.490829, -107.929688]), L.latLng([-39.444678, 51.328125])) )

			function main(){

				//Function to draw extra stuff and data on top of the map and after its loaded
			}
			
			main();

			// Redefine the widths and do necessary
			// responsivity adjusts every time the
			// window width changes.
			$(window).resize(function() {
				responsivity.check();
				responsivity.addHeadClasses();
			});

			// Fade out the loader animation.
			// Put this after everything has been loaded,
			// and the page is ready for the user to tamper with.
			layer.on('ready', function() {
				$(".loading_wrapper").fadeOut("fast", function(){
					$('#container').animate({'opacity':100},400);
				});
			})

		});
