---
title: "Gentoo Linux Installation Guide (Desktop Configuration)"
date: 2025-11-25
weight: 2
summary: "Gentoo Linux desktop environment configuration guide, covering graphics drivers, KDE/GNOME/Hyprland, input methods (Fcitx5, IBus), fonts, Secure Boot, and more."
description: "The latest 2025 Gentoo Linux installation guide (Desktop Configuration), covering graphics drivers, KDE/GNOME/Hyprland, input methods, fonts, and more."
keywords:
  - Gentoo Linux
  - KDE Plasma
  - GNOME
  - Hyprland
  - Input Methods
  - Fcitx5
  - IBus
  - Rime
  - Graphics Drivers
  - Secure Boot
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

## 12. Post-Reboot Configuration {#step-12-post-reboot}

<div>

Congratulations! You have completed the basic Gentoo installation and successfully entered the new system (TTY interface).

The following sections are **optional configurations**. You can selectively configure and install based on your needs (server, desktop, gaming, etc.).

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

> **Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

`/etc/portage/make.conf` is Gentoo's global configuration file. At this stage, we only need to configure GPU, input devices, and localization options. Detailed compilation optimization will be covered in **Section 13.0**.

```bash
vim /etc/portage/make.conf
```

Add or modify the following:

```bash
# Graphics driver (choose based on your hardware)
VIDEO_CARDS="nvidia"          # NVIDIA
# VIDEO_CARDS="amdgpu radeonsi" # AMD
# VIDEO_CARDS="intel i965 iris" # Intel
# Input devices
INPUT_DEVICES="libinput"
# Localization
L10N="en en-US"
LINGUAS="en en_US"
# Desktop environment support
USE="${USE} wayland X pipewire pulseaudio alsa"
```

### 12.2 Apply Configuration and Update System [Required]

Apply new USE flags:

```bash
emerge --ask --newuse --deep @world
```

### 12.3 Graphics Drivers [Required]

<div>

