---
title: "Gentoo Linux 安裝指南 (基礎篇)"
date: 2025-11-25
summary: "Gentoo Linux 基礎系統安裝教學，涵蓋分割槽、Stage3、核心編譯、載入程式配置等。也突出有 LUKS 全盤加密教學。"
description: "2025 年最新 Gentoo Linux 安裝指南 (基礎篇)，詳細講解 UEFI 安裝流程、核心編譯等。適合 Linux 進階使用者和 Gentoo 新手。也突出有 LUKS 全盤加密教學。"
keywords:
  - Gentoo Linux
  - Linux 安裝
  - 原始碼編譯
  - systemd
  - OpenRC
  - Portage
  - make.conf
  - 核心編譯
  - UEFI 安裝
tags:
  - Gentoo
  - Linux
  - 教學
  - 系統安裝
categories:
  - tutorial
authors:
  - zakkaus
---

<div>

### 文章特別說明

本文是 **Gentoo Linux 安裝指南** 系列的第一部分：**基礎安裝**。

**系列導航**：
1. **基礎安裝（本文）**：從零開始安裝 Gentoo 基礎系統
2. [桌面配置](/posts/2025-11-25-gentoo-install-desktop/)：顯示卡驅動、桌面環境、輸入法等
3. [進階最佳化](/posts/2025-11-25-gentoo-install-advanced/)：make.conf 最佳化、LTO、系統維護

**建議閱讀方式**：
- 按需閱讀：基礎安裝（0-11 節）→ 桌面配置（12 節）→ 進階最佳化（13-17 節）

</div>

<div>

### 關於本指南

本文旨在提供一個完整的 Gentoo 安裝流程演示，並**密集提供可供學習的參考文獻**。文章中套件含大量官方 Wiki 連結和技術檔案，幫助讀者深入理解每個步驟的原理和配置細節。

**這不是一份簡單的傻瓜式教學，而是一份引導性的學習資源**——使用 Gentoo 的第一步是學會自己閱讀 Wiki 並解決問題，善用 Google 甚至 AI 工具尋找答案。遇到問題或需要深入瞭解時，請務必查閱官方手冊和本文提供的參考連結。

