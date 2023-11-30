<script setup>
import { computed, ref, watch } from "vue";
import { Chart } from 'highcharts-vue'
import latex_to_js from './composables/latex_to_js.js'
import { evaluate } from 'mathjs'



const classicalRuntime = ref("n");
const quantumRuntime = ref("\\sqrt{n}");

const logicalQubits = ref("1000");
const hardwareSlowdown = ref(6);
const projectedQubits = ref("IBM");

const hardwares = ref([]);

const problems = ref([
  {
    name: "Search",
    classicalRuntime: "n",
    quantumRuntime: "\\sqrt{n}",
  },
  {
    name: "N squared",
    classicalRuntime: "n^2",
    quantumRuntime: "n*log10(n)",
  },
  {
    name: "Exponential",
    classicalRuntime: "2^n",
    quantumRuntime: "n^2",
  }
]);

const selectedProblem = ref(problems.value[0]);

watch(selectedProblem, () => {
  console.log(selectedProblem.value)
  classicalRuntime.value = selectedProblem.value.classicalRuntime;
  quantumRuntime.value = selectedProblem.value.quantumRuntime;
})

const quantumIsFaster = computed(() => {
  const f = (n) => evaluate(`(10^${hardwareSlowdown.value}) * (${latex_to_js(quantumRuntime.value)})`, { n: n });
  const g = (n) => evaluate(latex_to_js(classicalRuntime.value), { n: n });
  return findN(f, g)
  return bisectionMethod(0.1, 10 ** 300, (n) => g(n) - f(n), 0.01)
})



const quantumPoints = computed(() => {
  let points = [];
  let quantumFunction = (n) => evaluate(`(10^${hardwareSlowdown.value}) * (${latex_to_js(quantumRuntime.value)})`, { n: n });
  const nValues = [
    1,
    Math.sqrt(quantumIsFaster.value),
    quantumIsFaster.value * 1,

    quantumIsFaster.value * quantumIsFaster.value,
  ]

  for (let i of nValues) {
    points.push({ y: quantumFunction(i), x: i });
  }
  return [...points.map((point) => ({
    y: point.y === 0 ? 0 : Math.log10(point.y),
    x: point.x === 0 ? 0 : Math.log10(point.x)
  }))]
})

const classicalPoints = computed(() => {
  let points = [];
  let classicalFunction = (n) => evaluate(latex_to_js(classicalRuntime.value), { n: n });
  if (quantumIsFaster.value === Infinity) {

  }
  const nValues = [
    1,
    Math.sqrt(quantumIsFaster.value),
    quantumIsFaster.value * 1,
    quantumIsFaster.value * Math.sqrt(quantumIsFaster.value),
    quantumIsFaster.value * quantumIsFaster.value,
  ]
  for (let i of nValues) {
    points.push({ y: classicalFunction(i), x: i });
  }
  // log(points);
  return [...points.map((point) => ({
    y: point.y === 0 ? 0 : Math.log10(point.y),
    x: point.x === 0 ? 0 : Math.log10(point.x)
  }))]
})


function findN(f, g, start = 0, end = 10 ** 300, tolerance = 0.1) {
  let mid = (start + end) / 2;
  while (true) {

    if (mid >= 10 ** 300) {
      return Infinity
    }
    let fresult = f(mid);
    let gresult = g(mid);
    if (Math.abs(fresult - gresult) <= tolerance) {
      return mid
    }
    if (fresult > gresult) {
      start = mid;
    } else {
      end = mid;
    }
    mid = (start + end) / 2;
  }
}

function bisectionMethod(a, b, f, tol) {
  var c = a;
  if (f(a) * f(b) > 0) {
    console.log("You have not assumed right a and b\n");
    return Infinity
  }
  while ((b - a) >= tol) {
    // Find middle point
    c = (a + b) / 2;

    // Check if middle point is root
    if (f(c) == 0.0)
      break;

    // Decide the side to repeat the steps
    if (f(c) * f(a) < 0)
      b = c;
    else
      a = c;
  }
  return c;
}

