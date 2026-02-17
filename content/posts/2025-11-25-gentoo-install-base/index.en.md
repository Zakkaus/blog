---
title: "Gentoo Linux Installation Guide (Basic)"
date: 2025-11-25
summary: "Gentoo Linux basic system installation tutorial, covering partitioning, Stage3, kernel compilation, bootloader configuration, and more. Also includes LUKS full-disk encryption."
description: "The latest 2025 Gentoo Linux installation guide (Basic), covering UEFI installation process, kernel compilation, and more. Suitable for advanced Linux users and Gentoo beginners. Also includes LUKS full-disk encryption guide."
keywords:
  - Gentoo Linux
  - Linux Installation
  - Source Compilation
  - systemd
  - OpenRC
  - Portage
  - make.conf
  - Kernel Compilation
  - UEFI Installation
tags:
  - Gentoo
  - Linux
  - Tutorial
  - System Installation
categories:
  - tutorial
authors:
  - zakkaus
---

<div>

### Article Overview

This is Part 1 of the **Gentoo Linux Installation Guide** series: **Basic Installation**.

**Series Navigation**:
1. **Basic Installation (This Article)**: Installing Gentoo base system from scratch
2. [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/): Graphics drivers, desktop environment, input methods
3. [Advanced Optimization](/posts/2025-11-25-gentoo-install-advanced/): make.conf optimization, LTO, system maintenance

**Recommended Reading Path**:
- As needed: Basic Installation (Sections 0-11) → Desktop Configuration (Section 12) → Advanced Optimization (Sections 13-17)

</div>

<div>

### About This Guide

This guide aims to provide a complete Gentoo installation walkthrough while **densely providing reference materials for learning**. The article contains numerous official Wiki links and technical documentation to help readers understand the principles and configuration details behind each step.

**This is not a simple copy-paste tutorial, but a guided learning resource** — the first step in using Gentoo is learning to read the Wiki yourself and solve problems. Make good use of Google or even AI tools to find answers. When you encounter issues or need deeper understanding, please refer to the official handbook and the reference links provided in this article.

