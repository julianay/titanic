import { useState, useEffect } from 'react'

/**
 * Custom hook for fetching global feature importance
 * Fetches once on mount since global importance doesn't change
 *
 * @returns {Object} - { data, loading, error }
 * @returns {Array|null} data - Array of {feature, importance} objects sorted by importance
 * @returns {boolean} loading - True when request is in progress
 * @returns {Error|null} error - Error object if request failed
 *
 * @example
 * const {data, loading, error} = useGlobalImportance();
 */
function useGlobalImportance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGlobalImportance = async () => {
      try {
        // Use VITE_API_URL if set, otherwise use current origin (for production)
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin

        const response = await fetch(`${apiUrl}/api/explain/global-importance`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchGlobalImportance()
  }, []) // Empty dependency array - only fetch once on mount

  return { data, loading, error }
}

export default useGlobalImportance
