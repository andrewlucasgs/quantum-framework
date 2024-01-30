import { defineStore } from 'pinia'
import { ref, computed, inject, watch } from 'vue'

import { useInputStore } from './input'

// let valuesCached = {
//     'n_sqrt(n)_IBM_6_50': {
//         quantumAdvantage: {
//             "nStar": 1000000000000,
//             "stepStar": 1000000000000,
//             "classicalSteps": [
//                 [
//                     1,
//                     1
//                 ],
//                 [
//                     1.318256738556407,
//                     1.318256738556407
//                 ],
//                 [
//                     1.7378008287493756,
//                     1.7378008287493756
//                 ]
//             ],
//             "quantumSteps": [
//                 [
//                     1,
//                     1000000
//                 ],
//                 [
//                     1.318256738556407,
//                     1148153.6214968825
//                 ],
//                 [
//                     1.7378008287493756,
//                     1318256.7385564072
//                 ]
//             ]
//         },
//         quantumEconomicAdvantage: {
//             "nStar": 15119339558.365707,
//             "tStar": 2026.0237305342573,
//             "quantumFeasible": [
//                 [
//                     2023,
//                     1.2516827219708337
//                 ],
//                 [
//                     2023.0302373053426,
//                     1.2781934662648657
//                 ]
//             ],
//             "quantumAdvantage": [
//                 [
//                     2023,
//                     12
//                 ],
//                 [
//                     2023.0302373053426,
//                     11.981795328207669
//                 ],
//                 [
//                     2023.060474610685,
//                     11.963590656415338
//                 ]
//             ]
//         }
//     }
// }

let qaCache = {}
let qeaCache = {}



