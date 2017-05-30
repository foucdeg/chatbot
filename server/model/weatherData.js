const
  config = require('config'),
  parser = require('json-parser');

// Get the config const
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverUrl');

function WeatherData(openWeatherMapRawData) {
  openWeatherMapData = parser.parse(openWeatherMapRawData)
  this.city = openWeatherMapData.city;
  this.forecast = readForecastdata(openWeatherMapData);

  function readForecastdata(openWeatherMapData) {
    var result = [];
    openWeatherMapData.list.forEach(function (element) {
      result.push(
        {
          date: new Date(element.dt * 1000),
          display_date: getReadableDate(element.dt),
          temp: {
            day: convertKelvinToCelsius(element.temp.day),
            min: convertKelvinToCelsius(element.temp.min),
            max: convertKelvinToCelsius(element.temp.max)
          },
          weather : {
            id : element.weather[0].id,
            main: element.weather[0].main,
            description: element.weather[0].description,
            image: getweatherImage(element.weather[0].id)
          }
        }
      );
    })

    return result;
  }

  function getweatherImage(weatherId) {
    var image = '';
    switch  (Math.trunc(weatherId/100)) {
      case(2):
        image = 'thunderstorm.jpg';
        break;
      case(3):
        image = 'drizzle.jpg';
        break;
      case(5):
        image = 'rain.jpg';
        break;
      case(6):
        image = 'snow.jpg';
        break;
      case(8):
        if (weatherId === 800) {
          image = 'clear.jpg';
        } else {
          image = 'cloud.jpg';
        }
        break;
    }

    return SERVER_URL + '/images/weather/' + image;
  }

  function getReadableDate(timestamp) {
    var d = new Date(timestamp * 1000);

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var monthName = monthNames[d.getMonth()];
    var dayName = days[d.getDay()];

    return dayName + ' ' + d.getDate() + ' ' + monthName + ' ' + d.getFullYear();
  }
  function convertKelvinToCelsius(temp) {
    return Math.round(temp - 273.15);
  }
};

// Export the model
module.exports = WeatherData;