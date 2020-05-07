import Tinycolor from "tinycolor2";
import { Graphic } from "./graphic";
import { Drawer } from "./drawer";
import { isColorEqual } from "./utils";
import { Palette } from "./palette";

async function main() {
  const graphic = new Graphic({ image: "/samples/Skyline.png" });
  const drawer = new Drawer({
    container: document.getElementById("originalImage")!,
    scale: 5
  });

  const { canvas, context } = await graphic.graphicReady.promise;

  drawer.draw(canvas, context);

  const FMX = canvas.width;
  const FMY = canvas.height;
  const SMX = FMX;
  const SMY = FMY;
  const colors = [] as Tinycolor.Instance[];
  const sample = Array.from({ length: SMX }).map(() => {
    return Array.from({ length: SMY }).map(() => {
      return -1;
    });
  });

  for (let j = 0; j < SMY; j += 1) {
    for (let i = 0; i < SMX; i += 1) {
      const pixel = context.getImageData(i, j, 1, 1).data;
      const color = new Tinycolor({ r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] });

      const colorIndex = colors.findIndex((c) => isColorEqual(color, c));
      if (colorIndex === -1) {
        sample[i][j] = colors.length;
        colors.push(color);
      } else {
        sample[i][j] = colorIndex;
      }
    }
  }

  const palette = new Palette({ container: document.getElementById("palette")!, colors });

  palette.draw();

  const N = 3;
  const periodicInput = true;
  const symmetry = 8;

  const C = colors.length;
  const W = Math.pow(colors.length, N * N);

  const pattern = (f: (dx: number, dy: number) => number) => {
    const bytes = [] as number[];
    for (let j = 0; j < N; j += 1) {
      for (let i = 0; i < N; i += 1) {
        bytes[j + i * N] = f(i, j);
      }
    }

    return bytes;
  };

  const patternFromSample = (x: number, y: number) => {
    return pattern((dx: number, dy: number) => sample[(x + dx) % SMX][(y + dy) % SMY]);
  };
  const rotate = (p: number[]) => pattern((dx, dy) => p[N - dy - 1 + dx * N]);
  const reflect = (p: number[]) => pattern((dx, dy) => p[N - dx - 1 + dy * N]);

  const indexPattern = (p: number[]) => {
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
    const result = [] as number[];

    for (let i = 0; i < N * N; i++)
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

  const weightsDict = { } as { [key in number]: number };
  const ordering = [] as number[];

  for (let j = 0; j < (periodicInput ? SMY : SMY - N + 1); j += 1) {
    for (let i = 0; i < (periodicInput ? SMX : SMX - N + 1); i += 1) {
      const ps = [] as number[][];
      ps[0] = patternFromSample(i, j);
      ps[1] = reflect(ps[0]);
      ps[2] = rotate(ps[0]);
      ps[3] = reflect(ps[2]);
      ps[4] = rotate(ps[2]);
      ps[5] = reflect(ps[4]);
      ps[6] = rotate(ps[4]);
      ps[7] = reflect(ps[6]);

      for (let k = 0; k < symmetry; k += 1) {
        if (ps[k].join("") === "000000002") {
          console.log(i,j,k);
        }
        const idx = indexPattern(ps[k]);
        if (weightsDict[idx] !== undefined) {
          weightsDict[idx] += 1;
        } else {
          weightsDict[idx] = 1;
          ordering.push(idx);
        }
      }
    }
  }

  const T = ordering.length;
  const weights = {} as { [key in number]: number };
  const patterns = Array.from({ length: T }) as number[][];

  for (let i = 0; i < T; i += 1) {
    patterns[i] = patternFromIndex(ordering[i]);
    weights[i] = weightsDict[ordering[i]];
  }

  const agrees = (p1: number[], p2: number[], dx: number, dy: number) => {
    const xmin = dx < 0 ? 0 : dx, xmax = dx < 0 ? dx + N : N, ymin = dy < 0 ? 0 : dy, ymax = dy < 0 ? dy + N : N;
    for (let y = ymin; y < ymax; y++) for (let x = xmin; x < xmax; x++) if (p1[x + N * y] != p2[x - dx + N * (y - dy)]) return false;
    return true;
  };

  const DX = [-1, 0, 1, 0 ];
  const DY = [0, 1, 0, -1];

  const propagator = [] as number[][][];
  for (let d = 0; d < 4; d += 1) {
    propagator[d] = [] as number[][];
    for (let t = 0; t < T; t += 1) {
      const list = [] as number[];
      for (let t2 = 0; t2 < T; t2 += 1) {
        if (agrees(patterns[t], patterns[t2], DX[d], DY[d])) {
          list.push(t2);
        };
      }

      propagator[d][t] = list;
    }
  }

  // const wave = Array.from({ length: FMX * FMY }).map(() => [] as boolean[]);
  // const
}

main();
