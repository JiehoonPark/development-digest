---
title: "Video.js 16년 만에 완전 재작성, 번들 크기 88% 감소"
tags: [dev-digest, hot, react, typescript, tailwind]
type: study
tech:
  - react
  - typescript
  - tailwind
level: ""
created: 2026-03-24
aliases: []
---

> [!info] 원문
> [Show HN: I took back Video.js after 16 years and we rewrote it to be 88% smaller](https://videojs.org/blog/videojs-v10-beta-hello-world-again) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Video.js v10.0.0 베타가 출시되었으며, 번들 크기를 88% 감축하고 React, TypeScript, Tailwind를 지원하도록 완전히 재설계되었습니다. Plyr, Vidstack, Media Chrome 등 주요 비디오 플레이어 프로젝트들이 협력하여 진행된 대규모 재구축입니다.

## 상세 내용

- 기본 번들 크기를 88% 감축(v8 대비)하고 HTML 기준 25.1KB(gzip)로 경량화
- 새로운 SPF(Streaming Processor Framework) 엔진으로 적응형 비트레이트 스트리밍 시에도 파일 크기 최소화(HLS 기준 v8의 19% 수준)
- React, TypeScript, Tailwind 같은 최신 프레임워크와 도구에 최적화되고 AI 에이전트 친화적인 API 설계

> [!tip] 왜 중요한가
> 웹 비디오 플레이어의 성능과 번들 크기 문제를 대폭 개선하고 현대적인 개발 패턴을 지원하므로 새로운 프로젝트에서 채택할 가치가 있습니다.

## 전문 번역

# Video.js v10.0.0 베타 출시: 현대적 웹 비디오 플레이어의 재탄생

Video.js v10.0.0 베타를 드디어 공개하게 되어 기쁩니다. 이번 출시는 단순한 업데이트가 아닙니다. Video.js뿐만 아니라 Plyr, Vidstack, Media Chrome까지 함께 대규모로 재구축한 결과물이거든요. 웹 비디오를 진심으로 아끼는 개발자들이 힘을 모아 만들었는데, 참여 프로젝트들의 깃허브 스타만 총 75,000개, 월간 비디오 재생 건수는 수십억 건을 넘습니다.

저는 16년 전 Flash에서 HTML5 비디오로 전환하는 과정을 돕기 위해 Video.js를 만들었습니다. 그동안 많은 사람들의 도움으로 성장했지만, 코드베이스와 API는 여전히 과거의 웹 개발 방식을 반영하고 있었어요. 이번 재구축은 현대적인 개발 패턴에 맞게 플레이어를 현대화하면서, 동시에 AI 기능 통합이라는 다음 단계의 전환을 준비하는 기초를 마련했습니다.

우리가 집중한 포인트는 이렇습니다.

**번들 크기 줄이기** (기본 번들 크기 88% 감소)
**프레임워크에 맞는 깊이 있는 커스터마이징** (React, TypeScript, Tailwind 완벽 지원)
**기본값부터 아름답고 빠르게** (전문가들이 "어떻게 이렇게 잘 만들었나요?"라고 물어볼 정도)
**AI 에이전트도 잘 이해할 수 있는 구조** (코드베이스와 문서 설계)

우리는 기존 웹 미디어 플레이어와는 다르게 작동하지만, 당신이 실제로 개발하는 방식에는 훨씬 더 가깝게 느껴질 거라 확신합니다.

## 사용 예시

**HTML**

```html
<video-player>
<video-skin>
<video src="video.mp4"></video>
</video-skin>
</video-player>
```

**React**

```tsx
import '@videojs/react/video/skin.css';
import { createPlayer } from '@videojs/react';
import { videoFeatures, VideoSkin, Video } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});

function App() {
  return (
    <Player.Provider>
      <VideoSkin>
        <Video src="video.mp4" />
      </VideoSkin>
    </Player.Provider>
  );
}
```

## 번들 크기: 진짜 중요한 변화

요즘 비디오 플레이어에 대한 가장 큰 불만이 파일 크기입니다. 보통 미니파이 후 1MB, gzip 압축 후 수백 KB에 달하거든요. 플레이어는 생각보다 복잡한 애플리케이션이라 줄일 수 있는 바이트에는 한계가 있습니다. 그런데 레거시 플레이어들은 스마트 번들러나 트리 쉐이킹 같은 최적화 기법이 없던 시대에 만들어졌어요. 대부분 당신이 실제로 사용하지 않는 기능들을 잔뜩 들고 있는 거죠.

Video.js v10의 기본 플레이어는 이전 버전(v8.x.x)보다 **88% 더 작아졌습니다**. 이 감소분의 상당 부분은 적응형 비트레이트(ABR) 지원을 별도 번들로 분리한 덕분입니다. 이전에도 `video.js/core`에서 따로 임포트하면 ABR을 제외할 수 있었지만, 대부분의 Video.js 사용자는 ABR 기능을 쓰지 않으면서도 기본 번들을 받았거든요. ABR을 제외하고 비교하면, v10 기본 비디오 플레이어(HTML)는 여전히 이전 버전보다 66% 작습니다.

| 플레이어 | 미니파이 (kB) | gzip (kB) | 비고 |
|---------|------------|----------|------|
| Video.js v8 (core) | 260.5 | 75.2 | |
| Vidstack | 237.4 | 74.1 | |
| Media Chrome | 175.5 | 41.3 | |
| Plyr | 109.8 | 32.6 | |
| **Video.js v10 Video Player [HTML]** | **97.4** | **25.1** | |
| **Video.js v10 Audio Player [HTML]** | **85.8** | **23.0** | |
| **Video.js v10 Video Player [React]** | **62.0** | **18.0** | |
| **Video.js v10 Audio Player [React]** | **49.2** | **15.2** | |
| **Video.js v10 Background Video [HTML]** | **22.2** | **6.9** | |
| **Video.js v10 Background Video [React]** | **10.7** | **3.5** | |

## v10 엔진: 성능의 혁신

ABR을 빼고 비교해도, 완전한 기능을 갖춘 비디오 플레이어의 무게는 대부분 스트리밍 엔진에서 나옵니다. HLS와 DASH 같은 적응형 비트레이트(ABR) 포맷을 다루려면 매니페스트 파싱, 세그먼트 로딩, 버퍼 관리, ABR 로직, 코덱 감지, MSE 통합, DRM, 서버사이드 광고 등 정말 많은 작업이 필요하거든요. 기존 스트리밍 엔진들도 비디오 플레이어처럼 모놀리식 구조라 번들 크기를 줄이기 어려웠습니다.

v10에서 우리는 **SPF**(Streaming Processor Framework)라는 새로운 엔진 프로젝트를 시작했습니다. 함수형 컴포넌트들을 조합해서 목적에 맞는 작은 스트리밍 엔진을 만드는 방식이거든요. 예를 들어 짧은 비디오 앱이라면 DRM이나 광고 코드 없이 간단한 적응형 스트리밍만 포함하는 엔진을 구성할 수 있습니다.

간단한 HLS만 필요한 경우, Video.js v10 + SPF 조합은 Video.js v8 + 전체 ABR 지원 구성의 **단 19% 크기**입니다.

| 플레이어 | 미니파이 (kB) | gzip (kB) | 비고 |
|---------|------------|----------|------|
| Vidstack + HLS.js | 764.3 | 238.1 | |
| Media Chrome + HLS.js | 701.2 | 202.9 | |
| Video.js v8 + VHS* | 697.0 | 202.7 | *기본 번들에 포함 |
| Plyr + HLS.js | 614.0 | 188.5 | |
| Video.js v10 + HLS.js | 526.5 | 164.1 | |
| **Video.js v10 + SPF [HTML]** | **144.6** | **38.7** | |
| **Video.js v10 + SPF [React]** | **107.3** | **31.6** | |
| **v10 Background Video + SPF [HTML]** | **61.2** | **18.9** | |
| **v10 Background Video + SPF [React]** | **49.2** | **15.6** | |

엔진끼리 비교하면 이야기가 더 명확해집니다. 다른 엔진들은 포크하지 않는 이상 더 줄이기 어렵지만, SPF로 구성한 엔진은 간단한 적응형 스트리밍에 필요한 것만 포함합니다.

## 참고 자료

- [원문 링크](https://videojs.org/blog/videojs-v10-beta-hello-world-again)
- via Hacker News (Top)
- engagement: 62

## 관련 노트

- [[2026-03-24|2026-03-24 Dev Digest]]
