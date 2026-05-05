#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import math
import re
import sys
from html import escape
from dataclasses import dataclass
from pathlib import Path
from statistics import median
from typing import Iterable


FILE_PATTERN = re.compile(
    r"(?P<arch>direct|relay)_(?P<users>\d+)(?:[^/]*)\.csv$",
    re.IGNORECASE,
)
DEFAULT_JMETER_FIELDS = [
    "timeStamp",
    "elapsed",
    "label",
    "responseCode",
    "responseMessage",
    "threadName",
    "dataType",
    "success",
    "failureMessage",
    "bytes",
    "sentBytes",
    "grpThreads",
    "allThreads",
    "URL",
    "Latency",
    "IdleTime",
    "Connect",
]


@dataclass
class SummaryRow:
    architecture: str
    users: int
    samples: int
    success_count: int
    error_count: int
    error_rate: float
    avg_ms: float
    median_ms: float
    p95_ms: float
    p99_ms: float
    min_ms: int
    max_ms: int
    throughput_rps: float
    duration_sec: float


def percentile(sorted_values: list[int], p: float) -> float:
    if not sorted_values:
        return 0.0
    if len(sorted_values) == 1:
        return float(sorted_values[0])
    rank = (len(sorted_values) - 1) * p
    low = math.floor(rank)
    high = math.ceil(rank)
    if low == high:
        return float(sorted_values[low])
    weight = rank - low
    return sorted_values[low] * (1 - weight) + sorted_values[high] * weight


def parse_bool(value: str | None) -> bool:
    return str(value).strip().lower() == "true"


def parse_int(value: str | None, default: int = 0) -> int:
    try:
        return int(float(str(value).strip()))
    except (TypeError, ValueError):
        return default


def load_summary(csv_path: Path, architecture: str, users: int) -> SummaryRow | None:
    elapsed_values: list[int] = []
    timestamps: list[int] = []
    success_count = 0

    with csv_path.open("r", newline="", encoding="utf-8-sig") as handle:
        sample = handle.read(2048)
        handle.seek(0)
        first_line = sample.splitlines()[0].strip() if sample.splitlines() else ""
        has_header = "elapsed" in first_line and "timeStamp" in first_line
        if has_header:
            reader = csv.DictReader(handle)
        else:
            reader = csv.DictReader(handle, fieldnames=DEFAULT_JMETER_FIELDS)
        for row in reader:
            elapsed = parse_int(row.get("elapsed"))
            timestamp = parse_int(row.get("timeStamp"))
            elapsed_values.append(elapsed)
            timestamps.append(timestamp)
            if parse_bool(row.get("success")):
                success_count += 1

    if not elapsed_values:
        print(f"Skipping empty CSV: {csv_path}", file=sys.stderr)
        return None

    sorted_elapsed = sorted(elapsed_values)
    samples = len(elapsed_values)
    error_count = samples - success_count
    error_rate = error_count / samples

    start_ms = min(timestamps) if timestamps else 0
    end_ms = max(
        ts + elapsed for ts, elapsed in zip(timestamps, elapsed_values, strict=False)
    ) if timestamps else 0
    duration_sec = max((end_ms - start_ms) / 1000.0, 0.001)
    throughput_rps = samples / duration_sec

    return SummaryRow(
        architecture=architecture,
        users=users,
        samples=samples,
        success_count=success_count,
        error_count=error_count,
        error_rate=error_rate,
        avg_ms=sum(elapsed_values) / samples,
        median_ms=float(median(elapsed_values)),
        p95_ms=percentile(sorted_elapsed, 0.95),
        p99_ms=percentile(sorted_elapsed, 0.99),
        min_ms=min(elapsed_values),
        max_ms=max(elapsed_values),
        throughput_rps=throughput_rps,
        duration_sec=duration_sec,
    )


def discover_files(input_dir: Path) -> list[tuple[Path, str, int]]:
    matches: list[tuple[Path, str, int]] = []
    for path in sorted(input_dir.glob("*.csv")):
        match = FILE_PATTERN.match(path.name)
        if not match:
            continue
        matches.append((path, match.group("arch").lower(), int(match.group("users"))))
    return matches


def write_summary_csv(rows: Iterable[SummaryRow], output_path: Path) -> None:
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "architecture",
                "users",
                "samples",
                "success_count",
                "error_count",
                "error_rate",
                "avg_ms",
                "median_ms",
                "p95_ms",
                "p99_ms",
                "min_ms",
                "max_ms",
                "throughput_rps",
                "duration_sec",
            ]
        )
        for row in rows:
            writer.writerow(
                [
                    row.architecture,
                    row.users,
                    row.samples,
                    row.success_count,
                    row.error_count,
                    f"{row.error_rate:.4f}",
                    f"{row.avg_ms:.2f}",
                    f"{row.median_ms:.2f}",
                    f"{row.p95_ms:.2f}",
                    f"{row.p99_ms:.2f}",
                    row.min_ms,
                    row.max_ms,
                    f"{row.throughput_rps:.4f}",
                    f"{row.duration_sec:.3f}",
                ]
            )


