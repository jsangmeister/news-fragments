import fs from "fs";
import Handlebars from "handlebars";
import moment from "moment";

function injectMetadata(compiledTemplate, version) {
  return `
[//]: # (s-${version})

${compiledTemplate}
[//]: # (e-${version})

`;
}

export const renderTemplate = function (changelogTemplate, data, version) {
  if (fs.existsSync(changelogTemplate)) {
    changelogTemplate = fs.readFileSync(changelogTemplate, "utf8");
  }
  const compiledTemplate = Handlebars.compile(changelogTemplate);
  const renderedTemplate = compiledTemplate(data);
  return version ? injectMetadata(renderedTemplate, version) : renderedTemplate;
};

export const saveChangelogToFile = function (
  filePath,
  prefixLinesCount,
  renderedTemplate,
) {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    // asynchronously create a directory
    fs.writeFileSync(filePath, renderedTemplate);
    return;
  }

  const oldChangelog = fs.readFileSync(filePath, "utf8");
  const lines = oldChangelog.split("\n");
  const prefix = lines.slice(0, prefixLinesCount).join("\n");
  const oldData = lines.slice(prefixLinesCount).join("\n");
  fs.unlinkSync(filePath);
  fs.appendFileSync(filePath, prefix + renderedTemplate + oldData);
};

export const generateTemplateData = function (
  newVersion,
  dateFormat,
  fragments,
) {
  return {
    newVersion,
    bumpDate: moment().format(dateFormat),
    fragments,
  };
};
