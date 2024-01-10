import { defineStore } from 'pinia'
import { ref } from 'vue'



export const useInputStore = defineStore('input', () => {
  const classicalRuntime = ref('n')
  const quantumRuntime = ref('sqrt(n)')
  const hardwareSlowdown = ref(6)
  const improvementRate = ref(50)

  // const selectedHardwares = [{
  //   name: "IBM",
  //   physical_logical_ratio: 1000,
  //   newest_year: 2023,
  //   newest_qubits: 4158
  //   // slowdown: 6,
  //   // improvement_rate: 2,
  //   }]
  const selectedHardware = {
    name: "IBM",
    physical_logical_ratio: 1000,
    newest_year: 2023,
    newest_qubits: 4158
    // slowdown: 6,
    // improvement_rate: 2,
    }


  return { classicalRuntime, quantumRuntime, hardwareSlowdown, improvementRate, selectedHardware }
})