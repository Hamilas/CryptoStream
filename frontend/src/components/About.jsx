import { useState, useEffect } from 'react'

const card = {
  background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.4)',
  borderRadius: 12, padding: 20, marginBottom: 16,
}

const archBox = (color) => ({
  padding: '8px 12px', borderRadius: 8, background: 'rgba(15,23,42,0.9)',
  border: `1px solid ${color}55`, color,
})
const archArrow = { textAlign: 'center', color: '#475569', fontSize: 12 }

const STACK = [
  { name: 'Apache Kafka 7.4.0',     role: 'Distributed message broker',         color: '#231F20' },
  { name: 'Apache Spark 3.5.0',     role: 'Structured Streaming consumer',      color: '#E25A1C' },
  { name: 'Apache Airflow 2.6.0',   role: 'DAG orchestration & scheduling',     color: '#017CEE' },
  { name: 'Apache Cassandra',       role: 'Timeseries primary storage',         color: '#1287B1' },
  { name: 'PostgreSQL 14',          role: 'Airflow metadata + staging store',   color: '#4169E1' },
  { name: 'FastAPI 0.115',          role: 'REST API: prices, anomalies',       color: '#009688' },
  { name: 'React 18 + Vite 5',      role: 'Dashboard frontend',                color: '#61DAFB' },
  { name: 'Grafana',                role: 'Live price/volume dashboards',       color: '#F46800' },
  { name: 'Confluent Schema Reg.', role: 'Message schema enforcement',         color: '#CB0000' },
  { name: 'Docker Compose',         role: '10-service local orchestration',     color: '#2496ED' },
]

const ENDPOINTS = [
  { method: 'GET',  path: '/api/v1/health',    desc: 'Service health, uptime, postgres status' },
  { method: 'GET',  path: '/api/v1/prices',    desc: 'Latest price per symbol (live from CoinGecko or PostgreSQL)' },
  { method: 'POST', path: '/api/v1/ingest',    desc: 'Fetch live prices from CoinGecko → write to PostgreSQL' },
  { method: 'GET',  path: '/api/v1/anomalies', desc: 'Z-score anomalies derived from live data' },
  { method: 'GET',  path: '/api/v1/pipeline',  desc: 'Pipeline service registry (URLs, ports)' },
]

const SERVICES = [
  { name: 'CryptoStream UI',       url: 'http://localhost:8123', note: 'This app' },
  { name: 'CryptoStream API',      url: 'http://localhost:8122/docs', note: 'Swagger / OpenAPI' },
  { name: 'Airflow UI',            url: 'http://localhost:8085',  note: 'admin / admin' },
  { name: 'Kafka Control Center',  url: 'http://localhost:9021',  note: 'Kafka monitoring' },
  { name: 'Schema Registry',       url: 'http://localhost:8081',  note: 'Confluent' },
  { name: 'Spark UI',              url: 'http://localhost:9091',  note: 'Streaming jobs' },
  { name: 'Grafana',               url: 'http://localhost:3001',  note: 'admin / admin' },
]

export default function About() {
  const [health, setHealth] = useState(null)
  const [pipeline, setPipeline] = useState(null)

  useEffect(() => {
    fetch('/api/v1/health').then(r => r.json()).then(setHealth).catch(() => {})
    fetch('/api/v1/pipeline').then(r => r.json()).then(setPipeline).catch(() => {})
  }, [])

  return (
    <div>
      {/* health card */}
      {health && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: health.status === 'healthy' ? '#34d399' : '#f87171', display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: health.status === 'healthy' ? '#34d399' : '#f87171' }}>
              API {health.status}
            </span>
            <span style={{ fontSize: 12, color: '#475569' }}>· v{health.version}</span>
            <span style={{ fontSize: 12, color: '#475569' }}>· uptime {health.uptime_s}s</span>
            <span style={{ fontSize: 12, color: '#475569' }}>· postgres {health.postgres ? '✓' : '✗'}</span>
          </div>
        </div>
      )}

      {/* architecture */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Pipeline Architecture</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: '#94a3b8' }}>
          <div style={archBox('#94a3b8')}>CoinGecko REST API, free, no key, top 11 coins by market cap</div>
          <div style={archArrow}>↓ Airflow DAG, hourly schedule</div>
          <div style={archBox('#e2e8f0')}>Kafka Producer :9092 &middot; topic: cryptos_created</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ ...archBox('#e2e8f0'), flex: 1 }}>Schema Registry :8081, schema enforcement</div>
            <div style={{ ...archBox('#e2e8f0'), flex: 1 }}>Control Center :9021, consumer lag / topic health</div>
          </div>
          <div style={archArrow}>↓</div>
          <div style={archBox('#E25A1C')}>Spark Structured Streaming :9090 &middot; Z-score anomaly detector (price z&gt;3.5, volume z&gt;4.0, flash crash &gt;5%)</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ ...archBox('#1287B1'), flex: 1 }}>Cassandra :9042, timeseries primary storage (keyspace: crypto_streams)</div>
            <div style={{ ...archBox('#4169E1'), flex: 1 }}>PostgreSQL :5432, Airflow metadata + staging (table: cryptos)</div>
          </div>
          <div style={archArrow}>↓</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ ...archBox('#009688'), flex: 1 }}>FastAPI :8122</div>
            <span style={{ color: '#475569' }}>reads PostgreSQL →</span>
            <div style={{ ...archBox('#61DAFB'), flex: 1 }}>CryptoStream React :8123</div>
          </div>
          <div style={archArrow}>↓</div>
          <div style={archBox('#F46800')}>Grafana :3001, Cassandra datasource, live price/volume dashboards</div>
        </div>
      </div>

      {/* services */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>All Services</h2>
        {SERVICES.map(s => (
          <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(51,65,85,0.2)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{s.note}</span>
            <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#60a5fa', fontFamily: 'monospace' }}>{s.url}</a>
          </div>
        ))}
      </div>

      {/* API endpoints */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>API Endpoints</h2>
        {ENDPOINTS.map(e => (
          <div key={e.path} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(51,65,85,0.2)' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, flexShrink: 0,
              background: e.method === 'POST' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
              color: e.method === 'POST' ? '#a5b4fc' : '#34d399',
            }}>{e.method}</span>
            <code style={{ fontSize: 12, color: '#e2e8f0', flex: 1 }}>{e.path}</code>
            <span style={{ fontSize: 12, color: '#64748b', maxWidth: 300 }}>{e.desc}</span>
          </div>
        ))}
      </div>

      {/* tech stack */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Tech Stack</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STACK.map(t => (
            <div key={t.name} style={{
              background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.4)',
              borderRadius: 8, padding: '6px 12px',
              display: 'flex', flexDirection: 'column',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{t.name}</span>
              <span style={{ fontSize: 10, color: '#475569' }}>{t.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* author */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Author</h2>
        <p style={{ fontSize: 14, fontWeight: 600 }}>Rayen Lassoued</p>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Junior AI/ML Engineer · Final-year CS student, Bonn Germany</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <a href="https://github.com/Hamilas" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: 13 }}>github.com/Hamilas</a>
          <a href="https://www.linkedin.com/in/lassoued-rayen/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: 13 }}>https://www.linkedin.com/in/lassoued-rayen/</a>
        </div>
      </div>
    </div>
  )
}
