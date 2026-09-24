#!/usr/bin/env bash
set -e

echo "🔍 Detecting OS and Package Manager for Specto..."

OS="$(uname -s)"

case "${OS}" in
    Linux*)
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        else
            DISTRO="unknown"
        fi

        echo "🐧 Linux detected: ${DISTRO}"

        case "${DISTRO}" in
            ubuntu|debian|pop|mint|elementary)
                echo "📦 Installing Debian/Ubuntu build dependencies..."
                sudo apt update
                sudo apt install -y \
                    build-essential \
                    pkg-config \
                    libglib2.0-dev \
                    libgtk-3-dev \
                    libwebkit2gtk-4.1-dev || sudo apt install -y libwebkit2gtk-4.0-dev \
                    libappindicator3-dev \
                    librsvg2-dev \
                    libssl-dev \
                    curl
                ;;
            fedora|rhel|centos)
                echo "📦 Installing Fedora build dependencies..."
                sudo dnf install -y \
                    pkg-config \
                    glib2-devel \
                    gtk3-devel \
                    webkit2gtk4.1-devel \
                    openssl-devel \
                    curl
                ;;
            arch|manjaro)
                echo "📦 Installing Arch Linux build dependencies..."
                sudo pacman -S --needed --noconfirm \
                    base-devel \
                    pkgconf \
                    glib2 \
                    gtk3 \
                    webkit2gtk-4.1 \
                    openssl \
                    curl
                ;;
            *)
                echo "⚠️ Distro '${DISTRO}' not explicitly mapped. Please ensure GTK3, GLib2, and WebKit2GTK packages are installed."
                ;;
        esac
        ;;

    Darwin*)
        echo "🍎 macOS detected"
        if ! xcode-select -p &>/dev/null; then
            echo "📦 Installing Xcode Command Line Tools..."
            xcode-select --install
        else
            echo "✅ Xcode Command Line Tools already installed."
        fi
        ;;

    CYGWIN*|MINGW*|MSYS*)
        echo "💻 Windows detected"
        echo "ℹ️ Please ensure Visual Studio C++ Build Tools and Windows SDK are installed."
        ;;

    *)
        echo "❌ Unknown OS: ${OS}"
        exit 1
        ;;
esac

# Check for Rust / Cargo toolchain
if ! command -v cargo &> /dev/null; then
    echo "🦀 Rust is not installed. Installing rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust toolchain verified: ($(cargo --version))"
fi

echo "✨ All system dependencies are configured for Specto!"

