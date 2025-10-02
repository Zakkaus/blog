---
slug: gentoo-m-series-mac-arm64
title: "Gentoo ARM64 Installation Guide: Apple Silicon (M-Series) Mac"
date: 2025-10-02
tags: ["Gentoo","Linux","ARM64","Apple Silicon","M1","M2","M3","Asahi Linux"]
categories: ["Linux Notes"]
draft: false
description: "Complete guide to installing Gentoo Linux ARM64 on Apple Silicon Macs (M1/M2/M3): Native ARM64 Linux via Asahi Linux bootloader."
ShowToc: false
TocOpen: false
translationKey: "gentoo-m-series-mac-arm64"
authors:
   - "Zakk"
seo:
   description: "Complete Gentoo Linux ARM64 installation guide for Apple Silicon Macs (M1/M2/M3/M4), covering Asahi Linux bootstrap, LUKS encryption, Stage3 extraction, kernel compilation, and desktop environment setup."
   keywords:
      - "Gentoo ARM64"
      - "Apple Silicon"
      - "M1 Mac Gentoo"
      - "M2 Mac Linux"
      - "M3 Mac install"
      - "Asahi Linux"
      - "ARM64 Linux"
      - "Zakk blog"
---

{{< lead >}}
This guide walks you through installing native ARM64 Gentoo Linux on Apple Silicon Macs (M1/M2/M3/M4).

