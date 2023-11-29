import sympy as sp
import numpy as np
import matplotlib.pyplot as plt

# Define the symbols
# n
n = sp.Symbol('n', integer=True)

# Define the function
# f(n) = 2 * n^2 + 3 * n + 1
c = n
# q = (10**6)*sqrt(n)
q = (10**6)*sp.sqrt(n)

# apply log to the function
q = sp.log(q)
c = sp.log(c)

# when q(n) = c(n)
result = sp.solve(q - c, n)
print(result[0])


qpoints = []
# n = 0
qpoints.append([0, 0])
# n = result
qpoints.append([result[0], q.subs(n, result[0])])
# n = 2*result
qpoints.append([result[0]*result[0], q.subs(n, result[0]*result[0])])

cpoints = []
# n = 0
cpoints.append([0, 0])
# n = result
cpoints.append([result[0], c.subs(n, result[0])])
# n = result[0]*result
cpoints.append([result[0]*result[0], c.subs(n, result[0]*result[0])])
print(qpoints)
print(cpoints)

# make xaxis = 10¹, 10², 10³, 10⁴, 10⁵, 10⁶, 10⁷, 10⁸, 10⁹, 10¹⁰...
xaxis = []
for i in range(1, 11):
    xaxis.append(10**i)

# make yaxis = 10⁶, 10⁷, 10⁸, 10⁹, 10¹⁰...
yaxis = []
for i in range(6, 11):
    yaxis.append(10**i)

# plot the graph
plt.plot(*zip(*qpoints), label='q(n)')
plt.plot(*zip(*cpoints), label='c(n)')
plt.xticks(xaxis)
plt.yticks(yaxis)
plt.xlabel('n')
plt.ylabel('10⁶q(n), c(n)')
plt.legend()
plt.show()