export const useGraphStore = defineStore('graph', () => {
    const quantumAdvantage = ref(
        {
            // nStar: 1,
            // stepStar: 1,
            // classicalSteps: 1,
            // quantumSteps: 1
        }
    )
    const quantumEconomicAdvantage = ref(
        {
            // nStar: 1,
            // tStar: 1,
            // quantumFeasible: 1,
            // quantumAdvantage: 1
        }
    )
    const loading = ref(false)
    const inputStore = useInputStore()
    const pyodide = inject('pyodide')

    watch(inputStore, async (inputs) => {
        // const cachedValue = valuesCached[`${inputs.classicalRuntime}_${inputs.quantumRuntime}_${inputs.selectedHardware.name}_${inputs.hardwareSlowdown}_${inputs.improvementRate}`]
        // if (cachedValue) {
        //     quantumAdvantage.value = cachedValue.quantumAdvantage
        //     quantumEconomicAdvantage.value = cachedValue.quantumEconomicAdvantage
        //     loading.value = false
        //     return
        // }
        loading.value = true
        console.log('Updating graphs')

        
        let newQuantumAdvantage = {}
        let newQuantumEconomicAdvantage = {}


        let qaIndices = new Set() //hardware Indices that have had their QA previously calculated
        let qeaIndices = new Set() //hardware Indices that have had their QEA previously calculated
        let indices = [] //used to track original order of indices, just in case it's not consistent between reads
        let pyodideQuery = "["
            // `get_quantum_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${inputs.hardwareSlowdown}"),`
        for (const index in inputs.createdHardwares) {
            indices.push(index)
            let hardware = inputs.createdHardwares[index]

            let qaQueryString = `${inputs.classicalRuntime}_${inputs.quantumRuntime}__${hardware.hardwareSlowdown}`
            let qeaQueryString = `${inputs.classicalRuntime}_${inputs.quantumRuntime}__${hardware.hardwareString}`
            
            if (qaQueryString in qaCache) {
                qaIndices.add(index)
                newQuantumAdvantage[index] = qaCache[qaQueryString]
            }
            else {
                pyodideQuery = pyodideQuery.concat(`get_quantum_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${hardware.hardwareSlowdown}"),`)
            }
            
            if (qeaQueryString in qeaCache) {
                qeaIndices.add(index)
                newQuantumEconomicAdvantage[index] = qeaCache[qeaQueryString]
            }
            else {
                pyodideQuery = pyodideQuery.concat(`get_quantum_economic_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${hardware.hardwareSlowdown}", ${hardware.quantum_improvement_rate}, ${hardware.physical_logical_ratio}, ${hardware.growth_factor}, ${hardware.newest_qubits}, ${hardware.newest_year}),`)
            }
        }
        pyodideQuery = pyodideQuery.concat("]") //MIGHT NOT WORK WITH THE EXTRA COMMA FROM FOR LOOP

        
        await pyodide(pyodideQuery
        //     `[
        //     get_quantum_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${inputs.hardwareSlowdown}"),
        //     get_quantum_economic_advantage_data("${inputs.classicalRuntime}", "${inputs.quantumRuntime}", "10^${inputs.hardwareSlowdown}", ${inputs.improvementRate}, ${inputs.selectedHardware.physical_logical_ratio}, ${inputs.selectedHardware.newest_qubits}, ${inputs.selectedHardware.newest_year})
        // ]`
        ).then(({ result }) => {
            console.log('result', result)
            // quantumAdvantage.value = {
            //     nStar: result[0].get('n_star'),
            //     stepStar: result[0].get('step_star'),
            //     classicalSteps: result[0].get('classical_steps'),
            //     quantumSteps: result[0].get('quantum_steps')
            // }
            // quantumEconomicAdvantage.value = {
                //     nStar: result[1].get('n_star'),
                //     tStar: result[1].get('t_star'),
                //     quantumFeasible: result[1].get('quantum_feasible'),
                //     quantumAdvantage: result[1].get('quantum_advantage')
                // }
            // quantumEconomicAdvantage.value = {}

            // console.log("these are the created hardwares")
            // console.log(inputs.createdHardwares)
            // console.log('this is the query')
            // console.log(pyodideQuery)
            // console.log("qaCache")
            // console.log(qaCache)
            // console.log("qeaCache")
            // console.log(qeaCache)
            // console.log("indices")
            // console.log(indices)
            let resultIndex = 0
            for (let i = 0; i < indices.length; i++) {
                let index = indices[i]
                let hardware = inputs.createdHardwares[index]
                let qaQueryString = `${inputs.classicalRuntime}_${inputs.quantumRuntime}__${hardware.hardwareSlowdown}`
                let qeaQueryString = `${inputs.classicalRuntime}_${inputs.quantumRuntime}__${hardware.hardwareString}`

                if (! (qaQueryString in qaCache)) {
                    // console.log("resultIndex")
                    // console.log(resultIndex)
                    let qaData = {
                        nStar: result[resultIndex].get('n_star'),
                        stepStar: result[resultIndex].get('step_star'),
                        classicalSteps: result[resultIndex].get('classical_steps'),
                        quantumSteps: result[resultIndex].get('quantum_steps')
                    }
                    resultIndex += 1

                    newQuantumAdvantage[index] = qaData
                    qaCache[qaQueryString] = qaData
                }
                if (! (qeaQueryString in qeaCache)) {
                    // console.log("resultIndex")
                    // console.log(resultIndex)
                    let qeaData = {
                        nStar: result[resultIndex].get('n_star'),
                        tStar: result[resultIndex].get('t_star'),
                        quantumFeasible: result[resultIndex].get('quantum_feasible'),
                        quantumAdvantage: result[resultIndex].get('quantum_advantage')
                    }
                    resultIndex += 1

                    newQuantumEconomicAdvantage[index] = qeaData
                    qeaCache[qeaQueryString] = qeaData
                }
            }


            // console.log('quantumAdvantage', quantumAdvantage.value)
            // console.log('quantumEconomicAdvantage', quantumEconomicAdvantage.value)
            // valuesCached[`${inputs.classicalRuntime}_${inputs.quantumRuntime}_${inputs.selectedHardware.name}_${inputs.hardwareSlowdown}_${inputs.improvementRate}`] = {
            //     quantumAdvantage: quantumAdvantage.value,
            //     quantumEconomicAdvantage: quantumEconomicAdvantage.value
            // }
            quantumAdvantage.value = newQuantumAdvantage
            quantumEconomicAdvantage.value = newQuantumEconomicAdvantage
            loading.value = false
           
            console.log("quantumAdvantage")
            console.log(quantumAdvantage.value)
            console.log("quantumEconomicAdvantage")
            console.log(quantumEconomicAdvantage.value)
            

        }).catch((error) => {
            console.log('error', error)
            loading.value = false
        })

    }, {
        immediate: true
    })

    return { quantumAdvantage, quantumEconomicAdvantage, loading }
})