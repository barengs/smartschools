# Ekosistem Smart School Terintegrasi

Monorepo implementasi **Ekosistem Smart School Terintegrasi** dengan arsitektur *Hybrid Polyglot* (**Node.js/NestJS**, **Rust/Axum**, **Python/FastAPI**) di atas satu **Single Source of Truth (PostgreSQL 16+)**.

## Dokumentasi Utama
- [ARSITEKTUR_PENGEMBANGAN_SMARTSCHOOL.md](ARSITEKTUR_PENGEMBANGAN_SMARTSCHOOL.md)
- [ARSITEKTUR_PENGEMBANGAN_SMARTSCHOOL.pdf](ARSITEKTUR_PENGEMBANGAN_SMARTSCHOOL.pdf)

## Struktur Monorepo
```text
├── apps/
│   ├── web-portal/            # React.js + Vite + TypeScript (SIAKAD, E-PPDB, LMS/CBT, E-Finance)
│   └── mobile-flutter/        # Flutter Multi-Flavor (Parent, Student, Teacher)
├── services/
│   ├── core-erp/              # Service A: Node.js + NestJS (75% - SSO, ERP, LMS, Billing, Notif)
│   ├── high-speed-engine/     # Service B: Rust + Axum (15% - CBT Live, IoT RFID, POS Wallet)
│   └── ai-scheduling/         # Service C: Python + FastAPI (10% - OR-Tools Jadwal, EWS Analytics)
├── firmware/
│   └── iot-terminals/         # ESP32 / RPi (RFID Gate, POS, IP Bell)
├── contracts/                 # OpenAPI, gRPC .proto, & Redis Stream Event Schemas
└── infra/
    ├── gateway/               # Nginx / Kong API Gateway routing
    ├── migrations/            # Single Migration Authority (PostgreSQL 4 Skema)
    ├── scripts/               # Utility scripts (RS256 keypair generator)
    └── secrets/               # Local dev RS256 keys (gitignored)
```

## Quick Start (Fase 1 — Infrastruktur & SSOT Database)
1. Inisialisasi environment dan kunci RS256:
   ```bash
   make init
   ```
2. Jalankan PostgreSQL 16, Redis, MinIO, dan API Gateway:
   ```bash
   make up
   ```
3. Cek status container & koneksi database:
   ```bash
   make ps
   curl http://localhost:8080/health
   ```

