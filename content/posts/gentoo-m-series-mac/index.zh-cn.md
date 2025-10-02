---
slug: gentoo-m-series-mac-arm64
title: "Gentoo ARM64 安装指南:Apple Silicon (M 系列芯片) Mac"
date: 2025-10-02
tags: ["Gentoo","Linux","ARM64","Apple Silicon","M1","M2","M3","Asahi Linux"]
categories: ["Linux 笔记"]
draft: false
description: "完整指导如何在 Apple Silicon Mac (M1/M2/M3) 上安装 Gentoo Linux ARM64 系统:通过 Asahi Linux 引导程序实现原生 ARM64 Linux 环境。"
ShowToc: false
TocOpen: false
translationKey: "gentoo-m-series-mac-arm64"
authors:
   - "Zakk"
seo:
   description: "详细说明如何在 Apple Silicon Mac (M1/M2/M3/M4) 上安装 Gentoo Linux ARM64 系统,涵盖 Asahi Linux 引导、LUKS 加密、Stage3 解压、内核编译、桌面环境配置等完整流程。"
   keywords:
      - "Gentoo ARM64"
      - "Apple Silicon"
      - "M1 Mac Gentoo"
      - "M2 Mac Linux"
      - "M3 Mac 安装"
      - "Asahi Linux"
      - "ARM64 Linux"
      - "Zakk 博客"
---

{{< lead >}}
本指南将带你在 Apple Silicon Mac (M1/M2/M3/M4) 上安装原生 ARM64 架构的 Gentoo Linux。

