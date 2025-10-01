---
slug: gentoo-install
title: "Gentoo 安裝指南（新手）"
date: 2025-09-01
tags: ["Gentoo","Linux","OpenRC","systemd"]
categories: ["Linux 筆記"]
draft: false
description: "從零開始的 Gentoo 安裝教學：分割、Stage3、Portage、USE、Kernel、桌面環境與常見問題完整步驟。"
ShowToc: false
TocOpen: false
translationKey: "gentoo-install"
authors:
   - "Zakk"
seo:
   description: "Gentoo Linux 新手安裝全指南，涵蓋磁碟分割、Stage3 展開、Portage 與 USE Flags 設定、核心編譯、OpenRC 與 systemd 切換，以及 GNOME / KDE 桌面部署。"
   keywords:
      - "Gentoo 安裝"
      - "Gentoo 教學"
      - "USE Flags"
      - "Portage 入門"
      - "OpenRC 設定"
      - "systemd"
      - "Zakk 部落格"
---

{{< lead >}}
這篇筆記整理自我在桌機與筆電上重灌 Gentoo 的流程  
這是我的電腦配置如下：

- CPU: AMD Ryzen 9 7950X3D (16C/32T)
- Motherboard: ASUS ROG STRIX X670E-A GAMING WIFI
- RAM: 64GB DDR5
- GPU: NVIDIA RTX 4080 SUPER + AMD iGPU
- Storage: NVMe SSD
- Dual boot: Windows 11 + Gentoo

已重新驗證至 2025 年 10 月的官方文件。跟著步驟做，就能從空白硬碟部署一套可日常使用的 Gentoo 桌面環境。
{{< /lead >}}

> 本文預設平台為 x86_64 UEFI，並提供 OpenRC / systemd 兩種作法。若你使用 BIOS 或其他架構，請對照官方手冊調整。

---

## 安裝流程總覽

1. 準備啟動媒體、確認網路
2. 建立磁碟分割與檔案系統
3. 展開 Stage3 並進入 chroot
4. 設定 Portage、USE、Profile 與本地化
5. 安裝內核、韌體與必要工具
6. 設定開機載入程式與使用者帳號
7. 佈署桌面環境與常用軟體
8. 進行首次重開機與後續維護

每個章節都盡量給出完整指令與替代方案，流程中任何一步都可以隨時返回檢查。

---

## 事前準備 {#prerequisites}

- 一台支援 UEFI 的 x86_64 機器（桌機或筆電）
- 8 GB 以上的 USB 隨身碟
- 穩定的網路（如果在中國大陸請預先選定境內鏡像）
- 第二個裝置方便查閱文件 / SSH 遠端操作（建議）
- 至少 30 GB 的可用磁碟空間


> 建議先備份所有重要資料


---

## 0. 下載與製作安裝媒體 {#step-0-media}

### 0.1 選擇鏡像並下載 ISO

官方鏡像列表：<https://www.gentoo.org/downloads/mirrors/\>

| 地區 | 建議鏡像 |
| ---- | -------- |
| 台灣 | `https://free.nchc.org.tw/gentoo/` |
| 澳洲 | `https://mirror.aarnet.edu.au/pub/gentoo/` |
| 中國大陸 | `https://mirrors.ustc.edu.cn/gentoo/`、`https://mirrors.tuna.tsinghua.edu.cn/gentoo/`、`https://mirrors.aliyun.com/gentoo/` |

下載 Minimal ISO (以台灣為例)：
```bash
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso.asc
```
> 如果你想要在安裝的時候查看瀏覽器或者更容易的圖形化連結Wi-Fi等可以選用 **LiveGUI USB Image**

驗證簽章（可選）：
```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992
gpg --verify install-amd64-minimal.iso.asc install-amd64-minimal.iso
```

### 0.2 製作 USB 安裝碟

