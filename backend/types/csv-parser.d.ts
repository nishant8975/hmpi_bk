declare module "csv-parser" {
  import { Transform } from "stream";

  interface Options {
    separator?: string;
    newline?: string;
    headers?: string[] | boolean;
    skipLines?: number;
    strict?: boolean;
  }

  function csvParser(options?: Options): Transform;

  export = csvParser;
}
