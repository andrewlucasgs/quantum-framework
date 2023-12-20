<script setup>
import { computed, ref, watch } from 'vue';
import nerdamer from 'nerdamer';
import 'nerdamer/Solve';

import { Chart } from 'highcharts-vue'
import { useStateStore } from '../store/state';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';

HighchartsMore(Highcharts);

const store = useStateStore();

const roadmaps = {
    'IBM': [
        {
            year: 2021,
            qubits: 127,
        },
        {
            year: 2022,
            qubits: 433,
        },
        {
            year: 2023,
            qubits: 1121,
        },
        {
            year: 2025,
            qubits: 4158,
        },
    ],
    'Intel': [
        {
            year: 2017,
            qubits: 17,
        },
        {
            year: 2023,
            qubits: 49,
        },
    ],
    'IQM': [
        {
            year: 2021,
            qubits: 5,
        },
        {
            year: 2023,
            qubits: 20,
        },
        {
            year: 2024,
            qubits: 54,
        },
        {
            year: 2025,
            qubits: 150,
        },
    ],
}

//map[roadmap] = [[year1, qubits1], [year2, qubits2], ...]
const roadmapToProjections = computed(() => {
    let r = {};
    for (let roadmap in roadmaps) {
        r[roadmap] = years.map(year => [year, Math.pow(2,estimateQubits2(roadmap, year)/1000)]);
    }
    return r;
});

const roadmapToHighlight = ref({});
const roadmapToYear = ref({}); //maps roadmaps to the year in which it's QEA to use said roadmap (x value when curve intercepts nStar)

//calculates all points needed to be included in the series for each projection including the nstar intercept
const roadmapToPoints = computed(() => {
    let r = {};
    for (let roadmap in roadmaps) {
        let l = [...roadmapToProjections.value[roadmap]];
        
        let year = findYear(roadmap, store.nStar);
        if (year != -1) {
            roadmapToYear.value[roadmap] = year
            l.push([year, store.nStar]);
            l.sort((a, b) => a[0] - b[0]);

            let d = []
            for (let i = 0; i < l.length; i++) {
                let y = l[i][0];
                if (y >= year) {
                    d.push([y, store.nStar, Math.min(l[i][1], 10**300)]);
                }
            }

            let highlight = {
                type: "arearange",
                data: d,
                showInLegend: false,
            }

            roadmapToHighlight.value[roadmap] = highlight;
        }
        
        r[roadmap] = l;
    }
    return r;
});

// function createHighlightData(points, year)

function findYear(roadmap, nStar) {
    if (!roadmaps[roadmap]) {
        console.log("this should never print");
        return -1;
    }

    //ASSUMES DATA POINTS ARE ALREADY SORTED
    const data = roadmaps[roadmap];
    const lastDataPoint = data[data.length-1];
    
    const lastYear = lastDataPoint.year;
    const lastQubits = lastDataPoint.qubits;

    // lastQubits * Math.pow(2, targetYear - lastYear)
    // console.log(`(${lastQubits} * 2^(n - ${lastYear}) - ${nStar}) = 0`)
    const physicalLogicalRatio = 1000;
    // const roots = nerdamer.solveEquations(`(${lastQubits} * 2^(n - ${lastYear}) - ${nStar}) = 0`, 'n');
    // const roots = nerdamer(`(log10(${physicalLogicalRatio} * ${nStar} / ${lastQubits}) / log10(2)) + ${lastYear}`).evaluate();
    const roots = nerdamer(`log(${physicalLogicalRatio} * log(${nStar}) / log(2) / ${lastQubits})/log(2) + ${lastYear}`).evaluate();
    const year = Number(roots.text("decimals"));
    // console.log("right here", year)
    if (year < 2020) { //NEED BETTER WAY TO LOG ERRORS
        console.log("no intercept could be found")
        return -1;
    }

    return Math.round(year * 100) / 100;

}

const graphSeriesMap = computed(() => {
    // console.log("in map")

    let s = {}; //map["IBM"] = series object
    for (let roadmap in roadmaps) {
        // let points = years.map(year => [year, Math.pow(2,estimateQubits2(roadmap, year)/1000)]);
        let points = roadmapToPoints.value[roadmap];
        let series = {
            name: roadmap + " Feasibility",
            data: points,
            zoneAxis: "y",
            zones: [{
                value: store.nStar,
                dashStyle: "shortdash"
            }, {
                dashStyle: 'solid'
            }]   
        }
        s[roadmap] = series;
    }

    return s;
});

const graphSeriesList = computed(() => {
    // console.log("in list")

    let l = [];
    let earliestIntercept = Number.POSITIVE_INFINITY; //earliest year in which a roadmap becomes QEA

    for (let i = 0; i < store.selectedHardwares.length; i++) {
        let hardware = store.selectedHardwares[i];

        if (! (hardware.name in graphSeriesMap.value)) {
            console.log("selected hardware does not have a roadmap!!!");
            continue;
        }
        l.push(graphSeriesMap.value[hardware.name])

        if (! (hardware.name in roadmapToHighlight.value)) {
            console.log("selected hardware could not be highlighted");
            continue;
        }
        l.push(roadmapToHighlight.value[hardware.name])

        if (! (hardware.name in roadmapToYear.value)) {
            console.log("selected hardware's intercept is unknown'");
            continue;
        }
        earliestIntercept = Math.min(earliestIntercept, roadmapToYear.value[hardware.name]);
    }

    if (l.length == 0) {
        console.log("its zero length")
        l = [{name: "No Hardware Selected"}];
    }

    let nStarData = [];
    for (let i = 0; i < years.length; i++) {
        let y = years[i];
        nStarData.push([y, store.nStar]);
    }
    l.push({
        color: "red",
        data: nStarData,
        showInLegend: false,
        zoneAxis: "x",
        zones: [
            {
                value: earliestIntercept,
                dashStyle: "shortdash"
            }, 
            {
            dashStyle: 'solid'
            }
        ] ,
        dataLabels: [{
            enabled: true,
            useHTML: true,

            format: `N* = ${toBase10HTML(store.nStar)} <br>Net Algorithmic Advantage`,
            style: {
                color: 'black'
            },
            filter: {
                property: "index",
                operator: "==",
                value: 0
            }
        }]
    });

    return l;
});

