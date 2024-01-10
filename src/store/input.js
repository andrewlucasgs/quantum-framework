import { defineStore } from 'pinia'
import { ref } from 'vue'



export const useInputStore = defineStore('input', () => {
  const classicalRuntime = ref('n')
  const quantumRuntime = ref('sqrt(n)')
  const hardwareSlowdown = ref(6)
  const physicalToLogicalRatio = ref(1000)
  const numberOfQubitsGrowthRatio = ref(2)



  return { classicalRuntime, quantumRuntime, hardwareSlowdown, physicalToLogicalRatio, numberOfQubitsGrowthRatio }
})