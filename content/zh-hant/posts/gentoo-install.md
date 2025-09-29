---
slug: gentoo-install
title: "Gentoo 安裝指南（新手）"
date: 2025-09-01
tags: ["Gentoo","Linux","OpenRC","systemd"]
categories: ["Linux 筆記"]
draft: false
description: "從零開始的 Gentoo 安裝教學：分割、Stage3、Portage、USE、Kernel、桌面環境與常見問題完整步驟。"
ShowToc: false        # 關閉主題自動 TOC（避免與自訂 TOC 重複）
TocOpen: false
---


{{< alert icon="list" >}}
**快速導覽**
- [我的電腦配置（示例）](#my-hardware-zh)
- [0. 下載與製作安裝媒體](#0-下載與製作安裝媒體)
- [1. 開機與網路](#1-開機與網路)
- [2. 磁碟分割（lsblk / cfdisk）](#2-磁碟分割lsblk-與-cfdisk)
- [3. 檔案系統格式化與掛載](#3-檔案系統格式化與掛載ext4--xfs--btrfs)
- [4. Stage3、掛載與 chroot](#4-下載-stage3掛載系統目錄與-chroot)
- [5. Portage 與鏡像源](#5-portage-與鏡像源含-makeconf-完整示例)
- [6. USE flags 與 License](#6-use-flags-與-license新手解法)
- [7. 選擇 Profile](#7-選擇-profile桌面伺服器)
- [8. 本地化](#8-本地化-localization語言與時區)
- [9. 內核選擇與編譯](#9-內核選擇與編譯完整指令)
- [10. 產生 fstab](#10-產生-fstab含-btrfs--ext4-範例)
- [11. 安裝 GRUB](#11-安裝開機器-grub含-os-prober)
- [12. 啟用網路服務](#12-啟用網路服務openrc--systemd)
- [13. Wayland / X11 選擇](#13-wayland--x11-選擇與-use)
- [14. 顯示卡與 CPU 微碼](#14-顯示卡與-cpu-微碼)
- [15. 桌面環境](#15-桌面環境可選)
- [16. 使用者與 sudo](#16-使用者與-sudo)
- [17. SSH（可選）](#17-ssh可選)
- [18. 重開機](#18-重開機)
- [常見問題 FAQ](#faq-zh)
- [參考](#refs-zh)
{{< /alert >}}



<div class="gentoo-article">

# 我的電腦配置（示例） {#my-hardware-zh}
- **CPU**：AMD Ryzen 9 7950X3D（16C/32T）  
- **主機板**：ASUS ROG STRIX X670E-A GAMING WIFI  
- **RAM**：64GB DDR5  
- **GPU**：NVIDIA RTX 4080 SUPER + AMD iGPU  
- **儲存**：NVMe SSD  
- **雙系統**：Windows 11 + Gentoo  

> 以上為示例，步驟對多數 x86_64 平台通用。

---

## 0. 下載與製作安裝媒體 {#0-下載與製作安裝媒體}

**官方鏡像列表**：<https://www.gentoo.org/downloads/mirrors/>

- **中國大陸**：通常**必須**使用境內鏡像（中科大 USTC / 清華 TUNA / 阿里雲），否則下載速度與連線穩定性可能不足。  
- **台灣**：建議使用 **NCHC**；**澳洲**：AARNET。

### 0.1 下載 ISO（示例：台灣 NCHC）
```bash
wget https://free.nchc.org.tw/gentoo/releases/amd64/autobuilds/current-install-amd64-minimal/install-amd64-minimal.iso
```

> 若在中國大陸，可將網址換成：`https://mirrors.ustc.edu.cn/gentoo/`、`https://mirrors.tuna.tsinghua.edu.cn/gentoo/` 或 `https://mirrors.aliyun.com/gentoo/`。

### 0.2 製作 USB 安裝碟
**Linux（dd）**：
```bash
sudo dd if=install-amd64-minimal.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
> 將 `sdX` 換成 USB 裝置名稱（如 `/dev/sdb`）。

**Windows（Rufus）**：<https://rufus.ie/>  
1. 選擇 USB 與 Gentoo ISO  
2. 模式選 **dd 模式**（非 ISO 模式）  
3. Start

---

## 1. 開機與網路 {#1-開機與網路}

### 1.1 確認 UEFI / BIOS
```bash
ls /sys/firmware/efi
```
有輸出 → **UEFI**；沒有 → **Legacy BIOS**。

### 1.2 有線網路（Live 環境）
```bash
ip a
dhcpcd eno1
ping -c 3 gentoo.org
```

### 1.3 Wi‑Fi（兩種工具擇一）

**wpa_supplicant**：
```bash
iw dev
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp9s0 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp9s0
ping -c 3 gentoo.org
```

**iwd（更簡單，推薦新手）**：
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
> 若 WPA3 不穩，先改用 WPA2 試試。

### 1.4 （可選）臨時開啟 SSH（root 密碼登入）
目的：方便在另一台電腦遠端繼續安裝、複製貼上長指令。僅限安裝階段，完成後請關閉。

1. 設定 root 密碼（若未設定）：
   ```bash
   passwd
   ```
2. 臨時允許 root 與密碼登入：
   ```bash
   echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
   echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config
   ```
3. 啟動 sshd：
   ```bash
   rc-service sshd start
   ```
4. 查詢 IP：
   ```bash
   ip a | grep inet
   ```
5. 從工作機連線：
   ```bash
   ssh root@<安裝機IP>
   ```
安全提醒：完成安裝後編輯 `/etc/ssh/sshd_config` 移除上述兩行或改為 `PermitRootLogin prohibit-password`，再重啟 sshd。

（以下繼續下一章節：磁碟分割）

## 2. 磁碟分割（lsblk 與 cfdisk） {#2-磁碟分割lsblk-與-cfdisk}
檢視磁碟：
```bash
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT
```
範例：
```
nvme0n1    476G disk
├─nvme0n1p1 512M part
├─nvme0n1p2   1G part
├─nvme0n1p3 100G part
└─nvme0n1p4 375G part
```

啟動分割工具（可選）：
```bash
cfdisk /dev/nvme0n1
```

**建議分割（UEFI）**：  
| 大小 | 檔案系統 | 掛載點 | 說明 |
|---|---|---|---|
| 512M | FAT32 | /efi | ESP（UEFI 系統分割區） |
| 1G | ext4 | /boot | kernel、initramfs |
| 100G+ | ext4 / XFS / Btrfs | / | 根分割區 |
| 其餘 | ext4 / XFS / Btrfs | /home | 使用者家目錄 |

> 你也可以選擇只有 / 與 /efi 的簡化方案。

---

## 3. 檔案系統格式化與掛載（ext4 / XFS / Btrfs） {#3-檔案系統格式化與掛載ext4--xfs--btrfs}

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

**Btrfs**（必要時可用 `-f` 強制覆蓋，⚠️ 會抹除該分割區資料）：
```bash
mkfs.btrfs -L rootfs /dev/nvme0n1p3
mkfs.btrfs -L home   /dev/nvme0n1p4
# 需要強制時：mkfs.btrfs -f -L rootfs /dev/nvme0n1p3
```

### 3.2 掛載（完整流程）

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

## 4. 下載 Stage3、掛載系統目錄與 chroot {#4-下載-stage3掛載系統目錄與-chroot}

### 4.1 選擇 Stage3
- 建議下載 **標準 Stage3（glibc）**，依需求選 **OpenRC** 或 **systemd**。  
- 「desktop」Stage3 只是預設桌面化 USE，**非必須**；用標準 Stage3 + 正確 **Profile** 更靈活。

### 4.2 下載與解壓
```bash
cd /mnt/gentoo
links https://www.gentoo.org/downloads/mirrors/
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

> 同 ISO，一樣可選擇就近的鏡像源下載 Stage3。

### 4.3 掛載系統目錄（依 init 系統不同）
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

### 4.4 進入 chroot
```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) $PS1"
```

---

## 5. Portage 與鏡像源（含 makeconf 完整示例） {#5-portage-與鏡像源含-makeconf-完整示例}

### 5.1 同步 Portage 樹
```bash
emerge-webrsync
emerge --sync
```

### 5.2 選擇鏡像源（擇一）
**互動工具**：
```bash
emerge --ask app-portage/mirrorselect
mirrorselect -i -o >> /etc/portage/make.conf
```
**手動指定（建議最終只保留一條）**：
```bash
echo 'GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"' >> /etc/portage/make.conf
```

> ⚠️ 避免重複與衝突：`mirrorselect` 可能加入多條鏡像，建議最後僅保留速度最快的一條。

### 5.3 `/etc/portage/make.conf` 完整示例（含註解）
```conf
# 編譯器參數：O2 與 pipe 足夠，多數情況不需要 -Ofast
COMMON_FLAGS="-march=native -O2 -pipe"

# 平行編譯：通常設成 CPU 執行緒數
MAKEOPTS="-j32"

# Portage 預設行為：互動、詳細、拉進建置依賴、完整圖
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# 鏡像：請最終僅保留一條（下例為台灣 NCHC）
GENTOO_MIRRORS="https://free.nchc.org.tw/gentoo/"

# 全域 USE（兩套典型選擇二擇一；也可同時保留 xwayland 做相容）
USE="wayland egl pipewire vulkan"
# USE="X xwayland egl pipewire vulkan"

# 顯示卡：請只填你的硬體（不要全抄）
# 例：NVIDIA 新卡
VIDEO_CARDS="nvidia"
# 例：AMD
# VIDEO_CARDS="amdgpu radeonsi"
# 例：Intel
# VIDEO_CARDS="intel i965 iris"
# 例：老 NVIDIA 或想用開源
# VIDEO_CARDS="nouveau"

# 接受授權：新手可暫時開放全部，之後細化至 package.license
ACCEPT_LICENSE="*"
```

---

## 6. USE flags 與 License（新手解法） {#6-use-flags-與-license新手解法}

### 6.1 查詢與理解 USE
```bash
emerge -pv firefox
```

### 6.2 對單一套件加入 USE
```bash
echo "media-video/ffmpeg X wayland" >> /etc/portage/package.use/ffmpeg
```

### 6.3 同意授權（例：Chrome）
```bash
echo "www-client/google-chrome google-chrome" >> /etc/portage/package.license
```

### 6.4 關鍵詞（較新版本）
```bash
echo "www-client/google-chrome ~amd64" >> /etc/portage/package.accept_keywords
```
> 僅在需要較新（測試）版本時使用。

---

## 7. 選擇 Profile（桌面／伺服器） {#7-選擇-profile桌面伺服器}

列出可用 Profile：
```bash
eselect profile list
```

常見選擇：
- **KDE + systemd**：`default/linux/amd64/23.0/desktop/plasma/systemd`  
- **GNOME + systemd**：`default/linux/amd64/23.0/desktop/gnome/systemd`  
- **桌面 + OpenRC**：`default/linux/amd64/23.0/desktop` 或對應 plasma/openrc 變體  
- **伺服器**：`default/linux/amd64/23.0`（較精簡）

套用並更新系統：
```bash
eselect profile set <編號>
emerge -avuDN @world
```

> Profile 會設定一組預設 USE；需要時再以 package.use 調整。

---

## 8. 本地化 Localization（語言與時區） {#8-本地化-localization語言與時區}

**語言（/etc/locale.gen）**：
```conf
en_US.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```
產生並套用：
```bash
locale-gen
eselect locale set en_US.utf8
```

**時區**：
```bash
ls /usr/share/zoneinfo
echo "Asia/Taipei" > /etc/timezone
emerge --config sys-libs/timezone-data
```
完整清單：<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>

**字型與輸入法（可選）**：
```bash
emerge media-fonts/noto-cjk
emerge app-i18n/fcitx5 app-i18n/fcitx5-rime
```

---

## 9. 內核選擇與編譯（完整指令） {#9-內核選擇與編譯完整指令}
### 9.1 最簡方案：預編譯內核
```bash
emerge sys-kernel/gentoo-kernel-bin
```

### 9.x linux-firmware 授權解除 + initramfs USE
若要包含最新硬體韌體並在開機初期 (initramfs) 載入：
1. 解除授權限制（允許安裝該套件的再散布 / 無原始碼授權）：
   ```bash
   echo "sys-kernel/linux-firmware linux-fw-redistributable no-source-code" >> /etc/portage/package.license
   ```
2. 啟用 initramfs USE（將韌體打包進 early firmware）：
   ```bash
   echo "sys-kernel/linux-firmware initramfs" >> /etc/portage/package.use/microcode
   ```
3. 安裝韌體（建議在安裝或更新內核前後皆可執行一次）：
   ```bash
   emerge --ask sys-kernel/linux-firmware
   ```
若已安裝內核，完成後可重新產生 initramfs 以載入新韌體。

### 9.2 自行編譯
```bash
emerge sys-kernel/gentoo-sources
cd /usr/src/linux
make menuconfig
make -j"$(nproc)"
make modules_install
make install
```

**Initramfs（Btrfs、LUKS、RAID 或模組化驅動建議）**  
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

## 10. 產生 fstab（含 Btrfs / ext4 範圍） {#10-產生-fstab含-btrfs--ext4-範例}

查詢 UUID：
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

## 11. 安裝開機器 GRUB（含 os-prober） {#11-安裝開機器-grub含-os-prober}
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

## 12. 啟用網路服務（OpenRC / systemd） {#12-啟用網路服務openrc--systemd}

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

## 13. Wayland / X11 選擇與 USE {#13-wayland--x11-選擇與-use}

**Wayland**：
```conf
USE="wayland egl pipewire vulkan"
```

**X11**：
```conf
USE="X xwayland egl pipewire vulkan"
```

> 可同時啟用 xwayland 以兼容 X11 程式。

---

## 14. 顯示卡與 CPU 微碼 {#14-顯示卡與-cpu-微碼}

**NVIDIA 專有**：
```conf
VIDEO_CARDS="nvidia"
```
```bash
emerge x11-drivers/nvidia-drivers
```

**Nouveau（開源）**：
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

**CPU 微碼（Intel）**：
```bash
emerge sys-firmware/intel-microcode
```

---

## 15. 桌面環境（可選） {#15-桌面環境可選}

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

## 16. 使用者與 sudo {#16-使用者與-sudo}
```bash
passwd
useradd -m -G wheel,audio,video,usb -s /bin/bash zakk
passwd zakk
emerge app-admin/sudo
echo "%wheel ALL=(ALL) ALL" >> /etc/sudoers
```
> ⚠️ 請將 `zakk` 替換為你的使用者名稱。

---

## 17. SSH（可選） {#17-ssh可選}
```bash
emerge net-misc/openssh
systemctl enable sshd && systemctl start sshd
```

---

## 18. 重開機 {#18-重開機}
```bash
exit
umount -R /mnt/gentoo
reboot
```

---

# 💡 常見問題 FAQ {#faq-zh}
- **下載慢／超時**：中國大陸請用境內鏡像；其他地區選最近鏡像。  
- **Wi‑Fi 連不上**：檢查驅動與介面名稱；WPA3 不穩改 WPA2。  
- **Wayland / X11**：AMD/Intel 新平台優先 Wayland；相容性需求選 X11 + xwayland。  
- **NVIDIA 選擇**：新卡建議 `nvidia-drivers`；舊卡或完全開源可試 `nouveau`（效能較低）。  
- **USE 衝突**：`emerge -pv <套件>` 依提示拆分到 `package.use`。  
- **License 阻擋**：將授權加入 `package.license`。  
- **需要新版**：使用 `package.accept_keywords`。  
- **Btrfs + LUKS/RAID**：建議使用 initramfs（dracut 或 genkernel）。  

---

# 📎 參考 {#refs-zh}
- Gentoo Handbook：<https://wiki.gentoo.org/wiki/Handbook:AMD64/Full/Installation>  
- Bitbili：<https://bitbili.net/gentoo-linux-installation-and-usage-tutorial.html>  
- Rufus：<https://rufus.ie/>  
- 時區列表（tz database）：<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>
