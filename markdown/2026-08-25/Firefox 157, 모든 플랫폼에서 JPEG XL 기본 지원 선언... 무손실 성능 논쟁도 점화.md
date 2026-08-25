---
title: "Firefox 157, 모든 플랫폼에서 JPEG XL 기본 지원 선언... 무손실 성능 논쟁도 점화"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-08-25
aliases: []
---

> [!info] 원문
> [Firefox 157 will include JPEG XL by default on all platforms](https://groups.google.com/a/mozilla.org/g/dev-platform/c/3YMV4MS34KA?pli=1) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Mozilla가 Firefox 157부터 JPEG XL 디코딩을 모든 플랫폼에서 기본 활성화하겠다고 발표했습니다. Rust로 작성된 jxl-rs 디코더는 멀티스레드 지원 추가로 Safari의 C++ libjxl과 비슷하거나 앞서는 성능을 보이며, wpt 테스트와 자체 Gecko 테스트, 퍼징까지 검증을 마쳤습니다. 하지만 커뮤니티에서는 무손실 JPEG XL이 무손실 WebP보다 디코딩 속도가 30배 느리다는 실측 벤치마크를 근거로, 파일 크기 절감(약 10%) 대비 실효성에 의문을 제기하며 손실 포맷만 우선 출시하자는 반론도 나왔습니다.

## 아티클

# Firefox 157, 모든 플랫폼에서 JPEG XL 기본 지원 선언

Mozilla의 엔지니어 Timothy Nikkel이 dev-platform 메일링 리스트에 "Intent to ship: JPEG XL"을 올렸습니다. Firefox 157부터 모든 플랫폼에서 JPEG XL 디코딩을 기본으로 켠다는 내용인데요, Safari가 2023년에 이미 지원을 시작했고 Chrome도 실험 플래그 뒤에서 준비 중인 상황에서 Firefox까지 합류하면 JPEG XL이 사실상 3대 브라우저 엔진에 모두 자리 잡게 됩니다. 다만 스레드에 이어진 반박 댓글에서 무손실(lossless) JPEG XL의 디코딩 속도가 WebP 대비 30배 느리다는 실측 데이터가 제기되면서, 파일 크기 절감 효과 대비 실효성에 대한 논쟁도 함께 벌어지고 있습니다.

## 무엇이 바뀌는가

지금까지 JPEG XL 디코딩은 `image.jxl.enabled` 플래그 뒤에 숨겨져 있었고, Nightly 채널에서만 기본으로 켜져 있었습니다. Firefox 152부터는 모든 채널에서 Firefox Labs 체크박스로 수동 활성화가 가능했고요. 이번 제안은 이 기능을 Firefox 157부터 전체 플랫폼에서 기본값으로 전환하겠다는 것입니다.

주요 정보는 다음과 같습니다.

- **관련 버그**: bugzilla.mozilla.org/show_bug.cgi?id=2065096
- **표준**: ISO/IEC 18181 (표준화 기구: ISO/IEC)
- **디코더**: Rust로 작성된 `jxl-rs`
- **플랫폼 범위**: 전체
- **프리퍼런스**: `image.jxl.enabled`
- **Standards position**: neutral (github.com/mozilla/standards-positions/issues/522)
- **TAG review**: "satisfied with concerns" (github.com/w3ctag/design-reviews/issues/633)

다른 브라우저 현황도 함께 언급됐습니다. Safari는 이미 2023년 17.0 버전에서 JPEG XL을 지원 시작했고, Chrome은 `#enable-jxl-image-format` 플래그 뒤에서 Firefox와 동일한 Rust 라이브러리(`jxl-rs`)를 사용해 테스트 중이지만 아직 정식 출시 의사는 밝히지 않은 상태였습니다. (이후 댓글에서 Chromium 쪽에서도 정식 "Intent to ship"이 올라왔다는 링크가 추가로 공유됐습니다.)

## Intent to Prototype 이후 달라진 점

이전 프로토타입 제안 단계에서 커뮤니티가 가장 우려했던 부분은 성능이었습니다. 이에 대응해 다음과 같은 개선이 이뤄졌다고 합니다.

- `jxl-rs 0.6.0`이 멀티스레드 디코딩 지원을 담아 릴리스됐고, 이를 실제로 연결해 활성화하는 패치도 곧 병합될 예정입니다.
- 이 패치를 포함한 상태로 5가지 이미지 포맷을 대상으로 다양한 크기의 사진에 대해 디코딩 벤치마크를 돌린 결과, Nikkel의 머신 기준으로 (C++ `libjxl`을 사용하는) Safari보다 근소하게 앞섰다고 합니다.
- Firefox의 다른 이미지 포맷 디코더들과 비교하면, 큰 이미지에서는 JPEG XL이 비슷한 성능을 보이지만 작은 이미지에서는 격차가 더 벌어진다고 밝혔습니다.

기능 측면에서는 애니메이션과 프로그레시브 디스플레이를 포함해 다른 이미지 포맷들 및 Blink의 JPEG XL 구현체와 기능 동등성(feature parity)을 갖췄다고 설명합니다. 유일한 예외는 HDR인데, HDR 이미지는 다른 포맷과 마찬가지로 SDR로 표시되지만, JPEG XL에 대한 톤 매핑(tone mapping)은 다른 포맷들보다 훨씬 낫다고 언급했습니다. 참고로 Safari는 프로그레시브 렌더링과 애니메이션 모두 지원하지 않는다고 합니다.

## 테스트 커버리지

Web Platform Tests(wpt)의 `jpegxl` 디렉터리는 비트 심도, 알파, 그레이스케일, CMYK, 색상 관리, 방향(orientation), 코딩 툴 등 디코딩 정확성 전반과 HTML·CSS에서 이미지가 사용되는 방식을 커버합니다. wpt로 표현할 수 없는 부분은 Gecko 자체 테스트로 보완했는데요.

- 청크 단위/점진적 디코딩, 애니메이션 프레임 수, 디코딩 중 다운스케일, 손상된 파일 처리 등을 검증하는 gtest 약 30개
- 프로그레시브 렌더링과 텔레메트리를 위한 mochitest
- reftest
- Perfherder에 결과를 보고하는 디코딩 벤치마크

퍼징(fuzzing) 팀은 이미 Nightly에서 활성화되기 전에 JPEG XL을 한 차례 퍼징했고, 이번에 프리퍼런스를 뒤집기 전에 디코더를 다시 한번 퍼징할 예정이라고 합니다.

## 무손실 JPEG XL 성능을 둘러싼 반론

스레드에는 Sergey Davidoff라는 참여자가 무손실 JPEG XL의 디코딩 성능에 강한 우려를 제기하며 실측 벤치마크를 공유했습니다. 그의 주장은 무손실 JPEG XL이 무손실 WebP 대비 파일 크기는 약 10% 줄지만, 디코딩 속도는 30배나 느리다는 것입니다. 이는 특히 배터리 소모와 사용자 경험이 중요한 노트북·모바일 환경에서 받아들이기 어려운 트레이드오프라며, Firefox 157에서는 손실(lossy) JPEG XL만 우선 출시하고 무손실 포맷은 별도로 검토할 것을 제안했습니다.

측정 방법론은 다음과 같습니다.

- 측정 도구: [hyperfine](https://github.com/sharkdp/hyperfine) — 여러 번 실행해 통계를 수집
- 디코더: [jxl-rs](https://github.com/libjxl/jxl-rs) git 커밋 `775837f57dfe4294d89c1c6317dd91a1ed8d3cfa`, `cargo build --release`로 빌드
- 입력 이미지: 위키미디어 커먼즈의 `55_Cancri_e_Final_1_30.png`
- `cwebp -lossless`로 WebP 변환, `cjxl -d 0`으로 JPEG XL 변환 (둘 다 무손실)
- 두 디코더 모두 `taskset -c 0`으로 싱글 스레드 모드에서 실행해 총 CPU 시간을 측정

실행 결과는 다음과 같습니다.

```
$ hyperfine --warmup 5 'taskset -c 0 target/release/jxl_cli --speedtest 55_Cancri_e_Final_1_30.jxl' 'taskset -c 0 dwebp 55_Cancri_e_Final_1_30.png.webp'
    Benchmark 1: taskset -c 0 target/release/jxl_cli --speedtest 55_Cancri_e_Final_1_30.jxl
      Time (mean ± σ):     20.632 s ±  0.061 s    [User: 20.605 s, System: 0.027 s]
      Range (min … max):   20.549 s … 20.743 s    10 runs

    Benchmark 2: taskset -c 0 dwebp 55_Cancri_e_Final_1_30.png.webp
      Time (mean ± σ):     667.0 ms ±   2.2 ms    [User: 449.5 ms, System: 217.5 ms]
      Range (min … max):   664.3 ms … 670.1 ms    10 runs

    Summary
      taskset -c 0 dwebp 55_Cancri_e_Final_1_30.png.webp ran
       30.93 ± 0.14 times faster than taskset -c 0 target/release/jxl_cli --speedtest 55_Cancri_e_Final_1_30.jxl
```

Davidoff는 참고 삼아 C++로 작성된 원본 `libjxl`의 `djxl` 툴로 같은 측정을 해봐도 WebP보다 20배 느리다는 점을 덧붙였습니다. 즉 Rust 구현체(`jxl-rs`)를 더 최적화한다고 해도 이 격차를 근본적으로 좁히기는 어려워 보이며, 전체적인 트레이드오프 계산 자체가 바뀌지는 않을 것이라는 게 그의 결론입니다.

한편 스레드 초반에는 애니메이션 JPEG XL 지원 여부를 묻는 질문도 있었는데, Nikkel은 애니메이션 JPEG XL이 지원된다고 명확히 답했습니다.

## 정리

- Firefox는 157 버전부터 `image.jxl.enabled`를 모든 플랫폼에서 기본 활성화해 JPEG XL 디코딩을 정식 지원할 계획입니다. 디코더는 Rust로 작성된 `jxl-rs`이며, Safari(2023년 출시)에 이어 Chrome도 같은 Rust 라이브러리로 준비 중입니다.
- 프로토타입 단계에서 지적된 성능 문제는 `jxl-rs 0.6.0`의 멀티스레드 디코딩 지원으로 상당 부분 개선되어, 현재는 Safari의 C++ `libjxl` 구현체보다 소폭 앞서는 벤치마크 결과를 보입니다. 다만 작은 이미지에서는 다른 포맷 대비 여전히 격차가 있습니다.
- 애니메이션, 프로그레시브 렌더링 등 기능 동등성은 확보했고, HDR 톤 매핑은 오히려 다른 포맷보다 우수하다고 평가됩니다. wpt 테스트와 자체 Gecko 테스트, 퍼징까지 검증 체계를 갖췄습니다.
- 다만 무손실 JPEG XL의 디코딩 속도가 무손실 WebP 대비 30배 느리다는 실측 반론이 제기됐습니다. 파일 크기 절감은 약 10%에 그쳐, 모바일·배터리 환경에서는 트레이드오프가 불리하다는 지적이며, 손실 JPEG XL만 우선 출시하자는 대안도 나왔습니다.
- 프론트엔드 개발자 입장에서는 이미지 최적화 파이프라인에 JPEG XL을 도입할 때 손실/무손실 모드에 따라 디코딩 비용 차이가 크다는 점, 그리고 브라우저 지원이 아직 과도기라는 점을 함께 고려해야 합니다.

## 참고 자료

- [원문 링크](https://groups.google.com/a/mozilla.org/g/dev-platform/c/3YMV4MS34KA?pli=1)
- via Hacker News (Top)
- engagement: 238

## 관련 노트

- [[2026-08-25|2026-08-25 Dev Digest]]
