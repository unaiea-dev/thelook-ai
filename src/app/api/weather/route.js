import { NextResponse } from 'next/server'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

function mapWeatherMainToCategory(main) {
  switch (main) {
    case 'Clear':
      return 'Assolellat'
    case 'Clouds':
      return 'Núvol'
    case 'Rain':
    case 'Drizzle':
      return 'Pluja'
    case 'Thunderstorm':
      return 'Tempesta'
    case 'Snow':
      return 'Neu'
    case 'Mist':
    case 'Fog':
    case 'Haze':
    case 'Dust':
    case 'Sand':
    case 'Ash':
    case 'Squall':
    case 'Tornado':
      return 'Boira'
    default:
      return 'Desconegut'
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    let lat = searchParams.get('lat')
    let lon = searchParams.get('lon')
    let source = 'gps'

    if (!OPENWEATHER_API_KEY) {
      console.warn('OPENWEATHER_API_KEY is not set')
      // Return a default mock if key is missing to not break the app entirely during dev
      return NextResponse.json({
        temp: 20,
        feels_like: 20,
        temp_min: 15,
        temp_max: 25,
        humidity: 50,
        description: 'assolellat (dades simulades)',
        icon: '01d',
        wind_speed: 10,
        clouds: 0,
        cityName: 'Barcelona',
        country: 'ES',
        weatherCategory: 'Assolellat',
        weatherMain: 'Clear',
        source: 'mock'
      })
    }

    // Fallback: If no coordinates provided, try to IP geolocate
    if (!lat || !lon) {
      source = 'ip'
      try {
        const forwarded = request.headers.get('x-forwarded-for')
        const clientIP = forwarded ? forwarded.split(',')[0].trim() : null
        const ipUrl = clientIP ? `https://ipwho.is/${clientIP}` : 'https://ipwho.is/'
        const ipRes = await fetch(ipUrl)
        if (ipRes.ok) {
          const ipData = await ipRes.json()
          if (ipData.success) {
            lat = ipData.latitude
            lon = ipData.longitude
          }
        }
      } catch (err) {
        console.error('Error during IP geolocation fallback:', err)
      }
    }

    // Default Fallback: Barcelona if everything fails
    if (!lat || !lon) {
      source = 'default'
      lat = '41.3851'
      lon = '2.1734'
    }

    // Fetch weather from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ca&appid=${OPENWEATHER_API_KEY}`
    
    const weatherRes = await fetch(weatherUrl, {
      next: { revalidate: 1800 } // Cache for 30 minutes (Next.js data cache)
    })

    if (!weatherRes.ok) {
      throw new Error(`OpenWeatherMap error: ${weatherRes.status} ${weatherRes.statusText}`)
    }

    const data = await weatherRes.json()

    // Normalize response
    const weatherData = {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min),
      temp_max: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      clouds: data.clouds.all,
      rain: data.rain ? data.rain['1h'] : null,
      cityName: data.name,
      country: data.sys.country,
      weatherCategory: mapWeatherMainToCategory(data.weather[0].main),
      weatherMain: data.weather[0].main,
      source
    }

    // Override weatherCategory for strong wind regardless of weather condition
    if (weatherData.wind_speed > 36) { // > 10 m/s is roughly > 36 km/h
      weatherData.weatherCategory = 'Vent'
    }

    return NextResponse.json(weatherData, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400'
      }
    })

  } catch (error) {
    console.error('Error in weather API:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
