---
title: "Jepsen: MariaDB Galera Cluster 12.1.2 일관성 분석"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-17
aliases: []
---

> [!info] 원문
> [Jepsen: MariaDB Galera Cluster 12.1.2](https://jepsen.io/analyses/mariadb-galera-cluster-12.1.2) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Jepsen 테스트 프레임워크로 MariaDB Galera Cluster의 실제 일관성 보장을 검증한 보고서입니다. MariaDB의 문서 주장과 실제 동작 사이의 불일치를 지적하며, 동기 복제 주장의 정확성 문제를 밝혔습니다.

## 상세 내용

- Galera 문서에서 '모든 노드에 동시 커밋'을 주장하지만 실제로는 쿼럼 기반 작동으로 불일치
- Repeatable Read 일관성 수준을 제시하지만 실제 동작의 정확한 일관성 모델 명시 부족

> [!tip] 왜 중요한가
> 분산 데이터베이스 선택 시 마케팅 주장이 아닌 실제 일관성 보장을 검증해야 하며, 금융 시스템 등 높은 신뢰성이 필요한 프로젝트에서는 특히 중요합니다.

## 전문 번역

# MariaDB Galera Cluster의 일관성 문제: 실제로는 무엇을 보장하는가?

## 배경

MariaDB는 MySQL의 포크로 시작된 인기 있는 오픈소스 SQL 데이터베이스입니다. MariaDB Galera Cluster는 모든 노드에서 읽기와 쓰기를 허용하는 능동-능동(active-active) 복제 시스템인데요.

2015년 당시 저는 MariaDB Galera Cluster를 분석하다가 흥미로운 점을 발견했습니다. Galera는 Snapshot Isolation을 지원한다고 주장했지만, Codership Oy는 의도적으로 핵심 기능인 'first-committer-wins' 속성을 빼먹었거든요. 그 결과 MariaDB Galera Cluster는 은행 송금 시뮬레이션 테스트에서 돈을 잃거나 갑자기 생성하는 일관성 문제를 보여주었습니다. 다행히 2025년 MariaDB는 Codership Oy를 인수했고, Galera Cluster를 정식으로 편입했습니다.

### Galera Cluster의 아키텍처

Galera Cluster는 gcomm이라는 가상 동기식 그룹 통신 프레임워크를 기반으로 합니다. 트랜잭션은 처음에 어느 노드에서든 낙관적으로 실행되고, 커밋할 때 다른 노드들에 동기식으로 복제됩니다. 각 노드는 트랜잭션이 변경한 주키(primary key)를 기반으로 트랜잭션을 검증합니다. 다른 트랜잭션과의 충돌은 시퀀스 번호(seqno)로 파악합니다.

### 문서와 실제 동작의 괴리

MariaDB 공식 문서를 보면 Galera에 대해 이렇게 설명합니다:

> "비동기식이나 준동기식 복제와 달리, Galera는 트랜잭션이 모든 노드에 커밋되거나(또는 모두 실패하거나) 클라이언트가 성공 확인을 받기 전에 보장합니다."

음, 이건 사실이 아닙니다. 만약 Galera가 정말로 모든 노드에서의 커밋을 요구한다면 단 하나의 노드 장애도 허용할 수 없을 테니까요. 

실제로는 문서 곳곳에서 다양한 표현으로 같은 주장을 반복합니다:

- "트랜잭션은 모든 노드에서 검증을 통과할 때까지 진정으로 커밋된 것으로 간주되지 않습니다"
- "트랜잭션이 커밋되면 클러스터의 모든 노드가 같은 값을 가집니다"
- "Node A가 다른 모든 노드로부터 'OK'를 받은 후에야 클라이언트에게 '트랜잭션이 커밋되었습니다'라고 말합니다"

하지만 현실은 다릅니다. Galera Cluster는 소수의 노드가 장애를 일으켜도 계속 작동합니다. 쿼럼(quorum)을 이루는 노드들이 온라인 상태로 연결되어 있으면 그 부분은 계속 진행할 수 있거든요.

과거에 Galera는 쿼럼을 잃었을 때 수동으로 복구해야 했습니다. 운영자가 모든 노드에 접속해서 가장 높은 시퀀스 번호를 가진 노드를 찾아 클러스터를 재부팅해야 했죠. 하지만 최신 버전에서는 자동 복구를 지원합니다.

## 일관성 보장 vs. 문서의 약속

공식 문서는 다음과 같이 자신 있게 말합니다:

> "데이터는 항상 모든 노드에서 일관성을 유지하며, 노드 장애 시 데이터 손실을 방지합니다."

또한 Galera는 "개별 MariaDB 서버들을 강력하고 가용성 높은 일관된 분산 데이터베이스 시스템으로 변환"한다고 주장합니다.

문서는 또한 동기식 복제 덕분에 변경사항이 "즉시 모든 노드에 복제되어 복제 지연이나 손실된 트랜잭션이 없다"고 강조합니다. 이런 약속들을 읽으면 MariaDB Galera Cluster가 단일 MariaDB 노드와 동일한 일관성 수준을 제공한다고 생각할 수 있습니다. 과연 그럴까요?

놀랍게도 이 질문에 대한 명확한 답을 문서에서 찾기는 어렵습니다. Galera 문서에 알려진 제한사항 섹션이 있지만, 거기서 다루는 것은 일부 명시적 락(explicit locking)이 미지원이고 InnoDB를 반드시 사용해야 한다는 것뿐입니다. 격리 수준(isolation levels)이나 일관성 이상(consistency anomalies)에 대한 언급은 없습니다.

Jepsen이 찾은 Galera 문서의 유일한 격리 수준 언급은 설치 및 배포 섹션의 "Galera 변환 팁" 페이지에 있는 "트랜잭션 크기" 제목 아래 묻혀 있습니다:

> "Galera의 tx_isolation은 Serializable과 Repeatable Read 사이입니다. tx_isolation 변수는 무시됩니다."

Repeatable Read는 매우 강한 일관성 모델입니다. 대부분의 형식화 이론에서는 객체가 술어(predicate)가 아닌 주키로 선택되는 한 Serializability와 동등합니다.

MariaDB에서는 예전에 Repeatable Read가 non-repeatable read를 허용했지만, 이제는 그것을 금지합니다. MDEV-35124에 따르면 MariaDB의 "Repeatable Read"는 실제로 Snapshot Isolation을 제공해야 합니다. 따라서 우리는 MariaDB Galera Cluster가 Serializable보다는 약하지만, Repeatable Read, Snapshot Isolation, 또는 둘 다보다는 강한 일관성 모델을 제공할 것이라고 예상할 수 있습니다.

## 테스트 설계

우리는 Jepsen의 기존 MySQL & MariaDB 테스트 스위트를 Debian Trixie에서 실행되는 3노드 MariaDB Galera Cluster 클러스터를 구성하도록 적응시켰습니다. MariaDB의 공식 Debian 저장소를 사용해 MariaDB 12.1.2부터 12.2.2까지, Galera 26.4.13부터 26.4.25까지 설치했습니다. MariaDB 공식 Java 클라이언트(버전 3.5.6)를 사용해 클러스터에 트랜잭션을 제출했습니다.

테스트 중에는 네트워크 파티션, 프로세스 일시 정지, 프로세스 강제 종료 등 다양한 장애를 주입했습니다.

이전 MySQL 분석과 마찬가지로, 주요 워크로드로는 Elle의 리스트를 사용했습니다.

## 참고 자료

- [원문 링크](https://jepsen.io/analyses/mariadb-galera-cluster-12.1.2)
- via Hacker News (Top)
- engagement: 63

## 관련 노트

- [[2026-03-17|2026-03-17 Dev Digest]]
