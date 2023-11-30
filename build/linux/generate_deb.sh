#!/bin/bash

# Constants
ERROR_CODE=1
WAILS_WEBSITE="https://wails.io/docs/gettingstarted/installation/"
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
PROJECT_DIR="$SCRIPT_DIR/../../"
BIN_DIR="$SCRIPT_DIR/../bin"
BIN_NAME=$(jq -r '.name' "$PROJECT_DIR/wails.json")
VERSION=$(jq -r '.version' "$PROJECT_DIR/wails.json")
ARCHITECTURE=$(dpkg --print-architecture)
DESCRIPTION="Desktop application for controlling Xiaomi/Yeelight lightbulb"

# Check necessary apps installed
if ! command -v wails &> /dev/null; then
    printf "Wails could not be found. Check %s\n" "$WAILS_WEBSITE"
    exit $ERROR_CODE
fi

if ! command -v dpkg &> /dev/null; then
    printf "dpkg could not be found\n"
    exit $ERROR_CODE
fi

if ! command -v dpkg-shlibdeps &> /dev/null; then
    printf "dpkg-shlibdeps could not be found\n"
    exit $ERROR_CODE
fi

if ! command -v lintian &> /dev/null; then
    printf "lintian could not be found\n"
    exit $ERROR_CODE
fi

# Print parameters
printf "Checking params...\nScript path:  %s\nProject path: %s\nBin path:     %s\nBin name:     %s\nArchitecture: %s\nVersion:      %s\n" \
    "$SCRIPT_DIR" "$PROJECT_DIR" "$BIN_DIR" "$BIN_NAME" "$ARCHITECTURE" "$VERSION"

# Compile if no binary
if [[ ! -e "$BIN_DIR/$BIN_NAME" ]]; then
    printf "Bin folder is empty. Building the project first...\n"

    printf "Running wails build doctor...\n"
    if ! EXEC_LOGS=$(wails doctor); then
        printf "Wails build doctor failed.\n%s\nCheck %s\n" "$EXEC_LOGS" "$WAILS_WEBSITE"
        exit $ERROR_CODE
    fi

    printf "Building project...\n"
    if ! cd "$PROJECT_DIR" || ! EXEC_LOGS=$(wails build); then
        printf "Project build failed.\n%s\nCheck %s\n" "$EXEC_LOGS" "$WAILS_WEBSITE"
        exit $ERROR_CODE
    fi
fi

printf "Creating debian package...\n"

# Create debian folder
cd "$BIN_DIR" || { printf "cd failed : %s\n" "$BIN_DIR"; exit "$ERROR_CODE"; }
DEB_DIR_NAME="${BIN_NAME}_$VERSION_$ARCHITECTURE"
rm -rf "$DEB_DIR_NAME"

DEB_BIN_PATH=/usr/local/bin
DEB_ICON_PATH=/usr/share/pixmaps
DEB_DESKTOP_PATH=/usr/share/applications

# Create subfolders
mkdir -p "$DEB_DIR_NAME$DEB_BIN_PATH"
mkdir -p "$DEB_DIR_NAME$DEB_ICON_PATH"
mkdir -p "$DEB_DIR_NAME$DEB_DESKTOP_PATH"
mkdir -p "$DEB_DIR_NAME/DEBIAN"
mkdir -p "$DEB_DIR_NAME/debian"

# Copy bin
cp "$BIN_DIR/$BIN_NAME" "$DEB_DIR_NAME$DEB_BIN_PATH"

# Copy icon
cp "$SCRIPT_DIR/icon.png" "$DEB_DIR_NAME$DEB_ICON_PATH/$BIN_NAME.png"

# Create the .desktop file
cat > "$DEB_DIR_NAME$DEB_DESKTOP_PATH/$BIN_NAME.desktop" << EOF
[Desktop Entry]
Encoding=UTF-8
Name=$BIN_NAME
Comment=$DESCRIPTION
Exec=$DEB_BIN_PATH/$BIN_NAME
Terminal=false
Type=Application
Icon=$DEB_ICON_PATH/$BIN_NAME.png
EOF

# Create control file
cat > "$DEB_DIR_NAME/DEBIAN/control" << EOF
Package: $BIN_NAME
Version: $VERSION
Architecture: $ARCHITECTURE
Maintainer: Ivan Kurilla <vanyason96@gmail.com>
Description: $DESCRIPTION
Priority: optional
Section: utils
EOF

# Set permissions
chmod -R 755 "$DEB_DIR_NAME/usr"
chmod 755 "$DEB_DIR_NAME$DEB_BIN_PATH/$BIN_NAME"
chmod 644 "$DEB_DIR_NAME$DEB_ICON_PATH/$BIN_NAME.png"
chmod 644 "$DEB_DIR_NAME$DEB_DESKTOP_PATH/$BIN_NAME.desktop"
chmod 644 "$DEB_DIR_NAME/DEBIAN/control"

# Hack to fill dependencies... Create temporary debian/control file to execute dpkg-shlibdeps
mkdir -p "$DEB_DIR_NAME/debian"
cp "$DEB_DIR_NAME/DEBIAN/control" "$DEB_DIR_NAME/debian/control"
echo "Source:" >> "$DEB_DIR_NAME/debian/control"
cd "$DEB_DIR_NAME" || { printf "cd failed : %s\n" "$DEB_DIR_NAME"; exit "$ERROR_CODE"; }
dpkg-shlibdeps -O "./$DEB_BIN_PATH/$BIN_NAME" | sed 's/.*Depends=/Depends: /g' >> "DEBIAN/control"
rm -rf "debian"
cd "$BIN_DIR" || { printf "cd failed : %s\n" "$BIN_DIR"; exit "$ERROR_CODE"; }

# Build deb
dpkg-deb --build --root-owner-group "$DEB_DIR_NAME"

# Clean up
rm -rf "$DEB_DIR_NAME"

# Check deb
printf "Package created! lintian output:\n"
lintian "$DEB_DIR_NAME.deb"