import Tinycolor from "tinycolor2";
import { observable, action, computed } from "mobx";
import { Deferred } from "./utils/deferred";

export class Store {
  imageResolved: Deferred<HTMLImageElement> | null = null;

  readonly opposite = [2, 3, 0, 1];
  readonly DX = [-1, 0, 1, 0];
  readonly DY = [0, 1, 0, -1];

  @observable width = 0;
  @observable height = 0;
  @observable.shallow imagePixels = [] as Array<Array<number>>;
  @observable.shallow colors = [] as Array<[number, number, number, number]>;
  @observable size = 3;
  @observable symmetry = 2;
  @observable periodic = true;

  @observable outputWidth = 48;
  @observable outputHeight = 48;

  @computed get colorFormats() {
    return this.colors.map(([r,g,b,a]) => {
      return new Tinycolor({ r, g, b, a});
    });
  }

  uploadImage(imageUrl: string) {
    const img = new Image();

    this.imageResolved = Deferred.reset(this.imageResolved);
    this.width = 0;
    this.height = 0;

    img.onload = () => {
      if (this.imageResolved) {
        this.imageResolved.resolve(img);
      }
    };
    img.onerror = (err) => {
      if (this.imageResolved) {
        this.imageResolved.reject(err);
      }
    };
    img.src = imageUrl;

    this.imageResolved.promise.then(this.resolveImage);
  }

  @computed get C() {
    return this.colors.length;
  }

  @computed get W() {
    return Math.pow(this.C, this.size * this.size);
  }

  @computed private get patternCalculate() {
    if (this.size === 0) {
      return { weights: [], patterns: [] };
    }

    const maxX = this.periodic ? this.width : this.width - this.size + 1;
    const maxY = this.periodic ? this.height : this.height - this.size + 1;

    const ordering = [] as Array<number>;
    const patterns = [] as Array<number[]>;
    const weightsTemp = [] as { [key in number]: number };
    for (let y = 0; y < maxY; y += 1) {
      for (let x = 0; x < maxX; x += 1) {
        const ps = Array.from({ length: 8 }) as Array<number[]>;
        ps[0] = this.patternFromSample(x, y);
        ps[1] = this.patternReflect(ps[0]);
        ps[2] = this.patternRotate(ps[0]);

        ps[3] = this.patternReflect(ps[2]);
        ps[4] = this.patternRotate(ps[2]);

        ps[5] = this.patternReflect(ps[4]);
        ps[6] = this.patternRotate(ps[4]);

        ps[7] = this.patternReflect(ps[6]);

        for (let i = 0; i < this.symmetry; i += 1) {
          const p = ps[i];
          const idx = this.patternToIndex(p);
          if (weightsTemp[idx] === undefined) {
            weightsTemp[idx] = 0;
            patterns.push(p);
            ordering.push(idx);
          }
          weightsTemp[idx] += 1;
        }
      }
    }

    const weights = [] as number[];

    for (let i = 0; i < ordering.length; i += 1) {
      weights[i] = weightsTemp[ordering[i]];
    }

    return { weights, patterns };
  }

  @computed get patterns() {
    return this.patternCalculate.patterns;
  }

  @computed get weights() {
    return this.patternCalculate.weights;
  }

  @computed get patternSize() {
    return this.patterns.length;
  }

  @computed get propagator() {
    const propagator = [] as number[][][];
    // left, top, right, bottom
    for (let d = 0; d < 4; d += 1) {
      propagator[d] = [];
      for (let i = 0; i < this.patternSize; i += 1) {
        propagator[d][i] = [];
        for (let j = 0; j < this.patternSize; j += 1) {
          if (this.agrees(this.patterns[i], this.patterns[j], this.DX[d], this.DY[d])) {
            propagator[d][i].push(j);
          }
        }
      }
    }
    return propagator;
  }

  private pattern = (f: (dx: number, dy: number) => number) => {
    const result = [] as number[];
    for (let y = 0; y < this.size; y += 1) {
      for (let x = 0; x < this.size; x += 1) {
        result[y * this.size + x] = f(x, y);
      }
    }

    return result;
  }

  private patternFromSample = (x: number, y: number) => {
    return this.pattern((dx, dy) => this.imagePixels[(x + dx) % this.width][(y + dy) % this.height]);
  }

