#!/usr/bin/env python3
"""
data_refresh.py — ChainPulse Data Refresh Entry Point
======================================================
Pulls fresh data from FRED (4 series) and the NY Fed (GSCPI), validates
all 6 data files are present, then runs the full gssi_pipeline.py chain.

Run with:  python3 data_refresh.py
Requires:  export FRED_API_KEY=your_key_here
"""

import os
import sys
import json
import time
import subprocess
import datetime
from pathlib import Path

import requests
import pandas as pd
import numpy as np

# ── fredapi — fail fast with a clear message if not installed ─────────────────
try:
    import fredapi
except ImportError:
    print("ERROR: fredapi is not installed.")
    print("  Fix: pip install fredapi")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
ROOT       = Path(__file__).resolve().parent
DATA_DIR   = ROOT / "data"
OUTPUT_DIR = ROOT / "output"
PIPELINE   = ROOT / "gssi_pipeline.py"

FRED_SERIES = {
    "WTISPLC":  "WTISPLC",   # WTI crude oil spot price
    "CPIAUCSL": "CPIAUCSL",  # CPI all urban consumers
    "INDPRO":   "INDPRO",    # Industrial production index
    "VIXCLS":   "VIXCLS",    # VIX monthly close
}

FRED_API_KEY = 'b3aaa93dfafbb9c369f007a6b53f2220'

REQUIRED_FILES = [
    "Baltic Dry Index Historical Data(TransportAndFreightStress).csv",
    "GSCPI.csv",
    "WTISPLC.csv",
    "CPIAUCSL.csv",
    "INDPRO.csv",
    "VIXCLS.csv",
]

EXPECTED_OUTPUTS = [
    "gssi_final.csv",
    "gssi_summary.json",
    "gssi_timeseries.png",
    "dashboard_data.json",
]

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Check FRED_API_KEY before doing anything else
# ─────────────────────────────────────────────────────────────────────────────
if not FRED_API_KEY:
    print("ERROR: FRED_API_KEY environment variable is not set.")
    print()
    print("  To fix this:")
    print("    1. Get a free API key at https://fred.stlouisfed.org/docs/api/api_key.html")
    print("    2. Set it: export FRED_API_KEY=your_key_here")
    print("    3. Re-run: python3 data_refresh.py")
    sys.exit(1)

print()
print("=" * 60)
print("  ChainPulse Data Refresh")
print("=" * 60)
print(f"  Root      : {ROOT}")
print(f"  Data dir  : {DATA_DIR}")
print(f"  Output dir: {OUTPUT_DIR}")
print()

OUTPUT_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — Pull 4 FRED series
# ─────────────────────────────────────────────────────────────────────────────
print("── Step 1/7: Pulling FRED series ─────────────────────────────────────")

fred = fredapi.Fred(api_key=FRED_API_KEY)
failed_series = []
refreshed_series = []

for series_id in FRED_SERIES:
    try:
        raw = fred.get_series(series_id, observation_start="2000-01-01")

        # Build DataFrame in the exact format gssi_pipeline.py expects:
        # two columns — observation_date (string YYYY-MM-DD) and the series value.
        df = pd.DataFrame({
            "observation_date": raw.index.strftime("%Y-%m-%d"),
            series_id: raw.values,
        })

        # Drop rows where value is NaN (FRED sometimes has '.' placeholders)
        df = df.dropna(subset=[series_id])
        df = df.reset_index(drop=True)

        out_path = DATA_DIR / f"{series_id}.csv"
        df.to_csv(out_path, index=False)

        start = df["observation_date"].iloc[0]
        end   = df["observation_date"].iloc[-1]
        print(f"  ✓ {series_id}: {len(df)} observations | {start} → {end}")
        refreshed_series.append(series_id)

    except Exception as e:
        print(f"  ✗ {series_id}: FAILED — {e}")
        failed_series.append(series_id)

if failed_series:
    print()
    print(f"  ERROR: The following FRED series failed to pull: {failed_series}")
    print("  Fix the errors above and re-run.")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Pull GSCPI from NY Fed
# ─────────────────────────────────────────────────────────────────────────────
print()
print("── Step 2/7: Pulling GSCPI from NY Fed ───────────────────────────────")

NYFED_XLSX_URL = (
    "https://www.newyorkfed.org/medialibrary/media/research/"
    "policy_tools/gscpi/downloads/gscpi-data.xlsx"
)
NYFED_CSV_URL = (
    "https://www.newyorkfed.org/medialibrary/media/research/"
    "policy_tools/gscpi/downloads/gscpi-data.csv"
)

HEADERS = {"User-Agent": "Mozilla/5.0 (research/data-refresh)"}
TIMEOUT = 30

gscpi_df   = None
gscpi_src  = "existing_file"


def _parse_gscpi(content_or_buf, fmt):
    """Parse GSCPI from xlsx bytes or csv bytes/path; returns clean DataFrame."""
    if fmt == "xlsx":
        df = pd.read_excel(content_or_buf, skiprows=5, header=0, usecols=[0, 1])
    else:
        df = pd.read_csv(content_or_buf, skiprows=5, header=0, usecols=[0, 1])

    df.columns = ["Date", "GSCPI"]
    df["Date"]  = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    df["GSCPI"] = pd.to_numeric(df["GSCPI"], errors="coerce")
    df = df.dropna(subset=["Date", "GSCPI"])
    df = df.sort_values("Date").reset_index(drop=True)
    return df


