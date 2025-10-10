{ pkgs, lib, config, inputs, ... }:

{
  overlays = [
    (final: prev: {
      # Use a package from nixpkgs-unstable
      nodejs = (import inputs.nixpkgs-nodejs {
        system = prev.stdenv.system;
      }).nodejs;
    })
  ];

  # https://devenv.sh/basics/
  # env.BOT_SQLITE_FILE = "/tmp/bot.db";

  # https://devenv.sh/packages/
  packages = [ pkgs.git pkgs.tsx pkgs.gh ];

  # https://devenv.sh/languages/
  languages.python = {
    enable = true;
    uv.enable = true;
  };
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs;
    npm.enable = true;
  };

  languages.typescript.enable = true;

  languages.rust.enable = true;

  dotenv.enable = true;

  # https://devenv.sh/processes/
  # processes.cargo-watch.exec = "cargo-watch";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  # scripts.hello.exec = ''
  #   echo hello from $GREET
  # '';

  # enterShell = ''
  #   hello
  #   git --version
  # '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  # enterTest = ''
  #   echo "Running tests"
  #   git --version | grep --color=auto "${pkgs.git.version}"
  # '';

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
