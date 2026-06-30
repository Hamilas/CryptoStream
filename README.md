# CryptoStream

<p align="center">
  <img src="https://img.shields.io/badge/Kafka-7.4.0-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white"/>
  <img src="https://img.shields.io/badge/PySpark-3.5.0-E25A1C?style=for-the-badge&logo=apache-spark&logoColor=white"/>
  <img src="https://img.shields.io/badge/Airflow-2.6.0-017CEE?style=for-the-badge&logo=apache-airflow&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cassandra-1287B1?style=for-the-badge&logo=apache-cassandra&logoColor=white"/>
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

<p align="center">
  <strong>End-to-end real-time cryptocurrency streaming pipeline with live dashboards, anomaly detection, and full observability</strong><br/>
  CoinGecko → Airflow → Kafka → Spark Structured Streaming → Cassandra · sub-500ms latency
</p>

<p align="center">
  <img src="assets/banner.svg" alt="CryptoStream Banner" width="900"/>
</p>

---

## Live Demo

**Live:** [https://cryptostream-demo.vercel.app](https://cryptostream-demo.vercel.app)

## Overview

CryptoStream is a production-grade big data pipeline that ingests live cryptocurrency market data every hour, streams it through Apache Kafka, processes it in real-time with Spark Structured Streaming, detects price anomalies using Z-score analysis, and visualizes everything through a React dashboard and auto-provisioned Grafana dashboards, all running locally in Docker Compose.

Built for European fintech and trading firms that need sub-second latency on market data at scale.

---

## Architecture

<p align="center">
  <img src="assets/architecture.svg" alt="CryptoStream Architecture" width="700"/>
</p>

---

## Quick Start

```bash
git clone git@github.com:Hamilas/CryptoStream.git
cd CryptoStream
cp .env.example .env

# Start the core stack (dashboard + API + Airflow + Grafana)
docker compose up -d postgres cryptostream-api cryptostream-ui airflow-webserver scheduler grafana

# Seed live data immediately
curl -X POST http://localhost:8122/api/v1/ingest
```

Access everything:

| Service | URL | Credentials |
|---------|-----|-------------|
| **CryptoStream Dashboard** | http://localhost:8123 | — |
| **CryptoStream API (Swagger)** | http://localhost:8122/docs | — |
| **Airflow** | http://localhost:8085 | admin / admin |
| **Grafana** | http://localhost:3001 | admin / admin |
| **Kafka Control Center** | http://localhost:9021 | — |
| **Schema Registry** | http://localhost:8081 | — |
| **Spark UI** | http://localhost:9090 | — |

Start the full streaming stack (Kafka + Spark + Cassandra):

```bash
docker compose up -d zookeeper broker schema-registry control-center spark-master spark-worker cassandra_db
```

---

## Features

- **Live data ingestion**: CoinGecko free API, top 11 coins by market cap (BTC, ETH, BNB, SOL, XRP, DOGE…)
- **Hourly Airflow DAG**: `crypto_automation` runs `store_data_crypto → stream_data_crypto` every hour
- **Kafka streaming**: producer publishes to `cryptos_created` topic, Confluent Schema Registry enforces schema
- **Spark Structured Streaming**: reads Kafka topic, writes to Cassandra keyspace `crypto_streams`
- **Z-score anomaly detection**: sliding window of 100 ticks; flags price z>3.5, volume z>4.0, flash crash >5%
- **FastAPI REST**: `/api/v1/prices`, `/api/v1/anomalies`, `/api/v1/ingest`, `/api/v1/health`, `/api/v1/pipeline`
- **3-tier price fallback**: PostgreSQL staging table, then live CoinGecko, then a stale cache, so `/api/v1/prices` always returns data
- **React 18 dashboard**: live price ticker, anomaly feed, architecture map, auto-refresh every 15s, **Ingest Now** button
- **Auto-ingest**: React dashboard auto-ingests fresh CoinGecko prices every 60s in the background
- **Grafana dashboards**: auto-provisioned PostgreSQL datasource + pre-built crypto prices dashboard (30s refresh)
- **12-service Docker Compose**: full stack with health checks, restart policies, and isolated `confluent` network

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Service status, uptime, postgres connectivity |
| `GET` | `/api/v1/prices` | Latest price per coin (PostgreSQL → CoinGecko fallback) |
| `POST` | `/api/v1/ingest` | Fetch live prices from CoinGecko → write to PostgreSQL |
| `GET` | `/api/v1/anomalies` | Z-score anomalies derived from live price data |
| `GET` | `/api/v1/pipeline` | Full service registry with ports and URLs |

Data source priority for `/api/v1/prices`:
1. PostgreSQL `cryptos` table (populated by Airflow DAG or `/api/v1/ingest`)
2. CoinGecko live (auto-cached 60s, auto-written to PostgreSQL)
3. Stale cache fallback

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Ingestion | CoinGecko REST API | free | Live market data, no API key required |
| Orchestration | Apache Airflow | 2.6.0 | Hourly DAG scheduling |
| Message broker | Apache Kafka (Confluent) | 7.4.0 | Distributed streaming |
| Schema | Confluent Schema Registry | 7.4.0 | Message schema enforcement |
| Monitoring | Confluent Control Center | 7.4.0 | Consumer lag + topic health |
| Stream processing | Apache Spark (PySpark) | 3.5.0 | Structured Streaming + anomaly detection |
| Timeseries storage | Apache Cassandra | latest | Primary streaming sink |
| Staging DB | PostgreSQL | 14 | Airflow metadata + price staging |
| REST API | FastAPI | 0.115 | Prices, anomalies, ingest trigger |
| Dashboard | React 18 + Vite 5 | latest | Live UI with auto-refresh |
| Reverse proxy | nginx | alpine | Serves React + proxies `/api/` to FastAPI |
| Dashboards | Grafana | latest | Auto-provisioned dashboards |
| Infrastructure | Docker Compose | v2 | 12-service local orchestration |

---

## Results

| Metric | Value |
|--------|-------|
| End-to-end latency (ingest → dashboard) | sub-500ms |
| Coins tracked | 11 (top by market cap) |
| Anomaly detection window | 100 ticks per symbol |
| Price spike threshold | Z-score > 3.5 |
| Volume spike threshold | Z-score > 4.0 |
| Flash crash threshold | > 5% single-tick drop |
| Docker services | 12 |
| Airflow schedule | @hourly |

---

## Project Structure

```
CryptoStream/
├── api/
│   ├── main.py              # FastAPI: /prices, /anomalies, /ingest, /health, /pipeline
│   ├── Dockerfile           # python:3.11-slim
│   └── requirements.txt
├── app/
│   └── anomaly_detector.py  # Z-score sliding window (Spark micro-batch compatible)
├── assets/
│   └── banner.svg           # Project banner
├── dags/
│   └── kafka_stream.py      # Airflow DAG: store_data_crypto → stream_data_crypto
├── demo/
│   └── index.html           # Standalone demo, open in browser, no setup
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # 3-tab layout: Dashboard / Anomalies / About
│   │   └── components/
│   │       ├── Dashboard.jsx  # Live price ticker + ingest button + auto-refresh
│   │       ├── Anomalies.jsx  # Z-score anomaly cards with severity bars
│   │       └── About.jsx      # Health, architecture, services, endpoints
│   ├── nginx.conf           # Serves React + proxies /api/ to FastAPI
│   └── Dockerfile
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/postgres.yml   # Auto-provisions PostgreSQL datasource
│   │   └── dashboards/dashboard.yml   # Auto-loads dashboards from /grafana/dashboards/
│   └── dashboards/
│       └── crypto_prices.json         # Pre-built price + history dashboard
├── picture/                 # Architecture and UI screenshots
├── script/
│   └── entrypoint.sh        # Airflow init script
├── crypto_stream.py         # PySpark Structured Streaming consumer
├── docker-compose.yml       # 12-service orchestration
├── requirements.txt         # Airflow Python deps
└── .env.example
```

---

## European Market Use Cases

- **Deutsche Bank / Commerzbank**: Real-time FX and crypto market data feeds for trading desks
- **N26 / Trade Republic**: Live price streaming backend for retail crypto trading apps
- **Bitpanda (Vienna)**: Kafka-based order book and price feed ingestion at scale
- **Crypto fintech startups (Berlin, Amsterdam, Zurich)**: Full streaming pipeline with built-in monitoring

---

## Screenshots

| React Dashboard, Live Prices |
|-------------------------------|
| ![Dashboard](assets/screenshots/dashboard.png) |

| Grafana, Live Crypto Prices | Airflow, crypto_automation DAG |
|------------------------------|-----------------------------------|
| ![Grafana](assets/screenshots/grafana.png) | ![Airflow](assets/screenshots/airflow.png) |

| Kafka Control Center, cryptos_created | Cassandra, Streaming Sink (11 coins) |
|----------------------------------------|---------------------------------------|
| ![Control Center](picture/control_center.png) | ![Cassandra](picture/cassandra.png) |

---

## Author

**Rayen Lassoued**
[github.com/Hamilas](https://github.com/Hamilas) · [https://www.linkedin.com/in/lassoued-rayen/](https://www.linkedin.com/in/lassoued-rayen/)

## License

MIT