# Try xlsx first, then CSV fallback
for url, fmt in [(NYFED_XLSX_URL, "xlsx"), (NYFED_CSV_URL, "csv")]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        from io import BytesIO
        buf = BytesIO(resp.content)
        gscpi_df = _parse_gscpi(buf, fmt)
        gscpi_src = "ny_fed_fresh"
        start = gscpi_df["Date"].iloc[0].strftime("%Y-%m-%d")
        end   = gscpi_df["Date"].iloc[-1].strftime("%Y-%m-%d")
        print(f"  ✓ GSCPI ({fmt}): {len(gscpi_df)} observations | {start} → {end}")
        break
    except Exception as e:
        print(f"  ⚠ GSCPI {fmt} fetch failed ({e}), trying next source...")

if gscpi_df is None:
    print("  ⚠ GSCPI: NY Fed fetch failed — keeping existing file.")
    print("    Pipeline will use last saved data.")
else:
    # Write the file with 5 blank metadata rows, exactly as gssi_pipeline.py expects.
    # The pipeline does skiprows=5 then reads Date,GSCPI columns.
    gscpi_path = DATA_DIR / "GSCPI.csv"
    with open(gscpi_path, "w") as f:
        for _ in range(5):
            f.write("\n")
        f.write("Date,GSCPI\n")
        for _, row in gscpi_df.iterrows():
            f.write(f"{row['Date'].strftime('%d-%b-%Y')},{row['GSCPI']}\n")
    print(f"  ✓ GSCPI written to {gscpi_path}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — BDI: verify existing file (no auto-pull available)
# ─────────────────────────────────────────────────────────────────────────────
print()
print("── Step 3/7: Checking BDI file ───────────────────────────────────────")

BDI_FILE = DATA_DIR / "Baltic Dry Index Historical Data(TransportAndFreightStress).csv"

if BDI_FILE.exists():
    print("  ✓ BDI: using existing file (manual update required for latest data)")
else:
    print("  ✗ BDI file not found. Please download manually from:")
    print("      https://www.investing.com/indices/baltic-dry-historical-data")
    print(f"    Save as: data/Baltic Dry Index Historical Data(TransportAndFreightStress).csv")
    print("    Then re-run: python3 data_refresh.py")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — Validate all 6 data files are present
# ─────────────────────────────────────────────────────────────────────────────
print()
print("── Step 4/7: Validating data files ───────────────────────────────────")

missing = [f for f in REQUIRED_FILES if not (DATA_DIR / f).exists()]
if missing:
    print("  ✗ Missing required data files:")
    for f in missing:
        print(f"      data/{f}")
    sys.exit(1)

print("  ✓ All 6 data files present — ready to run pipeline")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 — Run gssi_pipeline.py as subprocess
# ─────────────────────────────────────────────────────────────────────────────
print()
print("── Step 5/7: Running gssi_pipeline.py ───────────────────────────────")
print()

pipeline_start = time.time()

result = subprocess.run(
    [sys.executable, str(PIPELINE)],
    cwd=str(ROOT),
    capture_output=False,   # let pipeline print to stdout directly
    text=True,
)

pipeline_elapsed = time.time() - pipeline_start

print()
if result.returncode != 0:
    print(f"  ✗ Pipeline failed with exit code {result.returncode}. Check output above for errors.")
    sys.exit(1)

print(f"  ✓ Pipeline completed successfully ({pipeline_elapsed:.1f}s)")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7 — Validate output files were updated within the last 5 minutes
# ─────────────────────────────────────────────────────────────────────────────
print()
print("── Step 6/7: Validating output files ────────────────────────────────")

now = time.time()
verified_outputs = []

for fname in EXPECTED_OUTPUTS:
    path = OUTPUT_DIR / fname
    if not path.exists():
        print(f"  ⚠ {fname}: not found")
        continue
    age = now - os.path.getmtime(path)
    if age > 300:
        print(f"  ⚠ {fname}: exists but was last modified {age:.0f}s ago (may not have been updated)")
    else:
        print(f"  ✓ {fname}: updated {age:.0f}s ago")
        verified_outputs.append(fname)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8 — Write output/last_refresh.json
# ─────────────────────────────────────────────────────────────────────────────
now_utc   = datetime.datetime.utcnow()
ts_string = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")

refresh_record = {
    "timestamp_utc":          ts_string,
    "fred_series_refreshed":  refreshed_series,
    "gscpi_source":           gscpi_src,
    "bdi_source":             "manual_file",
    "pipeline_exit_code":     result.returncode,
    "outputs_verified":       verified_outputs,
}

refresh_path = OUTPUT_DIR / "last_refresh.json"
with open(refresh_path, "w") as f:
    json.dump(refresh_record, f, indent=4, allow_nan=False)

print(f"  ✓ Refresh log written to {refresh_path}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 9 — Final summary
# ─────────────────────────────────────────────────────────────────────────────
gscpi_status = "fetched fresh" if gscpi_src == "ny_fed_fresh" else "kept existing"

print()
print("╔══════════════════════════════════════════════════════╗")
print("║              DATA REFRESH COMPLETE                   ║")
print("╠══════════════════════════════════════════════════════╣")
print(f"║  FRED series refreshed : {len(refreshed_series):<28}║")
print(f"║  GSCPI                 : {gscpi_status:<28}║")
print(f"║  BDI                   : {'manual file (existing)':<28}║")
print(f"║  Pipeline              : {'completed successfully':<28}║")
print(f"║  Outputs updated       : {f'{len(verified_outputs)}/{len(EXPECTED_OUTPUTS)} files':<28}║")
print(f"║  Timestamp             : {now_utc.strftime('%Y-%m-%d %H:%M:%S UTC'):<28}║")
print("╚══════════════════════════════════════════════════════╝")
print()
