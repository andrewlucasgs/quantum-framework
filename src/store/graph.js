import { defineStore } from 'pinia'
import { ref, computed, inject, watch } from 'vue'

import { useInputStore } from './input'

export const useGraphStore = defineStore('graph', () => {
    const quantumAdvantage = ref(
        {
            nStar: 0,
            stepStar: 0,
            classicalSteps: [],
            quantumSteps: []
        }
    )
    const quantumEconomicAdvantage = ref(
        {
            nStar: 0,
            tStar: 0,
            quantumFeasible: [],
            quantumAdvantage: []
        }
    )
    const loading = ref(true)
    const inputStore = useInputStore()
    const pyodide = inject('pyodide')

    watch(inputStore, async (inputs) => {
        loading.value = true
        console.log('Updating graphs')
        await pyodide(`[
            get_quantum_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${inputs.hardwareSlowdown}"),
            get_quantum_economic_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${inputs.hardwareSlowdown}")
        ]`).then(({ result }) => {
            console.log('result', result)
            quantumAdvantage.value = {
                nStar: result[0].get('n_star'),
                stepStar: result[0].get('step_star'),
                classicalSteps: result[0].get('classical_steps'),
                quantumSteps: result[0].get('quantum_steps')
            }
            quantumEconomicAdvantage.value = {
                nStar: result[1].get('n_star'),
                tStar: result[1].get('t_star'),
                quantumFeasible: result[1].get('quantum_feasible'),
                quantumAdvantage: result[1].get('quantum_advantage')
            }
            loading.value = false

        }).catch((error) => {
            console.log('error', error)
            loading.value = false
        })

    }, {
        immediate: true
    })

    return { quantumAdvantage, quantumEconomicAdvantage, loading }
})