> **Reference**: [NVIDIA/nvidia-drivers](https://wiki.gentoo.org/wiki/NVIDIA/nvidia-drivers) · [AMDGPU](https://wiki.gentoo.org/wiki/AMDGPU) · [Intel](https://wiki.gentoo.org/wiki/Intel)

</div>

- **NVIDIA proprietary drivers**: `emerge --ask x11-drivers/nvidia-drivers`
- **AMD**: Set `VIDEO_CARDS="amdgpu radeonsi"`
- **Intel**: Set `VIDEO_CARDS="intel i965 iris"`

**Configure VAAPI Video Acceleration**

<div>

> **Reference**: [VAAPI](https://wiki.gentoo.org/wiki/VAAPI) · [nvidia-vaapi-driver](https://packages.gentoo.org/packages/media-libs/nvidia-vaapi-driver)

</div>

1. **Enable VAAPI globally**:
   Add `vaapi` to the `USE` flags in `/etc/portage/make.conf`.
   ```bash
   # Rebuild affected packages
   emerge --ask --changed-use --deep @world
   ```

2. **Install drivers and tools**:
   ```bash
   emerge --ask media-video/libva-utils # Install vainfo for verification
   ```

   **NVIDIA users - additional step**:
   ```bash
   emerge --ask media-libs/nvidia-vaapi-driver
   ```

<div>

**Note**

`nvidia-vaapi-driver` may be unstable under Wayland (CUDA/OpenGL interop issues).
See: [NVIDIA Forums](https://forums.developer.nvidia.com/t/is-cuda-opengl-interop-supported-on-wayland/267052)

**NVIDIA users also need to enable DRM KMS in kernel parameters**:
Edit `/etc/default/grub`, add `nvidia_drm.modeset=1` to `GRUB_CMDLINE_LINUX_DEFAULT`.

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

</div>

   **Intel/AMD users**:
   Usually supported directly after installing the graphics driver.

3. **Verify**:
   Run `vainfo` — if it shows no errors and displays supported profiles, it's working.

<details>
<summary><b>NVIDIA Chromium Hardware Acceleration Configuration (No VAAPI needed) (Click to Expand)</b></summary>

<div>

The following configuration applies to Chromium, Chrome, Edge, and Electron apps (e.g., VSCode).

</div>

**Method 1: Flags configuration file (recommended)**

This approach does not require modifying `.desktop` files, and the browser can be correctly recognized as the default browser.

**1. Environment variables**

Create `~/.config/environment.d/chromium-nvidia.conf`:

```bash
# NVIDIA environment variables
__GLX_VENDOR_LIBRARY_NAME=nvidia
__VK_LAYER_NV_optimus=NVIDIA_only
GBM_BACKEND=nvidia-drm
```

**2. Chromium/Chrome Flags configuration**

Create the corresponding flags file:

- Chrome Stable: `~/.config/chrome-flags.conf`
- Chromium: `~/.config/chromium-flags.conf`
- Edge Beta: `~/.config/microsoft-edge-beta-flags.conf`

Contents:

```bash
# Vulkan video acceleration (NVIDIA hardware acceleration)
--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE
--enable-unsafe-webgpu
--ozone-platform=x11
```

> **Note**: If you see `'--ozone-platform=wayland' is not compatible with Vulkan`, use `--ozone-platform=x11` instead.

**3. Apply**

Re-login to apply.

> **Verify**: Visit `chrome://gpu/` or `edge://gpu/`, check if **Vulkan** shows `Enabled`.

</details>

### 12.4 Audio and Bluetooth [Optional]

<div>

> **Reference**: [PipeWire](https://wiki.gentoo.org/wiki/PipeWire) · [Bluetooth](https://wiki.gentoo.org/wiki/Bluetooth)

</div>

```bash
# Install PipeWire audio system and WirePlumber session manager
emerge --ask media-video/pipewire media-video/wireplumber
# Install Bluetooth stack, tools, and GUI manager (Blueman)
emerge --ask net-wireless/bluez net-wireless/bluez-tools net-wireless/blueman
```

**Enable services (OpenRC)**

```bash
rc-update add bluetooth default
/etc/init.d/bluetooth start
```

**Enable services (systemd)**

```bash
# Enable Bluetooth (system level):
sudo systemctl enable --now bluetooth
# Enable PipeWire core and PulseAudio compatibility layer
systemctl --user enable --now pipewire pipewire-pulse
# Enable WirePlumber session manager
systemctl --user enable --now wireplumber
```

### 12.5 Desktop Environment and Display Manager [Optional]

#### KDE Plasma (Wayland)

<div>

> **Reference**: [KDE](https://wiki.gentoo.org/wiki/KDE)

</div>

```bash
# Add Wayland support
echo "kde-plasma/plasma-meta wayland" >> /etc/portage/package.use/plasma
# Install Plasma desktop
emerge --ask kde-plasma/plasma-meta
# (Optional) Install full KDE applications
emerge --ask kde-apps/kde-apps-meta
# Install SDDM display manager
emerge --ask x11-misc/sddm
```

<details>
<summary>OpenRC configuration</summary>

```bash
# Install generic display manager init script
emerge --ask gui-libs/display-manager-init
# Configure SDDM
sed -i 's/^DISPLAYMANAGER=.*/DISPLAYMANAGER="sddm"/' /etc/conf.d/display-manager
sed -i 's/^CHECKVT=.*/CHECKVT=7/' /etc/conf.d/display-manager
# Enable SDDM
rc-update add display-manager default
rc-service display-manager start
```
</details>

<details>
<summary>systemd configuration</summary>

```bash
systemctl enable sddm
systemctl start sddm
```
</details>

#### GNOME

<div>

> **Reference**: [GNOME](https://wiki.gentoo.org/wiki/GNOME)

</div>

```bash
emerge --ask gnome-base/gnome # Install GNOME core
emerge --ask gnome-base/gdm # Install GDM display manager
rc-update add gdm default # OpenRC
systemctl enable gdm # Enable GDM (systemd)
```

#### Hyprland (Wayland Dynamic Tiling Window Manager)

<div>

> **Reference**: [Hyprland](https://wiki.gentoo.org/wiki/Hyprland)

</div>

```bash
emerge --ask gui-wm/hyprland
```

<div>

Hyprland requires newer graphics driver support. It is recommended to read the Wiki for detailed configuration.

</div>

#### Other Options

For a lightweight desktop:

- **Xfce**: `emerge --ask xfce-base/xfce4-meta` ([Wiki](https://wiki.gentoo.org/wiki/Xfce))
- **LXQt**: `emerge --ask lxqt-base/lxqt-meta` ([Wiki](https://wiki.gentoo.org/wiki/LXQt))
- **Budgie**: `emerge --ask gnome-extra/budgie-desktop` ([Wiki](https://wiki.gentoo.org/wiki/Budgie))

<div>

**More options**

See [Desktop environment](https://wiki.gentoo.org/wiki/Desktop_environment) for other desktop environments.

</div>

### 12.6 Localization and Fonts [Optional]

<div>

> **Reference**: [Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide) · [Fonts](https://wiki.gentoo.org/wiki/Fonts)

</div>

Install fonts for your languages of choice:

```bash
# Noto CJK (Chinese/Japanese/Korean)
emerge --ask media-fonts/noto-cjk
# Emoji fonts
emerge --ask media-fonts/noto-emoji
# WenQuanYi (Chinese)
emerge --ask media-fonts/wqy-microhei
# Noto fonts (covers many languages including Arabic, Hebrew, Cyrillic, Indian scripts, Thai)
emerge --ask media-fonts/noto
# Coding fonts
emerge --ask media-fonts/jetbrains-mono
# DejaVu (widely used for Hebrew, Arabic, Cyrillic)
emerge --ask media-fonts/dejavu
```

Refresh font cache:

```bash
fc-cache -fv
```

### 12.7 Input Method Configuration (Fcitx5 & Rime) [Optional]

<div>

> **Reference**: [Fcitx5](https://wiki.gentoo.org/wiki/Fcitx5) · [IBus](https://wiki.gentoo.org/wiki/IBus)

</div>

Rime is a powerful universal input engine supporting Chinese, Japanese, Korean, Vietnamese, and many more languages through installable schemas. For the best Wayland experience, configure environment variables as shown below.

**Option A: Fcitx5 + Rime (Recommended for KDE/General)**

Suitable for KDE Plasma, Hyprland, and similar environments.

1. **Install**

   ```bash
   emerge --ask app-i18n/fcitx app-i18n/fcitx-rime app-i18n/fcitx-configtool
   ```

2. **Configure environment variables (Wayland)**

<div>

> **Reference**: [Using Fcitx 5 on Wayland](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland)

</div>

   Edit `/etc/environment`:
   ```bash
   vim /etc/environment
   ```
   Add:
   ```conf
   # Force XWayland apps to use Fcitx5
   XMODIFIERS=@im=fcitx
   # (Optional) for non-KDE environments or specific apps
   GTK_IM_MODULE=fcitx
   QT_IM_MODULE=fcitx
   ```

<div>

**KDE Users Tip**

In KDE Plasma 5.27+, it's recommended to select Fcitx 5 directly in "System Settings" → "Keyboard" → "Virtual Keyboard", rather than manually setting the above env vars (except `XMODIFIERS`).

</div>

3. **Startup**

   - KDE/GNOME usually auto-starts Fcitx5.
   - Hyprland/Sway: add `exec-once = fcitx5 -d` to your config file.

**Option B: IBus + Rime (Recommended for GNOME)**

<div>

> **Reference**: [IBus](https://wiki.gentoo.org/wiki/IBus)

</div>

GNOME integrates best with IBus. Use this if you're on GNOME.

1. **Install**

   ```bash
   emerge --ask app-i18n/ibus-rime
   ```

2. **Enable**

   Go to GNOME Settings → Keyboard → Add Input Source → Other → search for "Rime" (may appear as "Chinese (Rime)" in the selector, but supports all languages via schemas).

<div>

**Rime Configuration Tips**

*   **Switch scheme**: Press `F4`.
*   **Supported languages and schemes**: Chinese (Pinyin, Bopomofo, Cangjie), Japanese (Hiragana), Vietnamese, Cantonese, and many more — installable via the [Rime schema repository](https://github.com/rime/brise).
*   **User config directory**: `~/.local/share/fcitx5/rime` (Fcitx5) or `~/.config/ibus/rime` (IBus).

</div>

### 12.8 Secure Boot [Optional]

<div>

> **Reference**: [Secure Boot](https://wiki.gentoo.org/wiki/Secure_Boot)

</div>

If you need Secure Boot, Gentoo recommends using `sbctl` to simplify the process.

1. **Install sbctl**:
    ```bash
    emerge --ask app-crypt/sbctl
    ```
2. **Enter BIOS settings**: Reboot into BIOS, set Secure Boot mode to "Setup Mode" (clears existing keys) and enable Secure Boot.
3. **Create and enroll keys**:
    After booting:
    ```bash
    sbctl create-keys
    sbctl enroll-keys -m # -m includes Microsoft keys (recommended, otherwise may fail to boot Windows or some firmware)
    ```
4. **Sign kernel and bootloader**:
    ```bash
    # Auto-find and sign all known files (kernel, systemd-boot, etc.)
    sbctl sign-all
    # Or manually sign (e.g., GRUB):
    # sbctl sign -s /efi/EFI/Gentoo/grubx64.efi
    ```
5. **Verify**:
    ```bash
    sbctl verify
    ```

---

### 12.9 Portage Git Sync & Overlay [Optional]

<div>

**Why is this step needed?**

The default rsync sync is slow. Git sync is faster and easier to manage.

</div>

**1. Install Git**

```bash
emerge --ask dev-vcs/git
```

**2. Configure Git Sync**

```bash
mkdir -p /etc/portage/repos.conf
cp /usr/share/portage/config/repos.conf /etc/portage/repos.conf/gentoo.conf
```

Edit `/etc/portage/repos.conf/gentoo.conf`:

```ini
[DEFAULT]
main-repo = gentoo
[gentoo]
location = /var/db/repos/gentoo
sync-type = git
sync-uri = https://github.com/gentoo-mirror/gentoo.git
auto-sync = yes
```

**3. Run Sync**

```bash
emerge --sync
```

---

### 12.10 Flatpak Support [Optional]

<div>

> **Reference**: [Flatpak](https://wiki.gentoo.org/wiki/Flatpak)

</div>

If you need Flatpak or want a software center with Flatpak support:

1. **Install Flatpak**

   ```bash
   emerge --ask sys-apps/flatpak
   ```

2. **Enable software center support**

   **GNOME users**:
   Add to `/etc/portage/package.use/gnome`:
   ```conf
   gnome-extra/gnome-software flatpak
   ```

   **KDE users**:
   Add to `/etc/portage/package.use/kde`:
   ```conf
   kde-plasma/discover flatpak
   ```

3. **Update software center**

   ```bash
   # GNOME
   emerge --ask --newuse gnome-extra/gnome-software
   # KDE
   emerge --ask --newuse kde-plasma/discover
   ```

<div>

**Usage Tips**

Flatpak is great for installing proprietary software and sandboxed applications. Add the Flathub remote:

```bash
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak search <app-name>
flatpak install <app-id>
```

</div>

---

### 12.11 System Maintenance (SSD TRIM & Power Management) [Optional]

**1. SSD TRIM (Extends SSD Lifespan)**

<div>

> **Reference**: [SSD](https://wiki.gentoo.org/wiki/SSD)

</div>

Running TRIM regularly maintains SSD performance.

<div>

**Check support**

Run `lsblk --discard`. If the DISC-GRAN column is non-zero, TRIM is supported.

</div>

- **systemd users**:

  ```bash
  systemctl enable --now fstrim.timer
  ```
- **OpenRC users**:

  Run `fstrim -av` weekly manually, or configure a cron job.

**2. Power Management (Recommended for laptops)**

<div>

> **Reference**: [Power management/Guide](https://wiki.gentoo.org/wiki/Power_management/Guide)

</div>

Choose **one** of the following (do not install both):

**Option A: TLP (Recommended, best battery savings)**

Automatically optimizes battery life, suitable for most users.

```bash
emerge --ask sys-power/tlp
# OpenRC
rc-update add tlp default
/etc/init.d/tlp start
# systemd
systemctl enable --now tlp
```

<div>

**Configuration Tip**

TLP's default configuration is already excellent. For fine-tuning, the config file is at `/etc/tlp.conf`. Run `tlp start` after modifying.

</div>

**Option B: power-profiles-daemon (Desktop integration)**

For GNOME/KDE users, switch between "Performance/Balanced/Power Saver" modes from the system menu.

```bash
emerge --ask sys-power/power-profiles-daemon
# OpenRC
rc-update add power-profiles-daemon default
/etc/init.d/power-profiles-daemon start
# systemd
systemctl enable --now power-profiles-daemon
```

**3. Zram (Memory Compression)**

<div>

**Recommended**

Zram creates a compressed memory swap partition, effectively preventing out-of-memory (OOM) errors when compiling large software.

</div>

**OpenRC users**:

```bash
emerge --ask sys-block/zram-init
rc-update add zram-init default
```
*Configuration at `/etc/conf.d/zram-init`*

**systemd users**:
Use `zram-generator`:

```bash
emerge --ask sys-apps/zram-generator
# Create default config (auto uses 50% of memory as swap)
echo '[zram0]' > /etc/systemd/zram-generator.conf
systemctl daemon-reload
systemctl start dev-zram0.swap
```

---

<div>

**Next step**: [Advanced Optimization](/posts/2025-11-25-gentoo-install-advanced/)

</div>
