import {Bar, BarChart, XAxis} from "recharts"
import {
    Card,
    CardContent,
} from "@components/ui/card.jsx"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@components/ui/chart.jsx"
import SegmentedCapsule from "@components/segmented-capsule.jsx";

// const chartData = [
//     {month: "Jan", published: 450, booked: 300},
//     {month: "Feb", published: 380, booked: 420},
//     {month: "Mar", published: 520, booked: 120},
//     {month: "Apr", published: 140, booked: 550},
//     {month: "May", published: 600, booked: 350},
//     {month: "Jun", published: 480, booked: 400},
// ]
const chartConfig = {
    published: {
        label: "Published",
        color: "var(--chart-1)",
    },
    booked: {
        label: "Booked",
        color: "var(--chart-2)",
    },
}

// eslint-disable-next-line react/prop-types
function ContractsChart({chartData}) {
    return (
        <Card className="!border-transparent py-0 px-0 shadow-none">
            <CardContent className="p-0">
                <ChartContainer config={chartConfig}>

                    <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <Bar
                            dataKey="published"
                            stackId="a"
                            fill="var(--color-published)"
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="booked"
                            stackId="a"
                            fill="var(--color-booked)"
                            radius={[4, 4, 0, 0]}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    className="w-[180px]"
                                    formatter={(value, name, item, index) => (
                                        <>
                                            <SegmentedCapsule fill={`var(--color-${name})`} />
                                            <span className="capitalize">{name}</span>
                                            <div
                                                className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                {value}
                                                <span className="text-muted-foreground font-normal">
                                                  item
                                                </span>
                                            </div>
                                            {/* Add this after the last item */}
                                            {index === 1 && (
                                                <div
                                                    className="text-foreground mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium">
                                                    Total
                                                    <div
                                                        className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                                        {item.payload.published + item.payload.booked}
                                                        <span className="text-muted-foreground font-normal">
                                                          item
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                />
                            }
                            cursor={false}
                            defaultIndex={1}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default ContractsChart;