const chartOptions = ref({
  chart: {
  },
  title: {
    text: 'Number of Steps x Problem size'
  },
  xAxis: {
    title: {
      text: 'Problem Size'
    },
    plotLines: [{
      color: '#FF0000', // Red
      width: 2,
      value: quantumIsFaster.value < 1 ? Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 10)) / 10 : Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 100)) / 100,
      label: {
        useHTML: true,
        text: quantumIsFaster.value < 100 ? `N* = ${quantumIsFaster.value}` : `N* = 10<sup>${quantumIsFaster.value < 1 ? Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 10)) / 10 : Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 100)) / 100}</sup>`,
        rotation: 0,
        verticalAlign: 'bottom',
        style: {
          color: '#FF0000',
          fontWeight: 'bold'
        },
        y: -15,
      }

    }],


    labels: {
      useHTML: true,
      formatter: function () {
        if (quantumIsFaster.value < 100) {
          return `<p>${(10**this.value).toFixed(0)}</p>`
        }
        return `10<sup>${this.value}</sup>`
      }
    },
  },
  tooltip: {
    useHTML: true,
    formatter: function () {
      return `<b>${this.series.name}</b><br>
      # of Steps: 10<sup>${this.y.toFixed(2)}</sup> <br>Problem Size: 10<sup>${this.x.toFixed(2)}</sup>`
    }
  },
  yAxis: [
    {

      title: {
        text: '# classical steps'
      },

      labels: {
        useHTML: true,
        formatter: function () {

          return `10<sup>${this.value}</sup>`
        }
      },
    },
  ],
  series: [{
    name: 'Quantum',
    yAxis: 0,
    type: 'spline',
    color: '#0000FF',
    dataLabels: {
      enabled: true,
      useHTML: true,
      formatter: function () {
        // if last point
        if (this.point === this.series.data[this.series.data.length - 1]) {
          return `<span style="color: #0000FF; font-weight: bold;">${this.series.name}</span>`
        }
      }
    },

    // HIDE POINTS
    marker: {
      enabled: false
    },

    data: quantumPoints.value
  }, {
    type: 'line',
    name: 'Classical',
    data: classicalPoints.value,
    type: 'spline',
    color: "#006400",
    dataLabels: {
      enabled: true,
      useHTML: true,
      formatter: function () {
        // if last point
        if (this.point === this.series.data[this.series.data.length - 1]) {
          return `<span style="color: #006400; font-weight: bold;">${this.series.name}</span>`
        }
      }
    },
    marker: {
      enabled: false
    },
  }
  ]
})

const key = ref(0);

watch([quantumRuntime, classicalRuntime, hardwareSlowdown], () => {
  chartOptions.value.series[0].data = quantumPoints.value;
  chartOptions.value.series[1].data = classicalPoints.value;
  chartOptions.value.xAxis.plotLines[0].value = quantumIsFaster.value < 1 ? Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 10)) / 10 : Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 100)) / 100
  chartOptions.value.xAxis.plotLines[0].label.text = quantumIsFaster.value < 100 ? `N* = ${quantumIsFaster.value.toFixed(2)}` : `N* = 10<sup>${quantumIsFaster.value < 1 ? Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 10)) / 10 : Math.round(quantumIsFaster.value === 0 ? 0 : (Math.log10(quantumIsFaster.value) * 100)) / 100}</sup>`
  key.value += 1;

  console.log(quantumIsFaster.value)
  console.log(quantumPoints.value)
  console.log(classicalPoints.value)
})


</script>

<template>
  <div class="">
    <div class="p-4">
      <h1 class="text-4xl font-bold text-center uppercase">Quantum Advantage Calculator</h1>
    </div>
    <div class="bg-slate-100 flex gap-8 p-8">
      <div class="max-w-7xl mx-auto grid grid-cols-2 gap-8">
        <form class="w-64 flex flex-col gap-2 items-start">
          <h2 class="text-2xl font-bold text-slate-900">Problem</h2>
          <label for="problem" class=" font-bold text-slate-900">Problem</label>
          <select class="border-2 border-gray-500 bg-white rounded-md p-2 w-full" name="problem" id="problem"
            v-model="selectedProblem">
            <option v-for="problem in problems" :key="problem.name" :value="problem">{{ problem.name }}</option>
          </select>
          <label class=" font-bold text-slate-900" for="classicalRuntime">Classical Runtime:
          </label>
          <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="classicalRuntime" name="classicalRuntime"
            v-model="classicalRuntime">
          <label class=" font-bold text-slate-900" for="quantumRuntime">Quantum Runtime:
          </label>
          <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="quantumRuntime" name="quantumRuntime"
            v-model="quantumRuntime">

        </form>

        <form class="w-64 flex flex-col gap-2 items-start">
          <h2 class="text-2xl font-bold text-slate-900">Hardware</h2>
          <label class=" font-bold text-slate-900" for="logicalQubits">Logical Qubits:
          </label>
          <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="logicalQubits" name="logicalQubits"
            v-model="logicalQubits">
          <label class=" font-bold text-slate-900" for="hardwareSlowdown">Hardware Slowdown: 10 <sup>{{ hardwareSlowdown
          }}</sup>
          </label>
          <input id="hardwareSlowdown" v-model="hardwareSlowdown" type="range" min="0" max="50" step="1"
            class="my-4 w-full h-2 p-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-white border border-black">

          <label class=" font-bold text-slate-900" for="projectedQubits">Projected Qubits:
          </label>
          <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="projectedQubits" name="projectedQubits"
            v-model="projectedQubits">

        </form>
      </div>
    </div>
    <div class="max-w-7xl mx-auto mt-4">

      <Chart :key="key" :options="chartOptions" />
    </div>

  </div>
</template>
