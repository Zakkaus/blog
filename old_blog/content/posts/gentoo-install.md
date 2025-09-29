---
slug: gentoo-install
title: "Gentoo Installation Guide (Beginner)"
date: 2025-09-01
tags: ["Gentoo","Linux","OpenRC","systemd"]
description: "Beginner friendly Gentoo install: partitioning, Stage3, Portage, USE, kernel, desktop environments, FAQ."
---

<style>
.gentoo-toc{border:1px solid var(--gtoc-border,#ddd);background:rgba(0,0,0,0.03);padding:.75rem 1rem;margin:1rem 0 1.5rem;border-radius:12px;font-size:.9rem;line-height:1.35;}
body.dark .gentoo-toc{background:rgba(255,255,255,0.05);border-color:#444;}
.gentoo-toc details{margin:0;}
.gentoo-toc details[open]>summary{margin-bottom:.35rem;}
.gentoo-toc summary{cursor:pointer;font-weight:600;list-style:none;outline:none;}
.gentoo-toc summary::-webkit-details-marker{display:none;}
.gentoo-toc ol{
  margin:0;
  padding:0;
  list-style:none;
  margin-left:0;
  display:grid;
  gap:.15rem;
}
.gentoo-toc li{padding-left:.2rem;}
@media(min-width:760px){.gentoo-toc ol{grid-template-columns:repeat(auto-fill,minmax(250px,1fr));}}
.gentoo-toc a{text-decoration:none;color:inherit;}
.gentoo-toc a:hover{text-decoration:underline;color:#e1306c;}
body.dark .gentoo-toc a:hover{color:#ff6f9d;}

/* ===== Article 全局美化（僅此頁） ===== */
.gentoo-article{--g-accent:#e1306c;--g-accent-soft:#ffbad4;--g-bg-h2:rgba(225,48,108,.08);--g-bg-h3:rgba(225,48,108,.05);--g-border:#e9e9e9;--g-code-bg:#fafafa;--g-code-border:#e5e5e5;--g-block-bg:rgba(0,0,0,0.04);--g-table-head:#f7f7f7;--g-shadow:0 2px 6px -2px rgba(0,0,0,.08);line-height:1.55;font-size:.97rem;}
body.dark .gentoo-article{--g-border:#3c3c3c;--g-code-bg:#1f1f1f;--g-code-border:#333;--g-block-bg:rgba(255,255,255,0.05);--g-table-head:#262626;--g-shadow:0 2px 6px -2px rgba(0,0,0,.55);}

.gentoo-article h2{
  margin:2.3rem 0 1.05rem;
  padding:.55rem .9rem .55rem 1rem;
  border-left:6px solid var(--g-accent);
  background:linear-gradient(90deg,rgba(225,48,108,.08),rgba(0,0,0,0));
  border-radius:6px;
  font-size:1.26rem;
}
.gentoo-article h3{
  margin:1.6rem 0 .6rem;
  padding:.25rem .55rem .25rem .7rem;
  border-left:3px solid var(--g-accent);
  background:none;
  font-size:1.04rem;
}
.gentoo-article h4{
  margin:1.15rem 0 .5rem;
  padding:0 0 .25rem;
  font-size:.95rem;
  border-bottom:1px solid rgba(0,0,0,.12);
}
body.dark .gentoo-article h4{
  border-bottom:1px solid rgba(255,255,255,.18);
}

.gentoo-article pre{
  background:#2b2f36!important;
  color:#f3f5f7!important;
  border:1px solid #3a4048;
  padding:.85rem 1rem;
  margin:1.15rem 0;
  border-radius:10px;
  font-size:.84rem;
  line-height:1.45;
  overflow:auto;
  scrollbar-width:thin;
  scrollbar-color:#555 transparent;
}
body.dark .gentoo-article pre{
  background:#16181c!important;
  border:1px solid #2b3036;
  color:#e9ecef!important;
}
.gentoo-article pre code{
  background:transparent!important;
  padding:0;
  border:none;
  font-size:inherit;
  color:inherit;
}

/* inline code 高對比 */
.gentoo-article code:not(pre code){
  background:#343a40;
  color:#f8f9fa;
  padding:.18em .5em;
  border:1px solid #454d55;
  border-radius:6px;
  font-size:.78rem;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);
}
body.dark .gentoo-article code:not(pre code){
  background:#22272e;
  border-color:#313a44;
  color:#e6e8ea;
}

/* 選取可見 */
.gentoo-article pre::selection,
.gentoo-article pre *::selection{
  background:#e1306c;
  color:#fff;
}
body.dark .gentoo-article pre::selection,
body.dark .gentoo-article pre *::selection{
  background:#ff478c;
  color:#111;
}

/* 捲軸微樣式（Chromium / WebKit） */
.gentoo-article pre::-webkit-scrollbar{
  height:8px;
  width:8px;
}
.gentoo-article pre::-webkit-scrollbar-track{
  background:transparent;
}
.gentoo-article pre::-webkit-scrollbar-thumb{
  background:#555;
  border-radius:20px;
}
body.dark .gentoo-article pre::-webkit-scrollbar-thumb{
  background:#4a4f56;
}

/* Anchor offset so heading is visible below sticky header */
.gentoo-article h1,
.gentoo-article h2,
.gentoo-article h3,
.gentoo-article h4,
article h1,
article h2,
article h3,
article h4 {
  scroll-margin-top: 90px;
}
</style>

<div class="gentoo-toc">
<details open>
  <summary>📚 Table of Contents</summary>
  <ol>
    <li><a href="#my-hardware-example">My Hardware (Example)</a></li>
    <li><a href="#0-download-create-installation-media">0. Download & Create Installation Media</a></li>
    <li><a href="#1-boot-network">1. Boot & Network</a></li>
    <li><a href="#2-partitioning-lsblk-and-cfdisk">2. Partitioning</a></li>
    <li><a href="#3-filesystem-formatting-mounting-ext4-xfs-btrfs">3. Filesystem Formatting & Mounting</a></li>
    <li><a href="#4-download-stage3-mount-system-directories-chroot">4. Stage3 & chroot</a></li>
    <li><a href="#5-portage-mirrors-with-full-makeconf-example">5. Portage & Mirrors</a></li>
    <li><a href="#6-use-flags-licenses-beginner-solutions">6. USE Flags & Licenses</a></li>
    <li><a href="#7-profile-selection-desktop-server">7. Profile Selection</a></li>
    <li><a href="#8-localization-language-timezone">8. Localization</a></li>
    <li><a href="#9-kernel-selection-compilation-full-commands">9. Kernel</a></li>
    <li><a href="#10-generate-fstab-ext4-btrfs-examples">10. fstab</a></li>
    <li><a href="#11-install-bootloader-grub-with-os-prober">11. GRUB</a></li>
    <li><a href="#12-enable-networking-openrc-systemd">12. Networking</a></li>
    <li><a href="#13-wayland-x11-choice-use">13. Wayland / X11</a></li>
    <li><a href="#14-gpu-drivers-cpu-microcode">14. GPU & Microcode</a></li>
    <li><a href="#15-desktop-environments-optional">15. Desktop Environments</a></li>
    <li><a href="#16-users-sudo">16. Users & sudo</a></li>
    <li><a href="#17-ssh-optional">17. SSH</a></li>
    <li><a href="#18-reboot">18. Reboot</a></li>
    <li><a href="#faq">FAQ</a></li>
    <li><a href="#references">References</a></li>
  </ol>
</details>
</div>

<div class="gentoo-article">

# 💻 My Hardware (Example) {#my-hardware-example}
- **CPU**: AMD Ryzen 9 7950X3D (16C/32T)  
- **Motherboard**: ASUS ROG STRIX X670E-A GAMING WIFI  
- **RAM**: 64GB DDR5  
- **GPU**: NVIDIA RTX 4080 SUPER + AMD iGPU  
- **Storage**: NVMe SSD  
- **Dual boot**: Windows 11 + Gentoo  

> Example only. Steps apply to most x86_64 hardware.

---

## 0. Download & Create Installation Media {#0-download-create-installation-media}

**Official mirror list**: <https://www.gentoo.org/downloads/mirrors/>

- Use a mirror close to your region (e.g., Taiwan NCHC, AARNET Australia, Kernel.org global).

### 0.1 Download ISO (example: NCHC Taiwan)
```bash
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso
```

### 0.2 Create USB Install Disk

**Linux (dd)**:  
```bash
sudo dd if=install-amd64-minimal.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
Replace `sdX` with your USB device.

**Windows (Rufus)**: <https://rufus.ie/>  
1. Select USB & ISO  
2. Choose **dd mode**  
3. Start  

---

## 1. Boot & Network {#1-boot-network}

### 1.1 Check UEFI / BIOS
```bash
ls /sys/firmware/efi
```
Exists → UEFI; else → Legacy BIOS.

### 1.2 Wired Network
```bash
ip a
dhcpcd eno1
ping -c 3 gentoo.org
```

### 1.3 Wi‑Fi

**wpa_supplicant**:  
```bash
iw dev
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp9s0 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp9s0
ping -c 3 gentoo.org
```

**iwd (recommended)**:  
```bash
emerge net-wireless/iwd
systemctl enable iwd
systemctl start iwd
iwctl
[iwd]# device list
[iwd]# station wlp9s0 scan
[iwd]# station wlp9s0 get-networks
[iwd]# station wlp9s0 connect SSID
```

### 1.4 (Optional) Temporary SSH (root password login) {#1-4-temp-ssh}
Purpose: let you continue installation remotely (copy/paste long commands, keep session stable, work from another machine). This is for the live install environment only; disable later.

1. Set a root password (if not already):
   ```bash
   passwd
   ```
2. Allow root login & password auth (temporary; appends to the end of config):
   ```bash
   echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
   echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config
   ```
3. Start SSH daemon (live ISO uses OpenRC):
   ```bash
   rc-service sshd start
   ```
4. Find the IP:
   ```bash
   ip a | grep inet
   ```
5. From your workstation:
   ```bash
   ssh root@<INSTALLER_IP>
   ```
Security note: After finishing the base install (inside your new Gentoo system), edit /etc/ssh/sshd_config to tighten (remove the two lines or set `PermitRootLogin prohibit-password`) and restart sshd.

(Continue below with partitioning.)

## 2. Partitioning (lsblk and cfdisk) {#2-partitioning-lsblk-and-cfdisk}
Check disks:  
```bash
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT
```

Example output:  
```
nvme0n1    476G disk
├─nvme0n1p1 512M part
├─nvme0n1p2   1G part
├─nvme0n1p3 100G part
└─nvme0n1p4 375G part
```

Optional editor:  
```bash
cfdisk /dev/nvme0n1
```

**Suggested layout (UEFI)**:  
| Size | FS | Mount | Purpose |
|---|---|---|---|
| 512M | FAT32 | /efi | UEFI ESP |
| 1G | ext4 | /boot | kernel, initramfs |
| 100G+ | ext4/XFS/Btrfs | / | root |
| Rest | ext4/XFS/Btrfs | /home | user data |

---

## 3. Filesystem Formatting & Mounting (ext4 / XFS / Btrfs) {#3-filesystem-formatting-mounting-ext4-xfs-btrfs}

### 3.1 Format

**ext4**:  
```bash
mkfs.ext4 -L root /dev/nvme0n1p3
mkfs.ext4 -L home /dev/nvme0n1p4
```

**XFS**:  
```bash
mkfs.xfs -L root /dev/nvme0n1p3
mkfs.xfs -L home /dev/nvme0n1p4
```

**Btrfs** (force overwrite with `-f` if needed):  
```bash
mkfs.btrfs -L rootfs /dev/nvme0n1p3
mkfs.btrfs -L home   /dev/nvme0n1p4
# Force: mkfs.btrfs -f -L rootfs /dev/nvme0n1p3
```

### 3.2 Mount

**ext4 / XFS**:  
```bash
mount /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{boot,home,efi}
mount /dev/nvme0n1p4 /mnt/gentoo/home
mount /dev/nvme0n1p2 /mnt/gentoo/boot
mount /dev/nvme0n1p1 /mnt/gentoo/efi
```

**Btrfs with subvolumes**:  
```bash
mount /dev/nvme0n1p3 /mnt/gentoo
btrfs subvolume create /mnt/gentoo/@
btrfs subvolume create /mnt/gentoo/@home
umount /mnt/gentoo

mount -o compress=zstd,subvol=@    /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{boot,home,efi}
mount -o subvol=@home              /dev/nvme0n1p3 /mnt/gentoo/home
mount /dev/nvme0n1p2 /mnt/gentoo/boot
mount /dev/nvme0n1p1 /mnt/gentoo/efi
```

---

## 4. Download Stage3, Mount System Directories & chroot {#4-download-stage3-mount-system-directories-chroot}

### 4.1 Stage3 Choice
- Use **standard Stage3 (glibc)**, with OpenRC or systemd.  
- “desktop” builds exist but are optional; prefer standard + correct profile.

### 4.2 Download & Extract
```bash
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 4.3 Mount System Directories

**OpenRC**:  
```bash
mount -t proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
```

**systemd**:  
```bash
mount -t proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys && mount --make-rslave /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev && mount --make-rslave /mnt/gentoo/dev
mount --rbind /run /mnt/gentoo/run && mount --make-rslave /mnt/gentoo/run
```

### 4.4 Enter chroot
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) $PS1"
```

---

## 5. Portage & Mirrors (with full make.conf example) {#5-portage-mirrors-with-full-makeconf-example}

### 5.1 Sync Portage
```bash
emerge-webrsync
emerge --sync
```

### 5.2 Choose Mirrors
Interactive:  
```bash
emerge --ask app-portage/mirrorselect
mirrorselect -i -o >> /etc/portage/make.conf
```
Manual (keep only one):  
```bash
echo 'GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"' >> /etc/portage/make.conf
```

### 5.3 `/etc/portage/make.conf` Example
```conf
COMMON_FLAGS="-march=native -O2 -pipe"
MAKEOPTS="-j32"
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"
GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"
USE="wayland egl pipewire vulkan"
# USE="X xwayland egl pipewire vulkan"
VIDEO_CARDS="nvidia"
# VIDEO_CARDS="amdgpu radeonsi"
# VIDEO_CARDS="intel i965 iris"
# VIDEO_CARDS="nouveau"
ACCEPT_LICENSE="*"
```

---

## 6. USE flags & Licenses (Beginner Solutions) {#6-use-flags-licenses-beginner-solutions}

### 6.1 Check USE
```bash
emerge -pv firefox
```

### 6.2 Add USE safely
```bash
echo "media-video/ffmpeg X wayland" >> /etc/portage/package.use/ffmpeg
```

### 6.3 Add License
```bash
echo "www-client/google-chrome google-chrome" >> /etc/portage/package.license
```

### 6.4 Keywords (optional newer versions)
```bash
echo "www-client/google-chrome ~amd64" >> /etc/portage/package.accept_keywords
```

---

## 7. Profile Selection (Desktop / Server) {#7-profile-selection-desktop-server}
```bash
eselect profile list
```

Examples:  
- KDE + systemd → `default/linux/amd64/23.0/desktop/plasma/systemd`  
- GNOME + systemd → `default/linux/amd64/23.0/desktop/gnome/systemd`  
- Desktop + OpenRC → `default/linux/amd64/23.0/desktop`  
- Server → `default/linux/amd64/23.0`  

Apply & update:  
```bash
eselect profile set <id>
emerge -avuDN @world
```

---

## 8. Localization (Language & Timezone) {#8-localization-language-timezone}

**Locales**:  
```conf
en_US.UTF-8 UTF-8
en_AU.UTF-8 UTF-8
```
```bash
locale-gen
eselect locale set en_US.utf8
```

**Timezone**:  
```bash
ls /usr/share/zoneinfo
echo "Australia/Melbourne" > /etc/timezone
emerge --config sys-libs/timezone-data
```
[List of timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## 9. Kernel Selection & Compilation (Full Commands) {#9-kernel-selection-compilation-full-commands}

**Prebuilt (recommended)**:  
```bash
emerge sys-kernel/gentoo-kernel-bin
```

### Firmware (linux-firmware) license unblock + initramfs USE
To ensure bundled firmware and early firmware loading (via initramfs):
1. Unblock licenses (adds redistributable/no-source-code acceptance for this package):
   ```bash
   echo "sys-kernel/linux-firmware linux-fw-redistributable no-source-code" >> /etc/portage/package.license
   ```
2. Enable initramfs USE flag (so firmware is packed for early loading):
   ```bash
   echo "sys-kernel/linux-firmware initramfs" >> /etc/portage/package.use/microcode
   ```
3. Install firmware (do this before (or after) installing/updating kernel):
   ```bash
   emerge --ask sys-kernel/linux-firmware
   ```
(Rebuild kernel or regenerate initramfs afterward if already installed.)

**Manual compile**:  
```bash
emerge sys-kernel/gentoo-sources
cd /usr/src/linux
make menuconfig
make -j"$(nproc)"
make modules_install
make install
```

**Initramfs (if using Btrfs, LUKS, RAID, modular drivers)**:  
- Dracut:  
```bash
emerge sys-kernel/dracut
dracut --kver "$(ls /lib/modules | sort -V | tail -1)"
```
- Genkernel:  
```bash
emerge sys-kernel/genkernel
genkernel initramfs
```

---

## 10. Generate fstab (ext4 / Btrfs examples) {#10-generate-fstab-ext4-btrfs-examples}

```bash
blkid
lsblk -f
```

**ext4**:  
```fstab
UUID=<UUID-ESP>  /efi   vfat  noatime,umask=0077 0 2
UUID=<UUID-BOOT> /boot  ext4  noatime            0 2
UUID=<UUID-ROOT> /      ext4  noatime            0 1
UUID=<UUID-HOME> /home  ext4  noatime            0 2
```

**Btrfs**:  
```fstab
UUID=<UUID-ESP>  /efi   vfat   noatime,umask=0077 0 2
UUID=<UUID-ROOT> /      btrfs  noatime,compress=zstd,subvol=@     0 1
UUID=<UUID-ROOT> /home  btrfs  noatime,compress=zstd,subvol=@home 0 2
```

---

## 11. Install Bootloader GRUB (with os-prober) {#11-install-bootloader-grub-with-os-prober}
```bash
emerge grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo
emerge --ask sys-boot/os-prober
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub
grub-mkconfig -o /boot/grub/grub.cfg
```

If root uses Btrfs:  
```bash
emerge --ask sys-fs/btrfs-progs
```

---

## 12. Enable Networking (OpenRC / systemd) {#12-enable-networking-openrc-systemd}

**systemd**:  
```bash
emerge net-misc/networkmanager
systemctl enable NetworkManager
```

**OpenRC**:  
```bash
emerge net-misc/dhcpcd
rc-update add dhcpcd default
```

---

## 13. Wayland / X11 Choice & USE {#13-wayland-x11-choice-use}

Wayland:  
```conf
USE="wayland egl pipewire vulkan"
```

X11:  
```conf
USE="X xwayland egl pipewire vulkan"
```

---

## 14. GPU Drivers & CPU Microcode {#14-gpu-drivers-cpu-microcode}

**NVIDIA Proprietary**:  
```conf
VIDEO_CARDS="nvidia"
```
```bash
emerge x11-drivers/nvidia-drivers
```

**Nouveau (open source)**:  
```conf
VIDEO_CARDS="nouveau"
```
```bash
emerge x11-base/xorg-drivers
```

**AMD**:  
```conf
VIDEO_CARDS="amdgpu radeonsi"
```
```bash
emerge mesa vulkan-loader
```

**Intel**:  
```conf
VIDEO_CARDS="intel i965 iris"
```
```bash
emerge mesa vulkan-loader
```

**CPU microcode (Intel)**:  
```bash
emerge sys-firmware/intel-microcode
```

---

## 15. Desktop Environments (Optional) {#15-desktop-environments-optional}

**KDE Plasma**:  
```bash
emerge kde-plasma/plasma-meta x11-misc/sddm x11-base/xwayland
systemctl enable sddm
```

**GNOME**:  
```bash
emerge gnome-base/gnome gnome-base/gdm
systemctl enable gdm
```

---

## 16. Users & sudo {#16-users-sudo}
```bash
passwd
useradd -m -G wheel,audio,video,usb -s /bin/bash zakk
passwd zakk
emerge app-admin/sudo
echo "%wheel ALL=(ALL) ALL" >> /etc/sudoers
```
> ⚠️ Replace `zakk` with your own username.

---

## 17. SSH (Optional) {#17-ssh-optional}
```bash
emerge net-misc/openssh
systemctl enable sshd && systemctl start sshd
```

---

## 18. Reboot {#18-reboot}
```bash
exit
umount -R /mnt/gentoo
reboot
```

---

# 💡 FAQ {#faq}
- **Slow downloads** → choose nearest mirror.  
- **Wi‑Fi WPA3 unstable** → try WPA2.  
- **Wayland vs X11** → AMD/Intel: Wayland; Compatibility: X11.  
- **NVIDIA** → new cards proprietary driver; old cards → nouveau.  
- **USE conflicts** → check `emerge -pv` and add to `package.use`.  
- **License blocks** → add to `package.license`.  
- **Need newer versions** → use `package.accept_keywords`.  
- **Btrfs + LUKS/RAID** → initramfs recommended.  

---

# 📎 References {#references}
- Gentoo Handbook: <https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation>  
- Bitbili: <https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html>  
- Rufus: <https://rufus.ie/>  
- Timezones: <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>
</div>
- Bitbili: <https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html>  
- Rufus: <https://rufus.ie/>  
- Timezones: <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>
</div>
- Rufus: <https://rufus.ie/>  
- Timezones: <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>
</div>
