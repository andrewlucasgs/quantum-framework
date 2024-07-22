import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'

const modelTemplate = {
    id: 1,
    problemName: "Database Search",
    "classicalRuntime": 'n',
    "quantumRuntime": 'n**(1/2)',
    classicalRuntimeLabel: "O(n)",
    quantumRuntimeLabel: "O(\\sqrt{n})",
    hardwareName: 'IBM (Superconducting)',
    roadmap: {
        2020: 27,
        2022: 127,
        2024: 133,
        2025: 156,
        2029: 200,
        2033: 2000,
    },
    roadmapUnit: "physical",
    extrapolationType: 'exponential',
    hardwareSlowdown: 3.78,
    costFactor: '8',
    // hardwareSlowdown: 6,
    quantumImprovementRate: 10,
    physicalLogicalQubitsRatio: 1000,
    ratioImprovementRate: 10,
    costImprovementRate: 10,
    qubitToProblemSize: "2^{# of qubits}",
    // qubitToProblemSize: "{# of qubits}",
    penalty: "log(n,2)",
    quantumOnly: false,

}

function deepClone(obj) {
    const clone = Array.isArray(obj) ? [] : {};

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        clone[key] = (typeof value === "object" && value !== null) ? deepClone(value) : value;
    });

    return clone;
}

export const useModelsStore = defineStore('models', () => {
    const models = ref(
        [

            deepClone(modelTemplate)
        ]
    )

    function addModel() {
        const model = deepClone(modelTemplate)
        if (models.value.length === 0) {
            model.id = 1
        } else {
            model.id = Math.max(...models.value.map(m => m.id)) + 1
        }
        models.value.push(model)
        // i = current scroll position
        var i = window.scrollY;
        var int = setInterval(function () {
            window.scrollTo(0, i);
            i += 20;
            if (i >= document.body.scrollHeight) clearInterval(int);
        }, 10);

    }

    function removeModel(id) {
        models.value = models.value.filter(m => m.id !== id)
    }


    function duplicateModel(id) {
        const model = models.value.find(m => m.id === id)
        const clone = deepClone(model)
        clone.id = Math.max(...models.value.map(m => m.id)) + 1
        clone.roadmap = JSON.parse(JSON.stringify(model.roadmap))

        models.value.push(clone)
        // scroll to bottom
        var i = window.scrollY;
        var int = setInterval(function () {
            window.scrollTo(0, i);
            i += 20;
            if (i >= document.body.scrollHeight) clearInterval(int);
        }, 10);
    }

    function updateModel(id, model) {
        models.value = models.value.map(m => m.id === id ? model : m)
    }

    return {
        models,
        updateModel,
        addModel,
        removeModel,
        duplicateModel
    }
})
