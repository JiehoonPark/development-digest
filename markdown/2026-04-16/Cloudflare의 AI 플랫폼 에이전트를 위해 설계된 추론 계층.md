---
title: "Cloudflare의 AI 플랫폼: 에이전트를 위해 설계된 추론 계층"
tags: [dev-digest, hot]
type: study
tech:
  - frontend
level: ""
created: 2026-04-16
aliases: []
---

> [!info] 원문
> [Cloudflare's AI Platform: an inference layer designed for agents](https://blog.cloudflare.com/ai-platform/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Cloudflare는 AI 모델 공급자에 종속되지 않고 여러 공급자의 70개 이상 모델에 접근할 수 있는 통합 추론 계층을 출시했다. 단일 API와 코드 한 줄로 OpenAI, Anthropic, Google 등 12개 이상 공급자의 모델을 전환할 수 있으며, 한곳에서 AI 비용을 통합 관리할 수 있다. Workers AI 바인딩을 통해 Cloudflare 호스팅 모델과 서드파티 모델 간 전환이 가능하고, REST API 지원도 곧 출시된다. 또한 사용자 정의 메타데이터를 통해 팀, 사용자, 워크플로우 별로 비용을 세분화하여 추적할 수 있으며, Replicate의 Cog 기술을 활용하여 커스텀 미세조정 모델을 가져올 수 있다.

## 상세 내용

- 통합 API를 통한 다중 모델 접근: 70개 이상의 모델을 12개 이상의 공급자로부터 단일 AI.run() 바인딩으로 접근 가능하며, 모델 전환이 한 줄의 코드 변경으로 가능하다. 예를 들어 'anthropic/claude-opus-4-6'에서 '@cf/moonshotai/kimi-k2.5'로 전환하는 것이 간단하다.
- 비용 통합 관리: 현재 기업들이 평균 3.5개 모델을 여러 공급자에서 사용하고 있지만, AI Gateway를 통해 한곳에서 모든 AI 지출을 모니터링할 수 있다. 메타데이터를 통해 유료/무료 사용자별, 고객별, 워크플로우별 비용 세분화가 가능하다.
- 에이전트 최적화 설계: 에이전트는 단일 프롬프트당 10개의 추론 호출을 연쇄 실행할 수 있으므로, 공급자 지연이나 장애가 단순 응답 지연이 아닌 연쇄 실패로 이어진다. Cloudflare의 플랫폼은 상류 장애 시 자동 재시도, 지연 관리 등을 통해 이를 해결한다.
- 모달리티 확장: 기존 텍스트 모델뿐 아니라 이미지, 비디오, 음성 모델까지 포함하여 멀티모달 애플리케이션 구축을 지원한다. Alibaba Cloud, Google, Runway, Vidu 등의 모델도 추가되고 있다.
- 커스텀 모델 지원: Replicate의 Cog 기술을 활용하여 사용자가 자체 미세조정한 모델을 Workers AI에 가져올 수 있다. cog.yaml과 predict.py 파일만으로 CUDA 의존성, Python 버전, 가중치 로딩 등 복잡한 ML 모델 패키징 작업을 추상화한다.
- REST API 지원 예정: Workers를 사용하지 않는 개발자를 위해 향후 몇 주 내 REST API 지원을 출시하여 모든 환경에서 전체 모델 카탈로그에 접근할 수 있게 한다.
- 대시보드 및 개선사항: 최근 몇 개월간 대시보드 새로고침, 기본 게이트웨이 자동 설정, 상류 장애 시 자동 재시도, 더 세분화된 로깅 제어 등을 추가했다.

> [!tip] 왜 중요한가
> AI 모델 환경이 빠르게 변화하고 복잡한 에이전트 워크플로우가 여러 모델을 필요로 하는 시대에, 공급자 독립적인 통합 추론 계층은 개발자의 유연성, 비용 관리, 안정성을 동시에 확보할 수 있게 한다.

## 전문 번역

# Cloudflare의 AI 플랫폼: 에이전트를 위한 추론 계층

**2026년 4월 16일 | Ming Lu, Michelle Chen | 5분 읽기**

AI 모델의 발전 속도가 정말 빠르거든요. 지금 에이전트 코딩에 최고라고 평가받는 모델도 3개월 뒤에는 완전히 다른 제공사의 모델로 바뀔 수 있습니다. 거기에 실제 비즈니스 요구사항을 보면 보통 하나 이상의 모델을 동시에 호출해야 합니다.

예를 들어 고객 지원 에이전트는 이렇게 동작합니다:
- 빠르고 저렴한 모델로 사용자 메시지 분류
- 큰 규모의 추론 모델로 행동 계획 수립
- 경량 모델로 개별 작업 실행

이런 상황에서는 특정 제공사에 얽매이지 않으면서도 모든 모델에 접근할 수 있어야 합니다. 여러 제공사 간 비용을 모니터링하고, 한 제공사가 장애를 겪을 때 신뢰성을 보장하고, 사용자가 어디에 있든 지연 시간을 관리해야 하기 때문입니다.

이런 도전과제는 AI를 활용한 모든 프로젝트에서 나타나지만, 에이전트 구축 시에는 더욱 심각해집니다. 간단한 챗봇이라면 사용자 질문당 한 번의 추론만 진행하면 되는데, 에이전트는 하나의 작업을 완료하기 위해 10개의 호출을 연쇄적으로 수행합니다. 그러면 한 제공사의 느린 응답이 50ms가 아닌 500ms의 지연을 초래합니다. 단순한 요청 실패도 순식간에 연쇄 장애로 이어지죠.

Cloudflare는 AI Gateway와 Workers AI를 출시한 이후 AI 기반 애플리케이션을 구축하는 개발자들로부터 엄청난 반응을 얻었습니다. 그에 발맞춰 우리도 빠르게 기능을 추가했어요. 지난 몇 개월만 해도 대시보드를 새롭게 디자인하고, 설정 없이 바로 쓸 수 있는 기본 게이트웨이를 추가했으며, 업스트림 장애 시 자동 재시도 기능과 더 세밀한 로깅 제어 기능을 구현했습니다.

오늘 우리는 Cloudflare를 통합 추론 계층으로 만들고자 합니다. 어떤 제공사의 어떤 AI 모델이든 하나의 API로 접근할 수 있으며, 속도와 신뢰성을 갖춘 시스템입니다.

## 하나의 카탈로그, 하나의 통합 엔드포인트

이제부터는 Workers AI와 동일한 `AI.run()` 바인딩으로 타사 모델을 호출할 수 있습니다. Workers를 사용 중이라면 Cloudflare 호스팅 모델에서 OpenAI, Anthropic 또는 다른 제공사의 모델로 바꾸는 것이 단 한 줄의 변경으로 가능합니다.

```javascript
const response = await env.AI.run('anthropic/claude-opus-4-6',{
  input: 'What is Cloudflare?',
}, {
  gateway: { id: "default" },
});
```

Workers를 사용하지 않는다면 걱정하지 마세요. 앞으로 몇 주 내에 REST API를 지원할 예정이니, 어떤 환경에서든 전체 모델 카탈로그에 접근할 수 있게 됩니다.

이제 여러분은 12개 이상의 제공사로부터 70개 이상의 모델에 접근할 수 있습니다. 모두 하나의 API, 모델 간 전환은 한 줄의 코드, 그리고 하나의 크레딧 시스템으로 통합되어 있습니다. 앞으로도 계속 확장할 예정입니다.

모델 카탈로그를 살펴보면 각자의 유스케이스에 맞는 최고의 모델을 찾을 수 있습니다. Cloudflare Workers AI에서 호스팅하는 오픈소스 모델부터 주요 제공사의 독점 모델까지 다양하죠. 우리는 알리바바 클라우드, AssemblyAI, Bytedance, Google, InWorld, MiniMax, OpenAI, Pixverse, Recraft, Runway, Vidu 등으로부터 모델을 추가하고 있습니다. 특히 이미지, 영상, 음성 모델까지 지원하게 되어 멀티모달 애플리케이션을 구축할 수 있게 될 거예요.

## 한곳에서 모든 비용 관리하기

모든 모델을 하나의 API로 접근한다는 것은 AI 지출을 한곳에서 관리할 수 있다는 뜻입니다. 실제로 대부분의 기업들은 평균 3.5개의 모델을 여러 제공사로부터 호출하고 있는데, 그래서 어느 제공사도 전체 AI 사용량에 대한 완벽한 통찰을 줄 수 없습니다. AI Gateway를 사용하면 AI 비용을 모니터링하고 관리하는 중앙화된 공간을 갖추게 됩니다.

요청에 커스텀 메타데이터를 포함하면 가장 관심 있는 속성별로 비용을 분석할 수 있습니다. 무료 사용자 vs 유료 사용자별, 개별 고객별, 또는 앱 내 특정 워크플로우별 비용 추적이 가능해지죠.

```javascript
const response = await env.AI.run('@cf/moonshotai/kimi-k2.5',
  {
    prompt: 'What is AI Gateway?'
  },
  {
    metadata: { "teamId": "AI", "userId": 12345 }
  }
);
```

## 자신의 모델 가져오기

AI Gateway는 여러 제공사의 모델을 하나의 API로 제공합니다. 하지만 때로는 자신의 데이터로 파인튜닝한 모델이거나 특정 유스케이스에 최적화된 커스텀 모델을 실행하고 싶을 수도 있습니다. 그래서 우리는 사용자가 자신의 모델을 Workers AI에 배포할 수 있도록 작업하고 있습니다.

실제로 우리 트래픽의 대부분은 Enterprise 고객이 커스텀 모델을 우리 플랫폼에서 실행하는 전용 인스턴스에서 나옵니다. 이 기능을 더 많은 고객에게 제공하고 싶었어요. 이를 위해 우리는 Replicate의 Cog 기술을 활용하여 머신러닝 모델을 컨테이너화하는 것을 돕고 있습니다.

Cog는 상당히 간단하게 설계되었습니다. `cog.yaml` 파일에 의존성을 명시하고, Python 파일에 추론 코드를 작성하면 됩니다. Cog는 CUDA 의존성, Python 버전, 가중치 로딩 같은 ML 모델 패킹에 관련된 모든 복잡한 부분을 추상화해줍니다.

**cog.yaml 파일 예제:**
```yaml
build:
  python_version: "3.13"
  python_requirements: requirements.txt
predict: "predict.py:Predictor"
```

**predict.py 파일 예제 (모델 설정 함수와 추론 요청 시 실행되는 함수 포함):**
```python
from cog import BasePredictor, Path, Input
import torch

class Predictor(BasePredictor):
    def setup(self):
        # 모델 초기화
        pass
    
    def predict(self, input: str) -> str:
        # 추론 로직
        pass
```

## 참고 자료

- [원문 링크](https://blog.cloudflare.com/ai-platform/)
- via Hacker News (Top)
- engagement: 222

## 관련 노트

- [[2026-04-16|2026-04-16 Dev Digest]]
