---
slug: gentoo-install
title: "Gentoo 安装指南（新手）"
date: 2025-09-01
tags: ["Gentoo","Linux","OpenRC","systemd"]
categories: ["Linux 笔记"]
draft: false
description: "从零开始的 Gentoo 安装教学：分区、Stage3、Portage、USE、内核、桌面环境与常见问题完整步骤。"
ShowToc: false
TocOpen: false
translationKey: "gentoo-install"
authors:
  - "Zakk"
seo:
  description: "Gentoo Linux 新手安装全指南，涵盖磁盘分区、Stage3 展开、Portage 与 USE Flags 设置、内核编译、OpenRC 与 systemd 切换，以及 GNOME / KDE 桌面部署。"
  keywords:
    - "Gentoo 安装"
    - "Gentoo 教程"
    - "USE Flags"
    - "Portage 入门"
    - "OpenRC 设置"
    - "systemd"
    - "Zakk 博客"
---

{{< lead >}}
这篇笔记整理自我在台式机与笔电上重装 Gentoo 的完整流程。
这是我当前的电脑配置：

- CPU: AMD Ryzen 9 7950X3D (16C/32T)
- Motherboard: ASUS ROG STRIX X670E-A GAMING WIFI
- RAM: 64GB DDR5
- GPU: NVIDIA RTX 4080 SUPER + AMD iGPU
- Storage: NVMe SSD
- Dual boot: Windows 11 + Gentoo

已对照 2025 年 10 月的官方文档重新验证。照着步骤操作，就能从空白硬盘部署一套可日常使用的 Gentoo 桌面环境。
{{< /lead >}}

> 本指南以 x86_64 UEFI 环境为前提，同时提供 OpenRC / systemd 两种做法。如果你使用 BIOS 或其他架构，请对照 Gentoo 官方手册自行调整。

---

## 安装流程总览

1. 准备启动媒介并确认网络
2. 规划磁盘分区与文件系统
3. 展开 Stage3 并进入 chroot
4. 配置 Portage、USE、Profile 与本地化
5. 安装内核、固件与必要工具
6. 设置引导程序与用户账号
7. 部署桌面环境与常用软件
8. 首次重启、验证并安排后续维护

每个章节都附上完整指令与替代方案，流程中任何一步都可以随时回头检查。

---

## 事前准备 {#prerequisites}

- 一台支持 UEFI 的 x86_64 机器（台式机或笔电）
- 8 GB 以上的 USB 随身碟
- 稳定的网络（若在中国大陆请预先选定境内镜像）
- 第二台装置方便查阅文档或 SSH 远端操作（强烈建议）
- 至少 30 GB 的可用磁盘空间


> 开始动手前请先备份所有重要资料


---

## 0. 下载与制作安装媒介 {#step-0-media}

### 0.1 选择镜像并下载 ISO

官方镜像列表：<https://www.gentoo.org/downloads/mirrors/>

| 地区 | 建议镜像 |
| ---- | -------- |
| 台湾 | `https://free.nchc.org.tw/gentoo/` |
| 澳洲 | `https://mirror.aarnet.edu.au/pub/gentoo/` |
| 中国大陆 | `https://mirrors.ustc.edu.cn/gentoo/`、`https://mirrors.tuna.tsinghua.edu.cn/gentoo/`、`https://mirrors.aliyun.com/gentoo/` |

下载 Minimal ISO（以台湾为例）：
```bash
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso.asc
```
> 如果希望安装时能直接使用浏览器或更方便地连接 Wi-Fi，可以选择 **LiveGUI USB Image**。

验证签章（可选）：
```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992
gpg --verify install-amd64-minimal.iso.asc install-amd64-minimal.iso
```

### 0.2 制作 USB 安装碟

