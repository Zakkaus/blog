---
slug: gentoo-install
title: "Gentoo install guide (beginner edition)"
date: 2025-09-01
tags: ["Gentoo","Linux","OpenRC","systemd"]
categories: ["Linux notes"]
draft: false
description: "Step-by-step Gentoo install walkthrough: partitioning, Stage3, Portage, USE flags, kernel, desktop environments, and troubleshooting."
ShowToc: false
TocOpen: false
translationKey: "gentoo-install"
authors:
  - "Zakk"
seo:
  description: "Complete Gentoo Linux install guide for newcomers: storage layout, Stage3 bootstrap, Portage and USE configuration, kernel options, OpenRC vs systemd, and GNOME / KDE deployment."
  keywords:
    - "Gentoo install"
    - "Gentoo tutorial"
    - "USE flags"
    - "Portage basics"
    - "OpenRC setup"
    - "systemd"
    - "Zakk blog"
---

{{< lead >}}
This notebook combines my recent desktop and laptop reinstalls with insights from bitbili's “Gentoo Linux installation and usage tutorial”, revalidated against the official handbook as of October 2025. Follow the steps and you can bring up a daily driver Gentoo system from a blank disk.
{{< /lead >}}

> The procedure targets x86_64 UEFI hardware and covers both OpenRC and systemd. If you run BIOS or another architecture, cross-reference the Gentoo Handbook for the necessary tweaks.

---

## Installation at a glance

1. Prepare boot media and confirm networking
2. Partition disks and create filesystems
3. Extract Stage3 and enter the chroot
4. Configure Portage, USE flags, profiles, and locale
5. Install the kernel, firmware, and base tools
6. Set up the bootloader and user accounts
7. Deploy a desktop environment and everyday software
8. Reboot, verify, and plan ongoing maintenance

Each section includes the commands I actually run plus alternatives, so you can backtrack safely at any point.

---

## Prerequisites {#prerequisites}

