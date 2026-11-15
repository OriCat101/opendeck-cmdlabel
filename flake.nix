{
  description = "OpenDeck plugin showing the output of a command as the key title";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    opendeck = {
      url = "github:missmoode/nix-opendeck";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { nixpkgs, opendeck, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
    in
    {
      packages = nixpkgs.lib.genAttrs systems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = opendeck.lib.mkPrebuiltOpenDeckPlugin pkgs (finalAttrs: {
            pname = "opendeck-cmdlabel";
            version = "0.1.0";

            src = ./.;

            pluginId = "cat.ori.cmdlabel.sdPlugin";
            pluginDir = "src";
            licenseFiles = null;

            postInstall = ''
              substituteInPlace "$plugin/start.sh" \
                --replace-fail "\''${NODE_BIN:-node}" "${pkgs.nodejs}/bin/node"
              chmod +x "$plugin/start.sh"
            '';

            meta = {
              description = "Show the output of a command as an OpenDeck key title";
              platforms = pkgs.lib.platforms.linux;
            };
          });
        }
      );
    };
}
