-- premake5.lua — Omniverse WebRTC Monitor
--
-- Build script for the Omniverse Kit App Template integration of this project.
--
-- Prerequisites:
--   • Clone https://github.com/NVIDIA-Omniverse/kit-app-template and copy the
--     contents of this kit-app-template/ directory into the clone root.
--   • Run  ./repo.sh build  (Linux) or  .\repo.bat build  (Windows).

-- Shared build scripts from repo_build package.
repo_build = require("omni/repo/build")

-- Repo root
root = repo_build.get_abs_path(".")

-- Run repo_kit_tools premake5-kit which includes Kit-friendly tooling config.
kit = require("_repo/deps/repo_kit_tools/kit-template/premake5-kit")
kit.setup_all({ cppdialect = "C++17" })

-- Registries config for testing
repo_build.prebuild_copy {
    { "%{root}/tools/deps/user.toml", "%{root}/_build/deps/user.toml" },
}

-- Apps: Kit discovers .kit files under source/apps/ automatically.
-- Extensions: Kit discovers source directories under source/extensions/ automatically.
