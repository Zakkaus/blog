---
title: "Gentoo Linux Installation Guide (Desktop Configuration)"
slug: gentoo-install-desktop
translationKey: gentoo-install-desktop
date: 2025-11-30
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

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

### Special Note

This article is Part 2 of the **Gentoo Linux Installation Guide** series: **Desktop Configuration**.

**Series Navigation**:
1. [Base Installation](/posts/gentoo-install/): Installing Gentoo base system from scratch
2. **Desktop Configuration (This Article)**: Graphics drivers, desktop environments, input methods, etc.
3. [Advanced Optimization](/posts/gentoo-install-advanced/): make.conf optimization, LTO, system maintenance

**Previous Step**: [Base Installation](/posts/gentoo-install/)

</div>


## 12. Post-Reboot Configuration {#step-12-post-reboot}

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

Congratulations! You have completed the Gentoo base installation and successfully entered your new system (TTY interface).

The following sections are **configured on demand**. You can selectively configure and install based on your needs (server, desktop office, gaming, etc.).

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Important: Check Profile and Update System**

Before starting configuration, please confirm your Profile settings are correct again and ensure the system is up to date:
```bash
eselect profile list          # List all available Profiles
eselect profile set <number>  # Set selected Profile (e.g., desktop/plasma/systemd)
emerge -avuDN @world          # Update system
```

</div>

Now let's configure the graphical interface and multimedia functions.

### 12.0 Network Check [Required]
After logging in, please ensure your network connection is normal.
- **Wired Network**: Usually connects automatically.
- **Wireless Network**: Use `nmtui` (NetworkManager) or `iwctl` (iwd) to connect to Wi-Fi.

### 12.1 Global Configuration (make.conf) [Required]

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

`/etc/portage/make.conf` is Gentoo's global configuration file. At this stage, we only need to configure graphics cards, input devices, and localization options. Detailed compilation optimization configuration will be introduced in **Section 13.0**.

```bash
vim /etc/portage/make.conf
```

Add or modify the following configurations:
```bash
# Graphics Drivers (select based on hardware)
VIDEO_CARDS="nvidia"        # NVIDIA
# VIDEO_CARDS="amdgpu radeonsi" # AMD
# VIDEO_CARDS="intel i965 iris" # Intel

# Input Devices
INPUT_DEVICES="libinput"

# Localization Settings
L10N="en en-US"
LINGUAS="en en_US"

# Desktop Environment Support
USE="${USE} wayland X pipewire pulseaudio alsa"
```

### 12.2 Apply Configuration and Update System [Required]

Apply new USE flags:
```bash
emerge --ask --newuse --deep @world
```