function estimateQubits2(organization, targetYear) {
    if (!roadmaps[organization]) {
        console.log("this should never print");
        return `No data available for ${organization}`;
    }
    
    //ASSUMES DATA POINTS ARE ALREADY SORTED
    const data = roadmaps[organization];
    const lastDataPoint = data[data.length-1];
    
    const lastYear = lastDataPoint.year;
    const lastQubits = lastDataPoint.qubits;

    return lastQubits * Math.pow(2, targetYear - lastYear);
}

function estimateQubits(organization, targetYear) {
    if (!roadmaps[organization]) {
        return `No data available for ${organization}`;
    }

    const data = roadmaps[organization];
    const sortedData = data.sort((a, b) => a.year - b.year); // Ensure data is sorted by year
    const lastDataPoint = sortedData[sortedData.length - 1];

    if (targetYear > lastDataPoint.year) {
        // Doubling the qubits for each year beyond the last known year
        const yearsDifference = targetYear - lastDataPoint.year;
        return lastDataPoint.qubits * Math.pow(2, yearsDifference);
    }

    // Find the two closest years for interpolation
    let before = null;
    let after = null;
    for (const entry of sortedData) {
        if (entry.year === targetYear) {
            return entry.qubits; // Exact year match
        } else if (entry.year < targetYear) {
            before = entry;
        } else if (entry.year > targetYear && !after) {
            after = entry;
        }
    }

    // Linear interpolation if both before and after are found
    if (before && after) {
        const slope = (after.qubits - before.qubits) / (after.year - before.year);
        return Math.round(before.qubits + slope * (targetYear - before.year));
    }

    // Return the closest known data if only one point is found
    return before ? before.qubits : after.qubits;
}

const years = Array.from({ length: 31 }, (_, i) => i + 2020);

function toBase10HTML(number) { //??? if this exact function exists elsewhere, it may be best to call them both from a single place
    // Calculate the base 10 logarithm of the number.
    var exponent = Math.log10(number);
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }

    return `10<sup>${Math.round(exponent * 100) / 100}</sup>`;
}

const chartOptions = {
    chart: {
        type: 'spline',
        zoomType: 'xy',
        events: {
            render() {
                console.log("ren")
                const chart = this;
                // console.log('roadmap year', roadmapToYear)
                for (let i = 0; i < store.selectedHardwares.length; i++) {
                    let hardware = store.selectedHardwares[i];
                    let roadmap = hardware.name;
                    // console.log("roadmap", roadmap)
                    
                    if (roadmap in roadmapToYear.value) {
                        // console.log("roadmap worked")
                        let year = roadmapToYear.value[roadmap];
                        chart.renderer
                        .path([`M ${chart.xAxis[0].toPixels(year)} ${chart.yAxis[0].toPixels(1)} L ${chart.xAxis[0].toPixels(year)} ${chart.yAxis[0].toPixels(store.nStar)} Z`])
                            .attr({ 'stroke-dasharray': 4, zIndex: 10, dashStyle: 'ShortDash', stroke: "black",}) //stroke: 'green'
                            // .animate({ opacity: 1 }, { duration: 5000 })
                            .add();
                            
                    }
                }
            }
        }
    },
    title: {
        text: 'Quantum Economic Advantage'
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `Problem Size: ${toBase10HTML(this.y)}<br>Year: ${this.x}`;
        }
    },
    xAxis: {
        title: {
            text: 'Year',
        },

    },
    yAxis: {
        title: {
            text: 'Problem Size'
        },
        // plotLines: [{
        //     color: 'red',
        //     width: 2,
        //     value: store.nStar ? store.nStar : 1,

        //     label: {
                // y: -20,
                // useHTML: true,

                // rotation: 0,
                // text: `N* = ${toBase10HTML(store.nStar)} <br>Net Algorithmic Advantage`,
                // align: 'left',
                // verticalAlign: 'bottom',
                // orientation: 'horizontal',
                // style: {
                //     color: 'red'
                // }
        //     },
        //     zIndex: 5
        // }],
        type: 'logarithmic',
        labels: {

            useHTML: true,
            formatter: function () {
                return toBase10HTML(this.value);
            }
        },
        min: 1,
        max: store.nStar ? store.nStar * store.nStar : 1000000

    },
    series: 
        graphSeriesList,
    plotOptions: {
        series: {
            marker: {
                enabled: false
            }
        }
    },
}

const key = ref(0);

watch([store], () => {
    chartOptions.yAxis.max = store.nStar ? store.nStar * store.nStar : 1000000;
    chartOptions.series = graphSeriesList.value;
    key.value += 1;

}
,{immediate:true}
)

</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>