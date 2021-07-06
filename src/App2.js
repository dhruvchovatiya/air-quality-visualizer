import logo from './logo.svg';
import './App.css';
import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import data1 from './trees.geojson'

mapboxgl.accessToken = 'pk.eyJ1IjoiZGMyMTIxZGMiLCJhIjoiY2twbGo3dzhiMjV3bjJ3cmk4bDNjbGE1ZiJ9.W9BhzdtGsGuc6tHX1dGRJw'



function App() {

  const [pollutionData, setPollutionData] = useState()

  useEffect(() => {
    const fetchPollutionData = async () => {
      try {

        let res = await axios.get('https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?format=json&offset=0&limit=10000&api-key=579b464db66ec23bdd000001769eff0134d4499b7228bd6a03e778d6')
        res = res.data.records
        let st = new Set()
        let arr = []
        for (let rec of res) {
          if (st.has(rec.city) || rec.pollutant_avg === 'NA') continue

          st.add(rec.city)
          let coord = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURI(rec.city + ', India') + '.json?access_token=pk.eyJ1IjoiZGMyMTIxZGMiLCJhIjoiY2twbGo3dzhiMjV3bjJ3cmk4bDNjbGE1ZiJ9.W9BhzdtGsGuc6tHX1dGRJw')
          coord = coord.data.features[0].center
          const temp = coord[0]
          coord[0] = coord[1]
          coord[1] = temp
          // arr.push({ coordinates: coord, wt: rec.pollutant_avg })
          arr.push({type:"Feature", geometry: {type:"Point", coordinates:coord}, properties:{avgPoll:rec.pollutant_avg}})
          // console.log(coord)
        }
        setPollutionData(arr)
      } catch (err) {
        console.log(err)
      }

    }

    // fetchPollutionData()
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
  }, [])

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    map.current.on('load', function () {

      map.current.addSource('trees', {
        type: 'geojson',
        data: data1
      });
      // add heatmap layer here
      map.current.addLayer({
        id: 'trees-heat',
        type: 'heatmap',
        source: 'trees',
        maxzoom: 15,
        paint: {
          // increase weight as diameter breast height increases
          'heatmap-weight': {
            property: 'dbh',
            type: 'exponential',
            stops: [
              [1, 0],
              [62, 1]
            ]
          },
          // increase intensity as zoom level increases
          'heatmap-intensity': {
            stops: [
              [11, 1],
              [15, 3]
            ]
          },
          // assign color values be applied to points depending on their density
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(236,222,239,0)',
            0.2, 'rgb(208,209,230)',
            0.4, 'rgb(166,189,219)',
            0.6, 'rgb(103,169,207)',
            0.8, 'rgb(28,144,153)'
          ],
          // increase radius as zoom increases
          'heatmap-radius': {
            stops: [
              [11, 15],
              [15, 20]
            ]
          },
          // decrease opacity to transition into the circle layer
          'heatmap-opacity': {
            default: 1,
            stops: [
              [14, 1],
              [15, 0]
            ]
          },
        }
      }, 'waterway-label');
      // add circle layer here
      map.current.addLayer({
        id: 'trees-point',
        type: 'circle',
        source: 'trees',
        minzoom: 14,
        paint: {
          // increase the radius of the circle as the zoom level and dbh value increases
          'circle-radius': {
            property: 'dbh',
            type: 'exponential',
            stops: [
              [{ zoom: 15, value: 1 }, 5],
              [{ zoom: 15, value: 62 }, 10],
              [{ zoom: 22, value: 1 }, 20],
              [{ zoom: 22, value: 62 }, 50],
            ]
          },
          'circle-color': {
            property: 'dbh',
            type: 'exponential',
            stops: [
              [0, 'rgba(236,222,239,0)'],
              [10, 'rgb(236,222,239)'],
              [20, 'rgb(208,209,230)'],
              [30, 'rgb(166,189,219)'],
              [40, 'rgb(103,169,207)'],
              [50, 'rgb(28,144,153)'],
              [60, 'rgb(1,108,89)']
            ]
          },
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': {
            stops: [
              [14, 0],
              [15, 1]
            ]
          }
        }
      }, 'waterway-label');

    });
  })


  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);



  return (
    <div className="App">
      {/* {!pollutionData && <h1>Loading...</h1>}
      {pollutionData && pollutionData.map((rec) => (
        <h1>{JSON.stringify(rec)}</h1>
      ))}
      <h1>yes</h1> */}
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
