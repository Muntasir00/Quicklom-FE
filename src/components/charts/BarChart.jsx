import React from "react";
import ReactECharts from "echarts-for-react";

export default function BarChart({userRegistrationsStatistics}) {
    // Static data: number of users per month
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const userCounts = userRegistrationsStatistics  
    const hasData = userCounts && userCounts.length > 0;

    const option = {
        title: {
            show: !hasData,
            text: "No data available",
            left: "center",
            top: "center",
            textStyle: { color: "#999", fontSize: 15 }
        },
        tooltip: {
            trigger: "axis"
        },
        grid: {
            top: 30,
            bottom: 20,
            left: 20,
            right: 20,
            containLabel: true
        },
        xAxis: hasData
            ? {
                type: "category",
                data: months
            }
            : undefined, // remove xAxis when no data
        yAxis: hasData
            ? {
                type: "value"
            }
            : undefined, // remove yAxis when no data
        series: hasData
            ? [
                {
                    name: "Users",
                    type: "bar",
                    data: userCounts,
                    itemStyle: { color: "#007bff" },
                    barWidth: "50%"
                }
            ]
            : [] // empty series when no data
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
        />
    );
}
