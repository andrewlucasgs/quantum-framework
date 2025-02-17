import * as utils from "/Users/fred/Desktop/FutureTech/quantum-framework/src/store/utils.js"
import * as math from 'mathjs';

const problems = [
    {
        problemName: "Integer Factorization",
        // classicalRuntimeInput: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        classicalRuntimeInput: "(e^((64/9 * n)^(1/3) * log(n, e)^(2/3))) / p",
        classicalWork: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        quantumRuntimeInput: "n^(2) * log(n, e)",
        quantumWork: "n^(2) * log(n, e) * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Database Search",
        // classicalRuntimeInput: "n",
        classicalRuntimeInput: "n/p",
        classicalWork: "n",
        quantumRuntimeInput: "sqrt(n)",
        quantumWork: "sqrt(n) * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "2^{q}",
    },
    {
        problemName: "Traveling Salesman",
        // classicalRuntimeInput: "n^3 * 2^n",
        classicalRuntimeInput: "n^3 * 2^n / p",
        classicalWork: "n^3 * 2^n",
        quantumRuntimeInput: "n * 1.78^n",
        quantumWork: "n * 1.78^n * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        // classicalRuntimeInput: "n^3",
        classicalRuntimeInput: "n^3 /p",
        classicalWork: "n^3",
        quantumRuntimeInput: "n",
        quantumWork: "n * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        // classicalRuntimeInput: "(2 * pi * n)^(1/2) * (n / e)^n",
        classicalRuntimeInput: "(2 * pi * n)^(1/2) * (n / e)^n / p",
        classicalWork: "(2 * pi * n)^(1/2) * (n / e)^n",
        quantumRuntimeInput: "n^5",
        quantumWork: "n^5 * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
    },
];


const hardwares = [
    {
        category: "Established builders",
        hardwareName: "IBM (Superconducting)",
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: -10,
        roadmap: {
            2020: 27,
            2022: 127,
            2024: 133,
            2025: 156,
            2029: 200,
            2033: 2000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        hardwareSlowdown: 6.7,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 32,
        ratioImprovementRate: -10,
        roadmap: {
            2021: 22,
            2022: 25,
            2023: 29,
            2024: 35,

            2025: 1024,
            2026: 4096,
            2027: 12288,
            2028: 32768,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
    },
    {
        hardwareName: "Pasqal (Neutral Atom)",
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -10,
        roadmap: {
            2022: 200,
            2024: 1000,
            2026: 10000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        reference: "https://www.hpcwire.com/2024/03/13/pasqal-issues-roadmap-to-10000-qubits-in-2026-and-fault-tolerance-in-2028/",
    },
];

//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, "exponential")
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }
    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - 2024) * Math.log10(ratioImprovementRate);
    if (adjustedPLQR < Math.log10(3)) { //minimum PLQR is 3
        adjustedPLQR = Math.log10(3)
    }

    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    return logLogicalQubits
}

//function returns the log of the problem size solvable, even though there is a "10 ** problemSize"
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit)

    if (qubitToProblemSize == "2^{q}") {
        // let problemSize = (logOfPhysicalQubits + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
        let problemSize = (logLogicalQubits + Math.log10(Math.log10(2)))
        return 10 ** problemSize;
    }
    else if (qubitToProblemSize == "2^(2^{q})") {
        // let problemSize = Math.pow(2, Math.pow(10, logOfPhysicalQubits) / physicalLogicalQubitsRatio) * Math.log10(2)
        let problemSize = Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2)
        return problemSize;
    }
    else if (qubitToProblemSize == "{q}") {
        // let problemSize = logOfPhysicalQubits -  Math.log10(physicalLogicalQubitsRatio)
        let problemSize = logLogicalQubits
        return problemSize;
    }
    else if (qubitToProblemSize == "log({q})") {
        // let problemSize = Math.log10(logOfPhysicalQubits - Math.log10(physicalLogicalQubitsRatio)) - Math.log10(Math.log10(2))
        let problemSize = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2))

        //true if logLogicalQubits is negative
        //(Amount of physical qubits is less than the ratio to achieve a single logical qubit)
        if (isNaN(problemSize)) {
            return 0;
        }

        return problemSize;
    }
    else {
        console.log("this should never print");
        return 0;
    }

}

// converts expression with q (qubits) to expression with n (problem size) by using the inverse of 
// the function specified by qubitToProblemSize parameter
function getQuantumWork(model) {
    let quantumWork = model.quantumWork;
    // console.log("quantum work was ", quantumWork);
    if (model.qubitToProblemSize === "2^{q}") {
        quantumWork = utils.replaceVariable(quantumWork, "q", "(log(n, 2))");
    }
    else if (model.qubitToProblemSize === "log({q})") {
        quantumWork = utils.replaceVariable(quantumWork, "q", "(2^n)");
    }
    else if (model.qubitToProblemSize === "{q}") {
        quantumWork = utils.replaceVariable(quantumWork, "q", "n");
    }
    else {
        console.log("this should never print");
    }
    // console.log("quantum work is ", quantumWork);
    return quantumWork;
}

// returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year) {
    let adjustmentFactor = Number(hardwareSlowdown) + (year - 2024) * Math.log10(quantumImprovementRate);

    if (adjustmentFactor == null || isNaN(adjustmentFactor)) {
        console.log("Adjustment factor is null or NaN");
        console.log(`adjustment factor: ${adjustmentFactor}, hardwareSlowdown: ${hardwareSlowdown}, quantumImprovementRate: ${quantumImprovementRate}, year: ${year}`);
        return 0;
    }

    adjustmentFactor = math.max(adjustmentFactor, 0);

    // console.log("processors: ", processors);
    let effectiveProcessors = processors + (year - 2024) * Math.log10(costImprovementRate);

    function evaluate(n) {
        let scope = {n: n, p: Math.pow(10, effectiveProcessors)};
        let value = logClassicalFunction(n, scope) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let upperBound = 10**100;
    let lowerBound = 2;
    let lastValue = evaluate(lowerBound);
    while (lowerBound < 50 && lastValue >= 0) {
        lowerBound += 0.25;
        let nextValue = evaluate(lowerBound);

        lastValue = nextValue;
    }
    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound, "QA bisection");

    if (result === null) {
        console.log(`null returned!!!! year was ${year} and adjustmentFactor was ${adjustmentFactor}`);
        console.log("lowerBound:", lowerBound, "upperBound:", upperBound);
        console.log("f(lowerBound):", evaluate(lowerBound), "f(upperBound):", evaluate(upperBound));
        return null;
    }
    else if (result == 0) {
        return 0;
    }
    else if (result == Infinity) {
        return Infinity;
    }
    

    // if (lowerBound > 2) {
    //     console.log(`Final lowerBound guess was ${lowerBound}`);
    // }

    return Math.log10(result);

}

function calculateQuantumEconomicAdvantage(model) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    let processors = model.processors;

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        //should probably be refactored eventually
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);
    
    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    // console.log("testing")
    // console.log(quantumAdvantage(2024))
    // console.log("testing again")
    // console.log(quantumAdvantage(3000))
    // console.log("done testing")

    const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000, "tStar in QEA");
    const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), 2024, 3000, "tCostStar in QEA");

    return [tStar, tCostStar];
}

function freeFeasible(model, parameter, targetYear, range) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    let processors = model.processors;

    function qf(roadmap) {
        let base = "getQuantumFeasible(targetYear, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)";
        base = base.replace(parameter, "parameter");
        return eval('(' + "parameter => " + base + ')');
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        //should probably be refactored eventually
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
    }

    // console.log("parameter: ", parameter)

    let quantumFeasible = qf(model.roadmap);
    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);

    let goal = quantumAdvantage(targetYear);
    // console.log("goal:", goal);
    // console.log(quantumFeasible(range[0]))
    // console.log(quantumFeasible(range[1]))

    const pStar = utils.bisectionMethod(p => goal - quantumFeasible(p), range[0], range[1]);

    // console.log("pStar:", pStar);
    // console.log("testYear:", testYear, "parameter:", parameter, "pStar:", pStar);
    return pStar;
}

function freeAdvantage(model, parameter, targetYear, range) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    let processors = model.processors;


    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        if (parameter == "costFactor") {
            parameter = "hardwareSlowdown";
        }
        if (parameter == "costImprovementRate") {
            parameter = "quantumImprovementRate";
        }

        let base = "getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, targetYear)";
        base = base.replace(parameter, "parameter");
        return eval('(' + "parameter => " + base + ')');
        // return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
    }

    // console.log("parameter: ", parameter)

    let quantumFeasible = qf(model.roadmap);
    let f = null;

    if (parameter[0] == "c") {
        f = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    }
    else {
        f = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    }


    let goal = quantumFeasible(targetYear);
    // console.log("goal:", goal);
    // console.log(f(range[0]))
    // console.log(f(range[1]))

    const pStar = utils.bisectionMethod(p => f(p) - goal, range[0], range[1]);


    // console.log("pStar:", pStar);
    // console.log("testYear:", testYear, "parameter:", parameter, "pStar:", pStar);
    return pStar;
}

function main() {
    let hardwareIndex = 2;
    let problemIndex = 4;
    let model = {...problems[problemIndex], ...hardwares[hardwareIndex],}
    model.processors = 5;

    let anchors = calculateQuantumEconomicAdvantage(model);

    for (let parameter of ["hardwareSlowdown", "costFactor", "quantumImprovementRate",  "costImprovementRate", "processors"]) {
        let anchorIndex = 0;
        if (parameter == "costFactor" || parameter == "costImprovementRate") {
            anchorIndex = 1;
        }

        for (let delta of [-1, 1]) {
            let targetYear = anchors[anchorIndex] + delta;
            let range = [0, 100];
            if (parameter.endsWith("Rate")) {
                range = [.00001, 1000];
            }

            let pstar = freeAdvantage(model, parameter, targetYear, range);
            let og = model[parameter];

            if (parameter.endsWith("Rate")) {
                pstar = (pstar - 1) * 100;
            }

            let dp = (pstar - og) / og;

            console.log("parameter: ", parameter, "original: ", og, "delta: ", delta, "target year: ", targetYear, "pstar: ", pstar, "dp: ", dp);
        }
    }

    for (let parameter of ["physicalLogicalQubitsRatio", "ratioImprovementRate"]) {
        let anchorIndex = 0;

        for (let delta of [-1, 1]) {
            let targetYear = anchors[anchorIndex] + delta;
            let range = [3, 100000000];
            if (parameter.endsWith("Rate")) {
                range = [.00001, 1000];
            }

            let pstar = freeFeasible(model, parameter, targetYear, range);
            let og = model[parameter];

            if (parameter.endsWith("Rate")) {
                pstar = (pstar - 1) * 100;
            }

            let dp = (pstar - og) / og;

            console.log("parameter: ", parameter, "original: ", og, "delta: ", delta, "target year: ", targetYear, "pstar: ", pstar, "dp: ", dp);
        }
    }
}

main()