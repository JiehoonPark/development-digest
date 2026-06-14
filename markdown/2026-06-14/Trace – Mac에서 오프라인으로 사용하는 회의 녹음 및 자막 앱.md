---
title: "Trace – Mac에서 오프라인으로 사용하는 회의 녹음 및 자막 앱"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-14
aliases: []
---

> [!info] 원문
> [Show HN: Trace – Offline Mac meeting transcripts you can flag mid-call](https://traceapp.info) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Apple Silicon Mac에서 오프라인으로 작동하는 회의 녹음 및 자동 자막 생성 앱으로, 모든 데이터가 기기 내에서만 처리되고 클라우드 서버를 사용하지 않는다. 키보드 단축키로 녹음 중 중요한 순간을 표시할 수 있으며 자막, 오디오, 메타데이터는 로컬 파일로 저장된다.

## 상세 내용

- 온디바이스 음성 모델로 초 단위 빠른 자막 생성, 계정 없이 완전 오프라인 작동
- 녹음 중 ⌘K로 중요 순간을 실시간 플래그하고 메모 추가 가능, 자막에 정확한 타임스탬프로 표시
- 모든 녹음 파일과 자막을 Finder에 평문 마크다운과 JSON으로 저장하여 Git 버전 관리나 이동 가능

> [!tip] 왜 중요한가
> 개발자들의 회의, 스탠드업, 논의 내용을 프라이버시 걱정 없이 기록하고 관리할 수 있는 도구로 활용 가능하다.

## 전문 번역

# Mac에서 온디바이스 음성 인식으로 회의 기록하기

## 로컬에서만 작동하는 강력한 음성 모델

녹음된 파일은 절대 서버로 업로드되지 않습니다. 당신의 Mac에서만 모든 처리가 이루어지거든요. 별도 계정이나 구독도 필요 없어요.

## 번개같이 빠른 기록

**14:22** 분량의 회의를 기록했는데, 겨우 **3초** 만에 자동으로 변환되었습니다. 클라우드 서버를 거칠 필요가 없으니까 이렇게 빠른 거예요. Apple Silicon의 성능이 제대로 드러나는 부분입니다.

## 단축키로 모든 것을 제어

매번 마우스로 버튼을 찾을 필요가 없습니다. 키보드 단축키로 대부분의 작업을 처리할 수 있거든요:

- `⌘R`: 녹음 시작/중지
- `⌘K`: 중요한 순간 표시
- `⌘?`: 회의 요약
- `⌘P`: 일시정지
- `⌘H`: 녹음 인디케이터 숨기기

단축키는 자유롭게 재설정할 수 있으니 당신의 습관에 맞춰 사용하면 됩니다.

## 회의 중 실시간으로 핵심 순간 표시

녹음 중간에 `⌘K`를 누르고 메모를 남기세요. 대화는 계속 진행되지만, 당신이 표시한 순간들은 정확히 그 위치에 스크립트로 기록됩니다.

```
**Alex**(36:40)
Sure, does the 15th work for you?

**Speaker 1**(36:44)
Works for me. Lock it in.

36:44·Next meeting date decided

**Speaker 1**(36:48)
Perfect. I'll send a hold now.
```

이렇게 기록되면 나중에 빠르게 스캔해서 찾을 수 있어요.

## 모든 데이터는 당신의 것

녹음 파일은 단순한 오디오와 마크다운 파일로 저장됩니다. Finder에서 직접 관리하면 되는데, 당신의 저장소로 옮기든, Git으로 버전 관리하든, 아니면 삭제하든 자유롭습니다.

```
~/Application Support/Trace/2026-04-16-sync-with-alex/
├── mic.wav (1.2 MB)
├── system.wav (1.5 MB)
├── transcript.md (4 KB)
└── transcript.json (12 KB)
```

## 달력 연동으로 더 똑똑하게

당신의 Mac 달력(또는 Google Calendar)과 연동하면, 녹음할 때 자동으로 회의 제목이 입력됩니다. 회의 1분 전에 조용한 알림이 나타나서 녹음을 시작할지 물어볼 뿐이에요.

모든 기능은 선택 사항이고 기본값으로는 꺼져 있습니다. 당신이 원하는 것만 켜면 되는 거죠.

## 자동으로 말하는 사람 구분

Trace는 누가 말하고 있는지 자동으로 인식합니다. 각 참석자에게 고유한 식별자를 부여해서 스크립트에 명확하게 표시해주거든요.

```
**Speaker 1** [00:08]
Should we ship the Friday build?

**Speaker 2** [00:10]
Yeah, the build succeeds and the tests pass.
```

이렇게 누가 뭘 말했는지 한눈에 파악할 수 있습니다.

## 참고 자료

- [원문 링크](https://traceapp.info)
- via Hacker News (Top)
- engagement: 70

## 관련 노트

- [[2026-06-14|2026-06-14 Dev Digest]]
