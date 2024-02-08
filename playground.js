function getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate = 2, year = 2024) {
    // Define the function to find roots for
    function toSolve(n) {
        const N = 10**n;
        // Calculate the adjustment factor for the quantum runtime
        let adjustmentFactor = hardwareSlowdown * (1 / Math.pow(quantumImprovementRate, year - 2024));
        // The function whose root we are trying to find

        return classicalRuntime(N) - (quantumRuntime(N) * adjustmentFactor) 
    }
    let result = bisectionMethod(toSolve, 0, 308);
    return result
}



function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio = 1000) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    let qubits = Object.values(roadmap);

    let numberOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        numberOfPhysicalQubits = roadmap[year];
    } else if (year > Math.max(...years)) {
        // Simplified linear regression for years > 2024
        let regression = simpleLinearRegression(years.filter(y => y > 2024), qubits.filter((_, index) => years[index] > 2024));
        numberOfPhysicalQubits = regression.slope * year + regression.intercept;
    } else {
        // Implement a simple linear interpolation
        numberOfPhysicalQubits = linearInterpolation(years, qubits, year);
    }

    let problemSize = Math.pow(2, numberOfPhysicalQubits / physicalLogicalQubitsRatio);
    return problemSize;
}



// Implement simpleLinearRegression and linearInterpolation functions based on your needs
function simpleLinearRegression(x, y) {
    let n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }
    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function linearInterpolation(xValues, yValues, x) {
    let i = 0;
    for (; i < xValues.length - 1; i++) {
        if (x <= xValues[i + 1]) break;
    }
    let x1 = xValues[i], y1 = yValues[i];
    let x2 = xValues[i + 1], y2 = yValues[i + 1];
    return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

// find when f(x) = 0
function bisectionMethod(f, a, b, tol = 1e-12, maxIter = 1000) {
    let fa = f(a);
    let fb = f(b);
    if (fa * fb >= 0) {
        return null;
    }

    let c = a;
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        let fc = f(c);
        if (fc === 0 || (b - a) / 2 < tol) {
            return c;
        }
        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
    }
    return c;
}




function qf(roadmap) {
    return year => Math.log10(getQuantumFeasible(year, roadmap));
}

function qa(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate) {
    return year => getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year)
}

function classical(n) {
    return Math.pow(n, 3);
}

function quantum(n) {
    return Math.pow(n, 2);
}



const ibmRoadmap = {
    2021: 127,
    2022: 433,
    2023: 1121,
    2024: 1386,
    2025: 4158,
    2033: 100000

}

let f = qf(ibmRoadmap);
let a = qa(classical, quantum, Math.pow(10, 6), 2);

const quantumEconomicAdvantage = (year) => {
    return f(year) - a(year);
}

console.log(bisectionMethod(quantumEconomicAdvantage, 0, 2111));