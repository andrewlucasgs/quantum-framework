
importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

console.log("pyodide.worker.js: start");

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
    await self.pyodide.loadPackage(["sympy"]);
    // run a simple test
    self.pyodide.runPython(`
import sympy as sp

def solve(classical, quantum, hardware_slowdown):

    classical = sp.simplify(classical)
    quantum = sp.simplify(quantum)
    hardware_slowdown = sp.simplify(hardware_slowdown)


    n = sp.symbols('n')
    solutions = sp.solve((classical) - ((quantum) * (hardware_slowdown)), n)
    solutions = [sp.N(solution) for solution in solutions]
    solutions = [float(solution) for solution in solutions if solution.is_real]
    solutions.sort()
    return solutions

def is_valid(expr):
    try:
        n = sp.symbols('n')
        sympy_expr = sp.sympify(expr)
        for sub_expr in sympy_expr.atoms(sp.Function):
            if isinstance(sub_expr, sp.core.function.AppliedUndef):
                return False

        return sympy_expr.free_symbols == {n} or sympy_expr.free_symbols == set()
    except sp.SympifyError:
        return False    

def get_points(expr, midPoint, start = 0, inverted=False):
    points = []
    n = sp.symbols('n')
    for i in range(start, 200):
        x = midPoint ** (i / 100)
        y = sp.sympify(expr).subs(n, x)
        if inverted:
            points.append([float(y), float(x)])
        else:
            points.append([float(x), float(y)])
    return sorted(points)

def get_quantum_advantage_data(classical, quantum, hardware_slowdown):
    validation = [is_valid(classical), is_valid(
        quantum), is_valid(hardware_slowdown)]
    if False in validation:
        return None
    solutions = solve(classical, quantum, hardware_slowdown)
    nStar = 1
    if len(solutions) > 0:
        nStar = solutions[-1] if solutions[-1] > 1 else float(sp.oo)
    midPoint = nStar if nStar > 1 and nStar < sp.oo else 1000000000000

    classical_points = get_points(classical, midPoint)

    quantum = sp.simplify(quantum)
    hardware_slowdown = sp.simplify(hardware_slowdown)
    quantumXHardware = sp.simplify(quantum * hardware_slowdown)
    quantum_points = get_points(quantumXHardware, midPoint)
    n = sp.symbols('n')
    step_star = sp.simplify(quantumXHardware).subs(n, nStar)    
    return {
        "n_star": nStar,
        "step_star": float(step_star),
        "classical_steps": classical_points,
        "quantum_steps": quantum_points
    }

def get_quantum_economic_advantage_data(classical_runtime, quantum_runtime, hardware_slowdown, current_year=2023, quantum_improvement_rate=2, physical_logical_qubits_ratio=1000, current_physical_qubits=4158):
    n = sp.Symbol('n')

    quantum_feasible = sp.simplify(f'log( (({physical_logical_qubits_ratio})*log( (n) , 2))/({current_physical_qubits}) , 2) + ({current_year})')
    quantum_advantage = sp.simplify(f'log( (({hardware_slowdown})*({quantum_runtime})/({classical_runtime}) ), ({quantum_improvement_rate})) + ({current_year})')

    quantum_feasible = sp.simplify(quantum_feasible)
    quantum_advantage = sp.simplify(quantum_advantage)


    intersection = sp.nsolve(quantum_feasible - quantum_advantage, n, 2)
    t = quantum_feasible.subs(n, intersection).evalf()

    return {
        "n_star": float(intersection),
        "t_star": float(t),
        "quantum_feasible": get_points(quantum_feasible, intersection, start=1, inverted=True),
        "quantum_advantage": get_points(quantum_advantage, intersection, start=1, inverted=True)
    }

    `);
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async function (event) {
    console.log("pyodide.worker.js: onmessage");
    await pyodideReadyPromise;
    const { python } = event.data;
    const result = self.pyodide.runPython(python);
    // convert result in json-serializable format
    if (result === undefined) {
        console.log("pyodide.worker.js: result is undefined");
        self.postMessage({ result: null });
        return;
    }
    jsResult = result.toJs();
    console.log("pyodide.worker.js: result", jsResult);
    self.postMessage({ result: jsResult });
}