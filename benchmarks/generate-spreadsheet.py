#!/usr/bin/env python3
"""
Generates a comprehensive, multi-sheet Excel / Google Sheets workbook
(benchmarks/results/Benchmark_Results_and_Charts.xlsx) containing:
  1. 'Charts & Comparison': Clean tables for FCP, LCP, TBT, Speed Index,
     Normalized LCP (S_N = LCP_N / LCP_10), and Calibrated LCP (k_hw = 1.170),
     with 5 native editable Line Charts positioned alongside the data tables.
  2. 'Own Summary (Mean & SD)': Complete summary statistics (mean, std dev,
     median, payload sizes, DOM nodes) for Astro Islands and Next.js SSG.
  3. 'Raw Runs (70 Measurements)': All 70 individual Google Lighthouse runs.
"""

import json
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import LineChart, BarChart, Reference

ROOT = Path(__file__).resolve().parent
RESULTS_DIR = ROOT / "results"
RAW_JSON = RESULTS_DIR / "raw-runs.json"
OUT_XLSX = RESULTS_DIR / "Benchmark_Results_and_Charts.xlsx"

# Reference data from Fahrudin et al. (2025) [Ref 17], Table III
FAHRUDIN_REF = {
    "blade-ssr": {
        10: {"fcp_s": 0.4, "lcp_s": 0.4, "tbt_ms": 0, "si_s": 0.4, "cls": 0.004},
        50: {"fcp_s": 0.3, "lcp_s": 0.3, "tbt_ms": 0, "si_s": 0.3, "cls": 0.004},
        100: {"fcp_s": 0.3, "lcp_s": 0.3, "tbt_ms": 0, "si_s": 0.5, "cls": 0.004},
        500: {"fcp_s": 0.2, "lcp_s": 0.4, "tbt_ms": 210, "si_s": 0.9, "cls": 0.006},
        1000: {"fcp_s": 0.3, "lcp_s": 0.5, "tbt_ms": 510, "si_s": 1.5, "cls": 0.006},
        5000: {"fcp_s": 0.8, "lcp_s": 1.5, "tbt_ms": 1710, "si_s": 4.5, "cls": 0.006},
        10000: {"fcp_s": 1.6, "lcp_s": 3.1, "tbt_ms": 4860, "si_s": 5.5, "cls": 0.005},
    },
    "react-csr": {
        10: {"fcp_s": 0.3, "lcp_s": 0.6, "tbt_ms": 0, "si_s": 0.5, "cls": 0.011},
        50: {"fcp_s": 0.3, "lcp_s": 0.6, "tbt_ms": 0, "si_s": 0.5, "cls": 0.003},
        100: {"fcp_s": 0.3, "lcp_s": 0.6, "tbt_ms": 0, "si_s": 0.7, "cls": 0.003},
        500: {"fcp_s": 0.4, "lcp_s": 0.6, "tbt_ms": 0, "si_s": 0.7, "cls": 0.003},
        1000: {"fcp_s": 0.3, "lcp_s": 0.8, "tbt_ms": 60, "si_s": 0.9, "cls": 0.003},
        5000: {"fcp_s": 0.3, "lcp_s": 1.9, "tbt_ms": 560, "si_s": 1.9, "cls": 0.003},
        10000: {"fcp_s": 0.3, "lcp_s": 5.8, "tbt_ms": 650, "si_s": 3.5, "cls": 0.003},
    },
    "vue-csr": {
        10: {"fcp_s": 0.4, "lcp_s": 0.5, "tbt_ms": 0, "si_s": 0.4, "cls": 0.011},
        50: {"fcp_s": 0.3, "lcp_s": 0.6, "tbt_ms": 0, "si_s": 0.5, "cls": 0.003},
        100: {"fcp_s": 0.3, "lcp_s": 0.6, "tbt_ms": 0, "si_s": 0.6, "cls": 0.003},
        500: {"fcp_s": 0.3, "lcp_s": 0.8, "tbt_ms": 30, "si_s": 0.6, "cls": 0.003},
        1000: {"fcp_s": 0.4, "lcp_s": 0.9, "tbt_ms": 60, "si_s": 0.9, "cls": 0.003},
        5000: {"fcp_s": 0.3, "lcp_s": 1.8, "tbt_ms": 480, "si_s": 1.5, "cls": 0.003},
        10000: {"fcp_s": 0.3, "lcp_s": 4.9, "tbt_ms": 930, "si_s": 4.3, "cls": 0.003},
    },
}

