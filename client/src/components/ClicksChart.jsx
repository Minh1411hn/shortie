import ReactApexChart from 'react-apexcharts';
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {UserContext} from "../UserContext.jsx";


export default function ClicksChart() {
    const { email, username,id, avatar } = useContext(UserContext);
    const [chartData, setChartData] = useState({
        options: {
            chart: {
                animations: {
                    enabled: true
                },
                background: "",
                foreColor: "#333",
                fontFamily: "Roboto",
                height: 230,
                id: "PjM0o",
                toolbar: {
                    show: false,
                    tools: {
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                type: "area",
                width: 554
            },
            fill: {
                type: "gradient",
                gradient: {
                    shade: "light",
                    type: "vertical",
                    inverseColors: false,
                    opacityFrom: 0.9,
                    opacityTo: 0.9,
                    colorStops: [
                        {
                            opacity: 0.5,
                            offset: 0,
                            color: "#696CFF"
                        },
                        {
                            opacity: 0.3,
                            offset: 100,
                            color: "#FFFFFF"
                        }
                    ]
                }
            },
            stroke: {
                lineCap: "round",
                width: 3,
                colors: [
                    "#696CFF"
                ]
            },
            grid: {
                strokeDashArray: 3,
                row: {},
                padding: {
                    top: 6,
                    right: 10,
                    left: 20
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: [],
                labels: {
                    trim: true,
                    style: {
                        colors: "gray",
                        fontSize: 10
                    },
                    offsetX: 0
                },

                title: {
                    style: {
                        fontWeight: 700
                    }
                }
            },
            yaxis: {
                show: false,
            },
            markers: {
                size: 0,
                opacity: 0.9,
                lastPoint: {
                    size: 6,
                },
            },
        },
        series: [
            {
                name: 'Click Count',
                data: [],
            },
        ],
    });

    useEffect(() => {
        const fetchClicksChart = async () => {
            try {
                const response = await axios.post(`/links/timechart`, { user_id: id });
                console.log(id)
                if (response.status === 200) {
                    // console.log(response.data);

                    const formattedData = response.data.map((item) => ({
                        x: `${item.month_name.trim()}`,
                        y: item.clicks_count,
                    }));

                    setChartData((prevState) => ({
                        ...prevState,
                        options: {
                            ...prevState.options,
                            xaxis: {
                                ...prevState.options.xaxis,
                                categories: formattedData.map((item) => item.x),
                            },
                        },
                        series: [
                            {
                                ...prevState.series[0],
                                data: formattedData.map((item) => item.y),
                            },
                        ],
                    }));

                }
            } catch (error) {
                console.error('Error getting all events', error);
                // Handle the error
            }
        };
        fetchClicksChart();
    },[])



    return (
        <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="area"
            height={250}
        />
    )
}