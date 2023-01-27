import webpack from "webpack";

import PreciseMiniCssExtractPlugin from "../src";

describe("API", () => {
  it("should return the same CssModule when same webpack instance provided", () => {
    expect(PreciseMiniCssExtractPlugin.getCssModule(webpack)).toEqual(
      PreciseMiniCssExtractPlugin.getCssModule(webpack)
    );
  });

  it("should return the same CssDependency when same webpack instance provided", () => {
    expect(PreciseMiniCssExtractPlugin.getCssDependency(webpack)).toEqual(
      PreciseMiniCssExtractPlugin.getCssDependency(webpack)
    );
  });
});
