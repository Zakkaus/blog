---
title: "Installing Gentoo Linux on Apple Silicon Mac (M1/M2/M3/M4 Complete Guide)"
slug: gentoo-m-series-mac-arm64
aliases:
  - /posts/gentoo-m-series-mac/
translationKey: gentoo-m-series-mac-arm64
date: 2025-11-30
categories: ["tutorial"]
authors: ["zakkaus"]
article:
  showHero: true
  heroStyle: background
featureImage: feature-gentoo-chan.webp
featureImageAlt: "Gentoo Chan"
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Introduction**

This guide will lead you through installing native ARM64 Gentoo Linux on Apple Silicon Mac (M1/M2/M3/M4).

**Important Update**: Thanks to the excellent work of the Asahi Linux project team (especially [chadmed](https://github.com/chadmed/gentoo-asahi-releng)), there is now an [Official Gentoo Asahi Installation Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide), and the installation process has been significantly simplified.

**Guide Features**:
*   Based on the latest official process (2025.10)
*   Uses official Gentoo Asahi Live USB (no Fedora intermediate step needed)
*   Clearly marks optional vs required steps
*   Simplified version suitable for everyone (includes encryption options)

Verified as of November 20, 2025.

**Target Platform**: Apple Silicon Mac (M1/M2/M3/M4) ARM64 architecture. This guide uses the Asahi Linux bootloader for initial setup, then converts to a full Gentoo environment.

</div>

---

## Installation Process Overview (Simplified)

**Required Steps**:
1. Download official Gentoo Asahi Live USB image
2. Configure U-Boot environment via Asahi installer
3. Boot from Live USB
4. Partition disk and mount filesystems
5. Unpack Stage3 and enter chroot
6. Install Asahi support packages (automated script)
7. Reboot to finish installation

**Optional Steps**:
- LUKS Encryption (Recommended but not mandatory)
- Custom kernel configuration (Default dist-kernel is fine)
- Audio setup (PipeWire, as needed)
- Desktop environment selection

The entire process will create a dual-boot environment on your Mac: macOS + Gentoo Linux ARM64.

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Official Simplification**

You can now use the [asahi-gentoosupport automation script](https://github.com/chadmed/asahi-gentoosupport) to complete most configurations!

</div>

---

## Prerequisites and Notes {#prerequisites}

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

### Hardware Requirements

*   Apple Silicon Mac (M1/M2/M3/M4 series chips)
*   At least 80 GB of free disk space (Recommended 120 GB+)
*   Stable network connection (Wi-Fi or Ethernet)
*   Backup all important data

### Important Warning

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid rgb(239, 68, 68); margin: 1rem 0;">

**This guide involves advanced operations**:
*   Will adjust your partition table
*   Requires coexistence with macOS
*   Involves encrypted disk operations
*   Apple Silicon support for Linux is still in active development

</div>

**Known Working Features**:
*   CPU, Memory, Storage devices
*   Wi-Fi (via Asahi Linux firmware)
*   Keyboard, Trackpad, Battery management
*   Display output (Built-in screen and external monitors)
*   USB-C / Thunderbolt

**Known Limitations**:
*   Touch ID not available
*   macOS virtualization features limited
*   Some new hardware features might not be fully supported
*   GPU acceleration is still in development (OpenGL partially supported)

</div>

---

## 0. Prepare Gentoo Asahi Live USB {#step-0-prepare}

### 0.1 Download Official Gentoo Asahi Live USB

**Official Simplified Process**: Use the Gentoo provided ARM64 Live USB directly, no need to go through Fedora!

Download latest version:
```bash
# Method 1: Author's site download
https://chadmed.au/pub/gentoo/

```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Official integration of Asahi support into standard Live USB is in progress. Currently using the version maintained by chadmed.

</div>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Mirror Version Compatibility Info (Updated: 2025-11-21)**

- **Community Build**: Mirror built by [Zakkaus](https://github.com/zakkaus) based on [gentoo-asahi-releng](https://github.com/chadmed/gentoo-asahi-releng)
  - **Features**: systemd + KDE Plasma desktop environment, pre-installed Chinese support and Fcitx5 input method, audio and Wi-Fi, flclash, firefox-bin etc. work out of the box
  - **Download Link**: [Google Drive](https://drive.google.com/drive/folders/1ZYGkc8uXqRFJ4jeaSbm5odeNb2qvh6CS)
  - **Applicable Scenario**: Recommended for beginners, successfully tested on M2 MacBook
  - If interested in building yourself, refer to [gentoo-asahi-releng](https://github.com/chadmed/gentoo-asahi-releng) project
- **Official Version**:
  - **Recommended**: `install-arm64-asahi-20250603.iso` (June 2025 version, tested stable)
  - **May not boot**: `install-arm64-asahi-20251022.iso` (October 2025 version) may not boot correctly on some devices (like M2 MacBook)
  - **Suggestion**: If the latest version fails to boot, please try using the 20250603 version or the community build

</div>

### 0.2 Create Bootable USB

In macOS:

```bash
# Check USB device name
diskutil list

# Unmount USB (assuming /dev/disk4)
diskutil unmountDisk /dev/disk4

# Write image (note using rdisk is faster)
sudo dd if=install-arm64-asahi-*.iso of=/dev/rdisk4 bs=4m status=progress

# Eject after completion
diskutil eject /dev/disk4
```

---

## 1. Configure Asahi U-Boot Environment {#step-1-asahi}

### 1.1 Run Asahi Installer

Run in macOS Terminal:

```bash
curl https://alx.sh | sh
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Security Tip**

Recommended to visit <https://alx.sh> to check script content before execution.

</div>

### 1.2 Follow Installer Steps

The installer will guide you:

1. **Choose Action**: Enter `r` (Resize an existing partition to make space for a new OS)

2. **Choose Partition Space**: Decide space allocated for Linux (Recommended at least 80 GB)
   - Can use percentage (e.g., `50%`) or absolute size (e.g., `120GB`)
   
<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Recommended to keep macOS partition for future firmware updates.

</div>

3. **Choose OS**: Select **UEFI environment only (m1n1 + U-Boot + ESP)**
   ```
   » OS: <Select UEFI only option>
   ```
   
<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Official Recommendation**

Select UEFI only is sufficient, no need to install a full distribution.

</div>

4. **Set Name**: Enter `Gentoo` as OS name
   ```
   » OS name: Gentoo
   ```

5. **Finish Installation**: Note screen instructions, then press Enter to shut down.

### 1.3 Complete Recovery Mode Setup (Critical Step)

**Important Reboot Steps**:

1. **Wait 25 seconds** to ensure system is fully shut down
2. **Hold Power Button** until you see "Loading startup options..." or spinning icon
3. **Release Power Button**
4. Wait for volume list to appear, select **Gentoo**
5. You will see macOS Recovery screen:
   - If asked "Select a volume to recover", select your macOS volume and click Next
   - Enter macOS user password (FileVault users)
6. Follow screen instructions to complete setup

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Troubleshooting**

If you encounter a boot loop or are asked to reinstall macOS, please hold the power button to fully shut down, then restart from Step 1. You can choose to boot macOS, run `curl https://alx.sh | sh` and select `p` option to retry.

</div>

---

## 2. Boot from Live USB {#step-2-boot}

### 2.1 Connect Live USB and Boot

1. **Insert Live USB** (Can use USB Hub or Dock)
2. **Boot Mac**
3. **U-Boot Auto Boot**:
   - If "UEFI environment only" was selected, U-Boot will automatically boot GRUB from USB
   - Wait 2 seconds for auto boot sequence
   - If multiple systems exist, might need to interrupt and manually select

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

If manual USB boot is needed, run at U-Boot prompt:

```bash
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

</div>

### 2.2 Configure Network (Live Environment)

Gentoo Live USB built-in network tools:

**Wi-Fi Connection**:
```bash
net-setup
```

Follow interactive prompts to set up network. Check after completion:

```bash
ping -c 3 www.gentoo.org
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Apple Silicon Wi-Fi is included in the kernel and should work normally. If unstable, try connecting to a 2.4 GHz network.

</div>

**(Optional) SSH Remote Operation**:
```bash
passwd                     # Set root password
/etc/init.d/sshd start
ip a | grep inet          # Get IP address
```

---

## 3. Partition and Filesystem Setup {#step-3-partition}

### 3.1 Identify Disk and Partitions

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Warning**

**Do not modify existing APFS containers, EFI partitions or Recovery partitions!** Only operate in the space reserved by the Asahi installer.

</div>

View partition structure:
```bash
lsblk
blkid --label "EFI - GENTO"  # Check your EFI partition
```

Usually you will see:
```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0         7:0    0 609.1M  1 loop /run/rootfsbase
sda           8:0    1 119.5G  0 disk /run/initramfs/live
|-sda1        8:1    1   118K  0 part 
|-sda2        8:2    1   2.8M  0 part 
`-sda3        8:3    1 670.4M  0 part 
nvme0n1     259:0    0 465.9G  0 disk 
|-nvme0n1p1 259:1    0   500M  0 part 
|-nvme0n1p2 259:2    0 307.3G  0 part 
|-nvme0n1p3 259:3    0   2.3G  0 part 
|-nvme0n1p4 259:4    0   477M  0 part 
`-nvme0n1p5 259:5    0     5G  0 part 
nvme0n2     259:6    0     3M  0 disk 
nvme0n3     259:7    0   128M  0 disk 
```

EFI Partition Identification (**Do not touch this partition!**):
```bash
livecd ~ # blkid --label "EFI - GENTO" 
/dev/nvme0n1p4  # This is the EFI partition, do not touch
```


<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Suggestion**

Use `cfdisk` for partitioning, it understands Apple partition types and protects system partitions.

</div>

### 3.2 Create Root Partition

Assuming free space starts from `/dev/nvme0n1p5`:

**Method A: Simple Partition (No Encryption)**

```bash
# Use cfdisk to create new partition
cfdisk /dev/nvme0n1
```

You will see a partition table similar to:
```
                                            Disk: /dev/nvme0n1
                         Size: 465.92 GiB, 500277792768 bytes, 122138133 sectors
                       Label: gpt, identifier: 6C5A96F2-EFC9-487C-8C3E-01FD5EA77896

    Device                      Start            End       Sectors        Size Type
    /dev/nvme0n1p1                  6         128005        128000        500M Apple Silicon boot
    /dev/nvme0n1p2             128006       80694533      80566528      307.3G Apple APFS
    /dev/nvme0n1p3           80694534       81304837        610304        2.3G Apple APFS
    /dev/nvme0n1p4           81304838       81426949        122112        477M EFI System
>>  Free space               81427200      120827418      39400219      150.3G                            
    /dev/nvme0n1p5          120827419      122138127       1310709          5G Apple Silicon recovery

                        [   New  ]  [  Quit  ]  [  Help  ]  [  Write ]  [  Dump  ]

                                   Create new partition from free space
```

Steps:
1. Select **Free space** → **New**
2. Use all space (or custom size)
3. **Type** → Select **Linux filesystem**
4. **Write** → Type `yes` to confirm
5. **Quit** to leave

**Format Partition**:
```bash
# Format as ext4 or btrfs
mkfs.ext4 /dev/nvme0n1p6
# Or
mkfs.btrfs /dev/nvme0n1p6

# Mount
mount /dev/nvme0n1p6 /mnt/gentoo
```

**Method B: Encrypted Partition (Optional, Recommended)**

```bash
# Create LUKS2 encrypted partition
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6

# Type YES to confirm, set encryption password

# Open encrypted partition
cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root

# Format
mkfs.btrfs --label root /dev/mapper/gentoo-root

# Mount
mount /dev/mapper/gentoo-root /mnt/gentoo
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Why these parameters?**

*   `argon2id`: Resistant to ASIC/GPU brute force attacks
*   `aes-xts`: M1 has AES instruction set, hardware accelerated
*   `luks2`: Better security features

</div>

### 3.3 Mount EFI Partition

```bash
mkdir -p /mnt/gentoo/boot
mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

---

## 4. Stage3 and chroot {#step-4-stage3}

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Follow [AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64) from here** until Kernel Installation section.

</div>

### 4.1 Download and Unpack Stage3

```bash
cd /mnt/gentoo

# Download latest ARM64 Desktop systemd Stage3
wget https://distfiles.gentoo.org/releases/arm64/autobuilds/current-stage3-arm64-desktop-systemd/stage3-arm64-desktop-systemd-*.tar.xz

# Unpack (preserve attributes)
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 4.2 Configure Portage

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 4.3 Sync System Time (Important)

Before entering chroot, ensure system time is correct (to avoid compilation and SSL certificate issues):

```bash
# Sync time
chronyd -q

# Verify time is correct
date
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Why sync time?**

*   Compiling packages requires correct timestamps
*   SSL/TLS certificate verification relies on accurate system time
*   Incorrect time may cause emerge failures or certificate errors

</div>

### 4.4 Enter chroot Environment

**Mount necessary filesystems**:
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
**Enter chroot**:
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

### 4.5 Basic System Configuration

**Configure make.conf** (Optimized for Apple Silicon):

Edit `/etc/portage/make.conf`:
```bash
nano -w /etc/portage/make.conf
```

Add or modify the following:
```conf
# vim: set language=bash;
CHOST="aarch64-unknown-linux-gnu"

# Apple Silicon Optimized Compilation Flags
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"

# Keep build output in English (Please keep this for error reporting)
LC_MESSAGES=C

# Adjust based on hardware (e.g., M2 Max has more cores)
MAKEOPTS="-j4"

# Gentoo Mirrors (Recommended to use R2 mirror for speed)
GENTOO_MIRRORS="https://gentoo.rgst.io/gentoo"

# Emerge Default Options (Compile at most 3 packages simultaneously)
EMERGE_DEFAULT_OPTS="--jobs 3"

# Asahi GPU Driver
VIDEO_CARDS="asahi"

# Localization Support (Optional)
L10N="en en-US"

# Keep newline at end of file! Important!
```

**Sync Portage**:
```bash
emerge-webrsync
```

**Set Timezone**:
```bash
# Set to your timezone (e.g., America/New_York)
ln -sf /usr/share/zoneinfo/America/New_York /etc/localtime
```

**Set Locale**:
```bash
# Edit locale.gen, uncomment needed locales
nano -w /etc/locale.gen
# Uncomment: en_US.UTF-8 UTF-8

# Generate locales
locale-gen

# Select system default locale
eselect locale set en_US.utf8

# Reload environment
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

**Create User and Set Password**:
```bash
# Create user (Replace <username> with your username)
useradd -m -G wheel,audio,video,usb,input <username>

# Set user password
passwd <username>

# Set root password
passwd root
```

---

## 5. Install Asahi Support Packages (Core Step) {#step-5-asahi}

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Official Simplified Process**

This section replaces the "Installing the Kernel" section of the Handbook.

</div>

### 5.1 Method A: Automated Installation (Recommended)

**Step 1: Install git**

```bash
# Sync Portage tree for the first time
emerge --sync

# Install git (required for downloading script)
emerge --ask dev-vcs/git
```

**Step 2: Use asahi-gentoosupport script** (Official):

```bash
cd /tmp
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

This script will automatically:
- Enable Asahi overlay
- Install GRUB bootloader
- Set VIDEO_CARDS="asahi"
- Install asahi-meta (includes kernel, firmware, m1n1, U-Boot)
- Run `asahi-fwupdate` and `update-m1n1`
- Update system

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**If encountering USE flag conflicts**

The script might prompt for USE flag changes during execution. Solution:

```bash
# When script prompts for USE flag conflict, press Ctrl+C to interrupt
# Then run:
emerge --autounmask-write <package-with-conflict>

# Update configuration files
etc-update
# Select appropriate option in etc-update (usually -3 for auto-merge)

# Re-run installation script
cd /tmp/asahi-gentoosupport
./install.sh
```

</div>

**Skip directly to Step 5.3 (fstab configuration) after script completion!**

---

### 5.2 Method B: Manual Installation (Advanced Users)

**Step 1: Install git and configure Asahi overlay**

```bash
# Sync Portage tree for the first time
emerge --sync

# Install git (for git sync method)
emerge --ask dev-vcs/git

# Remove old Portage repository and switch to git sync
rm -rf /var/db/repos/gentoo
sudo tee /etc/portage/repos.conf/gentoo.conf << 'EOF'
[DEFAULT]
main-repo = gentoo

[gentoo]
location = /var/db/repos/gentoo
sync-type = git
sync-uri = https://github.com/gentoo-mirror/gentoo.git
auto-sync = yes
sync-depth = 1
EOF

# Configure Asahi overlay using git sync
sudo tee /etc/portage/repos.conf/asahi.conf << 'EOF'
[asahi]
location = /var/db/repos/asahi
sync-type = git
sync-uri = https://github.com/chadmed/asahi-overlay.git
auto-sync = yes
EOF

# Sync all repositories
emerge --sync
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Mirror Note**

**Traditional Chinese Users Recommended**: You can change `sync-uri` above to BFSU mirror `https://mirrors.bfsu.edu.cn/git/gentoo-portage.git` for faster sync speed.

For more mirror options refer to: [Mirror List](/mirrorlist/)

</div>

**Step 2: Configure package.mask (Important!)**

Prevent Gentoo official dist-kernel from overwriting Asahi version:

```bash
mkdir -p /etc/portage/package.mask
cat > /etc/portage/package.mask/asahi << 'EOF'
# Mask the upstream dist-kernel virtual so it doesn't try to force kernel upgrades
virtual/dist-kernel::gentoo
EOF
```

**Step 3: Configure package.use**

```bash
mkdir -p /etc/portage/package.use

# Asahi specific USE flags
cat > /etc/portage/package.use/asahi << 'EOF'
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
EOF

# VIDEO_CARDS setting
echo 'VIDEO_CARDS="asahi"' >> /etc/portage/make.conf

# GRUB platform setting (Required!)
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
```

**Step 4: Configure firmware license**

```bash
mkdir -p /etc/portage/package.license
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/firmware
```

**Step 5: Install rust-bin (Must install first!)**

```bash
emerge -q1 dev-lang/rust-bin
```

**Step 6: Install Asahi packages**

```bash
# Install all necessary packages at once
emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Tip**

If `etc-update` shows configuration file conflicts, choose `-3` for auto-merge.

</div>

Package explanation:
- `rust-bin`: Required for compiling Asahi kernel components (must install first)
- `asahi-meta`: Includes m1n1, asahi-fwupdate, U-Boot tools
- `virtual/dist-kernel:asahi`: Asahi custom kernel (includes non-upstream patches)
- `linux-firmware`: Provides hardware firmware like Wi-Fi

**Step 7: Update firmware and bootloader**

```bash
asahi-fwupdate
update-m1n1
```

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important**

You MUST run `update-m1n1` every time you update the kernel, U-Boot, or m1n1!

</div>

**Step 8: Install and Configure GRUB**

```bash
# Install GRUB
emerge -q grub:2

# Install GRUB to ESP (Note: --removable flag is important!)
grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable

# Generate GRUB config
grub-mkconfig -o /boot/grub/grub.cfg
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Key Points**

*   `--removable` flag is mandatory to ensure system boots from ESP
*   `--boot-directory` and `--efi-directory` must both point to `/boot/`
*   Must set `GRUB_PLATFORMS="efi-64"` in make.conf

</div>

**Step 9: Update System (Optional)**

```bash
emerge --ask --update --deep --changed-use @world
```

---

### 5.3 Configure fstab

Get UUIDs:
```bash
blkid $(blkid --label root)       # Root partition (or /dev/mapper/gentoo-root)
blkid $(blkid --label "EFI - GENTO")     # boot partition
```

Edit `/etc/fstab`:
```bash
nano -w /etc/fstab
```

```fstab
# Root partition (Adjust according to your config)
UUID=<your-root-uuid>  /      ext4   defaults  0 1
# Or encrypted version:
# UUID=<your-btrfs-uuid>  /      btrfs  defaults  0 1

UUID=<your-boot-uuid>  /boot  vfat   defaults  0 2
```

### 5.4 Configure Encryption Support (Encrypted Users Only)

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Only perform this step if you selected encrypted partition in Step 3.2.

</div>

**Step 1: Enable systemd cryptsetup support**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Recompile systemd to enable cryptsetup support
emerge --ask --oneshot sys-apps/systemd
```

**Step 2: Get LUKS Partition UUID**

```bash
# Get LUKS encrypted container UUID (Not the filesystem UUID inside)
blkid /dev/nvme0n1p5
```

Output example:
```
/dev/nvme0n1p5: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```

Note down this **LUKS UUID** (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

**Step 3: Configure GRUB Kernel Parameters**

```bash
nano -w /etc/default/grub
```

Add or modify the following (**Replace UUID with actual values**):
```conf
# Complete Example (Replace UUID with your actual UUID)
GRUB_CMDLINE_LINUX="rd.luks.uuid=3f5a6527-7334-4363-9e2d-e0e8c7c04488 rd.luks.allow-discards root=UUID=f3db74a5-dc70-48dd-a9a3-797a0daf5f5d rootfstype=btrfs"
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Parameter Explanation**

- `rd.luks.uuid=<UUID>`: UUID of LUKS encrypted partition (Get via `blkid /dev/nvme0n1p6`)
- `rd.luks.allow-discards`: Allow SSD TRIM command to pass through encryption layer (Improve SSD performance)
- `root=UUID=<UUID>`: UUID of decrypted btrfs filesystem (Get via `blkid /dev/mapper/gentoo-root`)
- `rootfstype=btrfs`: Root filesystem type (Change to `ext4` if using ext4)

</div>

**Step 4: Install and Configure dracut**

```bash
# Install dracut (if not installed)
emerge --ask sys-kernel/dracut
```

**Step 5: Configure dracut for LUKS decryption**

Create dracut config file:
```bash
nano -w /etc/dracut.conf.d/luks.conf
```

Add the following:
```conf
# Do not set kernel_cmdline here, GRUB will overwrite it
kernel_cmdline=""
# Add necessary modules to support LUKS + btrfs
add_dracutmodules+=" btrfs systemd crypt dm "
# Add necessary tools
install_items+=" /sbin/cryptsetup /bin/grep "
# Specify filesystem (Modify if using other filesystem)
filesystems+=" btrfs "
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Configuration Explanation**

*   `crypt` and `dm` modules provide LUKS decryption support
*   `systemd` module used for systemd boot environment
*   `btrfs` module supports btrfs filesystem (Change to `ext4` if using ext4)

</div>

**Step 6: Configure /etc/crypttab (Optional but Recommended)**

```bash
nano -w /etc/crypttab
```

Add the following (**Replace UUID with your LUKS UUID**):
```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

With this configuration, system will automatically identify and prompt to unlock encrypted partition.

</div>

**Step 7: Regenerate initramfs**

```bash
# Get current kernel version
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important**

You must re-run this command to generate new initramfs every time you update the kernel!

</div>

**Step 8: Update GRUB Config**

```bash
grub-mkconfig -o /boot/grub/grub.cfg

# Verify initramfs is correctly referenced
grep initrd /boot/grub/grub.cfg
```

---

## 6. Finish Installation and Reboot {#step-6-finalize}

### 6.1 Final Settings

**Set Hostname**:
```bash
echo "macbook" > /etc/hostname
```

**Enable NetworkManager** (Desktop System):
```bash
systemctl enable NetworkManager
```

**Set root password** (If not set):
```bash
passwd root
```

### 6.2 Exit chroot and Reboot

```bash
exit
umount -R /mnt/gentoo
# If using encryption:
```bash
cryptsetup luksClose gentoo-root

reboot
```

### 6.3 First Boot

1. U-Boot will start automatically
2. GRUB menu appears, select Gentoo
3. (If encrypted) Enter LUKS password
4. System should successfully boot to login prompt

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Congratulations! Base system installation is complete!**

</div>

---

## 7. Post-Installation Configuration (Optional) {#step-7-post}

### 7.1 Network Connection

```bash
# Wi-Fi
nmcli device wifi connect <SSID> password <password>

# Or use nmtui (GUI)
nmtui
```

### 7.2 Install Desktop Environment (Optional)

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Tip**

Before installing a desktop environment, it is recommended to switch to the corresponding system profile, which will automatically set many necessary USE flags.

</div>

#### Step 1: Check and Select System Profile

```bash
# List all available profiles
eselect profile list
```

Output example:
```
Available profile symlink targets:
  [1]   default/linux/arm64/23.0 (stable)
  [2]   default/linux/arm64/23.0/systemd (stable) *
  [3]   default/linux/arm64/23.0/desktop (stable)
  [4]   default/linux/arm64/23.0/desktop/gnome (stable)
  [5]   default/linux/arm64/23.0/desktop/gnome/systemd (stable)
  [6]   default/linux/arm64/23.0/desktop/plasma (stable)
  [7]   default/linux/arm64/23.0/desktop/plasma/systemd (stable)
```

**Select appropriate profile**:

```bash
# GNOME Desktop
eselect profile set 5    # desktop/gnome/systemd

# KDE Plasma Desktop (Recommended)
eselect profile set 7    # desktop/plasma/systemd

# Generic Desktop Environment (Xfce etc.)
eselect profile set 3    # desktop (No specific desktop)
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Profile Explanation**

*   `desktop/gnome/systemd`: Automatically enable GNOME related USE flags (gtk, gnome, wayland etc.)
*   `desktop/plasma/systemd`: Automatically enable KDE related USE flags (qt5, kde, plasma etc.)
*   `desktop`: Basic desktop USE flags (X, dbus, networkmanager etc.)

</div>

#### Step 2: Update System to Apply New Profile

After switching profile, need to recompile affected packages:

```bash
# Update all packages to apply new USE flags
emerge -avuDN @world
```

#### Step 3: Install Desktop Environment

**Option A: KDE Plasma (Recommended)**

```bash
# Install KDE Plasma Desktop
emerge --ask kde-plasma/plasma-meta kde-apps/kate kde-apps/dolphin

# Enable Display Manager
systemctl enable sddm

# Install common apps (Optional)
emerge --ask kde-apps/konsole \
             kde-apps/okular \
             www-client/firefox
```

**Option B: GNOME**

```bash
# Install full GNOME Desktop
emerge --ask gnome-base/gnome gnome-extra/gnome-tweaks

# Enable Display Manager
systemctl enable gdm

# Install common apps (Optional)
emerge --ask gnome-extra/gnome-system-monitor \
             gnome-extra/gnome-calculator \
             www-client/firefox
```

**Option C: Xfce (Lightweight)**

```bash
# Switch back to generic desktop profile first
eselect profile set 3    # desktop

# Update system
emerge -avuDN @world

# Install Xfce
emerge --ask xfce-base/xfce4-meta xfce-extra/xfce4-pulseaudio-plugin

# Install and enable Display Manager
emerge --ask x11-misc/lightdm
systemctl enable lightdm
```

#### Step 4: Optimize Desktop Performance (Optional)

**Enable Video Acceleration (Asahi GPU)**:

```bash
# Check VIDEO_CARDS setting
grep VIDEO_CARDS /etc/portage/make.conf
# Should contain: VIDEO_CARDS="asahi"

# Install Mesa and Asahi drivers (Usually already installed)
emerge --ask media-libs/mesa
```

**Enable Font Rendering**:

```bash
# Install basic fonts
emerge --ask media-fonts/liberation-fonts \
             media-fonts/noto \
             media-fonts/noto-cjk \
             media-fonts/dejavu

# Enable font tweaking
eselect fontconfig enable 10-sub-pixel-rgb.conf
eselect fontconfig enable 11-lcdfilter-default.conf
```

**Chinese Input Method Configuration**:

```bash
# Install Fcitx5 Chinese Input Method
emerge --ask app-i18n/fcitx-chinese-addons
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

`app-i18n/fcitx-rime` is tested to be not working properly in current version, recommended to use `app-i18n/fcitx-chinese-addons` as alternative.

</div>

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

*   First time desktop installation takes about **2-4 hours** (Depends on CPU performance)
*   Recommended to use `--jobs 3` or less to avoid Out of Memory
*   Can set `EMERGE_DEFAULT_OPTS="--jobs 3 --load-average 8"` in `/etc/portage/make.conf`

</div>

### 7.3 Audio Configuration (Optional)

Asahi audio is provided via PipeWire. Install and enable related services:

```bash
# Install Asahi audio support
emerge --ask media-libs/asahi-audio

# Enable PipeWire services
systemctl --user enable --now pipewire-pulse.service
systemctl --user enable --now wireplumber.service
```
---

## 8. System Maintenance {#step-8-maintenance}

### 8.1 Regular Update Process

```bash
# Update Portage tree (Includes Asahi overlay)
emerge --sync
# Or manually sync Asahi overlay:
emaint -r asahi sync

# Update all packages
emerge -avuDN @world

# Clean up unneeded packages
emerge --depclean

# Update config files
dispatch-conf
```

### 8.2 Must-Do After Kernel Update

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Extremely Important**

Must execute after every kernel update!

</div>

```bash
# Update m1n1 Stage 2 (Includes devicetree)
update-m1n1

# Regenerate GRUB config
grub-mkconfig -o /boot/grub/grub.cfg
```

**Why?** m1n1 Stage 2 contains devicetree blobs, kernel needs it to identify hardware. Failure to update may cause boot failure or missing features.

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Automation**

`sys-apps/asahi-scripts` provides installkernel hook to automatically execute these steps.

</div>

### 8.3 Update Firmware

macOS system updates include firmware updates. **Recommended to keep macOS partition** to get latest firmware.

---

## 9. FAQ and Troubleshooting {#faq}

### Problem: Cannot boot from USB

**Possible Cause**: U-Boot USB driver limitations.

**Solution**:
- Try different USB flash drive
- Use USB 2.0 device (Better compatibility)
- Connect via USB Hub

### Problem: Boot stuck or black screen

**Cause**: m1n1/U-Boot/Kernel mismatch.

**Solution**:
1. Re-run Asahi installer from macOS
2. Select `p` option to retry Recovery process
3. Ensure `update-m1n1` was executed in chroot

### Problem: Encrypted partition cannot unlock

**Cause**: dracut config error or wrong UUID.

**Solution**:
1. Check `GRUB_CMDLINE_LINUX` in `/etc/default/grub`
2. Confirm correct LUKS UUID: `blkid /dev/nvme0n1p5`
3. Regenerate GRUB config: `grub-mkconfig -o /boot/grub/grub.cfg`

### Problem: Unstable Wi-Fi

**Cause**: Possible WPA3 or 6 GHz band issues.

**Solution**:
- Connect to WPA2 network
- Use 2.4 GHz or 5 GHz band (Avoid 6 GHz)

### Problem: Trackpad not working

**Cause**: Firmware not loaded or driver issue.

**Solution**:
```bash
# Check firmware
dmesg | grep -i firmware

# Ensure asahi-meta is installed
emerge --ask sys-apps/asahi-meta
```

---

## 10. Advanced Tips (Optional) {#advanced}

### 10.1 Notch Configuration

Default notch area shows as black. To enable:

```bash
# Add to GRUB kernel parameters
apple_dcp.show_notch=1
```

**KDE Plasma Optimization**:
- Add full-width panel at top, height aligned to notch bottom
- Left: Application Dashboard, Global menu, Spacer
- Right: System Tray, Bluetooth, Power, Clock

### 10.2 Custom Kernel (Advanced)

Using Distribution kernel is fine, but if you want to customize:

```bash
emerge --ask sys-kernel/asahi-sources
cd /usr/src/linux
make menuconfig
make -j$(nproc)
make modules_install
make install
update-m1n1  # Must!
grub-mkconfig -o /boot/grub/grub.cfg
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Remember to keep a working kernel as backup**!

</div>

### 10.3 Multi-Kernel Switching

Supports multiple kernels coexistence:

```bash
eselect kernel list
eselect kernel set <number>
update-m1n1  # Must execute after switching!
```

---

## 11. References {#reference}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Official Docs

*   **[Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)**  Official Latest Guide
*   [Asahi Linux Official Site](https://asahilinux.org/)
*   [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
*   [Gentoo AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64) (Same process)

</div>

<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Tools and Scripts

*   [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport) - Automated installation script
*   [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng) - Live USB build tool

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Community Support

**Gentoo Chinese Community**:
*   Telegram Group: [@gentoo_zh](https://t.me/gentoo_zh)
*   Telegram Channel: [@gentoocn](https://t.me/gentoocn)
*   [GitHub](https://github.com/gentoo-zh)

**Official Community**:
*   [Gentoo Forums](https://forums.gentoo.org/)
*   IRC: `#gentoo` and `#asahi` @ [Libera.Chat](https://libera.chat/)
*   [Asahi Linux Discord](https://discord.gg/asahi-linux)

</div>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Further Reading

*   [Asahi Linux Open OS Interoperability](https://asahilinux.org/docs/platform/open-os-interop/) - Understanding Apple Silicon Boot Process
*   [Linux Kernel Devicetree](https://docs.kernel.org/devicetree/usage-model.html) - Why update-m1n1 is needed
*   [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac) - Community member's installation guide

</div>

</div>

---

## Conclusion

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; text-align: center;">

### Wish you enjoy Gentoo on Apple Silicon!

This guide is based on official [Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide) with simplified process, marked optional steps, making it easier for everyone to try.

**Remember 3 Key Points**:
1.  Use official Gentoo Asahi Live USB (No Fedora intermediate step)
2.  asahi-gentoosupport script automates most processes
3.  Must execute `update-m1n1` after every kernel update

Welcome to ask questions in the community!

</div>