**Linux：**
```bash
sudo dd if=install-amd64-minimal.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
> 請把 `sdX` 換成 USB 裝置名稱，例如 `/dev/sdb`、`/dev/nvme1n1`。

**macOS：**
```bash
diskutil list
diskutil unmountDisk /dev/diskN
sudo dd if=install-amd64-minimal.iso of=/dev/rdiskN bs=4m
sudo diskutil eject /dev/diskN
```

**Windows：** 推薦使用 [Rufus](https://rufus.ie/) → 選 ISO → 選 DD 模式寫入。

---

## 1. 進入 Live 環境並開通網路 {#step-1-network}

### 1.1 確認 UEFI
```bash
ls /sys/firmware/efi && echo "UEFI" || echo "Legacy BIOS"
```
若為 Legacy BIOS，請改用 MBR 分割規畫與 GRUB。

### 1.2 有線網路
```bash
ip link
dhcpcd eno1
ping -c3 gentoo.org
```

### 1.3 無線網路

**wpa_supplicant：**
```bash
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp0s20f3 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp0s20f3
```

**iwd（簡潔推薦）：**
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
> 若 WPA3 不穩，請退回 WPA2。

### 1.4 （可選）啟動 SSH 方便遠端操作
```bash
passwd                      # 設定 root 密碼
rc-service sshd start
rc-update add sshd default
ip a | grep inet
# 在工作機連線：ssh root@<IP>
```
安裝完成後記得關閉或調整 `/etc/ssh/sshd_config` 中的設定。

---

## 2. 規畫磁碟分割 {#step-2-partition}

檢查磁碟：
```bash
lsblk -o NAME,SIZE,TYPE
```

啟動 `cfdisk` 或 `gdisk`：
```bash
cfdisk /dev/nvme0n1
```

| 建議分割 | 大小 | 檔案系統 | 掛載點 | 備註 |
| -------- | ---- | -------- | ------ | ---- |
| ESP | 512 MB | FAT32 | /efi | `type EF00` |
| Boot | 1 GB | ext4 | /boot | 放 kernel / initramfs |
| Root | 80~120 GB | ext4 / XFS / Btrfs | / | 系統與應用 |
| Home | 餘額 | ext4 / XFS / Btrfs | /home | 使用者資料 |
| Swap（可選） | RAM 1~2 倍 | swap | swap | SSD 可改用 zram |

> 若只想要最簡配置，可只保留 `/efi` + `/` 兩個分割。

### 2.1 `cfdisk` 實際操作示例

以下畫面截自在雙系統筆電上執行 `cfdisk /dev/nvme2n1`，可在進入 Live 環境後直接參考。方向鍵可以在分割表中移動，`Type`、`Resize`、`Delete`、`Write` 等按鍵對應底部選單。

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

> `cfdisk` 會即時提示裝置是否正在使用。若你只是在確認現況，請選擇 `Quit` 離開，不要 `Write` 變更。確定要修改時，務必先備份並再次核對分割大小與類型。

---

## 3. 建立檔案系統並掛載 {#step-3-filesystem}

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

### 3.2 掛載（ext4 範例）
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

## 4. 下載 Stage3 並進入 chroot {#step-4-stage3}

### 4.1 選擇 Stage3

- **OpenRC**：`stage3-amd64-openrc-*.tar.xz`
- **systemd**：`stage3-amd64-systemd-*.tar.xz`
- 通常選擇標準版即可；Desktop 變種只是預設 USE 預先開啟。

### 4.2 下載與展開
```bash
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```
若有下載 `.CONTENTS` 或 `.DIGESTS`，可用 `openssl` 或 `gpg` 驗證。

### 4.3 複製 DNS & 掛載虛擬檔案系統
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
> OpenRC 可省略 `run` 的部分。

### 4.4 進入 chroot
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) ${PS1}"
```

---

## 5. 初始化 Portage 與 make.conf {#step-5-portage}

### 5.1 同步樹與設定鏡像
```bash
emerge-webrsync
emerge --sync
emerge --ask app-portage/eix app-portage/gentoolkit
```

設定鏡像（擇一）：
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# 或手動(以台灣為例)：
echo 'GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"' >> /etc/portage/make.conf
```

### 5.2 make.conf 範例
```conf
COMMON_FLAGS="-march=native -O2 -pipe"
MAKEOPTS="-j$(nproc)"
ACCEPT_LICENSE="*"
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"
GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"

# Wayland 桌面常用旗標
USE="wayland pipewire vulkan egl"
# 若使用 X11：
# USE="X xwayland pipewire vulkan egl"

# 顯示卡（請依硬體調整，僅留一組）
VIDEO_CARDS="nvidia"
# VIDEO_CARDS="amdgpu radeonsi"
# VIDEO_CARDS="intel i965 iris"
```

### 5.3 package.use / license 基本寫法
```bash
echo "sys-kernel/linux-firmware initramfs" >> /etc/portage/package.use/linux-firmware
echo "sys-kernel/linux-firmware linux-fw-redistributable no-source-code" >> /etc/portage/package.license
```

---

## 6. Profile、系統設定與本地化 {#step-6-system}

### 6.1 選擇 Profile
```bash
eselect profile list
eselect profile set <編號>
emerge -avuDN @world
```
常用選擇：
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop`（OpenRC 桌面）

### 6.2 時區與語言
```bash
echo "Asia/Taipei" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
echo "zh_TW.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
eselect locale set en_US.utf8
```

### 6.3 主機名與網路設定
```bash
echo "gentoo" > /etc/hostname
cat <<'NET' > /etc/conf.d/net
config_enp5s0="dhcp"
NET
```
OpenRC 網卡服務：
```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0
rc-update add net.enp5s0 default
```

