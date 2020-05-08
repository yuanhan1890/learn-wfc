export abstract class Model
{
    wave = [] as boolean[][];

    propagator = [] as number[][][];
    compatible = [] as number[][][];
    observed = [] as number[];

    stack = [] as Array<[number, number]>;
    stacksize = 0;

    FMX = 0;
    FMY = 0;
    T = 0;
    periodic = false;

    weights = [] as number[];
    weightLogWeights = [] as number[];

    sumsOfOnes = [] as number[];
    sumOfWeights = 0;
    sumOfWeightLogWeights = 0;
    startingEntropy = 0;
    sumsOfWeights = [] as number[];
    sumsOfWeightLogWeights = [] as number[]
    entropies = [] as number[];

    abstract onBoundary(x: number, y: number): boolean;

    readonly DX = [ -1, 0, 1, 0 ];
    readonly DY = [ 0, 1, 0, -1 ];
    readonly opposite = [ 2, 3, 0, 1];

    constructor(width: number, height: number) {
        this.FMX = width;
        this.FMY = height;
    }

    init() {
        this.wave = Array.from({ length: this.FMX * this.FMY });
        this.compatible = Array.from({ length: this.wave.length });
        for (let i = 0; i < this.wave.length; i++)
        {
            this.wave[i] = Array.from({ length: this.T });
            this.compatible[i] = Array.from({ length: this.T });
            for (let t = 0; t < this.T; t++) {
              this.compatible[i][t] = Array.from({ length: 4 });
            };
        }

        this.weightLogWeights = Array.from({ length: this.T });
        this.sumOfWeights = 0;
        this.sumOfWeightLogWeights = 0;

        for (let t = 0; t < this.T; t++)
        {
            this.weightLogWeights[t] = this.weights[t] * Math.log(this.weights[t]);
            this.sumOfWeights += this.weights[t];
            this.sumOfWeightLogWeights += this.weightLogWeights[t];
        }

        this.startingEntropy = Math.log(this.sumOfWeights) - this.sumOfWeightLogWeights / this.sumOfWeights;

        this.sumsOfOnes = Array.from({ length: this.FMX * this.FMY });
        this.sumsOfWeights = Array.from({ length: this.FMX * this.FMY });
        this.sumsOfWeightLogWeights = Array.from({ length: this.FMX * this.FMY });
        this.entropies = Array.from({ length: this.FMX * this.FMY });

        this.stack = Array.from({ length: this.wave.length * this.T });
        this.stacksize = 0;
    }

    observe() {
        let min = 1000;
        let argmin = -1;

        for (let i = 0; i < this.wave.length; i++)
        {
            if (this.onBoundary(i % this.FMX, i / this.FMX)) continue;

            const amount = this.sumsOfOnes[i];
            if (amount == 0) return false;

            const entropy = this.entropies[i];
            if (amount > 1 && entropy <= min)
            {
                const noise = 1E-6 * Math.random();
                if (entropy + noise < min)
                {
                    min = entropy + noise;
                    argmin = i;
                }
            }
        }

        if (argmin == -1)
        {
            this.observed = Array.from({ length: this.FMX * this.FMY });
            for (let i = 0; i < this.wave.length; i++)
              for (let t = 0; t < this.T; t++) if (this.wave[i][t]) {
                this.observed[i] = t; break;
              }
            return true;
        }

        const distribution = Array.from({ length: this.T });
        for (let t = 0; t < this.T; t++) {
          distribution[t] = this.wave[argmin][t] ? this.weights[t] : 0;
        }
        const r = distribution[Math.floor(Math.random() * distribution.length)];

        const w = this.wave[argmin];
        for (let t = 0; t < this.T; t++) if (w[t] != (t == r)) this.ban(argmin, t);

        return null;
    }

    propagate() {
        while (this.stacksize > 0)
        {
            const e1 = this.stack[this.stacksize - 1];
            this.stacksize--;

            const i1 = e1[0];
            const x1 = i1 % this.FMX, y1 = Math.floor(i1 / this.FMX);

            for (let d = 0; d < 4; d++)
            {
                const dx = this.DX[d], dy = this.DY[d];
                let x2 = x1 + dx, y2 = y1 + dy;
                if (this.onBoundary(x2, y2)) continue;

                if (x2 < 0) x2 += this.FMX;
                else if (x2 >= this.FMX) x2 -= this.FMX;
                if (y2 < 0) y2 += this.FMY;
                else if (y2 >= this.FMY) y2 -= this.FMY;

                const i2 = x2 + y2 * this.FMX;
                const p = this.propagator[d][e1[1]];
                const compat = this.compatible[i2];

                for (let l = 0; l < p.length; l++)
                {
                    const t2 = p[l];
                    const comp = compat[t2];

                    comp[d]--;
                    if (comp[d] == 0) this.ban(i2, t2);
                }
            }
        }
    }

    run(limit: number)
    {
        this.init();

        this.clear();

        for (let l = 0; l < limit || limit == 0; l++)
        {
            const result = this.observe();
            if (result != null) {
              return result;
            }
            this.propagate();
        }

        return true;
    }

    ban(i: number, t: number)
    {
        this.wave[i][t] = false;

        const comp = this.compatible[i][t];
        for (let d = 0; d < 4; d++) comp[d] = 0;
        this.stack[this.stacksize] = [i, t];
        this.stacksize++;

        this.sumsOfOnes[i] -= 1;
        this.sumsOfWeights[i] -= this.weights[t];
        this.sumsOfWeightLogWeights[i] -= this.weightLogWeights[t];

        const sum = this.sumsOfWeights[i];
        this.entropies[i] = Math.log(sum) - this.sumsOfWeightLogWeights[i] / sum;
    }

    clear()
    {
        for (let i = 0; i < this.wave.length; i++)
        {
            for (let t = 0; t < this.T; t++)
            {
                this.wave[i][t] = true;
                for (let d = 0; d < 4; d++) this.compatible[i][t][d] = this.propagator[this.opposite[d]][t].length;
            }

            this.sumsOfOnes[i] = this.weights.length;
            this.sumsOfWeights[i] = this.sumOfWeights;
            this.sumsOfWeightLogWeights[i] = this.sumOfWeightLogWeights;
            this.entropies[i] = this.startingEntropy;
        }
    }
}
