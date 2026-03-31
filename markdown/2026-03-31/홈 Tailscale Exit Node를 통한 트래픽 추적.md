---
title: "홈 Tailscale Exit Node를 통한 트래픽 추적"
tags: [dev-digest, insight, nodejs]
type: study
tech:
  - nodejs
level: ""
created: 2026-03-31
aliases: []
---

> [!info] 원문
> [I Traced My Traffic Through a Home Tailscale Exit Node](https://tech.stonecharioteer.com/posts/2026/tailscale-exit-nodes/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Tailscale exit node의 동작 원리를 traceroute를 통해 상세히 분석한 기술 글입니다. WireGuard 기반의 메시 네트워크, NAT 홀 펀칭, DERP 릴레이, 라우팅 메커니즘 등을 설명하고 VPN과의 차이점을 다룹니다.

## 상세 내용

- Tailscale은 WireGuard 위에 제어 평면을 추가한 메시 네트워크로 동작하며, exit node는 전체 트래픽을 암호화 터널로 전달
- Exit node는 VPN처럼 동작하지만 익명성을 제공하지는 않으며, 메타데이터와 신뢰 경계를 이해해야 함
- NAT 홀 펀칭 실패 시 DERP 릴레이로 폴백되며 모든 경우 end-to-end 암호화 유지

> [!tip] 왜 중요한가
> 개발자들이 Tailscale의 내부 동작을 이해하여 네트워크 보안, 프라이버시 요구사항에 맞게 효과적으로 설정할 수 있습니다.

## 전문 번역

# Tailscale 출구 노드(Exit Node) 이해하기: 홈 VPN 설정부터 패킷 흐름까지

## 목차
- 출구 노드는 뭐 하는 건가요?
- 내부 동작 원리
- 기기에서 라우팅이 어떻게 바뀌나
- OpenVPN과의 비교
- Tailscale 트래픽이 Tailscale을 거치지 않는 이유 (그리고 무료인 이유)
- 자체 호스팅 OpenVPN이나 상용 VPN은?
- 패킷 흐름: 한 요청의 전체 여정
- 내 환경에서 검증하는 방법
- 출구 노드 내부 동작: 포워딩, NAT, 리턴 경로
- 신뢰 경계
- 의외로 마음에 드는 부작용: AdGuard 가시성
- 출구 노드에서의 DNS 동작
- 분할 DNS: .home.arpa를 AdGuard로 라우팅하기
- 출구 노드 vs 서브넷 라우트
- 결론
- 참고자료

---

## 시작: Tailscale의 숨겨진 기능을 발견하다

저는 Tailscale을 몇 년 전부터 써왔지만, 솔직히 "자기 기기들끼리만 연결하기" 정도로만 사용했어요. 이번 주에 드디어 제대로 된 홈 출구 노드를 설정했습니다. Proxmox 박스 위의 작은 LXC 컨테이너(vCPU 1개, RAM 512MB, 기본적으로 Tailscale만 돌아감)를 쓰고 있거든요.

동작하는지 확인하려고 홈 서버에 핑을 쳐봤는데 잘 되더라고요. 그런데 더 깊이 이해하고 싶어서 traceroute를 돌려봤습니다.

```
traceroute github.com
traceroute to github.com (<destination-ip-redacted>), 64 hops max, 40 byte packets
1 tailscale-gw (100.x.y.z) ~7 ms
2 192.168.x.1 ~7 ms
3 10.x.x.1 ~9-177 ms
4 * * *
5 * * *
6 * * *
7 home-isp-edge.example (<home-public-ip>) ~11-14 ms
```

7번째 홉을 보니 뭔가 이상했어요. 그게 바로 집의 ISP라니까요. 그럼 이게 VPN과 같은 건가? 아니면 다른 건가?

## 출구 노드는 뭐 하는 건가요?

출구 노드가 없으면 Tailscale은 Tailscale 기기들로의 트래픽만 처리합니다. 일반 웹 트래픽은 여전히 로컬 네트워크나 ISP를 통해 나가죠.

출구 노드를 활성화하면 이야기가 달라집니다. 기기가 선택한 특정 기기를 통해 인터넷에 접속하는 것처럼 동작해요. 마치 전통적인 VPN 게이트웨이처럼요.

좀 더 정확히 말하면:

- **출구 노드 없을 때**: Tailscale에 노출된 서비스들만 검색 가능
- **출구 노드 있을 때**: 인터넷 트래픽이 전부 터널을 통과 (일종의 full-tunnel VPN 모드)

출구 노드로 가는 트래픽은 암호화되어 있어요. 따라서 웹사이트는 당신의 실제 ISP IP가 아니라 출구 노드의 공개 IP를 보게 됩니다.

### 중요한 한 가지: 출구 노드 ≠ 익명성

출구 노드는 신뢰를 **옮기는** 것이지, **제거**하는 게 아닙니다. 카페 WiFi는 당신이 Tailscale로 암호화된 트래픽을 보내고 있다는 걸 여전히 알 수 있어요. 트래픽 양도 볼 수 있고요. 하지만 내용은 못 봅니다.

다만 출구 노드는 목적지 IP나 도메인 같은 메타데이터는 여전히 볼 수 있고, 웹사이트는 출구 노드의 공개 IP를 봅니다.

## 내부 동작 원리

라우팅 이야기를 하기 전에, Tailscale이 기기들을 어떻게 연결하는지 먼저 이해해야 합니다. VPN이라고 비교했지만, 사실 Tailscale은 WireGuard 위에 제어 평면(control plane)을 얹은 메시 네트워크거든요.

### 제어 평면 vs 데이터 평면

쉽게 말하면:
- **제어 평면**: 지도이자 경찰
- **데이터 평면**: 도로

제어 평면은 누가 누구랑 통신할 수 있는지, 어떻게 도달할 수 있는지를 결정합니다. 데이터 평면은 암호화된 패킷들이 실제로 이동하는 경로예요.

WireGuard만으로는 기본적으로 데이터 평면만 있습니다. Tailscale이 그 위에 제어 평면을 얹으면서 다음 기능들을 추가합니다:

- ID/SSO 관리
- 피어 검색
- NAT 통과 조정
- ACL 배포
- 라우트 배포 (출구 노드의 기본 라우트 포함)
- MagicDNS
- 빠른 기기 revocation

WireGuard를 직접 써도 되지만, 그러면 이 제어 평면 기능들을 직접 구축하고 운영해야 해요.

### 두 기기가 연결되는 흐름

```
1. 양쪽 기기(클라이언트 + 출구 노드)가 Tailscale 제어 평면에 인증
2. 제어 평면이 각 피어의 도달 가능한 엔드포인트(공개 IP/DERP 후보)와 키를 공유
3. 양쪽 피어가 NAT hole-punching을 위해 UDP 패킷 교환
4. 성공하면 WireGuard 암호화 경로 수립
5. 실패하면 DERP relay로 폴백 (여전히 end-to-end 암호화)
```

생각해보세요. 카페의 휴대폰과 집의 서버가 둘 다 라우터 뒤에 있다고 해요. NAT는 마치 프런트 데스크처럼 나가는 사람은 추적하지만, 밖에서 임의로 들어오는 사람은 들이지 않습니다. Hole-punching은 양쪽이 동시에 "밖으로 나가서" 라우터가 돌아오는 경로를 허용하도록 합니다. 타이밍이나 매핑이 실패하면, DERP가 중립 장소 역할을 하죠. 피어 간 암호문을 전달하지만 해독할 수 없습니다.

그래서 출구 노드는 일반적인 인바운드 VPN 포트를 노출하는 게 아니라, 발견된 피어가 되어 WireGuard 핸드셰이크를 완료합니다. 그 다음 모든 인터넷 트래픽이 암호화된 피어 터널을 통해 흘러갑니다.

## 기기의 라우팅이 어떻게 바뀌나

출구 노드를 활성화하면 보통 다음과 같은 일들이 일어납니다:

- Tailscale이 출구 노드가 광고하는 기본 라우트(0.0.0.0/0 및 ::/0)를 받아들임
- 인터넷 바운드 트래픽이 Tailscale 터널 인터페이스로 가도록 정책 라우트를 설치 (Linux의 tailscale0, macOS의 utun, Windows의 Wintun)
- 출구 노드의 제어 평면 연결을 위한 "탈출구(escape hatch)" 라우트 추가

이 "탈출구"가 중요합니다. 출구 노드로의 WireGuard 연결 자체는 터널을 거쳐야 하는데, 그럼 순환 참조가 되죠? 그래서 Tailscale은 출구 노드로 가는 트래픽만 일반 네트워크로 보내고, 나머지는 모두 터널로 보냅니다.

---

*이 글은 시니어 프론트엔드 개발자의 관점에서 Tailscale의 출구 노드 기능을 기술적으로 분석한 내용을 바탕으로 작성되었습니다. 다음 섹션에서는 패킷 흐름, DNS 동작, 신뢰 경계 등 더 깊이 있는 내용을 다룰 예정입니다.*

## 참고 자료

- [원문 링크](https://tech.stonecharioteer.com/posts/2026/tailscale-exit-nodes/)
- via Hacker News (Top)
- engagement: 45

## 관련 노트

- [[2026-03-31|2026-03-31 Dev Digest]]
