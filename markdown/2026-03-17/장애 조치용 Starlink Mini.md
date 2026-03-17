---
title: "장애 조치용 Starlink Mini"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Starlink Mini as a failover](https://www.jackpearce.co.uk/posts/starlink-failover/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Starlink Mini를 홈 네트워크의 백업 인터넷으로 구성하는 방법과 IPv6 설정 등 기술적 상세 내용을 다룬다. 월 4.5파운드의 대기 모드로 500kbps 속도의 무제한 데이터를 제공한다.

## 상세 내용

- Starlink Mini는 159파운드의 저렴한 위성 인터넷 백업 솔루션으로 26ms 평균 지연시간 제공
- IPv6 설정 시 UniFi의 기본 라우트 미할당 버그 발생으로 SSH를 통한 수동 설정 필요
- 월 4.5파운드 대기 모드는 500kbps 무제한 데이터 제공으로 모바일 백업 대비 저렴

> [!tip] 왜 중요한가
> 인프라 엔지니어와 네트워크 관리자에게 신뢰성 높은 저비용 백업 솔루션 및 IPv6 구성 경험 제공

## 전문 번역

# Starlink Mini로 집 네트워크 백업 구성하기

최근에 Starlink Mini를 구입해서 집 네트워크의 백업 연결로 사용하고 있어요. £4.50의 저렴한 대기 요금제 덕분에 주 연결이 끊겼을 때 인터넷을 유지할 수 있는 훌륭한 방법이 되었습니다.

제 주 연결은 FTTP인데 최고 5ms의 아주 좋은 지연시간을 제공해요. 그런데 지구 위 600km의 위성들에 의존하는 백업 연결이 있다는 게 정말 흥미롭더라고요.

## Starlink Mini 소개

Starlink Mini는 SpaceX의 콤팩트 위성 접시예요. 휴대가 가능하고, 제 경우처럼 월 £4.50에 '대기 모드'로 운영할 수 있습니다.

## £4.50 대기 모드의 가치

2025년 8월부터 Starlink는 무료 '일시 중지 모드'를 유료 '대기 모드'로 변경했는데, 가격 대비 정말 합리적입니다.

- 필요할 때마다 언제든 전체 대역폭 서비스로 전환할 수 있어요
- 대기 모드에서 무제한 저속 데이터(500kbps)를 제공하는데, Google Meet, FaceTime, Claude는 물론 낮은 화질의 Netflix도 충분히 재생됩니다
- 백업용 모바일 데이터 요금제보다 훨씬 저렴해요

## 하드웨어 비용

Starlink Mini는 £159인데요, 위성 인터넷 백업 솔루션으로는 합리적인 가격입니다. 대부분의 4G/5G 백업 솔루션보다 훨씬 싸거든요. 게다가 하늘이 보이는 곳이면 거의 어디서나 작동하니까 모바일 네트워크 커버리지에 의존할 필요가 없어요.

## 실제 사용 후 느낀 점들

- **지연시간**: 1.1.1.1까지 18ms에서 65ms 사이인데, 평균은 26ms 정도예요
- **전력 소비**: 최근 소프트웨어 업데이트 덕분에 평균 13W 정도로 줄었어요
- **UniFi 대시보드**: 이제 위성 접시의 방해물과 지연시간을 대시보드에서 확인할 수 있게 됐어요
- **새로운 요금제**: Starlink가 100Mbps, 200Mbps, 400Mbps 이상의 'Max' 요금제를 출시했습니다
- **프로모션**: Residential Max 요금제 구독 시 Starlink Mini를 무료로 제공하고 있어요
- **설치**: 정말 간단합니다. 전원을 연결하고 하늘을 향하게 한 후 5~10분 기다리면 끝이에요
- **앱**: 모니터링과 설정을 위한 Starlink 앱이 생각보다 잘 만들어져 있더라고요
- **날씨 및 장애물**: 하늘을 비교적 잘 보아야 하지만, 유리창 같은 얇은 층 뒤에서도 작동합니다. 부분적으로 가려진 상태도 적응형 안테나 기술 덕분에 충분히 사용할 수 있어요

## IPv6 설정이 까다로워요

한 가지 예상 밖으로 복잡했던 부분이 IPv6 설정이었어요. Starlink가 IPv6를 기본으로 지원하긴 하지만, UniFi에서 제대로 작동시키려면 약간의 설정이 필요합니다. UniFi에 기본 IPv6 경로가 자동으로 할당되지 않는 버그가 있거든요. 수동으로 설정해야 합니다.

참고로 Starlink는 IPv4에서 Carrier-Grade NAT(CGNAT)를 사용하기 때문에 포트 포워딩이 불가능합니다. 뭔가를 호스팅해야 한다면 Cloudflare Tunnel로 해결할 수 있어요. IPv6를 쓰면 진정한 라우팅 가능한 주소 공간을 얻기 때문에 더 간단합니다.

Starlink는 DHCPv6 Prefix Delegation을 통해 /56 IPv6 접두사를 할당합니다.

## IPv6 설정 기술 가이드

### 초기 설정

WAN 설정(설정 → 인터넷 → 주 WAN)으로 이동하세요:

1. '고급'을 '수동'으로 설정하기
2. IPv6 활성화
3. IPv6 연결을 SLAAC로 설정하기 (중요: DHCP가 아닌 SLAAC을 반드시 사용해야 해요)
4. Prefix Delegation의 '자동' 체크 해제
5. 'Prefix Delegation 크기'를 56으로 설정
6. 설정 적용하면 '인터넷' 필드에 IPv6 주소가 나타날 거예요. 이제 LAN 네트워크에서도 SLAAC을 사용해 IPv6를 활성화하세요

이 단계까지 오면 다 된 것 같지만, LAN 클라이언트에서 IPv6 리소스에 접근하려고 하면 라우팅이 제대로 되지 않는 걸 발견할 거예요. UniFi의 버그 때문입니다.

### UniFi IPv6 라우팅 버그 해결하기

UniFi는 기본 IPv6 경로를 자동으로 할당하지 않는 문제가 있어요. SSH로 수동으로 설정해야 합니다.

**1단계: UniFi 기기에 SSH 접속하기**

SSH 키를 먼저 설정해야 한다면 Control Plane → Console → SSH에서 설정하세요. 사용자명은 root이고 비밀번호는 콘솔 설정에서 지정한 것입니다.

**2단계: 기본 경로가 있는지 확인하기**

```bash
ip -6 route show default
```

결과가 비어있다면 문제가 맞습니다.

**3단계: Router Advertisement 기다리기**

Starlink의 Router Advertisement를 캡처하기 위해 TCP dump를 실행하세요:

```bash
tcpdump -i eth7 -vvv icmp6
```

RA(Router Advertisement) 패킷을 기다리면 이런 식으로 보입니다:

```
10:51:39.297010 IP6 fe80::200:6edd:3e00:101 > ff02::1: ICMP6, router advertisement, length 104
```

여기서 중요한 부분은 처음의 IPv6 link-local 주소(이 경우 fe80::200:6edd:3e00:101)예요. 이게 바로 기본 게이트웨이입니다.

**4단계: 기본 경로 수동으로 추가하기**

IPv6 주소와 인터페이스를 자신의 값으로 바꿔서 실행하세요:

```bash
ip -6 route add default via fe80::200:6edd:3e00:101 dev eth7
```

참고로 eth7은 보통 UDM Pro의 WAN 인터페이스입니다. 다른 UniFi 기기라면 다를 수 있어요(예: 표준 UDM의 경우 eth4).

**5단계: LAN 클라이언트에서 테스트하기**

IPv6 주소를 ping하거나 IPv6 전용 웹사이트를 방문해보세요. 이제 작동할 거예요.

## 중요한 주의사항

안타깝게도 이 설정은 UniFi 펌웨어 업데이트에 걸쳐 유지되지 않습니다. UniFi 기기를 업데이트하면 기본 경로가 제거될 수 있고, 다시 추가해야 할 수도 있어요.

## 참고 자료

- [원문 링크](https://www.jackpearce.co.uk/posts/starlink-failover/)
- via Hacker News (Top)
- engagement: 238

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
