---
title: "화자의 말 속도에 따라 동영상 재생 속도를 조정하는 Chrome 확장 프로그램"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Chrome extension adjusts video speed based on how fast the speaker is talking](https://github.com/ywong137/speech-speed) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Web Audio API를 활용하여 화자의 음성 속도를 실시간으로 감지하고 동영상 재생 속도를 자동으로 조정하는 Chrome 확장 프로그램입니다. 느린 화자는 더 빠르게, 빠른 화자는 덜 빠르게 조정하여 모든 음성을 청취하기 편한 속도로 정규화합니다.

## 상세 내용

- 300-3000 Hz 대역통과 필터로 음성의 포먼트 에너지 영역 분리
- 고주파 필터를 통한 에너지 변조 분석으로 음절 속도 감지 (v3 알고리즘)
- 4초 슬라이딩 윈도우의 제로 크로싱 카운팅으로 자연스러운 음절 검출

> [!tip] 왜 중요한가
> Web Audio API의 실무 활용과 신호처리 알고리즘을 JavaScript로 구현하는 방법을 배울 수 있는 실질적 예제입니다.

## 전문 번역

# Speech Speed - 말하는 속도에 따라 동영상 재생 속도를 자동 조절하는 Chrome 확장 프로그램

## 개요

Speech Speed는 화자의 말하기 속도를 감지해서 동영상 재생 속도를 동적으로 조절하는 Chrome 확장 프로그램입니다. 느리게 말하는 사람은 더 빠르게, 빠르게 말하는 사람은 덜 빠르게 재생되므로, 모든 음성을 편안한 속도로 정규화할 수 있어요. 덕분에 빠른 구간에서도 내용을 알아들을 수 있으면서 동시에 동영상을 더 빠르게 감상할 수 있습니다.

## 작동 원리

### 오디오 캡처

확장 프로그램의 콘텐츠 스크립트가 페이지에서 가장 큰 `<video>` 요소를 찾아 `HTMLMediaElement.captureStream()`을 사용해 오디오를 캡처합니다. 일반 재생을 방해하지 않으면서 MediaStream을 얻을 수 있죠. 이 스트림을 Web Audio API 그래프에 연결합니다:

```
video.captureStream()
→ MediaStreamSource
→ BiquadFilter (highpass 300 Hz)
→ BiquadFilter (lowpass 3000 Hz)
→ AnalyserNode (polled at ~33 Hz)
```

300~3000 Hz 대역통과 필터는 음절 에너지가 집중된 모음 포먼트 영역을 추출합니다. 저주파 럼블과 고주파 잡음을 제거하는 거죠.

### 음절 속도 감지

핵심 알고리즘은 에너지 엔벨로프의 변조를 분석해서 음절 속도를 측정합니다. 세 번의 반복을 거쳤어요:

**v1 (폐기됨): 임계값 피크 카운팅**

평활화된 RMS 엔벨로프를 계산한 후 적응형 임계값 위의 피크를 세는 방식이었습니다. 하지만 빠른 연속 음성은 높은 에너지를 유지하면서 음절 사이의 낮은 지점이 깊지 않아서, 개별 음절이 아닌 하나의 긴 영역으로 감지되었어요. 결과적으로 빠른 음성을 항상 과소 계산했습니다.

**v2 (폐기됨): AudioWorklet 기반 감지**

v1과 동일한 피크 카운팅 알고리즘을 AudioWorklet에서 실행해 메인 스레드 외부에서 처리하려고 했습니다. 그런데 YouTube의 Content Security Policy가 스크립트 로딩을 위한 blob: URL을 거부해서 막혔습니다.

**v3 (현재): 에너지 엔벨로프 변조 분석**

개별 피크를 찾는 대신 고주파 필터를 사용해 에너지 엔벨로프의 음절 속도 변조를 분리한 후, 필터링된 신호의 영점 교차를 센다는 개념입니다.

**알고리즘 상세:**

1. AnalyserNode.getFloatTimeDomainData()로 각 2048샘플 윈도우(96kHz에서 약 21ms)에 대한 RMS 에너지를 계산합니다.
2. 1차 IIR 저주파 필터(alpha=0.3)로 엔벨로프를 평활화해 무음 감지와 표시에 사용합니다.
3. 원본 RMS에 고주파 필터를 적용해 DC와 천천히 변하는 레벨을 제거하고, 음절 속도 변조(2~10 Hz)만 남깁니다. 이는 1차 IIR 고주파 필터입니다:

```
filtered[n] = alpha * (filtered[n-1] + rms[n] - rms[n-1])
```

33Hz 폴링에서 alpha=0.9이면 차단 주파수는 약 0.5Hz입니다. 0.5Hz 이상의 모든 신호(음절 변조 2~10Hz 포함)가 통과합니다.

4. 필터링된 신호의 양의 영점 교차를 센다. 필터링된 에너지가 0 아래에서 위로 올라올 때마다 하나의 음절(모음)이 감지됩니다. 교차 사이에 최소 70ms 간격을 두면 최대 감지 속도는 약 14 음절/초로 제한됩니다.
5. 4초 슬라이딩 윈도우 동안 음절 속도를 초당 교차 수로 계산합니다.

이 방식이 작동하는 이유는 빠른 연속 음성 중에도 에너지 엔벨로프가 음절핵(모음, 높은 에너지)과 음절 사이 전이(자음, 낮은 에너지) 사이를 진동하기 때문입니다. 고주파 필터는 절대 레벨에 관계없이 이 진동을 추출하고, 영점 교차 카운팅은 진폭 변화에 본질적으로 강건합니다.

### 속도 매핑

감지된 음절 속도는 재생 속도로 변환됩니다:

```
naturalRate = measuredRate / currentPlaybackSpeed
targetSpeed = targetSyllableRate / naturalRate
targetSpeed = clamp(targetSpeed, minSpeed, maxSpeed)
currentSpeed += smoothingAlpha * (targetSpeed - currentSpeed)
```

`measuredRate / currentPlaybackSpeed` 보정은 `captureStream()`이 현재 재생 속도를 반영한다는 사실을 설명합니다. 동영상이 2배 속도로 재생되면 오디오도 2배 속도로 도착하니까요. 현재 속도로 나누면 화자의 자연스러운 속도를 복구할 수 있습니다.

기본 목표인 9 음절/초로 설정했을 때:

| 화자 속도 | 자연 속도 | 재생 속도 |
|---------|---------|---------|
| 매우 느림 | ~2.5 음절/초 | 3.50배 (상한선) |
| 느림 | ~3.0 음절/초 | 3.00배 |
| 보통 | ~4.5 음절/초 | 2.00배 |
| 빠름 | ~6.0 음절/초 | 1.50배 |
| 매우 빠름 | ~8.0 음절/초 | 1.12배 |

무음 구간(낮은 에너지 또는 3초 이상 낮은 음절 속도)에서는 속도가 천천히 1배로 돌아옵니다.

### 평활화

속도 변화는 지수 이동 평균(alpha=0.25, 초당 약 33회 갱신)을 사용해 갑작스러운 변화를 방지합니다. 이렇게 하면 시간 상수가 대략 1초가 되어, 화자가 바뀔 때 빠르게 적응하면서도 짧은 일시정지가 속도 진동을 일으키지 않을 만큼 충분히 느립니다.

## 설치

1. 이 저장소를 클론하거나 다운로드합니다
2. Chrome에서 `chrome://extensions`를 엽니다
3. 개발자 모드를 활성화합니다 (오른쪽 상단)
4. "확장 프로그램 로드"를 클릭하고 speech-speed 디렉토리를 선택합니다
5. 동영상이 있는 페이지로 이동해 확장 프로그램 아이콘을 클릭하고 ON으로 토글합니다

## 파일 구조

| 파일 | 용도 |
|------|------|
| manifest.json | Manifest V3 확장 프로그램 설정 |
| content.js | 콘텐츠 스크립트: 오디오 캡처, 음절 감지, 속도 제어, 진단 오버레이 |
| popup.html/js/css | 확장 프로그램 팝업: ON/OFF 토글 및 설정 슬라이더 |
| syllable-worklet.js | (레거시, 미사용) v2 방식의 AudioWorklet |

## 설정

팝업에서 세 개의 슬라이더를 조절할 수 있습니다:

- **목표 속도** (4~14 음절/초, 기본값 9): 원하는 효과적인 음절 속도

## 참고 자료

- [원문 링크](https://github.com/ywong137/speech-speed)
- via Hacker News (Top)
- engagement: 63

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
