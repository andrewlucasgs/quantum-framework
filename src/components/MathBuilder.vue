<script setup>
import { ref, onMounted, computed } from 'vue';

const parameters = {
    classicalRuntime: (n) => Math.exp(Math.pow((64 / 9) * n, 1 / 3) * Math.pow(Math.log(n), 2 / 3)),
    quantumRuntime: (n) => Math.pow(n, 2) * Math.log(n),
    classicalRuntimeLabel: "O(e^{(64/9 * n)^{1/3} * \\ln(n)^{2/3}})",
    quantumRuntimeLabel: "O(n^{2} * \\ln(n))",
    qubitToProblemSize: "{# of qubits}",
    penalty: "log(n,2)",

    hardwareSlowdown: 10**3.78,
    quantumImprovementRate: 10,
    physicalLogicalQubitsRatio: 1000,
    ratioImprovementRate: 10,
    roadmap: {
        2020: 27,
        2022: 127,
        2024: 133,
        2025: 156,
        2029: 200,
        2033: 2000,
    },
    extrapolationType: "exponential",
}

function findRoot(func, initialGuess = 2, tolerance = 1e-7, maxIterations = 1000) {
  function derivative(f, x, h = 1e-7) {
    return (f(x + h) - f(x)) / h;
  }

  let n = initialGuess;
  for (let i = 0; i < maxIterations; i++) {
      const fValue = func(n);
    const fDerivative = derivative(func, n);

    if (Math.abs(fValue) < tolerance) {
      return n;
    }

    if (fDerivative === 0) {
      throw new Error('Derivative is zero. No solution found.');
    }

    n -= fValue / fDerivative;
  }
  throw new Error('Maximum iterations reached. No solution found.');
}

// Example usage:
const f = n => Math.exp(Math.pow((64 / 9) * n, 1 / 3) * Math.pow(Math.log(n), 2 / 3)) - ((Math.pow(n, 2) * Math.log(n)) * (10 ** 3.78) * Math.log10(n));


try {
  const root = findRoot(f, 60); // Adjusted initial guess
  console.log('Root found:', root);
} catch (error) {
  console.error(error.message);
}



</script>

<template>
    <div class="flex flex-col">
       
    </div>
</template>