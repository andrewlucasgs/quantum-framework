<script setup>
import { computed, ref, watch } from "vue";
import { Chart } from 'highcharts-vue'
import latex_to_js from './composables/latex_to_js.js'
import { evaluate, derivative, abs, parse, simplify, subtract } from 'mathjs'



const classicalRuntime = ref("n");
const quantumRuntime = ref("\\sqrt{n}");

const logicalQubits = ref("");
const hardwareSlowdown = ref(6);
const projectedQubits = ref("");

const problems = ref([]);
const hardwares = ref([]);


const addProblem = () => {
  console.log("addProblem");
  problems.value.push({
    classicalRuntime: classicalRuntime.value,
    quantumRuntime: quantumRuntime.value,
  });
  classicalRuntime.value = "";
  quantumRuntime.value = "";
};

const addHardware = () => {
  hardwares.value.push({
    logicalQubits: logicalQubits.value,
    hardwareSlowdown: hardwareSlowdown.value,
    projectedQubits: projectedQubits.value,
  });
  logicalQubits.value = "";
  hardwareSlowdown.value = "";
  projectedQubits.value = "";
};

const quantumIsFaster = computed(() => {
  const f = (n) => evaluate(`(10^${hardwareSlowdown.value}) * (${latex_to_js(quantumRuntime.value)})`, { n: n });
  const g = (n) => evaluate(latex_to_js(classicalRuntime.value), { n: n });
  // return findN(f, g)
  return bisectionMethod(0.1, 10 ** 300, (n) => f(n) - g(n), 0.01)
})



const quantumPoints = computed(() => {
  let points = [];
  let quantumFunction = (n) => evaluate(`(10^${hardwareSlowdown.value}) * (${latex_to_js(quantumRuntime.value)})`, { n: n });
  const nValues = [
    Math.sqrt(quantumIsFaster.value),
    quantumIsFaster.value * 1,
    quantumIsFaster.value * quantumIsFaster.value,
  ]

  console.log(nValues)
  for (let i of nValues) {
    points.push({ y: quantumFunction(i), x: Math.log10(i) });
  }
  return [{ y: 0, x: 0 }, ...points.map((point) => ({ y: Math.log10(point.y), x: point.x }))]
})

const classicalPoints = computed(() => {
  let points = [];
  let classicalFunction = (n) => evaluate(latex_to_js(classicalRuntime.value), { n: n });
  const nValues = [
    Math.sqrt(quantumIsFaster.value),
    quantumIsFaster.value * 1,
    quantumIsFaster.value * quantumIsFaster.value,
  ]
  for (let i of nValues) {
    points.push({ y: classicalFunction(i), x: Math.log10(i) });
  }
  // log(points);
  return [{ y: 0, x: 0 }, ...points.map((point) => ({ y: point.y == Infinity ? 25 : Math.log10(point.y), x: point.x }))]
})




function bisectionMethod(a, b, f, tol) {
  var c = a;
  if (f(a) * f(b) >= 0) {
    console.log("You have not assumed right a and b\n");
    return;
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
      value: Math.round(Math.log10(quantumIsFaster.value)),
      label: {
        useHTML: true,
        text: `N* = 10<sup>${Math.log10(quantumIsFaster.value).toFixed(2)}</sup>`,
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
        return `10<sup>${this.value}</sup>`
      }
    },
  },
  tooltip: {
    useHTML: true,
    formatter: function () {
      return `<b>${this.series.name}</b><br>
      # of Steps: 10<sup>${this.series.name === 'Quantum' ? this.y - 6 : this.y}</sup> <br>Problem Size: 10<sup>${this.x}</sup>`
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
    {
      title: {
        text: '# quantum steps'
      },
      min: -hardwareSlowdown.value,
      max: Math.log10(quantumIsFaster.value * quantumIsFaster.value),
   

      labels: {
        useHTML: true,
        formatter: function () {
          if (this.value >= 0) {
            return `10<sup>${this.value}</sup>`
          }
        }
      },
    },],
  series: [{
    name: 'Quantum',
    yAxis: 0,
    type: 'spline',
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
    marker: {
      enabled: false
    },
  }
  ]
})

