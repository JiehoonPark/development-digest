---
title: "Traceroute 이해하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-08
aliases: []
---

> [!info] 원문
> [Understanding Traceroute](https://tech.stonecharioteer.com/posts/2026/traceroute/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Traceroute의 동작 원리를 상세히 설명하며, TTL(Time To Live) 필드를 이용하여 네트워크 경로의 각 홉을 식별하는 방식을 Rust 코드 예제로 보여줍니다.

## 상세 내용

- Traceroute는 TTL을 단계적으로 증가시킨 UDP 패킷을 전송하여 각 라우터로부터 ICMP 'Time Exceeded' 응답을 받음
- 원본 IP는 ICMP 응답 패킷의 IP 헤더(12-16바이트)에서 추출하고, raw ICMP 소켓으로 이를 수신

> [!tip] 왜 중요한가
> 네트워크 디버깅과 저수준 네트워킹 프로토콜을 이해하는 개발자들이 traceroute의 원리를 학습하고 Rust로 유사 도구를 구현할 수 있습니다.

## 전문 번역

# Traceroute를 직접 구현해보며 이해하기

## 목차
- Traceroute는 뭘 하는 건가?
- 첫 번째 프로브
- 몇 가지 단순화
- ICMP란?
- 언제 멈춰야 할까?
- 응답 시간 측정하기
- 각 홉마다 3개의 프로브 보내기
- 실제 traceroute와 비교하기
- Traceroute가 보여주지 않는 것
- 왜 *가 나타날까?
- 왜 sudo가 필요할까?
- 정리하며

---

예전에 Tailscale 나가기 노드를 설정하는 방법을 다뤘는데, 그때 트래픽이 어떻게 내 홈 네트워크로 연결되는지 정말 신기했거든요. 그러다 문득 traceroute가 어떻게 동작하는지 궁금해졌어요. 사실 지금까지 한 번도 깊이 생각해본 적이 없었는데, 이번 기회에 Rust로 직접 구현해보면서 이해해보려고 합니다.

## Traceroute는 뭘 하는 건가?

먼저 실제 traceroute를 실행해보면 이렇게 나와요.

```
$ traceroute -m 15 -w 2 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 15 hops max, 40 byte packets
1 <tailscale-gw> (<tailscale-ip>) 6.553 ms 5.323 ms 5.384 ms
2 <home-router> (<router-ip>) 7.183 ms 6.271 ms 4.607 ms
3 * <isp-gateway> (<isp-gateway-ip>) 7.189 ms *
4 * * *
5 * * *
6 * * *
7 <isp-hop-1> (<isp-hop-1-ip>) 284.000 ms 229.201 ms 257.805 ms
8 72.14.223.26 (72.14.223.26) 11.642 ms 12.643 ms 12.868 ms
9 * * *
10 dns.google (8.8.8.8) 12.268 ms 11.907 ms 11.766 ms
```

겉으로 봐선 각 단계마다 "이 IP가 어디에 있지?"라고 묻는 것처럼 보이는데, 어떻게 그렇게 하는지는 명확하지 않죠.

사실 traceroute는 "이 IP가 어디에 있나"를 직접 묻지 않아요. 대신 TTL이라는 트릭을 사용합니다. 그런데 이걸 이해하려면 코드를 직접 짜봐야 해요.

### 핵심 원리

모든 IP 패킷에는 **TTL(Time To Live)** 필드가 있습니다. 보통 64로 시작하는 카운터인데요.

- 패킷을 전달하는 각 라우터는 TTL을 1씩 줄입니다.
- TTL이 0이 되면 라우터는 패킷을 버리고 송신자에게 ICMP "Time Exceeded" 메시지를 보냅니다.
- 이 ICMP 메시지에는 그 라우터의 IP 주소가 포함되어 있어요.

따라서 TTL=1인 패킷을 보내면 첫 번째 라우터에서 응답이 오고, TTL=2면 두 번째 라우터에서 응답이 옵니다. 목적지에 도달할 때까지 이걸 반복하는 거죠. 바로 이게 traceroute의 원리예요.

**요약하면, traceroute는 각 홉에서 죽도록 설계된 패킷을 보낸 후 돌아오는 에러 메시지를 듣는 것입니다.**

## 첫 번째 프로브

이제 단일 함수를 만들어보겠습니다. 주어진 TTL로 UDP 패킷 하나를 보내고 ICMP 응답을 기다리는 함수예요. 왜 UDP를 쓸까요? 이 패킷들은 어차피 도중에 죽을 거니까요. TCP의 핸드셰이크나 전달 보장 같은 건 필요 없어요. 그냥 포트에 바이트를 던지고 라우터가 "이거 떨어뜨렸음" 하고 알려주는 걸 기다리면 됩니다.

```rust
use socket2::{Domain, Protocol, SockAddr, Socket, Type};
use std::mem::MaybeUninit;
use std::net::{Ipv4Addr, SocketAddrV4};
use std::time::Duration;

fn probe(target: Ipv4Addr, ttl: u32) -> std::io::Result<Option<Ipv4Addr>> {
    // UDP 소켓 생성 및 TTL 설정
    let send_sock = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
    send_sock.set_ttl_v4(ttl)?;
    
    // ICMP 응답을 받을 원본(raw) 소켓
    let recv_sock = Socket::new(
        Domain::IPV4,
        Type::from(libc::SOCK_RAW),
        Some(Protocol::ICMPV4),
    )?;
    recv_sock.set_read_timeout(Some(Duration::from_secs(2)))?;
    
    // 타겟의 33434 포트로 UDP 패킷 전송
    let dest = SockAddr::from(SocketAddrV4::new(target, 33434));
    send_sock.send_to(&[0u8; 32], &dest)?;
    
    // ICMP 응답 대기
    let mut buf = [MaybeUninit::<u8>::uninit(); 512];
    match recv_sock.recv(&mut buf) {
        Ok(n) => {
            // recv가 n바이트를 buf에 썼으므로 안전함
            let buf: &[u8] = unsafe {
                std::slice::from_raw_parts(buf.as_ptr() as *const u8, n)
            };
            // IP 헤더는 처음 20바이트, 송신자 IP는 12~16바이트 위치
            if buf.len() >= 20 {
                let ip = Ipv4Addr::new(buf[12], buf[13], buf[14], buf[15]);
                Ok(Some(ip))
            } else {
                Ok(None)
            }
        }
        Err(_) => Ok(None), // 타임아웃 = 응답 없음 (*)
    }
}

fn main() -> std::io::Result<()> {
    let target = Ipv4Addr::new(8, 8, 8, 8); // Google DNS
    for ttl in 1..=15 {
        let hop = probe(target, ttl)?;
        match hop {
            Some(ip) => println!("{:>2} {}", ttl, ip),
            None => println!("{:>2} *", ttl),
        }
        if hop == Some(target) {
            break;
        }
    }
    Ok(())
}
```

코드를 차근차근 살펴보죠.

**7~9줄: UDP 소켓 생성 및 TTL 설정**

일반적인 UDP 소켓을 만들고 TTL을 낮은 값으로 설정합니다. 이게 핵심이에요. 패킷이 목적지에 도착하기 전에 죽도록 의도적으로 TTL을 낮게 설정하는 거죠.

**12~17줄: 원본 ICMP 소켓 생성**

이번엔 원본 ICMP 소켓입니다. 우리 컴퓨터에 도착하는 모든 ICMP 패킷, 특히 우리가 보낸 단명 UDP 패킷을 버린 라우터로부터 오는 "Time Exceeded" 응답을 받아요. 여기서 `libc::SOCK_RAW`를 써야 하는 이유는 socket2가 원본 소켓 타입을 직접 노출하지 않기 때문입니다. 그리고 raw 소켓을 열려면 root/sudo 권한이 필요해요.

**20~21줄: 타겟에 UDP 패킷 전송**

타겟의 33434 포트로 32바이트의 0을 전송합니다. 내용은 중요하지 않아요. 33434는 traceroute가 전통적으로 사용하는 포트인데, 아무것도 여기를 listen하지 않거든요. 그래서 패킷이 목적지에 도달하면 "Time Exceeded"가 아닌 ICMP "Port Unreachable"으로 응답합니다. 이렇게 우리가 목적지에 도착했다는 걸 알 수 있어요.

**24~38줄: ICMP 소켓에서 읽기**

원본 IP 패킷 형태로 응답이 들어옵니다. 처음 20바이트가 IP 헤더이고, 12~16바이트 위치에 송신자 IP가 있어요.

## 참고 자료

- [원문 링크](https://tech.stonecharioteer.com/posts/2026/traceroute/)
- via Hacker News (Top)
- engagement: 68

## 관련 노트

- [[2026-04-08|2026-04-08 Dev Digest]]
