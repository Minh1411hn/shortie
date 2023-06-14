import {useContext, useEffect, useState} from "react";
import {UserContext} from "../UserContext.jsx";
import axios from "axios";
import Chart from 'react-apexcharts';

export default function BrowserChart() {
    const { email, username,id, avatar } = useContext(UserContext);
    const [chartData, setChartData] = useState({ series: [], options: {} });

    useEffect(() => {
        const fetchUserAgents = async () => {
            try {
                const response = await axios.post(`/events/useragent`, { user_id: id });
                if (response.status === 200) {
                    console.log(response.data);
                    const chartData = processChartData(response.data);
                    setChartData(chartData);

                }
            } catch (error) {
                console.error('Error getting all events', error);
                // Handle the error
            }
        };
        fetchUserAgents();
    }, []);

    const processChartData = (data) => {
        const mergedDevices = {};

        data.forEach((item) => {
            const deviceName = item.device.split(' ')[0];
            if (!mergedDevices[deviceName]) {
                mergedDevices[deviceName] = Number(item.event_count);
            } else {
                mergedDevices[deviceName] += Number(item.event_count);
            }
        });

        const sortedDevices = Object.entries(mergedDevices).sort(
            (a, b) => b[1] - a[1]
        );

        const series = sortedDevices.map((entry) => entry[1]);
        const labels = sortedDevices.map((entry) => entry[0]);



        const options = {
            chart: {
                type: 'donut',
            },
            legend: {
                show:true,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                    },
                },
            },
            colors:[
                "#F5BA59",
                "#6A6CF6",
                "#58C0E7",
                "#EB5032"
            ],
            fill: {
                opacity: 0.9,
            },
            dataLabels: {
                enabled: false,
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: '12px',
                    fontWeight: 'light',
                }
            },
            labels: labels,
            series: series,
        };

        return { series: series, options: options };
    };

    return (
        <div >
            <Chart options={chartData.options} series={chartData.series} type="donut" height={200} />
        </div>
    )
}