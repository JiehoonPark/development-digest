---
title: "GeoLibre 1.0"
tags: [dev-digest, tech, react, typescript]
type: study
tech:
  - react
  - typescript
level: ""
created: 2026-06-10
aliases: []
---

## 핵심 개념

> [!abstract]
> Tauri, React, TypeScript, MapLibre GL JS, DuckDB-WASM 등으로 구축한 클라우드 네이티브 GIS 플랫폼으로, 데스크톱과 웹에서 지리공간 데이터 시각화, 탐색, 분석을 지원합니다.

## 상세 내용

- MapLibre 기반 맵 워크스페이스, 로컬/원격 벡터 및 래스터 데이터 로딩, 플러그인 마켓플레이스를 제공합니다.
- DuckDB Spatial SQL, 벡터/래스터 처리 도구, Python/Jupyter 통합으로 브라우저 기반 지리공간 분석을 가능하게 합니다.
- 데스크톱 버전(Tauri)과 웹 버전 모두 GitHub Pages에서 호스팅되며 개인정보 보호를 기본으로 합니다.

> [!tip] 왜 중요한가
> 웹/데스크톱 GIS 애플리케이션 개발 시 오픈소스 기반의 모던 아키텍처와 기능 구현 방법을 학습할 수 있습니다.

## 전문 번역

# 클라우드 네이티브 GIS 플랫폼, GeoLibre

공간 데이터를 시각화하고 탐색, 분석할 수 있는 경량 클라우드 네이티브 GIS 플랫폼을 소개합니다.

GeoLibre는 Tauri, React, TypeScript, MapLibre GL JS, DuckDB-WASM Spatial, deck.gl로 구축되었습니다. 데스크톱과 웹 환경을 모두 지원하며, 모바일 화면에 반응형으로 대응합니다. 빠른 로컬 처리와 클라우드 네이티브 데이터 작업, 프로젝트 파일 관리, 스타일링, 플러그인, 그리고 최신 지리공간 워크플로우를 제공하죠.

## GeoLibre의 주요 기능

### MapLibre 맵 워크스페이스

OpenFreeMap 베이스맵이나 빈 배경에서 MapLibre 맵을 팬, 줌, 회전, 기울이기할 수 있습니다. 탐색, 글로브, 지형, 지오로케이션, 축척, 저작권 표시 같은 기본 컨트롤을 토글할 수 있고, 지도 위의 거리 측정, 북마크, 미니맵, 뷰 상태 같은 도구도 제공합니다.

### 로컬 및 원격 데이터

로컬과 원격의 벡터, 래스터 데이터를 로드하고 테이블에서 속성을 검사할 수 있습니다. 데이터 기반 기호화로 레이어를 스타일링하고, 레이어를 재정렬하거나 새로고침하며, .geolibre.json 프로젝트를 저장, 재개, 공유할 수 있죠.

### 플러그인 및 마켓플레이스

레이어 컨트롤, 베이스맵, MapLibre 컴포넌트, 스와이프, 스트릿 뷰, 타임 슬라이더, Overture Maps, LiDAR, GeoAgent, GeoEditor 같은 내장 플러그인을 활성화할 수 있습니다. 마켓플레이스에서 외부 플러그인을 설치, 업데이트, 제거하는 것도 가능합니다.

### 다양한 레이어 포맷 지원

XYZ, WMS, WFS, WMTS, ArcGIS, STAC 서비스는 물론이고, GeoParquet, FlatGeobuf, PMTiles, Zarr 같은 클라우드 포맷을 지원합니다. COG와 GeoTIFF 래스터, MBTiles, LiDAR, Gaussian splats, 3D Tiles, DuckDB, PostgreSQL 데이터베이스도 추가할 수 있습니다.

### 데이터 변환과 Whitebox 도구

변환 메뉴에서 데이터를 클라우드 네이티브 GeoParquet, FlatGeobuf, PMTiles, COG로 변환할 수 있습니다. 선택적인 Python 사이드카를 통해 Whitebox 도구상자로 배치 지오프로세싱을 실행할 수도 있죠.

### SQL 워크스페이스

브라우저에서 DuckDB Spatial SQL을 로드된 레이어, 로컬 파일, 원격 URL에 대해 실행합니다. 맨 URL은 자동으로 적절한 리더로 래핑되고, HTTP 범위 요청으로 원격 파일을 스트리밍합니다. 샘플 쿼리, 쿼리 히스토리를 제공하며, 결과를 맵에 추가하거나 CSV 또는 GeoParquet으로 내보낼 수 있습니다.

