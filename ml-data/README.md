# ML Data Collection for Smart Helmet

This directory contains tools for collecting sensor data from the ESP32 Smart Helmet to train an accident detection ML model.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Upload Firmware
- Open `SmartHelmet/SmartHelmet.ino` in Arduino IDE
- Upload to your ESP32
- Wait for "System ready" message

### 3. Run Data Collector
```bash
python data_collector.py
```

### 4. Collect Data
```
> collect normal
[Move helmet for 30-60 seconds]
[Press Ctrl+C to stop]

> collect accident
[Drop helmet on soft surface]
[Press Ctrl+C to stop]

> collect edge_case
[Shake/bump helmet aggressively]
[Press Ctrl+C to stop]
```

## Files

- **`data_collector.py`** - Main Python script for data collection
- **`requirements.txt`** - Python dependencies
- **`DATA_COLLECTION_GUIDE.md`** - Comprehensive collection guide
- **`collected_data/`** - Output directory (auto-created)
  - `normal/` - Normal riding data
  - `accident/` - Accident simulation data
  - `edge_case/` - Edge case data

## Data Format

Each CSV file contains:
- `timestamp_ms` - Timestamp in milliseconds
- `ax, ay, az` - Accelerometer data (g-forces)
- `gx, gy, gz` - Gyroscope data (deg/s)
- `pitch, roll` - Orientation (degrees)
- `label` - Class label

Sampling rate: **50Hz** (20ms intervals)

## Data Collection Goals

| Class | Target | Sessions | Duration |
|-------|--------|----------|----------|
| normal | 500-1000 samples | 10-15 | 30-60s |
| accident | 500-1000 samples | 10-15 | 20-40s |
| edge_case | 500-1000 samples | 10-15 | 30-60s |

## Next Steps

After collecting data:

1. **Verify data** - Check CSV files for quality
2. **Train model** - Use TensorFlow Lite or Edge Impulse
3. **Deploy to ESP32** - Replace threshold-based detection

## Documentation

See **[DATA_COLLECTION_GUIDE.md](DATA_COLLECTION_GUIDE.md)** for:
- Detailed collection scenarios
- Safety tips
- Troubleshooting
- Best practices

## Support

Issues? Check the troubleshooting section in the guide or refer to the main project README.
