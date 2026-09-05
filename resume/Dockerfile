# Tectonic in a container, so a machine without a local install can still build
# the CV. This exists because the engine is not interchangeable: xelatex from
# TeX Live 2026 lays the \cventry skills line on top of the preceding bullets,
# while Tectonic renders it correctly. Every path (CI, a local binary and this
# image) therefore runs the same engine, and the published PDF does not depend
# on who built it.
#
# Keep TECTONIC_VERSION in step with the workflows (.github/workflows/ci.yml,
# cd.yml); the checksums come from the release's linux-musl tarballs.
FROM debian:bookworm-slim

ARG TECTONIC_VERSION=0.17.0
ARG TECTONIC_SHA256_AMD64=8533d07f9ccbd7a65824b9e0459041bca34af1eb33daba48f59215593753a3b7
ARG TECTONIC_SHA256_ARM64=b10954a95404f3ab2328d2fa59a5ebab8e657f893fab096f98be8db7c0c979b8

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl; \
    case "$(dpkg --print-architecture)" in \
      amd64) arch=x86_64; sha="${TECTONIC_SHA256_AMD64}" ;; \
      arm64) arch=aarch64; sha="${TECTONIC_SHA256_ARM64}" ;; \
      *) echo "unsupported architecture: $(dpkg --print-architecture)" >&2; exit 1 ;; \
    esac; \
    url="https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-${arch}-unknown-linux-musl.tar.gz"; \
    curl --fail --silent --show-error --location "${url}" --output /tmp/tectonic.tar.gz; \
    echo "${sha}  /tmp/tectonic.tar.gz" | sha256sum --check --strict; \
    tar -xzf /tmp/tectonic.tar.gz -C /usr/local/bin tectonic; \
    rm -rf /tmp/tectonic.tar.gz /var/lib/apt/lists/*; \
    tectonic --version

# The package bundle Tectonic downloads on first use is mounted in from the
# host, so repeat builds do not refetch it. World-writable because the caller
# runs this image as their own uid, not as root.
ENV TECTONIC_CACHE_DIR=/cache
RUN mkdir -p /cache && chmod 777 /cache

ENTRYPOINT ["tectonic"]
