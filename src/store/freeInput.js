import * as math from 'mathjs';
import { parse } from 'vue/compiler-sfc';

function main() {

    // let expression = "n^2 + log(n)";
    // parsedExpression.traverse(processNode);
    // console.log(parsedExpression.toTex());
    // console.log(parsedExpression.compile().evaluate(scope));

    // let expression = "n^(2) * log10(n) * e";
    // let expression = "(2 * pi * n)^(1/2) * (n / e)^n";
    let expression = "n^3 + 2^n";
    let parsedExpression = math.parse(expression);
    let logged = applyLogRules(parsedExpression);

    let scope = {n: 100, y: 2};
    
    
    // console.log(expression)
    console.log(parsedExpression.toString())
    console.log(logged.toString())
    // logged.traverse(processNode);
    // console.log(logged.compile().evaluate(scope));

    // console.log();
    
    // let replaced = expression.replaceAll("n", "(10^(y))");
    // let pr = math.parse(replaced)
    // let lr = applyLogRules(pr);
    // console.log(replaced)
    // console.log(pr.toString())
    // console.log(lr.toString());
    // console.log(lr.compile().evaluate(scope));

    // let l = createLoggedFunction(expression);
    // let c = createConvertedFunction(expression);
    // console.log(l(100) == c(2))
    // console.log(c(2))
}

function createLoggedFunction(expression) {
    let loggedTree = applyLogRules(math.parse(expression)).compile();
    function logged(value) {
        let scope = {n: value};
        return loggedTree.evaluate(scope);
    }
    return logged;
}

function createConvertedFunction(expression) {
    let replaced = expression.replaceAll("n", "(10^(n))");
    let convertedTree = applyLogRules(math.parse(replaced)).compile();
    function converted(value) {
        let scope = {n: value};
        return convertedTree.evaluate(scope);
    }
    return converted;
}



function applyLogRules(node) {
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

// Function to process each node
function processNode(node, path, parent) {
    console.log(`Node Type: ${node.type}`);
    
    // Log specific properties based on node type
    if (node.isOperatorNode) {
        console.log(`Operator: ${node.op}`);
    } else if (node.isConstantNode) {
        console.log(`Constant value: ${node.value}`);
    } else if (node.isSymbolNode) {
        console.log(`Symbol name: ${node.name}`);
    } else if (node.isFunctionNode) {
        console.log(`Function name: ${node.fn.name}`);
    } else {
        console.log("other");
    }

    console.log(`Node String: ${node.toString()}`);
}

main();


    // (2) * log10(n1) + log10(log10(n1)) + log10(e) + n1

    // n1 = 10 ** log10(n1) = 10 ** n2

    // 2 * n2 + log10(n2) + log10(e)

    // "n1^(2) * log10(n1) * e"
    // (10 ^ (n2))^2 * log10(10^n2) * e
    // 2 * n2 * log10(10) + n2 * log10(10) + log10(e)

    // n -> (10 ^ n)