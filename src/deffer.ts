export class Deffer<T> {
  resolve!: (data: T) => void;
  reject!: (ex?: Error) => void;
  promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
