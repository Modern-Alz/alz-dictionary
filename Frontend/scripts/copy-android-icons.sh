#!/bin/bash
# Run after `npx cap add android`
ICONS="$(dirname "$0")/../../alz-icons"
[ ! -d "$ICONS" ] && ICONS="$(dirname "$0")/../public"
ANDROID="$(dirname "$0")/../android/app/src/main/res"
for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  cp "$ICONS/mipmap-${density}.png" "$ANDROID/mipmap-${density}/ic_launcher.png"       2>/dev/null
  cp "$ICONS/mipmap-${density}.png" "$ANDROID/mipmap-${density}/ic_launcher_round.png" 2>/dev/null
done
echo "Android icons placed in $ANDROID"