def print_table(rows: list[SummaryRow]) -> None:
    headers = [
        "Arch",
        "Users",
        "Samples",
        "Avg(ms)",
        "P95(ms)",
        "P99(ms)",
        "Error%",
        "TPS",
    ]
    print(" | ".join(headers))
    print(" | ".join(["---"] * len(headers)))
    for row in rows:
        print(
            " | ".join(
                [
                    row.architecture,
                    str(row.users),
                    str(row.samples),
                    f"{row.avg_ms:.1f}",
                    f"{row.p95_ms:.1f}",
                    f"{row.p99_ms:.1f}",
                    f"{row.error_rate * 100:.2f}",
                    f"{row.throughput_rps:.2f}",
                ]
            )
        )


def generate_plots(rows: list[SummaryRow], output_dir: Path) -> list[Path]:
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib is not installed, generating SVG charts instead.", file=sys.stderr)
        return generate_svg_plots(rows, output_dir)

    created: list[Path] = []
    metrics = [
        ("avg_ms", "Average Response Time (ms)", "avg_response_time.png"),
        ("p95_ms", "P95 Response Time (ms)", "p95_response_time.png"),
        ("error_rate", "Error Rate (%)", "error_rate.png"),
        ("throughput_rps", "Throughput (req/s)", "throughput.png"),
    ]

    grouped: dict[str, list[SummaryRow]] = {"direct": [], "relay": []}
    for row in rows:
        grouped.setdefault(row.architecture, []).append(row)
    for arch_rows in grouped.values():
        arch_rows.sort(key=lambda item: item.users)

    for metric, title, filename in metrics:
        plt.figure(figsize=(8, 5))
        for architecture in ("direct", "relay"):
            arch_rows = grouped.get(architecture, [])
            if not arch_rows:
                continue
            x = [item.users for item in arch_rows]
            y = [getattr(item, metric) for item in arch_rows]
            if metric == "error_rate":
                y = [value * 100 for value in y]
            plt.plot(x, y, marker="o", linewidth=2, label=architecture)

        plt.title(title)
        plt.xlabel("Concurrent Users")
        plt.ylabel(title)
        plt.xticks(sorted({row.users for row in rows}))
        plt.grid(True, linestyle="--", alpha=0.35)
        plt.legend()
        plt.tight_layout()

        output_path = output_dir / filename
        plt.savefig(output_path, dpi=150)
        plt.close()
        created.append(output_path)

    return created


def generate_svg_plots(rows: list[SummaryRow], output_dir: Path) -> list[Path]:
    metrics = [
        ("avg_ms", "Average Response Time (ms)", "avg_response_time.svg"),
        ("p95_ms", "P95 Response Time (ms)", "p95_response_time.svg"),
        ("error_rate", "Error Rate (%)", "error_rate.svg"),
        ("throughput_rps", "Throughput (req/s)", "throughput.svg"),
    ]
    created: list[Path] = []
    grouped: dict[str, list[SummaryRow]] = {"direct": [], "relay": []}
    for row in rows:
        grouped.setdefault(row.architecture, []).append(row)
    for arch_rows in grouped.values():
        arch_rows.sort(key=lambda item: item.users)

    for metric, title, filename in metrics:
        output_path = output_dir / filename
        output_path.write_text(build_svg_chart(grouped, rows, metric, title), encoding="utf-8")
        created.append(output_path)
    return created


