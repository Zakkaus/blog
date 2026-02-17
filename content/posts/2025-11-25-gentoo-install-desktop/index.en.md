---
title: "Gentoo Linux Installation Guide (Desktop Configuration)"
date: 2025-11-25
weight: 2
summary: "Gentoo Linux desktop environment configuration guide, covering graphics drivers, KDE/GNOME/Hyprland, input methods, fonts, and more."
description: "The latest 2025 Gentoo Linux installation guide (Desktop Configuration), covering graphics drivers, KDE/GNOME/Hyprland, input methods, fonts, and more."
keywords:
  - Gentoo Linux
  - KDE Plasma
  - GNOME
  - Hyprland
  - Input Methods
  - Fcitx5
  - IBus
  - Chinese Input
  - Japanese Input
  - Korean Input
  - Vietnamese Input
  - Arabic Input
  - Graphics Drivers
tags:
  - Gentoo
  - Linux
  - Tutorial
  - Desktop Environment
categories:
  - tutorial
authors:
  - zakkaus
---

<div>

### Article Overview

This is Part 2 of the **Gentoo Linux Installation Guide** series: **Desktop Configuration**.

**Series Navigation**:
1. [Basic Installation](/posts/2025-11-25-gentoo-install-base/): Installing Gentoo base system from scratch
2. **Desktop Configuration (This Article)**: Graphics drivers, desktop environment, input methods
3. [Advanced Optimization](/posts/2025-11-25-gentoo-install-advanced/): make.conf optimization, LTO, system maintenance

**Previous**: [Basic Installation](/posts/2025-11-25-gentoo-install-base/)

</div>

## 12. Post-Reboot Configuration

<div>

Congratulations! You have completed the basic Gentoo installation and successfully entered the new system (TTY interface).

The following sections are **optional configurations**. You can selectively configure and install based on your needs (server, desktop office, gaming, etc.).

</div>

<div>

> **Important: Check Profile and Update System**

> Before starting configuration, please confirm the Profile settings are correct and ensure the system is up to date:

```bash
eselect profile list          # List all available profiles
eselect profile set <number>  # Set selected profile (e.g., desktop/plasma/systemd)
emerge -avuDN @world          # Update system
```

</div>

Now let's configure the graphical interface and multimedia features.

### 12.0 Network Check [Required]

After logging in, ensure network connectivity is working.
- **Wired network**: Usually auto-connects.
- **Wireless network**: Use `nmtui` (NetworkManager) or `iwctl` (iwd) to connect to Wi-Fi.

### 12.1 Global Configuration (make.conf) [Required]

<div>

**Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

Edit `/etc/portage/make.conf`:

```makefile
# Add to existing settings
# VIDEO_CARDS: amdgpu radeonsi intel i915 nvidia (choose based on your GPU)
# INPUT_DEVICES: libinput synaptics (for touchpad)

VIDEO_CARDS="amdgpu radeonsi intel i915 nvidia"
INPUT_DEVICES="libinput synaptics"

# Enable wayland support (for Wayland-based desktop environments)
# Optional: for NVIDIA, also add: nvidia
USE="wayland -X"

# For Chinese input
INPUT_METHODS="fcitx5"
```

> **Note**: After modifying make.conf, rebuild packages that depend on these flags:
> ```bash
> emerge --ask --newuse --deep @world
> ```

### 12.2 Install X Server or Wayland

<div>