systemd network（可改用 NetworkManager）：
```bash
emerge --ask net-misc/networkmanager
gpasswd -a <username> plugdev
rc-update add NetworkManager default   # OpenRC
echo '[main]\ndhcp=internal' >> /etc/NetworkManager/NetworkManager.conf
```

### 6.4 fstab 範例
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

## 7. 內核與韌體 {#step-7-kernel}

### 7.1 快速方案：預編譯內核(安裝時推薦問題少)
```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```
自動更新內核後，記得重新產生 bootloader 內容。

### 7.2 自行編譯
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
cd /usr/src/linux
make menuconfig
```
建議啟用：
- `Processor type and features → AMD/Intel 對應選項`
- `File systems →` 你的根檔案系統（ext4、XFS、Btrfs）
- `Device Drivers → Network device support →` 對應網卡
- `Firmware Drivers →` 若需透過 initramfs 載入韌體

使用 `genkernel` 自動化：
```bash
genkernel --install all
```

### 7.3 安裝韌體與微碼
```bash
mkdir -p /etc/portage/package.license
# 同意 Linux 固件的协议
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' >/etc/portage/package.license/linux-firmware）
echo 'sys-kernel/installkernel dracut' >/etc/portage/package.use/installkernel
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode  # Intel CPU
emerge --ask sys-kernel/amd-microcode      # AMD CPU
```

---

## 8. 基礎工具與桌面前置 {#step-8-base-packages}

```bash
emerge --ask app-editors/neovim app-shells/zsh
emerge --ask app-portage/cpuid2cpuflags
cpuid2cpuflags >> /etc/portage/make.conf
```

### 顯示卡驅動
- **NVIDIA 封閉驅動**：`emerge --ask x11-drivers/nvidia-drivers`
- **AMD**：已包含在 `VIDEO_CARDS="amdgpu radeonsi"` 中
- **Intel**：`VIDEO_CARDS="intel i965 iris"`

### 音訊與藍牙
```bash
emerge --ask media-video/pipewire media-video/wireplumber
emerge --ask media-sound/pavucontrol
emerge --ask net-wireless/bluez bluez-tools blueman
```
OpenRC 啟動：`rc-update add pipewire default`；systemd 使用 user service。

---

## 9. 建立使用者與權限 {#step-9-users}

```bash
passwd root
useradd -m -G wheel,video,audio,plugdev zakk
passwd zakk
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel
```

若使用 systemd，將使用者加入 `wheel` 以外的 `network`、`lp` 視需求調整。

---

## 10. 安裝開機載入程式 {#step-10-bootloader}

### 10.1 systemd-boot（UEFI 專用）
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

Btrfs 或 LUKS 請加上相對應模組。

---

## 11. 桌面環境與登入管理器 {#step-11-desktop}

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
rc-update add gdm default   # systemd 請用 systemctl enable gdm
```

### 11.3 其他選擇
- `emerge --ask xfce-base/xfce4 xfce-extra/xfce4-meta`
- `emerge --ask gui-apps/cage` 作為極簡 Wayland kiosk

---

## 12. 重啟前檢查清單 {#step-12-checklist}

1. `emerge --info` 無錯誤
2. `/etc/fstab` UUID 正確且已 `cat` 檢查
3. `passwd` 已設定 root 與使用者
4. 已執行 `grub-mkconfig` 或完成 `bootctl` 設定
5. 若使用 LUKS，確保 initramfs 內含 `cryptsetup`

離開 chroot 並重開機：
```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

## 13. 重啟後的工作 {#step-13-post}

```bash
sudo emerge --sync
sudo emerge -avuDN @world
sudo emerge --ask --depclean
```

建立日常 alias：
```bash
echo "alias update='sudo emerge --sync && sudo emerge -avuDN @world && sudo emerge --ask --depclean'" >> ~/.zshrc
```

### 主要桌面追加套件
- Terminals：`kitty`、`alacritty`
- Browser：`firefox`、`google-chrome`
- Office：`libreoffice`
- Flatpak：`emerge --ask sys-apps/flatpak`

---

## 常見問題與排錯 {#faq}

- **連不到鏡像**：在中國大陸請改用 USTC / TUNA；也可以透過 `proxychains` 走代理。
- **內核缺驅動**：`lspci -k` 確認驅動是否載入，若沒有，需要回去 `make menuconfig` 啟用或改用 `gentoo-kernel-bin`。
- **開機後沒有網路**：檢查 `/etc/conf.d/net` 或 NetworkManager 是否啟動；nmcli `radio wifi on`。
- **Wayland 黑畫面**：NVIDIA 尚有兼容問題，可改用 `USE="X xwayland"` 並安裝 `sddm`。

---

## 參考資料 {#reference}

- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [bitbili：Gentoo Linux 安裝與使用教程](https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html)
- 個人筆記（2023–2025 桌面部署記錄）

祝安裝順利，任何錯誤歡迎到 Gentoo Forums 或 Discord #gentoo 提問！
