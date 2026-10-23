---
title: "Node가 이겼다: Deno의 창시자가 만든 두 번째 런타임, 결국 Cloudflare에 흡수되다"
tags: [dev-digest, video, typescript, nodejs]
type: study
tech:
  - typescript
  - nodejs
level: ""
created: 2026-10-23
aliases: []
---

> [!info] 원문
> [The runtime wars are over... and Node won](https://www.youtube.com/watch?v=l3L_lETiSzc) · Fireship

## 핵심 개념

> [!abstract]
> Node.js 창시자 Ryan Dahl이 만든 Deno가 Cloudflare에 인수됐습니다. Node가 fetch, 권한 모델, TypeScript 직접 실행을 흡수하며 Deno의 차별점이 사라졌고, Deno Deploy·KV·Fresh 등 수익화 제품들도 성장이 정체됐습니다. Deno 팀은 결국 Cloudflare Durable Objects를 셀프 호스팅 가능하게 만든 'Celld'를 선보였고, Cloudflare는 이를 통째로 인수해 Workers 런타임에 통합할 계획입니다. Celld 외 나머지 Deno 제품들은 1년 내 개발이 종료되며, Deno Deploy 사용자는 6개월 내 마이그레이션해야 합니다.

## 아티클

# Node가 이겼다: Deno의 창시자가 만든 두 번째 런타임, 결국 Cloudflare에 흡수되다

2026년 10월, 자바스크립트 런타임 전쟁에 사실상 마침표가 찍혔습니다. 서버에서 자바스크립트를 돌릴 수 있게 만든 장본인이자, 이후 10년간 그 선택을 후회하며 살았던 Ryan Dahl이 자신의 회사 Deno를 Cloudflare에 매각한다고 발표한 겁니다. 겉보기엔 흔한 실리콘밸리식 인수합병처럼 보이지만, 이미 자체 런타임과 배포 플랫폼을 갖춘 Cloudflare가 왜 굳이 "더 열세인" 런타임 회사를 사들였는지는 짚어볼 필요가 있습니다. 이 글에서는 Cloudflare가 실제로 무엇을 사려고 했는지, Ryan Dahl이 왜 Node를 다시 만든 것이 실수였다고 말하게 됐는지, 그리고 Deno의 나머지 제품들은 앞으로 어떻게 되는지를 정리해봅니다.

## Node의 아버지, 자신의 창조물을 부정하다

이야기는 2009년으로 거슬러 올라갑니다. Ryan Dahl은 JSConf EU 무대에 올라 서버에서 자바스크립트를 실행할 수 있게 해주는 오픈소스 런타임, Node.js를 세상에 공개했습니다. 그로부터 9년 뒤인 2018년, 그는 같은 무대에 다시 올라 "Node.js에 대해 후회하는 10가지(10 Things I Regret About Node.js)"라는 제목의 발표를 합니다. 발표 시간 대부분을 자신이 만든 프로젝트를 스스로 해부하는 데 쓴 그는, 마지막에 Node를 처음부터 다시 만들었다고 폭로합니다. 이번엔 후회 없이 말이죠. 그렇게 탄생한 것이 Deno입니다.

Deno는 Node와 달리 포매터, 린터, 테스트 러너를 기본 내장했고, TypeScript를 바로 지원했으며, 기본적으로 보안이 걸려 있었고, 외부 패키지를 다루는 방식도 훨씬 합리적이었습니다.

## 순항하던 초기, 그러나 멈춰버린 성장 엔진

Deno 1.0은 2020년에 출시됐고, 2021년에는 서버리스 플랫폼인 Deno Deploy를 선보이면서 500만 달러 규모의 시드 투자를 유치했습니다. 초반 반응은 뜨거웠습니다. Netlify와 Supabase는 Deno 위에 자신들의 엣지 함수를 구축했고, Slack은 새로운 앱 플랫폼의 구동 엔진으로 Deno를 채택했습니다.

이듬해인 2022년에는 Sequoia로부터 2,100만 달러 규모의 시리즈 A 투자를 유치하고, 웹 프레임워크 Fresh까지 내놓으며 Deno는 서버사이드 자바스크립트의 미래가 될 것처럼 보였습니다.

하지만 그 기세는 오래가지 못했습니다. 가장 큰 문제는 Node가 가만히 당하고만 있지 않았다는 점입니다. 같은 기간 Node는 fetch API, 권한 모델, TypeScript 파일 직접 실행 기능을 차례로 추가하면서 Deno가 내세웠던 차별점들을 하나씩 흡수해버렸습니다. 결과적으로 Deno는 경쟁력을 잃었습니다.

동시에 돈을 벌어다 줄 것으로 기대했던 제품들도 성장세를 보여주지 못했습니다.

- Deno Deploy의 서비스 리전은 35개에서 6개로 줄어들었습니다.
- 2023년 출시된 Deno KV는 결국 베타 단계를 벗어나지 못했습니다.
- Fresh 프레임워크는 릴리스 간격이 몇 달씩 벌어지기 시작했습니다.

여기에 Ryan Dahl은 Oracle과 "JavaScript"라는 상표권을 둘러싼 법적 다툼까지 벌였습니다. 이 상표권은 Oracle이 Sun Microsystems를 인수하면서 넘겨받은 것인데, 공교롭게도 그 인수 시점은 Ryan이 Node를 만든 해와 같았습니다. 명분은 좋았지만, 상표권 소송 변호사 비용을 위한 GoFundMe 모금이 Sequoia가 2,100만 달러를 투자할 때 기대했던 그림은 아니었을 겁니다.

작년에는 개발자 David Bushell이 "Deno는 사실상 죽었다"는 취지의 블로그 글을 올리기도 했습니다. 새로운 릴리스마다 추가되는 건 결국 Node와의 호환성 패치뿐이라는, 끝없는 추격전이라는 지적이었습니다. 아이러니하게도 Ryan Dahl 본인도 같은 결론에 도달해 있었습니다. 단지 조금 더 시간이 걸렸을 뿐입니다.

## 런타임 밖에서 찾은 해법, Durable Objects

올해 초, Deno 팀은 런타임 자체가 아니라 그 바깥에 있는 더 어려운 문제들로 시선을 돌렸습니다. 여러 머신에 걸쳐 연산을 분산시키고, 상태를 조율하고, 스케일링하는 문제들이었습니다. 그리고 이들이 찾은 가장 설득력 있는 답은 Cloudflare의 Durable Objects였습니다.

Durable Objects는 쉽게 말해 각자 자신만의 전용 SQLite 데이터베이스를 갖고, 웹소켓 연결을 유지할 수 있는 초소형 싱글스레드 서버라고 보면 됩니다. 문제는 이 기술이 Cloudflare 플랫폼 위에서만 동작한다는 점이었습니다.

이에 Deno 팀은 지난 8월, 자체적으로 구현한 버전을 "Celld"라는 이름으로 공개합니다. 이 프로젝트는 자신의 서버에서 Durable Objects를 훨씬 저렴한 비용으로 돌릴 수 있게 해주는 것이었습니다.

놀랍게도 Cloudflare는 이런 식의 "복제"를 전혀 불쾌해하지 않았습니다. Cloudflare Workers의 창시자는 발표 글에서, 사람들이 늘 Cloudflare가 Workers를 통해 개발자를 락인시키려 한다고 비난해왔지만 Workers 런타임은 2022년부터 이미 오픈소스였고, 셀프 호스팅이 가능한 버전을 수년간 만들고 싶어했으나 끝내 손대지 못했다고 밝혔습니다. 심지어 작년 봄 직접 만들어보려다 실패했다는 사실까지 솔직하게 인정했습니다. 그런데 Deno 팀이 Celld로 그걸 실제로 해낸 겁니다. 그러자 시가총액 1,230억 달러짜리 기업이 할 법한 선택을 Cloudflare도 그대로 했습니다. 회사 전체를 사버린 겁니다.

## 인수 이후: 합쳐지는 자와 버려지는 자

Cloudflare의 계획은 Ryan Dahl과 Deno 공동창업자 Bert Belder가 Celld를 Cloudflare의 오픈소스 Workers 런타임에 통합시키는 것입니다. 이렇게 되면 누구든 자신의 서버에서 Workers와 Durable Objects를 Cloudflare의 공식 지원을 받으며 셀프 호스팅할 수 있게 됩니다.

여기에 빠질 수 없는 키워드가 있습니다. 바로 AI 에이전트입니다. Ryan Dahl은 이번 합병의 핵심 목표가 AI 에이전트 지원이라고 밝혔는데, Durable Objects가 저렴한 연산 자원, 영속적인 상태 관리, 실시간 연결을 동시에 필요로 하는 에이전트 워크로드와 잘 맞아떨어지기 때문입니다.

하지만 Celld가 아닌 다른 Deno 제품을 쓰고 있다면 상황이 좋지 않습니다. Cloudflare는 향후 1년간은 버그 수정과 보안 패치만 제공하고, 그 이후로는 개발을 완전히 중단하겠다고 밝혔습니다. 현재 Deno Deploy를 쓰고 있다면 약 6개월 안에 마이그레이션을 마쳐야 하는 셈입니다.

결국 Anthropic이 Bun을 인수하고, 이보다 앞서 지난 6월 Cloudflare가 V8을 인수한 데 이어 이번에 Deno까지 품으면서, 주요 자바스크립트 런타임 중 클라우드 기업 소유가 아닌 곳은 Node 하나만 남게 됐습니다. 공교롭게도 Ryan Dahl이 지난 8년간 대체하려고 그토록 애썼던 바로 그 런타임입니다.

## 정리

- Node를 만든 Ryan Dahl은 2018년 "Node에 대한 10가지 후회"를 발표하며 그 대안으로 Deno를 만들었습니다. TypeScript 기본 지원, 기본 보안, 내장 도구체인이 강점이었습니다.
- 하지만 Node가 fetch, 권한 모델, TypeScript 직접 실행 지원을 추가하며 Deno의 차별점을 빠르게 흡수했고, Deno Deploy·Deno KV·Fresh 등 수익화 제품들은 성장이 정체됐습니다.
- Deno 팀은 결국 런타임 경쟁을 포기하고 Cloudflare의 Durable Objects를 셀프 호스팅 가능하게 만든 "Celld"를 올해 8월 출시했고, Cloudflare는 이를 통째로 인수했습니다.
- 앞으로 Ryan Dahl과 Bert Belder는 Celld를 Cloudflare의 오픈소스 Workers 런타임에 통합해 누구나 Workers와 Durable Objects를 자체 서버에서 공식 지원과 함께 운영할 수 있게 만들 예정이며, 핵심 타겟은 AI 에이전트 워크로드입니다.
- Celld를 제외한 기존 Deno 제품들은 1년간 보안 패치만 제공되며, Deno Deploy 사용자는 약 6개월 내 마이그레이션이 필요합니다. 결과적으로 Bun(Anthropic), V8·Deno(Cloudflare)까지 주요 런타임이 클라우드 기업에 귀속되면서, Node만이 유일하게 독립적인 위치에 남게 됐습니다.

Deno 생태계에 발을 걸치고 있던 팀이라면 지금이 바로 마이그레이션 계획을 세워야 할 시점입니다. Deno Deploy나 Deno KV 기반 서비스를 운영 중이라면, Node 생태계 또는 Cloudflare Workers로의 이전 경로를 미리 검토해두는 것이 안전합니다.

## 참고 자료

- [원문 링크](https://www.youtube.com/watch?v=l3L_lETiSzc)
- via Fireship

## 관련 노트

- [[2026-10-23|2026-10-23 Dev Digest]]
