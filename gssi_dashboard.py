#!/usr/bin/env python3
"""
GSSI Interactive Dashboard  —  gssi_dashboard.py
=================================================
Reads output/gssi_final.csv and renders an interactive Plotly dashboard
saved as output/gssi_dashboard.html.

Run with:  python3 gssi_dashboard.py
"""

import os
import json
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ─────────────────────────────────────────────────────────────────────────────
# Load data
# ─────────────────────────────────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')

df = pd.read_csv(os.path.join(OUTPUT_DIR, 'gssi_final.csv'), parse_dates=['date'])
df = df.set_index('date').sort_index()

with open(os.path.join(OUTPUT_DIR, 'gssi_summary.json')) as f:
    summary = json.load(f)

with open(os.path.join(OUTPUT_DIR, 'dashboard_data.json')) as f:
    dash_data = json.load(f)

# Build forecast DataFrame — prepend the last historical point so the line
# connects seamlessly to the GSSI_bucketed trace.
_last = df[['GSSI_bucketed']].iloc[[-1]].copy()
_last.columns = ['GSSI_Forecast']
_fcast_rows = pd.DataFrame(dash_data['forecast']).assign(
    date=lambda x: pd.to_datetime(x['Date'])
).set_index('date')[['GSSI_Forecast']]
forecast_df = pd.concat([_last.rename_axis('date'), _fcast_rows])

fcast_meta   = dash_data['forecast_meta']
best_model   = fcast_meta['best_model']
mae_hw       = fcast_meta['holdout_mae_holtwinters']
mae_xgb      = fcast_meta['holdout_mae_xgboost']
mae_naive    = fcast_meta['holdout_mae_naive']

# ─────────────────────────────────────────────────────────────────────────────
# Colours & constants
# ─────────────────────────────────────────────────────────────────────────────
BUCKET_COLS   = [
    'contrib_A_freight',
    'contrib_B_frictions',
    'contrib_C_energy_costs',
    'contrib_D_production',
    'contrib_overlay_vix',
]
BUCKET_LABELS = [
    'Freight (BDI)',
    'Frictions (GSCPI)',
    'Energy / Costs (WTI + CPI)',
    'Production (INDPRO)',
    'Market Overlay (VIX)',
]
BUCKET_COLORS = ['#1f77b4', '#2ca02c', '#ff7f0e', '#9467bd', '#e377c2']

NORM_COLS = ['norm_BDI', 'norm_GSCPI', 'norm_WTI', 'norm_CPI', 'norm_INDPRO', 'norm_VIX']
NORM_LABELS = ['BDI', 'GSCPI', 'WTI', 'CPI', 'INDPRO', 'VIX']
NORM_COLORS = ['#1f77b4', '#2ca02c', '#ff7f0e', '#8c564b', '#9467bd', '#e377c2']


def hex_to_rgba(hex_color, alpha=0.35):
    """Convert a hex color string to an rgba() string for Plotly."""
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f'rgba({r},{g},{b},{alpha})'

REGIME_COLORS = {'Normal': '#d4edda', 'Elevated': '#fff3cd', 'Severe': '#f8d7da'}

STRESS_EVENTS = [
    {'label': 'COVID-19 Shock',        'start': '2020-03-01', 'end': '2020-04-30'},
    {'label': 'Suez Canal Blockage',   'start': '2021-03-01', 'end': '2021-03-31'},
    {'label': '2022 Energy / Ukraine', 'start': '2022-02-01', 'end': '2022-03-31'},
]
EVENT_COLORS = ['#d62728', '#ff7f0e', '#9467bd']

# ─────────────────────────────────────────────────────────────────────────────
# Layout: 3 rows
#   Row 1 (tall)  — GSSI composite + stacked bucket contributions
#   Row 2 (medium)— All 6 normalised indicators
#   Row 3 (short) — Regime band + percentile
# ─────────────────────────────────────────────────────────────────────────────
fig = make_subplots(
    rows=3, cols=1,
    shared_xaxes=True,
    row_heights=[0.50, 0.30, 0.20],
    vertical_spacing=0.04,
    subplot_titles=[
        'GSSI Composite Score with Bucket Contributions',
        'Normalised Indicators (expanding z-score)',
        'Stress Regime & Historical Percentile',
    ],
)

# ─────────────────────────────────────────────────────────────────────────────
# ROW 1  —  Stacked area contributions + GSSI lines
# ─────────────────────────────────────────────────────────────────────────────

# Stacked positive contributions (each bucket adds to the stack above)
for col, label, color in zip(BUCKET_COLS, BUCKET_LABELS, BUCKET_COLORS):
    pos = df[col].clip(lower=0)
    fig.add_trace(
        go.Scatter(
            x=df.index, y=pos,
            name=label,
            mode='lines',
            line=dict(width=0.5, color=color),
            fillcolor=hex_to_rgba(color, 0.35),
            fill='tonexty' if col != BUCKET_COLS[0] else 'tozeroy',
            stackgroup='pos',
            legendgroup=label,
            showlegend=True,
            hovertemplate=(f'<b>{label}</b><br>%{{x|%b %Y}}<br>'
                           f'Contribution: %{{y:.3f}}<extra></extra>'),
        ),
        row=1, col=1,
    )

