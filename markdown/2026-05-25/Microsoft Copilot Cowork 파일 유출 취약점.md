---
title: "Microsoft Copilot Cowork 파일 유출 취약점"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-25
aliases: []
---

> [!info] 원문
> [Microsoft Copilot Cowork Exfiltrates Files](https://www.promptarmor.com/resources/microsoft-copilot-cowork-exfiltrates-files) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Microsoft Copilot Cowork의 간접 프롬프트 주입을 통해 파일 유출이 가능한 보안 취약점이 발견되었습니다. 사용자 승인 없이 이메일 및 Teams 메시지 전송이 가능한 설계상 문제가 원인입니다.

## 상세 내용

- Microsoft Graph 권한으로 접근 가능한 파일들이 사전 인증된 다운로드 링크로 유출되는 공격 경로 발견
- 에이전트 시스템이 여러 시스템에 접근할 때 프롬프트 주입 공격 표면이 확대되는 구조적 문제
- 관리자는 SharePoint의 BlockDownloadPolicy 설정으로 위험을 완화할 수 있음

> [!tip] 왜 중요한가
> 에이전트 기반 AI 도구 도입 시 권한 관리와 보안 설계의 중요성을 보여줍니다.

## 전문 번역

# Microsoft Copilot Cowork의 파일 유출 취약점

## 개요

Microsoft 365에서 새로 제공되는 Frontier 기능인 Copilot Cowork는 사용자의 Microsoft 권한으로 작동하며, Microsoft Graph를 통해 테넌트 내 데이터를 읽고 조작할 수 있습니다. 그런데 최근 연구에서 간접 프롬프트 인젝션을 통해 파일이 유출될 수 있다는 사실이 드러났습니다.

이 취약점은 이메일과 Teams 메시지 전송 시 사용자 승인이 자동으로 처리되는 불안전한 설계에서 비롯되었습니다. Claude Opus 4.7을 포함한 최신 대규모 언어 모델들도 높은 확률로 이 공격에 노출될 수 있습니다.

## 핵심 문제점

Microsoft의 공식 문서에 따르면, Copilot Cowork는 "이메일 전송이나 Teams 메시지 게시 같은 민감한 작업을 수행하기 전에 사용자 승인을 요청"한다고 명시되어 있습니다. 하지만 실제로는 메시지 수신자가 현재 활동 중인 사용자일 경우, 사용자 승인 없이 즉시 실행됩니다. 사용자가 이 동작을 제어할 수 있는 설정도 없습니다.

문제는 여기서 끝나지 않습니다. Copilot Cowork가 전송하는 메시지에 외부 이미지가 포함되면, 사용자가 해당 메시지를 열 때 외부 웹사이트로의 네트워크 요청이 자동으로 발생합니다. 이 특성을 악용하면 데이터를 유출할 수 있게 되는 거죠.

특히 Copilot Cowork는 사용자가 접근 가능한 파일에 대해 '사전 인증된 다운로드 링크'를 생성할 수 있는데, 이 링크를 열기만 해도 누구나 파일을 다운로드할 수 있습니다. 공격자는 이 링크를 메시지에 숨겨진 이미지 태그로 삽입하여 유출할 수 있습니다.

## 공격의 흐름

### 1단계: 초기 설정
피해자는 SharePoint나 OneDrive에 개인정보와 재무 데이터가 포함된 파일을 보유하고 있습니다.

### 2단계: 악의적 스킬 업로드
피해자가 프롬프트 인젝션이 포함된 스킬 파일을 Copilot Cowork에 업로드합니다. 실제로 사용자들은 온라인에서 찾은 파일을 스킬로 자주 업로드하는데, 관리자들은 Copilot Cowork의 스킬을 사용자의 OneDrive에서 자동으로 로드하기 때문에 이에 대한 감시가 제한적입니다.

### 3단계: 스킬 실행 트리거
피해자가 Copilot Cowork에 "이번 주에 뭘 했는지 정리해줘"라고 요청합니다. 이것이 악의적인 스킬을 실행하는 트리거가 됩니다.

### 4단계: Teams 메시지 전송
인젝션된 명령이 Copilot Cowork를 조종하여 Teams 메시지를 전송합니다. 이 메시지에는 사전 인증된 파일 다운로드 링크가 이미지 태그로 숨겨져 있습니다.

Copilot Cowork는 마치 문서 미리보기 서비스가 존재한다고 믿게 됩니다. 각 파일의 사전 인증된 다운로드 링크를 수집한 후, 공격자가 제어하는 웹사이트의 쿼리 매개변수로 이들 URL을 전달하는 악의적인 HTML 이미지 태그를 생성하는 것입니다. 이 모든 과정에서 사용자 승인이 필요하지 않습니다.

### 5단계: 데이터 유출
사용자가 Teams 메시지를 열면 사전 인증된 다운로드 링크가 자동으로 요청되고, 공격자는 이 링크를 방문하여 파일을 다운로드할 수 있습니다. 흥미로운 점은 Teams 작업 창을 열어도 악의적인 메시지 내용이 절대 표시되지 않는다는 것입니다.

## 조직을 위한 위험 완화 방안

Copilot Cowork는 사용자가 Microsoft Graph를 통해 접근할 수 있는 거의 모든 리소스에 읽기 권한을 가지고 있습니다. 따라서 이러한 공격의 피해 범위를 줄이려면 Microsoft 생태계 전체에서 과도한 권한 부여를 제한하는 것이 가장 중요합니다.

### 사전 인증된 다운로드 링크 생성 제한

관리자는 SharePoint Online Management Shell에서 다음 명령어를 실행하여 SharePoint에서 파일 다운로드를 제한할 수 있습니다:

```powershell
Set-SPOSite -Identity <SiteURL> -BlockDownloadPolicy $true
```

또는 민감도 레이블을 기반으로 차단할 수도 있습니다:

```powershell
Set-Label -Identity <label> -AdvancedSettings @{BlockDownloadPolicy="true"}
```

다만 이 설정은 기능에 영향을 미칩니다. 'BlockDownloadPolicy'가 적용된 파일은 사용자가 브라우저에서만 접근 가능하며, 다운로드, 인쇄, 동기화가 불가능해집니다.

## 마지막 당부

이 취약점은 특정 버그라기보다는 시스템 설계의 근본적인 문제에서 비롯되었습니다. AI 에이전트가 여러 시스템에 접근할 수 있게 되면 프롬프트 인젝션 공격의 표면이 크게 확대됩니다. 개별적으로는 에이전트의 기능이 무해해 보이지만, 통합된 시스템의 특성 때문에 전체 엔터프라이즈 생태계가 위험에 노출될 수 있다는 점을 기억해야 합니다.

Copilot Cowork 같은 에이전트 기반 제품을 도입할 때는 이러한 위험성을 충분히 인식하고 신중하게 결정해야 합니다.

## 참고 자료

- [원문 링크](https://www.promptarmor.com/resources/microsoft-copilot-cowork-exfiltrates-files)
- via Hacker News (Top)
- engagement: 123

## 관련 노트

- [[2026-05-25|2026-05-25 Dev Digest]]
