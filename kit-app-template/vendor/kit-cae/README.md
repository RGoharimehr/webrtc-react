# vendor/kit-cae

This directory is the expected location for the **Kit-CAE** source code.

Clone it with:

```bash
# From the kit-app-template/ directory (i.e. from inside webrtc-react/kit-app-template/)
git clone https://github.com/RGoharimehr/kit-cae vendor/kit-cae
```

Once cloned, build Kit-CAE before building the main project:

```bash
# Linux
cd vendor/kit-cae
./repo.sh build -r
cd ../..

# Windows
cd vendor\kit-cae
repo.bat build -r
cd ..\..
```

Then build this project as usual:

```bash
# Linux
./repo.sh build

# Windows
.\repo.bat build
```

The `premake5.lua` in this directory creates symlinks from
`vendor/kit-cae/_build/<platform>/<config>/apps` and
`vendor/kit-cae/_build/<platform>/<config>/exts`
into `_build/<platform>/<config>/kit-cae/`, so that Kit can
discover `omni.cae.*` extensions at runtime.

## Why vendor/kit-cae is not tracked by git

The kit-cae source tree is large (C++ code, USD schemas, pre-built libraries)
and changes independently of this project. It is intentionally excluded from
version control here via `.gitignore`. Users should clone it directly from
https://github.com/RGoharimehr/kit-cae as described above.
