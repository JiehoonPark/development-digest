---
title: "Cloudflare 이메일 서비스: 에이전트를 위한 공개 베타"
tags: [dev-digest, tech, typescript]
type: study
tech:
  - typescript
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Cloudflare Email Service](https://blog.cloudflare.com/email-for-agents/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare가 에이전트 및 애플리케이션을 위한 이메일 서비스를 공개 베타로 출시했습니다. Email Routing과 Email Sending을 통해 에이전트가 이메일로 비동기적으로 작업을 수행하고 사용자와 소통할 수 있습니다. Workers 바인딩, REST API, TypeScript/Python/Go SDK로 즉시 사용 가능합니다.

## 상세 내용

- Email Sending이 공개 베타로 졸업하면서 Workers에서 네이티브 바인딩으로 직접 트랜잭션 이메일 전송 가능
- Agents SDK의 onEmail 훅과 Email Sending 결합으로 에이전트가 메시지 수신 후 비동기적으로 처리하고 회신할 수 있는 진정한 에이전트 동작 가능
- SPF, DKIM, DMARC 자동 설정으로 이메일 인증 및 전달 성공률 보장

> [!tip] 왜 중요한가
> 에이전트가 실제 업무를 수행하는 데 필수적인 양방향 통신 인프라를 단일 플랫폼에서 제공하므로 개발자는 복잡한 이메일 인증 설정 없이 에이전트 기반 워크플로우를 빠르게 구축할 수 있습니다.

## 전문 번역

# Cloudflare Email Service가 공개 베타로 출시되었습니다. 이제 당신의 에이전트를 위한 준비가 끝났어요

이메일은 세상에서 가장 접근성 높은 인터페이스입니다. 정말 어디에나 있거든요. 굳이 채팅 앱을 만들 필요도 없고, 채널마다 SDK를 준비할 필요도 없습니다. 모든 사람이 이미 이메일 주소를 가지고 있으니까요. 즉, 누구든 당신의 애플리케이션이나 에이전트와 상호작용할 수 있다는 뜻입니다.

애플리케이션을 만들어본 개발자라면 회원가입, 알림, 송장 등에 이메일을 의존하고 있을 겁니다. 요즘에는 단순한 애플리케이션 로직뿐만 아니라, 에이전트도 이메일이라는 채널을 필요로 합니다. 우리 비공개 베타 동안 이런 걸 구축하는 개발자들을 많이 만났어요. 고객 지원 에이전트, 송장 처리 파이프라인, 계정 인증 흐름, 멀티 에이전트 워크플로우... 모두 이메일 위에 구축되어 있었습니다.

패턴은 분명해요. 이메일이 에이전트의 핵심 인터페이스가 되고 있고, 개발자들은 이를 위해 특별히 설계된 인프라가 필요합니다.

Cloudflare Email Service가 바로 그것입니다. Email Routing으로는 애플리케이션이나 에이전트로 들어오는 이메일을 받을 수 있어요. Email Sending으로는 이메일에 회신하거나, 에이전트의 작업이 완료되었음을 알리는 아웃바운드 이메일을 보낼 수 있습니다. 그리고 나머지 개발자 플랫폼과 함께라면, 이메일을 기본 기능으로 하는 완전한 이메일 클라이언트와 Agents SDK를 Email hook으로 구축할 수 있죠.

오늘 Agents Week의 일환으로 Cloudflare Email Service가 공개 베타로 진입합니다. 이제 어떤 애플리케이션, 어떤 에이전트든 이메일을 보낼 수 있게 되었어요. 동시에 이메일 네이티브 에이전트를 구축하기 위한 완전한 도구 세트도 완성했습니다.

- Email Sending 바인딩 (Workers와 Agents SDK에서 이용 가능)
- 새로운 Email MCP 서버
- Wrangler CLI email 커맨드
- 코딩 에이전트를 위한 스킬
- 오픈소스 에이전트 인박스 레퍼런스 앱

## Email Sending: 이제 공개 베타입니다

Email Sending이 오늘 비공개 베타에서 공개 베타로 졸업했습니다. 이제 Workers에서 네이티브 바인딩을 통해 트랜잭션 이메일을 직접 보낼 수 있어요. API 키도 없고, 비밀 관리도 필요 없습니다.

```javascript
export default {
  async fetch(request, env, ctx) {
    await env.EMAIL.send({
      to: "[email protected]",
      from: "[email protected]",
      subject: "Your order has shipped",
      text: "Your order #1234 has shipped and is on its way."
    });
    return new Response("Email sent");
  },
};
```

혹은 REST API와 TypeScript, Python, Go SDK를 이용해서 어떤 플랫폼, 어떤 언어에서든 보낼 수 있습니다.

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/email-service/send" \
  --header "Authorization: Bearer <API_TOKEN>" \
  --header "Content-Type: application/json" \
  --data '{
    "to": "[email protected]",
    "from": "[email protected]",
    "subject": "Your order has shipped",
    "text": "Your order #1234 has shipped and is on its way."
  }'
