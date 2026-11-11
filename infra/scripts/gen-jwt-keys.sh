#!/usr/bin/env bash
set -euo pipefail

SECRET_DIR="infra/secrets"
PRIVATE_KEY="${SECRET_DIR}/private.pem"
PUBLIC_KEY="${SECRET_DIR}/public.pem"

mkdir -p "${SECRET_DIR}"

if [ -f "${PRIVATE_KEY}" ] && [ -f "${PUBLIC_KEY}" ]; then
  echo "ℹ️  Kunci RS256 sudah ada di ${SECRET_DIR}/, melewati pembuatan ulang."
  exit 0
fi

openssl genpkey -algorithm RSA -out "${PRIVATE_KEY}" -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in "${PRIVATE_KEY}" -out "${PUBLIC_KEY}"
chmod 600 "${PRIVATE_KEY}"
chmod 644 "${PUBLIC_KEY}"

echo "✅ Berhasil membuat keypair JWT RS256:"
echo "   - Private Key (khusus Service A Node.js): ${PRIVATE_KEY}"
echo "   - Public Key  (read-only Service B & C) : ${PUBLIC_KEY}"

