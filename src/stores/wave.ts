import { observable } from "mobx";
import { Solver } from "./solver";

export interface ITile {
  url: string;
  name: string;
  scaleX?: number;
  rotate?: number;
}

export class WaveStore extends Solver {
  periodic = false;
  tileSize = 7;

  @observable.shallow result = null as number[] | null;

  inputTiles: Array<{ url: string; symmetry: "I" | "L" | "X" | "T" }> = [
    { url: "/samples/castle/bridge.png", symmetry: "I" },
    { url: "/samples/castle/ground.png", symmetry: "X" },
    { url: "/samples/castle/river.png", symmetry: "I" },
    { url: "/samples/castle/riverturn.png", symmetry: "L" },
    { url: "/samples/castle/road.png", symmetry: "I" },
    { url: "/samples/castle/roadturn.png", symmetry: "L" },
    { url: "/samples/castle/t.png", symmetry: "T" },
    { url: "/samples/castle/tower.png", symmetry: "L" },
    { url: "/samples/castle/wall.png", symmetry: "I" },
    { url: "/samples/castle/wallriver.png", symmetry: "I" },
    { url: "/samples/castle/wallroad.png", symmetry: "I" },
  ];

  neighbors = [
    {left: "bridge 1", right: "river 1" },
		{left: "bridge 1", right: "riverturn 1" },
		{left: "bridge", right: "road 1" },
		{left: "bridge", right: "roadturn 1" },
		{left: "bridge", right: "t" },
		{left: "bridge", right: "t 3" },
		{left: "bridge", right: "wallroad" },
		{left: "ground", right: "ground" },
		{left: "ground", right: "river" },
		{left: "ground", right: "riverturn" },
		{left: "ground", right: "road" },
		{left: "ground", right: "roadturn" },
		{left: "ground", right: "t 1" },
		{left: "ground", right: "tower" },
		{left: "ground", right: "wall" },
		{left: "river 1", right: "river 1" },
		{left: "river 1", right: "riverturn 1" },
		{left: "river", right: "road" },
		{left: "river", right: "roadturn" },
		{left: "river", right: "t 1" },
		{left: "river", right: "tower" },
		{left: "river", right: "wall" },
		{left: "river 1", right: "wallriver" },
		{left: "riverturn", right: "riverturn 2" },
		{left: "road", right: "riverturn" },
		{left: "roadturn 1", right: "riverturn" },
		{left: "roadturn 2", right: "riverturn" },
		{left: "t 3", right: "riverturn" },
		{left: "tower 1", right: "riverturn" },
		{left: "tower 2", right: "riverturn" },
		{left: "wall", right: "riverturn" },
		{left: "riverturn", right: "wallriver" },
		{left: "road 1", right: "road 1" },
		{left: "roadturn", right: "road 1" },
		{left: "road 1", right: "t" },
		{left: "road 1", right: "t 3" },
		{left: "road", right: "tower" },
		{left: "road", right: "wall" },
		{left: "road 1", right: "wallroad" },
		{left: "roadturn", right: "roadturn 2" },
		{left: "roadturn", right: "t" },
		{left: "roadturn 1", right: "tower" },
		{left: "roadturn 2", right: "tower" },
		{left: "roadturn 1", right: "wall" },
		{left: "roadturn", right: "wallroad" },
		{left: "t", right: "t 2" },
		{left: "t 3", right: "tower" },
		{left: "t 3", right: "wall" },
		{left: "t", right: "wallroad" },
		{left: "t 1", right: "wallroad" },
		{left: "tower", right: "wall 1" },
		{left: "tower", right: "wallriver 1" },
		{left: "tower", right: "wallroad 1" },
		{left: "wall 1", right: "wall 1" },
		{left: "wall 1", right: "wallriver 1" },
		{left: "wall 1", right: "wallroad 1" },
		{left: "wallriver 1", right: "wallroad 1" },
  ];

  tiles: Array<ITile>;
  tileNames: { [key in string]: number };
  propagator: number[][][];

