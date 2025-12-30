---
title: "Install Gentoo Linux on Apple Silicon Mac (M1/M2 Guide)"
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
summary: "Complete guide to installing native Gentoo Linux on Apple Silicon (M1/M2) Macs, including dual boot, Asahi support, and desktop configuration."
description: "A comprehensive tutorial for installing Gentoo Linux on Apple Silicon M1/M2 Macs using the official Asahi Linux bootloader method, covering partitioning, base system, and desktop setup."
keywords:
  - Gentoo Linux
  - Apple Silicon
  - M1 Mac
  - M2 Mac
  - Asahi Linux
  - ARM64
tags:
  - Gentoo
  - Apple Silicon
  - Asahi
  - ARM64
---

![Gentoo on Apple Silicon Mac](gentoo-asahi-mac.webp)

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Introduction**

This guide will walk you through installing native ARM64 Gentoo Linux on Apple Silicon Mac (**M1/M2 Series**).

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid rgb(239, 68, 68); margin: 1rem 0;">

**⚠️ Important: Hardware Compatibility**

**Supported Devices**: M1 and M2 series MacBooks (Pro, Air, Mac Mini etc.)

**Not Supported Yet**: M3, M4, M5 series chips are currently not supported, please wait for Asahi Linux project updates.

</div>