### 12.3 Graphics Drivers [Required]

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [NVIDIA/nvidia-drivers](https://wiki.gentoo.org/wiki/NVIDIA/nvidia-drivers)

</div>

- **NVIDIA Proprietary Driver**: `emerge --ask x11-drivers/nvidia-drivers`
- **AMD**: Set `VIDEO_CARDS="amdgpu radeonsi"`
- **Intel**: Set `VIDEO_CARDS="intel i965 iris"`

**Configure VAAPI Video Acceleration**

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [VAAPI](https://wiki.gentoo.org/wiki/VAAPI) · [nvidia-vaapi-driver](https://packages.gentoo.org/packages/media-libs/nvidia-vaapi-driver)

</div>

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
<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

`nvidia-vaapi-driver` may have stability issues under Wayland (such as CUDA/OpenGL interop problems).
For details, refer to: [NVIDIA Forums](https://forums.developer.nvidia.com/t/is-cuda-opengl-interop-supported-on-wayland/267052), [Reddit](https://www.reddit.com/r/archlinux/comments/1oeiss0/wayland_nvidia_on_arch/), [GitHub Issue](https://github.com/elFarto/nvidia-vaapi-driver/issues/387).

**NVIDIA users also need to enable DRM KMS in kernel parameters**:
Edit `/etc/default/grub`, add `nvidia_drm.modeset=1` to `GRUB_CMDLINE_LINUX_DEFAULT`.

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

</div>

   **Intel/AMD Users**:
   Usually directly supported after installing graphics drivers.

3. **Verify**:
   Run `vainfo` to check output. Success if no errors and supported Profiles are displayed.

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**About Firefox and Hardware Acceleration**

- System `ffmpeg` mainly provides **software decoding** support for formats like H.264, AAC, HEVC, MP3.
- Firefox (especially `firefox-bin`) comes with its own FFmpeg library and **will not** automatically use system FFmpeg's NVDEC/NVENC for hardware decoding.
- Please visit the `about:support` page to check Firefox's actual hardware acceleration status.

</div>

<details>
<summary><b>NVIDIA Chromium Hardware Acceleration Configuration (Recommended Method) (No VAAPI needed, click to expand)</b></summary>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

The following configuration applies to Chromium, Chrome, Edge, Electron applications (like VSCode).

</div>

**Method 1: Use Flags Configuration File (Recommended)**

This method doesn't require modifying `.desktop` files, and the browser can be correctly recognized as the default browser.

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
# Vulkan Video Acceleration Configuration
# NVIDIA + Wayland Hardware Acceleration Optimization

--enable-features=VulkanVideoDecoder,Vulkan,VulkanFromANGLE,DefaultANGLEVulkan
--ozone-platform=x11
--use-vulkan=native
--enable-zero-copy
--enable-gpu-rasterization
--ignore-gpu-blocklist
--enable-native-gpu-memory-buffers
```

**3. Apply Configuration**
Re-login.

> **Verify**: Visit `chrome://gpu/` or `edge://gpu/`, check if **Vulkan** shows as `Enabled`.

![Chromium GPU Vulkan](chromium-gpu-vulkan.webp)

</details>

### 12.4 Audio and Bluetooth [Optional]

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [PipeWire](https://wiki.gentoo.org/wiki/PipeWire) · [Bluetooth](https://wiki.gentoo.org/wiki/Bluetooth)

</div>

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
# Enable Bluetooth service (system level):
sudo systemctl enable --now bluetooth
# Enable PipeWire core and PulseAudio compatibility layer
systemctl --user enable --now pipewire pipewire-pulse
# Enable WirePlumber session manager
systemctl --user enable --now wireplumber
```

### 12.5 Desktop Environments and Display Managers [Optional]

#### KDE Plasma (Wayland)

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [KDE](https://wiki.gentoo.org/wiki/KDE)

</div>

```bash
echo "kde-plasma/plasma-meta wayland" >> /etc/portage/package.use/plasma
emerge --ask kde-plasma/plasma-meta # Install Plasma Desktop
emerge --ask kde-apps/kde-apps-meta # (Optional) Install full KDE Apps suite
emerge --ask x11-misc/sddm # Install SDDM Display Manager

# OpenRC Configuration (SDDM has no independent init script)
# Reference: https://wiki.gentoo.org/wiki/Display_manager#OpenRC
emerge --ask gui-libs/display-manager-init # Install generic display manager init script

# Edit /etc/conf.d/display-manager
# Set DISPLAYMANAGER="sddm" and CHECKVT=7
sed -i 's/^DISPLAYMANAGER=.*/DISPLAYMANAGER="sddm"/' /etc/conf.d/display-manager
sed -i 's/^CHECKVT=.*/CHECKVT=7/' /etc/conf.d/display-manager

rc-update add display-manager default
rc-service display-manager start  # Start immediately (Optional)

# Systemd Configuration
systemctl enable sddm
systemctl start sddm  # Start immediately (Optional)
```

#### GNOME

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [GNOME](https://wiki.gentoo.org/wiki/GNOME)

</div>

```bash
emerge --ask gnome-base/gnome # Install GNOME core components
emerge --ask gnome-base/gdm # Install GDM Display Manager
rc-update add gdm default # OpenRC
systemctl enable gdm # Enable GDM Display Manager (systemd)
```

#### Hyprland (Wayland Dynamic Tiling Window Manager)

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Hyprland](https://wiki.gentoo.org/wiki/Hyprland)

</div>

```bash
emerge --ask gui-wm/hyprland
```
<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Hyprland requires newer graphics driver support. Recommended to read the Wiki for detailed configuration.

</div>

#### Other Options

If you need a lightweight desktop, consider Xfce or LXQt:

- **Xfce**: `emerge --ask xfce-base/xfce4-meta` ([Wiki](https://wiki.gentoo.org/wiki/Xfce))
- **LXQt**: `emerge --ask lxqt-base/lxqt-meta` ([Wiki](https://wiki.gentoo.org/wiki/LXQt))
- **Budgie**: `emerge --ask gnome-extra/budgie-desktop` ([Wiki](https://wiki.gentoo.org/wiki/Budgie))

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**More Choices**

For other desktop environments, please refer to [Desktop environment](https://wiki.gentoo.org/wiki/Desktop_environment).

</div>

### 12.6 Localization and Fonts [Optional]

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide) · [Fonts](https://wiki.gentoo.org/wiki/Fonts)

</div>

To display Chinese properly, we need to install Chinese fonts.

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

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Fcitx5](https://wiki.gentoo.org/wiki/Fcitx5)

</div>

Rime is a powerful input method engine that supports multiple input schemes such as Hanyu Pinyin (Traditional/Simplified), Bopomofo, Terra Pinyin, etc.

For the best experience under Wayland, we need to configure environment variables.

**Option A: Fcitx5 + Rime (KDE/General Recommendation)**

Suitable for KDE Plasma, Hyprland and other environments.

1. **Install Core Components**
   ```bash
   emerge --ask app-i18n/fcitx app-i18n/fcitx-configtool
   ```

2. **Install Language Engines**
   Choose engines based on your language needs:

   - **Chinese (Rime)**: `emerge --ask app-i18n/fcitx-rime`
   - **Chinese (Pinyin)**: `emerge --ask app-i18n/fcitx-libpinyin`
   - **Japanese (Mozc)**: `emerge --ask app-i18n/fcitx-mozc`
   - **Korean (Hangul)**: `emerge --ask app-i18n/fcitx-hangul`

3. **Configure Environment Variables (Wayland)**

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Using Fcitx 5 on Wayland](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland)

</div>

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

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**KDE User Tip**

In KDE Plasma 5.27+, it's recommended to directly select Fcitx 5 in "System Settings" -> "Keyboard" -> "Virtual Keyboard" instead of manually setting the above environment variables (except `XMODIFIERS`).

</div>

4. **Start**
   - KDE/GNOME usually start automatically.
   - Hyprland/Sway need to add `exec-once = fcitx5 -d` to the configuration file.

**Option B: IBus + Rime (GNOME Recommendation)**

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [IBus](https://wiki.gentoo.org/wiki/IBus)

</div>

GNOME has the best integration with IBus, recommended priority.

1. **Install Core Components**
   ```bash
   emerge --ask app-i18n/ibus
   ```

2. **Install Language Engines**
   Choose engines based on your language needs:

   - **Chinese (Rime)**: `emerge --ask app-i18n/ibus-rime`
   - **Japanese (Anthy)**: `emerge --ask app-i18n/ibus-anthy`
   - **Japanese (Mozc)**: `emerge --ask app-i18n/ibus-mozc`
   - **Korean (Hangul)**: `emerge --ask app-i18n/ibus-hangul`

3. **Enable**
   Go to GNOME Settings -> Keyboard -> Add Input Source -> Select "Chinese (Rime)" or your preferred language input method.

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Rime Configuration Tips**

*   **Switch Scheme**: Press `F4` key.
*   **Supported Schemes**: Hanyu Pinyin (Traditional/Simplified), Bopomofo, Terra Pinyin, etc.
*   **User Configuration Directory**: `~/.local/share/fcitx5/rime` (Fcitx5) or `~/.config/ibus/rime` (IBus).

</div>

### 12.8 Secure Boot [Optional]

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Secure Boot](https://wiki.gentoo.org/wiki/Secure_Boot)

</div>

If you need to enable Secure Boot, Gentoo recommends using `sbctl` to simplify configuration.

1. **Install sbctl**:
    ```bash
    emerge --ask app-crypt/sbctl
    ```
2. **Enter BIOS Settings**: Reboot into BIOS, set Secure Boot mode to "Setup Mode" (clear existing keys) and enable Secure Boot.
3. **Create and Enroll Keys**:
    Execute after entering the system:
    ```bash
    sbctl create-keys
    sbctl enroll-keys -m # -m includes Microsoft keys (Recommended, otherwise may not boot Windows or load some firmware)
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

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Why This Step?**

Default rsync sync is slower. Using Git sync is not only faster but also easier to manage.

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

Available Git mirror sources:
- **GitHub (International)**: `https://github.com/gentoo-mirror/gentoo.git`
- **BFSU (Beijing)**: `https://mirrors.bfsu.edu.cn/git/gentoo-portage.git`
- **Tsinghua University**: `https://mirrors.tuna.tsinghua.edu.cn/git/gentoo-portage.git`

**3. Add Gentoo-zh Overlay**
   Create a `gentoo-zh.conf` file in `/etc/portage/repos.conf/` directory with the following content:
   ```ini
   [gentoo-zh]
   location = /var/db/repos/gentoo-zh
   sync-type = git
   sync-uri = https://github.com/microcai/gentoo-zh.git
   auto-sync = yes
   ```

   **Available gentoo-zh Git mirror sources (Optional)**:
   - **Original Source (GitHub)**: `https://github.com/microcai/gentoo-zh.git`
   - **Chongqing University**: `https://mirrors.cqu.edu.cn/git/gentoo-zh.git`
   - **Nanjing University**: `https://mirror.nju.edu.cn/git/gentoo-zh.git`

   **gentoo-zh distfiles mirror (Optional)**:
   To accelerate downloads of packages in the gentoo-zh overlay, you can use the following distfiles mirrors:
   - **Original Source**: `https://distfiles.gentoocn.org/`
   - **Chongqing University**: `https://mirror.cqu.edu.cn/gentoo-zh`
   - **Nanjing University**: `https://mirror.nju.edu.cn/gentoo-zh`
   
   Usage help: https://t.me/gentoocn/56

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Update (Updated: 2025-10-07)**

According to Gentoo's official announcement, Gentoo has stopped providing cache mirror support for third-party repositories. Starting from 2025-10-30, mirror configurations for all third-party repositories (including gentoo-zh) will be removed from the official repository list.

**What does this mean?**
*   Tools like `eselect repository` and `layman` still work normally.
*   Officials will no longer provide cache mirrors, instead syncing directly from upstream sources (GitHub).
*   Official repositories (`::gentoo`, `::guru`, `::kde`, `::science`) are not affected and can still use mirrors.

**If you have previously added the gentoo-zh overlay, please update the sync URI**:

```bash
# Check installed repositories
eselect repository list -i

# Remove old configuration
eselect repository remove gentoo-zh

# Re-enable (will automatically use the correct upstream source)
eselect repository enable gentoo-zh
```

</div>

**4. Execute Sync**
```bash
emerge --sync
```

**5. Software Installation Demo**

For example, installing `flclash-bin`:

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

After confirming no errors, execute installation:
```bash
emerge --ask flclash-bin
```

---

### 12.10 Flatpak Support and Software Center [Optional]

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Flatpak](https://wiki.gentoo.org/wiki/Flatpak)

</div>

If you need to use Flatpak or want to manage Flatpak applications in the Software Center:

1. **Install Flatpak**
   ```bash
   emerge --ask sys-apps/flatpak
   ```

2. **Enable Software Center Support**
   To let GNOME Software or KDE Discover support Flatpak, enable the corresponding USE flag.

   **GNOME Users**:
   Add to `/etc/portage/package.use/gnome` (or create a new file):
   ```conf
   gnome-extra/gnome-software flatpak
   ```

   **KDE Users**:
   Add to `/etc/portage/package.use/kde` (or create a new file):
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

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Usage Tip**

Flatpak is very suitable for installing proprietary software (like QQ, WeChat). Its sandbox isolation mechanism ensures main system security and cleanliness.

```bash
# Search applications
flatpak search qq
flatpak search wechat

# Install QQ and WeChat
flatpak install com.qq.QQ
flatpak install com.tencent.WeChat
```

</div>

---

### 12.11 System Maintenance (SSD TRIM & Power Management) [Optional]

**1. SSD TRIM (Extend SSD Life)**

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [SSD](https://wiki.gentoo.org/wiki/SSD)

</div>

Regular TRIM execution can maintain SSD performance.

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Check Support**

Run `lsblk --discard`. If the DISC-GRAN column is non-zero, TRIM is supported.

</div>

- **Systemd Users**:
  ```bash
  systemctl enable --now fstrim.timer
  ```
- **OpenRC Users**:
  Recommended to run `fstrim -av` manually every week, or configure a cron task.

**2. Power Management (Recommended for Laptop Users)**

<div style="background: rgba(59, 130, 246, 0.08); padding: 0.75rem 1rem; border-radius: 0.5rem; border-left: 3px solid rgb(59, 130, 246); margin: 1rem 0;">

**Reference**: [Power management/Guide](https://wiki.gentoo.org/wiki/Power_management/Guide)

</div>

Please **choose one of the following** options (do not install both):

**Option A: TLP (Recommended, Extreme Power Saving)**
Automatically optimizes battery life, suitable for most users.

```bash
emerge --ask sys-power/tlp
# OpenRC
rc-update add tlp default
/etc/init.d/tlp start
# Systemd
systemctl enable --now tlp
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Configuration Tip**

TLP's default configuration is excellent enough. For fine-tuning, the configuration file is located at `/etc/tlp.conf`. Run `tlp start` to take effect after modification.

</div>

**Option B: power-profiles-daemon (Desktop Integration)**
Suitable for GNOME/KDE users, can switch "Performance/Balanced/Power Saver" modes directly in the system menu.

```bash
emerge --ask sys-power/power-profiles-daemon
# OpenRC
rc-update add power-profiles-daemon default
/etc/init.d/power-profiles-daemon start
# Systemd
systemctl enable --now power-profiles-daemon
```

**3. Zram (Memory Compression)**

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Recommended**

Zram can create a compressed memory swap partition, effectively preventing Out of Memory (OOM) when compiling large software.

</div>

**OpenRC Users**:
```bash
emerge --ask sys-block/zram-init
rc-update add zram-init default
```
*Configuration located at `/etc/conf.d/zram-init`*

**Systemd Users**:
Recommended to use `zram-generator`:
```bash
emerge --ask sys-apps/zram-generator
# Create default configuration (Automatically use 50% memory as Swap)
echo '[zram0]' > /etc/systemd/zram-generator.conf
systemctl daemon-reload
systemctl start dev-zram0.swap
```

---


<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Next Step**: [Advanced Optimization](/posts/gentoo-install-advanced/)

</div>
