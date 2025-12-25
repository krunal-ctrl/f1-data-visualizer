#!/usr/bin/env bash
set -e

ng build --configuration production --base-href "https://krunal-ctrl.github.io/f1-data-visualizer/"
ngh --dir dist/f1-data-visualizer/browser