def build_svg_chart(
    grouped: dict[str, list[SummaryRow]],
    rows: list[SummaryRow],
    metric: str,
    title: str,
) -> str:
    width = 900
    height = 520
    left = 80
    right = 40
    top = 60
    bottom = 80
    plot_width = width - left - right
    plot_height = height - top - bottom
    bg = "#f8fafc"
    axis = "#334155"
    grid = "#cbd5e1"
    direct_color = "#2563eb"
    relay_color = "#dc2626"

    users = sorted({row.users for row in rows})
    if not users:
        return ""

    values: list[float] = []
    for row in rows:
        value = getattr(row, metric)
        if metric == "error_rate":
            value *= 100
        values.append(float(value))

    max_value = max(values) if values else 1.0
    max_value = max_value * 1.1 if max_value > 0 else 1.0

    def x_pos(user: int) -> float:
        if len(users) == 1:
            return left + plot_width / 2
        idx = users.index(user)
        return left + (plot_width * idx / (len(users) - 1))

    def y_pos(value: float) -> float:
        return top + plot_height - ((value / max_value) * plot_height)

    def polyline_points(arch_rows: list[SummaryRow]) -> str:
        points = []
        for item in arch_rows:
            value = getattr(item, metric)
            if metric == "error_rate":
                value *= 100
            points.append(f"{x_pos(item.users):.1f},{y_pos(float(value)):.1f}")
        return " ".join(points)

    y_ticks = 5
    svg: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        f'<rect width="{width}" height="{height}" fill="{bg}"/>',
        f'<text x="{width/2:.1f}" y="30" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" fill="{axis}">{escape(title)}</text>',
    ]

    for i in range(y_ticks + 1):
        value = max_value * i / y_ticks
        y = y_pos(value)
        label = f"{value:.1f}" if max_value < 10 else f"{value:.0f}"
        svg.append(f'<line x1="{left}" y1="{y:.1f}" x2="{width-right}" y2="{y:.1f}" stroke="{grid}" stroke-dasharray="4 4"/>')
        svg.append(
            f'<text x="{left-10}" y="{y+5:.1f}" text-anchor="end" font-size="12" font-family="Arial, sans-serif" fill="{axis}">{escape(label)}</text>'
        )

    svg.append(f'<line x1="{left}" y1="{top}" x2="{left}" y2="{height-bottom}" stroke="{axis}" stroke-width="2"/>')
    svg.append(f'<line x1="{left}" y1="{height-bottom}" x2="{width-right}" y2="{height-bottom}" stroke="{axis}" stroke-width="2"/>')

    for user in users:
        x = x_pos(user)
        svg.append(f'<line x1="{x:.1f}" y1="{height-bottom}" x2="{x:.1f}" y2="{height-bottom+6}" stroke="{axis}" stroke-width="2"/>')
        svg.append(
            f'<text x="{x:.1f}" y="{height-bottom+28}" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" fill="{axis}">{user}</text>'
        )

    svg.append(
        f'<text x="{width/2:.1f}" y="{height-20}" text-anchor="middle" font-size="14" font-family="Arial, sans-serif" fill="{axis}">Concurrent Users</text>'
    )

    for architecture, color in (("direct", direct_color), ("relay", relay_color)):
        arch_rows = grouped.get(architecture, [])
        if not arch_rows:
            continue
        points = polyline_points(arch_rows)
        if points:
            svg.append(
                f'<polyline fill="none" stroke="{color}" stroke-width="3" points="{points}"/>'
            )
        for item in arch_rows:
            value = getattr(item, metric)
            if metric == "error_rate":
                value *= 100
            x = x_pos(item.users)
            y = y_pos(float(value))
            svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{color}"/>')
            svg.append(
                f'<text x="{x:.1f}" y="{y-10:.1f}" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" fill="{color}">{value:.1f}</text>'
            )

    legend_y = top + 10
    legend_x = width - 190
    svg.append(f'<rect x="{legend_x}" y="{legend_y}" width="14" height="14" fill="{direct_color}"/>')
    svg.append(
        f'<text x="{legend_x+22}" y="{legend_y+12}" font-size="13" font-family="Arial, sans-serif" fill="{axis}">direct</text>'
    )
    svg.append(f'<rect x="{legend_x}" y="{legend_y+24}" width="14" height="14" fill="{relay_color}"/>')
    svg.append(
        f'<text x="{legend_x+22}" y="{legend_y+36}" font-size="13" font-family="Arial, sans-serif" fill="{axis}">relay</text>'
    )

    svg.append("</svg>")
    return "\n".join(svg)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Aggregate JMeter CSV files like direct_5.csv and relay_5.csv into a summary table and charts."
    )
    parser.add_argument(
        "input_dir",
        nargs="?",
        default="results",
        help="Directory containing JMeter CSV files. Default: results",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directory where summary.csv and charts will be written. Default: <input_dir>/analysis",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir).expanduser().resolve()
    output_dir = (
        Path(args.output_dir).expanduser().resolve()
        if args.output_dir
        else input_dir / "analysis"
    )

    if not input_dir.exists():
        print(f"Input directory does not exist: {input_dir}", file=sys.stderr)
        return 1

    discovered = discover_files(input_dir)
    if not discovered:
        print(
            f"No matching CSV files found in {input_dir}. Expected names like direct_5.csv or relay_30.csv.",
            file=sys.stderr,
        )
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    rows = [
        row
        for row in (load_summary(path, arch, users) for path, arch, users in discovered)
        if row is not None
    ]
    if not rows:
        print(
            f"No non-empty JMeter CSV files found in {input_dir}.",
            file=sys.stderr,
        )
        return 1
    rows.sort(key=lambda item: (item.users, item.architecture))

    summary_path = output_dir / "summary.csv"
    write_summary_csv(rows, summary_path)
    chart_paths = generate_plots(rows, output_dir)

    print(f"Summary written to: {summary_path}")
    for chart_path in chart_paths:
        print(f"Chart written to: {chart_path}")
    print()
    print_table(rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
