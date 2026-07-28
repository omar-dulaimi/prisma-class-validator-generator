#!/bin/bash
# Builds the publish workspace in package/, which is what `package:publish`
# actually uploads.
#
# `set -euo pipefail` is load-bearing. Without it this script called a bare
# `tsc`, which is only on PATH inside an npm script, so run as `./package.sh` it
# died with "tsc: command not found", carried on past a failed `cp -r lib`, and
# exited 0 having assembled a package/ holding nothing but package.json, README
# and LICENSE. `package:publish` is `./package.sh && cd package && npm publish`,
# so that published a package with no lib/ at all and a `bin` pointing at a file
# that was not in it.
set -euo pipefail

START_TIME=$SECONDS

echo "Building package..."
# `npm run build`, not a bare `tsc`: this has to work when the script is invoked
# directly from a shell, which is how CI and the publish script both call it.
rm -rf lib
npm run build

# -f: neither directory is guaranteed to exist on a clean checkout, and errors
# are fatal now.
rm -rf package
mkdir package

echo "Copying files..."
cp -r lib package/lib
cp package.json README.md LICENSE package

echo "Making package.json public..."
sed -i 's/"private": true/"private": false/' ./package/package.json

ELAPSED_TIME=$((SECONDS - START_TIME))
echo "Done in $ELAPSED_TIME seconds!"
