export class Drawer {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  scale: number;

  constructor(props: {
    container: HTMLElement;
    scale: number;
  }) {
    this.scale = props.scale;
    this.container = props.container;
    this.canvas = document.createElement("canvas");
    this.container.appendChild(this.canvas);
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("fail to get context");
    }

    this.context = context;
  }

  draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const { width, height } = canvas;

    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;

    for (let i = 0; i < width; i += 1) {
      for (let j = 0; j < height; j += 1) {
        const pixel = context.getImageData(i, j, 1, 1);

        for (let m = 0; m < this.scale; m += 1) {
          for (let n = 0; n < this.scale; n += 1) {
            this.context.putImageData(pixel, i * this.scale + m, j * this.scale + n);
          }
        }

      }
    }
  }
}
