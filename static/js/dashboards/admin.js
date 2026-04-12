/**
 * Dashboard administración — Chart.js (datos desde json_script admin-charts-data).
 */
(function () {
    'use strict';

    /* Paleta sin lila: teal, cyan, azul, coral, ámbar, esmeralda */
    var PALETTE = [
        '#0d7377', '#06b6d4', '#0284c7', '#3b82f6', '#f43f5e',
        '#f59e0b', '#14b8a6', '#0ea5e9', '#059669', '#ea580c'
    ];

    var BAR_FILL = [
        'rgba(13, 115, 119, 0.9)',
        'rgba(6, 182, 212, 0.9)',
        'rgba(2, 132, 199, 0.9)',
        'rgba(59, 130, 246, 0.9)',
        'rgba(20, 184, 166, 0.9)',
        'rgba(14, 165, 233, 0.9)'
    ];

    var BAR_BORDER = [
        '#0f766e', '#0891b2', '#0369a1', '#2563eb', '#0d9488', '#0284c7'
    ];

    var HIGHLIGHT_CORAL = 'rgba(244, 63, 94, 0.92)';

    var MUTED = '#94a3b8';

    function readChartsPayload() {
        var el = document.getElementById('admin-charts-data');
        if (!el || !el.textContent) return null;
        try {
            return JSON.parse(el.textContent);
        } catch (e) {
            console.warn('admin dashboard: JSON inválido', e);
            return null;
        }
    }

    function sum(arr) {
        return arr.reduce(function (a, b) { return a + (Number(b) || 0); }, 0);
    }

    function pieOrPolar(labels, values, placeholder) {
        var s = sum(values);
        if (!labels.length || s === 0) {
            return {
                labels: ['Sin datos'],
                data: [1],
                colors: [MUTED],
                placeholder: true
            };
        }
        return {
            labels: labels,
            data: values,
            colors: labels.map(function (_, i) { return PALETTE[i % PALETTE.length]; }),
            placeholder: false
        };
    }

    function commonChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
                        color: '#475569',
                        boxWidth: 8,
                        padding: 14,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        };
    }

    function currencyEs(value) {
        try {
            return new Intl.NumberFormat('es', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        } catch (e) {
            return '$' + Number(value).toFixed(0);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no cargado');
            return;
        }

        Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
        Chart.defaults.color = '#64748b';

        var charts = readChartsPayload();
        if (!charts) return;

        var fontTick = { size: 11 };

        // Reservas por mes — barras multicolor (mes pico resaltado en coral)
        var cr = charts.reservas_por_mes || { labels: [], values: [] };
        var maxIdx = 0;
        var maxV = -1;
        (cr.values || []).forEach(function (v, i) {
            var n = Number(v) || 0;
            if (n > maxV) {
                maxV = n;
                maxIdx = i;
            }
        });
        var barBg = (cr.labels || []).map(function (_, i) {
            if (maxV > 0 && i === maxIdx) return HIGHLIGHT_CORAL;
            return BAR_FILL[i % BAR_FILL.length];
        });
        var barBd = (cr.labels || []).map(function (_, i) {
            if (maxV > 0 && i === maxIdx) return '#e11d48';
            return BAR_BORDER[i % BAR_BORDER.length];
        });
        if (maxV <= 0) {
            barBg = (cr.labels || []).map(function (_, i) { return BAR_FILL[i % BAR_FILL.length]; });
            barBd = (cr.labels || []).map(function (_, i) { return BAR_BORDER[i % BAR_BORDER.length]; });
        }
        var ctxR = document.getElementById('chartReservasMes');
        if (ctxR) {
            new Chart(ctxR, {
                type: 'bar',
                data: {
                    labels: cr.labels,
                    datasets: [{
                        label: 'Reservas',
                        data: cr.values,
                        backgroundColor: barBg,
                        borderColor: barBd,
                        borderWidth: 0,
                        borderRadius: 10,
                        borderSkipped: false,
                        maxBarThickness: 52
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    var n = ctx.parsed.y;
                                    return n === 1 ? '1 reserva' : n + ' reservas';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: fontTick
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: fontTick },
                            grid: { color: 'rgba(148, 163, 184, 0.2)' }
                        }
                    }
                })
            });
        }

        // Ingresos por mes — línea con relleno en degradado violeta → cyan
        var ci = charts.ingresos_por_mes || { labels: [], values: [] };
        var ctxI = document.getElementById('chartIngresosMes');
        if (ctxI) {
            var g = ctxI.getContext('2d').createLinearGradient(0, 0, 0, 260);
            g.addColorStop(0, 'rgba(13, 115, 119, 0.28)');
            g.addColorStop(0.45, 'rgba(6, 182, 212, 0.16)');
            g.addColorStop(1, 'rgba(6, 182, 212, 0.03)');
            var pointColors = (ci.labels || []).map(function (_, i) {
                return i % 2 === 0 ? '#0d7377' : '#06b6d4';
            });
            new Chart(ctxI, {
                type: 'line',
                data: {
                    labels: ci.labels,
                    datasets: [{
                        label: 'Ingresos',
                        data: ci.values,
                        fill: true,
                        tension: 0.38,
                        borderColor: '#0d7377',
                        backgroundColor: g,
                        pointBackgroundColor: pointColors,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2.5
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    return currencyEs(ctx.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: fontTick
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: fontTick,
                                callback: function (v) { return currencyEs(v); }
                            },
                            grid: { color: 'rgba(148, 163, 184, 0.2)' }
                        }
                    }
                })
            });
        }

        // Reservas por estado — doughnut
        var re = charts.reservas_por_estado || { labels: [], values: [] };
        var pieRe = pieOrPolar(re.labels, re.values);
        var ctxRe = document.getElementById('chartReservasEstado');
        if (ctxRe) {
            new Chart(ctxRe, {
                type: 'doughnut',
                data: {
                    labels: pieRe.labels,
                    datasets: [{
                        data: pieRe.data,
                        backgroundColor: pieRe.colors,
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverOffset: 10
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    cutout: '66%',
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            filter: pieRe.placeholder ? function () { return false; } : undefined,
                            callbacks: {
                                label: function (ctx) {
                                    var t = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                    var v = ctx.parsed;
                                    var pct = t ? Math.round((v / t) * 100) : 0;
                                    return ctx.label + ': ' + v + ' (' + pct + '%)';
                                }
                            }
                        }
                    }
                })
            });
        }

        // Habitaciones por estado — doughnut (corte distinto)
        var he = charts.habitaciones_por_estado || { labels: [], values: [] };
        var pieHe = pieOrPolar(he.labels, he.values);
        var ctxHe = document.getElementById('chartHabEstado');
        if (ctxHe) {
            new Chart(ctxHe, {
                type: 'doughnut',
                data: {
                    labels: pieHe.labels,
                    datasets: [{
                        data: pieHe.data,
                        backgroundColor: pieHe.colors,
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverOffset: 10
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    cutout: '52%',
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            filter: pieHe.placeholder ? function () { return false; } : undefined
                        }
                    }
                })
            });
        }

        // Habitaciones por tipo — barras horizontales
        var ht = charts.habitaciones_por_tipo || { labels: [], values: [] };
        if (!ht.labels || !ht.labels.length) {
            ht = { labels: ['Sin habitaciones registradas'], values: [0] };
        }
        var htEmpty = sum(ht.values) === 0;
        var htColors = htEmpty
            ? ht.labels.map(function () { return MUTED; })
            : ht.labels.map(function (_, i) { return PALETTE[i % PALETTE.length]; });
        var ctxHt = document.getElementById('chartHabTipo');
        if (ctxHt) {
            new Chart(ctxHt, {
                type: 'bar',
                data: {
                    labels: ht.labels,
                    datasets: [{
                        label: 'Cantidad',
                        data: ht.values,
                        backgroundColor: htColors,
                        borderRadius: 8,
                        borderSkipped: false,
                        maxBarThickness: 24
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: fontTick },
                            grid: { color: 'rgba(148, 163, 184, 0.2)' }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { font: fontTick }
                        }
                    }
                })
            });
        }

        // Origen — pie clásico
        var or = charts.origen_reservas || { labels: [], values: [] };
        var pieOr = pieOrPolar(or.labels, or.values);
        var ctxOr = document.getElementById('chartOrigen');
        if (ctxOr) {
            new Chart(ctxOr, {
                type: 'pie',
                data: {
                    labels: pieOr.labels,
                    datasets: [{
                        data: pieOr.data,
                        backgroundColor: pieOr.colors,
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverOffset: 10
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            filter: pieOr.placeholder ? function () { return false; } : undefined
                        }
                    }
                })
            });
        }

        // Pagos por método — área polar
        var pt = charts.pagos_por_tipo || { labels: [], values: [] };
        var piePt = pieOrPolar(pt.labels, pt.values);
        var ctxPt = document.getElementById('chartPagosTipo');
        if (ctxPt) {
            new Chart(ctxPt, {
                type: 'polarArea',
                data: {
                    labels: piePt.labels,
                    datasets: [{
                        data: piePt.data,
                        backgroundColor: piePt.colors.map(function (c) {
                            if (c === MUTED) return 'rgba(148, 163, 184, 0.45)';
                            var hex = c.replace('#', '');
                            var r = parseInt(hex.slice(0, 2), 16);
                            var g = parseInt(hex.slice(2, 4), 16);
                            var b = parseInt(hex.slice(4, 6), 16);
                            return 'rgba(' + r + ',' + g + ',' + b + ',0.55)';
                        }),
                        borderWidth: 1,
                        borderColor: '#fff'
                    }]
                },
                options: Object.assign({}, commonChartOptions(), {
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            filter: piePt.placeholder ? function () { return false; } : undefined
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: fontTick },
                            grid: { color: 'rgba(148, 163, 184, 0.25)' }
                        }
                    }
                })
            });
        }
    });
})();