**Linux：**
```bash
sudo dd if=install-amd64-minimal.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
> 请将 `sdX` 替换成 USB 装置名称，例如 `/dev/sdb`、`/dev/nvme1n1`。

**macOS：**
```bash
diskutil list
diskutil unmountDisk /dev/diskN
sudo dd if=install-amd64-minimal.iso of=/dev/rdiskN bs=4m
sudo diskutil eject /dev/diskN
```

**Windows：** 推荐使用 [Rufus](https://rufus.ie/) → 选择 ISO → 写入时选 DD 模式。

---

## 1. 进入 Live 环境并连上网络 {#step-1-network}

### 1.1 确认 UEFI
```bash
ls /sys/firmware/efi && echo "UEFI" || echo "Legacy BIOS"
```
若为 Legacy BIOS，请改用 MBR 分区与 GRUB。

### 1.2 有线网络
```bash
ip link
dhcpcd eno1
ping -c3 gentoo.org
```

### 1.3 无线网络

**wpa_supplicant：**
```bash
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp0s20f3 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp0s20f3
```

**iwd（简洁推荐）：**
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
> 若 WPA3 不稳定，请先退回 WPA2。

### 1.4 （可选）启动 SSH 方便远端操作
```bash
passwd                      # 设定 root 密码
rc-service sshd start
rc-update add sshd default
ip a | grep inet
# 在另一台设备上：ssh root@<IP>
```
完成安装后记得关闭或调整 `/etc/ssh/sshd_config` 的设置。

---

## 2. 规划磁盘分区 {#step-2-partition}

检查磁盘：
```bash
lsblk -o NAME,SIZE,TYPE
```

启动 `cfdisk` 或 `gdisk`：
```bash
cfdisk /dev/nvme0n1
```

| 建议分区 | 大小 | 文件系统 | 挂载点 | 备注 |
| -------- | ---- | -------- | ------ | ---- |
| ESP | 512 MB | FAT32 | /efi | `type EF00` |
| Boot | 1 GB | ext4 | /boot | 存放 kernel / initramfs |
| Root | 80~120 GB | ext4 / XFS / Btrfs | / | 系统与应用 |
| Home | 余量 | ext4 / XFS / Btrfs | /home | 用户资料 |
| Swap（可选） | 内存的 1~2 倍 | swap | swap | SSD 可改用 zram |

> 如果你想要最简配置，可以只保留 `/efi` + `/` 两个分区。

### 2.1 `cfdisk` 实战示例

下面的截图来自双系统笔电执行 `cfdisk /dev/nvme2n1` 的画面。方向键可以在分区间移动，底部的 `Type`、`Resize`、`Delete`、`Write` 等操作对应界面提示的按键。

```text
Disk: /dev/nvme2n1
                                                                                 Size: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
                                                                              Label: gpt, identifier: 9737D323-129E-4B5F-9049-8080EDD29C02

      Device                                          Start                      End                  Sectors                  Size Type
>>  /dev/nvme2n1p1                                     34                    32767                    32734                   16M Microsoft reserved                 
      /dev/nvme2n1p2                                  32768               1416650751               1416617984                675.5G Microsoft basic data
      /dev/nvme2n1p3                             1416650752               1418747903                  2097152                    1G EFI System
      /dev/nvme2n1p4                             1418747904               1435525119                 16777216                    8G Linux swap
      /dev/nvme2n1p5                             1435525120               1437622271                  2097152                    1G Linux filesystem
      /dev/nvme2n1p6                             1437622272               1953523711                515901440                  246G Linux filesystem










 ┌─                                                                                                                                                                ┐
 │Partition name: Microsoft reserved partition                                                                                                                     │
 │Partition UUID: 035B96B8-E321-4388-9C55-9FC0700AFF46                                                                                                             │
 │Partition type: Microsoft reserved (E3C9E316-0B5C-4DB8-817D-F92DF00215AE)                                                                                        │
 └─                                                                                                                                                                ┘
                                                             [ Delete ]  [ Resize ]  [  Quit  ]  [  Type  ]  [  Help  ]  [  Write ]  [  Dump  ]

                                                                         Device is currently in use, repartitioning is probably a bad idea.
                                                                                                Quit program without writing changes
```

> `cfdisk` 会在侦测到装置仍被使用时提醒你。若只是查看现有分区，请选择 `Quit` 离开，不要 `Write` 写入。确认要修改前务必完成备份，并再次核对分区大小与类型。

---

## 3. 建立文件系统并挂载 {#step-3-filesystem}

### 3.1 格式化
```bash
mkfs.vfat -F32 /dev/nvme0n1p1
mkfs.ext4 /dev/nvme0n1p2
mkfs.ext4 /dev/nvme0n1p3
mkfs.ext4 /dev/nvme0n1p4
mkswap /dev/nvme0n1p5
```
若使用 Btrfs：
```bash
mkfs.btrfs -L gentoo /dev/nvme0n1p3
```

### 3.2 挂载（ext4 示例）
```bash
mount /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{boot,efi,home}
mount /dev/nvme0n1p2 /mnt/gentoo/boot
mount /dev/nvme0n1p1 /mnt/gentoo/efi
mount /dev/nvme0n1p4 /mnt/gentoo/home
swapon /dev/nvme0n1p5
```

### 3.3 Btrfs 子卷示例
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

## 4. 下载 Stage3 并进入 chroot {#step-4-stage3}

### 4.1 选择 Stage3

- **OpenRC**：`stage3-amd64-openrc-*.tar.xz`
- **systemd**：`stage3-amd64-systemd-*.tar.xz`
- Desktop 变种只是预设开启部分 USE，标准版更灵活。

### 4.2 下载与展开
```bash
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```
如果同时下载了 `.DIGESTS` 或 `.CONTENTS`，可以用 `openssl` 或 `gpg` 验证。

### 4.3 复制 DNS 并挂载伪文件系统
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
> 使用 OpenRC 可以省略 `/run` 这一步。

### 4.4 进入 chroot
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

---

## 5. 初始化 Portage 与 make.conf {#step-5-portage}

### 5.1 同步树与安装辅助工具
```bash
emerge-webrsync
emerge --sync
emerge --ask app-portage/eix app-portage/gentoolkit
```

设置镜像（择一）：
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# 或手动：
echo 'GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"' >> /etc/portage/make.conf
```

