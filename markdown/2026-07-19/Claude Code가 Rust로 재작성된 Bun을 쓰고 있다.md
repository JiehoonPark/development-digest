---
title: "Claude Code가 Rust로 재작성된 Bun을 쓰고 있다"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-19
aliases: []
---

> [!info] 원문
> [Claude Code uses Bun written in Rust now](https://simonwillison.net/2026/Jul/19/claude-code-in-bun-in-rust/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Bun 창시자 Jarred Sumner는 Claude Code v2.1.181 이후 버전이 Rust로 포팅된 Bun을 사용하며 Linux 시작 속도가 10% 빨라졌다고 밝혔습니다. Simon Willison은 자신의 Claude Code 환경에서 버전 확인 명령을 실행해 아직 공식 출시되지 않은 Bun v1.4.0이 탑재되어 있음을 확인했습니다. 이 Rust 버전은 이후 Bun canary 채널로 공식 배포되었고, package.json 커밋 이력을 통해 5월 17일부터 이 버전이 반영되어 있었다는 사실도 드러났습니다.

## 아티클

# Claude Code가 Rust로 재작성된 Bun을 쓰고 있다

Bun의 창시자 Jarred Sumner가 "Bun을 Rust로 재작성했다(Rewriting Bun in Rust)"는 글에서 흥미로운 언급을 남겼습니다. Claude Code v2.1.181(6월 17일 출시) 이후 버전부터 Rust로 포팅된 Bun을 사용하고 있다는 내용인데요. Simon Willison이 이 주장을 직접 검증해본 과정을 정리했습니다.

## Jarred Sumner의 주장

Jarred Sumner는 Bun을 Rust로 재작성한 이야기를 다루면서, 이미 Claude Code가 이 Rust 버전 Bun을 실제 프로덕션에서 쓰고 있다고 밝혔습니다. 그의 표현을 그대로 옮기면 다음과 같습니다.

> Claude Code v2.1.181(6월 17일 출시) 이후 버전은 Rust로 포팅된 Bun을 사용합니다. Linux에서 시작 속도가 10% 빨라졌지만, 그 외에는 거의 아무도 눈치채지 못했습니다. Boring is good(눈에 띄지 않는 게 좋은 겁니다).

## 직접 확인해보기

Simon Willison은 자신의 Claude Code 설치 환경에서 이 주장이 사실인지 직접 확인해봤습니다. 다음 두 가지 명령어를 통해 설득력 있는 증거를 찾았다고 합니다.

첫 번째 명령어를 실행하자 다음과 같은 결과가 나왔습니다.

```
Bun v1.4.0 (macOS arm64)
```

여기서 눈여겨볼 점은 버전 번호입니다. GitHub에 공개된 Bun의 최신 릴리스는 이 글 작성 시점 기준 5월 12일에 나온 v1.3.14였습니다. 그런데 Claude Code 안에 포함된 Bun은 v1.4.0이었죠. 아직 정식 출시되지 않은 버전이 Claude Code 내부에는 프리뷰 형태로 이미 탑재되어 있었다는 뜻입니다.

(업데이트: 이후 이 Rust 버전은 Bun canary 채널로 정식 공개되었습니다. `bun upgrade --canary` 명령을 실행하면 이 버전을 설치할 수 있습니다.)

두 번째 명령어는 563개의 파일명 목록을 출력했는데, 이 역시 Rust로 작성된 Bun의 내부 구성을 짐작할 수 있는 단서였습니다.

이 두 가지 결과를 종합해보면, Rust로 작성된 Bun이 실제로 수백만 대의 디바이스에서 프로덕션 환경으로 이미 돌아가고 있다는 걸 확인할 수 있었습니다. Jarred Sumner의 말대로 "Boring is good"이라는 표현이 딱 들어맞는 상황입니다.

## 추가로 확인된 증거들

Ajan Raj가 흥미로운 방법 하나를 추가로 공유했습니다. 이를 통해 Claude Code의 `package.json`에서 Bun 버전이 1.4.0으로 업데이트된 커밋을 직접 찾을 수 있었는데요. 이 커밋은 5월 17일에 작성된 것으로 확인됐습니다. 흥미롭게도 이 버전 번호는 이후로 전혀 바뀌지 않았고, 아직 canary 이외의 정식 태그된 릴리스로는 나오지 않은 상태입니다.

## 정리

- Jarred Sumner는 Claude Code v2.1.181(6월 17일 출시) 이후 버전이 Rust로 포팅된 Bun을 사용 중이며, Linux 기준 시작 속도가 10% 빨라졌다고 밝혔습니다.
- Simon Willison은 자신의 Claude Code 설치본에서 Bun 버전을 확인하는 명령을 실행해 v1.4.0(macOS arm64)이라는 결과를 얻었고, 이는 당시 공식 릴리스(v1.3.14)보다 앞선 버전이었습니다.
- 563개 파일 목록 출력 등 추가 증거를 통해 Rust 버전 Bun이 수백만 디바이스에서 실제로 프로덕션 운영 중임을 확인했습니다.
- 이 Rust 버전은 이후 Bun canary 채널로 공식 배포되었으며, `bun upgrade --canary`로 설치할 수 있습니다. `package.json`의 버전 변경 커밋은 5월 17일자로 확인됐습니다.
- 대규모로 쓰이는 핵심 런타임을 언어 자체를 바꿔 재작성하면서도 사용자가 거의 체감하지 못할 정도로 안정적으로 전환했다는 점에서, "눈에 띄지 않는 마이그레이션"이 잘 이뤄진 사례로 볼 수 있습니다.

## 참고 자료

- [원문 링크](https://simonwillison.net/2026/Jul/19/claude-code-in-bun-in-rust/)
- via Hacker News (Top)
- engagement: 369

## 관련 노트

- [[2026-07-19|2026-07-19 Dev Digest]]
