var Plugin = require('broccoli-plugin');
var rimraf = require('rimraf');
var symlinkOrCopy = require('symlink-or-copy');

function QuickPlugin(inputNodes, optionsAndMethods) {
  var optionsToPassUp = {},
      creationPropertiesObject = {},
      originalBuild;

  if (!optionsAndMethods.build) {
    throw new Error("You must define a build function for your QuickPlugin");
  }

  // Options for QuickPlugin itself

  // By default, the plugin is a "passthrough" that symlinks its output to its
  // inputNode's outputPath, making it "pass" along all files written in the inputNode.
  // However, you can make it a "noop" which has nothing in its outputPath.
  var isPassthrough = optionsAndMethods.passthrough === false ? false : true;
  var outputAlreadySymlinked = false;
  delete optionsAndMethods.passthrough;

  // Options that go directly to broccoli-plugin
  [
    'name',
    'annotation'
  ].forEach(function(key) {
    if (optionsAndMethods[key]) {
      optionsToPassUp[key] = optionsAndMethods[key];
      delete optionsAndMethods[key];
    }
  });

  if (isPassthrough === true) {
    if (inputNodes.length > 1) {
      throw new Error("QuickPlugin doesn't (yet?) support passthrough with multiple inputNodes (" + inputNodes.length + " passed in)")
    }

    // Persist output folder so we only need to symlink once
    optionsToPassUp.persistentOutput = true;

    originalBuild = optionsAndMethods.build;

    optionsAndMethods.build = function() {

      // Make this build "pass" its input node's output along
      if (outputAlreadySymlinked === false) {
        rimraf.sync(this.outputPath);
        symlinkOrCopy.sync(this.inputPaths[0], this.outputPath);

        outputAlreadySymlinked = true;
      }

      if (originalBuild) {
        originalBuild.apply(this);
      }
    }
  }

  // Other methods and properties to set on the anonymous plugin's prototype
  Object.keys(optionsAndMethods).forEach(function(key) {
    creationPropertiesObject[key] = {
      value: optionsAndMethods[key]
    }
  });

  // Create the anonymous plugin and return it
  TempPlugin.prototype = Object.create(Plugin.prototype);
  TempPlugin.prototype.constructor = TempPlugin;

  Object.defineProperties(TempPlugin.prototype, creationPropertiesObject);

  function TempPlugin(inputNodesToPassAlong) {
    Plugin.call(this, inputNodesToPassAlong, optionsToPassUp);
  }

  return new TempPlugin(inputNodes);
}


module.exports = QuickPlugin;
