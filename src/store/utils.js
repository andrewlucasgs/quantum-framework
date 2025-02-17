import * as math from 'mathjs';

//rounds input number to the specified number of digits
export function round(number, decimalDigits=2) {
    const factor = 10 ** decimalDigits
    return Math.round(number * factor) / factor
}

export function drawDashLine(chart, point, dashLine, color='rgba(255,0,0,0.3)') {
    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]

    const x = Math.round(xAxis.toPixels(point[0]))
    const y = Math.round(yAxis.toPixels((point[1])))
    const d = ['M', xAxis.left, y, 'L', x, y, 'L', x, yAxis.top + yAxis.height]

    return dashLine
        ? dashLine.attr({ d })
        : chart.renderer.path(d).attr({ 'stroke-dasharray': '8,4', 'stroke': color, 'stroke-width': 2, zIndex: 1 }).add()
}

//returns a string representing the year and quarter ("2024 Q2") of the input year
export function yearToQuarter(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const quarter = Math.floor(fraction * 4) + 1; // Calculates the quarter

    return `${year} Q${quarter}`;
}

//returns a string representing the year and month ("2024 Jun") of the input year
export function yearToMonth(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const monthIndex = Math.floor(fraction * 12); // Calculates the month index (0-11)

    // Array of month abbreviations
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Select the correct month abbreviation using the month index
    const monthAbbreviation = months[monthIndex];

    return `${year} ${monthAbbreviation}`;
}

//returns 10^{exponent} in html
export function toBase10HTML(exponent) {
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }

    return `10<sup>${round(exponent, 1)}</sup>`;
}

export function applyLogRules(node) {
    if (node.isOperatorNode && node.op === '*') {
        // log10(a * b) -> log10(a) + log10(b)
        const transformedArgs = node.args.map(arg => applyLogRules(arg));
        return transformedArgs.reduce((acc, arg) => new math.OperatorNode('+', 'add', [acc, arg]));
    } 
    if (node.isOperatorNode && node.op === '/') {
        // log10(a / b) -> log10(a) - log10(b)
        if (node.args.length != 2) {
            console.log("error applying log to division")
            return
        }
        let [numerator, denominator] = node.args
        return new math.OperatorNode("-", "subtract", [
            applyLogRules(numerator),
            applyLogRules(denominator)
        ])
    } 
    else if (node.isOperatorNode && node.op === '^') {
        // log10(a^b) -> b * log10(a)
        const [base, exponent] = node.args;
        return new math.OperatorNode('*', 'multiply', [
            exponent,
            applyLogRules(base)
        ]);
    } 
    else if (node.isParenthesisNode) {
        return applyLogRules(node.content)
    }
    else if (node.isOperatorNode || node.isFunctionNode || node.isSymbolNode || node.isConstantNode) {
        return new math.FunctionNode(new math.SymbolNode("log10"), [node])
    }
    else {
        console.log("parsing expression. this should never print")
    }

    return node;
}

export function createLoggedFunction(expression) {
    // let loggedTree = applyLogRules(math.parse(expression));
    // console.log(expression)
    // console.log(loggedTree.toString())
    // loggedTree = loggedTree.compile();

    let loggedTree = applyLogRules(math.parse(expression)).compile();
    function logged(value, scope = {n: value}) {
        // let scope = {n: value};
        return loggedTree.evaluate(scope);
    }
    return logged;
}

export function createConvertedFunction(expression) {
    let replaced = expression.replaceAll("n", "(10^(n))");
    return createLoggedFunction(replaced);
}

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

function exponentialInterpolation(xValues, yValues, x) {
    let i = 0;
    // Find the interval [x[i], x[i+1]] where the value x lies
    for (; i < xValues.length - 1; i++) {
        if (x <= xValues[i + 1]) break;
    }

    let x1 = xValues[i], y1 = yValues[i];
    let x2 = xValues[i + 1], y2 = yValues[i + 1];

    // Compute the logarithms of y1 and y2 for the interpolation in log-space
    let logY1 = Math.log(y1);
    let logY2 = Math.log(y2);

    // Perform linear interpolation in log-space
    let logY = logY1 + (logY2 - logY1) * (x - x1) / (x2 - x1);

    // Convert the interpolated value back to the original scale
    return Math.exp(logY);
}

const interpolationFunctions = {
    linear: linearInterpolation,
    exponential: exponentialInterpolation
}

// a map containing serialized strings of the inputs to the linear regression function mapped to their output regression
const regressionMap = new Map()

