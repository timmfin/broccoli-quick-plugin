`broccoli-quick-plugin` is a prototype of an "anonymous" broccoli plugin helper, since you can no longer have have filters/plugins that are object literals. Also, it is convenient because the builder will error on any node without `__broccoliGetInfo__`.

### Usage

```js
return QuickPlugin(inputNodes, {
  build: function() {
     /* your code here */
  },

  // Options that are passed to broccoli-plugin
  name: "...",
  annotation: "...",

  // Other options

  // By default, the plugin is a "passthrough" that symlinks its output to its
  // inputNode's outputPath, making it "pass" along all files written in the inputNode.
  // However, you can make it a "noop" which has nothing in its outputPath.

  passthrough: "false"  // defaults to true
});
 ```

Since you can no longer do this:

```js
// How you used to be able to have a anonymous plugin pre broccoli v1.0.0-beta
return {
  read: function(readTree) {
    /* Your own quick little plugin code */
  }
}
```
