---
title: "Gentoo Linux Installation Guide (Desktop Configuration)"
slug: /posts/gentoo-install-desktop/
translationKey: gentoo-install-desktop
date: 2025-11-25
summary: "Gentoo Linux desktop environment configuration tutorial, covering graphics drivers, KDE/GNOME/Hyprland, input methods, fonts, etc."
description: "2025 Latest Gentoo Linux Installation Guide (Desktop Configuration), covering graphics drivers, KDE/GNOME/Hyprland, input methods, fonts, etc."
article:
  showHero: true
  heroStyle: background
featureImage: feature-gentoo-chan.webp
featureImageAlt: "Gentoo Chan"
keywords:
  - Gentoo Linux
  - KDE Plasma
  - GNOME
  - Hyprland
  - Input Method
  - Fcitx5
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

> **Special Note**
> 
> This article is Part 2 of the **Gentoo Linux Installation Guide**: **Desktop Configuration**.
> 
> **Series Navigation**:
> 1. [Base Installation](/posts/gentoo-install/): Installing Gentoo base system from scratch
> 2. **Desktop Configuration (This Article)**: Graphics drivers, desktop environments, input methods, etc.
> 3. [Advanced Optimization](/posts/gentoo-install-advanced/): make.conf optimization, LTO, system maintenance
>
> **Previous Step**: [Base Installation](/posts/gentoo-install/)


## 12. Post-Reboot Configuration {#step-12-post-reboot}

Congratulations! You have completed the base installation of Gentoo and successfully entered your new system (TTY interface).

The following sections are **configured on demand**. You can selectively configure and install based on your needs (server, desktop office, gaming, etc.).

> **Important: Check Profile and Update System**
> Before starting configuration, please confirm your Profile setting is correct again and ensure the system is up to date:
> ```bash
> eselect profile list          # List all available Profiles
> eselect profile set <number>  # Set selected Profile (e.g., desktop/plasma/systemd)
> emerge -avuDN @world          # Update system
> ```

Now let's configure the graphical interface and multimedia functions.

### 12.0 Network Check [Required]
After logging in, please ensure your network connection is normal.
- **Wired Network**: Usually connects automatically.
- **Wireless Network**: Use `nmtui` (NetworkManager) or `iwctl` (iwd) to connect to Wi-Fi.

### 12.1 Global Configuration (make.conf) [Required]

> **Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

`/etc/portage/make.conf` is Gentoo's global configuration file. At this stage, we only need to configure graphics cards, input devices, and localization options. Detailed compilation optimization configuration will be introduced in **Section 13.0**.

```bash
vim /etc/portage/make.conf
```

Add or modify the following configurations:
```bash
# Graphics Drivers (Select based on hardware)
VIDEO_CARDS="nvidia"        # NVIDIA
# VIDEO_CARDS="amdgpu radeonsi" # AMD
# VIDEO_CARDS="intel i965 iris" # Intel

# Input Devices
INPUT_DEVICES="libinput"

# Localization Settings
L10N="en zh zh-CN zh-TW"
LINGUAS="en zh_CN zh_TW"

# Desktop Environment Support
USE="${USE} wayland X pipewire pulseaudio alsa"
```

### 12.2 Apply Configuration and Update System [Required]

Apply new USE flags:
```bash
emerge --ask --newuse --deep @world
```

### 12.3 Graphics Drivers [Required]

