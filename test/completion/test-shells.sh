#!/usr/bin/env bash
# Check the completion scripts in real shells: ./test/completion/test-shells.sh [bash] [zsh] [fish]
set -euo pipefail
cd "$(dirname "$0")/../.."

BIN="$(mktemp -d)"
trap 'rm -rf "$BIN"' EXIT
printf '#!/bin/sh\nexec node -r ts-node/register/transpile-only %s/test/completion/cli.ts "$@"\n' "$PWD" > "$BIN/my-cli"
chmod +x "$BIN/my-cli"
export PATH="$BIN:$PATH"

failures=0
check() {
    local shell="$1" line="$2" expected="$3" actual="$4"
    if [ "$actual" = "$expected" ]; then
        echo "ok   $shell [$line] -> $actual"
    else
        echo "FAIL $shell [$line] -> '$actual', expected '$expected'"
        failures=$((failures + 1))
    fi
}

# line|expected completions
CASES=(
    "my-cli |db completion help"
    "my-cli db |migrate seed help"
    "my-cli db migrate --|--env --dry-run --help"
    "my-cli db migrate --env |dev prod"
    "my-cli db seed l|large"
    "my-cli db migrate --d|--dry-run"
    "my-cli db migrate -|--env -e --dry-run --help -h"
)

complete_bash() {
    bash --norc --noprofile -c '
        source <(my-cli completion bash)
        read -ra COMP_WORDS <<< "$1"
        [[ "$1" == *" " ]] && COMP_WORDS+=("")
        COMP_CWORD=$((${#COMP_WORDS[@]} - 1))
        _my_cli_completion
        echo "${COMPREPLY[*]}"' _ "$1"
}

# compadd only works in a completion widget: stub it to print the completions
complete_zsh() {
    zsh -f -c '
        compdef() {}
        compadd() { shift; print -r -- "$*"; }
        _files() { print -r -- "(files)"; }
        source <(my-cli completion zsh)
        words=(${(z)1})
        [[ "$1" == *" " ]] && words+=("")
        CURRENT=${#words}
        _my_cli_completion' _ "$1"
}

complete_fish() {
    fish --no-config -c 'my-cli completion fish | source; string join " " (complete -C "$argv[1]")' "$1"
}

for shell in "${@:-bash zsh fish}"; do
    for shell_name in $shell; do
        for case in "${CASES[@]}"; do
            line="${case%%|*}"
            expected="${case#*|}"
            check "$shell_name" "$line" "$expected" "$("complete_$shell_name" "$line")"
        done
    done
done

if [ "$failures" -gt 0 ]; then
    echo "$failures failure(s)"
    exit 1
fi