  constructor() {
    super(10, 10);
    this.tiles = [];
    this.tileNames = {} as { [key in string]: number };
    for (let i = 0; i < this.inputTiles.length; i += 1) {
      const tile = this.inputTiles[i];
      const n = tile.url.match(/([^\/]*)\.png$/)![1];

      if (tile.symmetry === "I") {
        for (let j = 0; j < 2; j += 1) {
          const name = `${n} ${j}`;
          this.tileNames[name] = this.tiles.length;
          this.tiles.push({ url: tile.url, name, rotate: -j * 90 });
        }
      } else if (tile.symmetry === "L") {
        let name = `${n} 0`;
        this.tileNames[name] = this.tiles.length;
        this.tiles.push({ url: tile.url, name });
        name = `${n} 1`;
        this.tileNames[name] = this.tiles.length;
        this.tiles.push({ url: tile.url, name, scaleX: -1 });
        name = `${n} 2`;
        this.tileNames[name] = this.tiles.length;
        this.tiles.push({ url: tile.url, name, rotate: -90, scaleX: -1 });
        name = `${n} 3`;
        this.tileNames[name] = this.tiles.length;
        this.tiles.push({ url: tile.url, name, rotate: 90, });
      } else if (tile.symmetry === "T") {
        for (let j = 0; j < 4; j += 1) {
          const name = `${n} ${j}`;
          this.tileNames[name] = this.tiles.length;
          this.tiles.push({ url: tile.url, name, rotate: -j * 90 });
        }
      } else {
        this.tileNames[n] = this.tiles.length;
        this.tiles.push({ url: tile.url, name: n });
      }
    }

    this.T = this.tiles.length;
    this.weights = Array.from({ length: this.T }).map(() => 1);

    this.propagator = [
      [
        [10, 11, 14, 15, 16, 17, 27, ],
        [4, 5, 8, ],
        [2, 3, 6, 7, 9, 12, 13, 18, 20, 21, 23, ],
        [2, 9, 12, 13, 18, 20, 21, 23, ],
        [1, 4, 5, 8, 25, ],
        [2, 9, 12, 13, 18, 20, 21, 23, ],
        [1, 4, 8, 25, ],
        [1, 4, 5, 25, ],
        [2, 9, 12, 13, 18, 20, 21, 23, ],
        [2, 3, 6, 7, 20, 21, 23, ],
        [0, 10, 11, 14, 15, 16, 17, 27, ],
        [2, 3, 6, 7, 20, 21, 23, ],
        [0, 10, 14, 15, 27, ],
        [0, 10, 11, 17, 27, ],
        [2, 3, 6, 7, 20, 21, 23, ],
        [0, 10, 11, 17, 27, ],
        [2, 3, 6, 7, 20, 21, 23, ],
        [0, 10, 14, 15, 27, ],
        [0, 10, 27, ],
        [2, 3, 6, 7, 9, 12, 13, 18, ],
        [24, 26, 28, ],
        [24, 26, 28, ],
        [2, 3, 6, 7, 9, 12, 13, 18, ],
        [2, 3, 6, 7, 9, 12, 13, 18, ],
        [19, 22, 24, 26, 28, ],
        [4, 5, 8, ],
        [19, 22, 24, 28, ],
        [0, 10, 11, 14, 15, 16, 17, ],
        [19, 22, 24, 26, ],
      ],
      [
        [3, 5, 6, ],
        [9, 11, 12, 16, 17, 18, 28, ],
        [2, 4, 7, 8, 10, 13, 14, 15, 21, 22, 24, ],
        [0, 3, 5, 6, 26, ],
        [2, 10, 13, 14, 15, 21, 22, 24, ],
        [2, 10, 13, 14, 15, 21, 22, 24, ],
        [2, 10, 13, 14, 15, 21, 22, 24, ],
        [0, 3, 5, 26, ],
        [0, 3, 6, 26, ],
        [1, 9, 11, 12, 16, 17, 18, 28, ],
        [2, 4, 7, 8, 21, 22, 24, ],
        [2, 4, 7, 8, 21, 22, 24, ],
        [2, 4, 7, 8, 21, 22, 24, ],
        [1, 9, 11, 16, 28, ],
        [1, 9, 12, 18, 28, ],
        [1, 9, 28, ],
        [1, 9, 12, 18, 28, ],
        [2, 4, 7, 8, 21, 22, 24, ],
        [1, 9, 11, 16, 28, ],
        [2, 4, 7, 8, 10, 13, 14, 15, ],
        [2, 4, 7, 8, 10, 13, 14, 15, ],
        [23, 25, 27, ],
        [23, 25, 27, ],
        [19, 20, 23, 25, 27, ],
        [2, 4, 7, 8, 10, 13, 14, 15, ],
        [19, 20, 23, 27, ],
        [3, 5, 6, ],
        [19, 20, 23, 25, ],
        [1, 9, 11, 12, 16, 17, 18, ],
      ],
      [
        [10, 12, 13, 15, 17, 18, 27, ],
        [4, 6, 7, ],
        [2, 3, 5, 8, 9, 11, 14, 16, 19, 22, 23, ],
        [2, 9, 11, 14, 16, 19, 22, 23, ],
        [1, 4, 6, 7, 25, ],
        [1, 4, 7, 25, ],
        [2, 9, 11, 14, 16, 19, 22, 23, ],
        [2, 9, 11, 14, 16, 19, 22, 23, ],
        [1, 4, 6, 25, ],
        [2, 3, 5, 8, 19, 22, 23, ],
        [0, 10, 12, 13, 15, 17, 18, 27, ],
        [0, 10, 13, 15, 27, ],
        [2, 3, 5, 8, 19, 22, 23, ],
        [2, 3, 5, 8, 19, 22, 23, ],
        [0, 10, 12, 17, 27, ],
        [0, 10, 12, 17, 27, ],
        [0, 10, 27, ],
        [0, 10, 13, 15, 27, ],
        [2, 3, 5, 8, 19, 22, 23, ],
        [24, 26, 28, ],
        [2, 3, 5, 8, 9, 11, 14, 16, ],
        [2, 3, 5, 8, 9, 11, 14, 16, ],
        [24, 26, 28, ],
        [2, 3, 5, 8, 9, 11, 14, 16, ],
        [20, 21, 24, 26, 28, ],
        [4, 6, 7, ],
        [20, 21, 24, 28, ],
        [0, 10, 12, 13, 15, 17, 18, ],
        [20, 21, 24, 26, ],
      ],
      [
        [3, 7, 8, ],
        [9, 13, 14, 15, 16, 18, 28, ],
        [2, 4, 5, 6, 10, 11, 12, 17, 19, 20, 24, ],
        [0, 3, 7, 8, 26, ],
        [2, 10, 11, 12, 17, 19, 20, 24, ],
        [0, 3, 7, 26, ],
        [0, 3, 8, 26, ],
        [2, 10, 11, 12, 17, 19, 20, 24, ],
        [2, 10, 11, 12, 17, 19, 20, 24, ],
        [1, 9, 13, 14, 15, 16, 18, 28, ],
        [2, 4, 5, 6, 19, 20, 24, ],
        [1, 9, 13, 18, 28, ],
        [1, 9, 14, 16, 28, ],
        [2, 4, 5, 6, 19, 20, 24, ],
        [2, 4, 5, 6, 19, 20, 24, ],
        [2, 4, 5, 6, 19, 20, 24, ],
        [1, 9, 13, 18, 28, ],
        [1, 9, 28, ],
        [1, 9, 14, 16, 28, ],
        [23, 25, 27, ],
        [23, 25, 27, ],
        [2, 4, 5, 6, 10, 11, 12, 17, ],
        [2, 4, 5, 6, 10, 11, 12, 17, ],
        [21, 22, 23, 25, 27, ],
        [2, 4, 5, 6, 10, 11, 12, 17, ],
        [21, 22, 23, 27, ],
        [3, 7, 8, ],
        [21, 22, 23, 25, ],
        [1, 9, 13, 14, 15, 16, 18, ],
      ]
    ];
  }

  onBoundary(x: number, y: number) {
    return !this.periodic && (x < 0 || y < 0 || x >= this.FMX || y >= this.FMY);
  }

  setup() {
    const result = this.run(0);
    if (result) {
      this.result = this.observed.slice();
    }
  }
}

export const wave = new WaveStore();

(window as any).wave = wave;