const key = ref(0);

watch([quantumRuntime, classicalRuntime, hardwareSlowdown], () => {
  chartOptions.value.yAxis[1].min = -hardwareSlowdown.value;
  chartOptions.value.yAxis[1].max = Math.log10(quantumIsFaster.value * quantumIsFaster.value);
  chartOptions.value.series[0].data = quantumPoints.value;
  chartOptions.value.series[1].data = classicalPoints.value;
  chartOptions.value.xAxis.plotLines[0].value = Math.round(Math.log10(quantumIsFaster.value))
  chartOptions.value.xAxis.plotLines[0].label.text = `N* = 10<sup>${Math.log10(quantumIsFaster.value).toFixed(2)}</sup>`
  key.value += 1;
  console.log(classicalPoints.value)
})


</script>

<template>
  <div>
    {{ quantumIsFaster }}
    <div class="bg-slate-100 flex gap-8 p-8">
      <form class="w-64 flex flex-col gap-2 items-start" @submit.prevent="addProblem">
        <h2 class="text-2xl font-bold text-slate-900">Problem</h2>
        <label class=" font-bold text-slate-900" for="classicalRuntime">Classical Runtime:
        </label>
        <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="classicalRuntime" name="classicalRuntime"
          v-model="classicalRuntime">
        <label class=" font-bold text-slate-900" for="quantumRuntime">Quantum Runtime:
        </label>
        <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="quantumRuntime" name="quantumRuntime"
          v-model="quantumRuntime">

        <!-- <input class="border-2 border-gray-500 rounded-md p-2" type="submit" value="Add Problem"> -->
      </form>
      <form class="w-64 flex flex-col gap-2 items-start" @submit.prevent="addHardware">
        <h2 class="text-2xl font-bold text-slate-900">Hardware</h2>
        <label class=" font-bold text-slate-900" for="logicalQubits">Logical Qubits:
        </label>
        <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="logicalQubits" name="logicalQubits"
          v-model="logicalQubits">
        <label class=" font-bold text-slate-900" for="hardwareSlowdown">Hardware Slowdown: 10 <sup>{{ hardwareSlowdown
        }}</sup>
        </label>
        <input id="hardwareSlowdown" v-model="hardwareSlowdown" type="range" min="0" max="100" step="1"
          class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-white border border-black">

        <label class=" font-bold text-slate-900" for="projectedQubits">Projected Qubits:
        </label>
        <input class="border-2 border-gray-500 rounded-md p-2" type="text" id="projectedQubits" name="projectedQubits"
          v-model="projectedQubits">

        <!-- <input class="border-2 border-gray-500 rounded-md p-2" type="submit" value="Add Hardware"> -->
      </form>
    </div>
    <div class="bg-slate-100 flex gap-8 p-8">

      <div class="w-64">
        <h2 class="text-2xl font-bold text-slate-900">Problems</h2>
        <ul class="flex flex-col gap-2">
          <li v-for="problem in problems" :key="problem.classicalRuntime">
            <div class="flex gap-2">
              <span class="font-bold text-slate-900">Classical Runtime:</span>
              <span class="text-slate-900">{{ problem.classicalRuntime }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-slate-900">Quantum Runtime:</span>
              <span class="text-slate-900">{{ problem.quantumRuntime }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="w-64">
        <h2 class="text-2xl font-bold text-slate-900">Hardware</h2>
        <ul class="flex flex-col gap-2">
          <li v-for="hardware in hardwares" :key="hardware.logicalQubits">
            <div class="flex gap-2">
              <span class="font-bold text-slate-900">Logical Qubits:</span>
              <span class="text-slate-900">{{ hardware.logicalQubits }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-slate-900">Hardware Slowdown:</span>
              <span class="text-slate-900">{{ hardware.hardwareSlowdown }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold text-slate-900">Projected Qubits:</span>
              <span class="text-slate-900">{{ hardware.projectedQubits }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <Chart :key="key" :options="chartOptions" />

  </div>
</template>
