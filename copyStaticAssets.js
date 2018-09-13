"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require("shelljs");
shell.cp("-R", "src/public/js/lib", "dist/public/js/");
