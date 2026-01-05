#!/bin/bash
set -e

IMAGE_NAME="julianpoy/recipeclipper-miniserver"
VERSION=$(node -p "require('./package.json').version")

docker buildx create --use --name recipeclipper-builder 2>/dev/null || docker buildx use recipeclipper-builder

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag "$IMAGE_NAME:latest" \
  --tag "$IMAGE_NAME:$VERSION" \
  --push \
  .
