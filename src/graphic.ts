import { Deffer } from "./deffer";

export interface ImageGraphic {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
}

export class Graphic {
  imageCreated = new Deffer<HTMLImageElement>();
  graphicReady = new Deffer<ImageGraphic>();

  constructor(props: {
    image: string;
  }) {
    const imgEl = new Image();
    imgEl.onload = () => {
      this.imageCreated.resolve(imgEl);
    };
    imgEl.onerror = () => {
      this.imageCreated.reject();
    };
    imgEl.src = props.image;

    this.imageCreated.promise.then((img) => {
      const imageCanvas = document.createElement("canvas");

      const imageContext = imageCanvas.getContext("2d");

      if (!imageContext) {
        this.graphicReady.reject(new Error("fail to get context"));
        return;
      }


      imageCanvas.width = img.width;
      imageCanvas.height = img.height;

      imageContext.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);

      this.graphicReady.resolve({
        image: img,
        context: imageContext,
        canvas: imageCanvas,
      });
    });
  }
}
