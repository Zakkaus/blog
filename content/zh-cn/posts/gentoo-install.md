---
slug: gentoo-install
title: "Gentoo 安装指南（新手）"
date: 2025-09-01
tags: ["Gentoo","Linux","OpenRC","systemd"]
categories: ["Linux 笔记"]
draft: false
description: "从零开始的 Gentoo 安装教学：分割、Stage3、Portage、USE、Kernel、桌面环境与常见问题完整步骤。"
ShowToc: false        # 关闭主题自动 TOC（避免与自订 TOC 重复）
TocOpen: false
translationKey: "gentoo-install"
---


{{< alert icon="list" >}}
**快速导览**
- [我的电脑配置（示例）](#my-hardware-zh)
- [0. 下载与制作安装媒体](#0-下载与制作安装媒体)
- [1. 开机与网路](#1-开机与网路)
- [2. 磁碟分割（lsblk / cfdisk）](#2-磁碟分割lsblk-与-cfdisk)
- [3. 档案系统格式化与挂载](#3-档案系统格式化与挂载ext4--xfs--btrfs)
- [4. Stage3、挂载与 chroot](#4-下载-stage3挂载系统目录与-chroot)
- [5. Portage 与镜像源](#5-portage-与镜像源含-makeconf-完整示例)
- [6. USE flags 与 License](#6-use-flags-与-license新手解法)
- [7. 选择 Profile](#7-选择-profile桌面伺服器)
- [8. 本地化](#8-本地化-localization语言与时区)
- [9. 内核选择与编译](#9-内核选择与编译完整指令)
- [10. 产生 fstab](#10-产生-fstab含-btrfs--ext4-范例)
- [11. 安装 GRUB](#11-安装开机器-grub含-os-prober)
- [12. 启用网路服务](#12-启用网路服务openrc--systemd)
- [13. Wayland / X11 选择](#13-wayland--x11-选择与-use)
- [14. 显示卡与 CPU 微码](#14-显示卡与-cpu-微码)
- [15. 桌面环境](#15-桌面环境可选)
- [16. 使用者与 sudo](#16-使用者与-sudo)
- [17. SSH（可选）](#17-ssh可选)
- [18. 重开机](#18-重开机)
- [常见问题 FAQ](#faq-zh)
- [参考](#refs-zh)
{{< /alert >}}



<div class="gentoo-article">

# 我的电脑配置（示例） {#my-hardware-zh}
- **CPU**：AMD Ryzen 9 7950X3D（16C/32T）  
- **主机板**：ASUS ROG STRIX X670E-A GAMING WIFI  
- **RAM**：64GB DDR5  
- **GPU**：NVIDIA RTX 4080 SUPER + AMD iGPU  
- **储存**：NVMe SSD  
- **双系统**：Windows 11 + Gentoo  

> 以上为示例，步骤对多数 x86_64 平台通用。

---

## 0. 下载与制作安装媒体 {#0-下载与制作安装媒体}

**官方镜像列表**：<https://www.gentoo.org/downloads/mirrors/>

- **中国大陆**：通常**必须**使用境内镜像（中科大 USTC / 清华 TUNA / 阿里云），否则下载速度与连线稳定性可能不足。  
- **台湾**：建议使用 **NCHC**；**澳洲**：AARNET。

### 0.1 下载 ISO（示例：台湾 NCHC）
```bash
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso
```

> 若在中国大陆，可将网址换成：`https://mirrors.ustc.edu.cn/gentoo/`、`https://mirrors.tuna.tsinghua.edu.cn/gentoo/` 或 `https://mirrors.aliyun.com/gentoo/`。

### 0.2 制作 USB 安装碟
**Linux（dd）**：
```bash
sudo dd if=install-amd64-minimal.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
> 将 `sdX` 换成 USB 装置名称（如 `/dev/sdb`）。

**Windows（Rufus）**：<https://rufus.ie/>  
1. 选择 USB 与 Gentoo ISO  
2. 模式选 **dd 模式**（非 ISO 模式）  
3. Start

---

## 1. 开机与网路 {#1-开机与网路}

### 1.1 确认 UEFI / BIOS
```bash
ls /sys/firmware/efi
```
有输出 → **UEFI**；没有 → **Legacy BIOS**。

### 1.2 有线网路（Live 环境）
```bash
ip a
dhcpcd eno1
ping -c 3 gentoo.org
```

### 1.3 Wi‑Fi（两种工具择一）

**wpa_supplicant**：
```bash
iw dev
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp9s0 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp9s0
ping -c 3 gentoo.org
```

**iwd（更简单，推荐新手）**：
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
> 若 WPA3 不稳，先改用 WPA2 试试。

### 1.4 （可选）临时开启 SSH（root 密码登入）
目的：方便在另一台电脑远端继续安装、复制贴上长指令。仅限安装阶段，完成后请关闭。

1. 设定 root 密码（若未设定）：
   ```bash
   passwd
   ```
2. 临时允许 root 与密码登入：
   ```bash
   echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
   echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config
   ```
3. 启动 sshd：
   ```bash
   rc-service sshd start
   ```
4. 查询 IP：
   ```bash
   ip a | grep inet
   ```
5. 从工作机连线：
   ```bash
   ssh root@<安装机IP>
   ```
安全提醒：完成安装后编辑 `/etc/ssh/sshd_config` 移除上述两行或改为 `PermitRootLogin prohibit-password`，再重启 sshd。

（以下继续下一章节：磁碟分割）

## 2. 磁碟分割（lsblk 与 cfdisk） {#2-磁碟分割lsblk-与-cfdisk}
检视磁碟：
```bash
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT
```
范例：
```
nvme0n1    476G disk
├─nvme0n1p1 512M part
├─nvme0n1p2   1G part
├─nvme0n1p3 100G part
└─nvme0n1p4 375G part
```

启动分割工具（可选）：
```bash
cfdisk /dev/nvme0n1
```

**建议分割（UEFI）**：  
| 大小 | 档案系统 | 挂载点 | 说明 |
|---|---|---|---|
| 512M | FAT32 | /efi | ESP（UEFI 系统分割区） |
| 1G | ext4 | /boot | kernel、initramfs |
| 100G+ | ext4 / XFS / Btrfs | / | 根分割区 |
| 其余 | ext4 / XFS / Btrfs | /home | 使用者家目录 |

> 你也可以选择只有 / 与 /efi 的简化方案。

---

## 3. 档案系统格式化与挂载（ext4 / XFS / Btrfs） {#3-档案系统格式化与挂载ext4--xfs--btrfs}

### 3.1 格式化
**ext4**：
```bash
mkfs.ext4 -L root /dev/nvme0n1p3
mkfs.ext4 -L home /dev/nvme0n1p4
```

**XFS**：
```bash
mkfs.xfs -L root /dev/nvme0n1p3
mkfs.xfs -L home /dev/nvme0n1p4
```

**Btrfs**（必要时可用 `-f` 强制覆盖，⚠️ 会抹除该分割区资料）：
```bash
mkfs.btrfs -L rootfs /dev/nvme0n1p3
mkfs.btrfs -L home   /dev/nvme0n1p4
# 需要强制时：mkfs.btrfs -f -L rootfs /dev/nvme0n1p3
```

### 3.2 挂载（完整流程）

**ext4 / XFS**：
```bash
mount /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{boot,home,efi}
mount /dev/nvme0n1p4 /mnt/gentoo/home
mount /dev/nvme0n1p2 /mnt/gentoo/boot
mount /dev/nvme0n1p1 /mnt/gentoo/efi
```

**Btrfs（子卷）**：
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

## 4. 下载 Stage3、挂载系统目录与 chroot {#4-下载-stage3挂载系统目录与-chroot}

### 4.1 选择 Stage3
- 建议下载 **标准 Stage3（glibc）**，依需求选 **OpenRC** 或 **systemd**。  
- 「desktop」Stage3 只是预设桌面化 USE，**非必须**；用标准 Stage3 + 正确 **Profile** 更灵活。

### 4.2 下载与解压
```bash
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

> 同 ISO，一样可选择就近的镜像源下载 Stage3。

### 4.3 挂载系统目录（依 init 系统不同）
**OpenRC**：
```bash
mount -t proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
```

**systemd**：
```bash
mount -t proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys && mount --make-rslave /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev && mount --make-rslave /mnt/gentoo/dev
mount --rbind /run /mnt/gentoo/run && mount --make-rslave /mnt/gentoo/run
```

### 4.4 进入 chroot
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) $PS1"
```

---

## 5. Portage 与镜像源（含 makeconf 完整示例） {#5-portage-与镜像源含-makeconf-完整示例}

### 5.1 同步 Portage 树
```bash
emerge-webrsync
emerge --sync
```

### 5.2 选择镜像源（择一）
**互动工具**：
```bash
emerge --ask app-portage/mirrorselect
mirrorselect -i -o >> /etc/portage/make.conf
```
**手动指定（建议最终只保留一条）**：
```bash
echo 'GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"' >> /etc/portage/make.conf
```

> ⚠️ 避免重复与冲突：`mirrorselect` 可能加入多条镜像，建议最后仅保留速度最快的一条。

### 5.3 `/etc/portage/make.conf` 完整示例（含注解）
```conf
# 编译器参数：O2 与 pipe 足够，多数情况不需要 -Ofast
COMMON_FLAGS="-march=native -O2 -pipe"

# 平行编译：通常设成 CPU 执行绪数
MAKEOPTS="-j32"

# Portage 预设行为：互动、详细、拉进建置依赖、完整图
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# 镜像：请最终仅保留一条（下例为台湾 NCHC）
GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"

# 全域 USE（两套典型选择二择一；也可同时保留 xwayland 做相容）
USE="wayland egl pipewire vulkan"
# USE="X xwayland egl pipewire vulkan"

# 显示卡：请只填你的硬体（不要全抄）
# 例：NVIDIA 新卡
VIDEO_CARDS="nvidia"
# 例：AMD
# VIDEO_CARDS="amdgpu radeonsi"
# 例：Intel
# VIDEO_CARDS="intel i965 iris"
# 例：老 NVIDIA 或想用开源
# VIDEO_CARDS="nouveau"

# 接受授权：新手可暂时开放全部，之后细化至 package.license
ACCEPT_LICENSE="*"
```

---

## 6. USE flags 与 License（新手解法） {#6-use-flags-与-license新手解法}

### 6.1 查询与理解 USE
```bash
emerge -pv firefox
```

### 6.2 对单一套件加入 USE
```bash
echo "media-video/ffmpeg X wayland" >> /etc/portage/package.use/ffmpeg
```

### 6.3 同意授权（例：Chrome）
```bash
echo "www-client/google-chrome google-chrome" >> /etc/portage/package.license
```

### 6.4 关键词（较新版本）
```bash
echo "www-client/google-chrome ~amd64" >> /etc/portage/package.accept_keywords
```
> 仅在需要较新（测试）版本时使用。

---

## 7. 选择 Profile（桌面／伺服器） {#7-选择-profile桌面伺服器}

列出可用 Profile：
```bash
eselect profile list
```

常见选择：
- **KDE + systemd**：`default/linux/amd64/23.0/desktop/plasma/systemd`  
- **GNOME + systemd**：`default/linux/amd64/23.0/desktop/gnome/systemd`  
- **桌面 + OpenRC**：`default/linux/amd64/23.0/desktop` 或对应 plasma/openrc 变体  
- **伺服器**：`default/linux/amd64/23.0`（较精简）

套用并更新系统：
```bash
eselect profile set <编号>
emerge -avuDN @world
```

> Profile 会设定一组预设 USE；需要时再以 package.use 调整。

---

## 8. 本地化 Localization（语言与时区） {#8-本地化-localization语言与时区}

**语言（/etc/locale.gen）**：
```conf
en_US.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```
产生并套用：
```bash
locale-gen
eselect locale set en_US.utf8
```

**时区**：
```bash
ls /usr/share/zoneinfo
echo "Asia/Taipei" > /etc/timezone
emerge --config sys-libs/timezone-data
```
完整清单：<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>

**字型与输入法（可选）**：
```bash
emerge media-fonts/noto-cjk
emerge app-i18n/fcitx5 app-i18n/fcitx5-rime
```

---

## 9. 内核选择与编译（完整指令） {#9-内核选择与编译完整指令}
### 9.1 最简方案：预编译内核
```bash
emerge sys-kernel/gentoo-kernel-bin
```

### 9.x linux-firmware 授权解除 + initramfs USE
若要包含最新硬体韧体并在开机初期 (initramfs) 载入：
1. 解除授权限制（允许安装该套件的再散布 / 无原始码授权）：
   ```bash
   echo "sys-kernel/linux-firmware linux-fw-redistributable no-source-code" >> /etc/portage/package.license
   ```
2. 启用 initramfs USE（将韧体打包进 early firmware）：
   ```bash
   echo "sys-kernel/linux-firmware initramfs" >> /etc/portage/package.use/microcode
   ```
3. 安装韧体（建议在安装或更新内核前后皆可执行一次）：
   ```bash
   emerge --ask sys-kernel/linux-firmware
   ```
若已安装内核，完成后可重新产生 initramfs 以载入新韧体。

### 9.2 自行编译
```bash
emerge sys-kernel/gentoo-sources
cd /usr/src/linux
make menuconfig
make -j"$(nproc)"
make modules_install
make install
```

**Initramfs（Btrfs、LUKS、RAID 或模组化驱动建议）**  
Dracut：
```bash
emerge sys-kernel/dracut
dracut --kver "$(ls /lib/modules | sort -V | tail -1)"
```
Genkernel：
```bash
emerge sys-kernel/genkernel
genkernel initramfs
```

---

## 10. 产生 fstab（含 Btrfs / ext4 范围） {#10-产生-fstab含-btrfs--ext4-范例}

查询 UUID：
```bash
blkid
lsblk -f
```

**ext4**：
```fstab
UUID=<UUID-ESP>  /efi   vfat  noatime,umask=0077 0 2
UUID=<UUID-BOOT> /boot  ext4  noatime            0 2
UUID=<UUID-ROOT> /      ext4  noatime            0 1
UUID=<UUID-HOME> /home  ext4  noatime            0 2
```

**Btrfs（子卷）**：
```fstab
UUID=<UUID-ESP>  /efi   vfat   noatime,umask=0077 0 2
UUID=<UUID-ROOT> /      btrfs  noatime,compress=zstd,subvol=@     0 1
UUID=<UUID-ROOT> /home  btrfs  noatime,compress=zstd,subvol=@home 0 2
```

---

## 11. 安装开机器 GRUB（含 os-prober） {#11-安装开机器-grub含-os-prober}
```bash
emerge grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo
emerge --ask sys-boot/os-prober
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub
grub-mkconfig -o /boot/grub/grub.cfg
```

若 root 使用 Btrfs：
```bash
emerge --ask sys-fs/btrfs-progs
```

---

## 12. 启用网路服务（OpenRC / systemd） {#12-启用网路服务openrc--systemd}

**systemd**：
```bash
emerge net-misc/networkmanager
systemctl enable NetworkManager
```

**OpenRC**：
```bash
emerge net-misc/dhcpcd
rc-update add dhcpcd default
```

---

## 13. Wayland / X11 选择与 USE {#13-wayland--x11-选择与-use}

**Wayland**：
```conf
USE="wayland egl pipewire vulkan"
```

**X11**：
```conf
USE="X xwayland egl pipewire vulkan"
```

> 可同时启用 xwayland 以兼容 X11 程式。

---

## 14. 显示卡与 CPU 微码 {#14-显示卡与-cpu-微码}

**NVIDIA 专有**：
```conf
VIDEO_CARDS="nvidia"
```
```bash
emerge x11-drivers/nvidia-drivers
```

**Nouveau（开源）**：
```conf
VIDEO_CARDS="nouveau"
```
```bash
emerge x11-base/xorg-drivers
```

**AMD**：
```conf
VIDEO_CARDS="amdgpu radeonsi"
```
```bash
emerge mesa vulkan-loader
```

**Intel**：
```conf
VIDEO_CARDS="intel i965 iris"
```
```bash
emerge mesa vulkan-loader
```

**CPU 微码（Intel）**：
```bash
emerge sys-firmware/intel-microcode
```

---

## 15. 桌面环境（可选） {#15-桌面环境可选}

**KDE Plasma**：
```bash
emerge kde-plasma/plasma-meta x11-misc/sddm x11-base/xwayland
systemctl enable sddm
```

**GNOME**：
```bash
emerge gnome-base/gnome gnome-base/gdm
systemctl enable gdm
```

---

## 16. 使用者与 sudo {#16-使用者与-sudo}
```bash
passwd
useradd -m -G wheel,audio,video,usb -s /bin/bash zakk
passwd zakk
emerge app-admin/sudo
echo "%wheel ALL=(ALL) ALL" >> /etc/sudoers
```
> ⚠️ 请将 `zakk` 替换为你的使用者名称。

---

## 17. SSH（可选） {#17-ssh可选}
```bash
emerge net-misc/openssh
systemctl enable sshd && systemctl start sshd
```

---

## 18. 重开机 {#18-重开机}
```bash
exit
umount -R /mnt/gentoo
reboot
```

---

# 💡 常见问题 FAQ {#faq-zh}
- **下载慢／超时**：中国大陆请用境内镜像；其他地区选最近镜像。  
- **Wi‑Fi 连不上**：检查驱动与介面名称；WPA3 不稳改 WPA2。  
- **Wayland / X11**：AMD/Intel 新平台优先 Wayland；相容性需求选 X11 + xwayland。  
- **NVIDIA 选择**：新卡建议 `nvidia-drivers`；旧卡或完全开源可试 `nouveau`（效能较低）。  
- **USE 冲突**：`emerge -pv <套件>` 依提示拆分到 `package.use`。  
- **License 阻挡**：将授权加入 `package.license`。  
- **需要新版**：使用 `package.accept_keywords`。  
- **Btrfs + LUKS/RAID**：建议使用 initramfs（dracut 或 genkernel）。  

---

# 📎 参考 {#refs-zh}
- Gentoo Handbook：<https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation>  
- Bitbili：<https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html>  
- Rufus：<https://rufus.ie/>  
- 时区列表（tz database）：<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>