STAGES = [10, 50, 100, 500, 1000, 5000, 10000]
K_HW = 1.170


def mean(vals):
    return sum(vals) / len(vals) if vals else 0.0


def stddev(vals):
    if len(vals) <= 1:
        return 0.0
    m = mean(vals)
    return (sum((x - m) ** 2 for x in vals) / (len(vals) - 1)) ** 0.5


def style_range(ws, min_col, min_row, max_col, max_row, font=None, fill=None, border=None, alignment=None, num_format=None):
    for row in ws.iter_rows(min_row=min_row, max_row=max_row, min_col=min_col, max_col=max_col):
        for cell in row:
            if font:
                cell.font = font
            if fill:
                cell.fill = fill
            if border:
                cell.border = border
            if alignment:
                cell.alignment = alignment
            if num_format:
                cell.number_format = num_format


def main():
    payload = json.loads(RAW_JSON.read_text(encoding="utf-8"))
    runs = payload["runs"]

    # Group runs by (architectureId, stage)
    grouped = {}
    for r in runs:
        grouped.setdefault((r["architectureId"], int(r["stage"])), []).append(r)

    def get_own_mean(arch_id, stage, metric):
        items = grouped.get((arch_id, stage), [])
        return round(mean([x[metric] for x in items]), 4 if metric == "cls" else 3)

    def get_own_sd(arch_id, stage, metric):
        items = grouped.get((arch_id, stage), [])
        return round(stddev([x[metric] for x in items]), 4 if metric == "cls" else 3)

    wb = Workbook()

    # Common styles
    title_font = Font(name="Arial", size=14, bold=True, color="0F172A")
    section_font = Font(name="Arial", size=11, bold=True, color="0F172A")
    header_font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    sub_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    data_font = Font(name="Arial", size=10, color="0F172A")
    bold_font = Font(name="Arial", size=10, bold=True, color="0F172A")
    thin_side = Side(style="thin", color="CBD5E1")
    thin_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    center_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
    right_align = Alignment(horizontal="right", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")

    # =========================================================================
    # SHEET 1: Charts & Comparison (Editable Tables + Native Charts)
    # =========================================================================
    ws1 = wb.active
    ws1.title = "Charts & Comparison"
    ws1.views.sheetView[0].showGridLines = True

    ws1["A1"] = "Web Application Architecture Performance — Empirical Results & Editable Charts (Team B - Gruppe 4)"
    ws1["A1"].font = title_font
    ws1["A2"] = "All charts on the right (Columns I–S) are linked directly to the tables below (Columns A–F). Edit any table or double-click any chart in Google Sheets to customize labels, axes, or colors."
    ws1["A2"].font = Font(name="Arial", size=10, italic=True, color="475569")

    tables_spec = [
        {
            "start_row": 4,
            "title": "Table 1: First Contentful Paint — FCP (Seconds, Lower is Better)",
            "y_axis": "FCP Time (s)",
            "chart_title": "First Contentful Paint (FCP) Across Data Loads (s)",
            "metric": "fcp_s",
            "num_format": "0.000",
            "chart_anchor": "H4",
        },
        {
            "start_row": 15,
            "title": "Table 2: Largest Contentful Paint — LCP (Seconds, Lower is Better)",
            "y_axis": "LCP Time (s)",
            "chart_title": "Largest Contentful Paint (LCP) Across Data Loads (s)",
            "metric": "lcp_s",
            "num_format": "0.000",
            "chart_anchor": "Q4",
        },
        {
            "start_row": 26,
            "title": "Table 3: Total Blocking Time — TBT (Milliseconds, Lower is Better)",
            "y_axis": "TBT (ms)",
            "chart_title": "Total Blocking Time (TBT) Across Data Loads (ms)",
            "metric": "tbt_ms",
            "num_format": "0.0",
            "chart_anchor": "H28",
        },
        {
            "start_row": 37,
            "title": "Table 4: Speed Index — SI (Seconds, Lower is Better)",
            "y_axis": "Speed Index (s)",
            "chart_title": "Speed Index (SI) Across Data Loads (s)",
            "metric": "si_s",
            "num_format": "0.000",
            "chart_anchor": "Q28",
        },
    ]

    headers = [
        "Stage (N)",
        "Astro Islands (Own)",
        "Next.js SSG (Own)",
        "Blade SSR [Ref 17]",
        "React CSR [Ref 17]",
        "Vue CSR [Ref 17]",
    ]

    series_colors = ["059669", "2563EB", "DC2626", "D97706", "7C3AED"]

    for spec in tables_spec:
        r0 = spec["start_row"]
        ws1.cell(row=r0, column=1, value=spec["title"]).font = section_font

        hdr_row = r0 + 1
        for c_idx, h_text in enumerate(headers, start=1):
            cell = ws1.cell(row=hdr_row, column=c_idx, value=h_text)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align
            cell.border = thin_border

        metric = spec["metric"]
        for i, st in enumerate(STAGES):
            curr_r = hdr_row + 1 + i
            row_vals = [
                f"N = {st:,}",
                get_own_mean("astro-islands", st, metric),
                get_own_mean("nextjs-ssg", st, metric),
                FAHRUDIN_REF["blade-ssr"][st][metric],
                FAHRUDIN_REF["react-csr"][st][metric],
                FAHRUDIN_REF["vue-csr"][st][metric],
            ]
            for c_idx, val in enumerate(row_vals, start=1):
                cell = ws1.cell(row=curr_r, column=c_idx, value=val)
                cell.border = thin_border
                if i % 2 == 1:
                    cell.fill = zebra_fill
                if c_idx == 1:
                    cell.font = bold_font
                    cell.alignment = center_align
                else:
                    cell.font = data_font
                    cell.alignment = right_align
                    cell.number_format = spec["num_format"]

        # Create native LineChart for this table
        chart = LineChart()
        chart.title = spec["chart_title"]
        chart.style = 10
        chart.y_axis.title = spec["y_axis"]
        chart.x_axis.title = "Dataset Size (N)"
        chart.legend.position = "b"
        chart.width = 17
        chart.height = 10.5

        data_ref = Reference(ws1, min_col=2, min_row=hdr_row, max_col=6, max_row=hdr_row + len(STAGES))
        cats_ref = Reference(ws1, min_col=1, min_row=hdr_row + 1, max_row=hdr_row + len(STAGES))
        chart.add_data(data_ref, titles_from_data=True)
        chart.set_categories(cats_ref)

        for s_idx, s in enumerate(chart.series):
            s.graphicalProperties.line.solidFill = series_colors[s_idx]
            s.graphicalProperties.line.width = 28000 if s_idx < 2 else 22000
            s.smooth = False

        ws1.add_chart(chart, spec["chart_anchor"])

    # Table 5: Normalized LCP Scaling Factor (S_N = LCP_N / LCP_10)
    r0_norm = 48
    ws1.cell(row=r0_norm, column=1, value="Table 5: Hardware-Independent Normalized LCP Scaling Factor (S_N = LCP_N / LCP_10)").font = section_font
    hdr_norm = r0_norm + 1
    for c_idx, h_text in enumerate(headers, start=1):
        cell = ws1.cell(row=hdr_norm, column=c_idx, value=h_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = thin_border

    astro_base = get_own_mean("astro-islands", 10, "lcp_s")
    next_base = get_own_mean("nextjs-ssg", 10, "lcp_s")
    blade_base = FAHRUDIN_REF["blade-ssr"][10]["lcp_s"]
    react_base = FAHRUDIN_REF["react-csr"][10]["lcp_s"]
    vue_base = FAHRUDIN_REF["vue-csr"][10]["lcp_s"]

    for i, st in enumerate(STAGES):
        curr_r = hdr_norm + 1 + i
        row_vals = [
            f"N = {st:,}",
            round(get_own_mean("astro-islands", st, "lcp_s") / astro_base, 2),
            round(get_own_mean("nextjs-ssg", st, "lcp_s") / next_base, 2),
            round(FAHRUDIN_REF["blade-ssr"][st]["lcp_s"] / blade_base, 2),
            round(FAHRUDIN_REF["react-csr"][st]["lcp_s"] / react_base, 2),
            round(FAHRUDIN_REF["vue-csr"][st]["lcp_s"] / vue_base, 2),
        ]
        for c_idx, val in enumerate(row_vals, start=1):
            cell = ws1.cell(row=curr_r, column=c_idx, value=val)
            cell.border = thin_border
            if i % 2 == 1:
                cell.fill = zebra_fill
            if c_idx == 1:
                cell.font = bold_font
                cell.alignment = center_align
            else:
                cell.font = data_font
                cell.alignment = right_align
                cell.number_format = "0.00"

    norm_chart = LineChart()
    norm_chart.title = "Normalized LCP Scaling Factor (S_N = LCP_N / LCP_10)"
    norm_chart.style = 10
    norm_chart.y_axis.title = "Scaling Multiple S_N (x Baseline at N=10)"
    norm_chart.x_axis.title = "Dataset Size (N)"
    norm_chart.legend.position = "b"
    norm_chart.width = 17
    norm_chart.height = 10.5

    norm_data_ref = Reference(ws1, min_col=2, min_row=hdr_norm, max_col=6, max_row=hdr_norm + len(STAGES))
    norm_cats_ref = Reference(ws1, min_col=1, min_row=hdr_norm + 1, max_row=hdr_norm + len(STAGES))
    norm_chart.add_data(norm_data_ref, titles_from_data=True)
    norm_chart.set_categories(norm_cats_ref)
    for s_idx, s in enumerate(norm_chart.series):
        s.graphicalProperties.line.solidFill = series_colors[s_idx]
        s.graphicalProperties.line.width = 28000 if s_idx < 2 else 22000
        s.smooth = False
    ws1.add_chart(norm_chart, "H52")

    # Table 6: Hardware-Calibrated LCP (M_calib = k_hw * M_own, k_hw = 1.170)
    r0_cal = 59
    ws1.cell(row=r0_cal, column=1, value="Table 6: Hardware-Calibrated LCP in Seconds (k_hw = 1.170 Applied to Own Measurements)").font = section_font
    hdr_cal = r0_cal + 1
    cal_headers = [
        "Stage (N)",
        "Astro Calibrated LCP* (s)",
        "Next.js Calibrated LCP* (s)",
        "Blade SSR [Ref 17] (s)",
        "React CSR [Ref 17] (s)",
        "Vue CSR [Ref 17] (s)",
    ]
    for c_idx, h_text in enumerate(cal_headers, start=1):
        cell = ws1.cell(row=hdr_cal, column=c_idx, value=h_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = thin_border

    for i, st in enumerate(STAGES):
        curr_r = hdr_cal + 1 + i
        row_vals = [
            f"N = {st:,}",
            round(get_own_mean("astro-islands", st, "lcp_s") * K_HW, 3),
            round(get_own_mean("nextjs-ssg", st, "lcp_s") * K_HW, 3),
            FAHRUDIN_REF["blade-ssr"][st]["lcp_s"],
            FAHRUDIN_REF["react-csr"][st]["lcp_s"],
            FAHRUDIN_REF["vue-csr"][st]["lcp_s"],
        ]
        for c_idx, val in enumerate(row_vals, start=1):
            cell = ws1.cell(row=curr_r, column=c_idx, value=val)
            cell.border = thin_border
            if i % 2 == 1:
                cell.fill = zebra_fill
            if c_idx == 1:
                cell.font = bold_font
                cell.alignment = center_align
            else:
                cell.font = data_font
                cell.alignment = right_align
                cell.number_format = "0.000"

    cal_chart = LineChart()
    cal_chart.title = "Hardware-Calibrated LCP* Across Data Loads (k_hw = 1.170)"
    cal_chart.style = 10
    cal_chart.y_axis.title = "Calibrated LCP* Time (s)"
    cal_chart.x_axis.title = "Dataset Size (N)"
    cal_chart.legend.position = "b"
    cal_chart.width = 17
    cal_chart.height = 10.5

    cal_data_ref = Reference(ws1, min_col=2, min_row=hdr_cal, max_col=6, max_row=hdr_cal + len(STAGES))
    cal_cats_ref = Reference(ws1, min_col=1, min_row=hdr_cal + 1, max_row=hdr_cal + len(STAGES))
    cal_chart.add_data(cal_data_ref, titles_from_data=True)
    cal_chart.set_categories(cal_cats_ref)
    for s_idx, s in enumerate(cal_chart.series):
        s.graphicalProperties.line.solidFill = series_colors[s_idx]
        s.graphicalProperties.line.width = 28000 if s_idx < 2 else 22000
        s.smooth = False
    ws1.add_chart(cal_chart, "Q52")

    for col_idx, width in enumerate([16, 22, 22, 22, 22, 22, 4], start=1):
        ws1.column_dimensions[get_column_letter(col_idx)].width = width

    # =========================================================================
    # SHEET 2: Own Summary (Mean & SD for all 14 configurations)
    # =========================================================================
    ws2 = wb.create_sheet(title="Own Summary (Mean & SD)")
    ws2.views.sheetView[0].showGridLines = True

    ws2["A1"] = "Own Empirical Benchmark Summary (n = 5 Repetitions per Stage, Desktop Lighthouse Preset)"
    ws2["A1"].font = title_font

    sum_headers = [
        "Architecture",
        "Stage (N)",
        "Runs (n)",
        "Perf Score (Mean)",
        "Perf Score (SD)",
        "FCP [s] (Mean)",
        "FCP [s] (SD)",
        "LCP [s] (Mean)",
        "LCP [s] (SD)",
        "TBT [ms] (Mean)",
        "TBT [ms] (SD)",
        "Speed Index [s] (Mean)",
        "Speed Index [s] (SD)",
        "CLS (Mean)",
        "HTML Size [kB]",
        "JS Bundle [kB]",
        "Total Transfer [kB]",
        "DOM Elements",
    ]

    for c_idx, h_text in enumerate(sum_headers, start=1):
        cell = ws2.cell(row=3, column=c_idx, value=h_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = thin_border

    row_cursor = 4
    for arch_id, arch_label in [
        ("astro-islands", "Astro Jamstack (Islands)"),
        ("nextjs-ssg", "Next.js Jamstack (SSG + Hydration)"),
    ]:
        for st in STAGES:
            vals = [
                arch_label,
                st,
                5,
                get_own_mean(arch_id, st, "perfScore"),
                get_own_sd(arch_id, st, "perfScore"),
                get_own_mean(arch_id, st, "fcp_s"),
                get_own_sd(arch_id, st, "fcp_s"),
                get_own_mean(arch_id, st, "lcp_s"),
                get_own_sd(arch_id, st, "lcp_s"),
                get_own_mean(arch_id, st, "tbt_ms"),
                get_own_sd(arch_id, st, "tbt_ms"),
                get_own_mean(arch_id, st, "si_s"),
                get_own_sd(arch_id, st, "si_s"),
                get_own_mean(arch_id, st, "cls"),
                get_own_mean(arch_id, st, "html_kb"),
                get_own_mean(arch_id, st, "js_kb"),
                get_own_mean(arch_id, st, "total_kb"),
                round(get_own_mean(arch_id, st, "dom_nodes")),
            ]
            for c_idx, val in enumerate(vals, start=1):
                cell = ws2.cell(row=row_cursor, column=c_idx, value=val)
                cell.border = thin_border
                if row_cursor % 2 == 1:
                    cell.fill = zebra_fill
                if c_idx == 1:
                    cell.font = bold_font
                    cell.alignment = left_align
                elif c_idx in (2, 3, 18):
                    cell.font = data_font
                    cell.alignment = right_align
                    cell.number_format = "#,##0"
                elif c_idx in (4, 5, 10, 11, 15, 16, 17):
                    cell.font = data_font
                    cell.alignment = right_align
                    cell.number_format = "0.0"
                elif c_idx == 14:
                    cell.font = data_font
                    cell.alignment = right_align
                    cell.number_format = "0.0000"
                else:
                    cell.font = data_font
                    cell.alignment = right_align
                    cell.number_format = "0.000"
            row_cursor += 1

    # Add HTML Payload comparison table & BarChart on Sheet 2
    ws2.cell(row=20, column=1, value="HTML Payload Size Comparison (kB)").font = section_font
    payload_headers = ["Stage (N)", "Astro HTML [kB]", "Next.js SSG HTML [kB]"]
    for c_idx, h_text in enumerate(payload_headers, start=1):
        cell = ws2.cell(row=21, column=c_idx, value=h_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = thin_border

    for i, st in enumerate(STAGES):
        r_idx = 22 + i
        p_vals = [
            f"N = {st:,}",
            get_own_mean("astro-islands", st, "html_kb"),
            get_own_mean("nextjs-ssg", st, "html_kb"),
        ]
        for c_idx, val in enumerate(p_vals, start=1):
            cell = ws2.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.font = bold_font if c_idx == 1 else data_font
            cell.alignment = center_align if c_idx == 1 else right_align
            if c_idx > 1:
                cell.number_format = "#,##0.0"

    bar_chart = BarChart()
    bar_chart.type = "col"
    bar_chart.style = 10
    bar_chart.title = "HTML Document Payload Size: Astro Islands vs. Next.js SSG (kB)"
    bar_chart.y_axis.title = "HTML Payload Size (kB)"
    bar_chart.x_axis.title = "Dataset Size (N)"
    bar_chart.legend.position = "b"
    bar_chart.width = 20
    bar_chart.height = 12
    p_data = Reference(ws2, min_col=2, min_row=21, max_col=3, max_row=21 + len(STAGES))
    p_cats = Reference(ws2, min_col=1, min_row=22, max_row=21 + len(STAGES))
    bar_chart.add_data(p_data, titles_from_data=True)
    bar_chart.set_categories(p_cats)
    ws2.add_chart(bar_chart, "E20")

    for col_idx in range(1, len(sum_headers) + 1):
        ws2.column_dimensions[get_column_letter(col_idx)].width = 32 if col_idx == 1 else 16

    # =========================================================================
    # SHEET 3: Raw Runs (70 Measurements)
    # =========================================================================
    ws3 = wb.create_sheet(title="Raw Runs (70 Measurements)")
    ws3.views.sheetView[0].showGridLines = True

    ws3["A1"] = "All 70 Individual Google Lighthouse Desktop Benchmark Runs (Raw Data)"
    ws3["A1"].font = title_font

    raw_headers = [
        "Architecture ID",
        "Architecture Label",
        "Stage (N)",
        "Run #",
        "Perf Score",
        "FCP [s]",
        "LCP [s]",
        "TBT [ms]",
        "Speed Index [s]",
        "TTI [s]",
        "CLS",
        "Total Transfer [kB]",
        "JS Bundle [kB]",
        "HTML Size [kB]",
        "DOM Nodes",
    ]
    raw_keys = [
        "architectureId",
        "architectureLabel",
        "stage",
        "run",
        "perfScore",
        "fcp_s",
        "lcp_s",
        "tbt_ms",
        "si_s",
        "tti_s",
        "cls",
        "total_kb",
        "js_kb",
        "html_kb",
        "dom_nodes",
    ]

    for c_idx, h_text in enumerate(raw_headers, start=1):
        cell = ws3.cell(row=3, column=c_idx, value=h_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align
        cell.border = thin_border

    for r_i, run_obj in enumerate(runs, start=4):
        for c_idx, k in enumerate(raw_keys, start=1):
            cell = ws3.cell(row=r_i, column=c_idx, value=run_obj.get(k))
            cell.border = thin_border
            cell.font = data_font
            if r_i % 2 == 1:
                cell.fill = zebra_fill
            if c_idx <= 2:
                cell.alignment = left_align
            else:
                cell.alignment = right_align

    for col_idx in range(1, len(raw_headers) + 1):
        ws3.column_dimensions[get_column_letter(col_idx)].width = 30 if col_idx == 2 else 16

    wb.save(OUT_XLSX)
    print(f"Saved workbook to {OUT_XLSX}")


if __name__ == "__main__":
    main()
