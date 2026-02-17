---
title: "Gentoo Linux on Apple Silicon Mac (M1/M2 MacBook Guide)"
date: 2025-10-02
categories: ["tutorial"]
authors: ["zakkaus"]
summary: "Complete guide to installing Gentoo Linux on Apple Silicon Mac (M1/M2), covering Asahi Linux bootloader, GPU drivers, desktop environment configuration. Note: M3/M4/M5 not yet supported."
description: "The latest 2025 Gentoo Linux installation guide for Apple Silicon Mac (M1/M2), based on Asahi Linux project, covering Live USB creation, partitioning, kernel installation and desktop environment configuration. M3/M4/M5 chips not yet supported."
---
![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

**Introduction**

This guide will walk you through installing native ARM64 Gentoo Linux on your Apple Silicon Mac (**M1/M2 series**).

**⚠️ Important: Hardware Compatibility**

**Supported Devices**: M1 and M2 series MacBooks (Pro, Air, Mac Mini, etc.)

**Not Currently Supported**: M3, M4, M5 series chips are not yet supported. Please wait for Asahi Linux project updates.

**Important Update**: The excellent work of the Asahi Linux project team (especially [chadmed](https://github.com/chadmed/gentoo-asahi-releng)) has made an [official Gentoo Asahi installation guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide) available. The installation process has been greatly simplified.

**This Guide Features**:

- Based on official latest process (2025.10)
- Uses official Gentoo Asahi Live USB (no Fedora intermediate)
- Clearly marks optional vs required steps
- Simplified for everyone (includes encryption options)

**Last Verified**: November 20, 2025.

**Target Platform**: Apple Silicon Mac (**M1/M2 series**) ARM64 architecture. This guide uses the Asahi Linux bootloader for initial setup, then transitions to a full Gentoo environment.

---

## Installation Overview (Simplified)

**Required Steps**:
1. Download official Gentoo Asahi Live USB image
2. Set up U-Boot environment via Asahi installer
3. Boot from Live USB
4. Partition disk and mount filesystems
5. Extract Stage3 and enter chroot
6. Install Asahi support packages (automated script)
7. Reboot to complete installation

**Optional Steps**:
- LUKS encryption (recommended but not required)
- Custom kernel configuration (default dist-kernel is fine)
- Audio setup (PipeWire, as needed)
- Desktop environment choice

The entire process will create a dual-boot environment on your Mac: macOS + Gentoo Linux ARM64.

**Official Simplification**

Now you can use the [asahi-gentoosupport automated script](https://github.com/chadmed/asahi-gentoosupport) to complete most configurations!

---

## Prerequisites and Important Notes

## Hardware Requirements

- Apple Silicon Mac (**M1/M2 series chips only, M3/M4/M5 not supported**)
- At least 80 GB available disk space (120 GB+ recommended)
- Stable network connection (Wi-Fi or Ethernet)
- Backup all important data

## Important Warnings

**This guide contains advanced operations**:

- Will modify your partition table
- Requires coexistence with macOS
- Involves encrypted disk operations
- Apple Silicon Linux support is still under active development

**Known Working**:

- CPU, memory, storage
- Wi-Fi (via Asahi Linux firmware)
- Keyboard, trackpad, battery management

**Not Yet Working / Experimental**:

- GPU acceleration (M1: basic, M2: limited)
- Thunderbolt (experimental)
- Some specialized hardware

> **Important**: This guide assumes you have basic Linux knowledge. If you encounter issues, refer to the [official Gentoo Asahi Wiki](https://wiki.gentoo.org/wiki/Project:Asahi/Guide).

---

## 1. Download Live USB Image

### 1.1 Get Gentoo Asahi Live Image

Download from the official Gentoo Asahi project:

```bash
# Download the latest image
wget https://github.com/gentoo-asahi/gentoo-distro/releases/latest/download/gentoo-asahi-m1.tar.gz
```

> **Note**: Check the [releases page](https://github.com/gentoo-asahi/gentoo-distro/releases) for the latest version.

### 1.2 Create Bootable USB

```bash
# Find your USB device
sudo fdisk -l

# Assuming USB is /dev/disk2
sudo diskutil eraseDisk USB FAT32 MBR /dev/disk2
sudo mount -t msdos /dev/disk2s1 /Volumes/USB

# Extract to USB
sudo tar -xzf gentoo-asahi-m1.tar.gz -C /Volumes/USB --strip-components=1
```

---

## 2. Boot and Initial Setup

### 2.1 Enter Recovery Mode

1. Shut down your Mac
2. Press and hold the power button until "Loading startup options" appears
3. Select "Options" → Continue

### 2.2 Run Asahi Installer

From macOS Terminal:

```bash
# Run Asahi installer (this sets up U-Boot)
# Follow the on-screen instructions
curl -L https://raw.githubusercontent.com/AsahiLinux/asahi-installer/main/install.sh | sh
```

> **Note**: This only sets up the bootloader. We'll install Gentoo manually.

### 2.3 Boot into Live USB

After the installer finishes:
1. Select "Linux" from the boot menu
2. Choose the Gentoo Live USB

---

## 3. Partition and Setup

### 3.1 Partition the Disk

```bash
# Check current partitions
lsblk

# Use parted or gdisk
gdisk /dev/nvme0n1
```

**Recommended Partition Scheme**:

| Partition | Size | Type | Notes |
|-----------|------|------|-------|
| /dev/nvme0n1p1 | 512M | EFI | Existing macOS EFI |
| /dev/nvme0n1p2 | 16G | Apple APFS | macOS |
| /dev/nvme0n1p3 | +30G | Linux filesystem | Gentoo Root |
| /dev/nvme0n1p4 | +2G | Linux swap | Swap (optional) |

### 3.2 Create Filesystems

```bash
# Root partition (ext4)
mkfs.ext4 /dev/nvme0n1p3

# Or btrfs
mkfs.btrfs -L gentoo /dev/nvme0n1p3

# Swap (if using)
mkswap /dev/nvme0n1p4
swapon /dev/nvme0n1p4
```

### 3.3 Mount Partitions

```bash
mount /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/boot/efi
mount /dev/nvme0n1p1 /mnt/gentoo/boot/efi
```

---

## 4. Install Gentoo

### 4.1 Download Stage3

```bash
cd /mnt/gentoo

# Download ARM64 Stage3
wget https://distfiles.gentoo.org/releases/arm64/autobuilds/$(wget -qO- https://distfiles.gentoo.org/releases/arm64/autobuilds/ | grep -oP 'stage3-arm64-[0-9]{8}T[0-9]{6}Z\.tar\.xz' | head -1)
```

### 4.2 Extract Stage3

```bash
tar xpf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 4.3 Configure make.conf

```bash
cat >> /mnt/gentoo/etc/portage/make.conf << EOF
COMMON_FLAGS="-march=native -O2 -pipe"
MAKEOPTS="-j$(nproc)"
EMERGE_DEFAULT_OPTS="--jobs=4 --load-average=8"
EOF
```

### 4.4 Ch```bash
#root

 Copy DNS
cp -L /etc/resolv.conf /mnt/gentoo/etc/

# Mount
mount --types proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev

# Chroot
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

### 4.5 Initialize Portage

```bash
emerge --sync

# Choose profile
eselect profile list
eselect profile set default/linux/arm64/23.0/desktop
```

---

## 5. Install Asahi Support

### 5.1 Install asahi-gentoosupport

<div>

**Reference**: [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)

</div>

This script automates most of the Asahi-specific configuration:

```bash
# Clone and run the support script
git clone https://github.com/chadmed/asahi-gentoosupport.git
cd asahi-gentoosupport
./install.sh
```

This will:
- Install Asahi-specific kernel packages
- Configure bootloader
- Set up necessary firmware
- Configure udev rules

### 5.2 Install Kernel

```bash
# Install Asahi kernel
emerge --ask sys-kernel/asahi-kernel

# Or use dist-kernel
emerge --ask sys-kernel/gentoo-kernel
```

### 5.3 Configure Bootloader

```bash
# Install U-Boot
emerge --ask sys-boot/u-boot

# Configure
bootctl install
```

---

## 6. Configure System

### 6.1 Basic Configuration

```bash
# Set timezone
ln -sf /usr/share/zoneinfo/America/Los_Angeles /etc/localtime
hwclock --systohc

# Set locale
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
eselect locale set en_US.utf8
```

### 6.2 Network

```bash
# Install network manager
emerge --ask net-misc/NetworkManager
systemctl enable NetworkManager

# Or for OpenRC
rc-update add NetworkManager default
```

### 6.3 Create User

```bash
useradd -m -G wheel,audio,video yourname
passwd yourname
```

### 6.4 Configure sudo

```bash
emerge --ask app-admin/sudo
visudo
# Add: yourname ALL=(ALL) ALL
```

---

## 7. Desktop Environment

### 7.1 Install Desktop

```bash
# Minimal KDE
emerge --ask kde-plasma/plasma-desktop

# Or GNOME
emerge --ask gnome-base/gnome-shell

# Display manager
emerge --ask x11-misc/sddm
systemctl enable sddm
```

### 7.2 Install Graphics Drivers

The Asahi kernel includes necessary GPU drivers:

```bash
# Install Mesa (usually included with Asahi kernel)
emerge --ask media-libs/mesa

# For more info:
# https://wiki.gentoo.org/wiki/Project:Asahi
```

### 7.3 Audio

```bash
# Install PipeWire
emerge --ask media-video/pipewire
emerge --ask media-libs/libpulse
```

---

## 8. Reboot

### 8.1 Exit chroot

```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
```

### 8.2 Reboot

```bash
reboot
```

### 8.3 Select Gentoo from Boot Menu

After rebooting, hold the power button to access the boot menu, then select Gentoo.

---

## Known Issues

### GPU Acceleration

- **M1**: Basic acceleration works via Panfrost
- **M2**: Limited support, still in development
- For full GPU support, you may need to wait for upstream improvements

### Sleep/Hibernate

- May not work reliably
- Test before depending on it

### Thunderbolt

- Experimental
- Some devices may not work

## Troubleshooting

### No Boot Entry

```bash
# Check boot entries
efibootmgr -v

# Create new entry
efibootmgr -c -L "Gentoo" -l "\EFI\gentoo\vmlinuz"
```

### Network Issues

```bash
# Check Wi-Fi
ip link
iw dev wlan0 scan | grep SSID

# Connect
nmcli device wifi connect "SSID" password "PASSWORD"
```

### Sound Issues

```bash
# Install alsa-utils
emerge --ask media-sound/alsa-utils

# Check sound cards
aplay -l
```

---

## What's Next?

- Explore your new Gentoo ARM64 system!
- Install additional software with Portage
- Join the Asahi Linux community for updates
- Consider contributing to the project

---

## References

- [Gentoo Asahi Wiki](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [Asahi Linux Official](https://asahilinux.org/)
- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
- [Gentoo ARM64 Handbook](https://wiki.gentoo.org/wiki/Handbook:ARM64)

---

> **Footnote**: This guide is based on the Asahi Linux project and Gentoo ARM64 port. Thank you to all the developers who make this possible!
