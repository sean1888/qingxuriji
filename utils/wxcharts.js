/*
 * charts for WeChat small app v1.0
 *
 * https://github.com/xiaolin3303/wx-charts
 * 2016-11-28
 *
 * Designed and built with all the love of Web
 */

'use strict';

var config = {
    yAxisWidth: 15,
    yAxisSplit: 5,
    xAxisHeight: 15,
    xAxisLineHeight: 15,
    legendHeight: 15,
    yAxisTitleWidth: 15,
    padding: 12,
    columePadding: 3,
    fontSize: 10,
    dataPointShape: ['diamond', 'circle', 'triangle', 'rect'],
    colors: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9']
};

// 计算文本长度
function mesureText(text) {
    var text = text.split('');
    var width = 0;
    text.forEach(function(item) {
        if (/[a-zA-Z]/.test(item)) {
            width += 7;
        } else if (/[0-9]/.test(item)) {
            width += 5.5;
        } else if (/\./.test(item)) {
            width += 2.7;
        } else if (/-/.test(item)) {
            width += 3.25;
        } else if (/[\u4e00-\u9fa5]/.test(item)) {
            width += 10;
        } else if (/\(|\)/.test(item)) {
            width += 3.73;
        } else if (/\s/.test(item)) {
            width += 2.5;
        } else {
            width += 10;
        }
    });
    return width;
}

// 图表绘制
function drawCharts(type, opts, config, context) {
    var series = opts.series;
    var categories = opts.categories;
    var legendData = [];
    series.forEach(function(item) {
        legendData.push(item.name);
    });

    var padding = config.padding;
    var xAxisHeight = config.xAxisHeight;
    var legendHeight = config.legendHeight;
    var yAxisWidth = config.yAxisWidth;
    var points = [];
    var legendWidth = 0;

    // 计算图例宽度
    legendData.forEach(function(item) {
        legendWidth += mesureText(item) + 15;
    });

    // 计算y轴最大值和最小值
    var yAxisMin = 0;
    var yAxisMax = 0;
    series.forEach(function(item) {
        item.data.forEach(function(dataItem) {
            if (dataItem > yAxisMax) {
                yAxisMax = dataItem;
            }
            if (dataItem < yAxisMin) {
                yAxisMin = dataItem;
            }
        });
    });

    // 计算y轴刻度
    var yAxisSplit = config.yAxisSplit;
    var yAxisSpacing = (yAxisMax - yAxisMin) / yAxisSplit;
    var yAxisPoints = [];
    for (var i = 0; i <= yAxisSplit; i++) {
        yAxisPoints.push(yAxisMin + yAxisSpacing * i);
    }

    // 计算坐标点
    var spacingValid = opts.width - 2 * padding - yAxisWidth;
    var xAxisPoints = [];
    var spacing = spacingValid / (categories.length - 1);
    for (var i = 0; i < categories.length; i++) {
        xAxisPoints.push(padding + yAxisWidth + spacing * i);
    }

    series.forEach(function(item, seriesIndex) {
        var data = item.data;
        var points = [];
        data.forEach(function(item, index) {
            var point = {
                x: xAxisPoints[index],
                y: opts.height - padding - xAxisHeight - (item - yAxisMin) / (yAxisMax - yAxisMin) * (opts.height - 2 * padding - xAxisHeight - legendHeight)
            };
            points.push(point);
        });

        // 绘制折线
        context.beginPath();
        context.setStrokeStyle(config.colors[seriesIndex]);
        context.setLineWidth(2);
        points.forEach(function(item, index) {
            if (index === 0) {
                context.moveTo(item.x, item.y);
            } else {
                context.lineTo(item.x, item.y);
            }
        });
        context.stroke();
        context.closePath();

        // 绘制数据点
        points.forEach(function(item, index) {
            context.beginPath();
            context.setFillStyle(config.colors[seriesIndex]);
            context.arc(item.x, item.y, 2, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
        });
    });

    // 绘制x轴
    context.beginPath();
    context.setStrokeStyle('#cccccc');
    context.setLineWidth(1);
    context.moveTo(padding + yAxisWidth, opts.height - padding - xAxisHeight);
    context.lineTo(opts.width - padding, opts.height - padding - xAxisHeight);
    context.stroke();
    context.closePath();

    // 绘制x轴刻度
    categories.forEach(function(item, index) {
        var offset = -mesureText(item) / 2;
        context.beginPath();
        context.setFontSize(config.fontSize);
        context.setFillStyle('#666666');
        context.fillText(item, xAxisPoints[index] + offset, opts.height - padding);
        context.closePath();
    });

    // 绘制y轴
    context.beginPath();
    context.setStrokeStyle('#cccccc');
    context.setLineWidth(1);
    context.moveTo(padding + yAxisWidth, padding);
    context.lineTo(padding + yAxisWidth, opts.height - padding - xAxisHeight);
    context.stroke();
    context.closePath();

    // 绘制y轴刻度
    yAxisPoints.forEach(function(item, index) {
        var offset = -mesureText(item.toFixed(0)) - 5;
        context.beginPath();
        context.setFontSize(config.fontSize);
        context.setFillStyle('#666666');
        context.fillText(item.toFixed(0), padding + offset, opts.height - padding - xAxisHeight - (item - yAxisMin) / (yAxisMax - yAxisMin) * (opts.height - 2 * padding - xAxisHeight - legendHeight));
        context.closePath();
    });

    // 绘制图例
    if (opts.showLegend) {
        var legendY = opts.height - padding + config.legendHeight;
        var legendX = (opts.width - legendWidth) / 2;
        legendData.forEach(function(item, index) {
            context.beginPath();
            context.setFillStyle(config.colors[index]);
            context.moveTo(legendX, legendY);
            context.fillRect(legendX, legendY - 6, 12, 6);
            context.closePath();
            context.beginPath();
            context.setFontSize(config.fontSize);
            context.setFillStyle('#666666');
            context.fillText(item, legendX + 15, legendY);
            context.closePath();
            legendX += mesureText(item) + 25;
        });
    }
}

function Charts(opts) {
    opts.showLegend = opts.showLegend === false ? false : true;
    opts.animation = opts.animation === false ? false : true;
    var context = wx.createCanvasContext(opts.canvasId);

    // 绘制图表
    drawCharts('line', opts, config, context);

    // 执行绘制
    context.draw();
}

module.exports = Charts; 