**Important Update**: Thanks to the excellent work of the Asahi Linux project team (especially [chadmed](https://github.com/chadmed/gentoo-asahi-releng)), we now have an [Official Gentoo Asahi Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide), and the installation process has been greatly simplified.

**Guide Features**:
*   Based on latest official process (2025.10)
*   Uses official Gentoo Asahi Live USB (No Fedora dependency)
*   clearly marks optional vs required steps
*   Simplified version suitable for everyone (includes encryption option)

Verified up to November 20, 2025.

**Target Platform**: Apple Silicon Mac (**M1/M2 Series**) ARM64 architecture. This guide uses Asahi Linux bootloader for initial setup, then converts to a full Gentoo environment.

</div>

---

## Installation Overview (Simplified)

**Required Steps**:
1. Download Official Gentoo Asahi Live USB Image
2. Setup U-Boot environment via Asahi Installer
3. Boot from Live USB
4. Partition disk and mount filesystems
5. Unpack Stage3 and enter chroot
6. Install Asahi support packages (Automated script)
7. Reboot to finish installation

**Optional Steps**:
- LUKS Encryption (Recommended but optional)
- Custom Kernel Config (Default dist-kernel is fine)
- Audio Setup (PipeWire, as needed)
- Desktop Environment Selection

The entire process creates a dual-boot environment on your Mac: macOS + Gentoo Linux ARM64.

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Official Simplification**

You can now use [asahi-gentoosupport automated script](https://github.com/chadmed/asahi-gentoosupport) to complete most configurations!

</div>

---

## Prerequisites and Notes {#prerequisites}

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

### Hardware Requirements

*   Apple Silicon Mac (**M1/M2 Series only, M3/M4/M5 not supported yet**)
*   At least 80 GB available disk space (Recommended 120 GB+)
*   Stable Network Connection (Wi-Fi or Ethernet)
*   Backup all important data

### Important Warning

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1rem 0;">

**This guide involves advanced operations**:
*   Will modify your partition table
*   Requires coexistence with macOS
*   Involves encrypted disk operations
*   Apple Silicon support for Linux is still under active development

</div>

**Known Working Features**:
*   CPU, Memory, Storage
*   Wi-Fi (via Asahi Linux firmware)
*   Keyboard, Trackpad, Battery management
*   Display Output (Internal & External)
*   USB-C / Thunderbolt

**Known Limitations**:
*   Touch ID not working
*   macOS virtualization Limited
*   Some new hardware features might not be fully supported
*   GPU acceleration is under development (OpenGL partially supported)

</div>

---

## 0. Prepare Gentoo Asahi Live USB {#step-0-prepare}

### 0.1 Download Official Gentoo Asahi Live USB

**Official Simplified Process**: Use Gentoo provided ARM64 Live USB directly, no need for Fedora!

Download latest version:
```bash
# Method 1: Author site download
https://chadmed.au/pub/gentoo/
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Official is integrating Asahi support into standard Live USB. Currently using version maintained by chadmed.

</div>

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Mirror Version Compatibility Info (Updated: 2025-11-21)**

- **Official Version**:
  - **Recommended**: `install-arm64-asahi-20250603.iso` (June 2025, tested stable)
  - **May not boot**: `install-arm64-asahi-20251022.iso` (October 2025) may fail to boot on some devices (e.g. M2 MacBook)
  - **Suggestion**: If latest version fails to boot, try 20250603.

</div>

### 0.2 Create Bootable USB

In macOS:

```bash
# Check USB device name
diskutil list

# Unmount USB (Assuming /dev/disk4)
diskutil unmountDisk /dev/disk4

# Write image (Note: using rdisk is faster)
sudo dd if=install-arm64-asahi-*.iso of=/dev/rdisk4 bs=4m status=progress

# Eject after finish
diskutil eject /dev/disk4
```

---

## 1. Set Asahi U-Boot Environment {#step-1-asahi}

### 1.1 Run Asahi Installer

Run in macOS Terminal:

```bash
curl https://alx.sh | sh
```

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Security Tip**

Recommended to check script content at <https://alx.sh> before running.

</div>

### 1.2 Follow Installer Steps

The installer will guide you:

1. **Choose Action**: Input `r` (Resize an existing partition to make space for a new OS)

2. **Choose Partition Size**: Decide space for Linux (Recommended at least 80 GB)
   - Can use percentage (e.g. `50%`) or absolute size (e.g. `120GB`)
   
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

Choosing UEFI only is sufficient, no need to install full distribution.

</div>

4. **Set Name**: Input `Gentoo` as OS name
   ```
   » OS name: Gentoo
   ```

5. **Finish Installation**: Note screen instructions, then Press Enter to shutdown.

### 1.3 Complete Recovery Mode Setup (Critical Step)

**Important Reboot Steps**:

1. **Wait 25 seconds** to ensure system is fully off.
2. **Press and HOLD power button** until you see "Loading startup options..." or spinning icon.
3. **Release power button**.
4. Wait for volume list, select **Gentoo**.
5. You will see macOS Recovery screen:
   - If asked "Select a volume to recover", select your macOS volume and click Next.
   - Enter macOS user password (FileVault users).
6. Follow screen instructions to complete setup.

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Troubleshooting**

If encountering boot loop or asked to reinstall macOS, press and hold power button to force shutdown, then start from step 1 again. Can choose macOS boot, run `curl https://alx.sh | sh` and select `p` option to retry.

</div>

---

## 2. Boot from Live USB {#step-2-boot}

### 2.1 Connect Live USB and Boot

1. **Insert Live USB** (Can use USB Hub or Dock)
2. **Boot Mac**
3. **U-Boot Auto Boot**:
   - If "UEFI environment only" was chosen, U-Boot will automatically boot GRUB from USB
   - Wait 2 seconds for auto boot sequence
   - If multiple systems exist, might need to interrupt and manually select

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

If you need to manually specify USB boot, run in U-Boot prompt:

```bash
setenv boot_targets "usb"
setenv bootmeths "efi"
boot
```

</div>

### 2.2 Configure Network (Live Environment)

Gentoo Live USB built-in network tool:

**Wi-Fi Connection**:
```bash
net-setup
```

Follow interactive prompts. Check after completion:

```bash
ping -c 3 www.gentoo.org
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Apple Silicon Wi-Fi is included in kernel and should work. If unstable, try 2.4 GHz network.

</div>

**SSH Remote (Optional)**:
```bash
passwd                     # Set root password
/etc/init.d/sshd start
ip a | grep inet          # Get IP address
```

---

## 3. Partitioning and Filesystem Setup {#step-3-partition}

### 3.1 Identify Disk and Partitions

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important Warning**

**Do NOT modify existing APFS container, EFI partition or Recovery partition!** Only operate in the space reserved by Asahi installer.

</div>

Check partition structure:
```bash
lsblk
blkid --label "EFI - GENTO"  # Check your EFI partition
```

Usually you see:
```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
nvme0n1     259:0    0 465.9G  0 disk 
|-nvme0n1p1 259:1    0   500M  0 part 
|-nvme0n1p2 259:2    0 307.3G  0 part 
|-nvme0n1p3 259:3    0   2.3G  0 part 
|-nvme0n1p4 259:4    0   477M  0 part 
`-nvme0n1p5 259:5    0     5G  0 part 
```

EFI Partition ID (**Do NOT touch this partition!**):
```bash
livecd ~ # blkid --label "EFI - GENTO" 
/dev/nvme0n1p4  # This is EFI partition
```


<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Recommendation**

Use `cfdisk` for partitioning, it understands Apple partition types and protects system partitions.

</div>

### 3.2 Create Root Partition

Assuming free space starts from `/dev/nvme0n1p5`:

**Method A: Simple Partition (No Encryption)**

```bash
# Use cfdisk to create new partition
cfdisk /dev/nvme0n1
```

Steps:
1. Select **Free space** → **New**
2. Use all space (or custom size)
3. **Type** → Select **Linux filesystem**
4. **Write** → Input `yes`
5. **Quit**

**Format Partition**:
```bash
# Format as ext4 or btrfs
mkfs.ext4 /dev/nvme0n1p6
# OR
mkfs.btrfs /dev/nvme0n1p6

# Mount
mount /dev/nvme0n1p6 /mnt/gentoo
```

**Method B: Encrypted Partition (Optional, Recommended)**

```bash
# Create LUKS2 encrypted partition
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6

# Type YES to confirm, set password

# Open encrypted partition
cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root

# Format
mkfs.btrfs --label root /dev/mapper/gentoo-root

# Mount
mount /dev/mapper/gentoo-root /mnt/gentoo
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Why these parameters?**

*   `argon2id`: Resistant to ASIC/GPU brute force
*   `aes-xts`: M1 has AES instructions, hardware accelerated
*   `luks2`: Better security tools

</div>

### 3.3 Mount EFI Partition

```bash
mkdir -p /mnt/gentoo/boot
mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

---

## 4. Stage3 and Chroot {#step-4-stage3}

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Follow [AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64) from here** until Kernel Installation chapter.

</div>

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

Before chroot, ensure time is correct:

```bash
# Sync time
chronyd -q

# Verify
date
```

### 4.4 Enter Chroot Environment

**Mount filesystems**:
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

### 4.5 Base System Configuration

**Configure make.conf** (Optimized for Apple Silicon):

Edit `/etc/portage/make.conf`:
```bash
nano -w /etc/portage/make.conf
```

Add/Modify:
```conf
# vim: set language=bash;
CHOST="aarch64-unknown-linux-gnu"

# Apple Silicon Optimized Flags
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"

# Keep output in English
LC_MESSAGES=C

# Adjust for hardware (e.g. M2 Max has more cores)
MAKEOPTS="-j4"

# Gentoo Mirror (Recommended R2 mirror for speed)
GENTOO_MIRRORS="https://gentoo.rgst.io/gentoo"

# Emerge defaults
EMERGE_DEFAULT_OPTS="--jobs 3"

# Asahi GPU Driver
VIDEO_CARDS="asahi"

# Localization
L10N="zh-CN zh-TW zh en"

# Keep newline at end of file!
```

**Sync Portage**:
```bash
emerge-webrsync
```

**Set Timezone**:
```bash
# Set timezone (e.g. Taipei)
ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime
```

**Set Locale**:
```bash
nano -w /etc/locale.gen
# Uncomment: en_US.UTF-8 UTF-8
# Uncomment: zh_CN.UTF-8 UTF-8 (If needed)

locale-gen
eselect locale set en_US.utf8
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

**Create User and Password**:
```bash
useradd -m -G wheel,audio,video,usb,input <username>
passwd <username>
passwd root
```

---

## 5. Install Asahi Support Packages (Core) {#step-5-asahi}

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Official Simplified Process**

This chapter replaces Handbook's "Kernel Installation".

</div>

### 5.1 Method A: Automated Install (Recommended)

**Step 1: Install git**

```bash
emerge --sync
emerge --ask dev-vcs/git
```

**Step 2: Use asahi-gentoosupport script**:

```bash
cd /tmp
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

This script automatically:
- Enables Asahi overlay
- Installs GRUB bootloader
- Sets VIDEO_CARDS="asahi"
- Installs asahi-meta (Kernel, Firmware, m1n1, U-Boot)
- Runs `asahi-fwupdate` and `update-m1n1`
- Updates system

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**If USE flag conflicts**

If triggered:
```bash
# Ctrl+C
emerge --autounmask-write <package>
etc-update # Select -3
cd /tmp/asahi-gentoosupport
./install.sh
```

</div>

**After script finishes, jump to Step 5.3 (fstab)!**

---

### 5.2 Method B: Manual Install (Advanced)

**Step 1: Install git and set Asahi overlay**

```bash
emerge --sync
emerge --ask dev-vcs/git

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

sudo tee /etc/portage/repos.conf/asahi.conf << 'EOF'
[asahi]
location = /var/db/repos/asahi
sync-type = git
sync-uri = https://github.com/chadmed/asahi-overlay.git
auto-sync = yes
EOF

emerge --sync
```

**Step 2: Mask upstream dist-kernel**

```bash
mkdir -p /etc/portage/package.mask
cat > /etc/portage/package.mask/asahi << 'EOF'
# Mask the upstream dist-kernel virtual
virtual/dist-kernel::gentoo
EOF
```

**Step 3: package.use**

```bash
mkdir -p /etc/portage/package.use
cat > /etc/portage/package.use/asahi << 'EOF'
dev-lang/rust-bin rustfmt rust-src
dev-lang/rust rustfmt rust-src
EOF

echo 'VIDEO_CARDS="asahi"' >> /etc/portage/make.conf
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
```

**Step 4: Firmware License**

```bash
mkdir -p /etc/portage/package.license
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/firmware
```

**Step 5: Install rust-bin (First)**

```bash
emerge -q1 dev-lang/rust-bin
```

**Step 6: Install Asahi Packages**

```bash
emerge -q sys-apps/asahi-meta virtual/dist-kernel:asahi sys-kernel/linux-firmware
```

**Step 7: Update Firmware and Bootloader**

```bash
asahi-fwupdate
update-m1n1
```

**Step 8: Install GRUB**

```bash
emerge -q grub:2
grub-install --boot-directory=/boot/ --efi-directory=/boot/ --removable
grub-mkconfig -o /boot/grub/grub.cfg
```

**Step 9: Update System**
```bash
emerge --ask --update --deep --changed-use @world
```

---

### 5.3 Configure fstab

Get UUIDs:
```bash
blkid $(blkid --label root)       # Root partition (or /dev/mapper/gentoo-root)
blkid $(blkid --label "EFI - GENTO")     # Boot partition
```

Edit `/etc/fstab`:
```bash
nano -w /etc/fstab
```

```fstab
# Root Partition (Adjust as needed)
UUID=<your-root-uuid>  /      ext4   defaults  0 1
# Or Encrypted Btrfs:
# UUID=<your-btrfs-uuid>  /      btrfs  defaults  0 1

UUID=<your-boot-uuid>  /boot  vfat   defaults  0 2
```

### 5.4 Configure Encryption Support (Encrypted Users Only)

<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(245, 158, 11); margin: 1.5rem 0;">

**Note**

Perform this step ONLY if you chose Encrypted Partition in Step 3.2.

</div>

**Step 1: Enable systemd cryptsetup support**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Rebuild systemd to enable cryptsetup
emerge --ask --oneshot sys-apps/systemd
```

**Step 2: Get LUKS Partition UUID**

```bash
# Get UUID of LUKS container (Not the filesystem inside)
blkid /dev/nvme0n1p6
```

Example Output:
```
/dev/nvme0n1p6: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```
Note down this **LUKS UUID**.

**Step 3: Configure GRUB Kernel Args**

```bash
nano -w /etc/default/grub
```

Add/Modify (Replace UUID with actual values):
```conf
GRUB_CMDLINE_LINUX="rd.luks.uuid=a1b2c3d4-e5f6-7890-abcd-ef1234567890 rd.luks.allow-discards root=UUID=f3db74a5-dc70-48dd-a9a3-797a0daf5f5d rootfstype=btrfs"
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Parameter Explanation**

- `rd.luks.uuid=<UUID>`: UUID of LUKS container
- `rd.luks.allow-discards`: Allow SSD TRIM pass-through
- `root=UUID=<UUID>`: UUID of decrypted filesystem (e.g. btrfs inside mapper)
- `rootfstype=btrfs`: Root filesystem type

</div>

**Step 4: Configure Dracut for LUKS**

Install dracut:
```bash
emerge --ask sys-kernel/dracut
```

Create config `/etc/dracut.conf.d/luks.conf`:
```conf
# Do not set kernel_cmdline here, GRUB handles it
kernel_cmdline=""
# Add modules for LUKS + Filesystem
add_dracutmodules+=" btrfs systemd crypt dm "
# Add tools
install_items+=" /sbin/cryptsetup /bin/grep "
# Filesystem
filesystems+=" btrfs "
```

**Step 5: Configure /etc/crypttab (Optional)**

```bash
nano -w /etc/crypttab
```
Content:
```conf
gentoo-root UUID=<LUKS-UUID> none luks,discard
```

**Step 6: Regenerate initramfs**

```bash
# Get current kernel version
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important**

Must regenerate initramfs after every kernel update!

</div>

**Step 7: Update GRUB**

```bash
grub-mkconfig -o /boot/grub/grub.cfg
grep initrd /boot/grub/grub.cfg  # Verify initrd is referenced
```

---

## 6. Finalize and Reboot {#step-6-finalize}

### 6.1 Final Setup

**Hostname**:
```bash
echo "macbook" > /etc/hostname
```

**Enable NetworkManager**:
```bash
systemctl enable NetworkManager
```

**Root Password**:
```bash
passwd root
```

### 6.2 Exit Chroot and Reboot

```bash
exit
umount -R /mnt/gentoo
# If encrypted:
cryptsetup luksClose gentoo-root

reboot
```

### 6.3 First Boot

1. U-Boot auto starts
2. GRUB menu appears, select Gentoo
3. (If encrypted) Enter LUKS password
4. System should boot to login prompt

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(34, 197, 94); margin: 1.5rem 0;">

**Congratulations! Base system installed!**

</div>

---

## 7. Post-Installation (Optional) {#step-7-post}

### 7.1 Networking

```bash
# Wi-Fi
nmcli device wifi connect <SSID> password <PASSWORD>
# Or UI
nmtui
```

### 7.2 Install Desktop Environment

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Important**

Switch to appropriate system profile BEFORE installing desktop!

</div>

**Step 1: Select Profile**

```bash
eselect profile list
```

Choose:
```bash
# GNOME
eselect profile set 5    # desktop/gnome/systemd

# KDE Plasma (Recommended)
eselect profile set 7    # desktop/plasma/systemd

# Generic Xfce
eselect profile set 3    # desktop
```

**Step 2: Update System**

```bash
emerge -avuDN @world
```

**Step 3: Install Desktop**

**Option A: KDE Plasma (Recommended)**
```bash
emerge --ask kde-plasma/plasma-meta kde-apps/kate kde-apps/dolphin
systemctl enable sddm
```

**Option B: GNOME**
```bash
emerge --ask gnome-base/gnome gnome-extra/gnome-tweaks
systemctl enable gdm
```

**Step 4: Optimize Performance**

**Video Acceleration**:
```bash
emerge --ask media-libs/mesa  # Asahi drivers included
```

**Fonts**:
```bash
emerge --ask media-fonts/noto media-fonts/noto-cjk
```

**Input Method**:
```bash
emerge --ask app-i18n/fcitx-chinese-addons
```

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem; margin: 1.5rem 0;">

**Tip**

Desktop installation takes 2-4 hours. Use `--jobs 3` to avoid OOM.

</div>

### 7.3 Audio Setup

Install Asahi audio support:

```bash
emerge --ask media-libs/asahi-audio
systemctl --user enable --now pipewire-pulse.service
systemctl --user enable --now wireplumber.service
```

---

## 8. System Maintenance {#step-8-maintenance}

### 8.1 Regular Updates

```bash
emerge --sync  # Syncs Asahi overlay too
emerge -avuDN @world
emerge --depclean
```

### 8.2 After Kernel Update (CRITICAL)

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid rgb(239, 68, 68); margin: 1.5rem 0;">

**Must Run Every Time Kernel Updates!**

</div>

```bash
# Update m1n1 Stage 2 (Device Tree)
update-m1n1

# Regenerate GRUB
grub-mkconfig -o /boot/grub/grub.cfg
```

**Why?** m1n1 needs updated devicetrees to boot new kernel properly.

### 8.3 Firmware Updates

Keep macOS partition to receive Apple firmware updates.

---

## 9. FAQ {#faq}

**Q: Cannot boot from USB?**
A: Try USB 2.0 drive or valid USB Hub. U-Boot USB support is limited.

**Q: Black screen on boot?**
A: Mismatch between m1n1/U-Boot/Kernel. Re-run `update-m1n1` in chroot. Or retry Asahi Installer `p` option.

**Q: Wi-Fi unstable?**
A: Use 5GHz or 2.4GHz, avoid 6GHz / WPA3 if possible.

**Q: Touchpad not working?**
A: Check firmware (`dmesg | grep firmware`) and ensure `asahi-meta` is installed.

---

## 10. Advanced Tips {#advanced}

### 10.1 Notch Setup

Enable notch area:
```bash
# Add to GRUB CMDLINE
apple_dcp.show_notch=1
```

### 10.2 Custom Kernel

Use `sys-kernel/asahi-sources`.
```bash
emerge --ask sys-kernel/asahi-sources
make menuconfig
make && make modules_install && make install
update-m1n1
grub-mkconfig ...
```

### 10.3 Multi-Kernel

```bash
eselect kernel set <num>
update-m1n1
```

---

## 11. References {#reference}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">

<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Official Docs

*   **[Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)**
*   [Asahi Linux Official Site](https://asahilinux.org/)

</div>

<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Tools

*   [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport)
*   [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng)

</div>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 1.5rem; border-radius: 0.75rem;">

### Community Support

*   IRC: `#gentoo` and `#asahi` @ Libera.Chat
*   Telegram: [@gentoo_zh](https://t.me/gentoo_zh)

</div>

</div>

## Conclusion

<div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 2rem; border-radius: 1rem; margin: 1.5rem 0; text-align: center;">

### Enjoy Gentoo on Apple Silicon!

Simplified guide based on official Project:Asahi.

**Key Points**:
1. Use automated install script
2. `update-m1n1` after kernel update
3. Have fun!

</div>
