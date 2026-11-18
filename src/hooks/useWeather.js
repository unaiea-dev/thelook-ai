'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGeolocation } from './useGeolocation'

const WEATHER_CACHE_KEY = 'thelook_weather_cache'
const WEATHER_CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export function useWeather() {
  const { coordinates, isLoading: isGeoLoading, error: geoError, permissionState, requestLocation } = useGeolocation()
  const [weather, setWeather] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Start loading to check cache/fetch
  const [error, setError] = useState(null)
  const [source, setSource] = useState(null) // 'gps', 'ip', 'cache', 'default'

  const fetchWeather = useCallback(async (lat, lon, forceRefresh = false) => {
    setIsLoading(true)
    setError(null)
    
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedDataStr = localStorage.getItem(WEATHER_CACHE_KEY)
        if (cachedDataStr) {
          const cachedData = JSON.parse(cachedDataStr)
          const now = Date.now()
          // Only use cache if coordinates match (or if both are null/undefined) and hasn't expired
          const isSameCoords = (lat === cachedData.lat && lon === cachedData.lon) || (!lat && !lon && !cachedData.lat && !cachedData.lon)
          if (isSameCoords && (now - cachedData.timestamp < WEATHER_CACHE_DURATION_MS)) {
            setWeather(cachedData.weather)
            setSource('cache')
            setIsLoading(false)
            return
          }
        }
      } catch (e) {
        console.error('Error reading weather cache', e)
      }
    }

    try {
      let url = '/api/weather'
      if (lat && lon) {
        url += `?lat=${lat}&lon=${lon}`
      }

      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error('Error al carregar el temps.')
      }

      const data = await res.json()
      
      setWeather(data)
      setSource(data.source || (lat && lon ? 'gps' : 'ip'))
      
      // Save to cache
      try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
          weather: data,
          lat,
          lon,
          timestamp: Date.now()
        }))
      } catch (e) {
        console.error('Error saving weather to cache', e)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch logic
  useEffect(() => {
    // If we have coordinates from geolocation, fetch weather for them
    if (coordinates) {
      fetchWeather(coordinates.lat, coordinates.lon)
    } 
    // If geolocation finished loading but no coordinates
    else if (!isGeoLoading) {
      // Permission denied, error, or prompt → fetch via IP fallback
      if (permissionState === 'denied' || permissionState === 'prompt' || geoError) {
        fetchWeather(null, null)
      }
      // Permission granted but no coords → GPS failed silently, use IP fallback
      else if (permissionState === 'granted') {
        fetchWeather(null, null)
      }
    }
    // If geo is still loading (waiting for GPS), do nothing yet — the effect
    // will re-run when isGeoLoading changes to false or coordinates arrive
  }, [coordinates, isGeoLoading, geoError, permissionState, fetchWeather])

  const refreshWeather = useCallback(() => {
    if (coordinates) {
      fetchWeather(coordinates.lat, coordinates.lon, true)
    } else {
      fetchWeather(null, null, true)
    }
  }, [coordinates, fetchWeather])

  return {
    weather,
    isLoading: isLoading || isGeoLoading,
    error: error || geoError,
    cityName: weather?.cityName || '',
    source,
    permissionState,
    refreshWeather,
    requestLocation
  }
}