> **Reference**: [NVIDIA/nvidia-drivers](https://wiki.gentoo.org/wiki/NVIDIA/nvidia-drivers)

- **NVIDIA Proprietary Driver**: `emerge --ask x11-drivers/nvidia-drivers`
- **AMD**: Set `VIDEO_CARDS="amdgpu radeonsi"`
- **Intel**: Set `VIDEO_CARDS="intel i965 iris"`

**Configure VAAPI Video Acceleration**
> **Reference**: [VAAPI](https://wiki.gentoo.org/wiki/VAAPI) and [nvidia-vaapi-driver](https://packages.gentoo.org/packages/media-libs/nvidia-vaapi-driver)

1. **Globally Enable VAAPI**:
   Add `vaapi` to `USE` in `/etc/portage/make.conf`.
   ```bash
   # Recompile affected packages
   emerge --ask --changed-use --deep @world
   ```

2. **Install Drivers and Tools**:
   ```bash
   emerge --ask media-video/libva-utils # Install vainfo for verification
   ```

   **Special Steps for NVIDIA Users**:
   ```bash
   emerge --ask media-libs/nvidia-vaapi-driver
   ```
   > **Note**: `nvidia-vaapi-driver` might be unstable under Wayland (e.g., CUDA/OpenGL interop issues).
   > Details: [NVIDIA Forums](https://forums.developer.nvidia.com/t/is-cuda-opengl-interop-supported-on-wayland/267052), [Reddit](https://www.reddit.com/r/archlinux/comments/1oeiss0/wayland_nvidia_on_arch/), [GitHub Issue](https://github.com/elFarto/nvidia-vaapi-driver/issues/387).
   > NVIDIA users also need to enable DRM KMS in kernel parameters:
   > Edit `/etc/default/grub`, add `nvidia_drm.modeset=1` to `GRUB_CMDLINE_LINUX_DEFAULT`.
   ```bash
   grub-mkconfig -o /boot/grub/grub.cfg
   ```

   **Intel/AMD Users**:
   Usually supported directly after installing graphics drivers.

3. **Verify**:
   Run `vainfo` to check output. Success if no errors and supported Profiles are shown.

> **About Firefox and Hardware Acceleration**:
> - System `ffmpeg` mainly provides **software decoding** support for formats like H.264, AAC, HEVC, MP3.
> - Firefox (especially `firefox-bin`) comes with its own FFmpeg library and **will not** automatically use system FFmpeg's NVDEC/NVENC for hardware decoding.
> - Please visit `about:support` page to check Firefox's actual hardware acceleration status.

<details>
<summary><b>NVIDIA Chromium Hardware Acceleration Config (Recommended) (No VAAPI, Click to Expand)</b></summary>

> **Tip**: The following configuration applies to Chromium, Chrome, Edge, Electron apps (like VSCode).

**Method 1: Use Flags Config File (Recommended)**

This method doesn't require modifying `.desktop` files, and the browser can be correctly identified as the default browser.

**1. Environment Variables**
Create `~/.config/environment.d/chromium-nvidia.conf`:
```bash
# NVIDIA Environment Variables
__GLX_VENDOR_LIBRARY_NAME=nvidia
__VK_LAYER_NV_optimus=NVIDIA_only
GBM_BACKEND=nvidia-drm
```

**2. Chromium/Chrome Flags Configuration**
Create corresponding flags file:

- Chrome Stable: `~/.config/chrome-flags.conf`
- Chrome Unstable: `~/.config/chrome-dev-flags.conf`  
- Chromium: `~/.config/chromium-flags.conf`
- Edge Beta: `~/.config/microsoft-edge-beta-flags.conf`
- Edge Dev: `~/.config/microsoft-edge-dev-flags.conf`

Content as follows:
```bash
# Vulkan Video Acceleration Config
# NVIDIA + Wayland Hardware Acceleration Optimization

--enable-features=VulkanVideoDecoder,Vulkan,VulkanFromANGLE,DefaultANGLEVulkan
--ozone-platform=x11
--use-vulkan=native
--enable-zero-copy
--enable-gpu-rasterization
--ignore-gpu-blocklist
--enable-native-gpu-memory-buffers
```

**3. App Configuration**
Re-login.

> **Verify**: Visit `chrome://gpu/` or `edge://gpu/`, check if **Vulkan** shows as `Enabled`.

![Chromium GPU Vulkan](chromium-gpu-vulkan.webp)

</details>

### 12.4 Audio and Bluetooth [Optional]

> **Reference**: [PipeWire](https://wiki.gentoo.org/wiki/PipeWire) and [Bluetooth](https://wiki.gentoo.org/wiki/Bluetooth)

```bash
# Install PipeWire audio system and WirePlumber session manager
emerge --ask media-video/pipewire media-video/wireplumber


# Install Bluetooth stack, tools and manager (Blueman is GUI manager)
emerge --ask net-wireless/bluez net-wireless/bluez-tools net-wireless/blueman
```

**Start Service (OpenRC)**
```bash
rc-update add bluetooth default 
/etc/init.d/bluetooth start
```

**Start Service (Systemd)**
```bash
# Enable Bluetooth service (System level):
sudo systemctl enable --now bluetooth
# Enable PipeWire core and PulseAudio compatibility layer
systemctl --user enable --now pipewire pipewire-pulse
# Enable WirePlumber session manager
systemctl --user enable --now wireplumber
```

### 12.5 Desktop Environments and Display Managers [Optional]

#### KDE Plasma (Wayland)

> **Reference**: [KDE](https://wiki.gentoo.org/wiki/KDE)

```bash
echo "kde-plasma/plasma-meta wayland" >> /etc/portage/package.use/plasma
emerge --ask kde-plasma/plasma-meta # Install Plasma Desktop
emerge --ask kde-apps/kde-apps-meta # (Optional) Install full KDE Apps suite
emerge --ask x11-misc/sddm # Install SDDM Display Manager

# OpenRC Config (SDDM has no independent init script)
# Reference: https://wiki.gentoo.org/wiki/Display_manager#OpenRC
emerge --ask gui-libs/display-manager-init # Install generic display manager init script

# Edit /etc/conf.d/display-manager
# Set DISPLAYMANAGER="sddm" and CHECKVT=7
sed -i 's/^DISPLAYMANAGER=.*/DISPLAYMANAGER="sddm"/' /etc/conf.d/display-manager
sed -i 's/^CHECKVT=.*/CHECKVT=7/' /etc/conf.d/display-manager

rc-update add display-manager default
rc-service display-manager start  # Start immediately (Optional)

# Systemd Config
systemctl enable sddm
systemctl start sddm  # Start immediately (Optional)
```

#### GNOME

> **Reference**: [GNOME](https://wiki.gentoo.org/wiki/GNOME)

```bash
emerge --ask gnome-base/gnome # Install GNOME core components
emerge --ask gnome-base/gdm # Install GDM Display Manager
rc-update add gdm default # OpenRC
systemctl enable gdm # Enable GDM Display Manager (systemd)
```

#### Hyprland (Wayland Dynamic Tiling Window Manager)

> **Reference**: [Hyprland](https://wiki.gentoo.org/wiki/Hyprland)

```bash
emerge --ask gui-wm/hyprland
```
> **Tip**: Hyprland requires newer graphics driver support, recommended to read Wiki for detailed configuration.

#### Other Options

If you need a lightweight desktop, consider Xfce or LXQt:

- **Xfce**: `emerge --ask xfce-base/xfce4-meta` ([Wiki](https://wiki.gentoo.org/wiki/Xfce))
- **LXQt**: `emerge --ask lxqt-base/lxqt-meta` ([Wiki](https://wiki.gentoo.org/wiki/LXQt))
- **Budgie**: `emerge --ask gnome-extra/budgie-desktop` ([Wiki](https://wiki.gentoo.org/wiki/Budgie))

> **More Choices**: For other desktop environments, please refer to [Desktop environment](https://wiki.gentoo.org/wiki/Desktop_environment).

### 12.6 Localization and Fonts [Optional]

> **Reference**: [Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide), [Fonts](https://wiki.gentoo.org/wiki/Fonts)

To display Chinese correctly, we need to install Chinese fonts.

```bash
# Install Noto CJK (Source Han) fonts
emerge --ask media-fonts/noto-cjk

# Install Emoji fonts
emerge --ask media-fonts/noto-emoji

# (Optional) WenQuanYi Micro Hei
emerge --ask media-fonts/wqy-microhei
```

Refresh font cache:
```bash
fc-cache -fv
```

### 12.7 Input Method Configuration (Fcitx5 & Rime) [Optional]

> **Reference**: [Fcitx5](https://wiki.gentoo.org/wiki/Fcitx5)

Rime is a powerful input method engine supporting Luna Pinyin (Simplified/Traditional), Zhuyin, Terra Pinyin, etc.

To get the best experience under Wayland, we need to configure environment variables.

**Option A: Fcitx5 + Rime (KDE/General Recommended)**

Suitable for KDE Plasma, Hyprland, etc.

1. **Install**
   ```bash
   emerge --ask app-i18n/fcitx app-i18n/fcitx-rime app-i18n/fcitx-configtool
   ```

2. **Configure Environment Variables (Wayland)**

   > **Reference**: [Using Fcitx 5 on Wayland](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland)

   Edit `/etc/environment`:
   ```bash
   vim /etc/environment
   ```
   Write:
   ```conf
   # Force XWayland apps to use Fcitx5
   XMODIFIERS=@im=fcitx
   
   # (Optional) For non-KDE environments or specific apps
   GTK_IM_MODULE=fcitx
   QT_IM_MODULE=fcitx
   ```
   > **KDE User Tip**: In KDE Plasma 5.27+, it is recommended to select Fcitx 5 directly in "System Settings" -> "Keyboard" -> "Virtual Keyboard", without manually setting the above environment variables (except `XMODIFIERS`).

3. **Start**
   - KDE/GNOME usually starts automatically.
   - Hyprland/Sway needs `exec-once = fcitx5 -d` in config file.

**Option B: IBus + Rime (GNOME Recommended)**

> **Reference**: [IBus](https://wiki.gentoo.org/wiki/IBus)

GNOME integrates best with IBus, recommended to use it.

1. **Install**
   ```bash
   emerge --ask app-i18n/ibus-rime
   ```

2. **Enable**
   Go to GNOME Settings -> Keyboard -> Add Input Source -> Select "Chinese (Rime)".

**Rime Configuration Tips**
- Switch Schema: Press `F4`.
- **Supported Schemas**: Luna Pinyin (Simplified/Traditional), Zhuyin, Terra Pinyin, etc.
- User Config Directory: `~/.local/share/fcitx5/rime` (Fcitx5) or `~/.config/ibus/rime` (IBus).

### 12.8 Secure Boot [Optional]

> **Reference**: [Secure Boot](https://wiki.gentoo.org/wiki/Secure_Boot)

If you need to enable Secure Boot, Gentoo recommends using `sbctl` to simplify configuration.

1. **Install sbctl**:
    ```bash
    emerge --ask app-crypt/sbctl
    ```
2. **Enter BIOS Settings**: Reboot into BIOS, set Secure Boot mode to "Setup Mode" (clear existing keys) and enable Secure Boot.
3. **Create and Enroll Keys**:
    Execute after entering system:
    ```bash
    sbctl create-keys
    sbctl enroll-keys -m # -m includes Microsoft keys (Recommended, otherwise Windows might not boot or some firmware won't load)
    ```
4. **Sign Kernel and Bootloader**:
    ```bash
    # Automatically find and sign all known files (including kernel, systemd-boot, etc.)
    sbctl sign-all
    
    # Or manually sign (e.g., GRUB)
    # sbctl sign -s /efi/EFI/Gentoo/grubx64.efi
    ```
5. **Verify**:
    ```bash
    sbctl verify
    ```

---

### 12.9 Portage Git Sync & Overlay [Optional]

> **Why this step?**
> Default rsync sync is slower. Using Git sync is not only faster but also easier to manage.

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
sync-type = git
sync-uri = https://github.com/gentoo-mirror/gentoo.git
sync-depth = 1          # Only fetch latest commit, reduce size
```

**3. Add Gentoo-zh Overlay**
   Create `gentoo-zh.conf` in `/etc/portage/repos.conf/` directory:
   ```ini
   [gentoo-zh]
   location = /var/db/repos/gentoo-zh
   sync-type = git
   sync-uri = https://github.com/gentoo-zh/gentoo-zh.git
   auto-sync = yes
   ```

   > **Important Note (Updated: 2025-10-07)**
   >
   > According to Gentoo official announcement, Gentoo has stopped providing cache mirror support for third-party repositories. From 2025-10-30, all third-party repositories (including gentoo-zh) mirror configurations will be removed from the official repository list.
   >
   > **What does this mean?**
   > - Tools like `eselect repository` and `layman` still work.
   > - Official will no longer provide cache mirrors, changing to sync directly from upstream (GitHub).
   > - Official repositories (`::gentoo`, `::guru`, `::kde`, `::science`) are unaffected and can still use mirrors.
   >
   > **If you previously added gentoo-zh overlay, please update sync URI**:
   > ```bash
   > # View installed repositories
   > eselect repository list -i
   >
   > # Remove old config
   > eselect repository remove gentoo-zh
   >
   > # Re-enable (will automatically use correct upstream source)
   > eselect repository enable gentoo-zh
   > ```

**4. Execute Sync**
```bash
emerge --sync
```

**5. Software Installation Demo**

For example installing `flclash-bin`:

```bash
emerge -pv flclash-bin
```

Output example:
```text
These are the packages that would be merged, in order:

Calculating dependencies  
    ... done!
Dependency resolution took 0.45 s (backtrack: 0/20).

[ebuild  N     ] dev-libs/keybinder-0.3.2-r300:3::gentoo  USE="introspection" 371 KiB
[ebuild  N     ] x11-apps/xmessage-1.0.7::gentoo  126 KiB
[ebuild  N     ] net-proxy/flclash-bin-0.8.90::gentoo-zh  39,565 KiB

Total: 3 packages (3 new), Size of downloads: 40,061 KiB
```

Confirm correct, then execute install:
```bash
emerge --ask flclash-bin
```

---

### 12.10 Flatpak Support and Software Center [Optional]

> **Reference**: [Flatpak](https://wiki.gentoo.org/wiki/Flatpak)

If you need to use Flatpak or wish to manage Flatpak apps in Software Center:

1. **Install Flatpak**
   ```bash
   emerge --ask sys-apps/flatpak
   ```

2. **Enable Software Center Support**
   To let GNOME Software or KDE Discover support Flatpak, enable corresponding USE flag.

   **GNOME Users**:
   Add to `/etc/portage/package.use/gnome` (or create new file):
   ```conf
   gnome-extra/gnome-software flatpak
   ```

   **KDE Users**:
   Add to `/etc/portage/package.use/kde` (or create new file):
   ```conf
   kde-plasma/discover flatpak
   ```

3. **Update Software Center**
   ```bash
   # GNOME
   emerge --ask --newuse gnome-extra/gnome-software

   # KDE
   emerge --ask --newuse kde-plasma/discover
   ```

> **Usage Tip**: Flatpak is very suitable for installing proprietary software (like QQ, WeChat). Its sandbox isolation mechanism ensures main system security and cleanliness.
>
> ```bash
> # Search apps
> flatpak search qq
> flatpak search wechat
>
> # Install QQ and WeChat
> flatpak install com.qq.QQ
> flatpak install com.tencent.WeChat
> ```

---

### 12.11 System Maintenance (SSD TRIM & Power Management) [Optional]

**1. SSD TRIM (Extend SSD Life)**

> **Reference**: [SSD](https://wiki.gentoo.org/wiki/SSD)

Regularly executing TRIM can maintain SSD performance.

> **Check Support**: Run `lsblk --discard`. If DISC-GRAN column is non-zero, TRIM is supported.

- **Systemd Users**:
  ```bash
  systemctl enable --now fstrim.timer
  ```
- **OpenRC Users**:
  Recommended to run `fstrim -av` manually every week, or configure cron task.

**2. Power Management (Recommended for Laptop Users)**

> **Reference**: [Power management/Guide](https://wiki.gentoo.org/wiki/Power_management/Guide)

Please choose **one of two** from the following options (do not install both):

**Option A: TLP (Recommended, Extreme Power Saving)**
Automatically optimize battery life, suitable for most users.

```bash
emerge --ask sys-power/tlp
# OpenRC
rc-update add tlp default
/etc/init.d/tlp start
# Systemd
systemctl enable --now tlp
```

> **Config Tip**: TLP default config is excellent enough. For fine-tuning, config file is at `/etc/tlp.conf`. Run `tlp start` to take effect after modification.

**Option B: power-profiles-daemon (Desktop Integration)**
Suitable for GNOME/KDE users, can switch "Performance/Balanced/Power Saver" modes directly in system menu.

```bash
emerge --ask sys-power/power-profiles-daemon
# OpenRC
rc-update add power-profiles-daemon default
/etc/init.d/power-profiles-daemon start
# Systemd
systemctl enable --now power-profiles-daemon
```

**3. Zram (Memory Compression)**

> **Reference**: [Zram](https://wiki.gentoo.org/wiki/Zram)
> **Recommended**: Zram can create compressed memory swap partition, effectively preventing Out of Memory (OOM) when compiling large software.

**OpenRC Users**:
```bash
emerge --ask sys-block/zram-init
rc-update add zram-init default
```
*Config located at `/etc/conf.d/zram-init`*

**Systemd Users**:
Recommended to use `zram-generator`:
```bash
emerge --ask sys-apps/zram-generator
# Create default config (Automatically use 50% memory as Swap)
echo '[zram0]' > /etc/systemd/zram-generator.conf
systemctl daemon-reload
systemctl start dev-zram0.swap
```

---


> **Next Step**: [Advanced Optimization](/posts/gentoo-install-advanced/)

> **Image Credit**: [Pixiv](https://www.pixiv.net/artworks/115453639)
