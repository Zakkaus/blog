## [Zakk Blog](https://zakk.au)

這個倉庫是使用 [Hugo](https://gohugo.io/) 與 [Blowfish](https://blowfish.page/)主題打造的多語靜態網站。

### 搜尋引擎驗證

- Google：在 `config/_default/params.toml` 的 `[verification]` 區段填入 `google` 驗證碼，或是更新 `static/google-site-verification.html` 內的 `REPLACE_WITH_GOOGLE_VERIFICATION_CODE`。
- Bing：在同一區段填入 `bing` 驗證碼，或是更新 `static/BingSiteAuth.xml` 中的 `REPLACE_WITH_BING_VERIFICATION_CODE`。
- 部署後確保兩個檔案可分別於 `https://zakk.au/google-site-verification.html` 與 `https://zakk.au/BingSiteAuth.xml` 取得，再回到 Google Search Console 與 Bing Webmaster Tools 驗證即可。