# Stacked negative contributions
for col, label, color in zip(BUCKET_COLS, BUCKET_LABELS, BUCKET_COLORS):
    neg = df[col].clip(upper=0)
    fig.add_trace(
        go.Scatter(
            x=df.index, y=neg,
            name=label,
            mode='lines',
            line=dict(width=0.5, color=color),
            fillcolor=hex_to_rgba(color, 0.35),
            fill='tonexty' if col != BUCKET_COLS[0] else 'tozeroy',
            stackgroup='neg',
            legendgroup=label,
            showlegend=False,
            hovertemplate=(f'<b>{label}</b><br>%{{x|%b %Y}}<br>'
                           f'Contribution: %{{y:.3f}}<extra></extra>'),
        ),
        row=1, col=1,
    )

# GSSI bucketed (primary — bold black)
fig.add_trace(
    go.Scatter(
        x=df.index, y=df['GSSI_bucketed'],
        name='GSSI (Bucketed)', mode='lines',
        line=dict(color='black', width=2.5),
        hovertemplate='<b>GSSI (Bucketed)</b><br>%{x|%b %Y}<br>%{y:.3f}<extra></extra>',
    ),
    row=1, col=1,
)

# GSSI equal-weight (robustness — dashed grey)
fig.add_trace(
    go.Scatter(
        x=df.index, y=df['GSSI_equal'],
        name='GSSI (Equal-weight)', mode='lines',
        line=dict(color='#888888', width=1.2, dash='dash'),
        hovertemplate='<b>GSSI (Equal-wt)</b><br>%{x|%b %Y}<br>%{y:.3f}<extra></extra>',
    ),
    row=1, col=1,
)

# 6-month forecast (dashed teal, connects from last historical point)
fig.add_trace(
    go.Scatter(
        x=forecast_df.index, y=forecast_df['GSSI_Forecast'],
        name=f'Forecast ({best_model})', mode='lines+markers',
        line=dict(color='#17becf', width=2.0, dash='dot'),
        marker=dict(size=6, symbol='circle', color='#17becf'),
        hovertemplate='<b>Forecast</b><br>%{x|%b %Y}<br>GSSI = %{y:.2f}<extra></extra>',
    ),
    row=1, col=1,
)

# Vertical line at forecast start
_forecast_start = str(df.index[-1].date())
fig.add_vline(
    x=_forecast_start,
    line=dict(color='#17becf', width=1.2, dash='dash'),
    row=1, col=1,
)
fig.add_annotation(
    x=_forecast_start,
    y=1.01,
    yref='paper',
    text='Forecast →',
    showarrow=False,
    font=dict(size=9, color='#17becf'),
    xanchor='left',
)

# Threshold lines (Elevated / Severe)
for level, label, color in [(0.5, 'Elevated (0.5)', '#f0a500'),
                             (1.5, 'Severe (1.5)',   '#cc0000')]:
    fig.add_hline(
        y=level,
        line=dict(color=color, width=1, dash='dot'),
        annotation_text=label,
        annotation_position='right',
        annotation_font=dict(size=10, color=color),
        row=1, col=1,
    )

# Zero line
fig.add_hline(y=0, line=dict(color='black', width=0.5, dash='dot'), row=1, col=1)

# ─────────────────────────────────────────────────────────────────────────────
# ROW 2  —  Individual normalised indicators
# ─────────────────────────────────────────────────────────────────────────────
for col, label, color in zip(NORM_COLS, NORM_LABELS, NORM_COLORS):
    fig.add_trace(
        go.Scatter(
            x=df.index, y=df[col],
            name=label, mode='lines',
            line=dict(color=color, width=1.2),
            legendgroup=f'ind_{label}',
            showlegend=True,
            hovertemplate=(f'<b>{label}</b><br>%{{x|%b %Y}}<br>'
                           f'z-score: %{{y:.2f}}<extra></extra>'),
        ),
        row=2, col=1,
    )

fig.add_hline(y=0, line=dict(color='black', width=0.5, dash='dot'), row=2, col=1)

# ─────────────────────────────────────────────────────────────────────────────
# ROW 3  —  Percentile bar + regime colour band
# ─────────────────────────────────────────────────────────────────────────────