//returns log_10 of the number of qubits available based on inputs and saves the value to the regressionMap
export function getPhysicalQubits(year, roadmap, extrapolationType, baseFactor = 1) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    let qubits = Object.values(roadmap).map(Number);

    //actual value of the number of physical qubits
    let numberOfPhysicalQubits;
    //logOfPhysicalQubits variable holds log_{10} of the true number of physical qubits
    let logOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        numberOfPhysicalQubits = roadmap[year]
        logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
    } 
    else if (year > Math.max(...years)) {
        if (extrapolationType === 'linear') {
            let [lastYears, lastQubits] = [years.slice(-2), qubits.slice(-2)]
            let key = JSON.stringify([lastYears, lastQubits]);
            let regression;
            if (regressionMap.has(key)) {
                regression = regressionMap.get(key)
            }
            else{
                regression = simpleLinearRegression(lastYears, lastQubits);
                regressionMap.set(key, regression)
            }

            numberOfPhysicalQubits = regression.slope * year + regression.intercept;
            logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
        } 
        else {
            //exponential regression is just linear regression in log space
            let [lastYears, lastQubitsLog] = [years.slice(-2), qubits.slice(-2).map(x => Math.log10(x))]
            let key = JSON.stringify([lastYears, lastQubitsLog]);
            let regression;
            if (regressionMap.has(key)) {
                regression = regressionMap.get(key)
            }
            else{
                regression = simpleLinearRegression(lastYears, lastQubitsLog);
                regressionMap.set(key, regression)
            }

            // numberOfPhysicalQubits = 10 ** (regression.slope * year + regression.intercept);
            logOfPhysicalQubits = regression.slope * year + regression.intercept;

            // different logic to incorporate base factor.
            // let growthRate = Math.pow(qubits[qubits.length - 1] / qubits[qubits.length - 2], 1 / (years[years.length - 1] - years[years.length - 2]));
            // // logOfPhysicalQubits = Math.log10(qubits[qubits.length - 1]) + (year - years[years.length - 1]) * Math.log10(growthRate);
            // logOfPhysicalQubits = Math.log10(qubits[qubits.length - 1]) + (year - years[years.length - 1]) * Math.log10(growthRate * baseFactor);
        
        }

    } 
    else {
        numberOfPhysicalQubits = interpolationFunctions[extrapolationType](years, qubits, year)
        logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
    }

    return logOfPhysicalQubits
}

// find when f(x) = 0
// assumes f is a function such that f(a) * f(b) < 0 and f(b) > 0
// export function bisectionMethod(f, a, b, tol = 1e-7, maxIter = 10000000) {
// export function bisectionMethod(f, a, b, tol = 1e-7, maxIter = 400) {
export function bisectionMethod(f, a, b, description = "", tol = 1e-7, maxIter = 1000) {
    let fa = f(a);
    let fb = f(b);

    if (fa == null || fb == null || isNaN(fa) || isNaN(fb)) {
        console.log("fa or fb is null or NaN; returning null")
        console.log("Description: ", description) 
        console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, fa: ${fa}, fb: ${fb}`);
        return null;
    }

    if (fa >= 0) {
        // console.log("fa is positive. implies that classical is always more expensive")
        // console.log("Description: ", description) 
        // console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, fa: ${fa}, fb: ${fb}`);
        return 0;
    }
    if (fb < 0) {
        // console.log("fb is negative. implies that quantum is always more expensive")
        // console.log("Description: ", description) 
        // console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, fa: ${fa}, fb: ${fb}`);
        return Infinity;
    }
    
    let c = a;
    let fc = fa;
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        fc = f(c);
        if (fc == null || isNaN(fc)) {
            console.log("fc is null or NaN; returning null");
            console.log("Description: ", description) 
            console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, c: ${c}, fa: ${fa}, fb: ${fb}, fc: ${fc}`);
            return null;
        }
        if (Math.abs(fc) < tol || Math.abs(b - a) < tol) {
            // if (Math.abs(fc) >= tol) {
            //     console.log("binary search range tolerance reached before value tolerance. function is very sensitive to changes in input.")
            //     console.log("Description: ", description) 
            //     console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, c: ${c}, fa: ${fa}, fb: ${fb}, fc: ${fc}`);
            // }
            // else {
            //     console.log("smooth binary search")
            // }
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

    console.log("couldn't converge during binary search. returning last value") 
    console.log("Description: ", description) 
    console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, c: ${c}, fa: ${fa}, fb: ${fb}, fc: ${fc}`);
    return c;
}

//returns (log_10 of) the amount of logical qubits needed to achieve said problem size using the function specified by qubitToProblemSize
//(logSize parameter is log_10 of the actual problem size)
export function problemSizeToQubits(logSize, qubitToProblemSize) {
    let loglogicalQubits = 0;
    if (qubitToProblemSize == "2^{q}") {
        loglogicalQubits = Math.log10(logSize) - Math.log10(Math.log10(2))
    }
    else if (qubitToProblemSize == "2^(2^{q})") {
        loglogicalQubits = Math.log10(Math.log2(logSize / Math.log10(2)))
    }
    else if (qubitToProblemSize == "{q}") {
        loglogicalQubits = logSize
    }
    else if (qubitToProblemSize == "log({q})") {
        loglogicalQubits = Math.pow(10, logSize) * Math.log10(2)
    }
    else {
        console.log("this should never print, loglogicalQubits will be set to 0")
    }
    return loglogicalQubits;
}

export function replaceVariable(formula, oldVar, newVar) {
    // Match symbol (like `q`) only when it's not in a larger word (like `sqrt`)
    let regex = new RegExp(`(?<![a-zA-Z])${oldVar}(?![a-zA-Z])`, 'g');
    return formula.replace(regex, newVar);
}

// returns the fractional representation of the percentage input
// -20% -> 0.8, +30% -> 1.3
export function percentageToFraction(percentage) {
    return 1 + percentage / 100;
}