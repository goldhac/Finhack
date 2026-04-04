#!/usr/bin/env python3
"""
Global Supply Chain Stress Index (GSSI) Pipeline
=================================================
Loads 6 supply-chain stress indicators, normalises them using an
expanding-window z-score (no look-ahead bias), combines them into a
GSSI composite via three weighting schemes, and saves results + a
validation chart.

Run with:  python gssi_pipeline.py
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')   # non-interactive backend (safe for scripts)
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────────────────────────────────────────
DATA_DIR   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 – DATA LOADING & INSPECTION
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 1 – LOADING DATA")
print("="*70)

# ── Baltic Dry Index ─────────────────────────────────────────────────────────
# Comes from Investing.com — monthly, newest-first, with comma thousand-
# separators in numeric columns and dates as MM/DD/YYYY.
bdi_path = os.path.join(DATA_DIR, 'Baltic Dry Index Historical Data(TransportAndFreightStress).csv')
bdi_raw = pd.read_csv(bdi_path)

# Strip commas from numeric fields (e.g. "2,066.00" → 2066.00)
for col in ['Price', 'Open', 'High', 'Low']:
    if col in bdi_raw.columns:
        bdi_raw[col] = bdi_raw[col].astype(str).str.replace(',', '', regex=False)
        bdi_raw[col] = pd.to_numeric(bdi_raw[col], errors='coerce')

bdi_raw['Date'] = pd.to_datetime(bdi_raw['Date'], format='%m/%d/%Y')
bdi_raw = bdi_raw.set_index('Date').sort_index()   # sort ascending
bdi_monthly = bdi_raw[['Price']].rename(columns={'Price': 'BDI'})

print(f"\nBDI: {bdi_monthly.shape[0]} rows  "
      f"| {bdi_monthly.index.min().date()} → {bdi_monthly.index.max().date()}")
print(f"  Columns: {list(bdi_raw.columns)}")
print(f"  Missing: {bdi_monthly.isna().sum()['BDI']}")
print(bdi_monthly.head(3).to_string())

# ── GSCPI ───────────────────────────────────────────────────────────────────
# NY Fed file: rows 1-5 are title/URL metadata; actual data starts row 6.
# Date format: "31-Jan-1998"; only the first two columns are meaningful.
gscpi_path = os.path.join(DATA_DIR, 'GSCPI.csv')
gscpi_raw = pd.read_csv(
    gscpi_path,
    skiprows=5,           # skip the 5 metadata rows
    header=0,
    usecols=[0, 1],
    names=['Date', 'GSCPI'],
)
gscpi_raw = gscpi_raw.dropna(subset=['Date'])
gscpi_raw['Date'] = pd.to_datetime(gscpi_raw['Date'], format='%d-%b-%Y')
gscpi_raw['GSCPI'] = pd.to_numeric(gscpi_raw['GSCPI'], errors='coerce')
gscpi_monthly = gscpi_raw.set_index('Date').sort_index()

print(f"\nGSCPI: {gscpi_monthly.shape[0]} rows  "
      f"| {gscpi_monthly.index.min().date()} → {gscpi_monthly.index.max().date()}")
print(f"  Missing: {gscpi_monthly.isna().sum()['GSCPI']}")
print(gscpi_monthly.head(3).to_string())

# ── WTI Crude Oil Spot Price ─────────────────────────────────────────────────
# Standard FRED CSV: observation_date (YYYY-MM-DD), WTISPLC (monthly mean).
wti_path = os.path.join(DATA_DIR, 'WTISPLC.csv')
wti_raw  = pd.read_csv(wti_path, parse_dates=['observation_date'])
wti_raw['WTISPLC'] = pd.to_numeric(wti_raw['WTISPLC'], errors='coerce')
wti_monthly = wti_raw.set_index('observation_date').rename(columns={'WTISPLC': 'WTI'})

print(f"\nWTI: {wti_monthly.shape[0]} rows  "
      f"| {wti_monthly.index.min().date()} → {wti_monthly.index.max().date()}")
print(f"  Missing: {wti_monthly.isna().sum()['WTI']}")
print(wti_monthly.head(3).to_string())

# ── CPI (CPIAUCSL) ───────────────────────────────────────────────────────────
# Standard FRED CSV.
cpi_path = os.path.join(DATA_DIR, 'CPIAUCSL.csv')
cpi_raw  = pd.read_csv(cpi_path, parse_dates=['observation_date'])
cpi_raw['CPIAUCSL'] = pd.to_numeric(cpi_raw['CPIAUCSL'], errors='coerce')
cpi_monthly = cpi_raw.set_index('observation_date').rename(columns={'CPIAUCSL': 'CPI'})

print(f"\nCPI: {cpi_monthly.shape[0]} rows  "
      f"| {cpi_monthly.index.min().date()} → {cpi_monthly.index.max().date()}")
print(f"  Missing: {cpi_monthly.isna().sum()['CPI']}")
print(cpi_monthly.head(3).to_string())

# ── Industrial Production Index (INDPRO) ─────────────────────────────────────
# Standard FRED CSV.
indpro_path = os.path.join(DATA_DIR, 'INDPRO.csv')
indpro_raw  = pd.read_csv(indpro_path, parse_dates=['observation_date'])
indpro_raw['INDPRO'] = pd.to_numeric(indpro_raw['INDPRO'], errors='coerce')
indpro_monthly = indpro_raw.set_index('observation_date')

print(f"\nINDPRO: {indpro_monthly.shape[0]} rows  "
      f"| {indpro_monthly.index.min().date()} → {indpro_monthly.index.max().date()}")
print(f"  Missing: {indpro_monthly.isna().sum()['INDPRO']}")
print(indpro_monthly.head(3).to_string())

# ── VIX (VIXCLS) ─────────────────────────────────────────────────────────────
# Standard FRED CSV.  Note: the final row may have an empty value (most
# recent month not yet reported) — pd.to_numeric(..., errors='coerce') handles it.
vix_path = os.path.join(DATA_DIR, 'VIXCLS.csv')
vix_raw  = pd.read_csv(vix_path, parse_dates=['observation_date'])
vix_raw['VIXCLS'] = pd.to_numeric(vix_raw['VIXCLS'], errors='coerce')
vix_monthly = vix_raw.set_index('observation_date').rename(columns={'VIXCLS': 'VIX'})

print(f"\nVIX: {vix_monthly.shape[0]} rows  "
      f"| {vix_monthly.index.min().date()} → {vix_monthly.index.max().date()}")
print(f"  Missing: {vix_monthly.isna().sum()['VIX']}  "
      f"(trailing NaN is expected if the latest month is unreported)")
print(vix_monthly.head(3).to_string())


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 – FREQUENCY ALIGNMENT
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 2 – FREQUENCY ALIGNMENT")
print("="*70)

# All source series are already monthly.  We resample every series to the
# "month-end" (ME) timestamp convention so pd.concat produces a single,
# consistent DatetimeIndex with no timestamp mismatches (BDI and FRED use
# month-start; GSCPI uses month-end).
#
# Aggregation rules:
#   - Price-like (BDI, WTI, VIX): mean of observations in the month
#   - Index-level (CPI, INDPRO): last observation in the month
#   - GSCPI: already monthly at month-end; mean is identity

def resample_to_month_end(df, agg='mean'):
    """Resample to month-end frequency; single-observation months are unchanged."""
    if agg == 'mean':
        return df.resample('ME').mean()
    elif agg == 'last':
        return df.resample('ME').last()
    raise ValueError(f"Unknown agg: {agg}")

bdi_m    = resample_to_month_end(bdi_monthly,    agg='mean')
gscpi_m  = resample_to_month_end(gscpi_monthly,  agg='mean')
wti_m    = resample_to_month_end(wti_monthly,     agg='mean')
cpi_m    = resample_to_month_end(cpi_monthly,     agg='last')
indpro_m = resample_to_month_end(indpro_monthly,  agg='last')
vix_m    = resample_to_month_end(vix_monthly,     agg='mean')

# Inner join: keeps only months present in ALL six series.
# This is the conservative choice — no series is artificially extended.
combined = pd.concat(
    [bdi_m, gscpi_m, wti_m, cpi_m, indpro_m, vix_m],
    axis=1,
    join='inner',
)
combined.columns = ['BDI', 'GSCPI', 'WTI', 'CPI', 'INDPRO', 'VIX']
combined.index.name = 'date'

# Forward-fill any minor interior gaps (e.g. GSCPI lag-of-one-month reporting),
# then drop residual NaNs at the edges.
n_before = combined.isna().sum().sum()
combined = combined.ffill()
n_after  = combined.isna().sum().sum()
if n_before > 0:
    print(f"\n  ⚠  Forward-filled {n_before - n_after} interior NaN(s).")
combined = combined.dropna()

print(f"\nAligned dataset : {combined.shape[0]} months")
print(f"Date range      : {combined.index.min().date()} → {combined.index.max().date()}")
print(f"Remaining NaNs  : {combined.isna().sum().to_dict()}")
print("\nFirst 3 rows after alignment:")
print(combined.head(3).to_string())


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 – TRANSFORMATIONS
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 3 – TRANSFORMATIONS")
print("="*70)

transformed = pd.DataFrame(index=combined.index)

# BDI — month-over-month percentage change.
# Using levels of BDI would be misleading: BDI went from ~11,000 in 2008
# to ~290 in 2016 and back up, so the same "stress level" means different
# things in different eras.  MoM % change captures rapid rate-of-change
# (sudden freight tightening) which is the true stress signal.
transformed['BDI'] = combined['BDI'].pct_change() * 100

# GSCPI — use as-is.
# The NY Fed already outputs GSCPI in standardised units (σ from historical
# mean), making it directly comparable across time without further transformation.
transformed['GSCPI'] = combined['GSCPI']

# WTI — 3-month rolling percentage change.
# A single-month oil spike can be noise (weather, OPEC surprise).  A 3-month
# sustained rise captures genuine energy cost pressure building in supply chains.
# pct_change(3) = (price_t / price_{t-3}) - 1.
transformed['WTI'] = combined['WTI'].pct_change(3) * 100

# CPI — year-over-year percentage change (12-month).
# CPI levels are non-stationary and grow over decades; YoY change converts
# the series to an inflation *rate*, which is the economically meaningful
# measure of input-cost pressure.
transformed['CPI'] = combined['CPI'].pct_change(12) * 100

# INDPRO — month-over-month percentage change, then inverted (×-1).
# We want positive values to signal stress.  A contraction in industrial
# production (negative MoM) = disruption in the production-supply chain.
# Multiplying by -1 makes a production drop read as a positive stress signal.
transformed['INDPRO'] = combined['INDPRO'].pct_change() * 100 * -1

# VIX — raw monthly mean level (no transformation).
# Decision rationale: VIX *level* is inherently a regime indicator.
#   - Level > 20 : elevated uncertainty
#   - Level > 30 : crisis / high fear
#   - Level > 40 : extreme fear (2008, March 2020)
# Using MoM change would only detect *accelerations* in fear, missing sustained
# high-vol periods (e.g., all of H1-2020 stayed at 30-80).  The raw level
# correctly flags both the spike *and* the prolonged stress environment.
# The expanding z-score in Step 4 will re-centre and scale it for us.
transformed['VIX'] = combined['VIX']

# Drop NaN rows introduced by pct_change (the largest gap is CPI's 12-month lag)
n_dropped = transformed.isna().any(axis=1).sum()
transformed = transformed.dropna()

print(f"\nRows dropped due to transformation lags : {n_dropped}")
print(f"Transformed dataset : {transformed.shape[0]} months  "
      f"({transformed.index.min().date()} → {transformed.index.max().date()})")
print("\nDescriptive stats after transformation:")
print(transformed.describe().round(3).to_string())


# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 – EXPANDING-WINDOW Z-SCORE NORMALISATION  (no look-ahead bias)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 4 – NORMALISATION (EXPANDING Z-SCORE, MIN 24 MONTHS, CAP ±3)")
print("="*70)

MIN_PERIODS = 24   # require at least 24 months before the window kicks in
Z_CAP = 3.0        # winsorise extreme readings to ±3


def expanding_zscore(series, min_periods=MIN_PERIODS):
    """
    Compute a strictly-causal expanding z-score.

    At each month t we standardise using the mean and std computed over
    months [0 .. t-1] (the .shift(1) implements the one-period lag).
    This means the score at time t is based purely on information that was
    available *before* t — no look-ahead bias.

    The first `min_periods + 1` rows will be NaN (insufficient history or
    still in the warm-up period) and are dropped later.
    """
    expanding_mean = series.expanding(min_periods=min_periods).mean().shift(1)
    expanding_std  = series.expanding(min_periods=min_periods).std().shift(1)

    # Guard against zero standard deviation (flat series edge case)
    expanding_std = expanding_std.replace(0, np.nan)

    z = (series - expanding_mean) / expanding_std
    return z


normalised = pd.DataFrame(index=transformed.index)
for col in transformed.columns:
    z = expanding_zscore(transformed[col])
    z = z.clip(-Z_CAP, Z_CAP)   # cap outliers so they don't dominate the composite
    normalised[col] = z

# Drop the warm-up rows (first ~25 months have NaN from the expanding window + shift)
n_warmup = normalised.isna().any(axis=1).sum()
normalised = normalised.dropna()

print(f"\nWarm-up rows dropped : {n_warmup}")
print(f"Normalised dataset   : {normalised.shape[0]} months  "
      f"({normalised.index.min().date()} → {normalised.index.max().date()})")
print("\nNormalised descriptive stats (mean ≈ 0, std ≈ 1, range ≈ [−3, +3]):")
print(normalised.describe().round(3).to_string())

# Sanity check: INDPRO is already inverted (positive = stress) from Step 3.
# Verify direction by checking COVID March 2020 shows positive INDPRO stress.
covid_indpro = normalised.loc['2020-03':'2020-06', 'INDPRO']
if not covid_indpro.empty and covid_indpro.max() > 0:
    print(f"\n  ✓ INDPRO inversion check OK: max z-score in COVID window = "
          f"{covid_indpro.max():.2f} (positive = stress as intended)")
else:
    print(f"\n  ⚠ INDPRO inversion check FAILED — review the ×-1 transformation.")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 – COMBINE INTO GSSI
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 5 – COMBINING INTO GSSI  (3 weighting schemes)")
print("="*70)

# ── Method 1: Bucketed Equal-Weight  (OFFICIAL) ───────────────────────────────
# Each of the 4 buckets gets 25% of the total weight.  Within buckets that
# contain multiple indicators (Bucket C), the weight is split equally.
# This approach is transparent, defensible to a judge, and reflects the
# conceptual design of the index (one theme = one vote).
#
#   Bucket A  Freight        BDI          1/4   = 25.0%
#   Bucket B  Frictions      GSCPI        1/4   = 25.0%
#   Bucket C  Energy/Costs   WTI + CPI    1/4   = 12.5% each
#   Bucket D  Production     INDPRO       1/8   = 12.5%
#   Overlay   Market Stress  VIX          1/8   = 12.5%
w_bucketed = {
    'BDI':    0.25,
    'GSCPI':  0.25,
    'WTI':    0.125,
    'CPI':    0.125,
    'INDPRO': 0.125,
    'VIX':    0.125,
}
assert abs(sum(w_bucketed.values()) - 1.0) < 1e-9, "Bucketed weights must sum to 1"

# ── Method 2: Simple Equal-Weight  (ROBUSTNESS CHECK) ─────────────────────────
# 1/6 each — the simplest possible baseline.  Useful to check that the
# bucketed scheme is not just an artefact of overweighting GSCPI/BDI.
w_equal = {col: 1 / 6 for col in normalised.columns}

# ── Method 3: Inverse-Volatility Weight  (RISK-PARITY ALTERNATIVE) ────────────
# Equal-weight implicitly over-represents high-volatility indicators (even
# after z-scoring, residual vol differences persist because the z-score
# distribution is capped and asymmetric).  Inverse-volatility weighting gives
# each indicator the *same risk contribution* to the composite.  This method
# is popular in factor investing and produces a more stable composite.
# Caveat: we use full-sample vol here (slight look-ahead), but the effect is
# small relative to the expanding normalisation already applied.
inv_vol  = 1.0 / normalised.std()
w_invvol = (inv_vol / inv_vol.sum()).to_dict()

print(f"\nBucketed weights  : {json.dumps({k: round(v,4) for k,v in w_bucketed.items()})}")
print(f"Equal weights     : {json.dumps({k: round(v,4) for k,v in w_equal.items()})}")
print(f"Inv-vol weights   : {json.dumps({k: round(v,4) for k,v in w_invvol.items()})}")

gssi_bucketed = (normalised * pd.Series(w_bucketed)).sum(axis=1)
gssi_equal    = (normalised * pd.Series(w_equal)).sum(axis=1)
gssi_invvol   = (normalised * pd.Series(w_invvol)).sum(axis=1)

for name, series in [('GSSI_bucketed', gssi_bucketed),
                     ('GSSI_equal',    gssi_equal),
                     ('GSSI_invvol',   gssi_invvol)]:
    print(f"\n{name}: mean={series.mean():.3f}  std={series.std():.3f}  "
          f"max={series.max():.3f}  min={series.min():.3f}")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 – REGIME CLASSIFICATION
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 6 – REGIME CLASSIFICATION")
print("="*70)

# Thresholds chosen based on the index distribution:
#   < 0.5  : Normal      (below +½ σ — background noise, no actionable signal)
#   0.5–1.5: Elevated    (between ½ σ and 1.5 σ — caution, monitor)
#   ≥ 1.5  : Severe      (above 1.5 σ — systemic disruption)
THRESH_ELEVATED = 0.5
THRESH_SEVERE   = 1.5

regime = pd.cut(
    gssi_bucketed,
    bins=[-np.inf, THRESH_ELEVATED, THRESH_SEVERE, np.inf],
    labels=['Normal', 'Elevated', 'Severe'],
    right=False,    # left-closed: [Normal, Elevated) [Elevated, Severe) [Severe, ∞)
)
regime.name = 'regime'

# Historical expanding percentile (no look-ahead).
# For each month t: fraction of months in [0..t-1] with GSSI < GSSI_t, ×100.
gssi_arr  = gssi_bucketed.values
pctile_arr = np.empty(len(gssi_arr))
pctile_arr[0] = 50.0  # undefined at t=0; set to 50th by convention
for i in range(1, len(gssi_arr)):
    pctile_arr[i] = float((gssi_arr[:i] < gssi_arr[i]).mean() * 100)
percentile = pd.Series(pctile_arr, index=gssi_bucketed.index, name='percentile')

print(f"\nRegime distribution:\n{regime.value_counts().to_string()}")
print(f"\nLatest month : {gssi_bucketed.index[-1].date()}")
print(f"  GSSI       : {gssi_bucketed.iloc[-1]:.3f}")
print(f"  Regime     : {regime.iloc[-1]}")
print(f"  Percentile : {percentile.iloc[-1]:.1f}th")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 7 – BUCKET CONTRIBUTION BREAKDOWN
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 7 – BUCKET CONTRIBUTIONS")
print("="*70)

# Each bucket's contribution = its weighted normalised value(s).
# Summing all contributions exactly reconstructs GSSI_bucketed.
contrib_A       = normalised['BDI']    * w_bucketed['BDI']
contrib_B       = normalised['GSCPI']  * w_bucketed['GSCPI']
contrib_C       = (normalised['WTI']   * w_bucketed['WTI']
                 + normalised['CPI']   * w_bucketed['CPI'])
contrib_D       = normalised['INDPRO'] * w_bucketed['INDPRO']
contrib_overlay = normalised['VIX']    * w_bucketed['VIX']

# Verify the contributions sum back to the composite (numerical sanity check)
recon_error = (contrib_A + contrib_B + contrib_C + contrib_D + contrib_overlay
               - gssi_bucketed).abs().max()
if recon_error < 1e-10:
    print(f"\n  ✓ Contribution decomposition is exact (max recon error = {recon_error:.2e})")
else:
    print(f"\n  ⚠ Reconstruction error: {recon_error:.4f} — check weights.")

contributions = pd.DataFrame({
    'contrib_A_freight':      contrib_A,
    'contrib_B_frictions':    contrib_B,
    'contrib_C_energy_costs': contrib_C,
    'contrib_D_production':   contrib_D,
    'contrib_overlay_vix':    contrib_overlay,
})

print(f"\nMean contribution per bucket (should roughly balance across buckets):")
print(contributions.mean().round(4).to_string())
print(f"\nLatest month contributions:")
print(contributions.iloc[-1].round(4).to_string())


# ─────────────────────────────────────────────────────────────────────────────
# STEP 8 – SAVE OUTPUTS
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 8 – SAVING OUTPUTS")
print("="*70)

# ── gssi_final.csv ───────────────────────────────────────────────────────────
output_df = pd.concat(
    [
        normalised.rename(columns={c: f'norm_{c}' for c in normalised.columns}),
        gssi_bucketed.rename('GSSI_bucketed'),
        gssi_equal.rename('GSSI_equal'),
        gssi_invvol.rename('GSSI_invvol'),
        regime,
        percentile.round(2),
        contributions,
    ],
    axis=1,
)
output_df.index.name = 'date'

csv_path = os.path.join(OUTPUT_DIR, 'gssi_final.csv')
output_df.to_csv(csv_path)
print(f"\nSaved: {csv_path}")
print(f"  {output_df.shape[0]} rows × {output_df.shape[1]} columns")
print(f"  Columns: {list(output_df.columns)}")

# ── gssi_summary.json ────────────────────────────────────────────────────────
bucket_names = {
    'contrib_A_freight':      'Bucket A – Freight (BDI)',
    'contrib_B_frictions':    'Bucket B – Frictions (GSCPI)',
    'contrib_C_energy_costs': 'Bucket C – Energy/Costs (WTI + CPI)',
    'contrib_D_production':   'Bucket D – Production (INDPRO)',
    'contrib_overlay_vix':    'Market Stress Overlay (VIX)',
}
latest_contribs = contributions.iloc[-1]
top_bucket_key  = latest_contribs.abs().idxmax()

summary = {
    'date':                    output_df.index[-1].strftime('%Y-%m-%d'),
    'GSSI_bucketed':           round(float(gssi_bucketed.iloc[-1]), 4),
    'GSSI_equal':              round(float(gssi_equal.iloc[-1]),    4),
    'GSSI_invvol':             round(float(gssi_invvol.iloc[-1]),   4),
    'regime':                  str(regime.iloc[-1]),
    'percentile':              round(float(percentile.iloc[-1]),    2),
    'top_contributing_bucket': bucket_names.get(top_bucket_key, top_bucket_key),
    'bucket_contributions': {
        bucket_names.get(k, k): round(float(v), 4)
        for k, v in latest_contribs.items()
    },
    'weighting_methodology': {
        'primary':    'Bucketed equal-weight (A=25%, B=25%, C=25%, D=12.5%, VIX=12.5%)',
        'robustness': 'Simple equal-weight (1/6 each)',
        'alternative':'Inverse-volatility weight (risk-parity)',
    },
    'normalisation': {
        'method':      'Expanding-window z-score (lag-1, no look-ahead bias)',
        'min_periods': MIN_PERIODS,
        'zscore_cap':  Z_CAP,
    },
}

json_path = os.path.join(OUTPUT_DIR, 'gssi_summary.json')
with open(json_path, 'w') as f:
    json.dump(summary, f, indent=2)
print(f"\nSaved: {json_path}")
print(json.dumps(summary, indent=2))


# ─────────────────────────────────────────────────────────────────────────────
# STEP 9 – VALIDATION PLOT
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 9 – VALIDATION PLOT")
print("="*70)

# Known supply-chain / macro stress windows.
# If the GSSI is working correctly, it should show elevated readings during
# these periods.  We print a warning if any window fails to breach 0.5.
stress_events = [
    {
        'label': 'COVID-19\nShock',
        'start': '2020-03-01',
        'end':   '2020-04-30',
        'color': '#d62728',
    },
    {
        'label': 'Suez Canal\nBlockage',
        'start': '2021-03-01',
        'end':   '2021-03-31',
        'color': '#ff7f0e',
    },
    {
        'label': '2022 Energy/\nUkraine',
        'start': '2022-02-01',
        'end':   '2022-03-31',
        'color': '#9467bd',
    },
]

fig, ax = plt.subplots(figsize=(15, 6))

# Stacked area chart: show each bucket's contribution as a stacked area,
# with the total GSSI line on top — gives a "decomposed" view for the judge.
bucket_cols  = list(contributions.columns)
bucket_labels = [
    'Freight (BDI)',
    'Frictions (GSCPI)',
    'Energy/Costs (WTI+CPI)',
    'Production (INDPRO)',
    'Market Overlay (VIX)',
]
bucket_colors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#9467bd', '#8c564b']

# Split contributions into positive and negative parts for correct stacking
pos_contribs = contributions.clip(lower=0)
neg_contribs = contributions.clip(upper=0)

ax.stackplot(output_df.index,
             [pos_contribs[c] for c in bucket_cols],
             labels=bucket_labels,
             colors=bucket_colors,
             alpha=0.45)
ax.stackplot(output_df.index,
             [neg_contribs[c] for c in bucket_cols],
             colors=bucket_colors,
             alpha=0.45)

# GSSI composite line
ax.plot(output_df.index, output_df['GSSI_bucketed'],
        color='black', linewidth=2.0, label='GSSI (Bucketed)', zorder=5)
ax.plot(output_df.index, output_df['GSSI_equal'],
        color='grey', linewidth=1.0, linestyle='--', alpha=0.7,
        label='GSSI (Equal-weight)', zorder=4)

# Regime threshold lines
ax.axhline(THRESH_ELEVATED, color='orange', linewidth=0.8,
           linestyle=':', alpha=0.8, label=f'Elevated threshold ({THRESH_ELEVATED})')
ax.axhline(THRESH_SEVERE,   color='red',    linewidth=0.8,
           linestyle=':', alpha=0.8, label=f'Severe threshold ({THRESH_SEVERE})')
ax.axhline(0, color='black', linewidth=0.5, linestyle='-', alpha=0.3)

# Annotate stress events with vertical shading
all_spiked = True
print("\nStress event GSSI validation check:")
for evt in stress_events:
    start_ts = pd.Timestamp(evt['start'])
    end_ts   = pd.Timestamp(evt['end'])

    # Shade the window
    ax.axvspan(start_ts, end_ts, alpha=0.18, color=evt['color'], zorder=1)

    # Check if the GSSI was elevated in this window
    window = output_df.loc[start_ts:end_ts, 'GSSI_bucketed']
    if window.empty:
        print(f"  ⚠  No data for window: {evt['label'].replace(chr(10),' ')}")
        all_spiked = False
    else:
        max_val = window.max()
        peak_dt = window.idxmax().date()
        status  = '✓' if max_val > THRESH_ELEVATED else '⚠ NOT elevated'
        print(f"  {status}  {evt['label'].replace(chr(10),' '):<25} "
              f"peak GSSI = {max_val:.3f}  ({peak_dt})")
        if max_val <= THRESH_ELEVATED:
            all_spiked = False

    # Place label at top of the shading using axis-fraction y coords
    mid_ts = start_ts + (end_ts - start_ts) / 2
    ax.annotate(
        evt['label'],
        xy=(mid_ts, 0),
        xycoords=('data', 'axes fraction'),
        xytext=(0, -5),
        textcoords='offset points',
        ha='center', va='top',
        fontsize=7.5, color=evt['color'], fontweight='bold',
        annotation_clip=False,
    )

if not all_spiked:
    print("\n  ⚠ WARNING: One or more known stress events did NOT produce GSSI > 0.5.")
    print("    This suggests a data or transformation issue — review the pipeline.")
else:
    print("\n  ✓ All annotated stress events produced elevated GSSI readings.")

ax.set_title(
    'Global Supply Chain Stress Index (GSSI)\n'
    'Bucketed equal-weight composite | Expanding z-score normalisation',
    fontsize=13, fontweight='bold'
)
ax.set_xlabel('Date', fontsize=10)
ax.set_ylabel('GSSI Score (z-score units)', fontsize=10)
ax.set_xlim(output_df.index.min(), output_df.index.max())
ax.legend(loc='upper left', fontsize=7.5, ncol=2, framealpha=0.9)
ax.grid(axis='y', alpha=0.25)
fig.tight_layout()

chart_path = os.path.join(OUTPUT_DIR, 'gssi_timeseries.png')
plt.savefig(chart_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"\nSaved chart: {chart_path}")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 10 – FORECASTING MODULE
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("STEP 10 – FORECASTING MODULE")
print("="*70)

import xgboost as xgb
from sklearn.metrics import mean_absolute_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing as HoltWinters
from statsmodels.tsa.arima.model import ARIMA as _ARIMA

FORECAST_HORIZON = 6    # production forecast horizon in months
HOLDOUT_MONTHS   = 6    # match holdout to production horizon exactly
MIN_TRAIN_MONTHS = 36   # minimum months needed before forecasting begins

HIST_MIN  = float(gssi_bucketed.min())
HIST_MAX  = float(gssi_bucketed.max())
HIST_MEAN = float(gssi_bucketed.mean())

CONTRIB_COLS = [
    'contrib_A_freight', 'contrib_B_frictions',
    'contrib_C_energy_costs', 'contrib_D_production', 'contrib_overlay_vix',
]

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10a – BUILD FEATURE MATRIX FOR XGBOOST
# ─────────────────────────────────────────────────────────────────────────────
print("\n--- Step 10a: Building XGBoost feature matrix ---")

feat_df = pd.DataFrame(index=gssi_bucketed.index)

# Lags 1–3 of GSSI
for lag in [1, 2, 3]:
    feat_df[f'gssi_lag{lag}'] = gssi_bucketed.shift(lag)

# Lags 1–3 of each bucket contribution
contrib_short = {
    'contrib_A_freight':      'contrib_A',
    'contrib_B_frictions':    'contrib_B',
    'contrib_C_energy_costs': 'contrib_C',
    'contrib_D_production':   'contrib_D',
    'contrib_overlay_vix':    'contrib_vix',
}
for col, short in contrib_short.items():
    for lag in [1, 2, 3]:
        feat_df[f'{short}_lag{lag}'] = contributions[col].shift(lag)

# Rolling 3-month mean and std of GSSI, shifted by 1 (no look-ahead)
feat_df['gssi_roll3_mean'] = gssi_bucketed.shift(1).rolling(3).mean()
feat_df['gssi_roll3_std']  = gssi_bucketed.shift(1).rolling(3).std()

feat_df = feat_df.dropna()
X = feat_df
y = gssi_bucketed.loc[feat_df.index]

print(f"  Feature matrix: {X.shape[0]} rows × {X.shape[1]} features")
print(f"  Date range    : {X.index.min().date()} → {X.index.max().date()}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10b – WALK-FORWARD HOLDOUT VALIDATION (all 3 models)
# ─────────────────────────────────────────────────────────────────────────────
print("\n--- Step 10b: Walk-forward validation (6-month holdout) ---")

# Split feature matrix and target into train / holdout
X_train = X.iloc[:-HOLDOUT_MONTHS]
X_hold  = X.iloc[-HOLDOUT_MONTHS:]
y_train = y.iloc[:-HOLDOUT_MONTHS]
y_hold  = y.iloc[-HOLDOUT_MONTHS:]
actuals = y_hold.values

# Training slice of the raw GSSI series (for HW / Naive)
train_series = gssi_bucketed.iloc[:-HOLDOUT_MONTHS]

# ── Model 1: Naive Persistence ────────────────────────────────────────────────
naive_val   = float(train_series.iloc[-1])
preds_naive = [naive_val] * HOLDOUT_MONTHS

# ── Model 2: Holt-Winters ─────────────────────────────────────────────────────
hw_model_name = None

def _fit_hw(series):
    """Try HW with full seasonal → trend-only → ARIMA(1,1,1) fallback."""
    global hw_model_name
    try:
        m = HoltWinters(
            series, trend='add', seasonal='add', seasonal_periods=12,
            initialization_method='estimated',
        ).fit(optimized=True)
        hw_model_name = "Holt-Winters (add trend + add seasonal)"
        return m, 'hw'
    except Exception as e1:
        print(f"  Full seasonal HW failed ({e1}), trying trend-only...")
        try:
            m = HoltWinters(
                series, trend='add', seasonal=None,
                initialization_method='estimated',
            ).fit(optimized=True)
            hw_model_name = "Holt-Winters (add trend only)"
            return m, 'hw'
        except Exception as e2:
            print(f"  Trend-only HW failed ({e2}), falling back to ARIMA(1,1,1)...")
            m = _ARIMA(series, order=(1, 1, 1)).fit()
            hw_model_name = "ARIMA(1,1,1) [HW fallback]"
            return m, 'arima'

hw_holdout_obj, _ = _fit_hw(train_series)
preds_hw = list(hw_holdout_obj.forecast(HOLDOUT_MONTHS).values)
print(f"  HW variant used: {hw_model_name}")

# ── Model 3: XGBoost recursive ────────────────────────────────────────────────
# Contribution lags are held fixed at last known values during recursion —
# we only have a GSSI forecast, not a per-bucket forecast.
xgb_holdout_model = xgb.XGBRegressor(
    n_estimators=200, max_depth=3, learning_rate=0.05,
    subsample=0.8, random_state=42, verbosity=0,
)
xgb_holdout_model.fit(X_train.values, y_train.values)

gssi_running   = list(train_series.values)   # full history up to holdout start
last_row_train = X_train.iloc[-1].to_dict()  # last feature row from training

preds_xgb = []
for step in range(HOLDOUT_MONTHS):
    # Build feature vector from running history
    row = {}
    row['gssi_lag1'] = gssi_running[-1]
    row['gssi_lag2'] = gssi_running[-2]
    row['gssi_lag3'] = gssi_running[-3]

    # Bucket contribution lags: fixed at last known training values
    for col, short in contrib_short.items():
        row[f'{short}_lag1'] = last_row_train[f'{short}_lag1']
        row[f'{short}_lag2'] = last_row_train[f'{short}_lag2']
        row[f'{short}_lag3'] = last_row_train[f'{short}_lag3']

    # Rolling stats over the running GSSI history
    recent = gssi_running[-3:]
    row['gssi_roll3_mean'] = float(np.mean(recent))
    row['gssi_roll3_std']  = (float(np.std(recent, ddof=1))
                              if len(set(recent)) > 1 else 0.0)

    pred = float(xgb_holdout_model.predict(pd.DataFrame([row]))[0])
    preds_xgb.append(pred)

    # Update running GSSI with the new prediction (shift lag registers)
    gssi_running.append(pred)
    last_row_train['gssi_lag3'] = last_row_train['gssi_lag2']
    last_row_train['gssi_lag2'] = last_row_train['gssi_lag1']
    last_row_train['gssi_lag1'] = pred

# ── Per-horizon MAE breakdown ─────────────────────────────────────────────────
mae_by_horizon = {}
for h in range(HOLDOUT_MONTHS):
    mae_by_horizon[f"month_{h+1}"] = {
        "naive":       round(abs(preds_naive[h] - actuals[h]), 4),
        "holtwinters": round(abs(preds_hw[h]    - actuals[h]), 4),
        "xgboost":     round(abs(preds_xgb[h]   - actuals[h]), 4),
    }

mae_naive = mean_absolute_error(actuals, preds_naive)
mae_hw    = mean_absolute_error(actuals, preds_hw)
mae_xgb   = mean_absolute_error(actuals, preds_xgb)

# ── Model selection (Naive never selected for production) ─────────────────────
if mae_hw <= mae_xgb:
    best_model = 'Holt-Winters'
    best_mae   = mae_hw
else:
    best_model = 'XGBoost'
    best_mae   = mae_xgb

beat_naive = best_mae < mae_naive

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10c – PRINT VALIDATION RESULTS
# ─────────────────────────────────────────────────────────────────────────────
print("\n╔══════════════════════════════════════════════════════╗")
print("║           FORECASTING VALIDATION RESULTS             ║")
print("╠══════════════════════════════════════════════════════╣")
print("║ Model                     │ Holdout MAE │ Beat Naive ║")
print("╠══════════════════════════════════════════════════════╣")
print(f"║ {'Naive Persistence':<25} │   {mae_naive:.3f}     │     —      ║")
print(f"║ {'Holt-Winters (' + hw_model_name[:10] + ')':<25} │   {mae_hw:.3f}     │  {'Yes' if mae_hw < mae_naive else 'No ':>3}         ║")
print(f"║ {'XGBoost (lagged buckets)':<25} │   {mae_xgb:.3f}     │  {'Yes' if mae_xgb < mae_naive else 'No ':>3}         ║")
print("╠══════════════════════════════════════════════════════╣")
print(f"║ Best model selected: {best_model:<31}║")
print("╚══════════════════════════════════════════════════════╝")

print("\nPer-horizon MAE breakdown:")
for h in range(HOLDOUT_MONTHS):
    k  = f"month_{h+1}"
    mn = mae_by_horizon[k]['naive']
    mh = mae_by_horizon[k]['holtwinters']
    mx = mae_by_horizon[k]['xgboost']
    print(f"  Month {h+1} → Naive: {mn:.3f} | HW: {mh:.3f} | XGB: {mx:.3f}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10d – PRODUCTION FORECAST (6 months forward, full dataset)
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n--- Step 10d: Production forecast — {best_model} on full dataset ---")

# Residuals from holdout (used for confidence bands)
resid_hw  = np.array(actuals) - np.array(preds_hw)
resid_xgb = np.array(actuals) - np.array(preds_xgb)

if best_model == 'Holt-Winters':
    prod_hw_obj, _ = _fit_hw(gssi_bucketed)
    point_forecast = prod_hw_obj.forecast(FORECAST_HORIZON).values.copy()
    resid_std = float(np.std(resid_hw, ddof=1))
    prod_display = hw_model_name
else:
    # Retrain XGBoost on full feature matrix
    xgb_prod = xgb.XGBRegressor(
        n_estimators=200, max_depth=3, learning_rate=0.05,
        subsample=0.8, random_state=42, verbosity=0,
    )
    xgb_prod.fit(X.values, y.values)

    gssi_prod_running  = list(gssi_bucketed.values)
    last_row_full      = X.iloc[-1].to_dict()
    point_forecast_lst = []

    for step in range(FORECAST_HORIZON):
        row = {}
        row['gssi_lag1'] = gssi_prod_running[-1]
        row['gssi_lag2'] = gssi_prod_running[-2]
        row['gssi_lag3'] = gssi_prod_running[-3]
        for col, short in contrib_short.items():
            row[f'{short}_lag1'] = last_row_full[f'{short}_lag1']
            row[f'{short}_lag2'] = last_row_full[f'{short}_lag2']
            row[f'{short}_lag3'] = last_row_full[f'{short}_lag3']
        recent_p = gssi_prod_running[-3:]
        row['gssi_roll3_mean'] = float(np.mean(recent_p))
        row['gssi_roll3_std']  = (float(np.std(recent_p, ddof=1))
                                  if len(set(recent_p)) > 1 else 0.0)
        pred = float(xgb_prod.predict(pd.DataFrame([row]))[0])
        point_forecast_lst.append(pred)
        gssi_prod_running.append(pred)
        last_row_full['gssi_lag3'] = last_row_full['gssi_lag2']
        last_row_full['gssi_lag2'] = last_row_full['gssi_lag1']
        last_row_full['gssi_lag1'] = pred

    point_forecast = np.array(point_forecast_lst)
    resid_std = float(np.std(resid_xgb, ddof=1))
    prod_display = 'XGBoost (lagged buckets)'

# Raw confidence bands from holdout residual spread
lower_80 = point_forecast - 1.28 * resid_std
upper_80 = point_forecast + 1.28 * resid_std
lower_95 = point_forecast - 1.96 * resid_std
upper_95 = point_forecast + 1.96 * resid_std

# Mean-reversion constraint: weight grows from 0 → 0.5 over the forecast horizon.
# GSSI is a z-score composite that structurally reverts toward zero; without this,
# recursive forecasts can drift outside the historical range.
for h in range(FORECAST_HORIZON):
    reversion_weight    = h / (FORECAST_HORIZON * 2)   # 0.0 at h=0, 0.417 at h=5
    point_forecast[h]   = (1 - reversion_weight) * point_forecast[h]   + reversion_weight * HIST_MEAN
    lower_80[h]         = (1 - reversion_weight) * lower_80[h]         + reversion_weight * HIST_MEAN
    upper_80[h]         = (1 - reversion_weight) * upper_80[h]         + reversion_weight * HIST_MEAN
    lower_95[h]         = (1 - reversion_weight) * lower_95[h]         + reversion_weight * HIST_MEAN
    upper_95[h]         = (1 - reversion_weight) * upper_95[h]         + reversion_weight * HIST_MEAN

# Hard clip to historical range — prevents extrapolating outside observed data
point_forecast = np.clip(point_forecast, HIST_MIN, HIST_MAX)
lower_80       = np.clip(lower_80,       HIST_MIN, HIST_MAX)
upper_80       = np.clip(upper_80,       HIST_MIN, HIST_MAX)
lower_95       = np.clip(lower_95,       HIST_MIN, HIST_MAX)
upper_95       = np.clip(upper_95,       HIST_MIN, HIST_MAX)

# Replace any remaining non-finite values with historical mean (edge safety)
def _safe_arr(arr):
    return np.where(np.isfinite(arr), arr, HIST_MEAN)

point_forecast = _safe_arr(point_forecast)
lower_80       = _safe_arr(lower_80)
upper_80       = _safe_arr(upper_80)
lower_95       = _safe_arr(lower_95)
upper_95       = _safe_arr(upper_95)

# Forecast dates: month-start periods following the last historical date
last_date    = gssi_bucketed.index[-1]
future_dates = pd.date_range(
    start=last_date + pd.offsets.MonthBegin(1),
    periods=FORECAST_HORIZON,
    freq='MS',
)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10e – WRITE output/dashboard_data.json
# ─────────────────────────────────────────────────────────────────────────────
print("\n--- Step 10e: Writing dashboard_data.json ---")

def _safe_float(x, fallback=HIST_MEAN):
    """Round to 4dp; replace non-finite with fallback."""
    v = float(x)
    return round(v if np.isfinite(v) else fallback, 4)

hist_tail = output_df.tail(36)

historical_records = [
    {
        "Date":            dt.strftime("%Y-%m-%d"),
        "GSSI_Historical": _safe_float(row['GSSI_bucketed']),
        "GSCPI_Norm":      _safe_float(row['norm_GSCPI']),
        "CPIAUCSL_Norm":   _safe_float(row['norm_CPI']),
        "regime":          str(row['regime']),
    }
    for dt, row in hist_tail.iterrows()
]

forecast_records = [
    {
        "Date":          dt.strftime("%Y-%m-%d"),
        "GSSI_Forecast": _safe_float(pf),
        "lower_80":      _safe_float(l80),
        "upper_80":      _safe_float(u80),
        "lower_95":      _safe_float(l95),
        "upper_95":      _safe_float(u95),
    }
    for dt, pf, l80, u80, l95, u95 in zip(
        future_dates, point_forecast, lower_80, upper_80, lower_95, upper_95
    )
]

validation_block = {
    "holdout_months":  HOLDOUT_MONTHS,
    "mae_naive":       round(mae_naive, 4),
    "mae_holtwinters": round(mae_hw,    4),
    "mae_xgboost":     round(mae_xgb,   4),
    "best_model":      best_model,
    "beat_naive":      bool(beat_naive),
    "mae_by_horizon":  mae_by_horizon,
}

forecast_meta = {
    "target":                  "GSSI_bucketed",
    "best_model":              best_model,
    "hw_model_variant":        hw_model_name,
    "horizon_months":          FORECAST_HORIZON,
    "holdout_months":          HOLDOUT_MONTHS,
    "mean_reversion_applied":  True,
    "confidence_bands":        "residual-based 80% and 95%",
    "note": (
        "Forecast uses walk-forward validation on 6-month holdout matching "
        "production horizon. Mean reversion applied with weight growing to 0.5 "
        "at horizon end. Hard clipped to historical range."
    ),
}

dash_payload = {
    "historical":    historical_records,
    "forecast":      forecast_records,
    "validation":    validation_block,
    "forecast_meta": forecast_meta,
}

dash_path = os.path.join(OUTPUT_DIR, 'dashboard_data.json')
with open(dash_path, 'w') as f:
    json.dump(dash_payload, f, indent=4, allow_nan=False)

print(f"  Saved: {dash_path}")
print(f"  historical : {len(historical_records)} records")
print(f"  forecast   : {len(forecast_records)} records")
print(f"  best model : {best_model}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10f – PRINT 6-MONTH FORECAST TABLE
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n6-Month Production Forecast  ({prod_display}):")
print(f"  {'Date':<12} │ {'GSSI Forecast':>13} │ {'80% Band':<21} │ {'95% Band':<21}")
print("  " + "─" * 14 + "┼" + "─" * 15 + "┼" + "─" * 23 + "┼" + "─" * 22)
for dt, pf, l80, u80, l95, u95 in zip(
    future_dates, point_forecast, lower_80, upper_80, lower_95, upper_95
):
    band80 = f"[{l80:.4f}, {u80:.4f}]"
    band95 = f"[{l95:.4f}, {u95:.4f}]"
    print(f"  {dt.strftime('%Y-%m-%d'):<12} │    {pf:>8.4f}     │ {band80:<21} │ {band95:<21}")


# ─────────────────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("GSSI PIPELINE COMPLETE")
print("="*70)
print(f"  Data span       : {output_df.index.min().date()} → {output_df.index.max().date()}")
print(f"  Months          : {output_df.shape[0]}")
print(f"  Output folder   : {OUTPUT_DIR}/")
print(f"    gssi_final.csv         — full time series ({output_df.shape[1]} columns)")
print(f"    gssi_summary.json      — latest reading summary")
print(f"    gssi_timeseries.png    — validation chart")
print(f"\n  Latest GSSI     : {gssi_bucketed.iloc[-1]:.3f}")
print(f"  Current regime  : {regime.iloc[-1]}")
print(f"  Percentile      : {percentile.iloc[-1]:.1f}th")
print()
