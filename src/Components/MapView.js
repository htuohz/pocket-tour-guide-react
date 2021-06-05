import React,{ Component } from 'react'
import { urls } from '../Const'

const API_KEY = process.env.REACT_APP_MAP_API_KEY
const BASE_URL = urls.BASE_URL

class MapView extends Component {
  constructor(props){
    super(props)

    this.state = {
      center:{
        lat:-41.180557,
        lng:146.346390
      }
    }
  }

  componentDidMount(){
    window.initMap = this.initMap.bind(this);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`
    script.async = true;

    document.body.appendChild(script);
    const getCoords = (position) =>{
      this.setState({
        center: {
          lat:position.coords.latitude,
          lng:position.coords.longitude
        }
      })
    }
    navigator.geolocation.getCurrentPosition(getCoords)

  }

  initMap(){
    let map
    map = new window.google.maps.Map(
      document.getElementById('map'), {center: this.state.center, zoom: 15});
    //const service = new map.PlacesService(map);

    const request = {
      location: this.state.center,
      radius: '5000',
      query: 'attractions',
      fields:['name','geometry']
    };
    const service = new window.google.maps.places.PlacesService(map);

    const callback = (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }
    }}

    service.textSearch(request, callback);

    const createMarker =async (place) => {

        const url = `${BASE_URL}/api/description/getbyname/${place.name}`
        try{
          const res = await fetch(url, {mode: 'cors'})
          const text = await res.text()
          // if(err){
          //   console.log(err)
          // }
          //else{
            if(text){
              const marker = new window.google.maps.Marker({
                map: map,
                position: place.geometry.location
              });     
              marker.setMap(map)
              const infowindow = new window.google.maps.InfoWindow()
              infowindow.setContent(place.name+text)
              window.google.maps.event.addListener(marker, 'click', function() { 
                infowindow.open(map, this);
              });
            }

          //}

          
        }catch(e){
          console.log(e)
        }

    }
  }
    render() {
      return (
        // Important! Always set the container height explicitly
        <div style={{ height: '100vh', width: '100vw' }} id="map">
        </div>
      );
    }
  }
  
  export default MapView;