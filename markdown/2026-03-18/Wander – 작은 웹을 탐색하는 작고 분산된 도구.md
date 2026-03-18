---
title: "Wander – 작은 웹을 탐색하는 작고 분산된 도구"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-18
aliases: []
---

> [!info] 원문
> [Wander – A tiny, decentralised tool to explore the small web](https://susam.net/wander/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개인 웹사이트 네트워크를 탐색할 수 있는 분산형 도구로, 각 웹사이트에 Wander 콘솔을 설치하면 다른 콘솔과 연결되어 네트워크를 형성합니다. 간단한 설정으로 개인 웹사이트를 Wander 커뮤니티에 참여시킬 수 있습니다.

## 상세 내용

- 개인 웹사이트들의 분산형 네트워크를 구성하는 도구
- ZIP 파일 다운로드 후 index.html과 wander.js를 /wander/ 디렉토리에 배치하면 설정 완료

> [!tip] 왜 중요한가
> 중앙화되지 않은 웹 커뮤니티 구축의 실제 예로, 분산 아키텍처 설계 패턴을 배울 수 있습니다.

## 전문 번역

# Wander 콘솔으로 개인 웹사이트 네트워크 탐험하기

## Wander 콘솔이란?

지금 당신이 보고 있는 이 페이지가 바로 Wander 콘솔입니다. Wander 콘솔을 사용하면 Wander 커뮤니티에 속한 개인 웹사이트들을 무작위로 둘러볼 수 있어요. 이 네트워크는 자신의 웹사이트를 직접 개발하고 운영하는 사람들로 이루어져 있습니다.

## 콘솔을 옮겨가며 탐험하기

다른 콘솔로 이동하면 현재 웹사이트의 콘솔을 떠나 다른 웹사이트의 Wander 콘솔로 이동하게 됩니다. 그곳에서 계속해서 Wander 네트워크를 탐험할 수 있죠.

물론 꼭 콘솔을 바꿀 필요는 없습니다. 현재 콘솔에서도 다른 콘솔의 추천 목록을 가져올 수 있고, 그 콘솔들이 링크한 콘솔들의 목록까지 재귀적으로 불러올 수 있거든요. 하지만 다른 웹사이트에서 네트워크를 탐험하고 싶다면 콘솔을 전환해도 괜찮습니다.

## 나만의 Wander 콘솔 만들기

자신의 웹사이트에 Wander 콘솔을 설치하려면 다음 단계를 따르면 됩니다.

1. **파일 다운로드 및 추출**: ZIP 파일을 다운로드하고 `index.html`과 `wander.js` 파일을 추출합니다.

2. **서버에 배치**: 추출한 파일들을 웹사이트의 `/wander/` 디렉토리에 올립니다.

3. **설정하기**: `wander.js` 파일을 열어 [codeberg.org/susam/wander](https://codeberg.org/susam/wander)의 지시사항에 따라 편집합니다.

이게 전부입니다! 웹 서버에 `/wander/` 디렉토리가 준비되면, 당신의 Wander 콘솔 링크를 커뮤니티 스레드에 공유할 수 있어요. 누군가 당신의 콘솔을 자신의 콘솔에 추가하면, 당신도 Wander 네트워크의 일원이 되는 것입니다.

더 자세한 정보는 [codeberg.org/susam/wander](https://codeberg.org/susam/wander)를 참고하세요.

## 참고 자료

- [원문 링크](https://susam.net/wander/)
- via Hacker News (Top)
- engagement: 163

## 관련 노트

- [[2026-03-18|2026-03-18 Dev Digest]]
