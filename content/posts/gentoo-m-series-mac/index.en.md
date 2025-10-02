---
slug: gentoo-m-series-mac-arm64
title: "Gentoo ARM64 Installation Guide: Apple Silicon (M-series) Mac"
date: 2025-10-02
tags: ["Gentoo","Linux","ARM64","Apple Silicon","M1","M2","M3","Asahi Linux"]
categories: ["Linux Notes"]
draft: false
description: "Complete guide to installing Gentoo Linux ARM64 on Apple Silicon Mac (M1/M2/M3): Native ARM64 Linux via Asahi Linux bootloader."
ShowToc: false
TocOpen: false
translationKey: "gentoo-m-series-mac-arm64"
authors:
   - "Zakk"
seo:
   description: "Complete Gentoo Linux ARM64 installation guide for Apple Silicon Mac (M1/M2/M3/M4), covering Asahi Linux boot, LUKS encryption, Stage3 extraction, kernel compilation, and desktop environment setup."
   keywords:
      - "Gentoo ARM64"
      - "Apple Silicon"
      - "M1 Mac Gentoo"
      - "M2 Mac Linux"
      - "M3 Mac Installation"
      - "Asahi Linux"
      - "ARM64 Linux"
      - "Zakk Blog"
---

{{< lead >}}
This guide will walk you through installing native ARM64 Gentoo Linux on Apple Silicon Mac (M1/M2/M3/M4).

