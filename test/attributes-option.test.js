/* eslint-env browser */
import path from "path";

import PreciseMiniCssExtractPlugin from "../src";

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  runInJsDom,
} from "./helpers/index";

describe("attributes option", () => {
  it(`should work without attributes option`, async () => {
    const compiler = getCompiler(
      "attributes.js",
      {},
      {
        output: {
          publicPath: "",
          path: path.resolve(__dirname, "../outputs"),
          filename: "[name].bundle.js",
        },
        plugins: [
          new PreciseMiniCssExtractPlugin({
            filename: "[name].css",
          }),
        ],
      }
    );
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      // console.log(dom.serialize())
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it(`should work with attributes option`, async () => {
    const compiler = getCompiler(
      "attributes.js",
      {},
      {
        output: {
          publicPath: "",
          path: path.resolve(__dirname, "../outputs"),
          filename: "[name].bundle.js",
        },
        plugins: [
          new PreciseMiniCssExtractPlugin({
            attributes: {
              id: "target",
              "data-target": "example",
            },
            filename: "[name].css",
          }),
        ],
      }
    );
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      // console.log(dom.serialize())
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
