import { useEffect, useState } from "react"
import Page from "../components/ui/Page"
import Card, { CardContent } from "../components/ui/Card"
import Button from "../components/ui/Button"
import { BASE_URL } from "../config"

export default function Health() {
  const [whoami, setWhoami] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [w, h] = await Promise.all([
        fetch(`${BASE_URL}whoami.php`, { credentials: 'include' }).then(res => res.json()).catch(() => null),
        fetch(`${BASE_URL}health.php`, { credentials: 'include' }).then(res => res.json()).catch(() => null),
      ])
      setWhoami(w)
      setHealth(h)
    } catch (e) {
      setError("Failed to fetch diagnostics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <Page title="System Health" description="Quick diagnostics for sessions and server">
      <Card>
        <CardContent>
          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm ring-1 ring-red-200">{error}</div>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900">Session</h3>
                <pre className="mt-2 bg-gray-50 rounded p-3 text-sm overflow-auto">{JSON.stringify(whoami, null, 2)}</pre>
              </section>
              <section>
                <h3 className="text-lg font-semibold text-gray-900">Server</h3>
                <pre className="mt-2 bg-gray-50 rounded p-3 text-sm overflow-auto">{JSON.stringify(health, null, 2)}</pre>
              </section>
              <div>
                <Button variant="secondary" onClick={fetchAll}>Refresh</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  )
}
