# Stemly Music Studio

Stemly 是一個 AI 音樂分軌工作台原型，支援匯入 MP4 與常見音訊格式，並將歌曲拆成可個別混音的樂器音軌。

## 目前功能

- 匯入 MP4、MP3、WAV、M4A、FLAC
- 13 類細緻音軌：主唱、和聲、鼓組、打擊樂、貝斯、木吉他、電吉他、鋼琴、合成器、弦樂、銅管、木管、環境與效果
- 各音軌音量、靜音、獨奏與波形介面
- 清晰度、空間感等聲音微調控制
- 演奏評分與練習建議介面
- 響應式桌面與手機版面

> 目前為互動式前端原型；實際 AI 音源分離需串接 Demucs、AudioSep 或其他音訊模型服務。

## 開發

```bash
pnpm install
pnpm dev
```

正式建置：

```bash
pnpm build
```

## GitHub Pages

每次推送到 `main` 後，GitHub Actions 會自動建置並部署可操作的網站。
