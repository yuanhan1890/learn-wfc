import Tinycolor from "tinycolor2";

export class Palette {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  colors: Array<Tinycolor.Instance>;

  constructor(props: {
    container: HTMLElement;
    colors: Array<Tinycolor.Instance>;
  }) {
    this.container = props.container;
    this.canvas = document.createElement("canvas");
    this.container.appendChild(this.canvas);
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("fail to get context");
    }
    this.context = context;
    this.colors = props.colors;
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const size = 12;
    this.canvas.width = size * this.colors.length;
    this.canvas.height = size;

    for (let i = 0; i < this.colors.length; i += 1) {
      const color = this.colors[i];
      const { r, g, b } = color.toRgb();
      const alpha = Math.floor(color.getAlpha() * 255);

      const imageData = new ImageData(new Uint8ClampedArray([r, g, b, alpha]), 1, 1);
      for (let a = 0; a < size; a += 1) {
        for (let c = 0; c < size; c += 1) {
          this.context.putImageData(imageData, i * size + a, c);
        }
      }
    }
  }
}
