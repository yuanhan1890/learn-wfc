import { OverlappingModel } from "./overlappingModel";

export function main() {
  // <overlapping name="Skyline" N="3" symmetry="2" ground="-1" periodic="True"/>
  const model = new OverlappingModel("Skyline", 3, 48, 48, true, true, 2, -1);
  model.ready.promise.then(() => {
    const result = model.run(0);
    console.log(result);
  });

  (window as any).model = model;
}