If you have questions or find any issues while reading, feel free to reach out through:
- **Gentoo Community**: [Gentoo Forums](https://forums.gentoo.org/) | IRC: #gentoo @ Libera.Chat

**Highly recommend following the official handbook**:
- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [Gentoo Handbook: AMD64 (Simplified Chinese)](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)

<p>✓ Last verified: November 25, 2025</p>

</div>

## What is Gentoo?

Gentoo Linux is a source-based Linux distribution known for its **high customizability** and **performance optimization**. Unlike other distributions, Gentoo lets you compile all software from source, which means:

- **Ultimate Performance**: All software is compiled and optimized for your hardware
- **Full Control**: You decide what your system includes and doesn't include
- **Deep Learning**: Gain deeper understanding of Linux by building the system yourself
- **Compilation Time**: Initial installation takes a long time (expect 3-6 hours)
- **Learning Curve**: Requires some Linux basics

<div>

<div>

**Who is it for?**
- Tech enthusiasts who want to learn Linux deeply
- Users who pursue system performance and customization
- Geeks who enjoy the DIY process

</div>

<div>

**Who is it NOT for?**
- Beginners who just want a quick install (try Ubuntu, Fedora first)
- Users who don't have time to tinker with their system

</div>

</div>

<details>
<summary><b>Core Concepts Overview (Click to Expand)</b></summary>

Before starting the installation, let's understand some core concepts:

**Stage3** ([Wiki](https://wiki.gentoo.org/wiki/Stage_file))
A minimal Gentoo base system tarball. It contains the basic toolchain (compiler, libraries, etc.) needed to build a complete system. You'll extract it to your hard drive as the "foundation" of your new system.

**Portage** ([Wiki](https://wiki.gentoo.org/wiki/Portage))
Gentoo's package manager, similar to apt/dnf/zypper but uses source code compilation by default. It handles software installation, updates, and system building through the `emerge` command.

**USE Flags** ([Wiki](https://wiki.gentoo.org/wiki/USE_flag))
Compile-time options that control which features are included in each package. For example, enabling the `X` flag includes graphical interface support, while `llvm` uses LLVM instead of GCC for compilation.

**Profile** ([Wiki](https://wiki.gentoo.org/wiki/Profile_(Portage)))
A collection of default settings that determine system defaults (such as init system, C library, compiler options). Choosing the right profile is crucial for system stability.

**make.conf** ([Wiki](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage))
The core configuration file for compiling Gentoo packages, equivalent to Gentoo's "compiler settings." It defines compilation options, parallel jobs, and optimization parameters.

</details>

## 0. Preparation

### 0.1 Download Installation Media

**Recommended**: Use the official Gentoo LiveGUI USB Image from the [downloads page](https://www.gentoo.org/downloads/)

This image includes:
- Pre-installed graphical environment (KDE Plasma)
- Pre-configured network
- Pre-installed commonly used tools
- Browser and Wi-Fi support
- Login credentials: `live` / `live` / `live`

> **Note**: The new Gentoo LiveGUI (Gig-OS) provides a user-friendly experience out of the box. If you prefer a minimal environment, you can also choose the minimal installation CD.

### 0.2 Create Bootable USB

```bash
# Find the USB device name
sudo fdisk -l

# Assuming the USB is /dev/sdb
sudo dd if=gentoo-livegui-x86_64-*.iso of=/dev/sdb bs=4M status=progress
```

### 0.3 Boot from USB

Restart your computer and enter the BIOS/UEFI to select the USB as the boot device. Most modern computers support UEFI boot. If everything goes well, you'll see the KDE desktop.

### 0.4 Network Configuration

The LiveGUI image usually auto-detects wired network. For Wi-Fi:

```bash
# Using nmcli
nmcli device wifi list
nmcli device wifi connect "SSID" password "PASSWORD"

# Or using iwctl (if using connman)
iwctl
device list
station wlan0 connect "SSID"
```

Verify connection:
```bash
ping -c 3 gentoo.org
```

### 0.5 Set Root Password and Enable SSH (Optional)

If you want to install remotely:

```bash
# Set root password
passwd

# Start SSH
rc-service sshd start

# Or on systemd
systemctl start sshd

# Check IP address
ip addr
```

> **Note**: For security, it's recommended to use key-based authentication and disable password login after setup.

### 0.6 Disk Partitioning

First, list current disks:

```bash
lsblk
fdisk -l
```

<div>

**Recommended Partition Scheme** (UEFI + GPT):

| Partition | Size | Type | Notes |
|-----------|------|------|-------|
| /dev/sda1 | +512M | EFI System Partition (ESP) | Boot, FAT32 |
| /dev/sda2 | +2G | Linux Swap | Swap (if needed) |
| /dev/sda3 | Remaining | Linux Filesystem | Root / |

</div>

Using `gdisk` (recommended for GPT):

```bash
gdisk /dev/sda
# Press '?' for help

# Create GPT
Command: o

# Create EFI partition (512M)
Command: n
Partition number: 1
First sector: Enter
Last sector: +512M
Hex code: ef00

# Create Swap partition (2G)
Command: n
Partition number: 2
First sector: Enter
Last sector: +2G
Hex code: 8200

# Create Root partition (remaining)
Command: n
Partition number: 3
First sector: Enter
Last sector: Enter
Hex code: 8300

# Write and exit
Command: w
```

<div>

<details>
<summary><b>Legacy BIOS Partition Scheme (Click to Expand)</b></summary>

| Partition | Size | Type |
|-----------|------|------|
| /dev/sda1 | +2G | Linux Swap |
| /dev/sda2 | Remaining | Linux Filesystem |

Using `fdisk`:

```bash
fdisk /dev/sda

# Create MBR
Command: o

# Create Swap partition
Command: n
Partition type: p
Partition number: 1
First sector: Enter
Last sector: +2G
Hex code: 8200

# Create Root partition
Command: n
Partition type: p
Partition number: 2
First sector: Enter
Last sector: Enter
Hex code: 8300

# Write
Command: w
```

</details>

</div>

### 0.7 Format Partitions

<div>

**EFI System Partition (ESP)**:

```bash
mkfs.vfat -F32 /dev/sda1
```

</div>

<details>
<summary><b>Swap (Click to Expand)</b></summary>

```bash
mkswap /dev/sda2
swapon /dev/sda2
```

</details>

<details>
<summary><b>Root Partition (Click to Expand)</b></summary>

```bash
# Ext4 (recommended for beginners)
mkfs.ext4 /dev/sda3

# Btrfs (advanced features)
mkfs.btrfs -L gentoo /dev/sda3

# XFS (enterprise-grade)
mkfs.xfs /dev/sda3
```

</details>

### 0.8 Mount Partitions

```bash
# Mount root
mount /dev/sda3 /mnt/gentoo

# Create EFI directory
mkdir -p /mnt/gentoo/boot/efi

# Mount EFI partition
mount /dev/sda1 /mnt/gentoo/boot/efi

# Verify
lsblk
```

## 1. Download and Extract Stage3

### 1.1 Choose a Mirror

Use [mirrorselect](https://wiki.gentoo.org/wiki/Mirrorselect) to choose the nearest mirror:

```bash
# Interactive selection
emerge --ask app-portage/mirrorselect
mirrorselect -i -r -D

# Or manually add to /etc/portage/make.conf
# Official mirror list: https://www.gentoo.org/downloads/mirrors/
```

> **Official Mirrors**: Gentoo provides official mirrors worldwide. For best speed, choose a mirror geographically close to you from the [official mirror list](https://www.gentoo.org/downloads/mirrors/).

### 1.2 Download Stage3

<div>

**AMD64 (x86_64)**:

```bash
cd /mnt/gentoo

# Check latest Stage3 filename
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/$(wget -qO- https://distfiles.gentoo.org/releases/amd64/autobuilds/ | grep -oP 'stage3-amd64-[0-9]{8}T[0-9]{6}Z\.tar\.xz' | head -1)

# Verify (recommended)
wget https://distfiles.gentoo.org/releases/amd64/autobuilds/$(wget -qO- https://distfiles.gentoo.org/releases/amd64/autobuilds/ | grep -oP 'stage3-amd64-[0-9]{8}T[0-9]{6}Z\.tar\.xz\.DIGESTS.asc' | head -1)
```

> **Note**: For beginners, it's recommended to use the **OpenRC** version. If you prefer systemd, add `-systemd` to the filename.

</div>

### 1.3 Extract Stage3

```bash
# Extract
tar xpf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner

# Verify contents
ls -la
```

### 1.4 Configure Compile Options

Edit `/mnt/gentoo/etc/portage/make.conf`:

```makefile
# Common settings (adjust based on your CPU)
COMMON_FLAGS="-O2 -pipe -march=native"
MAKEOPTS="-j$(nproc)"
EMERGE_DEFAULT_OPTS="--jobs --load-average"

# Mirror (choose one nearest to you)
# For your region: use mirrorselect

# Portage directory
PORTDIR="/var/db/repos/gentoo"
DISTDIR="/var/cache/distfiles"
PKGDIR="/var/cache/binpkgs"
```

> **Tip**: Use `lscpu` to check your CPU architecture. For virtual machines, use `-march=x86-64-v2` or `-march=x86-64` for broader compatibility.

### 1.5 Configure Gentoo Repositories

```bash
# Copy DNS info
cp -L /etc/resolv.conf /mnt/gentoo/etc/

# Mount necessary filesystems
mount --types proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev

# Chroot
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

### 1.6 Initialize Portage

```bash
# Install eix (optional, for faster searches)
emerge --ask app-portage/eix

# Update Portage tree
emerge --sync

# Or use-webrsync if behind firewall
emerge-webrsync
```

### 1.7 Choose Profile

```bash
# List available profiles
eselect profile list

# Choose (example: GNOME + systemd)
# Note: OpenRC is recommended for beginners
eselect profile set default/linux/amd64/23.0/desktop

# Check current profile
eselect profile show
```

<div>

<details>
<summary><b>Profile Types Explained (Click to Expand)</b></summary>

- **desktop**: Includes common desktop software
- **server**: Minimal system for servers
- **hardened**: Enhanced security
- **no-multilib**: For 32-bit compatibility (rarely needed)
- **systemd**: Uses systemd as init
- **openrc**: Uses OpenRC as init (recommended for beginners)

</details>

</div>

## 2. Configure Timezone and Locales

### 2.1 Set Timezone

```bash
# List available timezones
ls /usr/share/zoneinfo

# Set timezone (example: UTC or your local timezone)
# List available timezones:
ls /usr/share/zoneinfo/

# Common timezones:
# UTC, America/New_York, America/Los_Angeles, America/Chicago
# Europe/London, Europe/Paris, Europe/Berlin
# Asia/Tokyo, Asia/Shanghai, Asia/Singapore
# Australia/Sydney, Pacific/Auckland

# Example: Set to UTC
ln -sf /usr/share/zoneinfo/UTC /etc/localtime

# Sync hardware clock
hwclock --systohc
```

### 2.2 Configure Locales

Edit `/etc/locale.gen`:

```
en_US.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
```

Then run:

```bash
locale-gen
```

Set system locale:

```bash
# List available locales
locale -a

# Set default
eselect locale list
eselect locale set en_US.utf8
```

Edit `/etc/env.d/02locale`:

```
LANG=en_US.UTF-8
LC_ALL=en_US.UTF-8
```

Reload environment:

```bash
env-update
source /etc/profile
```

## 3. Install Kernel Sources

### 3.1 Install Kernel

```bash
# Install kernel sources
emerge --ask sys-kernel/gentoo-sources

# List installed kernels
eselect kernel list
eselect kernel set 1
```

### 3.2 Configure Kernel

<div>

<details>
<summary><b>Using make menuconfig (Click to Expand)</b></summary>

```bash
cd /usr/src/linux
make menuconfig
```

Recommended settings:
- **Processor type**: Enable all relevant CPU features
- **Filesystems**: Enable ext4, Btrfs, XFS, VFAT, FUSE
- **Network**: Enable Ethernet, Wi-Fi, Bluetooth drivers
- **Device Drivers**: Enable common hardware support
- **Kernel hacking**: Disable if not needed (reduces size)

</details>

</div>

<details>
<summary><b>Using genkernel (Click to Expand)</b></summary>

```bash
# Install genkernel
emerge --ask sys-kernel/genkernel

# Install distribution kernel (easier)
emerge --ask sys-kernel/installkernel-gentoo

# Or use genkernel for manual configuration
genkernel all
```

</details>

<details>
<summary><b>Using Distro Kernel (Recommended for Beginners)</b></summary>

```bash
# Install distro kernel with default config
emerge --ask sys-kernel/gentoo-kernel-bin

# Or install kernel with initramfs
emerge --ask sys-kernel/gentoo-kernel
```

</details>

### 3.3 Build and Install Kernel

```bash
# If using genkernel
genkernel all

# If using manual config
cd /usr/src/linux
make -j$(nproc) && make modules_install && make install
```

### 3.4 Build Initramfs (If Needed)

For LUKS, LVM, or Btrfs:

```bash
# Using dracut
emerge --ask sys-kernel/dracut

dracut --hostonly --lvm --luks --mdadm --quiet \
    /boot/initramfs-$(uname -r).img $(uname -r)

# Or using genkernel (auto-detects)
genkernel --luks --lvm initramfs
```

### 3.5 Verify Installation

```bash
ls -la /boot/
```

You should see:
- `vmlinuz-*` (kernel)
- `initramfs-*` (initramfs, if created)
- `System.map-*` (kernel symbols)

## 4. Configure System

### 4.1 Create fstab

Edit `/etc/fstab`:

```
# Boot/EFI
UUID=xxxx-xxxx    /boot/efi    vfat    defaults    0 2

# Root
UUID=xxxx-xxxx    /    ext4    defaults    0 1

# Swap
UUID=xxxx-xxxx    none    swap    sw    0 0
```

> **Tip**: Use `blkid` to find UUIDs.

### 4.2 Set Hostname

Edit `/etc/conf.d/hostname`:

```
hostname="gentoo"
```

Edit `/etc/hosts`:

```
127.0.0.1    localhost
::1          localhost
127.0.1.1    gentoo.localdomain    gentoo
```

### 4.3 Configure Network

```bash
# For OpenRC
emerge --ask net-misc/dhcpcd
rc-update add dhcpcd default

# For systemd
systemctl enable systemd-resolved
systemctl enable systemd-networkd
```

<details>
<summary><b>Static IP Configuration (Click to Expand)</b></summary>

Edit `/etc/conf.d/net` (OpenRC):

```
config_eth0="192.168.1.100/24"
routes_eth0="default via 192.168.1.1"
dns_servers_eth0="8.8.8.8 8.8.4.4"
```

Create init script link:
```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.eth0
rc-update add net.eth0 default
```

</details>

### 4.4 Set Root Password

```bash
passwd
```

### 4.5 Add User

```bash
# Add user (replace 'username' with your desired name)
useradd -m -G wheel,audio,video,usb,portage username

# Set user password
passwd username
```

> **Note**: The `wheel` group allows using `sudo`. Make sure to configure sudo later.

### 4.6 Configure sudo

```bash
emerge --ask app-admin/sudo

# Edit sudoers
visudo
```

Add line:

```
username ALL=(ALL) ALL
```

### 4.7 Install System Logs

```bash
# For OpenRC
emerge --ask app-admin/sysklogd
rc-update add sysklogd default

# For systemd (uses journald by default)
systemctl enable systemd-journald
```

### 4.8 Install Cron

```bash
# Install cron
emerge --ask sys-process/cron

# For OpenRC
rc-update add cron default

# For systemd
systemctl enable cron
```

## 5. Install System Boot Tools

### 5.1 Install Systemd (If Choosing systemd)

```bash
# If you chose OpenRC profile earlier, you can switch now
emerge --ask --verbose sys-apps/systemd
```

> **Note**: Switching between systemd and OpenRC is complex and not recommended for beginners.

### 5.2 Install Essential Tools

```bash
# File tools
emerge --ask sys-apps/util-linux
emerge --ask sys-fs/e2fsprogs

# Network tools
emerge --ask net-tools
emerge --ask iputils
emerge --ask traceroute

# SSH
emerge --ask net-misc/openssh

# For OpenRC
rc-update add sshd default

# For systemd
systemctl enable sshd
```

## 6. Configure Boot Loader

<div>

**Reference**: [Gentoo Handbook: AMD64 - Configuring the Bootloader](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader)

</div>

### 6.1 GRUB

<div>

**Reference**: [GRUB](https://wiki.gentoo.org/wiki/GRUB)

</div>

```bash
emerge --ask sys-boot/grub:2
mkdir -p /boot/efi/EFI/Gentoo
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=Gentoo
grub-mkconfig -o /boot/grub/grub.cfg
```

<details>
<summary><b>Advanced Settings: systemd-boot (UEFI Only)</b></summary>

<div>

**Reference**: [systemd-boot](https://wiki.gentoo.org/wiki/Systemd/systemd-boot)

**Note**: Some ARM/RISC-V devices may not support full UEFI specification.

</div>

```bash
bootctl --path=/boot/efi install

# 1. Create Gentoo entry
vim /boot/efi/loader/entries/gentoo.conf
```

Write (replace UUID):

```conf
title   Gentoo Linux
linux   /vmlinuz-6.6.62-gentoo-dist
initrd  /initramfs-6.6.62-gentoo-dist.img
options root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```

<div>

**Note**: Make sure to create `/boot/efi/loader/` directory first.

</div>

</details>

<details>
<summary><b>Advanced Settings: Limine (Modern Open-Source Bootloader)</b></summary>

Limine is a modern, lightweight, feature-rich bootloader.

**Install Limine**:

```bash
emerge --ask sys-boot/limine
```

**Configuration**:

```bash
mkdir -p /boot/limine.d
vim /boot/limine.conf
```

Write:

```conf
TIMEOUT: 5
DEFAULT_ENTRY: 1

: Gentoo Linux
    PROTOCOL: linux
    KERNEL: /vmlinuz-6.6.62-gentoo-dist
    INITRD: /initramfs-6.6.62-gentoo-dist.img
    CMDLINE: root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```

Install to ESP:

```bash
limine-install /dev/sda1
```

**Reference**: [Limine GitHub](https://github.com/limine-bootloader/limine)

</details>

<details>
<summary><b>Advanced Settings: Windows Dual Boot Configuration (Click to Expand)</b></summary>

**GRUB Users**:

```bash
emerge --ask sys-boot/os-prober
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub
grub-mkconfig -o /boot/grub/grub.cfg
```

> GRUB automatically uses os-prober to detect Windows boot entries.

**systemd-boot Users**:

Edit `/boot/loader/entries/windows.conf`:

```
title      Windows 11
efi        /EFI/Microsoft/Boot/bootmgfw.efi
```

**Limine Users**:

Add to `/boot/limine.conf`:

```
: Windows 11
    PROTOCOL: chainload
    PATH: /EFI/Microsoft/Boot/bootmgfw.efi
```

> **Important**: Windows updates replace `/EFI/Boot/bootx64.efi`. It's recommended to rename your Linux EFI file to something else (e.g., `gentoo.efi`).

</details>

<details>
<summary><b>Advanced Settings: Encryption Support - GRUB (Click to Expand)</b></summary>

For LUKS encrypted root partition with GRUB:

**1. Install required packages**:

```bash
emerge --ask sys-boot/grub:2
emerge --ask sys-fs/cryptsetup
```

**2. Configure kernel parameters**:

Edit `/etc/default/grub`, add to `GRUB_CMDLINE_LINUX`:

```
GRUB_CMDLINE_LINUX="crypt_root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx quiet"
```

**3. Regenerate GRUB config**:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

**4. Ensure initramfs includes encrypt hook**:

Edit `/etc/mk.conf` or `/etc/dracut.conf`:

```
add_dracutmodules+=" crypt"
```

Regenerate initramfs after changes.

</details>

<details>
<summary><b>Advanced Settings: Encryption Support - systemd-boot (Click to Expand)</b></summary>

For LUKS encrypted root partition with systemd-boot:

**1. Kernel parameters**:

Edit loader entries:

```
options cryptdevice=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:luks root=/dev/mapper/luks-xxxx quiet
```

**2. Ensure initramfs includes sd-encrypt**:

Systemd initramfs automatically handles LUKS.

**Reference**: [systemd-cryptenroll](https://www.freedesktop.org/software/systemd/man/systemd-cryptenroll.html)

</details>

<details>
<summary><b>Advanced Settings: Encryption Support - Limine (Click to Expand)</b></summary>

For LUKS encrypted root partition with Limine:

**1. Kernel parameters**:

Edit `/boot/limine.conf`:

```
: Gentoo Linux (Encrypted)
    PROTOCOL: linux
    KERNEL: /vmlinuz-6.6.62-gentoo-dist
    INITRD: /initramfs-6.6.62-gentoo-dist.img
    CMDLINE: cryptdevice=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:luks root=/dev/mapper/luks-xxxx quiet
```

**2. Ensure initramfs includes encrypt hook**:

Edit `/etc/mk.conf` or `/etc/dracut.conf`:

```
add_dracutmodules+=" crypt"
```

Regenerate initramfs after changes.

**Reference**: [Limine LUKS Support](https://github.com/limine-bootloader/limine/blob/master/docs/BOOT-PROTOCOL.md)

</details>

## 7. Restart and Verify

### 7.1 Exit chroot

```bash
exit
```

### 7.2 Unmount

```bash
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
```

### 7.3 Reboot

```bash
reboot
```

### 7.4 Post-Installation Verification

After restarting, verify:

```bash
# Check kernel
uname -r

# Check partition mount
df -h

# Check network
ping -c 3 gentoo.org

# Check boot entries
efibootmgr -v
```

> **Congratulations**: You have completed the basic Gentoo installation!

## 8. Post-Installation Configuration

### 8.1 Update System

```bash
# Update Portage tree
emerge --sync

# Update world
emerge --ask --update --deep --newuse @world
```

### 8.2 Clean Package Cache

```bash
# Clean old packages
eclean-dist

# Or use pkl
emerge --ask app-portage/porg
```

### 8.3 Install Common Software

```bash
# Basic tools
emerge --ask app-shells/zsh
emerge --ask app-misc/neofetch
emerge --ask app-editors/vim

# For desktop
emerge --ask x11-misc/xrandr
emerge --ask media-fonts/noto-fonts
```

## 9. Troubleshooting

### 9.1 Boot Issues

- **No boot entry**: Use `efibootmgr` to add boot entry
- **Kernel panic**: Check kernel config and initramfs
- **Black screen**: Check graphics driver

### 9.2 Network Issues

- **No network**: Check DHCP service or configure static IP
- **DNS issues**: Check `/etc/resolv.conf`

### 9.3 Installation Issues

- **emerge fails**: Check network and mirrors
- **Compilation error**: Check `make.conf` settings
- **Permission denied**: Check file permissions

## 10. Advanced: LUKS Encrypted Partition

<div>

**Reference**: [Gentoo Wiki: dm-crypt](https://wiki.gentoo.org/wiki/DM-Crypt)

</div>

<details>
<summary><b>LUKS Encrypted Partition Configuration (Click to Expand)</b></summary>

### 10.1 Create Encrypted Partition

```bash
# Create partition (if not already done)
gdisk /dev/sda

# Create LUKS container
cryptsetup luksFormat /dev/sda3

# Open encrypted container
cryptsetup open /dev/sda3 gentoo

# Format inside
mkfs.ext4 /dev/mapper/gentoo
```

### 10.2 Configure for Boot

Edit `/etc/default/grub`:

```
GRUB_CMDLINE_LINUX="crypt_root=/dev/sda3 quiet"
```

Regenerate GRUB:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### 10.3 Add Key File (Optional)

```bash
# Create key file
dd if=/dev/urandom of=/root/luks.key bs=4096 count=1
chmod 600 /root/luks.key

# Add key to LUKS
cryptsetup luksAddKey /dev/sda3 /root/luks.key

# Add to crypttab
echo "gentoo /dev/sda3 /root/luks.key luks" >> /etc/crypttab
```

</details>

## 11. System Maintenance

### 11.1 Update System

```bash
# Regular update
emerge --ask --update --deep --newuse @world

# Update Portage first
emerge --sync
emerge --ask --update --newuse @world
```

### 11.2 Clean Up

```bash
# Clean package cache
eclean-dist -d

# Clean old kernels
emerge --ask app-portage/gentoolkit
eclean-kernel --all
```

### 11.3 Check System

```bash
# Check for issues
emerge --ask app-portage/gentoolkit
revdep-rebuild

# Check logs
journalctl -p err
```

## What's Next?

- **Next**: [Desktop Configuration](/posts/2025-11-25-gentoo-install-desktop/) - Graphics drivers, desktop environment, input methods
- **Advanced**: [Advanced Optimization](/posts/2025-11-25-gentoo-install-advanced/) - make.conf optimization, LTO, system maintenance

---

> **Footnote**: This article is part of the **Gentoo Linux Installation Guide** series.
