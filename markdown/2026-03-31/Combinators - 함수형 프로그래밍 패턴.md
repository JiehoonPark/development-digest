---
title: "Combinators - 함수형 프로그래밍 패턴"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [Combinators](https://tinyapl.rubenverg.com/docs/info/combinators) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> TinyAPL 문서에서 소개하는 Combinator는 인자와 피연산자만 참조하고 수정하지 않는 함수 또는 연산자이다. Identity, Kestrel, Warbler, Cardinal 등 다양한 조합자가 조류 이름으로 명명되어 있으며 함수형 프로그래밍에서 핵심 패턴을 구성한다.

## 상세 내용

- 조합자(Combinator)는 순수 함수 개념으로 부작용이 없으며 함수형 프로그래밍의 기본 블록
- Raymond Smullyan의 'To Mock a Mockingbird'에서 영감을 받아 조류 이름으로 표기

> [!tip] 왜 중요한가
> 함수형 프로그래밍에서 재사용 가능한 고차 함수 패턴을 이해하고 활용할 수 있다.

## 전문 번역

# 컴비네이터(Combinator)

컴비네이터는 자신의 인자나 피연산자를 수정하지 않고 오직 그것들만을 참조하는 함수나 연산자입니다.

## 주요 컴비네이터 목록

| 기호 | APL 표현 | 새 이름(Bird Name) | TinyAPL |
|------|---------|------------------|--------|
| I | \mathrm I | Identity | ⊣/⊢ |
| K | \mathrm K | Kestrel | ⊣ |
| κ | \kappa | Kite | ⊢ |
| W | \mathrm W | Warbler | ⍨ |
| C | \mathrm C | Cardinal | ⍨ |
| B | \mathrm B | Bluebird | ∘/⍤/⍥ |
| Q | \mathrm Q | Queer | ⍛ |
| B₁ | {\mathrm B}_1 | Blackbird | ⍤ |
| Ψ | \Psi | Psi | ⍥ |
| S | \mathrm S | Starling | ⟜/⇽ |
| Σ | \Sigma | Violet Starling | ⊸/⇾ |
| D | \mathrm D | Dove | ∘/⟜ |
| Δ | \Delta | Zebra Dove | ⍛/⊸ |
| Φ | \Phi | Phoenix | «» |
| Φ₁ | \Phi_1 | Pheasant | «» |
| D₂ | {\mathrm D}_2 | Dovekie | ⊸ + ⟜ |
| P | \mathrm P | Parrot | ⸚ |
| N | \mathrm N | Eastern Nicator | ⇽ |
| ν | \mathrm \nu | Western Nicator | ⇾ |

## 컴비네이터 유사 동작

일부 다른 기본 연산자들도 컴비네이터와 유사한 행동을 보입니다.

| APL 표현 | TinyAPL | 다이어그램 |
|---------|--------|---------|
| n⍨ | n⍨ | F y⁖x G y⁖ |

## 참고

몇몇 컴비네이터는 Raymond Smullyan의 저서 『To Mock a Mockingbird』에서 유래한 새의 이름을 갖고 있습니다. 일부 새 이름은 Uiua 컴비네이터 페이지에서 차용했습니다. 그 외의 일부는 직접 만들어낸 것입니다.

## 참고 자료

- [원문 링크](https://tinyapl.rubenverg.com/docs/info/combinators)
- via Hacker News (Top)
- engagement: 126

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
