import {usePairCandlesSubscription} from "../lib/candle.graphql";

const today = new Date();
const yearAgo = new Date();
yearAgo.setDate(today.getDate() - 1);
const yeartime = yearAgo.getTime()

interface Props {
    candlestickSeries?: Array<any>;
    lineSeries?: Array<any>;
    areaSeries?: Array<any>;
    barSeries?: Array<any>;
    histogramSeries?: Array<any>;
    width?: number;
    height?: number;
    options?: object;
    autoWidth?: boolean;
    autoHeight?: boolean;
    legend?: string;
    from?: number;
    to?: number;
    onClick?: MouseEventHandler;
    onCrosshairMove?: MouseEventHandler;
    onTimeRangeMove?: TimeRangeChangeEventHandler;
    darkTheme?: boolean;
}

import dynamic from 'next/dynamic';
import {MouseEventHandler, TimeRangeChangeEventHandler} from "lightweight-charts";
const Chart = dynamic(() => import('kaktana-react-lightweight-charts'), {
    ssr: false
});

const Index = () => {



    const {loading, data} = usePairCandlesSubscription({
        variables: {
            pair: "0xa7ad4ce6c21d9e875f1067cd377256326b483002",
            period: 60 * 60
        }
    })

    const state: Props = {
        options: {
            timeScale: {
                timeVisible: true
            },
            priceFormat: {
                type: 'custom',
                minMove: '0.0000001',
                formatter: (price) => {
                    console.log(price)
                    if (price < 0.0000001) return parseFloat(price).toPrecision(18)
                    else if (price >= 0.0000001 && price < 1) return parseFloat(price).toPrecision(16)
                    else return parseFloat(price).toPrecision(16)
                }
            },
            priceScale: {
                autoScale: true
            },
            localization: {
                locale: 'en-US',
                priceFormatter: (price) => {
                    console.log(price)
                    if (price < 0.0000001) return parseFloat(price).toPrecision(8)
                    else if (price >= 0.0000001 && price < 1) return parseFloat(price).toPrecision(6)
                    else return parseFloat(price).toPrecision(6)
                }
            },
            alignLabels: true,
            // timeScale: {
            //     barSpacing: 3,
            //     fixLeftEdge: true,
            //     lockVisibleTimeRangeOnResize: true,
            //     rightBarStaysOnScroll: true,
            //     borderVisible: false,
            //     borderColor: "#fff000",
            //     visible: true,
            //     timeVisible: true,
            //     secondsVisible: false
            // }
        },
        candlestickSeries: [{
            data: data?.candles?.map(v => ({
                time: v.time,
                open: parseFloat(v.open).toFixed(10),
                high: parseFloat(v.high).toFixed(10),
                low: parseFloat(v.low).toFixed(10),
                close: parseFloat(v.close).toFixed(10)
            })) || [],
        }]
    }

    console.log(state.candlestickSeries[0].data)
    return !loading && (
        <div style={{width:500, margin: '2rem auto'}}>
            <Chart options={state.options} candlestickSeries={state.candlestickSeries} autoWidth height={320} />
        </div>
    )
}

export default Index