### 5.2 make.conf 范例
```conf
COMMON_FLAGS="-march=native -O2 -pipe"
MAKEOPTS="-j$(nproc)"
ACCEPT_LICENSE="*"
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"
GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"

# Wayland 桌面常用旗标
USE="wayland pipewire vulkan egl"
# 若使用 X11：
# USE="X xwayland pipewire vulkan egl"

# 显示卡（只保留一组符合你的硬件）
VIDEO_CARDS="nvidia"
# VIDEO_CARDS="amdgpu radeonsi"
# VIDEO_CARDS="intel i965 iris"
```

### 5.3 package.use / license 基本写法
```bash
echo "sys-kernel/linux-firmware initramfs" >> /etc/portage/package.use/linux-firmware
echo "sys-kernel/linux-firmware linux-fw-redistributable no-source-code" >> /etc/portage/package.license
```

---

## 6. Profile、系统设置与本地化 {#step-6-system}

### 6.1 选择 Profile
```bash
eselect profile list
eselect profile set <编号>
emerge -avuDN @world
```
常见选项：
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop`（OpenRC 桌面）

### 6.2 时区与语言
```bash
echo "Asia/Taipei" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
echo "zh_TW.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
eselect locale set en_US.utf8
```

### 6.3 主机名与网络设置
```bash
echo "gentoo" > /etc/hostname
cat <<'NET' > /etc/conf.d/net
config_enp5s0="dhcp"
NET
```
OpenRC 网卡服务：
```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0
rc-update add net.enp5s0 default
```

systemd 或想改用 NetworkManager：
```bash
emerge --ask net-misc/networkmanager
gpasswd -a <username> plugdev
rc-update add NetworkManager default   # systemd 改用 systemctl enable NetworkManager
echo '[main]\ndhcp=internal' >> /etc/NetworkManager/NetworkManager.conf
```

### 6.4 fstab 范例
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

## 7. 内核与固件 {#step-7-kernel}

### 7.1 快速方案：预编译内核（安装时最稳）
```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```
内核升级后记得重新生成引导程序配置。

### 7.2 自行编译
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
cd /usr/src/linux
make menuconfig
```
建议启用：
- **Processor type and features**：选择对应的 AMD / Intel 选项
- **File systems**：开启你的根与家目录文件系统（ext4、XFS、Btrfs 等）
- **Device Drivers → Network device support**：加入你的网卡驱动
- **Firmware Drivers**：若需要在 initramfs 中加载固件请开启相关选项

使用 `genkernel` 自动化：
```bash
genkernel --install all
```

### 7.3 安装固件与微码
```bash
mkdir -p /etc/portage/package.license
# 同意 Linux 固件的授权条款
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/linux-firmware
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode  # Intel CPU
```

---

## 8. 基础工具与桌面前置 {#step-8-base-packages}

### 使用 Git 同步 Portage 树

先安装 Git，这样 `emerge --sync` 才能走 Git 渠道：

```bash
emerge --ask dev-vcs/git
```

若 `/etc/portage/repos.conf/gentoo.conf` 还不存在，可以先复制官方范例：

```bash
mkdir -p /etc/portage/repos.conf
cp /usr/share/portage/config/repos.conf /etc/portage/repos.conf/gentoo.conf
```

编辑文件中的 `[gentoo]` 区块（若已有同名字段请覆盖），加入：

