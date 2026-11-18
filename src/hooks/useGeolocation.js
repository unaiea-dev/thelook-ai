'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const CACHE_KEY = 'thelook_geolocation_cache'
const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Start true — we're checking cache/permissions
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState('prompt') // 'prompt', 'granted', 'denied'
  const hasAutoRequested = useRef(false)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La geolocalització no està suportada en aquest navegador.')
      setPermissionState('denied')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
        setCoordinates(coords)
        setPermissionState('granted')
        setIsLoading(false)
        setError(null)

        // Save to cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            coords,
            timestamp: Date.now()
          }))
        } catch (e) {
          console.error('Error saving geolocation to cache', e)
        }
      },
      (geoError) => {
        let errorMsg = 'Error desconegut al detectar la ubicació.'
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMsg = 'Permís de ubicació denegat. Farem servir ubicació aproximada.'
            setPermissionState('denied')
            break
          case geoError.POSITION_UNAVAILABLE:
            errorMsg = 'La informació d\'ubicació no està disponible.'
            break
          case geoError.TIMEOUT:
            errorMsg = 'S\'ha esgotat el temps d\'espera per obtenir la ubicació.'
            break
        }
        setError(errorMsg)
        setIsLoading(false)
        setCoordinates(null)
      },
      {
        enableHighAccuracy: true, // Use GPS hardware for accurate position
        timeout: 15000, // Give GPS 15 seconds to lock on
        maximumAge: 300000 // Accept a 5-minute-old position to speed things up
      }
    )
  }, [])

  // Check initial permission state and cache on mount
  useEffect(() => {
    let cancelled = false

    // 1. Check if we have valid cached coordinates
    try {
      const cachedDataStr = localStorage.getItem(CACHE_KEY)
      if (cachedDataStr) {
        const cachedData = JSON.parse(cachedDataStr)
        const now = Date.now()
        if (now - cachedData.timestamp < CACHE_DURATION_MS) {
          setCoordinates(cachedData.coords)
          setPermissionState('granted')
          setIsLoading(false)
          return // Done — cache is valid
        } else {
          // Expired cache
          localStorage.removeItem(CACHE_KEY)
        }
      }
    } catch (e) {
      console.error('Error reading geolocation cache', e)
    }

    // 2. Check permission state and auto-request if already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (cancelled) return

        setPermissionState(result.state)

        // KEY FIX: If the user already granted permission, automatically get their position
        if (result.state === 'granted' && !hasAutoRequested.current) {
          hasAutoRequested.current = true
          requestLocation()
        } else if (result.state === 'denied') {
          setIsLoading(false)
          setError('Permís de ubicació denegat.')
        } else {
          // Permission is 'prompt' — don't auto-request, let user click the button
          setIsLoading(false)
        }

        result.onchange = () => {
          setPermissionState(result.state)
          if (result.state === 'granted' && !hasAutoRequested.current) {
            hasAutoRequested.current = true
            requestLocation()
          } else if (result.state === 'denied') {
            setCoordinates(null)
            setError('Permís de ubicació denegat.')
            localStorage.removeItem(CACHE_KEY)
          }
        }
      }).catch(() => {
        // Browser doesn't support permissions.query — stop loading
        if (!cancelled) setIsLoading(false)
      })
    } else {
      // No permissions API — stop loading, let user manually request
      setIsLoading(false)
    }

    return () => { cancelled = true }
  }, [requestLocation])

  return {
    coordinates,
    isLoading,
    error,
    permissionState,
    requestLocation
  }
}