### 벡터 도구

Processing → Vector에서 버퍼, 중심점, 볼록껍질, 병합, 경계상자, 단순화, 클립, 교집합, 차집합, 합집합 같은 기하학 도구를 사용할 수 있습니다. 브라우저에서 Turf.js로 실행되며, 선택적으로 모든 도구에 대해 GeoPandas 사이드카 엔진을 사용할 수 있습니다.

### 래스터 도구

Processing → Raster에서 hillshade, slope, aspect, 재투영, 리샘플링, 범위 클립, 마스크 레이어 클립, 폴리곤화, 등고선 같은 래스터 도구를 제공합니다. 입력 파일 경로와 출력 파일 경로로 rasterio Python 사이드카에서 실행됩니다. GeoTIFF나 COG를 맵에 드래그하면 래스터 레이어로 추가되죠.

### Python과 Jupyter 통합

geolibre Python 패키지로 전체 GeoLibre 앱을 Jupyter 노트북에 임베드할 수 있습니다. leafmap 스타일의 API(add_geojson, add_tile_layer, add_cog)가 맵을 제어하며, 프로젝트가 양방향으로 동기화되어 UI에서의 수정 사항을 Python에서도 읽을 수 있습니다.

## GeoLibre 시작하기

처음 사용하신다면 사용자 가이드부터 시작하세요. 워크스페이스, 메뉴, 패널, 도구를 차근차근 둘러볼 수 있습니다. 그 다음 튜토리얼을 따라 실제 워크플로우를 직접 해볼 수 있죠.

- **인터페이스 개요**: 툴바, 패널, 맵, 상태 표시줄
- **데이터 추가**: 파일, 웹 서비스, 클라우드, 3D, 데이터베이스 소스 모두 지원
- **처리 도구와 SQL 워크스페이스**: 벡터, 래스터, 변환, Whitebox, DuckDB Spatial SQL을 이용한 분석
- **플러그인 & 마켓플레이스**: 내장 플러그인 활성화 및 레지스트리에서 설치
- **첫 번째 맵 만들기**: 레이어 추가, 스타일링, 검사, 공유하기

## 브라우저에서 바로 써보기

라이브 데모는 GeoLibre 데스크톱 UI를 브라우저 버전으로 제공합니다. 맵을 탐색하고, 브라우저에서 DuckDB-WASM Spatial이 지원하는 벡터 데이터를 로드하며, URL 기반 레이어를 추가하고, 레이어를 스타일링하고, 플러그인을 테스트하기에 좋습니다.

다만 파일 다이얼로그, 로컬 MBTiles, 로컬 래스터 읽기, 파일시스템 저장/열기 작업은 설치된 Tauri 앱이 필요합니다.

### 프라이빗 설계, GitHub Pages에서 호스팅

라이브 데모는 GitHub Pages에 배포된 정적 사이트이며, 브라우저에서만 실행됩니다. 분석 추적이 없고 서버 계정도 없습니다. 로드한 데이터는 브라우저 세션에서 클라이언트 측으로 처리되죠. 원격 URL을 추가하거나 프로젝트를 명시적으로 공유할 때만 데이터가 브라우저를 벗어납니다.

공개된 .geolibre.json URL을 url 쿼리 파라미터로 전달해 프로젝트를 열 수 있습니다:

```
https://viewer.geolibre.app/?url=https://share.geolibre.app/giswqs/3d-tiles.geolibre.json
```

좁은 임베드의 경우, 데모 URL에 `?layout=compact`를 추가해 아이콘만 표시하고 프로젝트 메타데이터를 숨길 수 있습니다:

```
https://viewer.geolibre.app/?url=https://share.geolibre.app/giswqs/3d-tiles.geolibre.json&layout=compact
```

맵에 집중하려면 `&panels=none`을 추가해 레이어, 스타일, 속성 테이블 패널을 숨기세요:

```
https://viewer.geolibre.app/?url=https://share.geolibre.app/giswqs/3d-tiles.geolibre.json&layout=compact&panels=none
```

아이콘만 표시하려면 `toolbar=icons`를 사용하세요. `panels=hidden`, `panels=hide`, `panels=off` 옵션도 있습니다.

## 참고 자료

- [원문 링크](https://geolibre.app/)
- via Hacker News (Top)
- engagement: 124

## 관련 노트

- [[2026-06-10|2026-06-10 Dev Digest]]
