---
title: "Install Gentoo Linux on Apple Silicon Mac (M1/M2/M3/M4 Complete Guide)"
slug: gentoo-m-series-mac-arm64
aliases:
  - /posts/gentoo-m-series-mac/
translationKey: gentoo-m-series-mac-arm64
date: 2025-10-02
categories: ["tutorial"]
authors: ["zakkaus"]
article:
  showHero: true
  heroStyle: background
featureImage: feature-gentoo-chan.webp
featureImageAlt: "Gentoo Chan"
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

**Introduction**

This guide will lead you to install native ARM64 Gentoo Linux on Apple Silicon Mac (M1/M2/M3/M4).

**Important Update**: Thanks to the excellent work of the Asahi Linux project team (especially [chadmed](https://github.com/chadmed/gentoo-asahi-releng)), there is now an [Official Gentoo Asahi Installation Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide), and the installation process has been significantly simplified.

> **Reference**: [Gentoo Wiki - Apple Silicon](https://wiki.gentoo.org/wiki/Apple_Silicon)

> **Image Credit**: [Pixiv](https://www.pixiv.net/artworks/115453639)

**Guide Features**:
- Based on the latest official process (2025.10)
- Uses official Gentoo Asahi Live USB (No need for Fedora transit)
- Clearly marks optional and mandatory steps
- Simplified version suitable for everyone (Includes encryption options)

Verified up to November 20, 2025.


> **Target Platform**: Apple Silicon Mac (M1/M2/M3/M4) ARM64 architecture. This guide uses Asahi Linux bootloader for initial setup, then converts to a full Gentoo environment.

---

## Installation Overview (Simplified)

**Mandatory Steps**:
1. Download official Gentoo Asahi Live USB image
2. Set up U-Boot environment via Asahi installer
3. Boot from Live USB
4. Partition disk and mount filesystems
5. Unpack Stage3 and enter chroot
6. Install Asahi support packages (Automated script)
7. Reboot to complete installation

**Optional Steps**:
- LUKS Encryption (Recommended but not mandatory)
- Custom Kernel Configuration (Default dist-kernel is fine)
- Audio Settings (PipeWire, as needed)
- Desktop Environment Selection

The entire process will create a dual-boot environment on your Mac: macOS + Gentoo Linux ARM64.

> **Official Simplification**: Now you can use [asahi-gentoosupport automated script](https://github.com/chadmed/asahi-gentoosupport) to complete most configurations!

---

## Prerequisites and Notes {#prerequisites}

### Hardware Requirements

- Apple Silicon Mac (M1/M2/M3/M4 series chips)
- At least 80 GB of available disk space (Recommended 120 GB+)
- Stable network connection (Wi-Fi or Ethernet)
- Backup all important data

### Important Warnings

**This guide involves advanced operations**:
- Will adjust your partition table
- Needs to coexist with macOS
- Involves encrypted disk operations
- Apple Silicon support for Linux is still under active development

**Known Working Features**:
- CPU, Memory, Storage
- Wi-Fi (via Asahi Linux firmware)
- Keyboard, Trackpad, Battery Management
- Display Output (Internal screen and external monitor)
- USB-C / Thunderbolt

**Known Limitations**:
- Touch ID is unavailable
- macOS virtualization features are limited
- Some new hardware features might not be fully supported
- GPU acceleration is still under development (OpenGL partially supported)

---

## 0. Prepare Gentoo Asahi Live USB {#step-0-prepare}

### 0.1 Download Official Gentoo Asahi Live USB

**Official Simplified Process**: Use Gentoo provided ARM64 Live USB directly, no need to go through Fedora!

Download latest version:
```bash
# Method 1: Author's site download
https://chadmed.au/pub/gentoo/

```

> **Tip**: Official is integrating Asahi support into standard Live USB. Currently using version maintained by chadmed.

> **Image Version Compatibility Info (Updated: 2025-11-21)**:
> - **Community Build**: Image built by [Zakkaus](https://github.com/zakkaus) based on [gentoo-asahi-releng](https://github.com/chadmed/gentoo-asahi-releng)
>   - **Features**: systemd + KDE Plasma desktop, Audio and Wi-Fi, firefox-bin out of the box
>   - **Download Link**: [Google Drive](https://drive.google.com/drive/folders/1ZYGkc8uXqRFJ4jeaSbm5odeNb2qvh6CS)
>   - **Applicable Scenario**: Recommended for beginners, successfully tested on M2 MacBook
>   - If interested in building yourself, refer to [gentoo-asahi-releng](https://github.com/chadmed/gentoo-asahi-releng) project
> - **Official Version**:
>   - **Recommended**: `install-arm64-asahi-20250603.iso` (June 2025 version, tested stable)
>   - **May fail to boot**: `install-arm64-asahi-20251022.iso` (October 2025 version) might fail to boot on some devices (like M2 MacBook)
>   - **Suggestion**: If latest version fails to boot, please try 20250603 version or community build

### 0.2 Create Bootable USB

In macOS:

```bash
# View USB device name
diskutil list

# Unmount USB (Assuming /dev/disk4)
diskutil unmountDisk /dev/disk4

# Write image (Note using rdisk is faster)
sudo dd if=install-arm64-asahi-*.iso of=/dev/rdisk4 bs=4m status=progress

# Eject after completion
diskutil eject /dev/disk4
```

---

## 1. Set Up Asahi U-Boot Environment {#step-1-asahi}

### 1.1 Run Asahi Installer

Run in macOS Terminal:

```bash
curl https://alx.sh | sh
```

> **Security Tip**: Recommended to check script content at <https://alx.sh> before execution.

### 1.2 Follow Installer Steps

The installer will guide you:

1. **Choose Action**: Input `r` (Resize an existing partition to make space for a new OS)

2. **Choose Partition Space**: Decide space for Linux (Recommended at least 80 GB)
   - Can use percentage (e.g., `50%`) or absolute size (e.g., `120GB`)
   
   > **Tip**: Recommended to keep macOS partition for future firmware updates.

3. **Choose OS**: Select **UEFI environment only (m1n1 + U-Boot + ESP)**
   ```
   » OS: <Select UEFI only option>
   ```
   
   > **Official Suggestion**: Selecting UEFI only is enough, no need to install full distribution.

4. **Set Name**: Input `Gentoo` as OS name
   ```
   » OS name: Gentoo
   ```

5. **Complete Installation**: Note screen instructions, then press Enter to shut down.

### 1.3 Complete Recovery Mode Setup (Critical Step)

**Important Reboot Steps**:

1. **Wait 25 seconds** to ensure system is fully shut down
2. **Press and hold Power button** until you see "Loading startup options..." or spinning icon
3. **Release Power button**
4. Wait for volume list to appear, select **Gentoo**
5. You will see macOS Recovery screen:
   - If asked "Select a volume to recover", select your macOS volume and click Next
   - Enter macOS user password (FileVault user)
6. Follow screen instructions to complete setup

> **Troubleshooting**: If encountering boot loop or asked to reinstall macOS, please hold Power button to fully shut down, then restart from step 1. Can choose macOS boot, run `curl https://alx.sh | sh` and select `p` option to retry.

---

## 2. Boot from Live USB {#step-2-boot}

### 2.1 Connect Live USB and Boot

1. **Insert Live USB** (Can be via USB Hub or Dock)
2. **Boot Mac**
3. **U-Boot Auto Boot**:
   - If "UEFI environment only" was selected, U-Boot will automatically boot GRUB from USB
   - Wait 2 seconds for auto boot sequence
   - If multiple systems exist, might need to interrupt and manually select

> **Tip**: If manual USB boot is needed, run in U-Boot prompt:
> ```
> setenv boot_targets "usb"
> setenv bootmeths "efi"
> boot
> ```

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

> **Tip**: Apple Silicon Wi-Fi is included in kernel, should work normally. If unstable, try connecting to 2.4 GHz network.

**(Optional) SSH Remote Operation**:
```bash
passwd                     # Set root password
/etc/init.d/sshd start
ip a | grep inet          # Get IP address
```

---

## 3. Partition and Filesystem Setup {#step-3-partition}

### 3.1 Identify Disk and Partitions

> **Important Warning**: **Do NOT modify existing APFS containers, EFI partitions or Recovery partitions!** Only operate in the space reserved by Asahi installer.

View partition structure:
```bash
lsblk
blkid --label "EFI - GENTO"  # View your EFI partition
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

EFI Partition Identification (**Do NOT touch this partition!**):
```bash
livecd ~ # blkid --label "EFI - GENTO" 
/dev/nvme0n1p4  # This is EFI partition, do not touch
```


> **Suggestion**: Use `cfdisk` for partitioning, it understands Apple partition types and protects system partitions.

### 3.2 Create Root Partition

Assuming free space starts from `/dev/nvme0n1p5`:

**Method A: Simple Partition (No Encryption)**

```bash
# Use cfdisk to create new partition
cfdisk /dev/nvme0n1
```

You will see partition table similar to below:
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
4. **Write** → Input `yes` to confirm
5. **Quit** to exit

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

# Input YES to confirm, set encryption password

# Open encrypted partition
cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root

# Format
mkfs.btrfs --label root /dev/mapper/gentoo-root

# Mount
mount /dev/mapper/gentoo-root /mnt/gentoo
```

> **Why these parameters?**
> - `argon2id`: Resistant to ASIC/GPU brute force
> - `aes-xts`: M1 has AES instruction set, hardware acceleration
> - `luks2`: Better security tool

### 3.3 Mount EFI Partition

```bash
mkdir -p /mnt/gentoo/boot
mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

---

## 4. Stage3 and chroot {#step-4-stage3}

> **Follow [AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64) from here** until Kernel Installation chapter.

### 4.1 Download and Unpack Stage3

```bash
cd /mnt/gentoo

# Download latest ARM64 Desktop systemd Stage3
wget https://distfiles.gentoo.org/releases/arm64/autobuilds/current-stage3-arm64-desktop-systemd/stage3-arm64-desktop-systemd-*.tar.xz

# Unpack (Preserve attributes)
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 4.2 Configure Portage

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 4.3 Sync System Time (Important)

Before entering chroot, ensure system time is correct (Avoid compilation and SSL certificate issues):

```bash
# Sync time
chronyd -q

# Verify time is correct
date
```

> **Why sync time?**
> - Package compilation needs correct timestamps
> - SSL/TLS certificate verification relies on accurate system time
> - Incorrect time might cause emerge failure or certificate errors

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

Add or modify following content:
```conf
# vim: set language=bash;
CHOST="aarch64-unknown-linux-gnu"

# Apple Silicon optimized compilation parameters
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"

# Keep build output in English (Please keep this setting when reporting errors)
LC_MESSAGES=C

# Adjust based on hardware (e.g., M2 Max has more cores)
MAKEOPTS="-j4"

# Gentoo Mirrors (Global mirror recommended)
GENTOO_MIRRORS="http://distfiles.gentoo.org/"

# Emerge Default Options (Compile max 3 packages simultaneously)
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
# Set to your timezone (e.g., UTC or America/New_York)
ln -sf /usr/share/zoneinfo/UTC /etc/localtime
```

**Set Locale**:
```bash
# Edit locale.gen, uncomment needed locales
nano -w /etc/locale.gen
# Uncomment: en_US.UTF-8 UTF-8
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

> **Official Simplified Process**: This chapter replaces Handbook's "Kernel Installation" chapter.

### 5.1 Method A: Automated Installation (Recommended)

**Step 1: Install git**

```bash
# First sync Portage tree
emerge --sync

# Install git (Needed for downloading script)
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
- Install asahi-meta (Includes kernel, firmware, m1n1, U-Boot)
- Run `asahi-fwupdate` and `update-m1n1`
- Update system

> **If encountering USE flag conflicts**:
> Script execution might prompt USE flag changes. Solution:
> ```bash
> # When script prompts USE flag conflict, press Ctrl+C to interrupt
> # Then run:
> emerge --autounmask-write <conflicting-package>
>
> # Update config files
> etc-update
> # Select appropriate option in etc-update (Usually -3 for auto merge)
>
> # Re-run install script
> cd /tmp/asahi-gentoosupport
> ./install.sh
> ```

**Skip to Step 6 (fstab config) after script completes!**

---

### 5.2 Method B: Manual Installation (Advanced Users)

**Step 1: Install git and configure Asahi overlay**

```bash
# First sync Portage tree
emerge --sync

# Install git (For git sync)
emerge --ask dev-vcs/git

# Remove old Portage database and switch to git sync
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

# Sync all repos
emerge --sync
```

> **Mirror Note**:
> - Using GitHub mirror (as above) is usually fast enough
> - More mirror options: [Mirror List](/mirrorlist/)

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

# GRUB platform setting (Must!)
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
```

**Step 4: Configure Firmware License**

```bash
mkdir -p /etc/portage/package.license
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/firmware
```

**Step 5: Install rust-bin (Must install first!)**

```bash
emerge -q1 dev-lang/rust-bin
```

**Step 6: Install Asahi Packages**

```bash
# Install all necessary packages at once
emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

> If `etc-update` shows config file conflicts, select `-3` for auto merge.

Package Explanation:
- `rust-bin`: Needed for compiling Asahi kernel components (Must install first)
- `asahi-meta`: Includes m1n1, asahi-fwupdate, U-Boot etc. tools
- `virtual/dist-kernel:asahi`: Asahi custom kernel (Includes non-upstream patches)
- `linux-firmware`: Provides Wi-Fi etc. hardware firmware

**Step 7: Update Firmware and Bootloader**

```bash
asahi-fwupdate
update-m1n1
```

> **Important**: Must run `update-m1n1` every time kernel, U-Boot or m1n1 updates!

**Step 8: Install and Configure GRUB**

```bash
# Install GRUB
emerge -q grub:2

# Install GRUB to ESP (Note --removable flag is important!)
grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable

# Generate GRUB config
grub-mkconfig -o /boot/grub/grub.cfg
```

> **Key Points**:
> - `--removable` flag is mandatory, ensuring system can boot from ESP
> - `--boot-directory` and `--efi-directory` must both point to `/boot/`
> - Must set `GRUB_PLATFORMS="efi-64"` in make.conf

**Step 9: Update System (Optional)**

```bash
emerge --ask --update --deep --changed-use @world
```

---

### 5.3 Configure fstab

Get UUID:
```bash
blkid $(blkid --label root)       # Root partition (or /dev/mapper/gentoo-root)
blkid $(blkid --label "EFI - GENTO")     # boot partition
```

Edit `/etc/fstab`:
```bash
nano -w /etc/fstab
```

```fstab
# Root partition (Adjust based on your config)
UUID=<your-root-uuid>  /      ext4   defaults  0 1
# Or encrypted version:
# UUID=<your-btrfs-uuid>  /      btrfs  defaults  0 1

UUID=<your-boot-uuid>  /boot  vfat   defaults  0 2
```

### 5.4 Configure Encryption Support (Encrypted Users Only)

> **Note**: Only execute this step if you selected encrypted partition in Step 3.2.

**Step 1: Enable systemd cryptsetup support**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Recompile systemd to enable cryptsetup support
emerge --ask --oneshot sys-apps/systemd
```

**Step 2: Get LUKS Partition UUID**

```bash
# Get LUKS encrypted container UUID (Not filesystem UUID inside)
blkid /dev/nvme0n1p5
```

Output Example:
```
/dev/nvme0n1p5: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```

Note down this **LUKS UUID** (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

**Step 3: Configure GRUB Kernel Parameters**

```bash
nano -w /etc/default/grub
```

Add or modify following content (**Replace UUID with actual value**):
```conf
# Full Example (Replace UUID with your actual UUID)
GRUB_CMDLINE_LINUX="rd.luks.uuid=3f5a6527-7334-4363-9e2d-e0e8c7c04488 rd.luks.allow-discards root=UUID=f3db74a5-dc70-48dd-a9a3-797a0daf5f5d rootfstype=btrfs"
```

> **Parameter Explanation**:
> - `rd.luks.uuid=<UUID>`: LUKS encrypted partition UUID (Get via `blkid /dev/nvme0n1p6`)
> - `rd.luks.allow-discards`: Allow SSD TRIM commands to pass through encryption layer (Improve SSD performance)
> - `root=UUID=<UUID>`: Decrypted btrfs filesystem UUID (Get via `blkid /dev/mapper/gentoo-root`)
> - `rootfstype=btrfs`: Root filesystem type (If using ext4 change to `ext4`)

**Step 4: Install and Configure dracut**

```bash
# Install dracut (If not installed)
emerge --ask sys-kernel/dracut
```

**Step 5: Configure dracut for LUKS Decryption**

Create dracut config file:
```bash
nano -w /etc/dracut.conf.d/luks.conf
```

Add following content:
```conf
# Do not set kernel_cmdline here, GRUB will override it
kernel_cmdline=""
# Add necessary modules to support LUKS + btrfs
add_dracutmodules+=" btrfs systemd crypt dm "
# Add necessary tools
install_items+=" /sbin/cryptsetup /bin/grep "
# Specify filesystem (Modify if using other filesystem)
filesystems+=" btrfs "
```

> **Config Explanation**:
> - `crypt` and `dm` modules provide LUKS decryption support
> - `systemd` module used for systemd boot environment
> - `btrfs` module supports btrfs filesystem (If using ext4 change to `ext4`)

**Step 6: Configure /etc/crypttab (Optional but Recommended)**

```bash
nano -w /etc/crypttab
```

Add following content (**Replace UUID with your LUKS UUID**):
```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

> With this config, system will automatically identify and prompt to unlock encrypted partition.

**Step 7: Regenerate initramfs**

```bash
# Get current kernel version
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

> **Important**: After every kernel update, also need to re-run this command to generate new initramfs!
