---
title: "내부 서비스를 위한 TLS 인증서 올바르게 설정하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-10
aliases: []
---

> [!info] 원문
> [TLS certificates for internal services done right](https://tuxnet.dev/posts/tls-for-internal-services/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> VPN 환경의 내부 서비스에 Let's Encrypt 인증서를 적용하는 Split-Horizon DNS 방식을 제시합니다. NetBird를 이용한 VPN 설정, acme.sh를 통한 인증서 자동 갱신, nginx WAF를 통한 접근 제어를 결합하여 자체 서명 인증서 없이 신뢰된 TLS 통신을 구현합니다.

## 상세 내용

- Split-Horizon DNS로 공개 CA 인증서를 내부 서비스에 적용 가능
- nginx WAF로 VPN 외부 접근을 차단하여 보안 계층 추가
- acme.sh 자동 갱신으로 인증서 관리 운영 비용 최소화

> [!tip] 왜 중요한가
> 내부 서비스의 TLS 보안을 경제적이고 효율적으로 구현하려는 DevOps 엔지니어에게 실무 가이드를 제공합니다.

## 전문 번역

# 내부 서비스용 TLS 인증서, 제대로 설정하기

제목이 좀 자극적이긴 한데요. 저는 이게 가장 실용적인 방법이라고 생각합니다. 간단한 상황부터 시작해볼게요.

한 서버에 여러 HTTP 서비스가 올라가 있다고 가정해봅시다. 일부는 외부에 공개된 서비스이고, 일부는 내부용입니다. 내부 서비스에 접근하려면 VPN에 연결되어 있어야 하죠.

도메인을 선택하는 방법은 크게 두 가지입니다.

- **ICANN이 정한 사설 도메인** 사용 (예: .internal)
- **직접 소유한 공개 도메인** 사용 (예: tuxnet.dev)

이 글에서는 Grafana를 내부 앱의 예시로 들겠습니다. 내부 IP 10.0.1.10에서 실행 중이고, VPN이 DNS 리졸버 기능을 제공한다고 가정하겠습니다.

## .internal 도메인의 문제점

grafana.tuxnet.internal처럼 DNS A 레코드를 만들어서 내부 IP로 리졸브하는 건 간단합니다. 하지만 HTTPS를 사용하려면 자체 서명 인증서(self-signed certificate)를 만들어야 하는데, 이게 문제가 됩니다.

자체 서명 인증서를 만드는 튜토리얼은 많지만, 모든 HTTP 클라이언트가 이 인증서를 신뢰하도록 설정해야 하거든요. 아니면 사용자들에게 "인증서 경고는 무시하세요"라고 해야 하는데, 이건 보안 악습입니다.

## "올바른" 방식

이제 **split-horizon DNS** 기법을 소개합니다.

공개 DNS 리졸버에서는 grafana.tuxnet.dev가 공개 IP로 리졸브되고, VPN에 연결된 클라이언트에서는 같은 도메인이 내부 IP로 리졸브되도록 설정하는 겁니다. 

이렇게 하면 Let's Encrypt나 ZeroSSL 같은 공개 CA에서 정식 인증서를 발급받을 수 있습니다. 대신 VPN 외부에서 오는 트래픽을 차단하는 WAF(Web Application Firewall)를 구성해야 하는데, 이쪽이 훨씬 현실적입니다.

결론적으로, 매 개발 머신마다 자체 서명 인증서를 설치하는 것보다 서버 한 곳에 WAF를 설정하는 게 훨씬 쉽습니다.

## 구현해보기

이제 실제로 구현해봅시다. 필요한 것들입니다.

- **VPN**: DNS 리졸버 기능이 있는 NetBird
- **ACME 클라이언트**: 인증서 발급용 acme.sh
- **리버스 프록시**: WAF 기능이 있는 nginx

NetBird의 Custom Zones 기능을 사용하면 split-horizon DNS 설정이 간단해집니다. 사용자 그룹이나 피어 그룹을 활용해서 선택적으로 커스텀 존을 적용할 수 있거든요. 서버에만 공개 DNS 리졸버를 사용하도록 제외하면, 서버는 http-01 challenge를 처리할 때 공개 DNS를 참조합니다.

acme.sh로 인증서를 발급받아봅시다.

```bash
acme.sh --issue -d grafana.tuxnet.dev --server letsencrypt --standalone
```

acme.sh는 매우 유연한 도구고 다양한 모드를 지원합니다. standalone 모드의 장점은 nginx가 포트 80을 계속 열고 있을 필요가 없다는 점입니다. acme.sh가 인증서를 발급받을 때만 포트 80이 활성화되거든요.

이제 nginx를 설정합니다.

```nginx
upstream grafana {
    server localhost:3000;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen our-server.netbird.cloud:443 ssl;
    server_name grafana.tuxnet.dev;
    http2 on;

    ssl_certificate /etc/ssl/certs/grafana.tuxnet.dev.crt;
    ssl_certificate_key /etc/ssl/private/grafana.tuxnet.dev.key;

    access_log /var/log/nginx/grafana.tuxnet.dev.access.log main;
    error_log /var/log/nginx/grafana.tuxnet.dev.error.log warn;

    location / {
        proxy_pass http://grafana;
        proxy_set_header Host $host;
    }

    # Grafana Live WebSocket 연결 처리
    location /api/live/ {
        proxy_pass http://grafana;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
    }
}
```

여기서 주목할 부분은 `listen our-server.netbird.cloud:443 ssl;`입니다. VPN 네트워크 인터페이스에만 바인딩하는 거죠. (직접 VPN IP를 쓸 수도 있습니다)

이렇게 설정하면 공개 인터넷에서 오는 grafana.tuxnet.dev 요청은 자동으로 거부됩니다. 이게 바로 우리의 WAF(웹 방화벽) 역할입니다.

보안은 여러 겹의 방어선으로 구성돼야 합니다. 첫 번째 방어선이 split-horizon DNS이고, 만에 하나 이게 우회되더라도 두 번째 방어선인 WAF가 막아낼 수 있는 거죠.

## 인증서 자동 갱신

acme.sh는 기본으로 `--cron` 플래그를 지원합니다. 매일 실행되는 cron 작업에서 다음 명령을 실행하면 됩니다.

```bash
acme.sh --cron
```

acme.sh가 자동으로 갱신이 필요한 인증서를 판단합니다. 우리가 할 일은 새 인증서를 nginx의 `ssl_certificate`와 `ssl_certificate_key` 경로에 복사하는 것뿐입니다. 그 다음 nginx를 reload하면 새 인증서를 적용할 수 있습니다.

## 참고 자료

- [원문 링크](https://tuxnet.dev/posts/tls-for-internal-services/)
- via Hacker News (Top)
- engagement: 125

## 관련 노트

- [[2026-07-10|2026-07-10 Dev Digest]]
