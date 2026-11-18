---
title: "jQuery 4.1.0 릴리스 노트: 셀렉터 엔진 보안 패치와 내부 정리 작업"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-11-18
aliases: []
---

> [!info] 원문
> [jQuery 4.1.0](https://github.com/jquery/jquery/releases/tag/4.1.0) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> jQuery 4.1.0이 3.8.0과 함께 'Passing the Torch'라는 제목으로 릴리스되었습니다. 이번 업데이트는 getElementsByTagName/ClassName을 querySelectorAll로 통합하는 내부 정리, ReDoS 취약점 수정과 Safari 27 대응 등 셀렉터 엔진 보안·호환성 패치, jqXHR의 responseURL 필드 추가, 폼 연관 커스텀 엘리먼트 지원 등을 포함합니다. 테스트 커버리지 강화와 문서에 기계 생성 기여 가이드라인 추가도 눈에 띕니다.

## 아티클

# jQuery 4.1.0 릴리스 노트: "횃불을 넘기며"

jQuery 블로그에 "jQuery 4.1.0 and 3.8.0 Released: Passing the Torch"라는 제목으로 새 릴리스 소식이 올라왔습니다. 제목에서 드러나듯 이번 릴리스는 단순한 기능 추가를 넘어, 유지보수 체계의 변화를 암시하는 메시지를 담고 있는데요. 실제 변경 내역을 Ajax, Core, CSS, Selector, Serialize 등 영역별로 살펴보겠습니다.

## Ajax 관련 변경

- `jqXHR`에 `responseURL` 필드가 추가되었습니다(#4339). 이를 통해 리다이렉트가 발생한 요청에서도 최종 응답 URL을 확인할 수 있게 되었습니다.
- transport를 위한 대체 `completeCallback` API를 지원하도록 개선되었습니다.

## Core 변경사항

- 배열 경계를 넘어서는 동작을 방지하기 위해 루프 로직이 리팩터링되었습니다.
- `getElementsByTagName`, `getElementsByClassName`을 제거하고 `querySelectorAll`로 통일했습니다(#3642). 내부적으로 셀렉터 엔진을 하나의 API로 수렴시킨 정리 작업으로 볼 수 있습니다.

## CSS 모듈 개선

- 재사용될 가능성이 있을 때 `computeTableStyleTests` 프로브 테이블을 비워주도록 수정했습니다(#5932).
- XML 문서를 지원하기 위해 `createElementNS`를 사용하도록 변경했습니다(#4730).

## Data 모듈

- 바이트 수를 줄이는 경량화 작업이 이루어졌습니다.

## 문서(Docs) 업데이트

- 새로운 상용 지원 벤더로 TuxCare가 추가되었습니다.
- README의 `XMLHttpRequest` 철자 오류를 수정했습니다(#5903).
- 기계 생성(머신 제너레이티드) 기여에 대한 가이드라인이 새로 추가되었습니다. AI를 활용한 PR 제출이 늘어나는 흐름을 반영한 조치로 보입니다.
- README의 jQuery NES HeroDevs 링크를 업데이트했습니다(#5853).
- 활성 버전 테이블을 최신화하고, 4.0 릴리스 내용을 반영해 README를 갱신했습니다(#5781).

## Selector 엔진 관련 수정

이번 릴리스에서 가장 눈에 띄는 영역은 셀렉터 엔진 쪽입니다.

- Safari 27의 정규식 인터프리터 버그를 우회하는 처리가 추가되었습니다.
- `unescapeSelector`의 `runescape` 정규식 버그를 수정했습니다.
- 잘못된 이스케이프 코드 포인트를 `U+FFFD`(대체 문자)로 디코딩하도록 변경했습니다(#5845).
- `jQuery.uniqueSort`의 중복 제거 로직을 최적화했습니다.
- 빠른 선택 경로(quick selection path)에서 더 엄격한 검사를 하도록 개선했습니다.
- 식별자 매칭에서 발생할 수 있는 ReDoS(정규식 서비스 거부 공격) 취약점을 수정했습니다.
- 문서 비교 시 느슨한(loose) 비교 방식을 전반적으로 사용하도록 통일했습니다.

ReDoS 수정과 Safari 27 대응, 이스케이프 코드 포인트 처리 등은 모두 보안성과 호환성을 높이는 실질적인 패치로, 셀렉터 엔진의 안정성을 끌어올리는 작업이라 할 수 있습니다.

## Serialize 모듈

- 폼 연관 커스텀 엘리먼트(form-associated custom elements)를 지원하도록 개선되었습니다(#5245). 최근 웹 컴포넌트 생태계에서 폼 참여형 커스텀 엘리먼트 사용이 늘어나는 추세를 반영한 변경입니다.

## 테스트 커버리지 강화

이번 릴리스에서는 테스트 관련 커밋도 상당히 많습니다.

- Chrome에서 `reliableTrDimensions`가 실패하는 것을 예상된 동작으로 처리했습니다.
- `jQuery.parseXML` 오류 보고 테스트의 엄격도를 완화했습니다.
- `:enabled`/`:disabled`의 구/신 option·optgroup 시맨틱을 모두 수용하도록 했습니다.
- `jQuery.text`에 대한 테스트가 추가되었습니다.
- 콜백 전용 애니메이션 시그니처에 대한 유닛 테스트가 추가되었습니다(#1738).
- IE에서 비활성화되어 있던 AJAX 바이너리 데이터 테스트를 다시 활성화했습니다.
- `jQuery.ajaxPrefilter`, `jQuery.ajaxTransport`에 대한 테스트가 추가되었습니다.
- SVG 엘리먼트에서의 `.data()` 동작 테스트가 추가되었습니다.
- serialize 모듈의 테스트 커버리지를 확대했습니다.

## 정리

- 이번 4.1.0 릴리스는 큰 기능 추가보다는 **내부 정리와 안정성 강화**에 초점이 맞춰져 있습니다. `getElementsByTagName`/`getElementsByClassName` 제거처럼 오래된 내부 구현을 `querySelectorAll` 기반으로 통합하는 정리 작업이 눈에 띕니다.
- **셀렉터 엔진의 보안·호환성 패치**(ReDoS 수정, Safari 27 대응, 이스케이프 코드 포인트 처리)가 다수 포함되어 있어, jQuery를 여전히 프로덕션에서 사용 중이라면 업데이트를 검토할 가치가 있습니다.
- `jqXHR`의 `responseURL` 추가, 폼 연관 커스텀 엘리먼트 지원 등은 실제 API 사용성과 관련된 변화이므로, Ajax나 폼 직렬화 로직을 다루는 코드에서는 동작 변화를 확인해볼 필요가 있습니다.
- 문서에 "기계 생성 기여 가이드라인"이 추가되고 "Passing the Torch(횃불을 넘기며)"라는 릴리스 제목이 붙은 점은, jQuery 프로젝트의 유지보수 체계나 거버넌스에 변화가 있음을 시사하지만, 본문의 커밋 로그만으로는 구체적인 내용까지는 확인할 수 없습니다.

## 참고 자료

- [원문 링크](https://github.com/jquery/jquery/releases/tag/4.1.0)
- via Hacker News (Top)
- engagement: 269

## 관련 노트

- [[2026-11-18|2026-11-18 Dev Digest]]
