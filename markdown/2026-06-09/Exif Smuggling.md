---
title: "Exif Smuggling"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-09
aliases: []
---

## 핵심 개념

> [!abstract]
> JPG 파일의 Exif 데이터에 실행 가능한 페이로드를 숨기는 캐시 스머글링 공격 기법입니다. 브라우저 캐시를 통해 인터넷 요청 없이 악성 페이로드를 수동으로 다운로드할 수 있습니다.

## 상세 내용

- JPG Exif 데이터에 악성 DLL을 임베드하여 캐시를 통해 배포
- 네트워크 요청을 우회하여 탐지 회피 가능한 공격 기법

> [!tip] 왜 중요한가
> 이미지 처리 및 캐시 메커니즘의 보안 취약점을 인식하고 방어 메커니즘을 강화해야 합니다.

## 전문 번역

# Exif Smuggling: 캐시 공격의 진화

Exif Smuggling은 캐시 스머글링(Cache Smuggling) 공격 기법을 한 단계 진화시킨 것입니다. JPG 파일의 Exif 데이터 안에 실행 가능한 페이로드를 숨기는 방식인데요, 이를 통해 웹 브라우저의 이미지 캐싱 메커니즘을 악용해 수동적으로 페이로드를 다운로드할 수 있습니다.

이 공격의 가장 흥미로운 점은 로더(예: chrome_poc.ps1)가 2단계 페이로드를 가져오기 위해 **인터넷 요청을 전혀 할 필요가 없다**는 것입니다. 대신 Chrome 브라우저의 캐시에서 직접 추출하면 되거든요.

더 자세한 내용은 [여기](https://malwaretech.com/2025/10/exif-smuggling)에서 확인할 수 있습니다.

## 사용 예시

### PowerShell 로더를 ClickFix 명령어로 변환

```bash
python3 build_clickfix_cmd.py --input-file chrome_poc.ps1 --output-file encoded_command.txt --fake-path "C:\test\doc.txt"
```

### 임의의 JPG 파일에 페이로드 DLL 임베드하기

```bash
python3 exif_smuggling.py --input-file image.jpg --output-file payload.jpg --payload hello_world.dll
```

### 피싱 페이지 예제

`www/index.html`을 참고하세요.

## 참고 자료

- [원문 링크](https://github.com/signalblur/exifsmugglingpoc)
- via Hacker News (Top)
- engagement: 37

## 관련 노트

- [[2026-06-09|2026-06-09 Dev Digest]]
