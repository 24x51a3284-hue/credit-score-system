#!/usr/bin/env bash
# Render runs this before starting the server

set -e

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🌲 Training ML model..."
python -m app.ml.train_model

echo "✅ Build complete!"
