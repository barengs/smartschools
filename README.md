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

## Menjalankan Backend Core ERP (`services/core-erp`)
Frontend mengambil data dinamis melalui API Gateway (`http://localhost:8080/api/v1/core/*`). Pastikan layanan `core-erp` berjalan:
1. Instal dependensi dan isi data awal (akun admin, tahun ajaran, siswa, EWS, dan sampel PPDB):
   ```bash
   npm --prefix services/core-erp install
   npm --prefix services/core-erp run seed:admin
   ```
   *(Jika port PostgreSQL Docker menggunakan port non-default di `.env`, contoh `5433`, sertakan `DATABASE_URL` atau muat variabel `.env` sebelum menjalankan `seed:admin` dan `start:dev`.)*
2. Jalankan server API dalam mode development (`http://localhost:3001`):
   ```bash
   npm --prefix services/core-erp run start:dev
   ```

## Menjalankan Frontend (`apps/web-portal`)
1. Instal dependensi frontend:
   ```bash
   npm --prefix apps/web-portal install
   ```
2. *(Opsional)* Jika ingin memakai style vektor resmi Mapbox pada peta geotagging PPDB, tambahkan token Mapbox di `apps/web-portal/.env`:
   ```env
   VITE_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
   ```
   *(Jika tidak diisi, komponen peta Mapbox GL JS otomatis memakai tile raster OpenStreetMap.)*
3. Jalankan server development Vite (`http://localhost:5173`):
   ```bash
   npm --prefix apps/web-portal run dev
   ```
4. Perintah build & pengecekan produksi:
   ```bash
   npm --prefix apps/web-portal run lint     # Typecheck TypeScript
   npm --prefix apps/web-portal run build    # Build produksi ke dist/
   npm --prefix apps/web-portal run preview  # Preview hasil build di http://localhost:4173
   ```

### Akses & Rute Utama Frontend
- **Beranda & Portal PPDB Publik**: `http://localhost:5173/`
- **Formulir E-PPDB**: `http://localhost:5173/ppdb`
- **Cek Status Seleksi PPDB**: `http://localhost:5173/status-seleksi`
- **Login SSO Portal**: `http://localhost:5173/login`
- **Dashboard & Modul ERP** *(butuh login)*: `http://localhost:5173/dashboard`
  - Akun bawaan hasil `seed:admin`: username `superadmin` (atau `admin@smartschool.sch.id`), kata sandi `AdminSmartSchool123!`.


