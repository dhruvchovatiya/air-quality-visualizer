# Air Quality Visualizer for India

### Hosted on heroku - [air-quality-india.herokuapp.com](https://air-quality-india.herokuapp.com/)

* Fetches data from [this](https://data.gov.in/resources/real-time-air-quality-index-various-locations) Gov. of India API.
* This API gives air quality data by monitoring pollutants like SO2, NO2, PM2.5, PM10 from 1800 locations in real-time.
* Used [**MapBox Geolocation API**](https://docs.mapbox.com/api/search/geocoding/) to convert addresses fetched from Govt. API into coordinates.
* Used [**Mapbox GL**](https://docs.mapbox.com/mapbox-gl-js/api/), to display the fetched data in the form of a **HeatMap**. Mapbox GL is a JavaScript library for interactive, customizable vector maps on the Web.