**Reference**: [X Server](https://wiki.gentoo.org/wiki/X_server), [Wayland](https://wiki.gentoo.org/wiki/Wayland)

</div>

<details>
<summary><b>X11 (Xorg) Installation</b></summary>

```bash
# Install X server
emerge --ask x11-base/xorg-x11

# Start X (test)
startx
```

</details>

<details>
<summary><b>Wayland Installation</b></summary>

```bash
# Wayland is usually installed as a dependency of desktop environments
# For minimal Wayland:
emerge --ask dev-libs/wayland
emerge --ask gui-wm/wayfire
```

</details>

### 12.3 Install Graphics Drivers

<div>

**Reference**: [AMDGPU](https://wiki.gentoo.org/wiki/AMDGPU), [Intel](https://wiki.gentoo.org/wiki/Intel), [NVIDIA](https://wiki.gentoo.org/wiki/NVIDIA)

</div>

<details>
<summary><b>AMD/ATI Graphics (AMDGPU, Radeon)</b></summary>

```bash
# Open source drivers (recommended)
emerge --ask x11-drivers/xf86-video-amdgpu
emerge --ask x11-drivers/xf86-video-radeon

# Enable AMDVLK (optional, for some games)
emerge --ask media-libs/amdvlk
```

</details>

<details>
<summary><b>Intel Graphics</b></summary>

```bash
# Open source driver
emerge --ask x11-drivers/xf86-video-intel

# Note: Modern Intel GPUs (Gen8+) work better with modesetting driver
# Consider using x11-drivers/xf86-video-modesetting instead
```

</details>

<details>
<summary><b>NVIDIA Graphics</b></summary>

```bash
# Open source driver (nouveau - not recommended for gaming)
emerge --ask x11-drivers/xf86-video-nouveau

# Proprietary driver (recommended for gaming)
emerge --ask x11-drivers/nvidia-drivers

# Load module at boot
echo "nvidia" >> /etc/conf.d/modules
```

For more details, see [NVIDIA Driver Installation](https://wiki.gentoo.org/wiki/NVIDIA/nvidia-drivers).

</details>

### 12.4 Install Desktop Environment

<div>

**Reference**: [Desktop Environment](https://wiki.gentoo.org/wiki/Desktop_environment)

</div>

<details>
<summary><b>KDE Plasma (Recommended)</b></summary>

```bash
# Minimal KDE
emerge --ask kde-plasma/plasma-desktop

# Full KDE
emerge --ask kde-plasma/plasma

# SDDM display manager
emerge --ask x11-misc/sddm

# Enable SDDM
# For OpenRC
rc-update add sddm default

# For systemd
systemctl enable sddm
```

</details>

<details>
<summary><b>GNOME</b></summary>

```bash
# Minimal GNOME
emerge --ask gnome-base/gnome-shell

# Full GNOME
emerge --ask gnome-base/gnome

# GDM display manager
emerge --ask gnome-base/gdm

# Enable GDM
# For OpenRC
rc-update add gdm default

# For systemd
systemctl enable gdm
```

</details>

<details>
<summary><b>Hyprland (Wayland Compositor)</b></summary>

```bash
# Install Hyprland
emerge --ask gui-wm/hyprland

# Additional utilities
emerge --ask wayland-utils
emerge --ask gui-apps/wlogout
```

</details>

<details>
<summary><b>i3wm / Sway</b></summary>

```bash
# i3 (X11)
emerge --ask window-manager/i3

# Sway (Wayland)
emerge --ask gui-wm/sway
```

</details>

### 12.5 Install Display Manager

<div>

**Reference**: [Display Manager](https://wiki.gentoo.org/wiki/Display_manager)

</div>

Common display managers:

- **SDDM** (KDE): `emerge --ask x11-misc/sddm`
- **GDM** (GNOME): `emerge --ask gnome-base/gdm`
- **LightDM** (Universal): `emerge --ask x11-misc/lightdm`

Enable:

```bash
# For OpenRC
rc-update add sddm default

# For systemd
systemctl enable sddm
```

### 12.6 Install Audio

<details>
<summary><b>PulseAudio (Recommended for Beginners)</b></summary>

```bash
# Install PulseAudio
emerge --ask media-sound/pulseaudio

# Add to startup (if needed)
# For OpenRC
rc-update add pulseaudio default

# For systemd
systemctl enable pulseaudio
```

</details>

<details>
<summary><b>PipeWire (Modern Alternative)</b></summary>

```bash
# Install PipeWire
emerge --ask media-video/pipewire

# Install audio control
emerge --ask media-libs/libpulse
emerge --ask volumekey
emerge --ask pavucontrol
```

</details>

### 12.7 Install Input Methods

<div>

**Reference**: [Fcitx5](https://wiki.gentoo.org/wiki/Fcitx5), [IBus](https://wiki.gentoo.org/wiki/IBus), [SCIM](https://wiki.gentoo.org/wiki/SCIM)

</div>

Gentoo provides input methods for many languages. Choose based on your needs.

<details>
<summary><b>Chinese - Fcitx5 (Recommended)</b></summary>

```bash
# Install Fcitx5
emerge --ask app-i18n/fcitx5
emerge --ask app-i18n/fcitx5-chinese-addons

# Install engines
emerge --ask app-i18n/fcitx5-gtk
emerge --ask app-i18n/fcitx5-qt

# Configuration
mkdir -p ~/.config/fcitx5
cp /usr/share/fcitx5/profile ~/.config/fcitx5/
```

Configure input method:

```bash
vim ~/.config/fcitx5/profile
```

Add to input methods:
- Chinese (Pinyin)
- English (Keyboard)

</details>

<details>
<summary><b>Chinese - IBus</b></summary>

```bash
# Install IBus
emerge --ask app-i18n/ibus
emerge --ask app-i18n/ibus-rime

# For GNOME
emerge --ask app-i18n/ibus-anthy
```

</details>

<details>
<summary><b>Japanese - IBus/mozc</b></summary>

```bash
# Install Mozc (Japanese input engine)
emerge --ask app-i18n/mozc

# For IBus integration
emerge --ask app-i18n/ibus-mozc

# Alternative: Anthy
emerge --ask app-i18n/anthy
```

**Configuration**:
- Add "Japanese (Mozc)" or "Anthy" to your input method list
- For IBus: `ibus-daemon -drx`

</details>

<details>
<summary><b>Korean - IBus/hangul</b></summary>

```bash
# Install Hangul (Korean input)
emerge --ask app-i18n/ibus-hangul

# Alternative: fcitx-hangul
emerge --ask app-i18n/fcitx-hangul
```

**Configuration**:
- Add "Korean (Hangul)" to your input method
- For IBus: `ibus-daemon -drx`

</details>

<details>
<summary><b>Vietnamese - IBus/Bamboo</b></summary>

```bash
# Install Vietnamese input (fcitx-unikey or ibus-unikey)
emerge --ask app-i18n/fcitx-unikey
# or
emerge --ask app-i18n/ibus-unikey
```

**Configuration**:
- Add "Vietnamese (Bamboo)" to your input method
- Configure tone markers as needed

</details>

<details>
<summary><b>Arabic - System Keyboard</b></summary>

Arabic input is typically handled by the system keyboard layout:

```bash
# Use system Arabic keyboard layout
# Desktop Settings → Keyboard → Input Sources → Arabic

# Common Arabic keyboards:
# - Arabic (OLPC)
# - Arabic (azerty)
# - Arabic (qwerty)
# - Arabic (digits)
```

**For IBus Arabic support**:

```bash
# Install IBus
emerge --ask app-i18n/ibus

# Add Arabic keyboard via desktop settings
```

</details>

<details>
<summary><b>Other Input Methods</b></summary>

**For other languages, check**:

```bash
# Search available input methods
emerge --search ibus
emerge --search fcitx
emerge --search scim

# Common ones:
# - app-i18n/scim - Smart Common Input Method
# - app-i18n/uim - Universal Input Method
# - app-i18n/gcin - Chinese input
# - app-i18n/thai - Thai input
```

</details>

**Auto-start Input Method**:

Create `~/.xprofile`:

```bash
export XMODIFIERS=@im=fcitx
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export QT4_IM_MODULE=fcitx

fcitx5 &

# For IBus:
# ibus-daemon -drx
```

### 12.8 Install Fonts

<div>

**Reference**: [Fonts](https://wiki.gentoo.org/wiki/Fonts)

</div>

Gentoo provides fonts for many languages. Install based on your needs.

<details>
<summary><b>Recommended: Noto Fonts (All-in-One)</b></summary>

```bash
# Noto Sans (recommended - covers many languages)
emerge --ask media-fonts/noto

# CJK (Chinese, Japanese, Korean)
emerge --ask media-fonts/noto-cjk

# Extra variants
emerge --ask # Emoji (included in noto)
emerge --ask # Serif variant available in noto
emerge --ask # Monospace included in noto
```

</details>

<details>
<summary><b>Chinese Fonts</b></summary>

```bash
# WenQuanYi (Most popular Chinese font)
emerge --ask media-fonts/wqy-microhei        # MicroHei (sans-serif)
emerge --ask media-fonts/wqy-zenhei           # ZenHei (sans-serif)

# AR PL (Another popular Chinese font)
emerge --ask media-fonts/arphic-uming         # Ming style
emerge --ask media-fonts/arphic-ukai          # Kai style

# Noto CJK (already included above)
# emerge --ask media-fonts/noto-cjk
```

</details>

<details>
<summary><b>Japanese Fonts</b></summary>

```bash
# Japanese fonts
emerge --ask media-fonts/noto-cjk            # Includes Japanese

# IPA Fonts (popular)
emerge --ask media-fonts/ipaex-fonts         # IPA Ex Gothic

# M+ Fonts
emerge --ask media-fonts/mplus-outline-fonts
```

</details>

<details>
<summary><b>Korean Fonts</b></summary>

```bash
# Korean fonts
emerge --ask media-fonts/noto-cjk             # Includes Korean

# Nanum Gothic (popular Korean font)
emerge --ask media-fonts/nanum-gothic-coding
emerge --ask media-fonts/nanum-gothic
```

</details>

<details>
<summary><b>Vietnamese Fonts</b></summary>

```bash
# Vietnamese fonts (covered by Noto)
emerge --ask media-fonts/noto
emerge --ask media-fonts/noto-cjk

# DejaVu (includes Vietnamese characters)
emerge --ask media-fonts/dejavu
```

</details>

<details>
<summary><b>Arabic Fonts</b></summary>

```bash
# Arabic fonts
emerge --ask media-fonts/noto                 # Includes Arabic
emerge --ask media-fonts/noto-cjk

# DejaVu (includes Arabic)
emerge --ask media-fonts/dejavu

# FreeFont (includes Arabic)
emerge --ask media-fonts/freefont

# Scheherazade (popular Arabic font)
emerge --ask media-fonts/scheherazade

# Amiri (classical Arabic calligraphy)
emerge --ask media-fonts/amiri
```

</details>

<details>
<summary><b>Indian & South Asian Fonts</b></summary>

```bash
# Indian scripts
emerge --ask media-fonts/noto                 # Includes many Indian scripts

# Lohit fonts (Indian languages)
emerge --ask media-fonts/lohit-deva           # Hindi/Devanagari
emerge --ask media-fonts/lohit-bengali       # Bengali
emerge --ask media-fonts/lohit-tamil         # Tamil
emerge --ask media-fonts/lohit-telugu       # Telugu
emerge --ask media-fonts/lohit-kannada       # Kannada
emerge --ask media-fonts/lohit-malayalam     # Malayalam
emerge --ask media-fonts/lohit-gujarati      # Gujarati
emerge --ask media-fonts/lohit-punjabi       # Punjabi/Gurmukhi
```

</details>

<details>
<summary><b>Thai Fonts</b></summary>

```bash
# Thai fonts
emerge --ask media-fonts/noto                 # Includes Thai
emerge --ask media-fonts/noto-cjk

# TLWG Thai fonts
emerge --ask media-fonts/tlwg-latex          # Thai LaTeX fonts
emerge --ask media-fonts/tlwg-woothemes      # Thai WTO fonts
```

</details>

<details>
<summary><b>Hebrew Fonts</b></summary>

```bash
# Hebrew fonts
emerge --ask media-fonts/noto                 # Includes Hebrew

# DejaVu (includes Hebrew)
emerge --ask media-fonts/dejavu

# Culmus (Hebrew academic fonts)
emerge --ask media-fonts/culmus
```

</details>

<details>
<summary><b>Cyrillic (Russian, etc.)</b></summary>

```bash
# Cyrillic support
emerge --ask media-fonts/noto                 # Includes Cyrillic

# DejaVu (includes Cyrillic)
emerge --ask media-fonts/dejavu

# Liberation (Microsoft-compatible)
emerge --ask media-fonts/liberation-fonts

# Terminus (console font)
emerge --ask media-fonts/terminus-font
```

</details>

<details>
<summary><b>Monospace / Coding Fonts</b></summary>

```bash
# JetBrains Mono (recommended for coding)
emerge --ask media-fonts/jetbrains-mono

# Fira Code (with ligatures)
emerge --ask media-fonts/fira

# Source Code Pro
emerge --ask media-fonts/source-code-pro

# Cascadia Code
emerge --ask media-fonts/cascadia-code

# Ubuntu Mono
emerge --ask media-fonts/ubuntu-mono
```

</details>

**Font Configuration**:

Configure font rendering in `/etc/fonts/local.conf`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
    <match target="font">
        <edit name="antialias" mode="assign"><int>1</int></edit>
        <edit name="hinting" mode="assign"><int>1</int></edit>
        <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>
        <edit name="rgba" mode="assign"><const>rgb</const></edit>
        <edit name="lcdfilter" mode="assign"><const>lcddefault</const></edit>
    </match>
</fontconfig>
```

Configure font rendering in `/etc/fonts/local.conf`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
    <match target="font">
        <edit name="antialias" mode="assign"><int>1</int></edit>
        <edit name="hinting" mode="assign"><int>1</int></edit>
        <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>
        <edit name="rgba" mode="assign"><const>rgb</const></edit>
        <edit name="lcdfilter" mode="assign"><const>lcddefault</const></edit>
    </match>
</fontconfig>
```

### 12.9 Install Common Software

```bash
# Browser
emerge --ask www-client/firefox
# or
emerge --ask www-client/chromium

# File manager
emerge --ask kde-apps/dolphin
# or
emerge --ask gnome-extra/nautilus

# Terminal
emerge --ask kde-apps/konsole
# or
emerge --ask gnome-terminal
# or
emerge --ask x11-terms/kitty

# Archive manager
emerge --ask app-arch/ark

# Image viewer
emerge --ask kde-apps/gwenview
# or
emerge --ask media-gfx/eog

# Media player
emerge --ask media-video/vlc
emerge --ask media-sound/audacity
```

### 12.10 Bluetooth

```bash
# Install Bluetooth stack
emerge --ask net-wireless/bluez
emerge --ask net-wireless/bluez-utils

# Enable service
# For OpenRC
rc-update add bluetooth default

# For systemd
systemctl enable bluetooth

# Start service
/etc/init.d/bluetooth start
```

### 12.11 Print and Scan

```bash
# CUPS (print service)
emerge --ask net-print/cups
systemctl enable cups

# SANE (scanner)
emerge --ask media-gfx/sane-backends
```

## What's Next?

- **Next**: [Advanced Optimization](/posts/2025-11-25-gentoo-install-advanced/) - make.conf optimization, LTO, system maintenance
- **Previous**: [Basic Installation](/posts/2025-11-25-gentoo-install-base/)

---

> **Footnote**: This article is part of the **Gentoo Linux Installation Guide** series.