# Colour-coded regime bar (thin bar chart, each month coloured by regime)
regime_color_map = {'Normal': '#28a745', 'Elevated': '#ffc107', 'Severe': '#dc3545'}
for regime_val, hex_color in regime_color_map.items():
    mask = df['regime'] == regime_val
    fig.add_trace(
        go.Bar(
            x=df.index[mask],
            y=[1] * mask.sum(),
            name=f'Regime: {regime_val}',
            marker_color=hex_color,
            marker_line_width=0,
            width=25 * 24 * 3600 * 1000,   # ~25 days in milliseconds
            legendgroup=f'regime_{regime_val}',
            showlegend=True,
            hovertemplate=(f'<b>Regime: {regime_val}</b><br>'
                           f'%{{x|%b %Y}}<extra></extra>'),
            yaxis='y3',
        ),
        row=3, col=1,
    )

# Percentile line (secondary y-axis on row 3)
fig.add_trace(
    go.Scatter(
        x=df.index, y=df['percentile'],
        name='Percentile (historical)', mode='lines',
        line=dict(color='#333333', width=1.5),
        hovertemplate='<b>Percentile</b><br>%{x|%b %Y}<br>%{y:.1f}th<extra></extra>',
        yaxis='y5',
    ),
    row=3, col=1,
)

# ─────────────────────────────────────────────────────────────────────────────
# Annotate stress events on ALL rows
# ─────────────────────────────────────────────────────────────────────────────
for evt, ecolor in zip(STRESS_EVENTS, EVENT_COLORS):
    for row in [1, 2, 3]:
        fig.add_vrect(
            x0=evt['start'], x1=evt['end'],
            fillcolor=ecolor, opacity=0.12,
            line_width=0,
            row=row, col=1,
        )
    # Label only on row 1
    fig.add_annotation(
        x=evt['start'],
        y=1.04,
        yref='paper',
        text=evt['label'],
        showarrow=False,
        font=dict(size=9, color=ecolor),
        xanchor='left',
        textangle=-20,
    )

# ─────────────────────────────────────────────────────────────────────────────
# Current reading callout (annotation on row 1)
# ─────────────────────────────────────────────────────────────────────────────
latest_date  = df.index[-1]
latest_gssi  = df['GSSI_bucketed'].iloc[-1]
latest_regime = df['regime'].iloc[-1]
latest_pct   = df['percentile'].iloc[-1]

fig.add_annotation(
    x=latest_date,
    y=latest_gssi,
    text=(f"<b>Latest ({latest_date.strftime('%b %Y')})</b><br>"
          f"GSSI = {latest_gssi:.2f}<br>"
          f"Regime: {latest_regime}<br>"
          f"Pctile: {latest_pct:.0f}th"),
    showarrow=True,
    arrowhead=2,
    ax=-90, ay=-50,
    bgcolor='white',
    bordercolor='black',
    borderwidth=1,
    font=dict(size=10),
    row=1, col=1,
)

# ─────────────────────────────────────────────────────────────────────────────
# Global layout
# ─────────────────────────────────────────────────────────────────────────────
fig.update_layout(
    title=dict(
        text=(
            '<b>Global Supply Chain Stress Index (GSSI)</b><br>'
            '<sup>Bucketed equal-weight | Expanding z-score | Feb 2001 – Feb 2026 '
            f'| 6-month forecast via {best_model} '
            f'(holdout MAE: HW={mae_hw:.3f}, XGB={mae_xgb:.3f}, Naive={mae_naive:.3f})</sup>'
        ),
        font=dict(size=18),
        x=0.5,
        xanchor='center',
    ),
    height=900,
    template='plotly_white',
    hovermode='x unified',
    legend=dict(
        orientation='h',
        yanchor='bottom',
        y=-0.12,
        xanchor='center',
        x=0.5,
        font=dict(size=10),
        tracegroupgap=8,
    ),
    barmode='overlay',
    paper_bgcolor='white',
    plot_bgcolor='#fafafa',
)

# Y-axis labels
fig.update_yaxes(title_text='GSSI Score', row=1, col=1)
fig.update_yaxes(title_text='z-score',    row=2, col=1)
fig.update_yaxes(
    title_text='Regime',
    showticklabels=False,
    range=[0, 1.2],
    row=3, col=1,
)

# Secondary y-axis for percentile in row 3
fig.update_layout(
    yaxis5=dict(
        title='Percentile',
        overlaying='y3',
        side='right',
        range=[0, 100],
        showgrid=False,
        ticksuffix='th',
    )
)

# ─────────────────────────────────────────────────────────────────────────────
# Save
# ─────────────────────────────────────────────────────────────────────────────
out_path = os.path.join(OUTPUT_DIR, 'gssi_dashboard.html')
fig.write_html(
    out_path,
    include_plotlyjs='cdn',
    full_html=True,
    config={
        'scrollZoom': True,
        'displayModeBar': True,
        'modeBarButtonsToRemove': ['lasso2d', 'select2d'],
        'toImageButtonOptions': {'format': 'png', 'width': 1600, 'height': 900},
    },
)
print(f"Saved: {out_path}")
