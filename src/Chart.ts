function initChartJS()
{
    //@ts-ignore
    Chart.defaults.color = "#ffffffff";
    //@ts-ignore
    Chart.defaults.plugins.tooltip.callbacks.label = function (context)
    {
        const total = context.dataset.data.reduce((x, y) => x + y, 0);
        const currentValue = context.parsed;
        const percentage = ((currentValue / total) * 100).toFixed(2);
        return `${currentValue.toFixed(2)} (${percentage}%)`;
    };
    //@ts-ignore
    Chart.defaults.plugins.tooltip.callbacks.title = function (context)
    {
        return context.label;
    };
}