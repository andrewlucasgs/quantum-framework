<script setup>import katex from 'katex'; import 'katex/dist/katex.min.css'; </script>
<template>
    <div class="max-w-prose mx-auto mb-16">
        <p class="text-gray=900 text-justify my-4"> This framework is designed to allow users to explore different
            combinations of algorithmic problems and quantum hardware. Users can freely deviate from known projections
            and default parameters to derive their own insights as to the general timeline of when certain scenarios may
            become economically advantageous to run on a quantum machine. </p>
        <h2 class="text-2xl font-bold text-gray-800" id="Models"> Models </h2>
        <p class="text-gray=900 text-justify my-4"> A model in the framework refers to an instance of a specific
            problem-hardware combination being examined. Each model tracks its own parameters and displays its own
            graphs. </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Making Changes"> Making Changes </h3>
        <p class="text-gray=900 text-justify my-4"> Upon opening the framework, there will be a template model already
            created which is ready to edit. Changing any input to the model will have its effects immediately displayed
            on the corresponding graphs (unless the parameter was changed in a popup menu in which case the user must
            hit save). </p>
        <p class="text-gray=900 text-justify my-4"> Users can add new models by creating from the template model or
            duplicating existing models. The latter option is useful if users would like to see how slight changes would
            affect the graphs' plots and view the results at the same time. Users can also freely delete models. </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Simple vs Advanced View"> Simple vs Advanced View </h3>
        <p class="text-gray=900 text-justify my-4"> There are two ways of displaying a model on the user interface. The
            first is a simple view in which only the two major inputs of problem and hardware can be seen and selected.
            All the graphs are still visible and this view allows for easy comparison between them across multiple
            models. The second option is an advanced view in which the user is able to freely manipulate all variables
            associated with the computation of the graphs. It is more complex and may overwhelm the user if they are not
            too familiar with quantum hardware so the framework shows the simple view by default and allows users to
            choose their own level of involvement with the additional parameters. </p>
        <p class="text-gray=900 text-justify my-4"> Something worth noting is that two separate models could have the
            same options selected for problem and hardware, yet have very different choices for the remaining
            parameters. This could result in two models with the same options visible for their simple views but with
            drastically different graphs. </p>
        <h2 class="text-2xl font-bold text-gray-800" id="Inputs"> Inputs </h2>
        <p class="text-gray=900 text-justify my-4"> Each input into the models can be classified as either related to
            the problem or the hardware. We will refer to the problem and roadmap inputs themselves as major inputs and
            the inputs dependent on them as minor inputs. Each selectable option for the major inputs has default values
            for all of its corresponding minor inputs; as a result, changing a model's major inputs will automatically
            override the values of all its associated minor inputs. Changing a minor input has no effect on the other
            parameters. </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Problem Inputs"> Problem Inputs </h3>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Problem"> Problem </h4>
        <p class="text-gray=900 text-justify my-4"> The problems contain the runtimes of the best known classical and
            quantum algorithms to solve them to be compared in the model. We will refer to these runtimes as <span
                v-html="katex.renderToString('C(n)')"></span> and
            <span v-html="katex.renderToString('Q(n)')"></span> respectively.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Connectivity Penalty"> Connectivity Penalty </h4>
        <p class="text-gray=900 text-justify my-4"> The connectivity penalty is a function which acts as a
            multiplicative factor to the quantum runtime being compared. If this value is set to "None", then <span
                v-html="katex.renderToString('Q(n) * \\text{Penalty}(n)')"></span> will be evaluated as <span
                v-html="katex.renderToString('Q(n)')"></span> in the resulting expressions. </p>
        <p class="text-gray=900 text-justify my-4"> This slowdown is inspired by how quantum algorithms actually face
            slowdowns when implemented on physical circuits in practice. </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Qubit To Problem Size"> Qubit To Problem Size </h4>
        <p class="text-gray=900 text-justify my-4"> Qubit to Problem Size (QPS) is a function which maps logical qubits
            to the maximum problem size achievable with said amount of qubits. The inverse of this function
            (<span v-html="katex.renderToString('\\text{QPS}^{-1}')"></span>) is also used in some calculations. This is
            still a minor input as different problems may
            deviate from a typical mapping of <span
                v-html="katex.renderToString('2^{\\text{ number \of qubits}}')"></span>. </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Hardware Inputs"> Hardware Inputs </h3>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Roadmap"> Roadmap </h4>
        <p class="text-gray=900 text-justify my-4"> This is the major input for the hardware. The roadmap specifies
            physical qubit projections with associated years for each target. Each projection in the framework is pulled
            directly from the hardware providers' published timelines, but users are free to edit the roadmap as well.
            They can add/remove qubit-year pairs from the projections in addition to changing the type of extrapolation
            that is done in between data points on the plots. </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Hardware Slowdown"> Hardware Slowdown </h4>
        <p class="text-gray=900 text-justify my-4"> Hardware slowdown (hws) represents how many classical operations
            could be performed in the time it takes the hardware to perform a single quantum operation. Users can set
            this value directly or instead choose to edit each of the individual factors whose product is the slowdown:
        </p>
        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString('\\text{Speed Ratio } * \\text{ Gate Overhead } * \\text{ Algorithmic Constant} = \\text{Hardware Slowdown}')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> The speed ratio represents the ratio of how much faster a classical
            computer is than a quantum computer. Much like hardware slowdown, the user can choose to manually edit its
            individual components:
        </p>

        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString('\\text{Average Quantum Operation (ns)} * \\text{Classical CPU Rate (GHz)} = \\text{Speed Ratio}')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4">
            (Note that we're multiplying the terms instead of dividing them and still achieving the
            Classical/Quantum Speed Ratio. This is because of the choice of GHz and ns as units which allows for this
            simpler equation.) </p>
        <p class="text-gray=900 text-justify my-4"> The hardware slowdown also features another input: the quantum
            improvement rate (qir). The framework assumes the hardware slowdown improves yearly by a factor of the
            improvement rate: </p>

        <p class="text-gray=900 text-center my-4 text-sm">

            <span v-html="katex.renderToString('\\text{hws}_{t+1} = \\text{hws}_t * (1 - \\frac{qir}{100})')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> (Note it is possible for the
            improvement rate to be negative implying that quantum devices are becoming relatively slower instead.) </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Physical to Logical Qubit Ratio"> Physical to Logical Qubit Ratio </h4>
        <p class="text-gray=900 text-justify my-4"> This final input is the physical to logical qubit ratio (PLQR) which
            represents how many physical qubits are needed to encode a single logical qubit. And similar to hardware
            slowdown, the ratio also features a ratio improvement rate (rir). How the ratio changes with its rate over
            time is exactly the same as the hardware slowdown equation shown above. </p>
        <h2 class="text-2xl font-bold text-gray-800" id="Graphs"> Graphs </h2>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Minimum Problem Size for Quantum Algorithmic Advantage"> Minimum Problem Size for Quantum Algorithmic Advantage </h3>
        <p class="text-gray=900 text-justify my-4"> This graph plots both the classical and quantum runtimes with
            problem size on the x-axis and classical time steps on the y-axis. It's purpose is to visualize the minimum
            problem size such that the quantum algorithm (including the penalty and hardware slowdown) would take less
            time to run than the classical counterpart. We denote said problem size with <span
                v-html="katex.renderToString('n^*')"></span> which occurs when the
            runtime trajectories intersect in the graph. Or mathematically, <span
                v-html="katex.renderToString('n^*')"></span> is the smallest problem size (n) such
            that </p>

        <p class="text-gray=900 text-center my-4 text-sm">

            <span v-html="katex.renderToString('C(n) = Q(n) * \\text{Penalty}(n) * \\text{hws}')"></span>
        </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Economic Advantage of Quantum Computing"> Economic Advantage of Quantum Computing </h3>
        <p class="text-gray=900 text-justify my-4"> This graph answers perhaps the most important information in the
            framework: when will the problem become economically advantageous to run on quantum hardware? The x- and
            y-axes are time (in years) and problem size respectively. The two lines plotted are called the feasibility
            line (<span v-html="katex.renderToString('\\text{Feas}(t)')"></span>) and the quantum advantage line
            (<span v-html="katex.renderToString('\\text{Adv}(t)')"></span>). </p>
        <p class="text-gray=900 text-justify my-4"> The feasibility line represents how the maximum achievable problem
            size on the hardware increases over time. That is, all points which lie below this curve on the graph could
            have their problem sizes executed on the quantum hardware (although it might not yet be efficient to do so).
            This is influenced by the roadmap's trajectory of physical qubits, the value/rate of the physical to logical
            qubit ratio, and the function mapping logical qubits to problem sizes. If we denote the amount of physical
            qubits expected from a roadmap at year <span v-html="katex.renderToString('t')"></span> as the function <span v-html="katex.renderToString('R(t)')"></span>, we can express <span
                v-html="katex.renderToString('\\text{Feas}(t)')"></span> as
        </p>

        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString('\\text{Feas}(t) = \\text{QPS}(\\frac{R(t)}{PLQR * (1 - \\frac{rir}{100})^{t - 2024}})')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> (Note that the year
            2024 is included into the equation because we assume PLQR is the value for the current year. The equation
            could be made more general by replacing it with an additional variable denoting the current year.) </p>
        <p class="text-gray=900 text-justify my-4"> The quantum advantage line represents how the minimum problem size
            to achieve advantage diminishes over time (although the size could actually increase if the quantum
            improvement rate is negative). All points which lie above this line would be advantageous to run on a
            quantum device (although it might not yet be possible to do so). Similar to how the first graph finds <span
                v-html="katex.renderToString('n^*')"></span>,
            this function plots the value of <span v-html="katex.renderToString('n^*')"></span> as the hardware slowdown
            changes over time. </p>
        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString('\\text{Adv}(t) = n \text{ }|\\text{ } C(n) = Q(n) * \\text{Penalty}(n) * \\text{hws} * (1 - \\frac{qir}{100})^{t-2024}')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> The area above the feasibility represents problem sizes that are
            still too large for the progress of quantum devices in said year. The area below the advantage line
            represents problem sizes that are too small to actually achieve a practical advantage for said year. Once
            these two lines intersect, the area contained between them then represents the space of problem sizes which
            are both feasible and advantageous for quantum computers. This intersection occurs at the year <span
                v-html="katex.renderToString('t^*')"></span> such
            that <span v-html="katex.renderToString('\\text{Feas}(t) = \\text{Adv}(t)')"></span> , or equivalently: </p>
        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString(' n \\text{ }|\\text{ } (C(n) = Q(n) * \\text{Penalty}(n) * \\text{hws} * (1 - \\frac{qir}{100})^{t-2024}) = \\text{QPS}(\\frac{R(t)}{PLQR * (1 - \\frac{rir}{100})^{t - 2024}})')"></span>
        </p>

        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Logical Qubit Quantum Economic Advantage"> Logical Qubit Quantum Economic Advantage </h3>
        <p class="text-gray=900 text-justify my-4"> This graph provides practically the same information as the previous
            one except in terms of different units. Whereas the previous graph plotted problem size over time, this one
            graphs logical qubits over time. The year marking the start of quantum economic advantage will remain
            exactly the same, but users are now able to see the trajectories in terms of logical qubits if they were
            more interested in that metric instead. Formally, the feasiblity line plotted would be <span
                v-html="katex.renderToString('\\text{QPS}^{-1}(\\text{Feas}(t))')"></span>
            and the advantage line would be <span
                v-html="katex.renderToString('\\text{QPS}^{-1}(\\text{Adv}(t))')"></span>. (Note
            that the former evaluates to an expression of the form <span
                v-html="katex.renderToString('\\text{QPS}^{-1}(\\text{QPS}(\\dots))')"></span> which
            mathemetically makes the two function calls useless, however since the <span
                v-html="katex.renderToString('\\text{QPS}(\\dots)')"></span> must be computed
            regardless, both computations are still performed in the framework. The results are the same to several
            decimal points as if no transformation had been done to the data.) </p>
    </div>
</template>