- x86_64 hardware with UEFI firmware (desktop or laptop)
- 8 GB or larger USB flash drive
- Reliable internet connection (choose a domestic mirror if you're in mainland China)
- A second device for docs / remote SSH (strongly recommended)
- At least 30 GB of free disk space

```bash
# Back up anything important before touching partitions
```

---

## 0. Download and write install media {#step-0-media}

### 0.1 Pick a mirror and download the ISO

Mirror list: <https://www.gentoo.org/downloads/mirrors/\>

| Region | Suggested mirror |
| ------ | ---------------- |
| Taiwan | `https://free.nchc.org.tw/gentoo/` |
| Australia | `https://mirror.aarnet.edu.au/pub/gentoo/` |
| Mainland China | `https://mirrors.ustc.edu.cn/gentoo/`, `https://mirrors.tuna.tsinghua.edu.cn/gentoo/`, `https://mirrors.aliyun.com/gentoo/` |

Download the minimal ISO and signature:
```bash
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso.asc
```

Optional signature verification:
```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992
gpg --verify install-amd64-minimal.iso.asc install-amd64-minimal.iso
```

### 0.2 Write the USB installer

**Linux:**
```bash
sudo dd if=install-amd64-minimal.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
> Replace `sdX` with your USB device, e.g. `/dev/sdb` or `/dev/nvme1n1`.

**macOS:**
```bash
diskutil list
diskutil unmountDisk /dev/diskN
sudo dd if=install-amd64-minimal.iso of=/dev/rdiskN bs=4m
sudo diskutil eject /dev/diskN
```

**Windows:** use [Rufus](https://rufus.ie/), boot selection = ISO, write mode = DD.

---

## 1. Boot the live ISO and bring up networking {#step-1-network}

### 1.1 Confirm UEFI mode
```bash
ls /sys/firmware/efi && echo "UEFI" || echo "Legacy BIOS"
```
If you see “Legacy BIOS”, switch to MBR partitioning and GRUB.

### 1.2 Wired networking
```bash
ip link
dhcpcd eno1
ping -c3 gentoo.org
```

### 1.3 Wi-Fi

**wpa_supplicant:**
```bash
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp0s20f3 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp0s20f3
```

**iwd (simpler, recommended):**
```bash
emerge --ask net-wireless/iwd
rc-service iwd start
rc-update add iwd default
iwctl
[iwd]# device list
[iwd]# station wlp0s20f3 scan
[iwd]# station wlp0s20f3 get-networks
[iwd]# station wlp0s20f3 connect <SSID>
```
> Having trouble with WPA3? Fall back to WPA2.

### 1.4 (Optional) enable SSH for remote control
```bash
passwd                      # set root password
rc-service sshd start
rc-update add sshd default
ip a | grep inet
# From another machine: ssh root@<IP>
```
Disable or harden SSH in `/etc/ssh/sshd_config` once the install finishes.

---

## 2. Plan your partitions {#step-2-partition}

Inspect disks:
```bash
lsblk -o NAME,SIZE,TYPE
```

Launch `cfdisk` or `gdisk`:
```bash
cfdisk /dev/nvme0n1
```

| Suggested slice | Size | Filesystem | Mount point | Notes |
| --------------- | ---- | ---------- | ----------- | ----- |
| ESP | 512 MB | FAT32 | /efi | `type EF00` |
| Boot | 1 GB | ext4 | /boot | kernel + initramfs |
| Root | 80–120 GB | ext4 / XFS / Btrfs | / | OS + apps |
| Home | remainder | ext4 / XFS / Btrfs | /home | user data |
| Swap (optional) | 1–2× RAM | swap | swap | or use zram on SSD |

> Minimal layout = `/efi` + `/`. Add more volumes if you prefer separation.

---

## 3. Create filesystems and mount them {#step-3-filesystem}

### 3.1 Format partitions
```bash
mkfs.vfat -F32 /dev/nvme0n1p1
mkfs.ext4 /dev/nvme0n1p2
mkfs.ext4 /dev/nvme0n1p3
mkfs.ext4 /dev/nvme0n1p4
mkswap /dev/nvme0n1p5
```
Btrfs example:
```bash
mkfs.btrfs -L gentoo /dev/nvme0n1p3
```

### 3.2 Mount (ext4 example)
```bash
mount /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{boot,efi,home}
mount /dev/nvme0n1p2 /mnt/gentoo/boot
mount /dev/nvme0n1p1 /mnt/gentoo/efi
mount /dev/nvme0n1p4 /mnt/gentoo/home
swapon /dev/nvme0n1p5
```

### 3.3 Btrfs subvolumes
```bash
mount /dev/nvme0n1p3 /mnt/gentoo
btrfs subvolume create /mnt/gentoo/@
btrfs subvolume create /mnt/gentoo/@home
umount /mnt/gentoo

mount -o compress=zstd,subvol=@ /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{boot,efi,home}
mount -o subvol=@home /dev/nvme0n1p3 /mnt/gentoo/home
mount /dev/nvme0n1p2 /mnt/gentoo/boot
mount /dev/nvme0n1p1 /mnt/gentoo/efi
```

---

## 4. Fetch Stage3 and chroot in {#step-4-stage3}

### 4.1 Pick a Stage3

- **OpenRC:** `stage3-amd64-openrc-*.tar.xz`
- **systemd:** `stage3-amd64-systemd-*.tar.xz`
- The “desktop” variants just preset USE flags; the standard ones are fine.

### 4.2 Download and extract
```bash
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```
Use the accompanying `.DIGESTS` with `openssl`/`gpg` if you want to verify checksums.

### 4.3 Copy DNS and mount pseudo filesystems
```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/
mount --types proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
mount --rbind /run /mnt/gentoo/run
mount --make-rslave /mnt/gentoo/sys
mount --make-rslave /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/run
```
> For OpenRC you can skip `/run`.

### 4.4 Enter the chroot
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

---

## 5. Bootstrap Portage and make.conf {#step-5-portage}

### 5.1 Sync the tree and install helpers
```bash
emerge-webrsync
emerge --sync
emerge --ask app-portage/eix app-portage/gentoolkit
```

Mirror selection (pick one):
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# or manually:
echo 'GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"' >> /etc/portage/make.conf
```

### 5.2 Sample make.conf
```conf
COMMON_FLAGS="-march=native -O2 -pipe"
MAKEOPTS="-j$(nproc)"
ACCEPT_LICENSE="*"
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"
GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"

# Wayland-centric desktop
USE="wayland pipewire vulkan egl"
# For X11 add:
# USE="X xwayland pipewire vulkan egl"

# GPU drivers (keep only what you need)
VIDEO_CARDS="nvidia"
# VIDEO_CARDS="amdgpu radeonsi"
# VIDEO_CARDS="intel i965 iris"
```

### 5.3 package.use and license basics
```bash
echo "sys-kernel/linux-firmware initramfs" >> /etc/portage/package.use/linux-firmware
echo "sys-kernel/linux-firmware linux-fw-redistributable no-source-code" >> /etc/portage/package.license
```

---

## 6. Profiles, system settings, and localization {#step-6-system}

### 6.1 Choose a profile
```bash
eselect profile list
eselect profile set <number>
emerge -avuDN @world
```
Popular choices:
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop` (OpenRC desktop)

### 6.2 Timezone and locales
```bash
echo "Asia/Taipei" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
echo "zh_TW.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
eselect locale set en_US.utf8
```

### 6.3 Hostname and networking
```bash
echo "gentoo" > /etc/hostname
cat <<'NET' > /etc/conf.d/net
config_enp5s0="dhcp"
NET
```
OpenRC network service:
```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0
rc-update add net.enp5s0 default
```

systemd alternative (NetworkManager):
```bash
emerge --ask net-misc/networkmanager
gpasswd -a <username> plugdev
rc-update add NetworkManager default   # use systemctl enable NetworkManager on systemd
echo '[main]\ndhcp=internal' >> /etc/NetworkManager/NetworkManager.conf
```

### 6.4 fstab template
```bash
blkid
cat <<'FSTAB' > /etc/fstab
UUID=<ESP-UUID>   /efi   vfat    defaults,noatime  0 2
UUID=<BOOT-UUID>  /boot  ext4    defaults,noatime  0 2
UUID=<ROOT-UUID>  /      ext4    defaults,noatime  0 1
UUID=<HOME-UUID>  /home  ext4    defaults,noatime  0 2
UUID=<SWAP-UUID>  none   swap    sw               0 0
FSTAB
```

---

## 7. Kernel and firmware {#step-7-kernel}

### 7.1 Fast path: binary kernel
```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```
Regenerate your bootloader config after kernel upgrades.

### 7.2 Roll your own kernel
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
cd /usr/src/linux
make menuconfig
```
Recommended settings:
- **Processor type and features:** pick AMD/Intel options for your CPU
- **File systems:** enable ext4 / XFS / Btrfs as needed
- **Device Drivers → Network device support:** include your NIC
- **Firmware Drivers:** include initramfs helpers if you load firmware early

Automated build:
```bash
genkernel --install all
```

### 7.3 Firmware and microcode
```bash
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode   # Intel
emerge --ask sys-kernel/amd-microcode       # AMD
```

---

## 8. Base utilities and desktop prerequisites {#step-8-base-packages}

```bash
emerge --ask app-editors/neovim app-shells/zsh
emerge --ask app-portage/cpuid2cpuflags
cpuid2cpuflags >> /etc/portage/make.conf
```

### GPU drivers
- **NVIDIA proprietary:** `emerge --ask x11-drivers/nvidia-drivers`
- **AMD:** handled via `VIDEO_CARDS="amdgpu radeonsi"`
- **Intel:** `VIDEO_CARDS="intel i965 iris"`

### Audio and Bluetooth
```bash
emerge --ask media-video/pipewire media-video/wireplumber
emerge --ask media-sound/pavucontrol
emerge --ask net-wireless/bluez bluez-tools blueman
```
OpenRC: `rc-update add pipewire default`. For systemd, use the user services.

---

## 9. Users and privileges {#step-9-users}

```bash
passwd root
useradd -m -G wheel,video,audio,plugdev zakk
passwd zakk
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel
```

On systemd you may also add the account to `network`, `lp`, or other groups as needed.

---

## 10. Install a bootloader {#step-10-bootloader}

### 10.1 systemd-boot (UEFI only)
```bash
bootctl --path=/efi install
cat <<'ENT' > /efi/loader/entries/gentoo.conf
title   Gentoo Linux
linux   /vmlinuz
initrd  /initramfs
options root=UUID=<ROOT-UUID> rw
ENT
cat <<'LOADER' > /efi/loader/loader.conf
default gentoo.conf
timeout 3
console-mode auto
LOADER
```

### 10.2 GRUB
```bash
emerge --ask sys-boot/grub:2
mkdir -p /efi/EFI/Gentoo
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo
emerge --ask sys-firmware/efibootmgr
grub-mkconfig -o /boot/grub/grub.cfg
```
Add Btrfs or LUKS modules if you use those features.

---

## 11. Desktop environments and display managers {#step-11-desktop}

### 11.1 KDE Plasma (Wayland)
```bash
echo "kde-plasma/plasma-meta wayland" >> /etc/portage/package.use/plasma
emerge --ask kde-plasma/plasma-meta kde-apps/kde-apps-meta
emerge --ask gui-apps/greetd greetd-tuigreet
rc-update add greetd default
```

### 11.2 GNOME
```bash
emerge --ask gnome-base/gnome
emerge --ask gnome-base/gdm
rc-update add gdm default   # use systemctl enable gdm on systemd
```

### 11.3 Other picks
- `emerge --ask xfce-base/xfce4 xfce-extra/xfce4-meta`
- `emerge --ask gui-apps/cage` for a minimal Wayland kiosk

---

## 12. Pre-reboot checklist {#step-12-checklist}

1. `emerge --info` runs without errors
2. `/etc/fstab` contains correct UUIDs (double-check with `blkid`)
3. Root and user passwords are set
4. You ran `grub-mkconfig` or finished your `bootctl` configuration
5. LUKS setups include `cryptsetup` inside the initramfs

Leave the chroot and reboot:
```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

## 13. After the first boot {#step-13-post}

```bash
sudo emerge --sync
sudo emerge -avuDN @world
sudo emerge --ask --depclean
```

Daily update alias:
```bash
echo "alias update='sudo emerge --sync && sudo emerge -avuDN @world && sudo emerge --ask --depclean'" >> ~/.zshrc
```

### Recommended desktop add-ons
- Terminals: `kitty`, `alacritty`
- Browsers: `firefox`, `google-chrome`
- Office: `libreoffice`
- Flatpak support: `emerge --ask sys-apps/flatpak`

---

## Troubleshooting {#faq}

- **Mirror timeouts:** switch to USTC/TUNA/Aliyun in mainland China, or run through `proxychains`.
- **Missing kernel drivers:** check `lspci -k`; rebuild the kernel with the right modules or switch to `gentoo-kernel-bin`.
- **No network after reboot:** inspect `/etc/conf.d/net`, confirm NetworkManager is enabled, or toggle Wi-Fi with `nmcli radio wifi on`.
- **Wayland black screen:** NVIDIA still has edge cases—temporarily enable `USE="X xwayland"` and use SDDM or GDM.

---

## References {#reference}

- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [bitbili: Gentoo Linux installation and usage tutorial](https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html)
- My personal deployment notes (2023–2025)

Good luck! If you get stuck, the Gentoo Forums, IRC, or Discord `#gentoo` are great places to ask.
