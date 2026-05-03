---
title: "Atom 소개 - 피드 형식의 기술 이해"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-03
aliases: []
---

> [!info] 원문
> [Introduction to Atom](https://validator.w3.org/feed/docs/atom.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Atom은 XML 기반의 웹 콘텐츠 및 메타데이터 신디케이션 형식으로, 주기적으로 업데이트되는 웹사이트의 자원을 발행하고 편집하기 위한 애플리케이션 레벨 프로토콜이다. 모든 Atom 피드는 잘 형성된 XML 문서여야 하며, application/atom+xml 미디어 타입으로 식별된다.

## 상세 내용

- Atom은 RSS와 유사한 XML 기반 피드 형식이며, IETF AtomPub Working Group에서 표준화됨
- feed와 entry 요소로 구성되며, link, category, content, author 등의 필수 및 선택 요소를 포함
- 다양한 미디어 타입과 언어를 지원하며, 다른 XML 네임스페이스 확장이 가능

> [!tip] 왜 중요한가
> 웹 콘텐츠 신디케이션과 피드 처리를 구현할 때 표준 형식을 이해하는 것이 중요하다.

## 전문 번역

# Atom과 RSS 피드 문법 검증하기

Atom은 XML 기반의 웹 콘텐츠와 메타데이터를 배포하는 포맷입니다. 정기적으로 업데이트되는 웹사이트의 콘텐츠를 발행하고 편집하기 위한 응용 계층 프로토콜이기도 하죠.

모든 Atom 피드는 올바른 형식의 XML 문서여야 하며, `application/atom+xml` 미디어 타입으로 식별됩니다. 이 글에서는 IETF AtomPub Working Group이 제정한 Atom Syndication Format을 다룹니다.

## 필수 피드 요소

피드에 반드시 포함되어야 하는 요소들을 소개합니다. 각각의 요소는 간단한 설명과 예시를 함께 제공됩니다.

## 선택적 피드 요소

필수는 아니지만 추가할 수 있는 요소들입니다.

## 주요 요소 상세 설명

### `<category>`

카테고리 정보를 나타냅니다.

- **필수 속성**: `term` — 카테고리의 실제 값
- **선택적 속성**: 
  - `scheme` — URI 형태로 카테고리 분류 체계를 식별
  - `label` — 사용자가 읽을 수 있는 카테고리명

### `<content>`

엔트리의 전체 콘텐츠를 포함하거나 링크합니다.

`type` 속성이 `text`, `html`, `xhtml` 중 하나라면, 다른 텍스트 구조와 동일한 방식으로 정의됩니다.

`src` 속성이 있다면, 콘텐츠의 위치를 나타내는 URI입니다. 이 경우 `type` 속성은 콘텐츠의 미디어 타입을 나타냅니다.

그 외의 경우엔 다음과 같이 처리됩니다:
- `type` 속성이 `+xml` 또는 `/xml`로 끝나면, XML 문서가 인라인으로 포함됩니다.
- `type` 속성이 `text`로 시작하면, 이스케이프 처리된 문서가 인라인으로 포함됩니다.
- 그 외엔 Base64로 인코딩된 문서가 포함됩니다.

### `<link>`

HTML의 `<link>` 요소와 유사한 구조입니다.

- **필수 속성**: `href` — 참조하는 리소스의 URI (보통 웹페이지)
- **선택적 속성**:
  - `rel` — 링크 관계 타입 (기본값: `alternate`). 전체 URI이거나 미리 정의된 값
  - `type` — 리소스의 미디어 타입
  - `hreflang` — 참조된 리소스의 언어
  - `title` — 사람이 읽을 수 있는 링크 설명 (주로 표시용)
  - `length` — 리소스의 크기 (바이트)

### `<author>`와 `<contributor>`

사람, 기업, 또는 유사한 단체를 나타냅니다.

- **필수 요소**: `<name>` — 사람의 이름
- **선택적 요소**:
  - `<uri>` — 개인 홈페이지
  - `<email>` — 이메일 주소

### `<title>`, `<summary>`, `<content>`, `<rights>`

사용자가 읽을 수 있는 텍스트를 포함합니다. `type` 속성으로 인코딩 방식을 결정합니다 (기본값: `text`).

- `type="text"` — HTML 엔티티 이스케이프 없는 평문
- `type="html"` — HTML 엔티티 이스케이프된 마크업
- `type="xhtml"` — `div` 요소로 감싼 인라인 XHTML

## Atom의 확장성

Atom 콘텐츠 요소는 다른 XML 어휘를 직접 포함할 수 있도록 설계되었습니다. `<link>` 요소의 `rel` 속성 값으로 모든 정규화된 URI를 사용할 수 있죠.

다른 네임스페이스의 요소도 대거의 위치에 추가할 수 있습니다. 덕분에 RSS 1.0과 RSS 2.0의 대부분 모듈을 Atom 피드에서도 활용 가능합니다.

## 참고 자료

- [원문 링크](https://validator.w3.org/feed/docs/atom.html)
- via Hacker News (Top)
- engagement: 6

## 관련 노트

- [[2026-05-03|2026-05-03 Dev Digest]]
