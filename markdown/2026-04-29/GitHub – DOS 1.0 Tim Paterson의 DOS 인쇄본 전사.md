---
title: "GitHub – DOS 1.0: Tim Paterson의 DOS 인쇄본 전사"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-04-29
aliases: []
---

> [!info] 원문
> [GitHub – DOS 1.0: Transcription of Tim Paterson's DOS Printouts](https://github.com/DOS-History/Paterson-Listings) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> DOS의 원개발자 Tim Paterson이 인쇄한 86-DOS 1.0 및 PC-DOS 1.0의 원본 소스코드를 디지털 형식으로 전사하고 컴파일 가능한 코드로 복원한 프로젝트입니다.

## 상세 내용

- 1981-1982년 DOS 초기 버전의 완전한 커널, 유틸리티, BASIC 라이브러리 소스코드 제공
- 원본 인쇄본을 스캔 → 전사 → 컴파일 가능한 소스코드로 변환하는 3단계 아카이빙 제공

> [!tip] 왜 중요한가
> 컴퓨터 역사 연구, 레거시 시스템 이해, 저수준 시스템 프로그래밍 학습에 중요한 역사적 자료입니다.

## 전문 번역

# 패터슨 리스팅 아카이브

Tim Paterson이 보관했던 DOS 리스팅 자료입니다. 86-DOS 1.00 커널의 소스 코드, 여러 PC-DOS 1.00 사전 출시 버전의 커널과 유틸리티, 그리고 Microsoft BASIC-86 컴파일러 런타임 라이브러리가 포함되어 있습니다.

DOS 관련 부분들은 모두 전사되었으며, 컴파일 가능한 소스 코드로 정리되었습니다.

## 다운로드 및 폴더 구조

**1_transcription (다운로드)**
리스팅을 그대로 전사한 자료입니다. 사실상 프린터 출력물을 그대로 옮긴 형태입니다.

**2_printed_files (다운로드)**
위 출력물에서 추출한 원본 파일들입니다.

**3_source_code (다운로드)**
위 파일들에서 추출한 컴파일 가능한 소스 코드입니다. 소스 코드를 보거나 컴파일/어셈블하려면 이 폴더를 선택하면 됩니다.

원본 스캔 자료(PDF, PNG 형식)는 https://archive.org/details/paterson_listings 에서 확인할 수 있습니다.

더 자세한 정보와 기술 해설은 다음 링크를 참고하세요:
- https://thebrokenpipe.com/dos/paterson_listings
- http://cini.classiccmp.org/recoveryblog.htm
- https://jscarsbrook.me/doshistory

## 리스팅 내용

패터슨의 DOS 리스팅은 총 10개 번들(연속 용지)로 구성되어 있습니다.

**번들 01 (86페이지)**
- MSDOS.LST

**번들 02 (62페이지)**
- 86DOS.A86
(작성: 1981/07/07 17:06:59, 인쇄: 1981/07/08 13:49:52)

**번들 03 (18페이지)**
- EDLIN.DIF (작성: 1981/07/28 14:21:18, 인쇄: 1981/07/28 14:40:48)
- CHKDSK.A86 (작성: 1981/07/15 12:19:22, 인쇄: 1981/07/28 14:41:25)

**번들 04 (58페이지)**
- 86DOS.ASM (작성: 1981/06/15 03:18:51, 인쇄: 1981/06/16 15:17:17)

**번들 05 (57페이지)**
- ASM.PRN

**번들 06 (71페이지)**
- ASM.PRN

**번들 07 (10페이지)**
- CHKDSK.A86 (작성: 1981/06/15 04:10:28, 인쇄: 1981/06/16 15:32:54)

**번들 08 (32페이지)**
- 86DOS.DIF (작성: 1981/06/16 15:11:47, 인쇄: 1981/06/16 15:13:47)

**번들 09 (459페이지)**
- LIBLST.LOG (작성: 1981/11/13 01:10:16, 인쇄: 1981/11/13 01:17:42)
- BASLIB.PRT (작성: 1981/11/13 01:09:35, 인쇄: 1981/11/13 01:19:29)

**번들 10 (20페이지)**
- PAINT.ASM (작성: 1982/01/06 22:20:26, 인쇄: 1982/02/06 20:58:03)
- CIRCLE.ASM (작성: 1982/02/04 11:51:32, 인쇄: 1982/02/06 20:58:44)

현재 9번과 10번 번들은 아직 전사되지 않았습니다. 전사를 도와주실 수 있다면 Pull Request를 보내주세요. 리스팅의 직접적인 전사나 기존 전사본의 오타 수정만 병합됩니다.

## 컴파일/어셈블하기

여기 있는 대부분의 소스는 Seattle Computer Products의 ASM 어셈블러를 대상으로 작성되었습니다. 따라서 이 도구의 복사본이 필요합니다. 86-DOS나 Seattle Computer Products의 MS-DOS 릴리스에서 얻을 수 있습니다. 또한 어셈블러가 생성한 Intel HEX 객체를 바이너리로 변환하는 Seattle Computer Products의 HEX2BIN 유틸리티도 필요합니다.

소스 파일을 어셈블하는 가장 간단한 방법은 다음 명령어를 실행하는 것입니다:

```
ASM <FILENAME-NO-EXTENSION>
```

그 다음에 아래 명령어를 실행합니다:

```
HEX2BIN <FILENAME-NO-EXTENSION>
```

예를 들어, 86DOS.ASM을 86DOS.COM 바이너리로 어셈블하려면 다음과 같이 입력하면 됩니다:

```
A:ASM 86DOS
Seattle Computer Products 8086 Assembler Version 2.24
Copyright 1979,80,81 by Seattle Computer Products, Inc.
Error Count = 0
A:HEX2BIN 86DOS
A:
```

## 참고 자료

- [원문 링크](https://github.com/DOS-History/Paterson-Listings)
- via Hacker News (Top)
- engagement: 115

## 관련 노트

- [[2026-04-29|2026-04-29 Dev Digest]]
