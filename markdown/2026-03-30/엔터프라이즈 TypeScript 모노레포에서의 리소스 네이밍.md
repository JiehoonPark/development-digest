---
title: "엔터프라이즈 TypeScript 모노레포에서의 리소스 네이밍"
tags: [dev-digest, tech, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-03-30
aliases: []
---

> [!info] 원문
> [Resource Names for Enterprise TypeScript Monorepos](https://www.robinwieruch.de/typescript-monorepo-resource-names/) · Robin Wieruch

## 핵심 개념

> [!abstract]
> 멀티 서비스 TypeScript 애플리케이션에서 리소스 경로 생성의 일관성 문제를 해결하기 위해 Google API 디자인 가이드의 리소스 네이밍 컨벤션을 적용하는 방법을 제시합니다. 구조화된 데이터로 리소스 이름을 인코딩/디코딩하는 함수 기반 접근법으로 모노레포 전체에서 일관된 리소스 경로 관리를 실현합니다.

## 상세 내용

- 모노레포의 문제점: 10개 이상의 서비스에서 각각 다른 방식(템플릿 리터럴, 문자열 연결, 하드코딩 등)으로 리소스 경로를 생성하면 일관성이 없어지고, 서비스 간 통신 시 경로 형식 변경이 다른 서비스를 깨뜨립니다.
- Google 리소스 네이밍 컨벤션: 계층적이고 일관된 형식(organizations/org_123/spaces/space_456/projects/proj_789)을 따르면, 경로의 의미가 명시적이 되고 부모-자식 관계와 리소스 계층 구조가 명확해집니다.
- 구조화된 인코딩/디코딩: 템플릿 리터럴 대신 encodeResourceId()/decodeResourceId() 함수를 사용하면 인코딩 로직이 한 곳에 집중되고, 모든 서비스가 동일한 방식으로 리소스를 다룹니다.
- 상대 리소스 이름(Relative Resource Names): 단일 서비스 내에서는 organizations/org_123/invoices/inv_456 형식의 상대 경로만으로도 충분하며, 함수 기반으로 ID 추출 시 path.split('/')과 같은 문자열 파싱을 피할 수 있습니다.
- 완전한 리소스 이름(Full Resource Names): 크로스 서비스 통신 시 //billing.acmeapis.com/organizations/org_123/invoices/inv_456 형식으로 서비스 도메인을 포함하여, 어느 서비스가 리소스를 소유했는지 자동으로 파악할 수 있습니다.
- encodeResourceId() 함수 예시: { service: 'billing' } 옵션으로 전체 리소스 이름을 생성하고, decodeResourceId()는 서비스 프리픽스를 투명하게 제거하여 상대 경로로 변환합니다.

> [!tip] 왜 중요한가
> 모노레포의 여러 서비스에서 리소스 경로 생성 방식을 표준화하면 코드 검토 비용을 줄이고, 버그를 사전에 방지하며, 새로운 팀원의 온보딩을 단순화할 수 있습니다.

## 전문 번역

# TypeScript 모노레포에서 리소스 이름을 표준화하는 방법

멀티서비스 TypeScript 애플리케이션에서는 리소스를 참조하는 방식이 제각각이라는 문제가 생깁니다. 한 팀은 템플릿 리터럴로 경로를 만들고, 다른 팀은 ID를 함수 인자로 넘기고, 또 다른 팀은 서비스 프리픽스를 매직 스트링으로 하드코딩하는 식입니다. 누군가 팀에 합류해서 "여기서 리소스 경로는 어떻게 만드나요?"라고 물으면, 파일마다 다른 답변을 듣게 되니까요.

프리랜서 팀 리드로 일할 때 저도 10개 서비스가 들어있는 모노레포에서 이 문제를 마주쳤습니다. 처음엔 미묘한 불일치였지만, 시간이 지나면서 문제가 복합적으로 얽혔어요. 한 서비스의 리소스명 변경이 다른 서비스의 문자열 보간을 깨뜨렸고, 새로운 기능에서 여러 서비스 경계를 넘나드는 리소스를 식별해야 했는데 표준 형식이 없었습니다. 더 많은 코드 리뷰가 답은 아니었어요. 필요한 건 **관례**였습니다.

Google API Design Guide에서 말하는 리소스 이름(Resource Names)이 정확히 그것입니다. 핵심 아이디어는 시스템의 모든 리소스가 일관된 형식의 계층적 이름을 가져야 한다는 거예요. 이를 TypeScript 모노레포에 적용하면, 즉흥적인 문자열 생성을 대신해 모든 서비스가 이해하는 공유된 어휘가 생깁니다.

## 문자열 보간의 문제점

멀티테넌트 애플리케이션이 이런 계층 구조를 가진다고 해봅시다.

```
Organization → Space → Project → Document
```

실제로는 코드를 작성한 사람에 따라 리소스 경로를 다르게 조립합니다:

```ts
// 개발자 A: 템플릿 리터럴
const path = `organizations/${orgId}/spaces/${spaceId}`;

// 개발자 B: 문자열 연결
const parent = "organizations/" + orgId;

// 개발자 C: 하드코딩된 서비스 프리픽스
const resourceType = "billing.acmeapis.com/Invoice";

// 개발자 D: 수동 파싱
const typeLabel = resourceType.split("/").pop();
```

모두 일회용입니다. 공유된 인코딩 로직이 없고, 서비스 이름에 대한 타입 안정성도 없으며, 경로로부터 구성 요소 ID를 추출할 일관된 방법도 없어요. 형식이 바뀌면 전체 코드베이스를 grep으로 뒤져야 합니다.

더 근본적인 문제는 이런 문자열들이 의미를 담고 있다는 건데, 그 의미가 암묵적이라는 점입니다. `organizations/org_123/spaces/space_456`이라는 경로는 부모-자식 관계, 계층구조, ID 집합을 인코딩하고 있죠. 그런데 코드는 이것을 그저 덤프 문자열로 취급합니다. organization ID를 추출할 구조화된 방법이 없고, 형식을 검증할 방법도 없으며, 어느 서비스가 그 리소스를 소유하는지 알 수 없습니다.

## 리소스 이름을 관례로 삼기

리소스 이름은 특정 리소스를 식별하는 계층적 경로입니다. 형식은 컬렉션 이름과 ID를 번갈아 가집니다:

```
organizations/org_123/spaces/space_456/projects/proj_789
```

마치 빵가루 흔적처럼 읽힙니다. organization org_123이 space space_456을 포함하고, 그 안에 project proj_789가 있다는 뜻이죠. 이 관례는 Google에서 비롯된 것으로, 2014년부터 모든 Cloud API의 표준입니다. Publisher, Book, User, Campaign 등 모든 것이 동일한 collection/id 패턴을 따릅니다.

핵심 통찰은 리소스 이름을 문자열 보간으로 조립해서는 안 된다는 것입니다. 구조화된 데이터로부터 인코딩하고, 다시 구조화된 데이터로 디코딩해야 합니다:

```ts
// 인코딩: 구조화된 데이터 → 경로 문자열
const name = encodeResourceId({
  organizations: "org_123",
  spaces: "space_456",
});
// → "organizations/org_123/spaces/space_456"

// 디코딩: 경로 문자열 → 구조화된 데이터
const ids = decodeResourceId(name, ["organizations", "spaces"]);
// → { organizations: "org_123", spaces: "space_456" }
```

템플릿 리터럴도 없고, 수동 분할도 없습니다. 인코딩 로직은 한 곳에만 존재하고 모든 서비스가 같은 함수를 사용합니다. 경로에서 organization ID를 추출해야 할 때 `path.split("/")[1]`이 아니라 `decodeResourceId`를 호출하면 되니까요.

## 교차 서비스 식별을 위한 전체 리소스 이름

단일 서비스 내에서라면 상대 리소스 이름으로 충분합니다. 결제 서비스가 `organizations/org_123/invoices/inv_456`을 주고받을 때, 그 서비스의 모든 함수는 그 의미를 알고 있으니까요.

그런데 리소스를 여러 서비스 간에 식별해야 한다면 어떻게 할까요? 댓글 시스템이 모든 서비스의 모든 리소스에 댓글을 달 수 있다고 상상해봅시다. 결제 서비스의 인보이스, 재고 서비스의 상품, 신원 서비스의 사용자 등에 말이에요. 댓글 서비스가 리소스 경로를 받긴 했는데, 어느 서비스가 그걸 소유하는지 알 수 없습니다.

여기서 **전체 리소스 이름**이 필요합니다. 형식은 상대 경로 앞에 `//service.domain/`을 붙입니다:

```
//billing.acmeapis.com/organizations/org_123/invoices/inv_456
```

이제 이름이 자기 설명적입니다. 어느 서비스가 리소스를 소유하는지, 그리고 그게 뭔지를 모두 알려줍니다. 댓글 서비스가 이 이름을 받으면 밖에서 추가 정보 없이도 결제 서비스로 라우팅할 수 있어요.

인코딩 함수는 옵션 파라미터로 서비스를 받습니다:

```ts
const fullName = encodeResourceId(
  { organizations: "org_123", invoices: "inv_456" },
  { service: "billing" },
);
// → "//billing.acmeapis.com/organizations/org_123/invoices/inv_456"
```

디코딩은 투명합니다. 서비스 프리픽스를 자동으로 제거합니다:

```ts
const ids = decodeResourceId(fullName, ["organizations", "invoices"]);
// → { organizations: "org_123", invoices: "inv_456" }
```

## 참고 자료

- [원문 링크](https://www.robinwieruch.de/typescript-monorepo-resource-names/)
- via Robin Wieruch

## 관련 노트

- [[2026-03-30|2026-03-30 Dev Digest]]