**Important Update**: Thanks to the excellent work of the Asahi Linux project team (especially [chadmed](https://wiki.gentoo.org/index.php?title=User:Chadmed&action=edit&redlink=1)), there is now an [official Gentoo Asahi installation guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide), and the installation process has been significantly simplified.

**This guide features**:
- ✅ Based on the latest official process (2025.10)
- ✅ Uses official Gentoo Asahi Live USB (no Fedora intermediate required)
- ✅ Clearly marks optional and required steps
- ✅ Simplified version suitable for everyone (includes encryption options)

Verified as of October 2025.
{{< /lead >}}

> **Target Platform**: Apple Silicon Mac (M1/M2/M3/M4) ARM64 architecture. This guide uses the Asahi Linux bootloader for initial setup, then transitions to a complete Gentoo environment.

---

## Installation Process Overview (Simplified Version)

**Required Steps**:
1. Download official Gentoo Asahi Live USB image
2. Set up U-Boot environment via Asahi installer
3. Boot from Live USB
4. Partition disk and mount filesystems
5. Extract Stage3 and enter chroot
6. Install Asahi support packages (automated script)
7. Reboot to complete installation

**Optional Steps**:
- 🔐 LUKS encryption (recommended but not required)
- 🎨 Custom kernel configuration (default dist-kernel works)
- 🎵 Audio setup (PipeWire, as needed)
- 🖥️ Desktop environment selection

The entire process will create a dual-boot environment on your Mac: macOS + Gentoo Linux ARM64.

> **Official Simplification**: You can now use the [asahi-gentoosupport automation script](https://github.com/chadmed/asahi-gentoosupport) to complete most of the configuration!

---

## Prerequisites and Precautions {#prerequisites}

### Hardware Requirements

- Apple Silicon Mac (M1/M2/M3/M4 series chips)
- At least 80 GB of free disk space (120 GB+ recommended)
- Stable network connection (Wi-Fi or Ethernet)
- Backup all important data

### Important Warnings

⚠️ **This guide involves advanced operations**:
- Will modify your partition table
- Requires coexistence with macOS
- Involves encrypted disk operations
- Apple Silicon support for Linux is still under active development

✅ **Known working features**:
- CPU, memory, storage devices
- Wi-Fi (via Asahi Linux firmware)
- Keyboard, trackpad, battery management
- Display output (built-in screen and external monitors)
- USB-C / Thunderbolt

⚠️ **Known limitations**:
- Touch ID unavailable
- macOS virtualization features limited
- Some new hardware features may not be fully supported
- GPU acceleration still in development (partial OpenGL support)

---

## 0. Prepare Gentoo Asahi Live USB {#step-0-prepare}

### 0.1 Download Official Gentoo Asahi Live USB

**Official simplified process**: Use Gentoo-provided ARM64 Live USB directly, no Fedora intermediate required!

Download the latest version:
```bash
# Method 1: Download from official temporary site (before official release)
https://chadmed.au/pub/gentoo/

# Method 2: (After official release)
# Visit https://www.gentoo.org/downloads/ and download ARM64 Asahi version
```

> 💡 **Tip**: The official team is integrating Asahi support into the standard Live USB. Currently using the chadmed-maintained version.

### 0.2 Create Bootable USB

In macOS:

```bash
# Check USB device name
diskutil list

# Unmount USB (assuming /dev/disk4)
diskutil unmountDisk /dev/disk4

# Write image (note using rdisk is faster)
sudo dd if=install-arm64-asahi-*.iso of=/dev/rdisk4 bs=4m status=progress

# Eject when complete
diskutil eject /dev/disk4
```

---

## 1. Set Up Asahi U-Boot Environment {#step-1-asahi}

### 1.1 Run Asahi Installer

In macOS Terminal, execute:

```bash
curl https://alx.sh | sh
```

> ⚠️ **Security Note**: It's recommended to visit <https://alx.sh> first to review the script content before executing.

### 1.2 Follow Installer Steps

The installer will guide you through:

1. **Select action**: Enter `r` (Resize an existing partition to make space for a new OS)

2. **Select partition space**: Decide how much space to allocate for Linux (at least 80 GB recommended)
   - Can use percentage (e.g., `50%`) or absolute size (e.g., `120GB`)
   
   > 💡 **Tip**: Keep the macOS partition for future firmware updates.

3. **Select operating system**: Choose **UEFI environment only (m1n1 + U-Boot + ESP)**
   ```
   » OS: <Select UEFI only option>
   ```
   
   > ✅ **Official recommendation**: UEFI only is sufficient, no need to install a complete distribution.

4. **Set name**: Enter `Gentoo` as the operating system name
   ```
   » OS name: Gentoo
   ```

5. **Complete installation**: Note the on-screen instructions, then press Enter to shut down.

### 1.3 Complete Recovery Mode Setup (Critical Step)

**Important restart steps**:

1. **Wait 25 seconds** to ensure system fully shuts down
2. **Press and hold power button** until you see "Loading startup options..." or spinning icon
3. **Release power button**
4. Wait for volume list to appear, select **Gentoo**
5. You'll see the macOS Recovery screen:
   - If prompted "Select a volume to recover", select your macOS volume and click Next
   - Enter macOS user password (FileVault user)
6. Follow on-screen instructions to complete setup

> ⚠️ **Troubleshooting**: If you encounter boot loops or are asked to reinstall macOS, press and hold the power button to fully shut down, then start over from step 1. You can boot into macOS, run `curl https://alx.sh | sh` and select the `p` option to retry.

---

## 2. Boot from Live USB {#step-2-boot}

### 2.1 Connect Live USB and Boot

1. **Insert Live USB** (via USB Hub or Dock)
2. **Start Mac**
3. **U-Boot auto-boots**:
   - If "UEFI environment only" was selected, U-Boot will automatically boot GRUB from USB
   - Wait 2 seconds for automatic boot sequence
   - If there are multiple systems, you may need to interrupt and manually select

> 💡 **Tip**: If you need to manually specify USB boot, execute at the U-Boot prompt:
> ```
> setenv boot_targets "usb"
> setenv bootmeths "efi"
> boot
> ```

### 2.2 Configure Network (Live Environment)

Gentoo Live USB includes network tools:

**Wi-Fi connection**:
```bash
net-setup
```

Follow the interactive prompts to configure network. Check when complete:

```bash
ping -c 3 www.gentoo.org
```

> 💡 **Tip**: Apple Silicon Wi-Fi is included in the kernel and should work normally. If unstable, try connecting to a 2.4 GHz network.

**(Optional) SSH remote access**:
```bash
passwd                     # Set root password
/etc/init.d/sshd start
ip a | grep inet          # Get IP address
```

---

## 3. Partitioning and Filesystem Setup {#step-3-partition}

### 3.1 Identify Disks and Partitions

> ⚠️ **Important Warning**: **Do not modify existing APFS containers, EFI partitions, or Recovery partitions!** Only operate in the space reserved by the Asahi installer.

Check partition structure:
```bash
lsblk
blkid --label "EFI - GENTO"  # Check your EFI partition
```

You'll typically see:
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

EFI partition identification (**Do not touch this partition!**):
```bash
livecd ~ # blkid --label "EFI - GENTO" 
/dev/nvme0n1p4  # This is EFI partition, do not modify
```


> 💡 **Recommendation**: Use `cfdisk` for partitioning, it understands Apple partition types and will protect system partitions.

### 3.2 Create Root Partition

Assuming free space starts at `/dev/nvme0n1p5`:

**Method A: Simple Partitioning (No Encryption)**

```bash
# Use cfdisk to create new partition
cfdisk /dev/nvme0n1
```

You'll see a partition table similar to:
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

Operation steps:
1. Select **Free space** → **New**
2. Use all space (or customize size)
3. **Type** → Select **Linux filesystem**
4. **Write** → Enter `yes` to confirm
5. **Quit** to exit

**Format partition**:
```bash
# Format as ext4 or btrfs
mkfs.ext4 /dev/nvme0n1p6
# or
mkfs.btrfs /dev/nvme0n1p6

# Mount
mount /dev/nvme0n1p6 /mnt/gentoo
```

**Method B: Encrypted Partition (🔐 Optional, Recommended)**

```bash
# Create LUKS2 encrypted partition
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p6

# Enter YES to confirm, set encryption password

# Open encrypted partition
cryptsetup luksOpen /dev/nvme0n1p6 gentoo-root

# Format
mkfs.btrfs --label root /dev/mapper/gentoo-root

# Mount
mount /dev/mapper/gentoo-root /mnt/gentoo
```

> 💡 **Why these parameters?**
> - `argon2id`: Resistant to ASIC/GPU brute-force attacks
> - `aes-xts`: M1 has AES instruction set, hardware acceleration
> - `luks2`: Better security tools

### 3.3 Mount EFI Partition

```bash
mkdir -p /mnt/gentoo/boot
mount /dev/nvme0n1p4 /mnt/gentoo/boot
```

---

## 4. Stage3 and chroot {#step-4-stage3}

> 💡 **From here, follow the [AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64)** until the kernel installation chapter.

### 4.1 Download and Extract Stage3

```bash
cd /mnt/gentoo

# Download latest ARM64 Desktop systemd Stage3
wget https://distfiles.gentoo.org/releases/arm64/autobuilds/current-stage3-arm64-desktop-systemd/stage3-arm64-desktop-systemd-*.tar.xz

# Extract (preserve attributes)
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 4.2 Configure Portage

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

### 4.3 Enter chroot Environment

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

### 4.4 Basic System Configuration

**Configure make.conf** (optimized for Apple Silicon):

Edit `/etc/portage/make.conf`:
```bash
nano -w /etc/portage/make.conf
```

Add or modify the following content:
```conf
# Apple Silicon optimized compilation parameters
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
MAKEOPTS="-j8"  # Adjust based on your core count (M1 Pro/Max can use -j10 or higher)
LC_MESSAGES=C

# Asahi-specific settings
VIDEO_CARDS="asahi"
EMERGE_DEFAULT_OPTS="--jobs 3"
GENTOO_MIRRORS="https://gentoo.rgst.io/gentoo"
```

**Sync Portage**:
```bash
emerge-webrsync
```

**Set timezone**:
```bash
# Set to Taiwan timezone (or change to your timezone)
ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime
```

**Set locale**:
```bash
# Edit locale.gen, uncomment needed locales
nano -w /etc/locale.gen
# Uncomment: en_US.UTF-8 UTF-8
# Uncomment: zh_TW.UTF-8 UTF-8 (if Chinese needed)

# Generate locales
locale-gen

# Select system default locale
eselect locale set en_US.utf8

# Reload environment
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

**Create user and set passwords**:
```bash
# Create user (replace <username> with your username)
useradd -m -G wheel,audio,video,usb,input <username>

# Set user password
passwd <username>

# Set root password
passwd root
```

---

## 5. Install Asahi Support Packages (Core Step) {#step-5-asahi}

> 🚀 **Official simplified process**: This chapter replaces the Handbook's "Installing the Kernel" chapter.

### 5.1 Method A: Automated Installation (✅ Recommended)

**Use asahi-gentoosupport script** (officially provided):

```bash
cd /tmp
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

This script automatically completes:
- ✅ Enable Asahi overlay
- ✅ Install GRUB bootloader
- ✅ Set VIDEO_CARDS="asahi"
- ✅ Install asahi-meta (includes kernel, firmware, m1n1, U-Boot)
- ✅ Run `asahi-fwupdate` and `update-m1n1`
- ✅ Update system

**After script completes, jump directly to step 5.3 (fstab configuration)!**

---

### 5.2 Method B: Manual Installation (Advanced Users)

**Step 1: Enable Asahi overlay**

```bash
emerge --sync 
emerge --ask --verbose --oneshot portage 
emerge --ask app-eselect/eselect-repository
eselect repository enable asahi
emerge --sync
```

**Step 2: Configure VIDEO_CARDS**

```bash
echo '*/* VIDEO_CARDS: asahi' > /etc/portage/package.use/VIDEO_CARDS
```

**Step 3: Install Bootloader**

```bash
emerge --ask sys-boot/grub
```

**Step 4: Install Asahi Packages**

```bash
# Create directory (if not exists)
mkdir -p /etc/portage/package.license

# Accept license for this package
echo 'sys-kernel/linux-firmware linux-fw-redistributable' \
  >> /etc/portage/package.license/linux-firmware

# Install necessary dependencies first, then sequential installation reduces circular dependency pressure
emerge -1av media-libs/libglvnd dev-lang/rust-bin sys-kernel/installkernel sys-kernel/dracut

# Install m1n1 (note uppercase O = --nodeps)
emerge -1avO sys-boot/m1n1

# Install Asahi kernel and firmware
emerge -1av virtual/dist-kernel:asahi
emerge -1av sys-apps/asahi-meta
emerge -av sys-kernel/linux-firmware
```
>etc-update When the list appears, select -3 to automatically merge (auto-merge all)

Package descriptions:
- `rust-bin`: Required for compiling Asahi kernel components
- `linux-firmware`: Provides additional firmware
- `asahi-meta`: Contains m1n1, asahi-fwupdate, and other tools
- `virtual/dist-kernel:asahi`: Asahi custom kernel (includes patches not yet upstream)

**Step 5: Update firmware and bootloader**

```bash
asahi-fwupdate
update-m1n1
```

> ⚠️ **Important**: Must run `update-m1n1` after every kernel, U-Boot, or m1n1 update!

**Step 6: Update system**

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
# Root partition (adjust based on your configuration)
UUID=<your-root-uuid>  /      ext4   defaults  0 1
# Or encrypted version:
# UUID=<your-btrfs-uuid>  /      btrfs  defaults  0 1

UUID=<your-boot-uuid>  /boot  vfat   defaults  0 2
```

### 5.4 Configure GRUB and dracut

**Install GRUB to ESP**:
```bash
grub-install --efi-directory=/boot --bootloader-id=GRUB
```

**(🔐 Encrypted users only) Configure dracut for LUKS support**:

```bash
# Install necessary packages
emerge --ask --verbose sys-fs/cryptsetup sys-fs/btrfs-progs sys-kernel/dracut

# Enable systemd cryptsetup support
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# Configure dracut
mkdir -p /etc/dracut.conf.d
nano -w /etc/dracut.conf.d/luks.conf
```

Add to `luks.conf`:
```ini
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
install_items+=" /sbin/cryptsetup /bin/grep "
filesystems+=" btrfs "
```

Regenerate initramfs:
```bash
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

**Set GRUB kernel parameters** (encrypted users need this):

```bash
nano -w /etc/default/grub
```

```conf
GRUB_CMDLINE_LINUX="rd.auto=1 rd.luks.allow-discards"
GRUB_DEVICE_UUID="<btrfs UUID>"
```

**Generate GRUB configuration**:
```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

---

## 6. Complete Installation and Reboot {#step-6-finalize}

### 6.1 Final Configuration

**Set hostname**:
```bash
echo "macbook" > /etc/hostname
```

**Enable NetworkManager** (desktop system):
```bash
systemctl enable NetworkManager
```

**Set root password** (if not yet set):
```bash
passwd root
```

### 6.2 Exit chroot and Reboot

```bash
exit
umount -R /mnt/gentoo
# If using encryption:
cryptsetup luksClose gentoo-root

reboot
```

### 6.3 First Boot

1. U-Boot will auto-boot
2. GRUB menu appears, select Gentoo
3. (If encrypted) Enter LUKS password
4. System should successfully boot to login prompt

> 🎉 **Congratulations! Basic system installation complete!**

---

## 7. Post-Installation Configuration (Optional) {#step-7-post}

### 7.1 Network Connection

```bash
# Wi-Fi
nmcli device wifi connect <SSID> password <password>

# Or use nmtui (graphical interface)
nmtui
```

### 7.2 Install Desktop Environment (🖥️ Optional)

**GNOME (✅ Recommended, Wayland native):**
```bash
emerge --ask gnome-base/gnome
systemctl enable gdm
```

**KDE Plasma:**
```bash
emerge --ask kde-plasma/plasma-meta
systemctl enable sddm
```

**Xfce (Lightweight):**
```bash
emerge --ask xfce-base/xfce4-meta x11-misc/lightdm
systemctl enable lightdm
```

### 7.3 Audio Configuration (🎵 Optional)

Asahi audio is provided through PipeWire. **systemd systems auto-configure**, no additional setup needed.

Verify audio:
```bash
emerge --ask media-sound/pavucontrol
systemctl --user status pipewire
```

### 7.4 GPU Acceleration

Confirm using Asahi Mesa:
```bash
eselect mesa list
```

> 💡 **Note**: Asahi GPU acceleration is still in development. Some OpenGL applications may not be fully supported.

---

## 8. System Maintenance {#step-8-maintenance}

### 8.1 Regular Update Process

```bash
# Update Portage tree (including Asahi overlay)
emerge --sync
# Or manually sync Asahi overlay:
emaint -r asahi sync

# Update all packages
emerge -avuDN @world

# Clean unneeded packages
emerge --depclean

# Update configuration files
dispatch-conf
```

### 8.2 Must-do After Kernel Updates

> ⚠️ **Extremely important**: Must run after every kernel update!

```bash
# Update m1n1 Stage 2 (includes devicetree)
update-m1n1

# Regenerate GRUB configuration
grub-mkconfig -o /boot/grub/grub.cfg
```

**Why?** m1n1 Stage 2 contains devicetree blobs that the kernel needs to identify hardware. Not updating may cause boot failure or missing functionality.

> 💡 **Automation**: `sys-apps/asahi-scripts` provides installkernel hooks to automatically execute these steps.

### 8.3 Firmware Updates

macOS system updates include firmware updates. **Keep macOS partition** to get latest firmware.

---

## 9. FAQ and Troubleshooting {#faq}

### Issue: Cannot Boot from USB

**Possible cause**: U-Boot's USB drivers still have limitations.

**Solutions**:
- Try different USB flash drives
- Use USB 2.0 devices (better compatibility)
- Connect via USB Hub

### Issue: Boot Hangs or Black Screen

**Cause**: m1n1/U-Boot/kernel mismatch.

**Solutions**:
1. Re-run Asahi installer from macOS
2. Select `p` option to retry Recovery process
3. Ensure `update-m1n1` was run in chroot

### Issue: 🔐 Cannot Unlock Encrypted Partition

**Cause**: dracut configuration error or wrong UUID.

**Solutions**:
1. Check `GRUB_CMDLINE_LINUX` in `/etc/default/grub`
2. Confirm correct LUKS UUID: `blkid /dev/nvme0n1p5`
3. Regenerate GRUB configuration: `grub-mkconfig -o /boot/grub/grub.cfg`

### Issue: Wi-Fi Unstable

**Cause**: Possible WPA3 or 6 GHz band issues.

**Solutions**:
- Connect to WPA2 network
- Use 2.4 GHz or 5 GHz bands (avoid 6 GHz)

### Issue: Trackpad Not Working

**Cause**: Firmware not loaded or driver issues.

**Solutions**:
```bash
# Check firmware
dmesg | grep -i firmware

# Ensure asahi-meta is installed
emerge --ask sys-apps/asahi-meta
```

### Issue: No Audio

**Cause**: PipeWire not started.

**Solutions**:
```bash
systemctl --user restart pipewire pipewire-pulse
```

---

## 10. Advanced Tips (🎨 Optional) {#advanced}

### 10.1 Notch Configuration

By default, the notch area displays as black. To enable:

```bash
# Add to GRUB kernel parameters
apple_dcp.show_notch=1
```

**KDE Plasma optimization**:
- Add full-width panel at top, height aligned with notch bottom
- Left side: Application Dashboard, Global menu, Spacer
- Right side: System Tray, Bluetooth, Power, Clock

### 10.2 Custom Kernel (Advanced)

Distribution kernel works fine, but if you want to customize:

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

> ⚠️ **Remember to keep a working kernel as backup**!

### 10.3 Multi-Kernel Switching

Supports multiple kernel coexistence:

```bash
eselect kernel list
eselect kernel set <number>
update-m1n1  # Must run after switching!
```

---

## 11. References {#reference}

### Official Documentation

- **[Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)** ⭐ Latest official guide
- [Asahi Linux Official Site](https://asahilinux.org/)
- [Asahi Linux Feature Support](https://asahilinux.org/docs/platform/feature-support/overview/)
- [Gentoo AMD64 Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64) (same process)

### Tools and Scripts

- [asahi-gentoosupport](https://github.com/chadmed/asahi-gentoosupport) - Automation installation script
- [Gentoo Asahi Releng](https://github.com/chadmed/gentoo-asahi-releng) - Live USB build tools

### Community Support

- [Gentoo Forums](https://forums.gentoo.org/)
- IRC: `#gentoo` and `#asahi` @ [Libera.Chat](https://libera.chat/)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)
- [Asahi Linux Discord](https://discord.gg/asahi-linux)

### Further Reading

- [Asahi Linux Open OS Interoperability](https://asahilinux.org/docs/platform/open-os-interop/) - Understanding Apple Silicon boot process
- [Linux Kernel Devicetree](https://docs.kernel.org/devicetree/usage-model.html) - Why update-m1n1 is needed

---

## Conclusion

🎉 **Enjoy Gentoo on Apple Silicon!**

This guide is based on the official [Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide) and simplifies the process, marking optional steps to make it easier for more people to try.

**Remember three key points**:
1. ✅ Use official Gentoo Asahi Live USB (no Fedora intermediate required)
2. ✅ asahi-gentoosupport script can automate most of the process
3. ✅ Must run `update-m1n1` after every kernel update

Feel free to ask questions in the community!
