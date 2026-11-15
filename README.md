# opendeck-cmdlabel

An [OpenDeck](https://github.com/nekename/OpenDeck) plugin that sets a key's title or image from the output of a command.

The bundled Run Command action only shows output after a press. This one runs its commands when the key appears and again every 60 seconds, so the key stays current on its own.

## Settings

The action `cat.ori.cmdlabel.label` reads three optional settings, each a shell command run with `sh -c`:

| Setting | Effect |
| -- | -- |
| `command` | stdout becomes the key title |
| `image` | stdout is a path to a PNG or SVG file, which becomes the key image |
| `press` | run when the key is pressed |

There is no property inspector; set these in the profile JSON:

```json
{
  "command": "date +%H:%M",
  "press": "notify-send hello"
}
```

A failing `command` shows `!` as the title. A failing `image` command leaves the image unchanged.

## Install

With [nix-opendeck](https://github.com/missmoode/nix-opendeck) and Home Manager:

```nix
{
  inputs.opendeck-cmdlabel = {
    url = "github:OriCat101/opendeck-cmdlabel";
    inputs.nixpkgs.follows = "nixpkgs";
    inputs.opendeck.follows = "opendeck";
  };
}
```

```nix
programs.opendeck.plugins = [
  inputs.opendeck-cmdlabel.packages.${pkgs.stdenv.hostPlatform.system}.default
];
```

Without Nix, copy `src/` to OpenDeck's plugin directory as `cat.ori.cmdlabel.sdPlugin`, make `start.sh` executable, and have Node.js 22 or newer on `PATH` (or set `NODE_BIN`).