如果在閱讀過程中遇到疑問或發現問題，歡迎透過以下渠道提出：
- **Gentoo 中文社群**：[Telegram 群組](https://t.me/gentoo_zh) | [Telegram 頻道](https://t.me/gentoocn) | [GitHub](https://github.com/Gentoo-zh)
- **官方社群**：[Gentoo Forums](https://forums.gentoo.org/) | IRC: #gentoo @ Libera.Chat

**非常建議以官方手冊為準**：
- [Gentoo Handbook: AMD64](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [Gentoo Handbook: AMD64 (簡體中文)](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn)

<p>✓ 已驗證至 2025 年 11 月 25 日</p>

</div>

## 什麼是 Gentoo？

Gentoo Linux 是一個基於原始碼的 Linux 發行版，以其**高度可定製性**和**效能最佳化**著稱。與其他發行版不同，Gentoo 讓你從原始碼編譯所有軟體，這意味著：

- **極致效能**：所有軟體針對你的硬體最佳化編譯
- **完全掌控**：你決定系統套件含什麼，不套件含什麼
- **深度學習**：透過親手構建系統深入理解 Linux
- **編譯時間**：初次安裝需要較長時間（建議預留 3-6 小時）
- **學習曲線**：需要一定的 Linux 基礎知識

<div>

<div>

**適合誰？**
- 想要深入學習 Linux 的技術愛好者
- 追求系統效能和定製化的使用者
- 享受 DIY 過程的 Geek

</div>

<div>

**不適合誰？**
- 只想快速安裝使用的新手（建議先嚐試 Ubuntu、Fedora 等）
- 沒有時間折騰系統的使用者

</div>

</div>

<details>
<summary><b>核心概念速覽（點選展開）</b></summary>

在開始安裝前，先了解幾個核心概念：

**Stage3** ([Wiki](https://wiki.gentoo.org/wiki/Stage_file))
一個最小化的 Gentoo 基礎系統壓縮套件。它套件含了構建完整系統的基礎工具鏈（編譯器、庫等）。你將解壓它到硬碟上，作為新系統的"地基"。

**Portage** ([Wiki](https://wiki.gentoo.org/wiki/Portage/zh-cn))
Gentoo 的套件管理系統。它不直接安裝預編譯的軟體套件，而是下載原始碼、根據你的配置編譯，然後安裝。核心指令是 `emerge`。

**USE Flags** ([Wiki](https://wiki.gentoo.org/wiki/USE_flag/zh-cn))
控制軟體功能的開關。例如，`USE="bluetooth"` 會讓所有支援藍牙的軟體在編譯時啟用藍牙功能。這是 Gentoo 定製化的核心。

**Profile** ([Wiki](https://wiki.gentoo.org/wiki/Profile_(Portage)))
預設的系統配置模板。例如 `desktop/plasma/systemd` profile 會自動啟用適合 KDE Plasma 桌面的預設 USE flags。

**Emerge** ([Wiki](https://wiki.gentoo.org/wiki/Emerge))
Portage 的指令列工具。常用指令：
- `emerge --ask <套件名>` - 安裝軟體
- `emerge --sync` - 同步軟體倉庫
- `emerge -avuDN @world` - 更新整個系統

</details>

<details>
<summary><b>安裝時間估算（點選展開）</b></summary>

| 步驟 | 預計時間 |
|---|----------|
| 準備安裝媒介 | 10-15 分鐘 |
| 磁碟分割槽與格式化 | 15-30 分鐘 |
| 下載並解壓 Stage3 | 5-10 分鐘 |
| 配置 Portage 與 Profile | 15-20 分鐘 |
| **編譯核心**（最耗時） | **30 分鐘 - 2 小時** |
| 安裝系統工具 | 20-40 分鐘 |
| 配置載入程式 | 10-15 分鐘 |
| **安裝桌面環境**（可選） | **1-3 小時** |
| **總計** | **3-6 小時**（取決於硬體效能）|

<div>

**提示**

使用預編譯核心和二進位制套件可以大幅縮短時間，但會犧牲部分定製性。

</div>

</details>

<details>
<summary><b>磁碟空間需求與開始前檢查清單（點選展開）</b></summary>

### 磁碟空間需求

- **最小安裝**：10 GB（無桌面環境）
- **推薦空間**：30 GB（輕量桌面）
- **舒適空間**：80 GB+（完整桌面 + 編譯快取）

### 開始前的檢查清單

- 已備份所有重要資料
- 準備了 8GB+ 的 USB 快閃記憶體盤
- 確認網路連線穩定（有線網路最佳）
- 預留了充足的時間（建議完整的半天）
- 有一定的 Linux 指令列基礎
- 準備好另一臺裝置查閱檔案（或者使用 GUI LiveCD）

</details>

---

<div>

### 本指南內容概覽

本指南將引導你在 x86_64 UEFI 平臺上安裝 Gentoo Linux。

**本文將教你**：
- 從零開始安裝 Gentoo 基礎系統（分割槽、Stage3、核心、載入程式）
- 配置 Portage 並最佳化編譯引數（make.conf、USE flags、CPU flags）
- 安裝桌面環境（KDE Plasma、GNOME、Hyprland）
- 配置中文環境（locale、字型、Fcitx5 輸入法）
- 可選進階配置（LUKS 全盤加密、LTO 最佳化、核心調優、RAID）
- 系統維護（SSD TRIM、電源管理、Flatpak、系統更新）

</div>

<div>

**重要提醒**

**請先關閉 Secure Boot**  
在開始安裝之前，請務必進入 BIOS 設定，將 **Secure Boot** 暫時關閉。開啟 Secure Boot 可能會導致安裝介質無法啟動，或者安裝後的系統無法引導。你可以在系統安裝完成併成功啟動後，再參考本指南後面的章節重新配置並開啟 Secure Boot。

**備份所有重要資料！**  
本指南涉及磁碟分割槽操作，請務必在開始前備份所有重要資料！

</div>

---

## 0. 準備安裝媒介 {#step-0-prepare}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 選擇安裝媒介](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Media/zh-cn)

</div>

### 0.1 下載 Gentoo ISO

根據[**下載頁面**](https://www.gentoo.org/downloads/) 提供的方式獲取下載連結

<div>

**注意**

以下連結中的日期（如 `20251123T...`）僅供參考，請務必在映像站中選擇**最新日期**的檔案。

</div>

下載 Minimal ISO（以 BFSU 映像站為例）：
```bash
wget http://ftp.twaren.net/Linux/Gentoo/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso
wget http://ftp.twaren.net/Linux/Gentoo/releases/amd64/autobuilds/20251123T153051Z/install-amd64-minimal-20251123T153051Z.iso.asc
```

<div>

**新手推薦：使用 LiveGUI USB Image**

如果希望安裝時能直接使用瀏覽器或更方便地連線 Wi-Fi，可以選擇 **LiveGUI USB Image**。

**新手入坑推薦使用每週構建的 KDE 桌面環境的 Live ISO**： <https://iso.gig-os.org/>  
（來自 Gig-OS <https://github.com/Gig-OS> 專案）

**Live ISO 登入憑據**：
- 賬號：`live`
- 密碼：`live`
- Root 密碼：`live`

**系統支援**：
- 支援中文顯示和中文輸入法 (fcitx5), flclash 等

</div>

驗證簽名（可選）：
```bash
# 從金鑰伺服器獲取 Gentoo 釋出簽名公鑰
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0xBB572E0E2D1829105A8D0F7CF7A88992
# --keyserver: 指定金鑰伺服器地址
# --recv-keys: 接收並匯入公鑰
# 0xBB...992: Gentoo Release Media 簽名金鑰指紋

# 驗證 ISO 檔案的數字簽名
gpg --verify install-amd64-minimal-20251123T153051Z.iso.asc install-amd64-minimal-20251123T153051Z.iso
# --verify: 驗證簽名檔案
# .iso.asc: 簽名檔案（ASCII armored）
# .iso: 被驗證的 ISO 檔案
```

### 0.2 製作 USB 安裝盤

**Linux：**
```bash
sudo dd if=install-amd64-minimal-20251123T153051Z.iso of=/dev/sdX bs=4M status=progress oflag=sync
# if=輸入檔案 of=輸出裝置 bs=塊大小 status=顯示進度
```
<div>

**提示**

請將 `sdX` 替換成 USB 裝置名稱，例如 `/dev/sdb`。

</div>

**Windows：** 推薦使用 [Rufus](https://rufus.ie/) → 選擇 ISO → 寫入時選 DD 模式。

---

## 1. 進入 Live 環境並連線網路 {#step-1-network}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 配置網路](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Networking/zh-cn)

</div>

<div>

**為什麼需要這一步？**

Gentoo 的安裝過程完全依賴網路來下載原始碼套件 (Stage3) 和軟體倉庫 (Portage)。在 Live 環境中配置好網路是安裝的第一步。

</div>

### 1.1 有線網路

```bash
ip link        # 檢視網絡卡介面名稱 (如 eno1, wlan0)
dhcpcd eno1    # 對有線網絡卡啟用 DHCP 自動獲取 IP
ping -c3 gentoo.org # 測試網路連通性
```

### 1.2 無線網路
使用 net-setup：
```bash
net-setup 
```

**wpa_supplicant：**
```bash
wpa_passphrase "SSID" "PASSWORD" | tee /etc/wpa_supplicant/wpa_supplicant.conf
wpa_supplicant -B -i wlp0s20f3 -c /etc/wpa_supplicant/wpa_supplicant.conf
dhcpcd wlp0s20f3
```

<div>

**注意**

若 WPA3 不穩定，請先退回 WPA2。

</div>

<details>
<summary><b>進階設定：啟動 SSH 方便遠端操作（點選展開）</b></summary>

```bash
passwd                      # 設定 root 密碼 (遠端登入需要)
rc-service sshd start       # 啟動 SSH 服務
rc-update add sshd default  # 設定 SSH 開機自啟 (Live 環境中可選)
ip a | grep inet            # 檢視當前 IP 地址
# 在另一臺裝置上：ssh root@<IP>
```

</details>


## 2. 規劃磁碟分割槽 {#step-2-partition}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 準備磁碟](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks/zh-cn)

</div>

<div>

**為什麼需要這一步？**

我們需要為 Linux 系統劃分獨立的儲存空間。UEFI 系統通常需要一個 ESP 分割槽 (引導) 和一個根分割槽 (系統)。合理的規劃能讓日後的維護更輕鬆。

### 什麼是 EFI 系統分割槽 (ESP)？

在使用由 UEFI 引導（而不是 BIOS）的作業系統上安裝 Gentoo 時，建立 EFI 系統分割槽 (ESP) 是必要的。ESP 必須是 FAT 變體（有時在 Linux 系統上顯示為 vfat）。官方 UEFI 規範表示 UEFI 韌體將識別 FAT12、16 或 32 檔案系統，但建議使用 FAT32。

</div>

<div>

**警告**  
如果 ESP 沒有使用 FAT 變體進行格式化，那麼系統的 UEFI 韌體將找不到引導載入程式（或 Linux 核心）並且很可能無法引導系統！

</div>

### 建議分割槽方案（UEFI）

下表提供了一個可用於 Gentoo 試用安裝的推薦預設分割槽表。

| 裝置路徑 | 掛載點 | 檔案系統 | 描述 |
| :--- | :--- | :--- | :--- |
| `/dev/nvme0n1p1` | `/efi` | vfat | EFI 系統分割槽 (ESP) |
| `/dev/nvme0n1p2` | `swap` | swap | 交換分割槽 |
| `/dev/nvme0n1p3` | `/` | xfs | 根分割槽 |

### cfdisk 實戰範例（推薦）

`cfdisk` 是一個圖形化的分割槽工具，操作簡單直觀。

```bash
cfdisk /dev/nvme0n1
```

**操作提示**：
1.  選擇 **GPT** 標籤型別。
2.  **建立 ESP**：新建分割槽 -> 大小 `1G` -> 型別選擇 `EFI System`。
3.  **建立 Swap**：新建分割槽 -> 大小 `4G` -> 型別選擇 `Linux swap`。
4.  **建立 Root**：新建分割槽 -> 剩餘空間 -> 型別選擇 `Linux filesystem` (預設)。
5.  選擇 **Write** 寫入更改，輸入 `yes` 確認。
6.  選擇 **Quit** 退出。

```text
                                                                 Disk: /dev/nvme0n1
                                              Size: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
                                            Label: gpt, identifier: 9737D323-129E-4B5F-9049-8080EDD29C02

    裝置                                       Start                   終點                  扇區               Size 型別
    /dev/nvme0n1p1                                34                  32767                 32734                16M Microsoft reserved
    /dev/nvme0n1p2                             32768              879779839             879747072             419.5G Microsoft basic data
    /dev/nvme0n1p3                        1416650752             1418747903               2097152                 1G EFI System
    /dev/nvme0n1p4                        1418747904             1437622271              18874368                 9G Linux swap
    /dev/nvme0n1p5                        1437622272             1953523711             515901440               246G Linux filesystem
>>  /dev/nvme0n1p6                         879779840             1416650751             536870912               256G Linux filesystem

 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │  Partition UUID: F2F1EF58-82EA-46A6-BF49-896AA40C6060                                                                                           │
 │  Partition type: Linux filesystem (0FC63DAF-8483-4772-8E79-3D69D8477DE4)                                                                        │
 │ Filesystem UUID: b4b0b42d-20be-4cf8-be81-9775efa6c151                                                                                           │
 │Filesystem LABEL: crypthomevar                                                                                                                   │
 │      Filesystem: crypto_LUKS                                                                                                                    │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                   [ 刪除 ]  [Resize]  [ 退出 ]  [ 型別 ]  [ 幫助 ]  [ 排序 ]  [ 寫入 ]  [ 匯出 ]


                                                        Quit program without writing changes
```

<details>
<summary><b>進階設定：fdisk 指令列分割槽教學（點選展開）</b></summary>

`fdisk` 是一個功能強大的指令列分割槽工具。

```bash
fdisk /dev/nvme0n1
```

**1. 檢視當前分割槽佈局**

使用 `p` 鍵來顯示磁碟當前的分割槽配置。

```text
Command (m for help): p
Disk /dev/nvme0n1: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
Disk model: NVMe SSD
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 3E56EE74-0571-462B-A992-9872E3855D75

Device           Start        End    Sectors   Size Type
/dev/nvme0n1p1    2048    2099199    2097152     1G EFI System
/dev/nvme0n1p2 2099200   10487807    8388608     4G Linux swap
/dev/nvme0n1p3 10487808 1953523711 1943035904 926.5G Linux root (x86-64)
```

**2. 建立一個新的磁碟標籤**

按下 `g` 鍵將立即刪除所有現有的磁碟分割槽並建立一個新的 GPT 磁碟標籤：

```text
Command (m for help): g
Created a new GPT disklabel (GUID: ...).
```

或者，要保留現有的 GPT 磁碟標籤，可以使用 `d` 鍵逐個刪除現有分割槽。

**3. 建立 EFI 系統分割槽 (ESP)**

輸入 `n` 建立一個新分割槽，選擇分割槽號 1，起始扇區預設（2048），結束扇區輸入 `+1G`：

```text
Command (m for help): n
Partition number (1-128, default 1): 1
First sector (2048-..., default 2048): <Enter>
Last sector, +/-sectors or +/-size{K,M,G,T,P} (...): +1G

Created a new partition 1 of type 'Linux filesystem' and of size 1 GiB.
Partition #1 contains a vfat signature.

Do you want to remove the signature? [Y]es/[N]o: Y
The signature will be removed by a write command.
```

將分割槽標記為 EFI 系統分割槽（型別程式碼 1）：

```text
Command (m for help): t
Selected partition 1
Partition type or alias (type L to list all): 1
Changed type of partition 'Linux filesystem' to 'EFI System'.
```

**4. 建立 Swap 分割槽**

建立 4GB 的 Swap 分割槽：

```text
Command (m for help): n
Partition number (2-128, default 2): 2
First sector (...): <Enter>
Last sector (...): +4G

Created a new partition 2 of type 'Linux filesystem' and of size 4 GiB.

Command (m for help): t
Partition number (1,2, default 2): 2
Partition type or alias (type L to list all): 19
Changed type of partition 'Linux filesystem' to 'Linux swap'.
```
*(注：Type 19 是 Linux swap)*

**5. 建立根分割槽**

將剩餘空間分配給根分割槽：

```text
Command (m for help): n
Partition number (3-128, default 3): 3
First sector (...): <Enter>
Last sector (...): <Enter>

Created a new partition 3 of type 'Linux filesystem' and of size 926.5 GiB.
```

<div>

**注意**

將根分割槽的型別設定為 "Linux root (x86-64)" 並不是必須的，如果將其設定為 "Linux filesystem" 型別，系統也能正常執行。只有在使用支援它的 bootloader (即 systemd-boot) 並且不需要 fstab 檔案時，才需要這種檔案系統型別。

</div>

設定分割槽型別為 "Linux root (x86-64)"（型別程式碼 23）：

```text
Command (m for help): t
Partition number (1-3, default 3): 3
Partition type or alias (type L to list all): 23
Changed type of partition 'Linux filesystem' to 'Linux root (x86-64)'.
```

**6. 寫入更改**

檢查無誤後，輸入 `w` 寫入更改並退出：

```text
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

</details>

---

## 3. 建立檔案系統並掛載 {#step-3-filesystem}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 準備磁碟](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks/zh-cn) · [Ext4](https://wiki.gentoo.org/wiki/Ext4/zh-cn) · [XFS](https://wiki.gentoo.org/wiki/XFS/zh-cn) · [Btrfs](https://wiki.gentoo.org/wiki/Btrfs/zh-cn)

</div>

<div>

**為什麼需要這一步？**

磁碟分割槽只是劃分了空間，但還不能儲存資料。建立檔案系統 (如 ext4, Btrfs) 才能讓作業系統管理和訪問這些空間。掛載則是將這些檔案系統連線到 Linux 檔案樹的特定位置。

</div>

### 3.1 格式化

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # 格式化 ESP 分割槽為 FAT32
mkswap /dev/nvme0n1p2          # 格式化 Swap 分割槽
mkfs.xfs /dev/nvme0n1p3        # 格式化 Root 分割槽為 XFS
```

若使用 Btrfs：
```bash
mkfs.btrfs -L gentoo /dev/nvme0n1p3
```

若使用 ext4：
```bash
mkfs.ext4 /dev/nvme0n1p3
```

<div>

**其他檔案系統**

其他如 [F2FS](https://wiki.gentoo.org/wiki/F2FS/zh-cn) 或 [ZFS](https://wiki.gentoo.org/wiki/ZFS/zh-cn) 請參考相關 Wiki。

</div>

### 3.2 掛載（XFS 範例）

```bash
mount /dev/nvme0n1p3 /mnt/gentoo        # 掛載根分割槽
mkdir -p /mnt/gentoo/efi                # 建立 ESP 掛載點
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # 掛載 ESP 分割槽
swapon /dev/nvme0n1p2                   # 啟用 Swap 分割槽
```

<details>
<summary><b>進階設定：Btrfs 子卷範例（點選展開）</b></summary>

**1. 格式化**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1  # 格式化 ESP
mkswap /dev/nvme0n1p2          # 格式化 Swap
mkfs.btrfs -L gentoo /dev/nvme0n1p3 # 格式化 Root (Btrfs)
```

**2. 建立子卷**

```bash
mount /dev/nvme0n1p3 /mnt/gentoo
btrfs subvolume create /mnt/gentoo/@
btrfs subvolume create /mnt/gentoo/@home
umount /mnt/gentoo
```

**3. 掛載子卷**

```bash
mount -o compress=zstd,subvol=@ /dev/nvme0n1p3 /mnt/gentoo
mkdir -p /mnt/gentoo/{efi,home}
mount -o subvol=@home /dev/nvme0n1p3 /mnt/gentoo/home
mount /dev/nvme0n1p1 /mnt/gentoo/efi    # 注意：ESP 必須是 FAT32 格式
swapon /dev/nvme0n1p2
```

**4. 驗證掛載**

```bash
lsblk
```

輸出範例：
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /mnt/gentoo/home
                                            /mnt/gentoo
```

<div>

**Btrfs 快照建議**

推薦使用 [Snapper](https://wiki.gentoo.org/wiki/Snapper) 管理快照。合理的子卷規劃（如將 `@` 和 `@home` 分開）能讓系統回滾更加輕鬆。

</div>

</details>

<details>
<summary><b>進階設定：加密分割槽（LUKS）（點選展開）</b></summary>

**1. 建立加密容器**

```bash
cryptsetup luksFormat --type luks2 --pbkdf argon2id --hash sha512 --key-size 512 /dev/nvme0n1p3
```

**2. 開啟加密容器**

```bash
cryptsetup luksOpen /dev/nvme0n1p3 gentoo-root
```

**3. 格式化**

```bash
mkfs.fat -F 32 /dev/nvme0n1p1       # 格式化 ESP
mkswap /dev/nvme0n1p2               # 格式化 Swap
mkfs.btrfs --label root /dev/mapper/gentoo-root # 格式化 Root (Btrfs)
```

**4. 掛載**

```bash
mount /dev/mapper/gentoo-root /mnt/gentoo
mkdir -p /mnt/gentoo/efi
mount /dev/nvme0n1p1 /mnt/gentoo/efi
swapon /dev/nvme0n1p2
```

**5. 驗證掛載**

```bash
lsblk
```

輸出範例：
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /mnt/gentoo/efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  
  └─gentoo-root  253:0    0 926.5G  0 crypt /mnt/gentoo
```

</details>

---

<div>

**建議**

掛載完成後，建議使用 `lsblk` 確認掛載點是否正確。

```bash
lsblk
```

**輸出範例**（類似如下）：
```text
NAME             MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
 nvme0n1          259:1    0 931.5G  0 disk  
├─nvme0n1p1      259:7    0     1G  0 part  /efi
├─nvme0n1p2      259:8    0     4G  0 part  [SWAP]
└─nvme0n1p3      259:9    0 926.5G  0 part  /
```

</div>

## 4. 下載 Stage3 並進入 chroot {#step-4-stage3}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 安裝 Gentoo 安裝檔案](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Stage/zh-cn) · [Stage file](https://wiki.gentoo.org/wiki/Stage_file)

</div>

<div>

**為什麼需要這一步？**

Stage3 是一個最小化的 Gentoo 基礎系統環境。我們將它解壓到硬碟上，作為新系統的"地基"，然後透過 `chroot` 進入這個新環境進行後續配置。

</div>

### 4.1 選擇 Stage3

- **OpenRC**：`stage3-amd64-openrc-*.tar.xz`
- **systemd**：`stage3-amd64-systemd-*.tar.xz`
- Desktop 變種只是預設開啟部分 USE，標準版更靈活。

### 4.2 下載與展開

```bash
cd /mnt/gentoo
# 使用 links 瀏覽器訪問映像站下載 Stage3
links http://ftp.twaren.net/Linux/Gentoo/releases/amd64/autobuilds/20251123T153051Z/ #以 BFSU 映像站為例
# 解壓 Stage3 壓縮套件
# x:解壓 p:保留許可權 v:顯示過程 f:指定檔案 --numeric-owner:使用數字ID
tar xpvf stage3-*.tar.xz --xattrs-include='*.*' --numeric-owner
```

如果同時下載了 `.DIGESTS` 或 `.CONTENTS`，可以用 `openssl` 或 `gpg` 驗證。

### 4.3 複製 DNS 並掛載偽檔案系統

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc/ # 複製 DNS 配置
mount --types proc /proc /mnt/gentoo/proc          # 掛載程式資訊
mount --rbind /sys /mnt/gentoo/sys                 # 繫結掛載系統資訊
mount --rbind /dev /mnt/gentoo/dev                 # 繫結掛載裝置節點
mount --rbind /run /mnt/gentoo/run                 # 繫結掛載執行時資訊
mount --make-rslave /mnt/gentoo/sys                # 設定為從屬掛載 (防止解除安裝時影響宿主)
mount --make-rslave /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/run
```

> 使用 OpenRC 可以省略 `/run` 這一步。

### 4.4 進入 chroot

```bash
chroot /mnt/gentoo /bin/bash    # 切換根目錄到新系統
source /etc/profile             # 載入環境變數
export PS1="(chroot) ${PS1}"    # 修改提示符以區分環境
```

---

## 5. 初始化 Portage 與 make.conf {#step-5-portage}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 安裝 Gentoo 基本系統](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base/zh-cn)

</div>

<div>

**為什麼需要這一步？**

Portage 是 Gentoo 的套件管理系統，也是其核心特色。初始化 Portage 並配置 `make.conf` 就像為你的新系統設定了「構建藍圖」，決定了軟體如何編譯、使用哪些功能以及從哪裡下載。

</div>

### 5.1 同步樹

```bash
emerge-webrsync   # 獲取最新的 Portage 快照 (比 rsync 快)
emerge --sync     # 同步 Portage 樹 (獲取最新 ebuild)
emerge --ask app-editors/vim # 安裝 Vim 編輯器 (推薦)
eselect editor list          # 列出可用編輯器
eselect editor set vi        # 將 Vim 設定為預設編輯器 (vi 通常是指向 vim 的軟連結)
```

設定映像（擇一）：
```bash
mirrorselect -i -o >> /etc/portage/make.conf
# 或手動：
#以 BFSU 映像站為例
echo 'GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"' >> /etc/portage/make.conf
```

### 5.2 make.conf 範例

<div>

**可參考**：[Gentoo Handbook: AMD64 - USE 標誌](https://wiki.gentoo.org/wiki/Handbook:AMD64/Working/USE/zh-cn) · [/etc/portage/make.conf](https://wiki.gentoo.org/wiki//etc/portage/make.conf)

</div>

編輯 `/etc/portage/make.conf`：
```bash
vim /etc/portage/make.conf
```

**懶人/新手配置（複製貼上）**：
<div>

**提示**

請根據你的 CPU 核心數修改 `MAKEOPTS` 中的 `-j` 引數（例如 8 核 CPU 使用 `-j8`）。

</div>

```conf
# ========== 編譯最佳化引數 ==========
# -march=native: 針對當前 CPU 架構最佳化，獲得最佳效能
# -O2: 推薦的最佳化級別，平衡效能與編譯時間
# -pipe: 使用管道加速編譯過程
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"    # C 編譯器選項
CXXFLAGS="${COMMON_FLAGS}"  # C++ 編譯器選項
FCFLAGS="${COMMON_FLAGS}"   # Fortran 編譯器選項
FFLAGS="${COMMON_FLAGS}"    # Fortran 77 編譯器選項

# ========== 並行編譯設定 ==========
# -j 後面的數字 = CPU 執行緒數（執行 nproc 檢視）
# 記憶體不足時可適當減少（如 -j4）
MAKEOPTS="-j8"

# ========== 語言與本地化 ==========
# LC_MESSAGES=C: 保持編譯輸出為英文，便於搜尋錯誤資訊
LC_MESSAGES=C
# L10N/LINGUAS: 支援的語言（影響軟體翻譯和檔案）
L10N="en en-US zh zh-CN zh-TW"
LINGUAS="en en_US zh zh_CN zh_TW"

# ========== 映像源設定 ==========
# 國內推薦：BFSU、TUNA、USTC 等
GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"

# ========== USE 標誌 ==========
# systemd: 使用 systemd 作為 init（若用 OpenRC 改為 -systemd）
# dist-kernel: 使用發行版核心，新手推薦
# 其他: dbus/policykit 桌面必需，networkmanager 網路管理
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# ========== 許可證設定 ==========
# "*" 接受所有許可證；"@FREE" 僅接受自由軟體
ACCEPT_LICENSE="*"
```

<details>
<summary><b>詳細配置範例（建議閱讀並調整）（點選展開）</b></summary>

```conf
# vim: set filetype=bash  # 告訴 Vim 使用 bash 語法高亮

# ========== 系統架構（勿手動修改） ==========
# 由 Stage3 預設，表示目標系統架構
CHOST="x86_64-pc-linux-gnu"

# ========== 編譯最佳化引數 ==========
# -march=native    針對當前 CPU 架構最佳化，獲得最佳效能
#                  注意：編譯出的程式可能無法在其他 CPU 上執行
# -O2              推薦的最佳化級別，平衡效能與穩定性
#                  避免使用 -O3，可能導致部分軟體編譯失敗
# -pipe            使用管道代替臨時檔案傳遞資料，加速編譯
COMMON_FLAGS="-march=native -O2 -pipe"
CFLAGS="${COMMON_FLAGS}"      # C 編譯器選項
CXXFLAGS="${COMMON_FLAGS}"    # C++ 編譯器選項
FCFLAGS="${COMMON_FLAGS}"     # Fortran 編譯器選項
FFLAGS="${COMMON_FLAGS}"      # Fortran 77 編譯器選項

# CPU 指令集最佳化（執行 cpuid2cpuflags 自動產生，見下文 5.3）
# CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt sse sse2 ..."

# ========== 並行編譯設定 ==========
# MAKEOPTS: 控制 make 的並行任務數
#   -j<N>   同時執行的編譯任務數，建議 = CPU 執行緒數（nproc）
#   -l<N>   系統負載限制，防止系統過載（可選）
MAKEOPTS="-j8"  # 請根據實際 CPU 執行緒數調整

# 記憶體不足時的替代配置（例如 16GB 記憶體 + 8 核 CPU）：
# MAKEOPTS="-j4 -l8"  # 減少並行數，限制負載

# ========== 語言與本地化設定 ==========
# 保持構建輸出為英文，便於搜尋錯誤資訊和尋求幫助
LC_MESSAGES=C

# L10N: 本地化語言支援（影響軟體翻譯、檔案等）
L10N="en en-US zh zh-CN zh-TW"

# LINGUAS: 舊式本地化變數（部分軟體仍需要）
LINGUAS="en en_US zh zh_CN zh_TW"

# ========== 映像源設定 ==========
# 國內常用映像（任選其一）：
#   BFSU:  https://mirrors.bfsu.edu.cn/gentoo/
#   TUNA:  https://mirrors.tuna.tsinghua.edu.cn/gentoo/
#   USTC:  https://mirrors.ustc.edu.cn/gentoo/
#   SJTU:  https://mirrors.sjtug.sjtu.edu.cn/gentoo/
GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"

# ========== Emerge 預設選項 ==========
# --ask              執行前詢問確認
# --verbose          顯示詳細資訊（USE 標誌變化等）
# --with-bdeps=y     套件含構建時依賴（更新時也檢查）
# --complete-graph=y 完整依賴圖分析（避免依賴問題）
EMERGE_DEFAULT_OPTS="--ask --verbose --with-bdeps=y --complete-graph=y"

# 可選的額外選項：
# --jobs=N           並行編譯多個套件（記憶體充足時可用）
# --load-average=N   系統負載限制
# EMERGE_DEFAULT_OPTS="--ask --verbose --jobs=2 --load-average=8"

# ========== USE 標誌（全域性功能開關） ==========
# 這些標誌影響所有軟體套件的編譯選項
#
# 系統基礎：
#   systemd        使用 systemd init（若用 OpenRC 改為 -systemd）
#   udev           裝置管理支援
#   dbus           程式間通訊（桌面環境必需）
#   policykit      許可權管理（桌面環境必需）
#
# 網路與硬體：
#   networkmanager 網路管理器（桌面使用者推薦）
#   bluetooth      藍牙支援
#
# 開發工具：
#   git            Git 版本控制
#
# 核心：
#   dist-kernel    使用發行版核心（新手推薦）
#
USE="systemd udev dbus policykit networkmanager bluetooth git dist-kernel"

# 常用的可選 USE 標誌：
#   pulseaudio / pipewire  音訊伺服器
#   wayland / X            顯示伺服器
#   vulkan                 Vulkan 圖形 API
#   vaapi / vdpau          硬體影片解碼
#   cups                   列印支援
#   flatpak                Flatpak 應用支援

# ========== 許可證設定 ==========
# "*"     接受所有許可證（套件括閉源軟體）
# "@FREE" 僅接受自由軟體許可證
ACCEPT_LICENSE="*"

# ========== 影片卡配置（可選） ==========
# 根據你的顯示卡選擇：
#   intel      Intel 整合顯示卡
#   amdgpu     AMD 顯示卡（GCN 1.2+）
#   radeonsi   AMD 顯示卡（OpenGL）
#   nvidia     NVIDIA 顯示卡（閉源驅動）
#   nouveau    NVIDIA 顯示卡（開源驅動）
# VIDEO_CARDS="intel"
# VIDEO_CARDS="amdgpu radeonsi"
# VIDEO_CARDS="nvidia"

# ========== 輸入裝置配置（可選） ==========
# libinput 是現代桌面的推薦選擇
# INPUT_DEVICES="libinput"

# ========== Portage 功能配置（可選） ==========
# 啟用並行解壓、拆分除錯資訊、測試等
# FEATURES="parallel-fetch parallel-unpack splitdebug"

# ========== 編譯日誌配置（推薦） ==========
# PORTAGE_ELOG_CLASSES: 要記錄的日誌級別
#   info     一般資訊
#   warn     警告資訊（重要）
#   error    錯誤資訊（重要）
#   log      普通日誌
#   qa       質量保證警告
PORTAGE_ELOG_CLASSES="warn error log"

# PORTAGE_ELOG_SYSTEM: 日誌輸出方式
#   save          儲存到 /var/log/portage/elog/（推薦）
#   echo          編譯後直接顯示
#   mail          透過郵件傳送
#   syslog        傳送到系統日誌
#   custom        自定義處理
PORTAGE_ELOG_SYSTEM="save"

# 檔案末尾保留換行符！
```

</details>

<div>

**新手提示**

- `MAKEOPTS="-j32"` 的數字應該是你的 CPU 執行緒數，可透過 `nproc` 指令檢視
- 如果編譯時記憶體不足，可以減少並行任務數（如改為 `-j16`）
- USE 標誌是 Gentoo 的核心特性，決定了軟體編譯時套件含哪些功能

</div>

<details>
<summary><b>進階設定：CPU 指令集最佳化 (CPU_FLAGS_X86)（點選展開）</b></summary>

<div>

**可參考**：[CPU_FLAGS_*](https://wiki.gentoo.org/wiki/CPU_FLAGS_*/zh-cn)

</div>

為了讓 Portage 知道你的 CPU 支援哪些特定指令集（如 AES, AVX, SSE4.2 等），我們需要配置 `CPU_FLAGS_X86`。

安裝檢測工具：
```bash
emerge --ask app-portage/cpuid2cpuflags # 安裝檢測工具
```

執行檢測並寫入配置：
```bash
cpuid2cpuflags >> /etc/portage/make.conf # 將檢測結果追加到配置檔案
```

檢查 `/etc/portage/make.conf` 末尾，你應該會看到類似這樣的一行：
```conf
CPU_FLAGS_X86="aes avx avx2 f16c fma3 mmx mmxext pclmul popcnt rdrand sse sse2 sse3 sse4_1 sse4_2 ssse3"
```

</details>

---

## 6. Profile、系統設定與本地化 {#step-6-system}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 安裝 Gentoo 基本系統](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Base/zh-cn)

</div>

<div>

**為什麼需要這一步？**

Profile 定義了系統的基礎配置和預設 USE 旗標，是 Gentoo 靈活性的體現。配置時區、語言和網路等基本系統引數，是讓你的 Gentoo 系統能夠正常運作並符合個人使用習慣的關鍵。

</div>

### 6.1 選擇 Profile

```bash
eselect profile list          # 列出所有可用 Profile
eselect profile set <編號>    # 設定選定的 Profile
emerge -avuDN @world          # 更新系統以匹配新 Profile (a:詢問 v:詳細 u:升級 D:深層依賴 N:新USE)
```

常見選項：
- `default/linux/amd64/23.0/desktop/plasma/systemd`
- `default/linux/amd64/23.0/desktop/gnome/systemd`
- `default/linux/amd64/23.0/desktop`（OpenRC 桌面）

### 6.2 時區與語言

<div>

**可參考**：[Gentoo Wiki: Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide/zh-cn)

</div>

```bash
echo "Asia/Shanghai" > /etc/timezone
emerge --config sys-libs/timezone-data

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
echo "zh_CN.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen                      # 產生選定的語言環境
eselect locale set en_US.utf8   # 設定系統預設語言 (建議用英文以免亂碼)

# 重新載入環境
env-update && source /etc/profile && export PS1="(chroot) ${PS1}"
```

### 6.3 主機名與網路設定

**設定主機名**：
```bash
echo "gentoo" > /etc/hostname
```

**網路管理工具選擇**：

**方案 A：NetworkManager (推薦，通用)**
<div>

**可參考**：[NetworkManager](https://wiki.gentoo.org/wiki/NetworkManager)

</div>

適合大多數桌面使用者，同時支援 OpenRC 和 systemd。
```bash
emerge --ask net-misc/networkmanager
# OpenRC:
rc-update add NetworkManager default
# systemd:
systemctl enable NetworkManager
```

<div>

**配置提示**

**圖形介面**：執行 `nm-connection-editor`  
**指令列**：使用 `nmtui` (圖形化嚮導) 或 `nmcli`

</div>

<details>
<summary><b>進階提示：使用 iwd 後端（點選展開）</b></summary>

NetworkManager 支援使用 `iwd` 作為後端（比 wpa_supplicant 更快）。

```bash
echo "net-misc/networkmanager iwd" >> /etc/portage/package.use/networkmanager
emerge --ask --newuse net-misc/networkmanager
```
之後編輯 `/etc/NetworkManager/NetworkManager.conf`，在 `[device]` 下新增 `wifi.backend=iwd`。

</details>

<details>
<summary><b>方案 B：輕量方案（點選展開）</b></summary>

如果你不想使用 NetworkManager，可以選擇以下輕量級方案：

1. **有線網路 (dhcpcd)**
<div>

**可參考**：[dhcpcd](https://wiki.gentoo.org/wiki/Dhcpcd)

</div>

   ```bash
   emerge --ask net-misc/dhcpcd
   # OpenRC:
   rc-update add dhcpcd default
   # systemd:
   systemctl enable dhcpcd
   ```

2. **無線網路 (iwd)**
<div>

**可參考**：[iwd](https://wiki.gentoo.org/wiki/Iwd)

</div>

   ```bash
   emerge --ask net-wireless/iwd
   # OpenRC:
   rc-update add iwd default
   # systemd:
   systemctl enable iwd
   ```
   
> **提示**：iwd 是一個現代、輕量級的無線守護程式。

</details>

<details>
<summary><b>方案 3：原生方案（點選展開）</b></summary>

使用 init 系統自帶的網路管理功能，適合伺服器或極簡環境。

**OpenRC 網絡卡服務**：
<div>

**可參考**：[OpenRC](https://wiki.gentoo.org/wiki/OpenRC) · [OpenRC: Network Management](https://wiki.gentoo.org/wiki/OpenRC#Network_management)

</div>

```bash
vim /etc/conf.d/net
```

<div>

**注意**

請將下文中的 `enp5s0` 替換為你實際的網絡卡介面名稱（透過 `ip link` 檢視）。

</div>

寫入以下內容：
```conf
config_enp5s0="dhcp"
```

```bash
ln -s /etc/init.d/net.lo /etc/init.d/net.enp5s0 # 建立網絡卡服務軟連結
rc-update add net.enp5s0 default                # 設定開機自啟
```

---

**Systemd 原生網絡卡服務**：
<div>

**可參考**：[systemd-networkd](https://wiki.gentoo.org/wiki/Systemd/systemd-networkd) · [systemd-resolved](https://wiki.gentoo.org/wiki/Systemd/systemd-resolved) · [Systemd](https://wiki.gentoo.org/wiki/Systemd) · [Systemd: Network](https://wiki.gentoo.org/wiki/Systemd#Network)

</div>

Systemd 自帶了網路管理功能，適合伺服器或極簡環境：
```bash
systemctl enable systemd-networkd
systemctl enable systemd-resolved
```
*注意：需要手動編寫 .network 配置檔案。*

</details>



### 6.4 配置 fstab

<div>

**可參考**：[Gentoo Handbook: AMD64 - fstab](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/System/zh-cn) · [Gentoo Wiki: /etc/fstab](https://wiki.gentoo.org/wiki//etc/fstab/zh-cn)

</div>

<div>

**為什麼需要這一步？**

系統需要知道啟動時要掛載哪些分割槽。`/etc/fstab` 檔案就像一張"分割槽清單"，告訴系統：

- 哪些分割槽需要在啟動時自動掛載
- 每個分割槽掛載到哪個目錄
- 使用什麼檔案系統型別

**推薦使用 UUID**：裝置路徑（如 `/dev/sda1`）可能因硬體變化而改變，但 UUID 是檔案系統的唯一識別符號，永遠不變。

</div>

---

#### 方法 A：使用 genfstab 自動產生（推薦）

<details>
<summary><b>點選展開檢視詳細步驟</b></summary>

<div>

**安裝 genfstab**

`genfstab` 套件含在 `sys-fs/genfstab` 套件中（源自 Arch Linux 的 `arch-install-scripts`）。

- **Gig-OS / Arch LiveISO**：已預裝，可直接使用
- **Gentoo Minimal ISO**：需要先安裝 `emerge --ask sys-fs/genfstab`

</div>

<details>
<summary><b>genfstab 引數說明</b></summary>

<div>

| 引數 | 說明 | 推薦度 |
|------|------|--------|
| `-U` | 使用檔案系統 **UUID** 標識 | 推薦 |
| `-L` | 使用檔案系統 **LABEL** 標識 | 需預設標籤 |
| `-t PARTUUID` | 使用 GPT 分割槽 **PARTUUID** | GPT 專用 |
| 無引數 | 使用裝置路徑（`/dev/sdX`） | 不推薦 |

**推薦使用 `-U` 引數**，UUID 是檔案系統的唯一識別符號，不會因磁碟順序變化而改變。

</div>

</details>

**標準用法（在 chroot 外執行）：**

```bash
# 1. 確認所有分割槽已正確掛載
lsblk
mount | grep /mnt/gentoo

# 2. 產生 fstab（使用 UUID）
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab

# 3. 檢查產生的檔案
cat /mnt/gentoo/etc/fstab
```

<details>
<summary><b>chroot 環境下的替代方案</b></summary>

如果你已經 chroot 進入了新系統（`/mnt/gentoo` 變成了 `/`），有以下幾種方法：

**方法一：在 chroot 內執行（最簡單）**

```bash
# 在 chroot 內安裝
emerge --ask sys-fs/genfstab

# 直接對根目錄產生
genfstab -U / >> /etc/fstab

# 檢查並清理多餘條目（可能套件含 /proc、/sys、/dev 等）
vim /etc/fstab
```

**方法二：開啟新終端視窗（LiveGUI）**

如果使用 Gig-OS 等帶圖形介面的 Live 環境，直接開啟新終端視窗（預設在 Live 環境中）：

```bash
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
```

**方法三：使用 TTY 切換（Minimal ISO）**

1. 按 `Ctrl+Alt+F2` 切換到新 TTY（Live 環境）
2. 安裝並執行：
   ```bash
   emerge --ask sys-fs/genfstab
   genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
   ```
3. 按 `Ctrl+Alt+F1` 切回 chroot 環境

</details>

<div>

**genfstab 相容性說明**

[`genfstab`](https://wiki.archlinux.org/title/Genfstab) 工具會自動檢測當前掛載點下的所有檔案系統，[原始碼](https://github.com/glacion/genfstab/blob/master/genfstab)中明確支援：

- **Btrfs 子卷**：自動識別 `subvol=` 引數（不會誤判為 bind mount）
- **LUKS 加密分割槽**：自動使用解密後設備（`/dev/mapper/xxx`）的 UUID
- **普通分割槽**：ext4、xfs、vfat 等常規檔案系統

**前提條件**：在執行 `genfstab` 之前，必須確保所有分割槽已正確掛載（套件括 Btrfs 子卷和已解密的 LUKS 分割槽）。

</div>

</details>

---

#### 方法 B：手動編輯

<details>
<summary><b>點選展開手動配置方法</b></summary>

如果不使用 `genfstab`，可以手動編輯 `/etc/fstab`。

**1. 獲取分割槽 UUID**

```bash
blkid
```

輸出範例：
```text
/dev/nvme0n1p1: UUID="7E91-5869" TYPE="vfat" PARTLABEL="EFI"
/dev/nvme0n1p2: UUID="7fb33b5d-..." TYPE="swap" PARTLABEL="swap"
/dev/nvme0n1p3: UUID="8c08f447-..." TYPE="xfs" PARTLABEL="root"
```

**2. 編輯 fstab**

```bash
vim /etc/fstab
```

**基礎配置範例（ext4/xfs）：**

```fstab
# <UUID>                                   <掛載點>     <型別> <選項>            <dump> <fsck>
UUID=7E91-5869                             /efi         vfat   defaults,noatime  0      2
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none         swap   sw                0      0
UUID=8c08f447-c79c-4fda-8c08-f447c79ce690  /            xfs    defaults,noatime  0      1
```

<div>

**fstab 欄位說明**

| 欄位 | 說明 |
|------|------|
| UUID | 分割槽的唯一識別符號（透過 `blkid` 獲取） |
| 掛載點 | 檔案系統掛載位置（swap 使用 `none`） |
| 型別 | 檔案系統型別：`vfat`、`ext4`、`xfs`、`btrfs`、`swap` |
| 選項 | 掛載選項，多個用逗號分隔 |
| dump | 備份標誌，通常為 `0` |
| fsck | 啟動時檢查順序：`1`=根分割槽，`2`=其他，`0`=不檢查 |

</div>

</details>

---

<details>
<summary><b>Btrfs 子卷配置</b></summary>

**genfstab 自動產生：**

只要 Btrfs 子卷已正確掛載，`genfstab -U` 會自動識別並產生套件含 `subvol=` 的配置。

```bash
# 確認子卷掛載情況
mount | grep btrfs
# 輸出範例：/dev/nvme0n1p3 on /mnt/gentoo type btrfs (rw,noatime,compress=zstd:3,subvol=/@)

# 自動產生
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
```

**手動配置範例：**

```fstab
# Root 子卷
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /       btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,subvol=@       0 0

# Home 子卷（同一 UUID，不同子卷）
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /home   btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,subvol=@home   0 0

# Swap（獨立分割槽）
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none    swap   sw                                                                            0 0

# EFI 分割槽
UUID=7E91-5869                             /efi    vfat   defaults,noatime,fmask=0022,dmask=0022                                        0 2
```

<div>

**Btrfs 常用掛載選項**

| 選項 | 說明 |
|------|------|
| `compress=zstd:3` | zstd 壓縮，級別 3（推薦，平衡效能與壓縮率） |
| `discard=async` | 非同步 TRIM（SSD 推薦） |
| `space_cache=v2` | v2 版空間快取（預設啟用，效能更好） |
| `subvol=@` | 指定掛載的子卷 |
| `noatime` | 不記錄訪問時間（提升效能） |

</div>

<div>

**注意**

- 同一 Btrfs 分割槽的所有子卷使用**相同的 UUID**
- 務必使用 `blkid` 獲取你實際的 UUID

</div>

</details>

<details>
<summary><b>LUKS 加密分割槽配置</b></summary>

<div>

**關鍵點**

fstab 必須使用**解密後對映裝置**的 UUID（`/dev/mapper/xxx`），而非 LUKS 容器的 UUID。

</div>

**genfstab 自動產生：**

`genfstab` 會自動檢測解密後的裝置並使用正確的 UUID：

```bash
# 確認 LUKS 已解密
lsblk
# 應看到類似：nvme0n1p3 → cryptroot → 掛載點

# 自動產生（會使用 /dev/mapper/cryptroot 的 UUID）
genfstab -U /mnt/gentoo >> /mnt/gentoo/etc/fstab
```

**手動配置：區分兩種 UUID**

```bash
blkid
```

```text
# LUKS 容器（TYPE="crypto_LUKS"）- 不要用這個！
/dev/nvme0n1p3: UUID="562d0251-..." TYPE="crypto_LUKS"

# 解密後設備（TYPE="btrfs"）- 用這個！
/dev/mapper/cryptroot: UUID="7b44c5eb-..." TYPE="btrfs"
```

**手動配置範例（Btrfs on LUKS）：**

```fstab
# Root（使用解密後設備 /dev/mapper/cryptroot 的 UUID）
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /       btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,subvol=@       0 0

# Home（同一加密分割槽的不同子卷，UUID 相同）
UUID=7b44c5eb-caa0-413b-9b7e-a991e1697465  /home   btrfs  defaults,noatime,compress=zstd:3,discard=async,space_cache=v2,subvol=@home   0 0

# Swap（獨立分割槽或加密 swap）
UUID=7fb33b5d-4cff-47ff-ab12-7b461b5d6e13  none    swap   sw                                                                            0 0

# EFI（不加密）
UUID=7E91-5869                             /efi    vfat   defaults,noatime,fmask=0022,dmask=0022                                        0 2
```

<div>

**常見問題**

**Q: 為什麼不能用 LUKS 容器的 UUID？**  
A: LUKS 容器是加密的原始資料，系統無法讀取其中的檔案系統。必須先解密，解密後的 `/dev/mapper/xxx` 才有可識別的檔案系統和 UUID。

**Q: `discard=async` 在 LUKS 上安全嗎？**  
A: LUKS2 + `discard` 是安全的。若極度在意安全性，可移除此選項（會降低 SSD 效能）。

</div>


</details>

---

## 7. 核心與韌體 {#step-7-kernel}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 配置 Linux 核心](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Kernel/zh-cn)

</div>

<div>

**為什麼需要這一步？**

核心是作業系統的核心，負責管理硬體。Gentoo 允許你手動裁剪核心，只保留你需要的驅動，從而獲得極致的效能和精簡的體積。新手也可以選擇預編譯核心快速上手。

</div>

### 7.1 快速方案：預編譯核心

```bash
emerge --ask sys-kernel/gentoo-kernel-bin
```

核心升級後記得重新產生載入程式配置。

<details>
<summary><b>進階設定：手動編譯核心 (Gentoo 核心體驗)（點選展開）</b></summary>

<div>

**新手提示**

編譯核心比較複雜且耗時。如果你想盡快體驗 Gentoo，可以先跳過本節，使用 7.1 的預編譯核心。

</div>

手動編譯核心能讓你完全掌控系統功能，移除不需要的驅動，獲得更精簡、高效的核心。

**快速開始**（使用 Genkernel 自動化）：
```bash
emerge --ask sys-kernel/gentoo-sources sys-kernel/genkernel
genkernel --install all  # 自動編譯並安裝核心、模組和 initramfs
# --install: 編譯完成後自動安裝到 /boot 目錄
# all: 完整構建 (核心 + 模組 + initramfs)
```

<div>

**進階內容**

如果你想深入瞭解核心配置、使用 LLVM/Clang 編譯核心、啟用 LTO 最佳化等高階選項，請參考 **[Section 16.0 核心編譯進階指南](/posts/2025-11-25-gentoo-install-advanced/#section-16-kernel-advanced)**。

</div>

</details>

### 7.3 安裝韌體與微碼

```bash
mkdir -p /etc/portage/package.license
# 同意 Linux 韌體的授權條款
echo 'sys-kernel/linux-firmware linux-fw-redistributable no-source-code' > /etc/portage/package.license/linux-firmware
echo 'sys-kernel/installkernel dracut' > /etc/portage/package.use/installkernel
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode  # Intel CPU
```

<div>

**關於 package.license 的說明**

你可能注意到前面 make.conf 範例中已經設定了 `ACCEPT_LICENSE="*"`，為什麼這裡還要單獨為 linux-firmware 建立 package.license 檔案？

- **make.conf 只是範例**：實際使用中，很多使用者會根據自己的需求修改 `ACCEPT_LICENSE`，比如設定為 `@FREE` 只接受自由軟體許可證
- **顯式宣告更清晰**：單獨的 package.license 檔案明確記錄了哪些軟體套件需要特殊許可證，便於日後維護和審計
- **最佳實踐**：即使全域性設定了 `ACCEPT_LICENSE="*"`，為特定軟體套件建立 license 檔案也是 Gentoo 社群推薦的做法，這樣在將來調整全域性許可證策略時，不會意外阻止關鍵軟體套件的安裝

</div>

---

## 8. 基礎工具 {#step-8-base-packages}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 安裝必要的系統工具](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Tools/zh-cn)

</div>

<div>

**為什麼需要這一步？**

Stage3 只有最基礎的指令。我們需要補充系統日誌、網路管理、檔案系統工具等必要元件，才能讓系統在重啟後正常工作。

</div>

### 8.1 系統服務工具

<details>
<summary><b>OpenRC 使用者配置（點選展開）</b></summary>

**1. 系統日誌**

<div>

**可參考**：[Syslog-ng](https://wiki.gentoo.org/wiki/Syslog-ng)

</div>

```bash
emerge --ask app-admin/syslog-ng
rc-update add syslog-ng default
```

**2. 定時任務**

```bash
emerge --ask sys-process/cronie
rc-update add cronie default
```

**3. 時間同步**

<div>

**可參考**：[System Time](https://wiki.gentoo.org/wiki/System_time/zh-cn) · [System Time (OpenRC)](https://wiki.gentoo.org/wiki/System_time/zh-cn#OpenRC)

</div>

```bash
emerge --ask net-misc/chrony
rc-update add chronyd default
```

</details>

<details>
<summary><b>systemd 使用者配置（點選展開）</b></summary>

systemd 已內建日誌與定時任務服務，無需額外安裝。

**時間同步**

<div>

**可參考**：[System Time](https://wiki.gentoo.org/wiki/System_time/zh-cn) · [System Time (systemd)](https://wiki.gentoo.org/wiki/System_time/zh-cn#systemd)

</div>

```bash
systemctl enable --now systemd-timesyncd
```

</details>

### 8.2 檔案系統工具

根據你使用的檔案系統安裝對應工具（必選）：

```bash
emerge --ask sys-fs/e2fsprogs  # ext4
emerge --ask sys-fs/xfsprogs   # XFS
emerge --ask sys-fs/dosfstools # FAT/vfat (EFI 分割槽需要)
emerge --ask sys-fs/btrfs-progs # Btrfs
```

## 9. 建立使用者與許可權 {#step-9-users}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 結束安裝](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Finalizing/zh-cn)

</div>

<div>

**為什麼需要這一步？**

Linux 不建議日常使用 root 賬戶。我們需要建立一個普通使用者，並賦予其使用 `sudo` 的許可權，以提高系統安全性。

</div>

```bash
passwd root # 設定 root 密碼
useradd -m -G wheel,video,audio,plugdev zakk # 建立使用者並加入常用組
passwd zakk # 設定使用者密碼
emerge --ask app-admin/sudo
echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel # 允許 wheel 組使用 sudo
```

若使用 systemd，可視需求將賬號加入 `network`、`lp` 等群組。

---




## 10. 安裝載入程式 {#step-10-bootloader}

<div>

**可參考**：[Gentoo Handbook: AMD64 - 配置引導載入程式](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Bootloader/zh-cn)

</div>

> **重要警告**：Windows 雙系統使用者必讀：
>
> Windows 更新時常會掃描並強制覆蓋 `/EFI/BOOT/bootx64.efi`（預設引導路徑）。
> **後果**：如使用了此預設路徑，將導致 Linux 無法啟動。
> **解決方案**：
> 1.  **使用獨立檔名/目錄**：不要將載入程式僅安裝為 `bootx64.efi`。
> 2.  **手動註冊引導項**：使用 `efibootmgr` 將這個新檔案註冊到 UEFI 啟動列表。
>
> **下文的所有教學（GRUB/systemd-boot/Limine）均已配置為使用獨立路徑，以規避此問題**。
>
> *注：Windows 更新有時還會修改 UEFI 啟動順序 (Boot Order) 將 Windows 置頂，若發生此情況，進入 BIOS 重新調整順序即可。*

### 10.1 方案 A：GRUB (推薦/標準)

GRUB 是功能最全、相容性最好的載入程式，支援自動檢測 Windows。

<div>

**可參考**：[GRUB](https://wiki.gentoo.org/wiki/GRUB/zh-cn)

</div>

**1. 安裝與配置**

```bash
emerge --ask sys-boot/grub:2
# 安裝到 ESP (注意 --bootloader-id=Gentoo 會自動建立獨立目錄，避免衝突)
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=Gentoo
```

**2. 多系統配置 (Windows/Linux/其他)**

如果你安裝了 Windows 或其他 Linux 發行版，需要啟用 `os-prober` 來自動發現它們：

```bash
emerge --ask sys-boot/os-prober
# 啟用 os-prober (預設停用以保障安全)
echo 'GRUB_DISABLE_OS_PROBER=false' >> /etc/default/grub
```

**3. 產生配置檔案**

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```
*（僅限多系統使用者）務必檢查輸出中是否套件含 "Found Windows Boot Manager..." 或其他系統的引導項*

---

### 10.2 方案 B：systemd-boot (簡潔/快速)

systemd-boot (前身是 Gummiboot) 非常輕量，配置簡單，適合 UEFI 系統。

<div>

**可參考**：[systemd-boot](https://wiki.gentoo.org/wiki/Systemd/systemd-boot/zh-cn)

</div>

**1. 安裝**

*   **Systemd 使用者**：
    對於 **systemd version >= 254**，必須啟用 `boot` USE 標誌才能使用 `bootctl`：

    ```bash
    mkdir -p /etc/portage/package.use
    echo "sys-apps/systemd boot" >> /etc/portage/package.use/systemd
    emerge --ask --oneshot --verbose sys-apps/systemd
    ```

    然後安裝載入程式：
    ```bash
    bootctl --path=/efi install
    ```

    <details>
    <summary><b>OpenRC 使用者配置（systemd-utils）- 點選展開</b></summary>

    OpenRC 使用者需要安裝 `sys-apps/systemd-utils` 並啟用 `boot` 和 `kernel-install` USE 標誌：

    ```bash
    mkdir -p /etc/portage/package.use
    echo "sys-apps/systemd-utils boot kernel-install" >> /etc/portage/package.use/systemd-utils
    emerge --ask --oneshot --verbose sys-apps/systemd-utils
    bootctl --path=/efi install
    ```

    </details>

**2. 配置載入器**

編輯 `/efi/loader/loader.conf`：
```ini
default gentoo.conf
timeout 3
console-mode auto
```

**3. 建立 Gentoo 引導項**

獲取根分割槽 UUID：`blkid -s UUID -o value /dev/nvme0n1p3` (假設這是你的根分割槽)
編輯 `/efi/loader/entries/gentoo.conf`：

```conf
title   Gentoo Linux
linux   /vmlinuz-6.6.62-gentoo-dist
initrd  /initramfs-6.6.62-gentoo-dist.img
options root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet
```
*注意：版本號必須與實際檔案 `/efi/vmlinuz-...` 一致。*

**4. 多系統配置 (Windows)**

systemd-boot 會**自動檢測**位於同一 ESP 分割槽 (`/efi/EFI/Microsoft/Boot/bootmgfw.efi`) 的 Windows 引導管理器，通常**不需要**額外配置。

如果你的 Windows 安裝在**不同硬碟的 ESP**，或者自動檢測失敗，才需要手動建立 `/efi/loader/entries/windows.conf`：

```conf
title      Windows 11
efi        /EFI/Microsoft/Boot/bootmgfw.efi
```

---

### 10.3 方案 C：Limine (現代/美觀)

Limine 配置靈活，支援動態選單。

<div>

**可參考**：[Limine](https://wiki.gentoo.org/wiki/Limine)

</div>

**1. 安裝**

```bash
echo 'sys-boot/limine ~amd64' >> /etc/portage/package.accept_keywords/limine
emerge --ask sys-boot/limine
```

**2. 部署引導檔案 (關鍵步驟)**

為了防止 Windows 覆蓋，我們將 Limine 部署為 `Gentoo` 專用引導項，而不是預設的 `BOOTX64.EFI`。

```bash
mkdir -p /efi/EFI/Gentoo
cp -v /usr/share/limine/BOOTX64.EFI /efi/EFI/Gentoo/limine.efi
cp -v /usr/share/limine/limine-bios.sys /boot/ # (可選) 僅 BIOS 需要
```

**3. 配置 Limine**

編輯 `/boot/limine.conf` (Limine 會自動在 ESP 或 /boot 尋找此檔案)：

```ini
TIMEOUT: 5
DEFAULT_ENTRY: 1

: Gentoo Linux
    PROTOCOL: linux
    KERNEL_PATH: boot/vmlinuz-6.6.62-gentoo-dist
    INITRD_PATH: boot/initramfs-6.6.62-gentoo-dist.img
    CMDLINE: root=UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rw quiet

: Windows 11
    PROTOCOL: chainload
    PATH: /EFI/Microsoft/Boot/bootmgfw.efi
```

**4. 註冊 UEFI 引導項**

因為我們沒有使用預設路徑，必須告訴主機板去哪裡透過 `efibootmgr` 啟動 Limine：

```bash
emerge --ask sys-boot/efibootmgr
# 建立名為 "Gentoo Limine" 的啟動項
# -d: 磁碟裝置 (如 /dev/nvme0n1)
# -p: 分割槽號 (如 1)
# -L: 標籤名稱
# -l: loader 路徑 (Windows 風格斜槓)
efibootmgr --create --disk /dev/nvme0n1 --part 1 --label "Gentoo Limine" --loader '\EFI\Gentoo\limine.efi'
```

---

<details>
<summary><b>進階設定：加密支援（僅加密使用者）- 點選展開</b></summary>


**步驟 1：啟用 systemd cryptsetup 支援**

```bash
mkdir -p /etc/portage/package.use
echo "sys-apps/systemd cryptsetup" >> /etc/portage/package.use/fde

# 重新編譯 systemd 以啟用 cryptsetup 支援
emerge --ask --oneshot sys-apps/systemd sys-kernel/dracut
```

**步驟 2：產生含 crypt 模組的 initramfs**

編輯 `/etc/dracut.conf.d/luks.conf`：

> 注意：請根據你的根檔案系統修改 `btrfs` 為 `xfs` 或 `ext4`。
```conf
add_dracutmodules+=" btrfs systemd crypt dm "
```
重新產生 initramfs：
```bash
dracut --kver $(make -C /usr/src/linux -s kernelrelease) --force
```

**步驟 3：獲取 LUKS 分割槽的 UUID**

```bash
# 獲取 LUKS 加密容器的 UUID（不是裡面的檔案系統 UUID）
blkid /dev/nvme0n1p3
```
**輸出範例**（務必尋找 `TYPE="crypto_LUKS"` 的那一行）：
```text
/dev/nvme0n1p3: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="crypto_LUKS" ...
```
記下這個 LUKS UUID（例如：`a1b2c3d4...`）。

**步驟 4：配置引導核心引數**

*   **GRUB (`/etc/default/grub`)**：

    ```bash
    # 完整範例（替換 UUID 為你的實際 UUID）
    GRUB_CMDLINE_LINUX="rd.luks.uuid=a1b2c3d4-e5f6-7890-abcd-ef1234567890 rd.luks.allow-discards root=UUID=b4b0b4... rootfstype=btrfs"
    ```
    **引數說明**：
    *   `rd.luks.uuid=<UUID>`：LUKS 加密分割槽的 UUID（使用 `blkid /dev/nvme0n1p3` 獲取）。
    *   `rd.luks.allow-discards`：允許 SSD TRIM 指令穿透加密層（提升 SSD 效能）。
    *   `root=UUID=<UUID>`：解密後的根檔案系統 UUID（使用 `blkid /dev/mapper/cryptroot` 獲取）。
    *   `rootfstype=btrfs`：**請根據實際情況修改**（例如 `xfs`, `ext4`）。

    *修改後記得執行 `grub-mkconfig -o /boot/grub/grub.cfg`*

*   **systemd-boot (`gentoo.conf`)**：

    ```text
    title      Gentoo Linux
    version    6.6.62-gentoo
    options    rd.luks.name=a1b2c3d4-e5f6-7890-abcd-ef1234567890=cryptroot root=/dev/mapper/cryptroot rootfstype=btrfs rd.luks.allow-discards init=/lib/systemd/systemd
    linux      /vmlinuz-6.6.62-gentoo-dist
    initrd     /initramfs-6.6.62-gentoo-dist.img
    ```
    **引數說明**：
    *   `rd.luks.name=<LUKS-UUID>=cryptroot`：指定 LUKS 分割槽 UUID 並對映為 `cryptroot`。
    *   `root=/dev/mapper/cryptroot`：指定解密後的根分割槽裝置。
    *   `rootfstype=btrfs`：**請根據實際情況修改**（例如 `xfs`, `ext4`）。

*   **Limine (`limine.conf`)**：

    ```ini
    : Gentoo Linux
        PROTOCOL: linux
        KERNEL_PATH: boot/vmlinuz-6.6.62-gentoo-dist
        INITRD_PATH: boot/initramfs-6.6.62-gentoo-dist.img
        CMDLINE: rd.luks.name=a1b2c3d4-e5f6-7890-abcd-ef1234567890=cryptroot root=/dev/mapper/cryptroot rootfstype=btrfs rd.luks.allow-discards init=/lib/systemd/systemd
    ```
    **引數說明**：
    *   `rd.luks.name`: 同上，指定 LUKS 分割槽 UUID。
    *   `root`: 指定解密後的根分割槽裝置。
    *   `rootfstype=btrfs`: **請根據實際情況修改**（例如 `xfs`, `ext4`）。

</details>

> *注意：如果你在步驟 3.4 中選擇了加密分割槽，才需要執行此步驟。*
---

### 11.1 最終檢查清單

1. `emerge --info` 正常執行無錯誤
2. `/etc/fstab` 中的 UUID 正確（使用 `blkid` 再確認）
3. 已設定 root 與一般使用者密碼
4. 已執行 `grub-mkconfig` 或完成 `bootctl`/Limine 配置
5. 若使用 LUKS，確認 initramfs 含有 `cryptsetup`

### 11.2 退出 Chroot 並重啟

確認無誤後，退出 Chroot 環境並解除安裝掛載點：

```bash
exit
umount -l /mnt/gentoo/dev{/shm,/pts,}
umount -R /mnt/gentoo
swapoff -a
reboot
```

---

<div>

**恭喜！** 你已經完成了 Gentoo 的基礎安裝。

**下一步**：[桌面配置](/posts/2025-11-25-gentoo-install-desktop/)

</div>
