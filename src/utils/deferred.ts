export class Deferred<T> {
  resolve!: (data: T) => void;
  reject!: (ex?: any) => void;
  promise: Promise<T>;
  resolved = false;
  rejected = false;

  get idle() {
    return !(this.resolved || this.rejected);
  }

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    }).then((value) => {
      this.resolved = true;
      return value;
    }, (err) => {
      this.rejected = true;
      return Promise.reject(err);
    });
  }

  static reset<T>(d: Deferred<T> | null) {
    if (d && d.idle) {
      d.reject();
    }

    return new Deferred<T>();
  }
}
