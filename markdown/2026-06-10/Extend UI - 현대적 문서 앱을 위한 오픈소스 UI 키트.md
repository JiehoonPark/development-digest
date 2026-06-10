---
title: "Extend UI - 현대적 문서 앱을 위한 오픈소스 UI 키트"
tags: [dev-digest, tech, react]
type: study
tech:
  - react
level: ""
created: 2026-06-10
aliases: []
---

> [!info] 원문
> [Show HN: Extend UI – open-source UI kit for modern document apps](https://www.extend.ai/ui) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> React 기반의 PDF, DOCX, XLSX, CSV 문서 처리 컴포넌트를 제공하는 오픈소스 UI 키트입니다. 바운딩 박스 인용, 파일 업로드, 전자 서명 등의 기능을 포함하고 있으며, 사용자 인터페이스, 에이전트, 내부 도구에 바로 적용할 수 있습니다.

## 상세 내용

- PDF, DOCX, XLSX, CSV 등 다양한 문서 형식을 처리하는 React 컴포넌트 라이브러리 제공
- 바운딩 박스 인용, 파일 업로드, 전자 서명, 스키마 빌더 등 문서 앱에 필요한 다양한 기능 포함

> [!tip] 왜 중요한가
> 문서 기반 애플리케이션 개발 시 복잡한 문서 처리 UI를 직접 구현하는 대신 검증된 컴포넌트를 활용할 수 있습니다.

## 전문 번역

# 현대적인 문서 앱을 위한 오픈소스 UI 키트

React 기반의 문서 처리 컴포넌트들을 한 곳에서 만날 수 있습니다. PDF, DOCX, XLSX, CSV 파일을 다루고, 경계상자 인용, 파일 업로드, 전자서명 등 다양한 기능을 지원합니다.

사용자 인터페이스부터 에이전트, 내부 도구까지 필요한 곳이라면 어디든 바로 적용할 수 있습니다.

## 주요 컴포넌트

**문서 뷰어**
- **PDF Viewer**: PDF 파일 보기
- **DOCX Viewer**: Word 문서 보기
- **XLSX Viewer**: 스프레드시트 보기
- **File System**: 파일 시스템 통합
- **File Thumbnail**: 파일 썸네일 표시

**편집 및 상호작용**
- **Document Splits**: 문서 분할 표시
- **Image**: 이미지 렌더링
- **DOCX Editor**: Word 문서 편집
- **E-Signature**: 전자서명 기능
- **File Upload**: 파일 업로드

**스키마 및 데이터**
- **Schema Builder**: 데이터 스키마 정의
- **Form**: 폼 생성
- **Bounding Box Citations**: 문서 내 위치 참조

## 스키마 빌더 예시

스키마 빌더를 통해 복잡한 데이터 구조를 직관적으로 설정할 수 있습니다.

**기본 필드**
```
account_type: String (Enum)
  - 열거형 값 추가 가능
  - 예: "personal", "business"

account_holder: Object
  - address 객체 포함
```

**중첩 구조**
```
address: Object
  - String 타입 속성 추가 가능
  - 필요한 필드 자유롭게 구성

transactions: Array<Object>
  - 여러 거래 항목 관리
  - String, Number 타입 필드 포함
```

**폼 생성**
정의한 스키마를 바탕으로 자동 생성된 폼에서 사용자 입력을 받고 JSON 형태로 변환합니다.

## 실제 활용

이 컴포넌트들은 다음과 같은 상황에서 유용합니다.

- 고객 정보 수집 및 문서 업로드 플로우
- 자동화 에이전트에서 문서 처리
- 내부 관리 도구에서 파일 관리
- 계약서나 양식에 전자서명 추가

모든 컴포넌트가 모듈화되어 있어 필요한 기능만 골라 사용할 수 있습니다.

## 참고 자료

- [원문 링크](https://www.extend.ai/ui)
- via Hacker News (Top)
- engagement: 123

## 관련 노트

- [[2026-06-10|2026-06-10 Dev Digest]]
