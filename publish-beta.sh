#!/bin/bash 
set -e

rm -f "yarn.lock";
echo "yarn.lock => Removed";

rm -f "package-lock.json";
echo "package-lock.json => Removed";

rm -rf "node_modules";
echo "node_modules => Removed";

rm -rf "dist";
echo "dist => Removed";

rm -f "tsconfig.tsbuildinfo";
echo "tsconfig.tsbuildinfo => Removed";

yarn install;

rm -f "tsconfig.tsbuildinfo";
yarn build;

npm publish --tag beta;
