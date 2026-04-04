import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing

print("Starting GSSI Data Pipeline...")

# Resolve paths from this file so runs work from any working directory
ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

# 1. Load Data
# Supply Chain (NY Fed export: skip metadata rows after header)
gscpi = pd.read_csv(DATA / "GSCPI.csv", skiprows=[1, 2, 3, 4], usecols=[0, 1])
gscpi.columns = ["Date", "GSCPI"]
gscpi["GSCPI"] = pd.to_numeric(gscpi["GSCPI"], errors="coerce")
gscpi = gscpi.dropna(subset=["Date", "GSCPI"])
gscpi["Date"] = pd.to_datetime(gscpi["Date"], dayfirst=True).dt.to_period("M")

# Inflation (FRED monthly)
cpi = pd.read_csv(DATA / "CPIAUCSL.csv")
cpi["Date"] = pd.to_datetime(cpi["observation_date"]).dt.to_period("M")
cpi = cpi[["Date", "CPIAUCSL"]]

# Crude oil (FRED monthly)
wti = pd.read_csv(DATA / "WTISPLC.csv")
wti["Date"] = pd.to_datetime(wti["observation_date"]).dt.to_period("M")
wti = wti[["Date", "WTISPLC"]]

# VIX (FRED monthly)
vix = pd.read_csv(DATA / "VIXCLS.csv")
vix["VIXCLS"] = pd.to_numeric(vix["VIXCLS"], errors="coerce")
vix = vix.dropna(subset=["VIXCLS"])
vix["Date"] = pd.to_datetime(vix["observation_date"]).dt.to_period("M")
vix = vix[["Date", "VIXCLS"]]

# 2. Merge everything by month (inner = complete cases only)
df = gscpi.merge(cpi, on="Date").merge(wti, on="Date").merge(vix, on="Date")
df = df.dropna(subset=["GSCPI", "CPIAUCSL", "WTISPLC", "VIXCLS"])

# 3. Normalize to a 0-100 scale (min–max over full merged history)
cols = ["GSCPI", "CPIAUCSL", "WTISPLC", "VIXCLS"]
for col in cols:
    min_val = df[col].min()
    max_val = df[col].max()
    df[f"{col}_Norm"] = ((df[col] - min_val) / (max_val - min_val)) * 100

# 4. Weighted GSSI (real composite from your four inputs — not dummy)
df["GSSI_Historical"] = (
    df["GSCPI_Norm"] * 0.4
    + df["CPIAUCSL_Norm"] * 0.2
    + df["WTISPLC_Norm"] * 0.2
    + df["VIXCLS_Norm"] * 0.2
)
df = df[np.isfinite(df["GSSI_Historical"])].copy()

# --- Time series for forecasting (monthly, ordered) ---
_ts = df["Date"].dt.to_timestamp()
y = pd.Series(
    df["GSSI_Historical"].astype(float).values,
    index=pd.DatetimeIndex(_ts),
    name="GSSI",
)
y = y.sort_index()

HORIZON = 6
HOLDOUT = 12  # months held back to score the model


def _fit_forecast_hw_seasonal(series: pd.Series, steps: int) -> np.ndarray:
    """Holt–Winters with yearly seasonality (monthly data)."""
    fit = ExponentialSmoothing(
        series,
        trend="add",
        seasonal="add",
        seasonal_periods=12,
        initialization_method="estimated",
    ).fit(optimized=True)
    return fit.forecast(steps)


def _fit_forecast_hw_trend(series: pd.Series, steps: int) -> np.ndarray:
    """Double exponential smoothing (trend, no seasonality)."""
    fit = ExponentialSmoothing(
        series, trend="add", seasonal=None, initialization_method="estimated"
    ).fit(optimized=True)
    return fit.forecast(steps)


def _fit_forecast_arima(series: pd.Series, steps: int) -> np.ndarray:
    fit = ARIMA(series, order=(1, 1, 1)).fit()
    return fit.forecast(steps)


def _finite_forecast(fc) -> np.ndarray:
    a = np.asarray(fc, dtype=float)
    return a


def forecast_series(series: pd.Series, steps: int) -> tuple[np.ndarray, str]:
    """Return (point forecasts, model name). Tries HW seasonal → HW trend → ARIMA.

    Holt–Winters can fail to converge; we fall back whenever forecasts are non-finite.
    """
    if len(series) >= 24:
        try:
            fc = _finite_forecast(_fit_forecast_hw_seasonal(series, steps))
            if np.all(np.isfinite(fc)):
                return fc, "HoltWinters(add trend, add seasonal, m=12)"
        except Exception:
            pass
        try:
            fc = _finite_forecast(_fit_forecast_hw_trend(series, steps))
            if np.all(np.isfinite(fc)):
                return fc, "HoltWinters(add trend, no seasonal)"
        except Exception:
            pass

    fc = _finite_forecast(_fit_forecast_arima(series, steps))
    return fc, "ARIMA(1,1,1)"


# 5a. Optional backtest: train on all but last HOLDOUT months, forecast HOLDOUT, report MAE
holdout_mae = None
holdout_model = None
if len(y) > HOLDOUT + 24:
    train = y.iloc[:-HOLDOUT]
    test = y.iloc[-HOLDOUT:]
    try:
        pred, holdout_model = forecast_series(train, HOLDOUT)
        err = np.abs(pred - test.values)
        if np.all(np.isfinite(err)):
            holdout_mae = float(np.mean(err))
        else:
            holdout_mae = None
            holdout_model = None
    except Exception:
        holdout_mae = None
        holdout_model = None

# 5b. Production forecast: fit on full history, next HORIZON months
fc_values, model_name = forecast_series(y, HORIZON)
last_ts = y.index[-1]
future_index = pd.date_range(
    start=last_ts + pd.offsets.MonthBegin(1), periods=HORIZON, freq="MS"
)

future_data = [
    {"Date": str(ts.date()), "GSSI_Forecast": round(float(v), 2)}
    for ts, v in zip(future_index, fc_values)
]

# 6. Export for dashboard (string dates for JSON)
df["Date"] = df["Date"].dt.to_timestamp().dt.strftime("%Y-%m-%d")

historical_json = df.tail(36)[
    ["Date", "GSSI_Historical", "GSCPI_Norm", "CPIAUCSL_Norm"]
].round(2).to_dict(orient="records")

def _json_float(x):
    if x is None:
        return None
    if isinstance(x, (float, np.floating)) and not math.isfinite(float(x)):
        return None
    return x


final_payload = {
    "historical": historical_json,
    "forecast": future_data,
    "forecast_meta": {
        "target": "GSSI_Historical",
        "model": model_name,
        "horizon_months": HORIZON,
        "holdout_months": HOLDOUT,
        "holdout_mae": _json_float(holdout_mae),
        "holdout_model": holdout_model,
        "note": "GSSI is a weighted min-max composite of GSCPI, CPI, WTI, VIX; forecast is fit on GSSI only.",
    },
}

out_path = ROOT / "dashboard_data.json"
with open(out_path, "w") as f:
    json.dump(final_payload, f, indent=4, allow_nan=False)

print(f"Pipeline complete. Wrote {out_path}")
if holdout_mae is not None:
    print(f"Holdout MAE ({HOLDOUT} mo, {holdout_model}): {holdout_mae:.3f}")
print(f"Forecast model: {model_name}")
