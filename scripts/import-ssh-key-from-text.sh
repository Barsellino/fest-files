#!/usr/bin/env bash
# Зберігає приватний ключ з stdin (встав текст ключа, потім Ctrl+D).
# Не вставляй ключ у чат — лише в цей термінал.
set -euo pipefail

KEY_FILE="${1:-$HOME/.ssh/id_github_festfiles}"
SSH_DIR="$(dirname "$KEY_FILE")"
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR" 2>/dev/null || true

echo "Встав повний текст приватного ключа (рядки BEGIN … END)."
echo "Після вставки натисни Enter, потім Ctrl+D (macOS)."
cat >"$KEY_FILE"
chmod 600 "$KEY_FILE"

if ! ssh-keygen -y -f "$KEY_FILE" >"${KEY_FILE}.pub" 2>/dev/null; then
  echo "Не вдалося зчитати ключ (формат / пароль?). Перевір вміст файлу: $KEY_FILE"
  exit 1
fi
chmod 644 "${KEY_FILE}.pub"

CONFIG="$HOME/.ssh/config"
MARKER="# github.com-fest — fest-files (import-ssh-key-from-text)"

if [[ -f "$CONFIG" ]] && grep -qF "$MARKER" "$CONFIG" 2>/dev/null; then
  :
else
  {
    echo ""
    echo "$MARKER"
    echo "Host github.com-fest"
    echo "  HostName github.com"
    echo "  User git"
    echo "  IdentityFile $KEY_FILE"
    echo "  IdentitiesOnly yes"
  } >>"$CONFIG"
  chmod 600 "$CONFIG"
fi

ssh-add "$KEY_FILE" 2>/dev/null || {
  echo "Додай ключ у агент вручну: ssh-add \"$KEY_FILE\""
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [[ -d "$REPO_ROOT/.git" ]]; then
  git -C "$REPO_ROOT" remote set-url origin git@github.com-fest:Barsellino/fest-files.git
  echo "remote origin → git@github.com-fest:Barsellino/fest-files.git"
fi

echo ""
echo "—— Публічний ключ (додай на https://github.com/settings/keys → New SSH key) ——"
cat "${KEY_FILE}.pub"
echo "—— кінець ——"
echo ""
echo "Перевірка: ssh -T git@github.com-fest"
echo "Потім: cd \"$REPO_ROOT\" && git push -u origin main"
