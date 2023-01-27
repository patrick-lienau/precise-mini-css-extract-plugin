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

describe("linkType option", () => {
  it(`should work without linkType option`, async () => {
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
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it(`should work when linkType option is "false"`, async () => {
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
            linkType: false,
            filename: "[name].css",
          }),
        ],
      }
    );
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it(`should work when linkType option is "text/css"`, async () => {
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
            linkType: "text/css",
            filename: "[name].css",
          }),
        ],
      }
    );
    const stats = await compile(compiler);

    runInJsDom("main.bundle.js", compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot("DOM");
    });

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
