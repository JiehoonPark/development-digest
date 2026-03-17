---
title: "내 웹사이트에 human.json을 추가했다"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [I’ve added human.json to my website](https://sethmlarson.dev/ive-added-human-dot-json-to-my-website) · Lobste.rs

## 핵심 개념

> [!abstract]
> 개발자가 분산 신뢰 네트워크를 위한 human.json 프로토콜을 자신의 웹사이트에 구현하고, RSS를 통해 자동으로 지지(vouch)하는 사람들을 발견하는 방식을 공유했다.

## 상세 내용

- human.json 프로토콜은 /human.json 파일과 HTML link 요소로 간단히 구현 가능
- BeautifulSoup을 사용한 자동 발견 스크립트로 RSS 피드에서 프로토콜 사용자 추적

> [!tip] 왜 중요한가
> 분산 웹 신뢰 시스템 구축에 참여하는 간단한 방법 제공

## 전문 번역

# Human.json 프로토콜을 내 웹사이트에 추가해봤습니다

Evan Hahn이 최근 자신의 웹사이트에 "human.json 프로토콜"을 추가했다는 블로그 글을 올렸습니다. 사양을 읽어보니 구현하기에 꽤 간단한 프로토콜이라는 생각이 들었어요.

저도 따라해봤는데, 웹사이트에 `/human.json` 파일을 만들고 HTML의 `<head>` 섹션에 `rel="human-json"`이 지정된 `<link>` 엘리먼트를 추가하는 것만으로 충분했습니다. 정말 간단하네요!

## 자동 발견을 위한 추가 작업

다만 보증(vouch) 부분은 조금 복잡했습니다. 제가 구독하는 RSS 피드의 모든 사이트에서 human.json을 지원하는지 자동으로 감지하고 싶었거든요. 그럼 더 많은 사람들이 프로토콜을 구현할 때마다 자동으로 보증 목록을 최신으로 유지할 수 있으니까요.

결국 BeautifulSoup을 이용해서 `<link>` 엘리먼트를 제대로 파싱하도록 스크립트를 수정했습니다(Evan 감사합니다!). 이게 최종 버전입니다:

```python
# 스크립트 코드가 여기에 들어갑니다
```

스크립트를 실행해보니 제가 구독 중인 웹사이트 중에 이미 프로토콜을 지원하는 곳이 두 군데 있더라고요.

## 함께 해보세요

혹시 당신도 자신의 웹사이트에 이 프로토콜을 추가한다면 어떨까요? 제가 당신의 RSS를 구독하고 있다면, 다시 OPML 파일을 생성할 때 자동으로 당신의 웹사이트가 추가될 겁니다.

Mastodon이나 Bluesky에서 팔로우 관계라면 한 번 연락 주세요. 더 빨리 추가해드릴 수 있거든요.

저는 개인적으로 브라우저 익스텐션을 사용할 계획은 없지만, 다른 사람들이 이 "네트워크"에서 데이터를 활용한다면 그것만으로도 성공이라고 생각합니다.

## 참고 자료

- [원문 링크](https://sethmlarson.dev/ive-added-human-dot-json-to-my-website)
- via Lobste.rs

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
