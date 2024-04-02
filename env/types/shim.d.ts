declare module "josa-js" {
  class Josa {
    /**
     * 원문을 **포함**해서 반환함
     * @example
     * ```ts
     * Josa.r("샴고양이", "을/를"); // "샴고양이를"
     * ```
     */
    public static r(str: string, josa: string): string;
    /**
     * 원문을 **포함 하지 않음!!!**
     * @example
     * ```ts
     * Josa.r("샴고양이", "을/를"); // "를"
     * ```
     */
    public static c(str: string, josa: string): string;
  }

  export default Josa;
}

declare module "korean-random-words" {
  class PhraseGen {
    public generatePhrase(): string;
    public getNoun(): string;
    public getAdjective(): string;
  }

  export default PhraseGen;
}

declare module "gif-encoder-2" {
  class GIFEncoder {
    public out: {
      getData(): Buffer;
    };

    public constructor(width: number, height: number, algorithm: "neuquant" | "octree", useOptimizer: boolean, totalFrames: number);
    public setDelay(delay: number);
    public start(): void;
    public finish(): void;
    public addFrame(ctx: CanvasRenderingContext2D): void;
  }

  export default GIFEncoder;
}