**Important Update**: Thanks to excellent work by the Asahi Linux team (especially [chadmed](https://wiki.gentoo.org/index.php?title=User:Chadmed&action=edit&redlink=1)), there is now an [official Gentoo Asahi installation guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide) with a significantly streamlined process. This guide references the original [Jared's M1 Mac Guide](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac) and integrates latest best practices.

Validated as of October 2025. Covers full LUKS-encrypted root partition with systemd setup.
{{< /lead >}}

> **Target Platform**: Apple Silicon Mac (M1/M2/M3/M4) ARM64 architecture. This guide uses the Asahi Linux bootloader for initial setup, then transitions to a full Gentoo environment.

---

## Installation Workflow Overview

1. Prepare system via Asahi Linux installer
2. Complete Asahi Linux (Fedora) basic configuration
3. Create Gentoo "liveusb" environment (initramfs)
4. Set up encrypted filesystem and partitions
5. Extract Stage3 and enter chroot
6. Configure Portage and apply Asahi overlay
7. Build ARM64 kernel and initramfs
8. Configure desktop environment and ongoing maintenance

This process creates a dual-boot setup on your Mac: macOS + Gentoo Linux ARM64.

---

## Prerequisites and Important Notes {#prerequisites}

### Hardware Requirements

- Apple Silicon Mac (M1/M2/M3/M4 series chips)
- At least 80 GB of available disk space (120 GB+ recommended)
- Stable internet connection (Wi-Fi or Ethernet)
- Backup of all important data

### Important Warnings

⚠️ **This guide involves advanced operations**:
- Modifies your partition table
- Requires coexistence with macOS
- Involves encrypted disk operations
- Apple Silicon Linux support is under active development

✅ **Known Working Features**:
- CPU, Memory, Storage
- Wi-Fi (via Asahi Linux firmware)
- Keyboard, Trackpad, Battery management
- Display output (built-in screen and external monitors)
- USB-C / Thunderbolt

⚠️ **Known Limitations**:
- Touch ID unavailable
- Limited macOS virtualization features
- Some newer hardware features may not be fully supported
- GPU acceleration still in development (partial OpenGL support)

---

## 0. Prepare Asahi Linux Boot Environment {#step-0-asahi}

### 0.1 Run Asahi Linux Installer

In macOS Terminal, execute:

```bash
curl https://alx.sh | EXPERT=1 sh
```

> ⚠️ **Security Tip**: Visit <https://alx.sh> first to review the script contents before execution.

### 0.2 Follow Installer Prompts

The installer will guide you through:

1. **Choose Partition Space**: Decide how much space to allocate to Linux (recommend at least 120 GB)
   - Type `r` to resize existing partition
   - Can use percentages (like `50%`) or absolute size (like `120GB`)

2. **Select Operating System**: Choose **Fedora Asahi Remix 39 Minimal** (Option 4)
   ```
   » OS: 4
   ```

3. **Set Name**: Enter `Gentoo` as the operating system name
   ```
   » OS name (Fedora Linux Minimal): Gentoo
   ```

4. **Complete Installation**: **Don't press Enter to shutdown immediately!** Read the "Finishing Installation" steps below first.

---

## 1. Complete Asahi Linux Installation and Boot {#step-1-boot}

### 1.1 Critical Reboot Steps

When the installer shows "Press enter to shut down the system":

**Don't press Enter yet!** Follow these steps:

1. **Wait 15 seconds** to ensure system fully shuts down
2. **Press and hold the power button** until you see "Entering startup options" or a spinner
3. **Release the power button**
4. Wait for volume list to appear, select **Gentoo**
5. You'll see a screen similar to macOS Recovery:
   - If asked to "Select a volume to recover", choose your macOS volume
   - Enter your macOS user password (FileVault user)
6. Follow on-screen instructions to complete setup

### 1.2 Configure Fedora Minimal System

The system will ask you to set basic configuration:

```
1) [ ] Language Options           2) [x] Time Settings
3) [x] Network Configuration      4) [!] Root password
5) [!] User Creation
```

**Set root password** (required):
```
Please make a selection: 4
Password: <enter password>
Password (confirm): <enter again>
```

Then type `q` and confirm `yes` to quit (no need to create user, will do so later in Gentoo).

### 1.3 Connect to Network

After logging in as root, connect to Wi-Fi:

```bash
nmcli device wifi connect <SSID> password <password>
ping -c 3 www.gentoo.org
```

### 1.4 Update System

```bash
dnf upgrade --refresh
```

Reboot after completion:
```bash
reboot
```

---

## 2. Create Gentoo "liveusb" Environment {#step-2-liveusb}

### 2.1 Install Required Tools

```bash
dnf install git wget
```

### 2.2 Get asahi-gentoosupport

```bash
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
```

### 2.3 Download Gentoo ARM64 Minimal ISO

Use helper script (recommend reviewing first):

```bash
curl -L https://raw.githubusercontent.com/jaredallard/gentoo-m1-mac/main/fetch-latest-minimal-iso.sh | sh
```

This script will:
- Fetch the latest `install-arm64-minimal-*.iso`
- Verify GPG signature
- Rename file to `install.iso`

### 2.4 Generate initramfs liveusb

```bash
./genstrap.sh
```

The script will:
- Extract ISO contents
- Create initramfs
- Add "Gentoo Live Install environment" option to GRUB

Reboot after completion:
```bash
reboot
```

Select **Gentoo Live Install Environment** from the GRUB menu.

---

## 3. Configure Network (Live Environment) {#step-3-network-live}

### 3.1 Connect to Wi-Fi

In the Gentoo live environment, use `net-setup`:

```bash
net-setup
```

Follow interactive prompts to configure network. Verify afterwards:

```bash
ifconfig | grep w -A 2 | grep "inet "
ping -c 3 www.gentoo.org
```

> 💡 **Tip**: If Wi-Fi is unstable, it may be a WPA3 compatibility issue. Try connecting to WPA2 or 2.4 GHz network.

### 3.2 (Optional) Enable SSH for Remote Access

```bash
passwd                     # Set root password
/etc/init.d/sshd start
ip a | grep inet          # Get IP address
```

Connect from another computer:
```bash
ssh root@<IP>
```

---

## 4. Prepare Encrypted Filesystem {#step-4-filesystem}

### 4.1 Identify Partitions

```bash
blkid --label fedora          # asahi-root partition (future /)
blkid --label "EFI - GENTO"   # EFI partition (/boot)
```

Note the device path for `asahi-root`, e.g., `/dev/nvme0n1p5`.

### 4.2 Create LUKS2 Encrypted Partition

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p5
```

Type `YES` to confirm, then set encryption password.

**Why these parameters?**
- `argon2id`: Resistant to ASIC/GPU brute force
- `aes-xts`: Hardware acceleration support (M1 has AES instruction set)
- `luks2`: Provides better security tools (like `cryptsetup reencrypt`)

### 4.3 Open Encrypted Partition and Format

```bash
cryptsetup luksOpen /dev/nvme0n1p5 luks
mkfs.btrfs --label root /dev/mapper/luks
```

### 4.4 Mount Filesystem

```bash
mkdir -p /mnt/gentoo
mount /dev/mapper/luks /mnt/gentoo
cd /mnt/gentoo
```

---

## 5. Download and Extract Stage3 {#step-5-stage3}

### 5.1 Download ARM64 Stage3

Use helper script:

```bash
curl -L https://raw.githubusercontent.com/jaredallard/gentoo-m1-mac/main/fetch-stage-3.sh | bash
```

Will download `stage3-arm64-desktop-systemd-*.tar.xz` and verify signature.

### 5.2 Extract Stage3

```bash
tar xpvf latest-stage3-arm64-desktop-systemd.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 5.3 Configure Portage repos

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

---

## 6. Enter chroot Environment {#step-6-chroot}

### 6.1 Prepare chroot

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/
mount --types proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --make-rslave /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/dev
mount --bind /run /mnt/gentoo/run
mount --make-slave /mnt/gentoo/run
```

### 6.2 Enter chroot

```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

### 6.3 Mount /boot

```bash
# Use EFI partition number from earlier blkid
mount /dev/nvme0n1p4 /boot
```

---

## 7. Configure Basic System {#step-7-configure}

### 7.1 Configure make.conf

Edit `/etc/portage/make.conf`:

```bash
nano -w /etc/portage/make.conf
```

```conf
CHOST="aarch64-unknown-linux-gnu"

# Optimized for Apple Silicon
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"

LC_MESSAGES=C

# Adjust based on your CPU cores (M1/M2 Pro/Max have more cores)
MAKEOPTS="-j8"

# Mirror (choose one closer to you)
GENTOO_MIRRORS="https://mirror.aarnet.edu.au/pub/gentoo/"

EMERGE_DEFAULT_OPTS="--jobs 3 --quiet-build"

# Use Asahi Mesa
VIDEO_CARDS="asahi"

# Keep trailing newline
```

### 7.2 Sync Portage Tree

```bash
emerge-webrsync
emerge --sync
emerge --ask --verbose --oneshot portage
```

### 7.3 Timezone and Locale

```bash
ln -sf /usr/share/zoneinfo/America/New_York /etc/localtime

nano -w /etc/locale.gen
# Uncomment:
# en_US.UTF-8 UTF-8

locale-gen
eselect locale set en_US.utf8
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 7.4 Create User

```bash
useradd -m -G wheel,audio,video,usb,input <username>
passwd <username>
passwd root

emerge --ask app-admin/sudo
visudo  # Uncomment %wheel ALL=(ALL) ALL
```

---

## 8. Install Asahi Kernel and Firmware {#step-8-kernel}

### 8.1 Install Required Tools

```bash
emerge --ask dev-vcs/git
```

### 8.2 Run asahi-gentoosupport Install Script

```bash
cd /
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

This script will:
- Install Asahi overlay
- Mask `media-libs/mesa::gentoo` (use Asahi version)
- Emerge `sys-apps/asahi-meta` (includes kernel and firmware)
- Configure U-Boot and m1n1

### 8.3 Configure dracut for LUKS Support

Create `/etc/dracut.conf.d/luks.conf`:

```bash
mkdir -p /etc/dracut.conf.d
nano -w /etc/dracut.conf.d/luks.conf
```

```ini
# GRUB will override kernel_cmdline
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
install_items+=" /sbin/cryptsetup /bin/grep "
filesystems+=" btrfs "
```

### 8.4 Get Partition UUIDs

```bash
blkid /dev/mapper/luks    # Note btrfs UUID
blkid /dev/nvme0n1p4      # Note boot UUID
```

### 8.5 Configure GRUB

Edit `/etc/default/grub`:

```bash
nano -w /etc/default/grub
```

```conf
GRUB_CMDLINE_LINUX="rd.auto=1 rd.luks.allow-discards"
GRUB_DEVICE_UUID="<btrfs UUID>"
```

Update GRUB configuration:
```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### 8.6 Configure fstab

Edit `/etc/fstab`:

```bash
nano -w /etc/fstab
```

```fstab
UUID=<btrfs UUID>  /      btrfs  rw,defaults  0 1
UUID=<boot UUID>   /boot  vfat   rw,defaults  0 2
```

### 8.7 Build initramfs

```bash
emerge --ask sys-fs/cryptsetup sys-fs/btrfs-progs sys-apps/grep net-misc/networkmanager

# Configure systemd to support cryptsetup
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde
emerge --ask --newuse sys-apps/systemd

# Build initramfs
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

---

## 9. Final Adjustments and Reboot {#step-9-reboot}

### 9.1 Enable NetworkManager

```bash
systemctl enable NetworkManager
```

### 9.2 Exit chroot and Reboot

```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
cryptsetup luksClose luks
reboot
```

### 9.3 First Boot

1. Select Gentoo from U-Boot menu
2. GRUB will load and show decryption prompt
3. Enter your LUKS password
4. System should boot successfully to login prompt

---

## 10. Post-Installation Steps {#step-10-post}

### 10.1 Connect to Network

```bash
nmcli device wifi connect <SSID> password <password>
```

### 10.2 Update System

```bash
emerge --sync
emerge -avuDN @world
emerge --depclean
```

### 10.3 Install Desktop Environment

**GNOME (Wayland native):**
```bash
emerge --ask gnome-base/gnome
systemctl enable gdm
```

**KDE Plasma:**
```bash
emerge --ask kde-plasma/plasma-meta
systemctl enable sddm
```

**Lightweight Options:**
```bash
emerge --ask xfce-base/xfce4-meta
emerge --ask x11-misc/lightdm
systemctl enable lightdm
```

---

## Troubleshooting {#faq}

### Issue: Boot Hangs at "Waiting for root device"

**Cause**: dracut cannot find encrypted partition or UUID is wrong.

**Solution**:
1. Boot to emergency mode
2. Manually unlock:
   ```bash
   cryptsetup luksOpen /dev/nvme0n1p5 luks
   exit
   ```
3. Re-check UUID in `/etc/default/grub`

### Issue: Wi-Fi Firmware Doesn't Load

**Cause**: `/lib/firmware/vendor` directory doesn't exist.

**Solution**:
```bash
mkdir -p /lib/firmware/vendor
reboot
```

### Issue: GPU Acceleration Not Working Properly

**Cause**: Asahi Mesa still in development.

**Solution**:
- Ensure using `VIDEO_CARDS="asahi"`
- Check `eselect mesa list`
- Some 3D acceleration features may not be supported yet

### Issue: Fast Battery Drain

**Cause**: Power management tuning in progress.

**Recommendation**:
```bash
emerge --ask sys-power/tlp
systemctl enable tlp
```

---

## Maintenance and Updates {#maintenance}

### Regular Update Process

```bash
# Update Portage tree
emerge --sync

# Update all packages
emerge -avuDN @world

# Clean unneeded packages
emerge --depclean

# Update configuration files
dispatch-conf

# Rebuild initramfs (if kernel updated)
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
grub-mkconfig -o /boot/grub/grub.cfg
```

### Track Asahi Development

- [Asahi Linux Official Blog](https://asahilinux.org/blog/)
- [Gentoo Asahi Project](https://wiki.gentoo.org/wiki/Project:Asahi)
- [asahi-gentoosupport GitHub](https://github.com/chadmed/asahi-gentoosupport)

---

## References {#reference}

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)
- [Asahi Linux Official Site](https://asahilinux.org/)
- [Gentoo ARM64 Handbook](https://wiki.gentoo.org/wiki/Handbook:ARM64)

Enjoy Gentoo on your Apple Silicon! Feel free to ask questions on Gentoo Forums or `#gentoo` / `#asahi` IRC/Discord channels.