**重要更新**:感谢 Asahi Linux 团队(特别是 [chadmed](https://wiki.gentoo.org/index.php?title=User:Chadmed&action=edit&redlink=1))的出色工作,现在有了[官方 Gentoo Asahi 安装指南](https://wiki.gentoo.org/wiki/Project:Asahi/Guide),流程大幅简化。本指南参考了原始的 [Jared's M1 Mac Guide](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac),并整合了最新的最佳实践。

测试时间为 2025 年 10 月,涵盖完整的 LUKS 加密根分区与 systemd 配置。
{{< /lead >}}

> **目标平台**:Apple Silicon Mac (M1/M2/M3/M4) ARM64 架构。本指南使用 Asahi Linux 引导程序进行初始配置,然后过渡到完整的 Gentoo 环境。

---

## 安装流程概览

1. 通过 Asahi Linux 安装程序准备系统
2. 完成 Asahi Linux (Fedora) 基础配置
3. 创建 Gentoo "liveusb" 环境 (initramfs)
4. 配置加密文件系统与分区
5. 解压 Stage3 并进入 chroot
6. 配置 Portage 并应用 Asahi overlay
7. 编译 ARM64 内核与 initramfs
8. 配置桌面环境与日常维护

此过程会在你的 Mac 上创建双启动设置:macOS + Gentoo Linux ARM64。

---

## 前置要求与重要说明 {#prerequisites}

### 硬件需求

- Apple Silicon Mac (M1/M2/M3/M4 系列芯片)
- 至少 80 GB 可用磁盘空间(建议 120 GB+)
- 稳定的网络连接(Wi-Fi 或有线)
- 所有重要数据的备份

### 重要警告

⚠️ **本指南涉及高级操作**:
- 会修改你的分区表
- 需要与 macOS 共存
- 涉及加密磁盘操作
- Apple Silicon Linux 支持仍在积极开发中

✅ **已知可正常工作的功能**:
- CPU、内存、存储
- Wi-Fi (通过 Asahi Linux 固件)
- 键盘、触控板、电池管理
- 显示输出(内置屏幕与外接显示器)
- USB-C / Thunderbolt

⚠️ **已知限制**:
- Touch ID 不可用
- macOS 虚拟化功能受限
- 部分较新硬件功能可能未完全支持
- GPU 加速仍在开发中(部分 OpenGL 支持)

---

## 0. 准备 Asahi Linux 启动环境 {#step-0-asahi}

### 0.1 运行 Asahi Linux 安装程序

在 macOS 终端中执行:

```bash
curl https://alx.sh | EXPERT=1 sh
```

> ⚠️ **安全提示**:执行前可先访问 <https://alx.sh> 查看脚本内容。

### 0.2 按提示进行配置

安装程序会引导你完成:

1. **选择分区空间**:决定分配给 Linux 的空间(建议至少 120 GB)
   - 输入 `r` 调整现有分区大小
   - 可使用百分比(如 `50%`)或绝对大小(如 `120GB`)

2. **选择操作系统**:选择 **Fedora Asahi Remix 39 Minimal** (选项 4)
   ```
   » OS: 4
   ```

3. **设置名称**:输入 `Gentoo` 作为操作系统名称
   ```
   » OS name (Fedora Linux Minimal): Gentoo
   ```

4. **完成安装**:**不要立即按 Enter 关机!** 请先阅读下方"完成安装"步骤。

---

## 1. 完成 Asahi Linux 安装并启动 {#step-1-boot}

### 1.1 关键重启步骤

当安装程序显示"Press enter to shut down the system"时:

**先不要按 Enter!** 按以下步骤操作:

1. **等待 15 秒**确保系统完全关机
2. **长按电源键**直到看到"Entering startup options"或旋转图标
3. **松开电源键**
4. 等待卷列表出现,选择 **Gentoo**
5. 你会看到类似 macOS 恢复界面的画面:
   - 如果询问"Select a volume to recover",选择你的 macOS 卷
   - 输入 macOS 用户密码(FileVault 用户)
6. 按屏幕指示完成设置

### 1.2 配置 Fedora Minimal 系统

系统会要求你设置基本配置:

```
1) [ ] Language Options           2) [x] Time Settings
3) [x] Network Configuration      4) [!] Root password
5) [!] User Creation
```

**设置 root 密码**(必需):
```
Please make a selection: 4
Password: <输入密码>
Password (confirm): <再次输入>
```

然后输入 `q` 并确认 `yes` 退出(无需创建用户,稍后在 Gentoo 中创建)。

### 1.3 连接网络

以 root 登录后,连接 Wi-Fi:

```bash
nmcli device wifi connect <SSID> password <密码>
ping -c 3 www.gentoo.org
```

### 1.4 更新系统

```bash
dnf upgrade --refresh
```

完成后重启:
```bash
reboot
```

---

## 2. 创建 Gentoo "liveusb" 环境 {#step-2-liveusb}

### 2.1 安装必需工具

```bash
dnf install git wget
```

### 2.2 获取 asahi-gentoosupport

```bash
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
```

### 2.3 下载 Gentoo ARM64 Minimal ISO

使用辅助脚本(建议先查看内容):

```bash
curl -L https://raw.githubusercontent.com/jaredallard/gentoo-m1-mac/main/fetch-latest-minimal-iso.sh | sh
```

该脚本会:
- 获取最新的 `install-arm64-minimal-*.iso`
- 验证 GPG 签名
- 将文件重命名为 `install.iso`

### 2.4 生成 initramfs liveusb

```bash
./genstrap.sh
```

脚本会:
- 解压 ISO 内容
- 创建 initramfs
- 在 GRUB 中添加"Gentoo Live Install environment"选项

完成后重启:
```bash
reboot
```

从 GRUB 菜单中选择 **Gentoo Live Install Environment**。

---

## 3. 配置网络 (Live 环境) {#step-3-network-live}

### 3.1 连接 Wi-Fi

在 Gentoo live 环境中使用 `net-setup`:

```bash
net-setup
```

按照交互式提示配置网络,之后验证:

```bash
ifconfig | grep w -A 2 | grep "inet "
ping -c 3 www.gentoo.org
```

> 💡 **提示**:如果 Wi-Fi 不稳定,可能是 WPA3 兼容性问题。尝试连接 WPA2 或 2.4 GHz 网络。

### 3.2 (可选) 启用 SSH 远程访问

```bash
passwd                     # 设置 root 密码
/etc/init.d/sshd start
ip a | grep inet          # 获取 IP 地址
```

从另一台电脑连接:
```bash
ssh root@<IP>
```

---

## 4. 准备加密文件系统 {#step-4-filesystem}

### 4.1 识别分区

```bash
blkid --label fedora          # asahi-root 分区(未来的 /)
blkid --label "EFI - GENTO"   # EFI 分区 (/boot)
```

记录 `asahi-root` 的设备路径,如 `/dev/nvme0n1p5`。

### 4.2 创建 LUKS2 加密分区

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p5
```

输入 `YES` 确认,然后设置加密密码。

**为什么使用这些参数?**
- `argon2id`:抵抗 ASIC/GPU 暴力破解
- `aes-xts`:硬件加速支持(M1 有 AES 指令集)
- `luks2`:提供更好的安全工具(如 `cryptsetup reencrypt`)

### 4.3 打开加密分区并格式化

```bash
cryptsetup luksOpen /dev/nvme0n1p5 luks
mkfs.btrfs --label root /dev/mapper/luks
```

### 4.4 挂载文件系统

```bash
mkdir -p /mnt/gentoo
mount /dev/mapper/luks /mnt/gentoo
cd /mnt/gentoo
```

---

## 5. 下载并解压 Stage3 {#step-5-stage3}

### 5.1 下载 ARM64 Stage3

使用辅助脚本:

```bash
curl -L https://raw.githubusercontent.com/jaredallard/gentoo-m1-mac/main/fetch-stage-3.sh | bash
```

将下载 `stage3-arm64-desktop-systemd-*.tar.xz` 并验证签名。

### 5.2 解压 Stage3

```bash
tar xpvf latest-stage3-arm64-desktop-systemd.tar.xz --xattrs-include='*.*' --numeric-owner
```

### 5.3 配置 Portage 仓库

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

---

## 6. 进入 chroot 环境 {#step-6-chroot}

### 6.1 准备 chroot

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

### 6.2 进入 chroot

```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

### 6.3 挂载 /boot

```bash
# 使用之前 blkid 查询到的 EFI 分区编号
mount /dev/nvme0n1p4 /boot
```

---

## 7. 配置基本系统 {#step-7-configure}

### 7.1 配置 make.conf

编辑 `/etc/portage/make.conf`:

```bash
nano -w /etc/portage/make.conf
```

```conf
CHOST="aarch64-unknown-linux-gnu"

# 针对 Apple Silicon 优化
COMMON_FLAGS="-march=armv8.5-a+fp16+simd+crypto+i8mm -mtune=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
RUSTFLAGS="-C target-cpu=native"

LC_MESSAGES=C

# 根据你的 CPU 核心数调整(M1/M2 Pro/Max 有更多核心)
MAKEOPTS="-j8"

# 镜像站(选择离你较近的)
GENTOO_MIRRORS="https://mirror.aarnet.edu.au/pub/gentoo/"

EMERGE_DEFAULT_OPTS="--jobs 3 --quiet-build"

# 使用 Asahi Mesa
VIDEO_CARDS="asahi"

# 保留尾部换行符
```

### 7.2 同步 Portage 树

```bash
emerge-webrsync
emerge --sync
emerge --ask --verbose --oneshot portage
```

### 7.3 时区与语言

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

nano -w /etc/locale.gen
# 取消注释:
# zh_CN.UTF-8 UTF-8
# en_US.UTF-8 UTF-8

locale-gen
eselect locale set zh_CN.utf8
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 7.4 创建用户

```bash
useradd -m -G wheel,audio,video,usb,input <用户名>
passwd <用户名>
passwd root

emerge --ask app-admin/sudo
visudo  # 取消注释 %wheel ALL=(ALL) ALL
```

---

## 8. 安装 Asahi 内核与固件 {#step-8-kernel}

### 8.1 安装必需工具

```bash
emerge --ask dev-vcs/git
```

### 8.2 运行 asahi-gentoosupport 安装脚本

```bash
cd /
git clone https://github.com/chadmed/asahi-gentoosupport
cd asahi-gentoosupport
./install.sh
```

该脚本会:
- 安装 Asahi overlay
- 屏蔽 `media-libs/mesa::gentoo`(使用 Asahi 版本)
- Emerge `sys-apps/asahi-meta`(包含内核与固件)
- 配置 U-Boot 与 m1n1

### 8.3 配置 dracut 以支持 LUKS

创建 `/etc/dracut.conf.d/luks.conf`:

```bash
mkdir -p /etc/dracut.conf.d
nano -w /etc/dracut.conf.d/luks.conf
```

```ini
# GRUB 会覆盖 kernel_cmdline
kernel_cmdline=""
add_dracutmodules+=" btrfs systemd crypt dm "
install_items+=" /sbin/cryptsetup /bin/grep "
filesystems+=" btrfs "
```

### 8.4 获取分区 UUID

```bash
blkid /dev/mapper/luks    # 记录 btrfs UUID
blkid /dev/nvme0n1p4      # 记录 boot UUID
```

### 8.5 配置 GRUB

编辑 `/etc/default/grub`:

```bash
nano -w /etc/default/grub
```

```conf
GRUB_CMDLINE_LINUX="rd.auto=1 rd.luks.allow-discards"
GRUB_DEVICE_UUID="<btrfs UUID>"
```

更新 GRUB 配置:
```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### 8.6 配置 fstab

编辑 `/etc/fstab`:

```bash
nano -w /etc/fstab
```

```fstab
UUID=<btrfs UUID>  /      btrfs  rw,defaults  0 1
UUID=<boot UUID>   /boot  vfat   rw,defaults  0 2
```

### 8.7 构建 initramfs

```bash
emerge --ask sys-fs/cryptsetup sys-fs/btrfs-progs sys-apps/grep net-misc/networkmanager

# 配置 systemd 支持 cryptsetup
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde
emerge --ask --newuse sys-apps/systemd

# 构建 initramfs
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

---

## 9. 最终调整与重启 {#step-9-reboot}

### 9.1 启用 NetworkManager

```bash
systemctl enable NetworkManager
```

### 9.2 退出 chroot 并重启

```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
cryptsetup luksClose luks
reboot
```

### 9.3 首次启动

1. 从 U-Boot 菜单中选择 Gentoo
2. GRUB 会加载并显示解密提示
3. 输入你的 LUKS 密码
4. 系统应成功启动到登录提示符

---

## 10. 安装后步骤 {#step-10-post}

### 10.1 连接网络

```bash
nmcli device wifi connect <SSID> password <密码>
```

### 10.2 更新系统

```bash
emerge --sync
emerge -avuDN @world
emerge --depclean
```

### 10.3 安装桌面环境

**GNOME (原生 Wayland):**
```bash
emerge --ask gnome-base/gnome
systemctl enable gdm
```

**KDE Plasma:**
```bash
emerge --ask kde-plasma/plasma-meta
systemctl enable sddm
```

**轻量级选项:**
```bash
emerge --ask xfce-base/xfce4-meta
emerge --ask x11-misc/lightdm
systemctl enable lightdm
```

---

## 故障排除 {#faq}

### 问题:启动时卡在"Waiting for root device"

**原因**:dracut 无法找到加密分区或 UUID 错误。

**解决方案**:
1. 启动到紧急模式
2. 手动解锁:
   ```bash
   cryptsetup luksOpen /dev/nvme0n1p5 luks
   exit
   ```
3. 重新检查 `/etc/default/grub` 中的 UUID

### 问题:Wi-Fi 固件无法加载

**原因**:`/lib/firmware/vendor` 目录不存在。

**解决方案**:
```bash
mkdir -p /lib/firmware/vendor
reboot
```

### 问题:GPU 加速无法正常工作

**原因**:Asahi Mesa 仍在开发中。

**解决方案**:
- 确保使用 `VIDEO_CARDS="asahi"`
- 检查 `eselect mesa list`
- 部分 3D 加速功能可能尚未支持

### 问题:电池快速耗电

**原因**:电源管理调优进行中。

**建议**:
```bash
emerge --ask sys-power/tlp
systemctl enable tlp
```

---

## 维护与更新 {#maintenance}

### 常规更新流程

```bash
# 更新 Portage 树
emerge --sync

# 更新所有软件包
emerge -avuDN @world

# 清理不需要的软件包
emerge --depclean

# 更新配置文件
dispatch-conf

# 重建 initramfs(如果内核更新)
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
grub-mkconfig -o /boot/grub/grub.cfg
```

### 跟踪 Asahi 开发

- [Asahi Linux 官方博客](https://asahilinux.org/blog/)
- [Gentoo Asahi 项目](https://wiki.gentoo.org/wiki/Project:Asahi)
- [asahi-gentoosupport GitHub](https://github.com/chadmed/asahi-gentoosupport)

---

## 参考资料 {#reference}

- [Gentoo Wiki: Project:Asahi/Guide](https://wiki.gentoo.org/wiki/Project:Asahi/Guide)
- [User:Jared/Gentoo On An M1 Mac](https://wiki.gentoo.org/wiki/User:Jared/Gentoo_On_An_M1_Mac)
- [Asahi Linux 官方网站](https://asahilinux.org/)
- [Gentoo ARM64 手册](https://wiki.gentoo.org/wiki/Handbook:ARM64)

祝你在 Apple Silicon 上享受 Gentoo!如有问题欢迎在 Gentoo 论坛或 `#gentoo` / `#asahi` IRC/Discord 频道提问。
