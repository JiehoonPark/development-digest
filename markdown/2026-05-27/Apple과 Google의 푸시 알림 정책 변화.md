---
title: "Apple과 Google의 푸시 알림 정책 변화"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-05-27
aliases: []
---

> [!info] 원문
> [What Apple and Google are doing to push notifications](https://www.jacquescorbytuech.com/writing/what-apple-and-google-are-doing-your-push-notifications) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Apple과 Google이 15년에 걸쳐 푸시 알림을 적극적으로 관리하고 제어하기 시작했습니다. 배터리 문제로 시작된 푸시 알림 서비스는 이제 플랫폼이 사용자의 주의를 보호하기 위해 알림을 요약, 재정렬, 필터링하는 중개자 역할을 하고 있습니다.

## 상세 내용

- Android 13+ POST_NOTIFICATIONS 런타임 권한 도입으로 옵트인율이 85%에서 67%로 급락했으며, 크로스플랫폼 평균은 61%입니다.
- iOS 15의 Focus와 Scheduled Summary, Android 8의 notification channels 등 플랫폼 수준의 필터링이 강화되어 마케터의 제어권이 축소됩니다.
- 플랫폼이 사용자 주의를 보호한다는 명목으로 발신자의 투명성 없는 판단을 적용하고 있습니다.

> [!tip] 왜 중요한가
> 개발자와 마케터는 푸시 알림 전략을 재구성해야 하며, 플랫폼의 불투명한 필터링 정책에 대한 대응책이 필요합니다.

## 전문 번역

# 푸시 알림의 미래: 플랫폼이 중간에서 장악하기 시작했다

지난 글에서 Google, Yahoo, Microsoft, Apple이 이메일을 어떻게 바꾸고 있는지 다뤘습니다. 네 회사가 단순한 전달 수단에서 벗어나 브랜드와 고객 사이의 적극적인 중개자 역할로 변신했거든요. 메시지를 분석하고, 순위를 매기고, 요약하고, 심지어 사용자 대신 답변까지 하는 상황이죠.

푸시 알림에서도 똑같은 일이 일어나고 있습니다. 다만 회사는 네 개가 아니라 둘입니다. Apple과 Google이 실질적으로 모든 알림 채널을 통제하고 있거든요. 지난 5년간 기기에 설치된 소프트웨어가 알림을 배달과 잠금 화면 사이에서 요약하고, 재정렬하고, 일부는 아예 다시 쓰기까지 시작했습니다.

## 배터리 문제에서 시작된 푸시

푸시 알림의 원점은 배터리 문제였습니다. 2009년 6월 Scott Forstall이 WWDC 무대에 올라 주장한 것은 간단했습니다. iPhone이 설치된 모든 앱이 원격 서버에 계속 접속 요청(polling)을 하도록 놔둘 수 없다는 거죠. Apple은 2008년 9월 처음 발표한 이 구상을 인프라 규모 조정을 위해 1년간 미뤘다가, 결국 Apple Push Notification Service(APNs)라는 이름으로 출시했습니다. 각 기기에서 Apple 서버로 가는 하나의 TLS 연결을 유지하고, 제3자 앱들이 필요할 때 이 채널로 알림을 보내는 방식이었습니다. APNs는 2009년 6월 17일 iPhone OS 3과 함께 출시됐고, Google은 2010년 Cloud to Device Messaging으로, 2012년 Google Cloud Messaging으로, 2016년 Firebase Cloud Messaging으로 따라갔습니다.

처음부터 이 채널은 중개되고 있었습니다. iPhone으로 가는 모든 알림은 Apple 서버를 거치고, Android는 Google 서버를 거치는 거죠. 두 플랫폼은 항상 알림을 제한하고, 버리고, 기록하고, 우선순위를 낮추거나 거부할 수 있었습니다. 다만 그 권한을 오랫동안 드러내놓고 쓰지 않았을 뿐입니다. 아키텍처 자체가 개입을 허용했지만, 실제로 개입하지 않기로 선택했던 겁니다. 이제 그 자제심이 끝났습니다.

## 15년에 걸친 플랫폼의 개입

2009년부터 2017년까지 초기 푸시 시대는 조용했습니다. APNs와 Google의 여러 서비스는 사용자가 설치한 앱들로 알림을 배달했는데, 플랫폼 수준의 필터링은 거의 없었고 사용자 제어도 앱당 켜기/끄기 토글 정도가 전부였거든요.

Android의 첫 번째 주요 개입은 2017년 8월 Android 8 Oreo의 알림 채널(notification channels)이었습니다. Android 8 이전에는 발신자가 각 알림의 우선순위를 정했지만, Android 8부터는 개발자가 채널 수준에서, 사용자가 채널 수준에서 이를 제어할 수 있게 됐습니다. 개발자는 앱당 적은 수의 채널(다운로드, 메시지, 프로모션 등)을 선언하고 각각 IMPORTANCE_NONE부터 IMPORTANCE_HIGH까지의 중요도를 정합니다. 사용자는 그 후 각 채널을 독립적으로 음소거하거나 강등하거나 배지를 비활성화하거나 완전히 차단할 수 있었죠. 한번 개발자가 정한 채널의 중요도는 나중에 올릴 수 없습니다. Android 8을 타겟하는 모든 앱은 채널을 선언해야 했고, 그렇지 않으면 알림이 표시되지 않았습니다.

Apple은 2021년 9월 iOS 15에서 비슷한 기능을 다른 이름으로 선보였습니다. Focus, Scheduled Summary, 그리고 새로운 4단계 중단 수준(passive, active, time-sensitive, critical) 체계가 iOS가 푸시를 처리하는 방식을 완전히 재구성했습니다. 실질적으로 대응할 수 있는 것은 time-sensitive 수준뿐이었고, Apple은 명시적으로 마케팅에는 이걸 쓰지 말라고 했습니다.

Android는 2022년 8월 다른 접근을 택했습니다. Android 13에서 POST_NOTIFICATIONS을 런타임 권한으로 바꾼 겁니다. 플랫폼 출시 이래 암묵적 동의(implicit opt-in)에 의존하던 방식에서 명시적 사용자 승인(explicit user grant)을 요구하는 방식으로 바뀐 거죠. 결과는 예상대로였습니다. Pushwoosh가 조사한 1600만 기기 데이터에 따르면 게임 앱은 동의한 사용자의 거의 1/3을 잃었고, 뉴스 앱은 19%가 감소했습니다. Batch가 2025년에 800억 개 이상의 메시지를 분석한 결과, Android 동의율은 85%에서 67%로 1년 만에 떨어졌고, 플랫폼 전체 평균은 61%로 정착됐습니다.

## 발신자에서 플랫폼으로 넘어가는 제어권

단계마다 발신자의 제어권이 줄어들고 있습니다. 일부는 사용자에게 넘어가고, 이건 좋은 일입니다. 누가 자신의 주의를 끌 수 있을지 결정하는 것은 채널이 본래 작동해야 하는 방식이거든요. 문제는 나머지가 플랫폼에게 넘어간다는 겁니다. 플랫폼의 판단은 불투명하고, 이의를 제기할 수 없으며, 점점 더 사용자가 선택한 설정이 아니라 모델이 내리는 판단이 되고 있으니까요.

15년에 걸쳐 이 채널은 하나의 가정을 중심으로 재구성됐습니다. 수신자의 주의는 희소한 자원이고, 플랫폼이 이를 지켜야 한다는 겁니다. 플랫폼이 이 자원을 지키는 이유는 사용자의 이익만이 아닙니다. 깔끔하고 피로도 낮은 알림 화면은 플랫폼 자체의 유지율과 생태계를 보호합니다.

## 참고 자료

- [원문 링크](https://www.jacquescorbytuech.com/writing/what-apple-and-google-are-doing-your-push-notifications)
- via Hacker News (Top)
- engagement: 135

## 관련 노트

- [[2026-05-27|2026-05-27 Dev Digest]]