```ini
sync-type = git
sync-uri = https://github.com/gentoo-mirror/gentoo.git
sync-depth = 1          # 只拉最新 commit，减小体积；需要完整历史就删掉
sync-git-clone-extra-opts = -b stable # 想跟着 stable 分支可以加
```

最后执行：

```bash
emerge --sync
```

> 以上设定让 `emerge --sync` 透过 Git 拉取最新 Portage 树。第一次同步会花久一点，之后都是增量更新。


### 基礎工具
```bash
emerge --ask app-editors/neovim app-shells/zsh
emerge --ask app-portage/cpuid2cpuflags
cpuid2cpuflags >> /etc/portage/make.conf
```

### 显示卡驱动
- **NVIDIA 专有驱动**：`emerge --ask x11-drivers/nvidia-drivers`
- **AMD**：设置 `VIDEO_CARDS="amdgpu radeonsi"`
- **Intel**：设置 `VIDEO_CARDS="intel i965 iris"`

### 音讯与蓝牙
```bash
emerge --ask media-video/pipewire media-video/wireplumber
emerge --ask media-sound/pavucontrol
emerge --ask net-wireless/bluez bluez-tools blueman
```
OpenRC：`rc-update add pipewire default`；systemd 使用用户服务。

---

## 9. 建立使用者与权限 {#step-9-users}

```bash
passwd root
useradd -m -G wheel,video,audio,plugdev zakk
passwd zakk
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel
```

若使用 systemd，可视需求将账号加入 `network`、`lp` 等群组。

---

## 10. 安装引导程序 {#step-10-bootloader}

### 10.1 systemd-boot（仅限 UEFI）
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
若使用 Btrfs 或 LUKS，请额外加入对应模块。

---

## 11. 桌面环境与显示管理器 {#step-11-desktop}

### 11.1 KDE Plasma（Wayland）
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
rc-update add gdm default   # systemd 请改用 systemctl enable gdm
```

### 11.3 其他选项
- `emerge --ask xfce-base/xfce4 xfce-extra/xfce4-meta`
- `emerge --ask gui-apps/cage`（极简 Wayland kiosk）

---

## 12. 重启前检查清单 {#step-12-checklist}

1. `emerge --info` 正常执行无错误
2. `/etc/fstab` 中的 UUID 正确（使用 `blkid` 再确认）
3. 已设定 root 与一般使用者密码
4. 已执行 `grub-mkconfig` 或完成 `bootctl` 配置
5. 若使用 LUKS，确认 initramfs 含有 `cryptsetup`

离开 chroot 并重启：
```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

## 13. 首次重启后的工作 {#step-13-post}

```bash
sudo emerge --sync
sudo emerge -avuDN @world
sudo emerge --ask --depclean
```

建立日常更新别名：
```bash
echo "alias update='sudo emerge --sync && sudo emerge -avuDN @world && sudo emerge --ask --depclean'" >> ~/.zshrc
```

### 推荐桌面套件
- 终端：`kitty`、`alacritty`
- 浏览器：`firefox`、`google-chrome`
- 办公：`libreoffice`
- Flatpak 支持：`emerge --ask sys-apps/flatpak`

---

## 常见问题与排错 {#faq}

- **镜像连不上**：在中国大陆请改用 USTC / TUNA / 阿里云，也可以透过 `proxychains` 走代理。
- **内核缺驱动**：`lspci -k` 检查驱动是否加载，若没有需要回到 `make menuconfig` 或改用 `gentoo-kernel-bin`。
- **重启后网络失效**：确认 `/etc/conf.d/net` 或 NetworkManager 是否启用；可尝试 `nmcli radio wifi on`。
- **Wayland 黑屏**：NVIDIA 仍有兼容问题，可暂时启用 `USE="X xwayland"` 并使用 SDDM 或 GDM。

---

## 参考资料 {#reference}

- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [bitbili：Gentoo Linux 安装与使用教程](https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html)
- 个人部署笔记（2023–2025）

祝安装顺利！若遇到问题，欢迎到 Gentoo Forums 或 Discord `#gentoo` 频道提问。---
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
authors:
   - "Zakk"
seo:
   description: "Gentoo Linux 新手安装全流程，覆盖磁盘分区、Stage3 展开、Portage 与 USE Flags 设置、内核编译、OpenRC 与 systemd 切换，以及 GNOME / KDE 桌面部署。"
   keywords:
      - "Gentoo 安装"
      - "Gentoo 教程"
      - "USE Flags"
      - "Portage 入门"
      - "OpenRC 设置"
      - "systemd"
      - "Zakk 博客"   
---

## 我的电脑配置（示例） {#my-hardware-zh}

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
