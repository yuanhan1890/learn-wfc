import { OverlappingModel } from "./overlappingModel";

export function main() {
  // <overlapping name="Skyline" N="3" symmetry="2" ground="-1" periodic="True"/>
  const model = new OverlappingModel("Skyline", 3, 48, 48, true, true, 2, -1);
  // <overlapping name="Chess" N="2" periodic="True"/>
  // if (xelem.Name == "overlapping") model = new OverlappingModel(name, xelem.Get("N", 2), xelem.Get("width", 48), xelem.Get("height", 48),
  // xelem.Get("periodicInput", true), xelem.Get("periodic", false), xelem.Get("symmetry", 8), xelem.Get("ground", 0));
  // const model = new OverlappingModel("Skyline", 2, 48, 48, true, true, 8, 0);
  model.ready.promise.then(() => {
    const result = model.run(0);

    if (result) {
      const container = document.getElementById("app")!;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;


      const scale = 3;
      canvas.width = model.FMX * scale;
      canvas.height = model.FMY * scale;

      for (let y = 0; y < model.FMY; y++) {
        const dy = y < model.FMY - model.N + 1 ? 0 : model.N - 1;
        for (let x = 0; x < model.FMX; x++)
        {
            const dx = x < model.FMX - model.N + 1 ? 0 : model.N - 1;
            const color = model.colors[model.patterns[model.observed[x - dx + (y - dy) * model.FMX]][dx + dy * model.N]];

            const imageData = new ImageData(new Uint8ClampedArray(color), 1, 1);
            for (let m = 0; m < scale; m += 1) {
              for (let n = 0; n < scale; n += 1) {
                context.putImageData(imageData, x * scale + m, y * scale + n);
              }
            }
        }
      }

      container.appendChild(canvas);
    }
  });

  (window as any).model = model;
}
