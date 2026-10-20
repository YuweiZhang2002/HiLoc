# HiLoc — NeurIPS 2026

Project website for **HiLoc: A Hierarchical Representation Method for Spatial Localization in Multimodal Large Language Models**.

- Project page: https://YuweiZhang2002.github.io/HiLoc/
- Paper and discussion: https://openreview.net/forum?id=V5T2vPmvxO
- Conference page: https://neurips.cc/virtual/2026/poster/152158

This repository contains the project **website**, not the model implementation or dataset release.

## Local preview

Run `python3 -m http.server 8000` in this directory, then visit http://localhost:8000.

The page is dependency-free HTML/CSS/JavaScript. The coordinate explorer illustrates the encoding and does not run the model. Experimental values come from the paper and its controlled studies. Full-system and controlled-study results are explicitly distinguished.

## Deployment

GitHub Pages uses the included `pages.yml` workflow. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. Push to `main` to deploy.

## Content

Author order and affiliations follow the authors' camera-ready manuscript. Images in `assets/` are rendered from the manuscript figures. Source figure filenames are retained for traceability. Figures include imagery from the datasets credited in the paper; this repository does not grant additional rights to third-party dataset images.

Only the public website files are packaged by the workflow. The paper source, local audit notes, authentication material, and training data are not included.
