"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const download = require("download-git-repo");
const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the swell ${chalk.red(
          "generator-component-lego"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "Your component name:",
        default: this.appname
      },
      {
        type: "input",
        name: "description",
        message: "component description:",
        default: this.appname
      },
      {
        type: "input",
        name: "author",
        message: "author:"
      },
      {
        type: "input",
        name: "keywords",
        message: "keywords:",
        default: this.appname
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const done = this.async();
    this._downloadTemplate()
      .then(() => {
        const templateRoot = this.destinationPath(this.dirName || "", ".tmp");
        this._walk(templateRoot, templateRoot);
        fs.removeSync(templateRoot);
        this._initPackage();
        done();
      })
      .catch(err => {
        this.env.error(err);
      });
  }

  install() {
    this.installDependencies();
  }

  _downloadTemplate() {
    return new Promise((resolve, reject) => {
      const dirPath = this.destinationPath(this.dirName || "", ".tmp");
      download("qqxu/bulletin", dirPath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  _walk(filePath, templateRoot) {
    if (fs.statSync(filePath).isDirectory()) {
      fs.readdirSync(filePath).forEach(name => {
        this._walk(path.resolve(filePath, name), templateRoot);
      });
      return;
    }

    const relativePath = path.relative(templateRoot, filePath);
    const destination = this.destinationPath(this.dirName || "", relativePath);
    this.fs.copyTpl(filePath, destination, {
      dirName: this.dirName || ""
    });
  }

  _initPackage() {
    let pkg = this.fs.readJSON(this.destinationPath("package.json"), {});
    const { props } = this;
    pkg = _.merge(pkg, {
      name: props.name,
      description: props.description,
      author: props.author,
      keywords: props.keywords
    });
    this.fs.writeJSON(this.destinationPath("package.json"), pkg);
  }
};
