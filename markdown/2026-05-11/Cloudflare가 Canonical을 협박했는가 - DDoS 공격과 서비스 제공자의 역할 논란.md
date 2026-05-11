---
title: "Cloudflare가 Canonical을 협박했는가? - DDoS 공격과 서비스 제공자의 역할 논란"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-05-11
aliases: []
---

> [!info] 원문
> [Can someone please explain whether Cloudflare blackmailed Canonical?](https://www.flyingpenguin.com/can-someone-please-explain-whether-cloudflare-blackmailed-canonical/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 2026년 4월 Ubuntu 웹사이트가 Beamed라는 DDoS 공격 서비스로부터 20시간 동안 다운되었고, 공격자가 사용한 도구와 인프라가 모두 Cloudflare를 통해 운영되고 있다는 사실이 드러났습니다. 이는 Cloudflare가 무료로 공격자의 인프라를 제공하면서 동시에 피해자에게는 완화 서비스 비용을 청구하는 구조를 보여줍니다.

## 상세 내용

- 공격자가 임차한 DDoS 도구와 그 호스팅 인프라가 모두 Cloudflare를 통해 운영되고 있었음
- Immaterialism Limited와 Naomi Colvin의 역할에 대한 의문점과 복잡한 기업 구조의 등장
- 의도적 구조든 우연의 일치든, CDN 제공자가 공격과 방어 양쪽 사업에 관여하는 이해 충돌 문제

> [!tip] 왜 중요한가
> 인프라 보안 담당자와 DevOps 개발자가 CDN 제공자 선택, 보안 구조 설계 시 신뢰성과 이해 충돌을 고려해야 함을 보여줍니다.

## 전문 번역

# Cloudflare는 공격자에게는 무료로, 피해자에게는 유료로

2026년 4월 30일 오후 4시 33분. Canonical의 모니터링 시스템이 blog.ubuntu.com의 서비스 중단을 감지했습니다. 10분 후엔 회사의 모든 공개 웹 서비스가 함께 내려갔습니다. ubuntu.com 메인 사이트, 패키지 관리가 의존하는 보안 공지 API, 개발자 포털, 기업 사이트, 교육 플랫폼까지 모두요. 약 20시간을 버틸 수 없었습니다.

5월 1일 오후 12시 44분. 서비스가 복구됩니다.

## 공격 수법의 민낯

공격을 자행한 그룹은 유료 서비스를 이용했다고 밝혔습니다. 그들이 언급한 도구 중 하나는 'Beamed'라는 상용 DDoS 서비스였거든요. beamed.su에서는 마케팅과 블로그를 운영하고, beamed.st에서는 고객 로그인 포털을 제공합니다.

2026년 4월에 게시된 블로그 글 "How to Bypass Cloudflare with Advanced Stresser Methods"에는 Cloudflare 우회 기법 3가지가 명시되어 있습니다. 주거용 IP 로테이션과 원본 서버를 찾기 위한 수동 "엔드포인트 사냥"이 포함되어 있습니다.

Beamed는 자신이 무엇을 팔고 있는지 솔직합니다:

> Cloudflare는 역프록시로서 원본 서버의 IP를 숨깁니다. 많은 저급 부스터들은 "Under Attack Mode"나 Bot Fight Mode에 대응하지 못합니다. Beamed는 Cloudflare와 유사한 CDN으로 보호되는 웹사이트에 대해 효과적으로 스트레스 테스트를 수행하기 위해 여러 고급 기법을 사용합니다.

여기서 주목할 점이 있습니다. 이 문단이 적혀있는 블로그 글 자체도 Cloudflare를 통해 배포되고 있습니다. 팔고 있는 상품은 'Cloudflare 우회 능력'이고, 판매자의 호스팅 제공자도 'Cloudflare'라는 뜻이죠.

공격 이후 1주일이 지났을 때, beamed.su와 beamed.st는 여전히 온라인 상태였습니다. 둘 다 Cloudflare AS13335 주소로 해석됩니다. Canonical의 저장소 엔드포인트인 security.ubuntu.com과 archive.ubuntu.com도 Cloudflare의 유료 고객으로서 같은 AS13335 주소를 사용하고 있습니다.

요약하면 이렇습니다: **Cloudflare는 공격자들에게는 무료로 인프라를 제공하고, 피해자들에게는 피해 복구 서비스로 돈을 받습니다.**

## 의문점: 이게 협박 아닌가?

많은 사람들이 나에게 반복해서 질문했습니다. 이번 사건이 협박(blackmail)에 해당하는지, 그리고 스스로를 '313 Team'이라 부르는 친이란 그룹 '이라크 이슬람 사이버 저항군(Islamic Cyber Resistance in Iraq)'이라고 밝힌 공격자 집단이 어떻게 같은 회사(Cloudflare)의 인프라를 통해 공격 용량을 임차하고, 그 같은 회사로부터 구제금을 받아야 했는지에 대해서요.

## 도메인 등록과 연결된 인물들

Beamed의 소비자 도메인들은 'Immaterialism Limited'라는 레지스트라를 통해 등록되었습니다. 고정 요금 기반의 도메인 등록과 JSON API를 제공하는데, 이런 방식은 보통 악용 호스팅과 연관되어 있습니다. Immateriali.sm은 Cloudflare 네임서버(tani.ns.cloudflare.com, trey.ns.cloudflare.com)를 통해 프록시되고 있습니다.

Immaterialism Limited는 영국 회사등기소(Companies House)에 회사번호 15738452로 등록되어 있습니다. 2024년 5월 24일에 설립되었고, 이사는 코스타리카 출신의 Nicole Priscila Fernandez Chaves(1993년 3월생)였습니다. 런던 Great Portland Street의 대량우편함 주소를 사용했습니다.

2025년 4월 11일, Fernandez Chaves는 이사직을 사임했지만 지분의 75% 이상을 유지했습니다. 새로운 이사로는 영국 국적의 Naomi Susan Colvin이 임명되었고, 같은 주소에서 업무를 봅니다.

이게 누군지가 중요합니다. Colvin은 Courage Foundation의 전 이사인데, 이 단체의 이사진에는 Julian Assange, John Pilger, Vivienne Westwood, Renata Avila 같은 인물들이 있었습니다. WikiLeaks와 Barrett Brown 같은 단체들을 지원해온 곳이거든요. 현재 Colvin은 'Blueprint for Free Speech'의 영국·아일랜드 프로그램 디렉터로 근무하며 고발자 보호와 반명예훼손 소송을 담당하고 있습니다. Lauri Love의 미국 송환 거부 법적 캠페인도 그녀의 주도 아래 진행되었습니다. 장기간의 활동가입니다.

## 관할권의 이동

2026년 2월 26일, Immaterialism Limited는 회사등기소에 같은 날 두 건의 변경을 신고했습니다. 등록 사무실 주소 변경(Great Portland Street 85번지에서 167-169번지로)과 Fernandez Chaves의 중요 지분소유자 정보 변경입니다.

그 다음날인 2월 27일, Beamed의 IP 공간을 공시하는 라우팅 인프라의 관할권이 이동했습니다.

Materialism의 주소 공간을 공시하는 자율시스템(AS) 번호는 AS39287입니다. RIPE가 2006년 1월 24일에 할당한 이 AS 번호는 계속 같은 라우팅 정체성을 유지해왔지만, 등록 운영자와 기록상 국가는 두 번 변경되었습니다.

2017년부터 2020년경까지, AS39287은 키프로스 회사인 Privactually Ltd가 보유했고, FLATTR-AS라는 이름으로 운영되었습니다. Flattr는 The Pirate Bay의 창립자 중 한 명인 Peter Sunde Kolmosoppi의 소액결제 프로젝트였습니다. 해당 등록의 악용 신고 연락처는 abuse@shelter.st였습니다.

2020년부터 2026년까지, 같은 AS 번호는 핀란드 회사인 ab stract ltd로 재할당되었습니다. 헬싱키 Urho Kekkosen katu 4-6E에 위치해 있습니다. RIPE 기록상 유지보수 담당자(maintainer) 객체는 BKP-MNT입니다. 기록상 담당자는 Peter Kolmisoppi(닉네임 "brokep")인데, The Pirate Bay의 또 다른 창립자이며 말뫼 주소와 noc@brokep.com 이메일을 사용합니다.

## 참고 자료

- [원문 링크](https://www.flyingpenguin.com/can-someone-please-explain-whether-cloudflare-blackmailed-canonical/)
- via Hacker News (Top)
- engagement: 219

## 관련 노트

- [[2026-05-11|2026-05-11 Dev Digest]]
