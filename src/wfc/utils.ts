import { create as CreateSeed } from "random-seed";

const randomContainer = {
  random: CreateSeed("ilovedxx"),
};

export function next(key: string) {
  randomContainer.random = CreateSeed(key);
}

export function random() {
  return randomContainer.random.random();
}