```

실제로 받은편지함에 도착하는 이메일을 보내려면 보통 SPF, DKIM, DMARC 레코드와 씨름해야 합니다. Email Service에 도메인을 추가하면 이 모든 걸 자동으로 설정해줘요. 당신의 이메일은 인증되고 전달되며, 스팸으로 플래그되지 않습니다. 그리고 Email Service가 Cloudflare 네트워크 위에 구축된 글로벌 서비스이기 때문에, 세계 어디든 낮은 지연시간으로 이메일이 전달됩니다.

몇 년 동안 무료로 제공해온 Email Routing과 함께라면, 이제 하나의 플랫폼 내에서 완전한 양방향 이메일 통신을 할 수 있습니다. 이메일을 받고, Worker에서 처리하고, 회신하는 모든 것을 Cloudflare를 벗어나지 않고 할 수 있다는 뜻입니다.

Email Sending에 대한 깊이 있는 설명은 Birthday Week 발표를 참고하세요. 이 글의 나머지 부분은 Email Service가 에이전트를 위해 어떤 가능성을 열어주는지 설명합니다.

## Agents SDK: 당신의 에이전트는 이제 이메일 네이티브입니다

Cloudflare에서 에이전트를 구축하는 Agents SDK에는 이미 인바운드 이메일을 받고 처리하기 위한 일급 onEmail 훅이 있습니다. 하지만 지금까지는 에이전트가 동기적으로만 회신하거나, Cloudflare 계정 멤버들에게만 이메일을 보낼 수 있었어요. Email Sending 덕분에 그 제약이 사라졌습니다. 이게 챗봇과 에이전트의 차이점입니다.

**챗봇**은 그 순간에 응답하거나 응답하지 않습니다.

**에이전트**는 메시지를 받고, 플랫폼 전체에서 작업을 조율하고, 자신의 타이밍에 맞춰 비동기로 응답합니다.

Email Sending 덕분에 당신의 에이전트는 메시지를 받고 한 시간 동안 데이터를 처리하고, 다른 세 시스템을 확인한 뒤 완전한 답변으로 회신할 수 있습니다. 후속 조치를 예약할 수도 있어요. 엣지 케이스를 감지하면 에스컬레이션할 수도 있고요. 독립적으로 작동할 수 있다는 뜻입니다. 다시 말해, 단순히 질문에 답하는 것이 아니라 실제로 일을 할 수 있게 되었습니다.

여기 받기, 유지, 회신하는 완전한 파이프라인을 갖춘 지원 에이전트의 모습입니다.

```typescript
import { Agent, routeAgentEmail } from "agents";
import { createAddressBasedEmailResolver, type AgentEmail } from "agents/email";
import PostalMime from "postal-mime";

export class SupportAgent extends Agent {
  async onEmail(email: AgentEmail) {
    const raw = await email.getRaw();
    const parsed = await PostalMime.parse(raw);
    
    // 에이전트 상태에 유지
    this.setState({
      ...this.state,
      ticket: { 
        from: email.from, 
        subject: parsed.subject, 
        body: parsed.text, 
        messageId: parsed.messageId 
      },
    });
    
    // 장시간 실행되는 백그라운드 에이전트 작업 시작
    // 또는 Queue에 메시지를 놓아서 처리
  }
}
```

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/email-for-agents/)
- via Hacker News (Top)
- engagement: 391

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
