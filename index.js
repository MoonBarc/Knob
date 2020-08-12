#!/usr/bin/env node
// Run knob.
console.log("OK")
require("./KnobReader")(process.cwd() + "/Knobfile")