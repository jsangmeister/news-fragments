import chalkTemplate from "chalk-template";
import fs from "fs";
import { patchFs } from "fs-monkey";
import { Volume } from "memfs";
import MockDate from "mockdate";
import { afterAll, beforeAll, beforeEach } from "vitest";

import { create } from "../../src/cli/create";

var stdoutMock;

beforeAll(() => {
  stdoutMock = vi
    .spyOn(process.stdout, "write")
    .mockImplementation(() => undefined);
});

afterAll(() => {
  stdoutMock.mockRestore();
});

afterEach(() => {
  try {
    fs.unlinkSync("fragments/1557831718135.feature");
  } catch (e) {}
  MockDate.reset();
});

beforeEach(() => {
  MockDate.set("2019-05-14T11:01:58.135Z");
  const vol = Volume.fromJSON({
    fragments: {},
  });

  patchFs(vol);
});

test("should return success message when create a fragment", async () => {
  const result = create(["create", "feature", "show"]);

  expect(result).toBe(0);
  expect(stdoutMock).toHaveBeenLastCalledWith(
    "Fragment fragments/1557831718135.feature created with success!",
  );
});

test("should return error message when try to create a fragment file", async () => {
  const result = create(["create", "doidera"]);

  expect(result).toBe(1);
  const expected = chalkTemplate`Fragment type {red doidera} is invalid.
Choose one of available fragment types: {green feature,bugfix,doc,removal,misc}`;

  expect(stdoutMock).toHaveBeenLastCalledWith(expected);
});

test("should append dot at end of changelog message", async () => {
  create(["create", "feature", "a changelog message"]);

  const contents = fs.readFileSync("fragments/1557831718135.feature", "utf8");
  expect(contents).toStrictEqual("a changelog message.");
});

test.each(["", "message."])(
  "should not append dot at end of changelog message -> '%s'",
  async (message) => {
    create(["create", "feature", message]);

    const contents = fs.readFileSync("fragments/1557831718135.feature", "utf8");

    expect(contents).toStrictEqual(message);
    fs.unlinkSync("fragments/1557831718135.feature");
  },
);
