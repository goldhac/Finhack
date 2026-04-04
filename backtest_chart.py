#!/usr/bin/env python3
"""
GSSI Walk-Forward Backtest Chart
=================================
For each of 2022, 2023, 2024, 2025: train Holt-Winters on all data
up to the start of that year, forecast 12 months forward, and compare
to the actuals.  Saves output/backtest_chart.html.
"""

import os
import json
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from statsmodels.tsa.holtwinters import ExponentialSmoothing as HoltWinters
from statsmodels.tsa.arima.model import ARIMA

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')

df = pd.read_csv(
    os.path.join(OUTPUT_DIR, 'gssi_final.csv'),
    parse_dates=['date'],
).set_index('date').sort_index()

gssi = df['GSSI_bucketed']

# ── Forecast origins: the last month-end before each calendar year ────────────
ORIGINS = {
    2022: '2021-12-31',
    2023: '2022-12-31',
    2024: '2023-12-31',
    2025: '2024-12-31',
}
HORIZON   = 12
COLORS    = {2022: '#d62728', 2023: '#ff7f0e', 2024: '#1f77b4', 2025: '#9467bd'}

# ── Helper: fit Holt-Winters (with fallbacks) ─────────────────────────────────
def fit_hw(series):
    try:
        return HoltWinters(
            series, trend='add', seasonal='add', seasonal_periods=12,
            initialization_method='estimated',
        ).fit(optimized=True)
    except Exception:
        try:
            return HoltWinters(
                series, trend='add', seasonal=None,
                initialization_method='estimated',
            ).fit(optimized=True)
        except Exception:
            return ARIMA(series, order=(1, 1, 1)).fit()

# ── Run walk-forward forecasts ────────────────────────────────────────────────
results = {}
for year, origin_date in ORIGINS.items():
    origin_ts = pd.Timestamp(origin_date)
    train     = gssi.loc[:origin_ts]
    model     = fit_hw(train)
    raw_preds = model.forecast(HORIZON).values

    forecast_dates = pd.date_range(
        start=origin_ts + pd.offsets.MonthEnd(1),
        periods=HORIZON, freq='ME',
    )
    forecast_s = pd.Series(raw_preds, index=forecast_dates, name='forecast')

    # Actual values over the same window (may be shorter for 2025)
    actual_s = gssi.loc[forecast_dates[0]:forecast_dates[-1]]
    overlap  = forecast_s.loc[actual_s.index]

    mae = float(np.mean(np.abs(overlap.values - actual_s.values))) if len(actual_s) else None

    results[year] = {
        'origin':    origin_ts,
        'forecast':  forecast_s,
        'actual':    actual_s,
        'mae':       mae,
        'n_actual':  len(actual_s),
    }
    print(f"{year}: trained on {len(train)} months → "
          f"forecast {len(forecast_s)} months | "
          f"actual overlap {len(actual_s)} months | "
          f"MAE = {mae:.3f}" if mae else f"{year}: MAE = N/A")

# ── Build Plotly figure ───────────────────────────────────────────────────────
fig = go.Figure()

# Actual GSSI — show 2020 onwards for context
actual_window = gssi.loc['2020-01-01':]
fig.add_trace(go.Scatter(
    x=actual_window.index, y=actual_window.values,
    name='GSSI Actual', mode='lines',
    line=dict(color='black', width=2.5),
    hovertemplate='<b>Actual</b><br>%{x|%b %Y}<br>GSSI = %{y:.3f}<extra></extra>',
))

# For each year: forecast line + shaded error band + MAE annotation
for year, r in results.items():
    color  = COLORS[year]
    fcast  = r['forecast']
    actual = r['actual']

    # Anchor the forecast line to the last actual point so it connects
    anchor_date  = r['origin']
    anchor_val   = float(gssi.loc[anchor_date])
    x_line = [anchor_date] + list(fcast.index)
    y_line = [anchor_val]  + list(fcast.values)

    fig.add_trace(go.Scatter(
        x=x_line, y=y_line,
        name=f'{year} Forecast (MAE={r["mae"]:.3f})' if r['mae'] else f'{year} Forecast',
        mode='lines+markers',
        line=dict(color=color, width=1.8, dash='dot'),
        marker=dict(size=5, color=color),
        hovertemplate=(f'<b>{year} Forecast</b><br>'
                       '%{x|%b %Y}<br>GSSI = %{y:.3f}<extra></extra>'),
    ))

    # Error bars: shaded band between forecast and actual
    if len(actual) > 0:
        shared_idx = fcast.loc[actual.index]
        upper = np.maximum(shared_idx.values, actual.values)
        lower = np.minimum(shared_idx.values, actual.values)

        h = color.lstrip('#')
        r_c, g_c, b_c = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
        fig.add_trace(go.Scatter(
            x=list(actual.index) + list(actual.index[::-1]),
            y=list(upper) + list(lower[::-1]),
            fill='toself',
            fillcolor=f'rgba({r_c},{g_c},{b_c},0.12)',
            line=dict(width=0),
            showlegend=False,
            hoverinfo='skip',
        ))

        # MAE annotation at end of forecast window
        fig.add_annotation(
            x=actual.index[-1],
            y=float(fcast.iloc[len(actual)-1]),
            text=f'MAE={r["mae"]:.3f}',
            showarrow=True,
            arrowhead=2,
            arrowcolor=color,
            ax=30, ay=-20,
            font=dict(size=9, color=color),
            bgcolor='white',
            bordercolor=color,
            borderwidth=1,
        )

# Regime threshold lines
for level, label, lcolor in [(0.5, 'Elevated (0.5)', '#f0a500'),
                              (1.5, 'Severe (1.5)',   '#cc0000')]:
    fig.add_hline(
        y=level,
        line=dict(color=lcolor, width=1, dash='dot'),
        annotation_text=label,
        annotation_position='right',
        annotation_font=dict(size=9, color=lcolor),
    )
fig.add_hline(y=0, line=dict(color='black', width=0.5, dash='dot'))

# Vertical lines at each forecast origin
for year, r in results.items():
    fig.add_vline(
        x=str(r['origin'].date()),
        line=dict(color=COLORS[year], width=0.8, dash='dash'),
    )

# ── Layout ────────────────────────────────────────────────────────────────────
mae_summary = '  |  '.join(
    f"{yr}: MAE={r['mae']:.3f}" for yr, r in results.items() if r['mae']
)
fig.update_layout(
    title=dict(
        text=(
            '<b>GSSI Walk-Forward Backtest: Forecast vs Actual (2022–2025)</b><br>'
            f'<sup>Holt-Winters 12-month horizon | {mae_summary}</sup>'
        ),
        font=dict(size=16),
        x=0.5, xanchor='center',
    ),
    height=600,
    template='plotly_white',
    hovermode='x unified',
    xaxis=dict(title='Date'),
    yaxis=dict(title='GSSI Score'),
    legend=dict(
        orientation='h', yanchor='bottom', y=-0.18,
        xanchor='center', x=0.5, font=dict(size=10),
    ),
    paper_bgcolor='white',
    plot_bgcolor='#fafafa',
)

out_path = os.path.join(OUTPUT_DIR, 'backtest_chart.html')
fig.write_html(
    out_path,
    include_plotlyjs='cdn',
    full_html=True,
    config={
        'scrollZoom': True,
        'displayModeBar': True,
        'toImageButtonOptions': {'format': 'png', 'width': 1400, 'height': 600},
    },
)
print(f"\nSaved: {out_path}")
