import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

import { Button } from './ui/button'

export default function AdminDashboard({ onLogout }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
  }, [])

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">Waitlist Admin Dashboard</h1>
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Registered Users ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : entries.length === 0 ? (
            <div>No users have joined the waitlist yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">#</th>
                    <th className="px-2 py-1 text-left">Email</th>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">Joined</th>
                    <th className="px-2 py-1 text-left">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={entry.email} className="border-b">
                      <td className="px-2 py-1">{i + 1}</td>
                      <td className="px-2 py-1">{entry.email}</td>
                      <td className="px-2 py-1">{entry.name || '-'}</td>
                      <td className="px-2 py-1">{entry.created_at ? new Date(entry.created_at).toLocaleString() : '-'}</td>
                      <td className="px-2 py-1">{entry.reward_months} mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
