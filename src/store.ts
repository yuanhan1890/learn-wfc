import { observable, action } from "mobx";
import { Deferred } from "./utils/deferred";

export class Store {
  imageResolved: Deferred<HTMLImageElement> | null = null;

  @observable width = 0;
  @observable height = 0;
  @observable.shallow imagePixels = [] as Array<Array<number>>;
  @observable.shallow colors = [] as Array<[number, number, number, number]>;

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
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
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
}

export const store = new Store();

store.uploadImage("/samples/skyline.png");

(window as any).store = store;
