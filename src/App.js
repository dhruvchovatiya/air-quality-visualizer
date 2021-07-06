import logo from './logo.svg';
import './App.css';
import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import data1 from './trees.geojson'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX



function App() {

  const [pollutionData, setPollutionData] = useState()

  useEffect(() => {
    const fetchPollutionData = async () => {
      try {

        let res = await axios.get('https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?format=json&offset=0&limit=10000&api-key='+process.env.REACT_APP_GOV)
        res = res.data.records
        let st = new Set()
        let arr = []
        for (let rec of res) {
          if (rec.pollutant_avg === 'NA') continue

          st.add(rec.city)
          let coord = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURI(rec.station.split('-')[0] +', '+rec.state +', India') + '.json?access_token='+REACT_APP_MAPBOX)
          // console.log(coord)
          if(!coord || !coord.data|| !coord.data.features) continue
          coord = coord.data.features[0].center
   
          arr.push({type:"Feature", geometry: {type:"Point", coordinates:coord}, properties:{'avgPoll':parseInt(rec.pollutant_avg)}})
          // console.log(coord)
        }
        setPollutionData({type:"FeatureCollection", features: arr})
        // console.log(pollutionData)
      } catch (err) {
        console.log(err)
      }

    }


    
    fetchPollutionData()
  
    // if (map.current) return; // initialize map only once
    // map.current = new mapboxgl.Map({
    //   container: mapContainer.current,
    //   style: 'mapbox://styles/mapbox/streets-v11',
    //   center: [lng, lat],
    //   zoom: zoom
    // });
    // map.current.on('move', () => {
    //   setLng(map.current.getCenter().lng.toFixed(4));
    //   setLat(map.current.getCenter().lat.toFixed(4));
    //   setZoom(map.current.getZoom().toFixed(2));
    // });
    
    
    
  }, [])
  
  useEffect(() => {
    console.log(pollutionData)


  
    if(pollutionData) {
      console.log('here')
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/dc2121dc/ckqr6uq8c402u19n2us8mv7m8',
        center: [lng, lat],
        zoom: zoom
      });
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      map.current.on('load', function () {
    
        map.current.addSource('trees', {
          type: 'geojson',
          data: pollutionData
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
              property: 'avgPoll',
              type: 'exponential',
              stops: [
                [1, 0],
                [150, 1]
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
              0.2, 'rgb(65,105,255)',
              0.4, 'rgb(0,255,0)',
              0.6, 'rgb(255,255,0)',
              0.8, 'rgb(255,0,0)'
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
    }
  }, [pollutionData])

  // useEffect(() => {
  //   if (!map.current) return; // wait for map to initialize
  // });

  // useEffect(() => {
  // })


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