  private patternRotate = (pattern: number[]) => {
    return this.pattern((dx, dy) => pattern[dx * this.size + this.size - dy - 1]);
  }

  private patternReflect = (pattern: number[]) => {
    return this.pattern((dx, dy) => pattern[dy * this.size + this.size - dx - 1]);
  }

  private agrees = (p1: number[], p2: number[], dx: number, dy: number) => {
    const xmin = dx < 0 ? 0 : dx;
    const xmax = dx < 0 ? dx + this.size : this.size;
    const ymin = dy < 0 ? 0 : dy;
    const ymax = dy < 0 ? dy + this.size : this.size;
    for (let y = ymin; y < ymax; y += 1) {
      for (let x = xmin; x < xmax; x += 1) {
        if (p1[x + this.size * y] != p2[x - dx + this.size * (y - dy)]) {
          return false;
        }
      }
    }
    return true;
  }

  patternToIndex = (pattern: number[]) => {
    let result = 0;
    let power = 1;
    for (let i = 0; i < pattern.length; i += 1) {
      result += pattern[pattern.length - 1 - i] * power;
      power *= this.C;
    }

    return result;
  }

  patternFromIndex(ind: number) {
    let residue = ind, power = this.W;
    const result = [] as number[];

    for (let i = 0; i < this.size * this.size; i++) {
        power = Math.floor(power / this.C);
        let count = 0;

        while (residue >= power)
        {
            residue -= power;
            count++;
        }

        result[i] = count;
    }

    return result;
  }

  @action
  resolveImage = (image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      return Promise.reject(new Error("fail to get context"));
    }

    this.width = image.width;
    this.height = image.height;
    const pixels = [] as Array<number[]>;
    const colors = [] as Array<[number, number, number, number]>;
    const colorKeys = {} as { [key in string]: number };
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const pixel = context.getImageData(x, y, 1, 1).data;
        const colorKey = pixel.join(",");

        let idx = colorKeys[colorKey];
        if (idx === undefined) {
          colorKeys[colorKey] = colors.length;
          idx = colors.length;
          colors.push([pixel[0],pixel[1],pixel[2],pixel[3]]);
        }

