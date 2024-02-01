import { defineStore } from 'pinia'
import { ref } from 'vue'



export const useInputStore = defineStore('input', () => {
  const classicalRuntime = ref('n')
  const quantumRuntime = ref('sqrt(n)')
  // const hardwareSlowdown = ref(6)
  // const improvementRate = ref(50)

  //createdHardwares = {creationIndex: hardware map}
  const createdHardwares = { 
    0: {
    hardwareString: "IBM_6_50_1000_2",
    name: "IBM",
    hardwareSlowdown: 6,
    quantum_improvement_rate: 50,
    physical_logical_ratio: 1000,
    growth_factor: 2,
    newest_qubits: 4158,
    newest_year: 2025
    }
  }
    const hardwareSet = ref(new Set(["IBM_6_50_1000"]))
    const totalCreated = ref(1)

    const hardwareSlowdownAdvancedOptions = ref({
      speed: 10000,
      gateOverhead: 100,
      algorithmConstant: 1,
    })


  // const selectedHardware = {
  //   name: "IBM",
  //   physical_logical_ratio: 1000,
  //   newest_year: 2025,
  //   newest_qubits: 4158
  //   // slowdown: 6,
  //   // improvement_rate: 2,
  //   }


  return { classicalRuntime, quantumRuntime, createdHardwares, hardwareSet, totalCreated, hardwareSlowdownAdvancedOptions }
})