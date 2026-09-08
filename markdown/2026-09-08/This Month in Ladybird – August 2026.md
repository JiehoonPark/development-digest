---
title: "This Month in Ladybird – August 2026"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-09-08
aliases: []
---

## 핵심 개념

> [!abstract]
> cargo(1)

## 아티클

cargo(1)

 into the build, and CSS tokenization and DOM structures into Rust. This month the rest of CSS parsing moved to Rust (#11298), meaning the parser that turns tokens into the CSSOM (values, selectors, at-rules) now lives there, and the painting pipeline followed (#11301): the code that walks the paint tree, builds display lists, and rasterizes them.
None of this is user-visible on its own, but it’s the largest and riskiest slice of the migration so far, since both pieces sit on the hot path for every page.
Caging pointers
This month we caged pointer values, an early piece of a broader project to sandbox parts of LibWeb, most importantly, JS::Cell pointers: every JavaScript object, when handed to native code, now comes as a capability-bound reference instead of a raw address. Handling millions of untrusted pages means memory-safety bugs are a matter of when, not if, and caging is about shrinking what a single bug can reach: a compromised cell reference can’t be walked into an unrelated allocation, so a bug in, say, canvas pixel handling can’t be pivoted into a WebGL use-after-free (#11488). Full process-level sandboxing is still ahead, and this posture only holds as long as every native accessor goes through the capability boundary. We’re auditing the remaining direct-pointer call sites (of which there are still plenty) and expect to close most of them in September.
Support Ladybird
Ladybird is entirely supported through donations, grants, and sponsorships. We do not accept venture capital, we have no plans for user monetization of any kind, and we never will.
If you like what we’re doing and you’d like to support our mission, please consider making a donation. If you represent a company that’sent 	 our web engine, please consider sponsoring us with your business!
Support us on GitHub Sponsors
Until next time!
— Andreas Kling and the Ladybird team

## 참고 자료

- [원문 링크](https://ladybird.org/newsletter/2026-08-31/)
- via Hacker News (Top)
- engagement: 153

## 관련 노트

- [[2026-09-08|2026-09-08 Dev Digest]]
