import { Deffer } from "@/deffer";
import { Model } from "./model";

export class OverlappingModel extends Model
{
    N = 0;
    patterns = [] as number[][];
    colors = [] as Array<[number, number, number, number]>;
    ground = 0;
    ready: Deffer<void>;

    constructor(
      name: string,
      N: number,
      width: number,
      height: number,
      periodicInput: boolean,
      periodicOutput: boolean,
      symmetry: number,
      ground: number
    ) {
      super(width, height);
      this.N = N;
      this.periodic = periodicOutput;
      const bitmap = new Image();
      const imageDefer = new Deffer<HTMLImageElement>();
      bitmap.onload = () => {
        imageDefer.resolve(bitmap);
      };
      bitmap.src = `/samples/${name}.png`;

      this.ready = new Deffer();

      imageDefer.promise.then(() => {
        const SMX = bitmap.width, SMY = bitmap.height;
        const sample = Array.from({ length: SMX }).map(() => {
          return Array.from({ length: SMY });
        }) as number[][];

        this.colors = [];

        const canvas = document.createElement("canvas");
        canvas.width = SMX;
        canvas.height = SMY;
        const context = canvas.getContext("2d")!;
        const colorKeys = {} as { [key in string]: number };
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        for (let y = 0; y < SMY; y++) {
          for (let x = 0; x < SMX; x++) {
            const color = context.getImageData(x, y, 1, 1).data;
            const colorKey = color.join(",");
            if (colorKeys[colorKey] === undefined) {
              colorKeys[colorKey] = this.colors.length;
              this.colors.push([color[0], color[1], color[2], color[3]]);
            }

            sample[x][y] = colorKeys[colorKey];
          }
        }

        const C = this.colors.length;
        const W = Math.pow(C, N * N);

        const pattern = (f: (x: number, y: number) => number) => {
          const result = Array.from({ length: this.N * this.N }) as number[];
          for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
              result[x + y * N] = f(x, y);
            }
          }
          return result;
        };

        const patternFromSample = (x: number, y: number) => {
          return pattern((dx, dy) => {
            return sample[(x + dx) % SMX][(y + dy) % SMY];
          });
        };
        const rotate = (p: number[]) => pattern((x, y) => p[N - 1 - y + x * N]);
        const reflect = (p: number[]) => pattern((x, y) => p[N - 1 - x + y * N]);

        const index = (p: number[]) => {
          let result = 0, power = 1;
          for (let i = 0; i < p.length; i++)
          {
              result += p[p.length - 1 - i] * power;
              power *= C;
          }
          return result;
        };

        const patternFromIndex = (ind: number) => {
          let residue = ind, power = W;
          const result = Array.from({ length: this.N * this.N }) as number[];

          for (let i = 0; i < result.length; i++)
          {
              power = Math.floor(power / C);
              let count = 0;

              while (residue >= power)
              {
                  residue -= power;
                  count++;
              }

              result[i] = count;
          }

          return result;
        };

        const weights = {} as { [key in number]: number };
        const ordering = [] as number[];

        for (let y = 0; y < (periodicInput ? SMY : SMY - N + 1); y++) {
          for (let x = 0; x < (periodicInput ? SMX : SMX - N + 1); x++) {
            const ps = Array.from({ length: 8 }) as number[][];

            ps[0] = patternFromSample(x, y);
            ps[1] = reflect(ps[0]);
            ps[2] = rotate(ps[0]);
            ps[3] = reflect(ps[2]);
            ps[4] = rotate(ps[2]);
            ps[5] = reflect(ps[4]);
            ps[6] = rotate(ps[4]);
            ps[7] = reflect(ps[6]);

            for (let k = 0; k < symmetry; k++)
            {
              const ind = index(ps[k]);
              if (weights[ind] !== undefined) weights[ind]++;
              else
              {
                  weights[ind] = 1;
                  ordering.push(ind);
              }
            }
          }
        }

        this.T = ordering.length;
        this.ground = (ground + this.T) % this.T;
        this.patterns = [] as number[][];
        this.weights = [] as number[];

        for (let counter = 0; counter < ordering.length; counter += 1)
        {
          const w = ordering[counter];
          this.patterns[counter] = patternFromIndex(w);
          this.weights[counter] = weights[w];
        }

        const agrees = (p1: number[], p2: number[], dx: number, dy: number) => {
            const xmin = dx < 0 ? 0 : dx, xmax = dx < 0 ? dx + N : N, ymin = dy < 0 ? 0 : dy, ymax = dy < 0 ? dy + N : N;
            for (let y = ymin; y < ymax; y++) {
              for (let x = xmin; x < xmax; x++) {
                if (p1[x + N * y] != p2[x - dx + N * (y - dy)]) return false;
              }
            }
            return true;
        };

        this.propagator = [] as number[][][];

        for (let d = 0; d < 4; d++)
        {
            this.propagator[d] = [];
            for (let t = 0; t < this.T; t++)
            {
                this.propagator[d][t] = [];
                for (let t2 = 0; t2 < this.T; t2++) {
                  if (agrees(this.patterns[t], this.patterns[t2], this.DX[d], this.DY[d])) {
                    this.propagator[d][t].push(t2);
                  }
                }
            }
        }

        this.ready.resolve();
      });
    }

    onBoundary(x: number, y: number) {
      return !this.periodic && (x + this.N > this.FMX || y + this.N > this.FMY || x < 0 || y < 0);
    }

    clear()
    {
        super.clear();

        if (this.ground != 0)
        {
            for (let x = 0; x < this.FMX; x++)
            {
                for (let t = 0; t < this.T; t++) if (t != this.ground) this.ban(x + (this.FMY - 1) * this.FMX, t);
                for (let y = 0; y < this.FMY - 1; y++) this.ban(x + y * this.FMX, this.ground);
            }

            this.propagate();
        }
    }
}
