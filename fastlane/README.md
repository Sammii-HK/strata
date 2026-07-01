fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios create_asc_app

```sh
[bundle exec] fastlane ios create_asc_app
```

Create the App Store Connect app record for Strata (draft only, no submit)

### ios metadata

```sh
[bundle exec] fastlane ios metadata
```

Push listing metadata + screenshots (no build, no submit)

### ios upload

```sh
[bundle exec] fastlane ios upload
```

Upload a built .ipa (set IPA_PATH), no metadata, no submit

### ios submit

```sh
[bundle exec] fastlane ios submit
```

Submit the current build for review — PUBLISHES. Run only with explicit approval.

### ios build_ipa

```sh
[bundle exec] fastlane ios build_ipa
```

Archive a Release IPA for the App Store (Expo workspace)

### ios upload_build

```sh
[bundle exec] fastlane ios upload_build
```

Upload the archived IPA to TestFlight / App Store Connect

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
