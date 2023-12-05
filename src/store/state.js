import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import nerdamer from 'nerdamer';
import 'nerdamer/Solve';


export const useStateStore = defineStore('state', () => {
  const classicalRuntime = ref('n')
  const quantumRuntime = ref('sqrt(n)')

  const hardwareSlowdown = ref(6)


  const nStar = computed(() => {
    const classicalTime = nerdamer(classicalRuntime.value).evaluate();
    const quantumTime = nerdamer(quantumRuntime.value).evaluate();
    const hw = nerdamer(hardwareSlowdown.value).evaluate();

    const roots = nerdamer.solveEquations((`${classicalTime} - (${quantumTime} * (10^${hw}))`), 'n')
    console.log('roots', roots)
    if (roots.length === 0) {
      return 'No solution'
    }
    //    return first solution bigger than 0
    for (let i = 0; i < roots.length; i++) {
      if (roots[i] > 1.1) {
        return Math.round(Number(roots[i].text('decimals')))
      }
    }
    return Math.round(Number(roots[0].text('decimals')))



  });



  return { classicalRuntime, quantumRuntime, hardwareSlowdown, nStar }
})