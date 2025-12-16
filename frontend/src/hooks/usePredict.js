import { useState, useEffect, useRef } from 'react'

// In-memory cache for prediction results
const predictionCache = new Map()
const MAX_CACHE_SIZE = 100

/**
 * Custom hook for calling the prediction API with debouncing, caching, and retry logic
 *
 * @param {Object} params - Passenger parameters
 * @param {number} params.sex - 0 for female, 1 for male
 * @param {number} params.pclass - Passenger class (1, 2, or 3)
 * @param {number} params.age - Passenger age (0-80)
 * @param {number} params.fare - Fare amount (0-100)
 * @returns {Object} - { data, loading, error }
 * @returns {Object|null} data - Prediction result with {prediction, probability, survival_rate}
 * @returns {boolean} loading - True when request is in progress
 * @returns {Error|null} error - Error object if request failed
 *
 * @example
 * const {data, loading, error} = usePredict({sex: 0, pclass: 1, age: 30, fare: 84});
 */
function usePredict(params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Debounce the API call by 500ms
    debounceTimerRef.current = setTimeout(() => {
      makeRequest(params)
    }, 500)

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [params.sex, params.pclass, params.age, params.fare])

  /**
   * Generate cache key from parameters
   */
  const getCacheKey = (params) => {
    return `${params.sex}-${params.pclass}-${params.age}-${params.fare}`
  }

  /**
   * Clear oldest cache entries if cache is full
   */
  const clearOldestCacheEntries = () => {
    if (predictionCache.size >= MAX_CACHE_SIZE) {
      // Remove first 20 entries
      const keysToDelete = Array.from(predictionCache.keys()).slice(0, 20)
      keysToDelete.forEach(key => predictionCache.delete(key))
    }
  }

  /**
   * Make API request with retry logic
   */
  const makeRequest = async (params, attemptNumber = 1) => {
    const MAX_RETRIES = 3
    const cacheKey = getCacheKey(params)

    // Check cache first
    if (predictionCache.has(cacheKey)) {
      setData(predictionCache.get(cacheKey))
      setLoading(false)
      setError(null)
      return
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      // Use VITE_API_URL if set, otherwise use current origin (for production)
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin

      const response = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Cache the result
      clearOldestCacheEntries()
      predictionCache.set(cacheKey, result)

      setData(result)
      setError(null)
    } catch (err) {
      // Don't set error if request was aborted (user changed params)
      if (err.name === 'AbortError') {
        return
      }

      // Retry logic
      if (attemptNumber < MAX_RETRIES) {
        console.log(`Retry attempt ${attemptNumber + 1}/${MAX_RETRIES}`)
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attemptNumber) * 1000
        setTimeout(() => {
          makeRequest(params, attemptNumber + 1)
        }, delay)
      } else {
        // Max retries reached
        setError(err)
        setData(null)
      }
    } finally {
      // Only set loading to false if this is the final attempt
      if (attemptNumber >= MAX_RETRIES || error === null) {
        setLoading(false)
      }
    }
  }

  return { data, loading, error }
}

/**
 * Clear the prediction cache (useful for testing or memory management)
 */
export const clearPredictionCache = () => {
  predictionCache.clear()
}

/**
 * Get current cache size (useful for debugging)
 */
export const getCacheSize = () => {
  return predictionCache.size
}

export default usePredict
