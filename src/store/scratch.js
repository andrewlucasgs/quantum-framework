import * as math from 'mathjs';

function applyLogRules(node) {
    if (node.isOperatorNode && node.op === '*') {
        // log10(a * b) -> log10(a) + log10(b)
        // const transformedArgs = node.args.map(arg => applyLogRules(new math.FunctionNode(new math.SymbolNode('log10'), [arg])));
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
        return new Math.OperatorNode("-", "subtraction", [
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
            // applyLogRules(new math.FunctionNode(new math.SymbolNode('log10'), [base]))
        ]);
    } 
    else if (node.isParenthesisNode) {
        return applyLogRules(node.content)
    }
    else if (node.isOperatorNode || node.isFunctionNode || node.isSymbolNode || node.isConstantNode) {
        return new math.FunctionNode(new math.SymbolNode("log10"), [node])
    }
    // else if (node.isFunctionNode && node.name === 'log' && node.args.length === 2) {
    //     // log(n, b) -> log10(n) / log10(b)
    //     const [arg1, arg2] = node.args;
    //     return new math.OperatorNode('/', 'divide', [
    //         applyLogRules(new math.FunctionNode(new math.SymbolNode('log10'), [arg1])),
    //         applyLogRules(new math.FunctionNode(new math.SymbolNode('log10'), [arg2]))
    //     ]);
    // } 
    // else if (node.isFunctionNode && node.name === 'log10' && node.args.length === 1) {
    //     // Continue simplifying inside log10
    //     const [arg] = node.args;
    //     return new math.FunctionNode(new math.SymbolNode('log10'), [applyLogRules(arg)]);
    // } 
    // else if (node.isOperatorNode || node.isFunctionNode) {
    //     // Recursively apply log rules to all arguments
    //     node.args = node.args.map(applyLogRules);
    // }
    return node;
}

function main() {
    // const originalExpression = 'log(n, 2) * 10 ^ (hws) * n ^ (0.5 / 0.5)';
    const originalExpression = 'e^((64/9 * n)^(1/3) * log(n, e)^(2/3))';
    // const originalExpression = 'n^2* log2(n) * (10 * (n+5))';

    let scope = {
        n: Math.pow(10, 1.83),
        // n: Math.pow(10, 11),
        hws: 3.78
    }

    const parsedExpression = math.parse(originalExpression);

    const transformedExpression = applyLogRules(parsedExpression);
    const simplifiedExpression = math.simplify(transformedExpression);

    console.log(`Original expression: ${originalExpression}`);
    console.log(`Parsed expression: ${parsedExpression}`);
    console.log(`Transformed expression: ${transformedExpression}`);
    console.log(`Simplified expression: ${simplifiedExpression}`);
    // console.log(`Original Result: ${parsedExpression.evaluate(scope)}`);
    // console.log(`Log Result: ${simplifiedExpression.evaluate(scope)}`);
    // console.log(`Log Result: ${math.parse(simplifiedExpression.toString() + "- hws - log(log(n, 2), 10) - log(n, 10) - 2 * log(n, 10)").evaluate(scope)}`);
}

main();
