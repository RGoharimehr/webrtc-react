-- premake5.lua — Omniverse WebRTC Monitor
--
-- Build script for the Omniverse Kit App Template integration of this project.
--
-- Prerequisites:
--   • Clone https://github.com/NVIDIA-Omniverse/kit-app-template and copy the
--     contents of this kit-app-template/ directory into the clone root.
--   • Run  ./repo.sh build  (Linux) or  .\repo.bat build  (Windows).
--
-- Kit-CAE integration (optional):
--   • Clone https://github.com/RGoharimehr/kit-cae into vendor/kit-cae/
--   • Build Kit-CAE first:  cd vendor/kit-cae && ./repo.sh build -r
--   • Then build this project normally.  The prebuild_link block below creates
--     symlinks from vendor/kit-cae's build outputs into this project's build tree
--     so that Kit can discover omni.cae.* extensions at runtime.

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

-- ── Kit-CAE integration ───────────────────────────────────────────────────────
-- When vendor/kit-cae is present (cloned from https://github.com/RGoharimehr/kit-cae),
-- link its build outputs into our build tree so Kit can find omni.cae.* extensions.
-- This mirrors the approach documented in the Kit-CAE README under
-- "Combining with Kit Application Template-based Applications".
local kit_cae_root = "%{root}/vendor/kit-cae"
local kit_cae_build = kit_cae_root .. "/_build/%{platform}/%{config}"

repo_build.prebuild_link {
    {
        kit_cae_build .. "/apps",
        "%{root}/_build/%{platform}/%{config}/kit-cae/apps"
    },
    {
        kit_cae_build .. "/exts",
        "%{root}/_build/%{platform}/%{config}/kit-cae/exts"
    },
}
