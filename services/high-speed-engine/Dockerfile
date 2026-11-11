FROM rust:1.83-alpine AS builder
RUN apk add --no-cache musl-dev openssl-dev pkgconfig
WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release && strip target/release/high-speed-engine

FROM alpine:3.20 AS runner
RUN apk add --no-cache ca-certificates libgcc
WORKDIR /app
COPY --from=builder /app/target/release/high-speed-engine /usr/local/bin/high-speed-engine
EXPOSE 3002
CMD ["high-speed-engine"]