        pixels[x] = pixels[x] || [] as number[];
        pixels[x][y] = idx;
      }
    }
    this.imagePixels = pixels;
    this.colors = colors;
  }

  @computed private get generateCaculate() {
    const len = this.patterns.length;
    const weightLogWeights = [] as number[];
    let sumOfWeights = 0;
    let sumOfWeightLogWeights = 0;
    for (let i = 0; i < len; i += 1) {
      weightLogWeights[i] = this.weights[i] * Math.log(this.weights[i]);
      sumOfWeights += this.weights[i];
      sumOfWeightLogWeights += weightLogWeights[i];
    }

    return { weightLogWeights, sumOfWeights, sumOfWeightLogWeights };
  }

  @computed get weightLogWeights() {
    return this.generateCaculate.weightLogWeights;
  }

  @computed get sumOfWeights() {
    return this.generateCaculate.sumOfWeights;
  }

  @computed get sumOfWeightLogWeights() {
    return this.generateCaculate.sumOfWeightLogWeights;
  }

  @computed get startingEntropy() {
    return Math.log(this.sumOfWeights) - this.sumOfWeightLogWeights / this.sumOfWeights;
  }

  @computed get outputSize() {
    return this.outputWidth * this.outputHeight;
  }

  generate = function *generate(this: Store) {
    yield null;
  }

  run = () => {
    this.init();
    this.clear();

    while (true)
    {
        const result = this.observe();
        if (result != null) return result;
        this.propagate();
    }
  }

  wave = [] as boolean[][];
  compatible = [] as Array<[number, number, number, number][]>;
  sumsOfOnes = [] as number[];
  sumsOfWeights = [] as number[];
  sumsOfWeightLogWeights = [] as number[];
  entropies = [] as number[];
  stack = [] as Array<[number, number]>
  stacksize = 0;
  observed = [] as number[];

  init = () => {
    this.wave = Array.from({ length: this.outputSize }).map(() => {
      return Array.from({ length: this.patternSize });
    });
    this.compatible = Array.from({ length: this.outputSize }).map(() => {
      return Array.from({ length: this.patternSize });
    });;
    this.sumsOfOnes = Array.from({ length: this.outputSize }); 
    this.sumsOfWeights = Array.from({ length: this.outputSize });
    this.sumsOfWeightLogWeights = Array.from({ length: this.outputSize });
    this.entropies = Array.from({ length: this.outputSize });
    this.stack = Array.from({ length: this.outputSize * this.patternSize });
    this.stacksize = 0;

    for (let i = 0; i < this.outputSize; i += 1) {
      for (let t = 0; t < this.patternSize; t += 1) {
        this.wave[i][t] = false;
        this.compatible[i][t] = [0, 0, 0, 0];
      }
    }
  }

  clear = () => {
    const weightsLength = this.weights.length;
    const sumOfWeights = this.sumOfWeights;
    const sumOfWeightLogWeights = this.sumOfWeightLogWeights;
    const startingEntropy = this.startingEntropy;
    const propagator = this.propagator;

    for (let i = 0; i < this.outputSize; i += 1) {
      for (let t = 0; t < this.patternSize; t += 1) {
        this.wave[i][t] = true;
        for (let d = 0; d < 4; d += 1) {
          this.compatible[i][t][d] = propagator[this.opposite[d]][t].length;
        }
      }

      this.sumsOfOnes[i] = weightsLength;
      this.sumsOfWeights[i] = sumOfWeights;
      this.sumsOfWeightLogWeights[i] = sumOfWeightLogWeights;
      this.entropies[i] = startingEntropy;
    }
  }

  observe = () => {
    let minEntropy = 1000;
    let argmin = -1;

    for (let i = 0; i < this.outputSize; i += 1) {
      if (this.onBoundary(i % this.outputWidth, Math.floor(i / this.outputWidth))) {
        continue;
      }

      const amount = this.sumsOfOnes[i];
      if (amount === 0) {
        return false;
      }

      const entropy = this.entropies[i];
      if (amount > 1 && entropy < minEntropy) {
        const noise = Math.random() * 1e-6;
        if (entropy + noise < minEntropy) {
          minEntropy = entropy + noise;
          argmin = i;
        }
      }
    }

    if (argmin == -1) {
      this.observed = Array.from({ length: this.outputSize });
      for (let i = 0; i < this.outputSize; i += 1) {
        for (let t = 0; t < this.patternSize; t += 1) {
          if (this.wave[i][t]) {
            this.observed[i] = t;
            break;
          }
        }
      }

      return true;
    }

    const distribution = Array.from({ length: this.outputSize }) as number[];
    for (let t = 0; t < this.patternSize; t += 1) {
      distribution[t] = this.wave[argmin][t] ? this.weights[t] : 0;
    }

    const r = distribution[Math.floor(Math.random() * distribution.length)];
    const w = this.wave[argmin];
    for (let t = 0; t < this.patternSize; t += 1) {
      if (w[t] !== (t === r)) {
        this.ban(argmin, t);
      }
    }

    return null;
  }

  private ban(i: number, t: number) {
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

  private propagate() {
    while (this.stacksize > 0) {
      const e1 = this.stack[this.stacksize - 1];
      this.stacksize--;

      const i1 = e1[0];
      const x1 = i1 % this.outputWidth, y1 = Math.floor(i1 / this.outputWidth);

      for (let d = 0; d < 4; d++) {
        const dx = this.DX[d], dy = this.DY[d];
        let x2 = x1 + dx, y2 = y1 + dy;
        if (this.onBoundary(x2, y2)) continue;

        if (x2 < 0) x2 += this.outputWidth;
        else if (x2 >= this.outputWidth) x2 -= this.outputWidth;
        if (y2 < 0) y2 += this.outputHeight;
        else if (y2 >= this.outputHeight) y2 -= this.outputHeight;

        const i2 = x2 + y2 * this.outputWidth;
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

  onBoundary(x: number, y: number) {
    return !this.periodic && (x + this.size > this.width || y + this.size > this.height || x < 0 || y < 0);
  }
}

export const store = new Store();

store.uploadImage("/samples/skyline.png");

(window as any).store = store;
