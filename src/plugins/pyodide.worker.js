
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
    
    #function to get points but for the functions f(year) = problem size
    def get_points_feasible(expr, midPoint):
        points = []
        n = sp.symbols('n')
        
        current_year = 2024
        if midPoint < current_year:
            print("tStar less than current year?!")
    
        difference = midPoint - current_year
        for i in range(200):
            x = current_year + (i / 100) * difference
            y = sp.sympify(expr).subs(n, x)
            points.append([float(x), float(y)])
        return points
    
    def get_points_advantage(expr, staticNStar, nStar):
        n = sp.Symbol('n')
    
        # start = sp.nsolve(f'{expr} - {current_year}', n, nStar)
        # start = sp.nsolve(expr + "-" + str(current_year), n, nStar)
        highest = float(sp.log(staticNStar, 10))
        midPoint = float(sp.log(nStar, 10))
    
        points = []
        difference = highest - midPoint
        for i in range(200):
            power = highest - (i / 100) * difference
            size = 10 ** power
            year = float(sp.sympify(expr).subs(n, size))
            points.append([year, power])
        return points
    
    
    #returns a list where each y-value is log10() of the original list's y-value
    def log10(points):
        new_points = []
        for point in points:
            new_points.append([point[0], float(sp.log(point[1], 10))])
            # if point[0] > 2026 and point[0] < 2027:
            #     print(point[0], point[1], float(sp.log(point[1], 10)))
        return new_points
    
    #returns a flat quantum advantage line where all y-values (problem sizes) are nStar. There
    #   exists a point in this line for each point in the matching feasibility line. This function
    #   would only be used when the quantum improvement rate is zero.
    def flat_advantage_line(nStar, feasiblePoints):
        points = []
        for point in feasiblePoints:
            points.append([point[0], float(sp.log(nStar, 10))])
        return points
    
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
    
    def get_quantum_economic_advantage_data(classical_runtime, quantum_runtime, hardware_slowdown, quantum_improvement_rate=2, physical_logical_qubits_ratio=1000, newest_qubits=4158, newest_year=2023, current_year=2024):
        print("we made it this far")
        print(classical_runtime, quantum_runtime, hardware_slowdown, quantum_improvement_rate, physical_logical_qubits_ratio, newest_qubits, newest_year, current_year)

        n = sp.Symbol('n')
    
        #below calculations require a rate that the slowdown will be divided by, but the input rate
        #   is one which would be multiplied instead, so the below conversion is used
        # example, input quantum_improvement rate is 50 signifying that it should decrease by 50% each year,
        #   a new rate is calculated such that you could divide by 2
        quantum_improvement_rate = 1 / (1 - quantum_improvement_rate / 100)
    
        #quantum feasible in the form f(year) = problem size
        quantum_feasible_log = sp.simplify(f'log( (2), 10) * ( {newest_qubits} * 2 ^ (n - {newest_year})) / {physical_logical_qubits_ratio}')
        quantum_feasible = sp.simplify(f'log( (({physical_logical_qubits_ratio})*log( (n) , 2))/({newest_qubits}) , 2) + ({newest_year})')
        quantum_feasible = sp.simplify(quantum_feasible)
    
        #getting nStar value again could probably be a function
        #using nStar in the static case makes math easier
        validation = [is_valid(classical_runtime), is_valid(
        quantum_runtime), is_valid(hardware_slowdown)]
        if False in validation:
            return None
        solutions = solve(classical_runtime, quantum_runtime, hardware_slowdown)
        staticNStar = 1
        if len(solutions) > 0:
            staticNStar = solutions[-1] if solutions[-1] > 1 else float(sp.oo)
        staticTStar = sp.sympify(quantum_feasible).subs(n, staticNStar)
    
    
        if quantum_improvement_rate == 1: 
            feasible_points = get_points_feasible(quantum_feasible_log, staticTStar)
            return {
                "n_star": staticNStar,
                "t_star": float(staticTStar),
                "quantum_feasible": feasible_points,
                "quantum_advantage": flat_advantage_line(staticNStar, feasible_points)
            }
    
        quantum_advantage = sp.simplify(f'log( (({hardware_slowdown})*({quantum_runtime})/({classical_runtime}) ), ({quantum_improvement_rate})) + ({current_year})')
        quantum_advantage = sp.simplify(quantum_advantage)
    
    
        # intersection = sp.nsolve(quantum_feasible - quantum_advantage, n, 2)
        intersection = sp.nsolve(quantum_feasible - quantum_advantage, n, 1000000)
        # intersection = sp.nsolve(quantum_feasible - quantum_advantage, n, staticNStar)
        t = quantum_feasible.subs(n, intersection).evalf()
    
        
    
    
        return {
            "n_star": float(intersection),
            "t_star": float(t),
            "quantum_feasible": get_points_feasible(quantum_feasible_log, t),
            "quantum_advantage": get_points_advantage(quantum_advantage, staticNStar, intersection)
            # "quantum_feasible": get_points(quantum_feasible, intersection, start=1, inverted=True),
            # "quantum_advantage": log10(get_points(quantum_advantage, intersection, start=1, inverted=True))
        }
    
    def get_quantum_economic_advantage_data_2(classical_runtime, quantum_runtime, hardware_slowdown, quantum_improvement_rate, hardwares, current_year=2024):
        staticNStar = get_nstar(classical_runtime, quantum_runtime, hardware_slowdown)
        if staticNStar is None:
            print("could not find static n star")
    
        #below calculations require a rate that the slowdown will be divided by, but the input rate
        #   is one which would be multiplied instead, so the below conversion is used
        # example, input quantum_improvement rate is 50 signifying that it should decrease by 50% each year,
        #   a new rate is calculated such that you could divide by 2
        quantum_improvement_rate = 1 / (1 - quantum_improvement_rate / 100)
        
    
    
    def get_nstar(classical_runtime, quantum_runtime, hardware_slowdown):
        validation = [is_valid(classical_runtime), is_valid(
        quantum_runtime), is_valid(hardware_slowdown)]
        if False in validation:
            return None
        solutions = solve(classical_runtime, quantum_runtime, hardware_slowdown)
        staticNStar = 1
        if len(solutions) > 0:
            staticNStar = solutions[-1] if solutions[-1] > 1 else float(sp.oo)
            return staticNStar
        else:
            return False    
    


    

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