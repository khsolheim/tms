import { useState, useEffect } from 'react'
import './App.css'

interface HealthStatus {
  status: string
  timestamp: string
  message: string
}

interface DatabaseStatus {
  status: string
  database: string
  stats: {
    users: number
    bedrifter: number
  }
}

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Check health endpoint
        const healthResponse = await fetch('http://localhost:4000/health')
        const healthData = await healthResponse.json()
        setHealthStatus(healthData)

        // Check database endpoint
        const dbResponse = await fetch('http://localhost:4000/api/test-db')
        const dbData = await dbResponse.json()
        setDbStatus(dbData)

        setLoading(false)
      } catch (err) {
        setError('Kunne ikke koble til backend-serveren')
        setLoading(false)
      }
    }

    checkBackend()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster TMS-systemet...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">TMS System</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">
            Sørg for at backend-serveren kjører på http://localhost:4000
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚀 TMS System
          </h1>
          <p className="text-gray-600">
            Transport Management System - Lokal Utvikling
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Health Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-green-500 mr-2">🟢</span>
              System Status
            </h2>
            {healthStatus && (
              <div className="space-y-2">
                <p><strong>Status:</strong> {healthStatus.status}</p>
                <p><strong>Melding:</strong> {healthStatus.message}</p>
                <p><strong>Tidspunkt:</strong> {new Date(healthStatus.timestamp).toLocaleString('nb-NO')}</p>
              </div>
            )}
          </div>

          {/* Database Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-blue-500 mr-2">🗄️</span>
              Database Status
            </h2>
            {dbStatus && (
              <div className="space-y-2">
                <p><strong>Status:</strong> {dbStatus.status}</p>
                <p><strong>Database:</strong> {dbStatus.database}</p>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Statistikk:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{dbStatus.stats.users}</div>
                      <div className="text-sm text-gray-600">Brukere</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{dbStatus.stats.bedrifter}</div>
                      <div className="text-sm text-gray-600">Bedrifter</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-purple-500 mr-2">⚡</span>
              Snarveier
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Brukere</div>
                <div className="text-sm opacity-90">Administrer brukere</div>
              </button>
              <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-semibold">Bedrifter</div>
                <div className="text-sm opacity-90">Administrer bedrifter</div>
              </button>
              <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Rapporter</div>
                <div className="text-sm opacity-90">Vis rapporter</div>
              </button>
            </div>
          </div>

          {/* System Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-gray-500 mr-2">ℹ️</span>
              System Informasjon
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Backend URL:</strong> http://localhost:4000</p>
                <p><strong>Frontend URL:</strong> http://localhost:5173</p>
                <p><strong>Database:</strong> PostgreSQL (localhost:5432)</p>
              </div>
              <div>
                <p><strong>Miljø:</strong> Utvikling</p>
                <p><strong>Versjon:</strong> 1.0.0</p>
                <p><strong>Status:</strong> Aktiv</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>TMS System - Lokal Utviklingsmiljø</p>
          <p>Backend: ✅ Kjører | Frontend: ✅ Kjører | Database: ✅ Tilkoblet</p>
        </footer>
      </div>
    </div>
  )
}

export default App
