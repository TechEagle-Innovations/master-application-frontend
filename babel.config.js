// module.exports = function (api) {
//     api.cache(true);
//     return {
//       presets: [
//         ["babel-preset-expo", { jsxImportSource: "nativewind" }],
//         "nativewind/babel",
//       ],
//       plugins: [
//         "react-native-reanimated/plugin",
//         [
//           "module-resolver",
//           {
//             root: ["."],
//             extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
//             alias: {
//               "@": ".",
//             },
//           },
//         ],
//       ],
//     };
//   };
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["."],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": ".",
          },
        },
      ],
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
