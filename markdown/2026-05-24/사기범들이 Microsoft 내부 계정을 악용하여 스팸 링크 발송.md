---
title: "사기범들이 Microsoft 내부 계정을 악용하여 스팸 링크 발송"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-24
aliases: []
---

> [!info] 원문
> [Scammers are abusing an internal Microsoft account to send spam links](https://techcrunch.com/2026/05/21/scammers-are-abusing-an-internal-microsoft-account-to-send-spam/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 수개월 동안 사기범들이 Microsoft의 내부 알림용 이메일 주소(msonlineservicesteam@microsoftonline.com)를 악용하여 피싱 이메일을 발송해왔습니다. Microsoft는 탐지 및 차단 메커니즘을 강화하고 이용약관 위반 계정을 제거하는 조치를 취하고 있습니다.

## 상세 내용

- 사기범들이 새 Microsoft 계정을 만들어 정당한 알림 이메일 주소로 위장한 스팸 발송
- 스팸하우스 등 보안 기관에서 이 문제를 수개월 전부터 감지했으며 Microsoft에 통보
- 유사한 시스템 악용 사례가 Betterment, Namecheap 등 다른 회사에서도 발생

> [!tip] 왜 중요한가
> 개발자들이 사용자 인증 및 이메일 보안 시스템 설계 시 악용 가능성을 고려해야 합니다.

## 전문 번역

# Microsoft 계정 알림 시스템을 악용한 피싱 이메일 대량 발송 사태

지난 몇 개월간 사기꾼들이 Microsoft의 보안 허점을 이용해 대량의 스팸 이메일을 발송하고 있습니다. 특히 문제가 되는 부분은 Microsoft가 정상적인 계정 알림을 보내는 공식 이메일 주소를 악용한다는 점인데요.

## 어떻게 악용되고 있을까

현재까지 구체적인 악용 방식은 명확하지 않지만, 사기꾼들은 새로운 Microsoft 계정을 일반 고객인 것처럼 만들어 등록한 뒤 해당 계정을 이용해 Microsoft 공식 이메일 주소인 양 위장한 메시지를 발송하고 있습니다. 이메일을 받는 사람 입장에서는 Microsoft 정식 알림으로 착각하기 쉬워지는 거죠.

지난주 저는 여러 이메일 계정을 통해 비슷한 구조의 스팸 이메일을 몇 건 받았습니다. 모두 `msonlineservicesteam@microsoftonline.com`에서 발송된 것이었는데, 이 주소는 실제로 Microsoft가 2단계 인증 코드나 계정 관련 중요 알림을 보낼 때 사용하는 공식 이메일입니다.

받은 이메일들을 살펴보니 주제(subject) 줄이 부정거래 경고처럼 꾸며져 있거나, 웹사이트에서 개인 메시지를 확인하라는 식으로 작성되어 있었습니다. 기술적으로는 상당히 조잡하게 만들어졌지만, Microsoft의 공식 주소에서 온 것이라는 점 때문에 사용자들을 속이기에 충분했던 거죠.

## 업계 전체의 문제

스팸 대응 비영리 단체인 The Spamhaus Project는 지난주 소셜 미디어를 통해 Microsoft의 알림 이메일 주소가 유사하게 악용되고 있으며, 이러한 사건이 "수개월 전부터" 지속되어 왔다고 밝혔습니다.

> "자동 알림 시스템이 이 정도 수준의 커스터마이징을 허용해서는 안 됩니다." — The Spamhaus Project

흥미로운 점은 이 문제가 Microsoft에만 국한된 것이 아니라는 점입니다. 소셜 미디어의 다른 사용자들도 다양한 기업의 공식 이메일 주소가 스팸 발송에 악용되고 있다고 보고하고 있습니다.

## Microsoft의 대응

TechCrunch의 문의에 대해 Microsoft는 처음에 회신하지 않았으나, 기사 게재 이후 공식 입장을 발표했습니다.

> "당사는 이러한 피싱 보고에 대해 적극적으로 조사 중이며, 고객 보호를 위해 조치를 취하고 있습니다. 탐지 및 차단 메커니즘을 강화하고 이용약관을 위반하는 계정을 제거하는 중입니다." — Microsoft 대변인 Emelia Katon

## 비슷한 사건들

이러한 사건은 최근 몇 개월간 반복되는 패턴입니다. 올해 초에는 핀테크 회사 Betterment의 알림 시스템이 해킹되어 암호화폐 전송 시 가치를 3배로 늘려준다는 사기성 알림이 발송되기도 했습니다. 또한 2023년에는 도메인 등록 업체인 Namecheap의 이메일 계정이 피싱 공격에 악용된 바 있습니다.

결국 기업들의 알림 시스템이 점점 더 정교하게 악용되고 있는 상황인데, 단순히 개별 기업 차원의 대응만으로는 부족해 보입니다.

## 참고 자료

- [원문 링크](https://techcrunch.com/2026/05/21/scammers-are-abusing-an-internal-microsoft-account-to-send-spam/)
- via Hacker News (Top)
- engagement: 261

## 관련 노트

- [[2026-05-24|2026-05-24 Dev Digest]]
